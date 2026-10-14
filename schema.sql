-- Database PostgreSQL (Neon). Si applica con:  npm run db:setup
-- Lo script è idempotente: puoi rilanciarlo senza perdere dati.

-- Richieste dal modulo contatti
CREATE TABLE IF NOT EXISTS richieste (
  id               UUID PRIMARY KEY,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ,
  status           TEXT NOT NULL DEFAULT 'nuova'
                   CHECK (status IN ('nuova', 'risposta', 'chiusa', 'spam')),
  name             TEXT NOT NULL CHECK (char_length(name) <= 100),
  email            TEXT NOT NULL CHECK (char_length(email) <= 200),
  company          TEXT CHECK (char_length(company) <= 150),
  service          TEXT NOT NULL CHECK (service IN ('automazione', 'sito', 'webapp', 'altro')),
  message          TEXT NOT NULL CHECK (char_length(message) <= 5000),
  lang             TEXT NOT NULL DEFAULT 'it' CHECK (lang IN ('it', 'en')),
  consent          BOOLEAN NOT NULL CHECK (consent),
  consent_at       TIMESTAMPTZ NOT NULL,      -- prova del consenso (GDPR)
  privacy_version  TEXT NOT NULL              -- versione della privacy policy accettata
);
CREATE INDEX IF NOT EXISTS idx_richieste_created ON richieste (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_richieste_status  ON richieste (status);

-- Tentativi per il rate limit (IP salvato solo come hash, righe cancellate dopo 1 giorno)
CREATE TABLE IF NOT EXISTS tentativi (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ip_hash     TEXT NOT NULL,
  kind        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tentativi_lookup ON tentativi (ip_hash, kind, created_at);
