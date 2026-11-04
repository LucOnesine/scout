export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  action TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_history_created_at ON history (created_at DESC);

CREATE TABLE IF NOT EXISTS codes (
  id INTEGER PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS code_symbols (
  code_id INTEGER NOT NULL,
  letter TEXT NOT NULL,
  symbol TEXT NOT NULL,
  position INTEGER NOT NULL,
  PRIMARY KEY (code_id, letter),
  FOREIGN KEY (code_id) REFERENCES codes (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS kojas (
  id INTEGER PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  image_key TEXT NOT NULL,
  cover_key TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS koja_tags (
  koja_id INTEGER NOT NULL,
  tag TEXT NOT NULL,
  position INTEGER NOT NULL,
  PRIMARY KEY (koja_id, tag),
  FOREIGN KEY (koja_id) REFERENCES kojas (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS koja_photos (
  koja_id INTEGER NOT NULL,
  image_key TEXT NOT NULL,
  position INTEGER NOT NULL,
  PRIMARY KEY (koja_id, position),
  FOREIGN KEY (koja_id) REFERENCES kojas (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS techniques (
  id INTEGER PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  icon_key TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  level TEXT NOT NULL,
  level_color TEXT NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS technique_steps (
  technique_id INTEGER NOT NULL,
  position INTEGER NOT NULL,
  content TEXT NOT NULL,
  image_key TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (technique_id, position),
  FOREIGN KEY (technique_id) REFERENCES techniques (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chants (
  id INTEGER PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  duration TEXT NOT NULL,
  genre TEXT NOT NULL,
  gradient_from TEXT NOT NULL,
  gradient_to TEXT NOT NULL,
  audio_key TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS chant_lines (
  chant_id INTEGER NOT NULL,
  position INTEGER NOT NULL,
  content TEXT NOT NULL,
  PRIMARY KEY (chant_id, position),
  FOREIGN KEY (chant_id) REFERENCES chants (id) ON DELETE CASCADE
);
`;
