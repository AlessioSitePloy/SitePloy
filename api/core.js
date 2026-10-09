/* ============ Nucleo del backend (uguale per ogni piattaforma) ============
   Qui c'è tutta la logica: validazione, anti-spam, autorizzazione.
   Non sa nulla di Netlify o Cloudflare: riceve una Request standard
   e un oggetto `storage` con due funzioni:
     - saveSubmission(entry)
     - listSubmissions()
   Gli adattatori in netlify/ e functions/ forniscono lo storage giusto.
*/

const SERVICES = ["automazione", "sito", "webapp", "altro"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const json = (body, status = 200) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });

const clean = (value, max) => String(value ?? "").trim().slice(0, max);

/** POST /api/contact */
export async function handleContact(request, storage) {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  // Anti-spam: il campo nascosto "website" lo compilano solo i bot.
  if (data.website) return json({ ok: true });

  const entry = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    name: clean(data.name, 100),
    email: clean(data.email, 200).toLowerCase(),
    company: clean(data.company, 150),
    service: clean(data.service, 20),
    message: clean(data.message, 5000),
    lang: data.lang === "en" ? "en" : "it",
    consent: data.consent === true
  };

  const errors = [];
  if (entry.name.length < 2) errors.push("name");
  if (!EMAIL_RE.test(entry.email)) errors.push("email");
  if (!SERVICES.includes(entry.service)) errors.push("service");
  if (entry.message.length < 10) errors.push("message");
  if (!entry.consent) errors.push("consent");
  if (errors.length) return json({ error: "validation", fields: errors }, 422);

  try {
    await storage.saveSubmission(entry);
  } catch (err) {
    console.error("Errore salvataggio:", err);
    return json({ error: "storage" }, 500);
  }
  return json({ ok: true }, 201);
}

/** GET /api/submissions  (header: Authorization: Bearer <ADMIN_TOKEN>) */
export async function handleSubmissions(request, storage, adminToken) {
  if (request.method !== "GET") return json({ error: "method_not_allowed" }, 405);
  if (!adminToken) return json({ error: "ADMIN_TOKEN non configurato" }, 500);
  if ((request.headers.get("authorization") || "") !== `Bearer ${adminToken}`) {
    return json({ error: "unauthorized" }, 401);
  }
  const items = await storage.listSubmissions();
  return json({ count: items.length, items });
}
