/* ============ Database: PostgreSQL su Neon ============
   La connessione arriva dalla variabile d'ambiente DATABASE_URL
   (la imposta da sola l'integrazione Neon di Vercel).
   Le tabelle si creano con:  npm run db:setup   (vedi schema.sql)
*/
import { neon } from "@neondatabase/serverless";

let client;
function sql() {
  if (!client) {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL non configurato");
    client = neon(process.env.DATABASE_URL);
  }
  return client;
}

export const db = {
  async saveSubmission(e) {
    await sql()`
      INSERT INTO richieste
        (id, created_at, name, email, company, service, message, lang, consent, consent_at, privacy_version)
      VALUES
        (${e.id}, ${e.createdAt}, ${e.name}, ${e.email}, ${e.company || null}, ${e.service},
         ${e.message}, ${e.lang}, ${e.consent}, ${e.consentAt}, ${e.privacyVersion})`;
  },

  async listSubmissions({ status = null, limit = 100 } = {}) {
    return sql()`
      SELECT id, created_at AS "createdAt", updated_at AS "updatedAt", status, name, email, company,
             service, message, lang, consent, consent_at AS "consentAt", privacy_version AS "privacyVersion"
      FROM richieste
      WHERE (${status}::text IS NULL OR status = ${status})
      ORDER BY created_at DESC
      LIMIT ${limit}`;
  },

  async updateStatus(id, status) {
    const rows = await sql()`
      UPDATE richieste SET status = ${status}, updated_at = now() WHERE id = ${id} RETURNING id`;
    return rows.length > 0;
  },

  async deleteSubmission(id) {
    const rows = await sql()`DELETE FROM richieste WHERE id = ${id} RETURNING id`;
    return rows.length > 0;
  },

  /** Registra un tentativo e restituisce quanti ce ne sono nella finestra (compreso questo). */
  async hit(ipHash, kind, minutes) {
    const [row] = await sql()`
      WITH ins AS (INSERT INTO tentativi (ip_hash, kind) VALUES (${ipHash}, ${kind}) RETURNING 1)
      SELECT count(*)::int + 1 AS n FROM tentativi
      WHERE ip_hash = ${ipHash} AND kind = ${kind}
        AND created_at > now() - make_interval(mins => ${minutes}::int)`;
    // Pulizia occasionale dei tentativi vecchi (la tabella resta piccola).
    if (Math.random() < 0.1) {
      await sql()`DELETE FROM tentativi WHERE created_at < now() - interval '1 day'`;
    }
    return row.n;
  },

  async count(ipHash, kind, minutes) {
    const [row] = await sql()`
      SELECT count(*)::int AS n FROM tentativi
      WHERE ip_hash = ${ipHash} AND kind = ${kind}
        AND created_at > now() - make_interval(mins => ${minutes}::int)`;
    return row.n;
  }
};
