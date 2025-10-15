-- Schema SQLCipher iniziale
CREATE TABLE IF NOT EXISTS alarms(
  id TEXT PRIMARY KEY,
  time TEXT NOT NULL,
  recurrence TEXT,
  enabled INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS challenges(
  id TEXT PRIMARY KEY,
  alarm_id TEXT NOT NULL,
  type TEXT NOT NULL,
  params_json TEXT,
  enabled INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS photo_templates(
  id TEXT PRIMARY KEY,
  alarm_id TEXT NOT NULL,
  vector BLOB NOT NULL,
  ts INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS metrics(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT,
  alarm_id TEXT,
  attempts INTEGER,
  success_latency_ms INTEGER,
  false_rejects INTEGER
);
