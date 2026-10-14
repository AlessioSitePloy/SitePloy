/* ============ Nucleo del backend ============
   Tutta la logica delle API: validazione, anti-spam, rate limit,
   captcha (Cloudflare Turnstile), autorizzazione admin e notifiche.
   Non dipende dal database: riceve `deps` = { db, env, fetch }.
   Il db deve esporre: saveSubmission, listSubmissions, updateStatus,
   deleteSubmission, hit, count  (vedi lib/db.js).
*/
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const SERVICES = ["automazione", "sito", "webapp", "altro"];
export const STATUSES = ["nuova", "risposta", "chiusa", "spam"];
/** Cambia questo valore quando aggiorni la privacy policy: viene salvato con ogni consenso. */
export const PRIVACY_VERSION = "2026-10";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_BODY_BYTES = 20_000;
const LIMITS = {
  contact: { max: 5, minutes: 60 },     // max 5 invii del modulo all'ora per IP
  admin_fail: { max: 10, minutes: 60 }  // max 10 token sbagliati all'ora per IP
};

const BASE_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff"
};

export const json = (body, status = 200, extra = {}) =>
  new Response(JSON.stringify(body), { status, headers: { ...BASE_HEADERS, ...extra } });

/* ---------- utilità ---------- */

// Testo su una riga: niente caratteri di controllo né a capo (evita injection negli oggetti email).
const cleanLine = (v, max) =>
  String(v ?? "").replace(/[\u0000-\u001F\u007F]+/g, " ").trim().slice(0, max);

// Testo multilinea: tiene \n e \t, toglie gli altri caratteri di controllo.
const cleanText = (v, max) =>
  String(v ?? "").replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "").trim().slice(0, max);

function clientIp(request) {
  // Su Vercel questi header li imposta la piattaforma (il client non può falsificarli).
  return (
    request.headers.get("x-real-ip") ||
    (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    "unknown"
  );
}

// L'IP non viene mai salvato in chiaro: solo un hash con chiave segreta (GDPR).
function ipHash(ip, env) {
  return createHmac("sha256", env.IP_HASH_SECRET || "siteploy-cambia-questa-chiave")
    .update(ip)
    .digest("hex")
    .slice(0, 32);
}

// Confronto a tempo costante (non rivela quanti caratteri del token sono giusti).
function safeEqual(a, b) {
  const ha = createHash("sha256").update(String(a)).digest();
  const hb = createHash("sha256").update(String(b)).digest();
  return timingSafeEqual(ha, hb);
}

function allowedOrigins(env) {
  const list = (env.ALLOWED_ORIGINS || "https://siteploy.com,https://www.siteploy.com")
    .split(",").map(s => s.trim()).filter(Boolean);
  if (env.VERCEL_URL) list.push(`https://${env.VERCEL_URL}`); // anteprime Vercel
  return list;
}

function originAllowed(request, env) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  if (env.VERCEL_ENV === "development" && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  return allowedOrigins(env).includes(origin);
}

async function readJson(request) {
  const type = request.headers.get("content-type") || "";
  if (!type.toLowerCase().includes("application/json")) return { error: json({ error: "unsupported_media_type" }, 415) };
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > MAX_BODY_BYTES) return { error: json({ error: "payload_too_large" }, 413) };
  const text = await request.text();
  if (Buffer.byteLength(text) > MAX_BODY_BYTES) return { error: json({ error: "payload_too_large" }, 413) };
  try {
    const data = JSON.parse(text);
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("not an object");
    return { data };
  } catch {
    return { error: json({ error: "invalid_json" }, 400) };
  }
}

const withTimeout = (ms) => AbortSignal.timeout(ms);

async function verifyTurnstile(token, ip, deps) {
  const secret = deps.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn("TURNSTILE_SECRET_KEY non configurato: captcha disattivato");
    return true;
  }
  if (!token || typeof token !== "string" || token.length > 2048) return false;
  try {
    const res = await deps.fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
      signal: withTimeout(5000)
    });
    const out = await res.json();
    return out.success === true;
  } catch (err) {
    console.error("Verifica Turnstile fallita:", err);
    return false;
  }
}

/* ---------- notifiche (non bloccano mai la risposta all'utente) ---------- */

async function notify(entry, deps) {
  const { env } = deps;
  const jobs = [];

  if (env.RESEND_API_KEY && env.NOTIFY_EMAIL) {
    const text = [
      `Nuova richiesta dal sito (${entry.lang.toUpperCase()})`,
      "",
      `Nome:     ${entry.name}`,
      `Email:    ${entry.email}`,
      `Azienda:  ${entry.company || "-"}`,
      `Servizio: ${entry.service}`,
      `Data:     ${entry.createdAt}`,
      `ID:       ${entry.id}`,
      "",
      entry.message
    ].join("\n");
    jobs.push(
      deps.fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: env.NOTIFY_FROM || "SitePloy <onboarding@resend.dev>",
          to: [env.NOTIFY_EMAIL],
          reply_to: entry.email,
          subject: `Nuova richiesta: ${entry.service} — ${entry.name}`,
          text
        }),
        signal: withTimeout(5000)
      }).then(r => { if (!r.ok) throw new Error(`Resend HTTP ${r.status}`); })
    );
  }

  if (env.N8N_WEBHOOK_URL) {
    const headers = { "Content-Type": "application/json" };
    if (env.N8N_WEBHOOK_SECRET) headers["X-Webhook-Secret"] = env.N8N_WEBHOOK_SECRET;
    jobs.push(
      deps.fetch(env.N8N_WEBHOOK_URL, {
        method: "POST", headers, body: JSON.stringify(entry), signal: withTimeout(5000)
      }).then(r => { if (!r.ok) throw new Error(`n8n HTTP ${r.status}`); })
    );
  }

  const results = await Promise.allSettled(jobs);
  results.forEach(r => r.status === "rejected" && console.error("Notifica fallita:", r.reason));
}

