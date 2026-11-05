-- Skema dashboard NPS Incentric (PostgreSQL / Neon).
-- Aman dijalankan berulang kali.

CREATE TABLE IF NOT EXISTS nps_client (
  id           SERIAL PRIMARY KEY,
  slug         TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  short_name   TEXT,
  tally_form_id TEXT NOT NULL,
  nps_scale    TEXT NOT NULL DEFAULT '1-5',
  password_hash TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nps_stage (
  id         SERIAL PRIMARY KEY,
  client_id  INTEGER NOT NULL REFERENCES nps_client(id) ON DELETE CASCADE,
  key        TEXT NOT NULL,
  label      TEXT NOT NULL,
  position   INTEGER NOT NULL DEFAULT 0,
  UNIQUE (client_id, key)
);

-- Mapping stabil per pertanyaan Tally (questionId), bukan judul.
CREATE TABLE IF NOT EXISTS nps_question_map (
  id            SERIAL PRIMARY KEY,
  client_id     INTEGER NOT NULL REFERENCES nps_client(id) ON DELETE CASCADE,
  question_id   TEXT NOT NULL,
  question_title TEXT,
  label         TEXT NOT NULL,
  stage_key     TEXT,
  is_score      BOOLEAN NOT NULL DEFAULT TRUE,
  position      INTEGER NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (client_id, question_id)
);

CREATE TABLE IF NOT EXISTS nps_api_key (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  key_hash   TEXT NOT NULL UNIQUE,
  slug       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_nps_question_map_client ON nps_question_map (client_id);
CREATE INDEX IF NOT EXISTS idx_nps_stage_client ON nps_stage (client_id);
