/* Storage per Cloudflare: database D1 (SQLite gestito da Cloudflare).
   La tabella si crea con schema.sql (vedi README). */
export function d1Storage(db) {
  return {
    async saveSubmission(e) {
      await db
        .prepare(
          `INSERT INTO richieste (id, created_at, name, email, company, service, message, lang, consent)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(e.id, e.createdAt, e.name, e.email, e.company, e.service, e.message, e.lang, e.consent ? 1 : 0)
        .run();
    },
    async listSubmissions() {
      const { results } = await db
        .prepare(
          `SELECT id, created_at AS createdAt, name, email, company, service, message, lang, consent
           FROM richieste ORDER BY created_at DESC`
        )
        .all();
      return results.map(r => ({ ...r, consent: r.consent === 1 }));
    }
  };
}
