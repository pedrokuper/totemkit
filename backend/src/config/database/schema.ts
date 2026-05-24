import { getDb } from "./database.js";

export function runMigrations(): void {
  const db = getDb();
  console.log("Running database migrations...");

  db.exec(`
    CREATE TABLE IF NOT EXISTS forms (
      id         TEXT    PRIMARY KEY,
      message    TEXT    NOT NULL,
      file_path  TEXT,
      created_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
  `);
}
