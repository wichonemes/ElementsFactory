BEGIN;
CREATE SCHEMA IF NOT EXISTS artisan_private;
REVOKE ALL ON SCHEMA artisan_private FROM PUBLIC;
CREATE TABLE IF NOT EXISTS artisan_private.revision (
  id integer PRIMARY KEY CHECK (id = 1),
  revision bigint NOT NULL DEFAULT 0
);
INSERT INTO artisan_private.revision (id) VALUES (1) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS artisan_private.state (
  key text PRIMARY KEY,
  value jsonb NOT NULL
);
CREATE TABLE IF NOT EXISTS artisan_private.backups (
  filename text PRIMARY KEY,
  label text NOT NULL,
  data jsonb NOT NULL,
  size_bytes integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON ALL TABLES IN SCHEMA artisan_private FROM PUBLIC;
ALTER TABLE artisan_private.revision ENABLE ROW LEVEL SECURITY;
ALTER TABLE artisan_private.state ENABLE ROW LEVEL SECURITY;
ALTER TABLE artisan_private.backups ENABLE ROW LEVEL SECURITY;
COMMIT;
