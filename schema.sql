-- Tabella delle richieste dal modulo contatti.
-- Su Cloudflare D1:  npx wrangler d1 execute siteploy-db --remote --file=schema.sql
-- Va bene anche per PostgreSQL (cambiando consent in BOOLEAN).
CREATE TABLE IF NOT EXISTS richieste (
  id          TEXT PRIMARY KEY,
  created_at  TEXT NOT NULL,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  company     TEXT,
  service     TEXT NOT NULL,
  message     TEXT NOT NULL,
  lang        TEXT,
  consent     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_richieste_created ON richieste (created_at);
