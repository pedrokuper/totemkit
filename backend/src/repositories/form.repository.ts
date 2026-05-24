import { randomUUID } from "node:crypto";
import { getDb } from "../config/database/database.js";
import type { Form } from "../services/form.service.js";

export function insertForm(message: string, filePath: string | null): Form {
  const db = getDb();
  return db
    .prepare("INSERT INTO forms (id, message, file_path) VALUES (?, ?, ?) RETURNING *")
    .get(randomUUID(), message, filePath) as unknown as Form;
}

export function findFormById(id: string): Form | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM forms WHERE id = ?").get(id) as unknown as Form | undefined;
}

export function findAllForms(): Form[] {
  const db = getDb();
  return db.prepare("SELECT * FROM forms ORDER BY id DESC").all() as unknown as Form[];
}
