import { insertForm, findFormById, findAllForms } from "../repositories/form.repository.js";

export interface Form {
  id: string;
  message: string;
  file_path: string | null;
  created_at: string;
}

export interface CreateFormInput {
  message: string;
  file_path?: string;
}

function sanitizeMessage(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.length === 0) throw new Error("message cannot be empty");
  if (trimmed.length > 2000) throw new Error("message exceeds 2000 characters");
  return trimmed;
}

export function createForm(input: CreateFormInput): Form {
  const message = sanitizeMessage(input.message);
  return insertForm(message, input.file_path ?? null);
}

export function getFormById(id: string): Form | undefined {
  return findFormById(id);
}

export function getAllForms(): Form[] {
  return findAllForms();
}