/* ---------- POST /api/contact ---------- */

export async function handleContact(request, deps) {
  deps = { fetch: globalThis.fetch, ...deps };
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405, { Allow: "POST" });
  if (!originAllowed(request, deps.env)) return json({ error: "forbidden_origin" }, 403);

  const { data, error } = await readJson(request);
  if (error) return error;

  const ip = clientIp(request);
  const ipKey = ipHash(ip, deps.env);

  try {
    const n = await deps.db.hit(ipKey, "contact", LIMITS.contact.minutes);
    if (n > LIMITS.contact.max) {
      return json({ error: "rate_limited" }, 429, { "Retry-After": String(LIMITS.contact.minutes * 60) });
    }
  } catch (err) {
    console.error("Errore rate limit:", err);
    return json({ error: "storage" }, 500);
  }

  // Anti-spam: il campo nascosto "website" lo compilano solo i bot. Fingiamo che sia andato bene.
  if (data.website) return json({ ok: true }, 201);

  if (!(await verifyTurnstile(data["cf-turnstile-response"], ip, deps))) {
    return json({ error: "captcha" }, 403);
  }

  const now = new Date().toISOString();
  const entry = {
    id: crypto.randomUUID(),
    createdAt: now,
    name: cleanLine(data.name, 100),
    email: cleanLine(data.email, 200).toLowerCase(),
    company: cleanLine(data.company, 150),
    service: cleanLine(data.service, 20),
    message: cleanText(data.message, 5000),
    lang: data.lang === "en" ? "en" : "it",
    consent: data.consent === true,
    consentAt: now,
    privacyVersion: PRIVACY_VERSION
  };

  const errors = [];
  if (entry.name.length < 2) errors.push("name");
  if (!EMAIL_RE.test(entry.email)) errors.push("email");
  if (!SERVICES.includes(entry.service)) errors.push("service");
  if (entry.message.length < 10) errors.push("message");
  if (!entry.consent) errors.push("consent");
  if (errors.length) return json({ error: "validation", fields: errors }, 422);

  try {
    await deps.db.saveSubmission(entry);
  } catch (err) {
    console.error("Errore salvataggio:", err);
    return json({ error: "storage" }, 500);
  }

  await notify(entry, deps);
  return json({ ok: true }, 201);
}

/* ---------- /api/submissions (solo admin) ----------
   GET    /api/submissions?status=nuova&limit=100   elenco richieste
   PATCH  /api/submissions   body {"id": "...", "status": "risposta"}
   DELETE /api/submissions?id=...                   cancella (diritto all'oblio GDPR)
   Header: Authorization: Bearer <ADMIN_TOKEN>
*/
export async function handleSubmissions(request, deps) {
  const { db, env } = deps;
  const token = env.ADMIN_TOKEN || "";
  if (token.length < 32) {
    console.error("ADMIN_TOKEN mancante o troppo corto (minimo 32 caratteri)");
    return json({ error: "server_misconfigured" }, 500);
  }

  const ipKey = ipHash(clientIp(request), env);
  try {
    if ((await db.count(ipKey, "admin_fail", LIMITS.admin_fail.minutes)) >= LIMITS.admin_fail.max) {
      return json({ error: "rate_limited" }, 429, { "Retry-After": String(LIMITS.admin_fail.minutes * 60) });
    }
    const auth = request.headers.get("authorization") || "";
    if (!auth.startsWith("Bearer ") || !safeEqual(auth.slice(7), token)) {
      await db.hit(ipKey, "admin_fail", LIMITS.admin_fail.minutes);
      return json({ error: "unauthorized" }, 401, { "WWW-Authenticate": "Bearer" });
    }

    const url = new URL(request.url);

    if (request.method === "GET") {
      const status = url.searchParams.get("status");
      if (status && !STATUSES.includes(status)) return json({ error: "invalid_status" }, 400);
      const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "100", 10) || 100, 1), 500);
      const items = await db.listSubmissions({ status, limit });
      return json({ count: items.length, items });
    }

    if (request.method === "PATCH") {
      const { data, error } = await readJson(request);
      if (error) return error;
      if (!UUID_RE.test(String(data.id))) return json({ error: "invalid_id" }, 400);
      if (!STATUSES.includes(data.status)) return json({ error: "invalid_status", allowed: STATUSES }, 400);
      return (await db.updateStatus(data.id, data.status))
        ? json({ ok: true })
        : json({ error: "not_found" }, 404);
    }

    if (request.method === "DELETE") {
      const id = url.searchParams.get("id");
      if (!UUID_RE.test(String(id))) return json({ error: "invalid_id" }, 400);
      return (await db.deleteSubmission(id)) ? json({ ok: true }) : json({ error: "not_found" }, 404);
    }

    return json({ error: "method_not_allowed" }, 405, { Allow: "GET, PATCH, DELETE" });
  } catch (err) {
    console.error("Errore /api/submissions:", err);
    return json({ error: "storage" }, 500);
  }
}
