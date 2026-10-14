/* Test del backend con database e rete simulati:  npm test */
import { test } from "node:test";
import assert from "node:assert/strict";
import { handleContact, handleSubmissions } from "../lib/core.js";

const TOKEN = "x".repeat(40);

function fakeDb() {
  const rows = [];
  const hits = [];
  return {
    rows, hits,
    async saveSubmission(e) { rows.push({ ...e, status: "nuova" }); },
    async listSubmissions({ status }) { return rows.filter(r => !status || r.status === status); },
    async updateStatus(id, status) { const r = rows.find(r => r.id === id); if (r) r.status = status; return !!r; },
    async deleteSubmission(id) { const i = rows.findIndex(r => r.id === id); if (i >= 0) rows.splice(i, 1); return i >= 0; },
    async hit(ip, kind) { hits.push({ ip, kind }); return hits.filter(h => h.ip === ip && h.kind === kind).length; },
    async count(ip, kind) { return hits.filter(h => h.ip === ip && h.kind === kind).length; }
  };
}

const valid = { name: "Mario Rossi", email: "Mario@Example.com", service: "sito", message: "Vorrei un sito nuovo per la mia azienda", consent: true, lang: "it", "cf-turnstile-response": "tok" };

const req = (body, { origin = "https://siteploy.com", ip = "1.2.3.4", type = "application/json", method = "POST" } = {}) =>
  new Request("https://siteploy.com/api/contact", {
    method,
    headers: { ...(origin && { origin }), "content-type": type, "x-real-ip": ip },
    body: typeof body === "string" ? body : JSON.stringify(body)
  });


test("richiesta valida viene salvata e notificata", async () => {
  const db = fakeDb(); const calls = [];
  const fetch = async (url, init) => { calls.push(String(url)); return new Response(JSON.stringify({ success: true }), { status: 200 }); };
  const env = { TURNSTILE_SECRET_KEY: "s", RESEND_API_KEY: "r", NOTIFY_EMAIL: "a@b.it", N8N_WEBHOOK_URL: "https://n8n.example/webhook" };
  const res = await handleContact(req(valid), { db, env, fetch });
  assert.equal(res.status, 201);
  assert.equal(db.rows.length, 1);
  assert.equal(db.rows[0].email, "mario@example.com");
  assert.equal(db.rows[0].privacyVersion, "2026-10");
  assert.ok(calls.some(u => u.includes("turnstile")) && calls.some(u => u.includes("resend")) && calls.some(u => u.includes("n8n")));
});

test("origin sconosciuta o mancante -> 403", async () => {
  const db = fakeDb();
  assert.equal((await handleContact(req(valid, { origin: "https://evil.com" }), { db, env: {} })).status, 403);
  assert.equal((await handleContact(req(valid, { origin: null }), { db, env: {} })).status, 403);
  assert.equal(db.rows.length, 0);
});

test("content-type sbagliato -> 415, body troppo grande -> 413, json rotto -> 400", async () => {
  const db = fakeDb();
  assert.equal((await handleContact(req(valid, { type: "text/plain" }), { db, env: {} })).status, 415);
  assert.equal((await handleContact(req({ ...valid, message: "a".repeat(30000) }), { db, env: {} })).status, 413);
  assert.equal((await handleContact(req("{rotto"), { db, env: {} })).status, 400);
});

test("captcha fallito -> 403 e niente salvataggio", async () => {
  const db = fakeDb();
  const fetch = async () => new Response(JSON.stringify({ success: false }));
  const res = await handleContact(req(valid), { db, env: { TURNSTILE_SECRET_KEY: "s" }, fetch });
  assert.equal(res.status, 403);
  assert.equal(db.rows.length, 0);
});

test("rate limit: il 6° invio in un'ora -> 429", async () => {
  const db = fakeDb();
  for (let i = 0; i < 5; i++) assert.equal((await handleContact(req(valid), { db, env: {} })).status, 201);
  const res = await handleContact(req(valid), { db, env: {} });
  assert.equal(res.status, 429);
  assert.ok(res.headers.get("retry-after"));
  // un altro IP non è bloccato
  assert.equal((await handleContact(req(valid, { ip: "5.6.7.8" }), { db, env: {} })).status, 201);
  // l'IP non è salvato in chiaro
  assert.ok(!db.hits.some(h => h.ip.includes("1.2.3.4")));
});

test("honeypot compilato -> finto ok, niente salvataggio", async () => {
  const db = fakeDb();
  const res = await handleContact(req({ ...valid, website: "spam.com" }), { db, env: {} });
  assert.equal(res.status, 201);
  assert.equal(db.rows.length, 0);
});

test("validazione e pulizia caratteri di controllo", async () => {
  const db = fakeDb();
  const bad = await handleContact(req({ ...valid, email: "no", consent: false }), { db, env: {} });
  assert.equal(bad.status, 422);
  assert.deepEqual((await bad.json()).fields, ["email", "consent"]);
  await handleContact(req({ ...valid, name: "Mario\r\nBcc: x@y.it" }, { ip: "9.9.9.9" }), { db, env: {} });
  assert.ok(!/[\r\n]/.test(db.rows[0].name));
});

const adminReq = (method, { token = TOKEN, query = "", body, ip = "1.1.1.1" } = {}) =>
  new Request("https://siteploy.com/api/submissions" + query, {
    method,
    headers: { authorization: `Bearer ${token}`, "x-real-ip": ip, "content-type": "application/json" },
    body: body && JSON.stringify(body)
  });

test("admin: token corto -> 500, token sbagliato -> 401, blocco dopo 10 tentativi", async () => {
  const db = fakeDb();
  assert.equal((await handleSubmissions(adminReq("GET"), { db, env: { ADMIN_TOKEN: "corto" } })).status, 500);
  for (let i = 0; i < 10; i++) {
    assert.equal((await handleSubmissions(adminReq("GET", { token: "sbagliato" }), { db, env: { ADMIN_TOKEN: TOKEN } })).status, 401);
  }
  // anche col token giusto ora è bloccato
  assert.equal((await handleSubmissions(adminReq("GET"), { db, env: { ADMIN_TOKEN: TOKEN } })).status, 429);
});

test("admin: elenco, cambio stato, cancellazione", async () => {
  const db = fakeDb(); const env = { ADMIN_TOKEN: TOKEN };
  await handleContact(req(valid), { db, env: {} });
  const id = db.rows[0].id;
  const list = await (await handleSubmissions(adminReq("GET"), { db, env })).json();
  assert.equal(list.count, 1);
  assert.equal((await handleSubmissions(adminReq("PATCH", { body: { id, status: "risposta" } }), { db, env })).status, 200);
  assert.equal(db.rows[0].status, "risposta");
  assert.equal((await handleSubmissions(adminReq("PATCH", { body: { id, status: "boh" } }), { db, env })).status, 400);
  assert.equal((await handleSubmissions(adminReq("DELETE", { query: "?id=" + id }), { db, env })).status, 200);
  assert.equal(db.rows.length, 0);
  assert.equal((await handleSubmissions(adminReq("DELETE", { query: "?id=nonvalido" }), { db, env })).status, 400);
});
