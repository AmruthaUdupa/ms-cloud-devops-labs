export interface Note {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

export interface NoteInput {
  title?: unknown;
  body?: unknown;
}

export class ValidationError extends Error {}

/**
 * Turns whatever arrived in the request body into a Note we are willing to store.
 * Throws ValidationError when the input cannot be repaired.
 */
export function buildNote(input: NoteInput, now: Date = new Date()): Note {
  const title = typeof input.title === 'string' ? input.title.trim() : '';
  const body = typeof input.body === 'string' ? input.body.trim() : '';

  if (title.length === 0) throw new ValidationError('title is required');
  if (title.length > 80) throw new ValidationError('title must be 80 characters or fewer');

  return {
    id: crypto.randomUUID(),
    title,
    body,
    createdAt: now.toISOString()
  };
}

/** Newest first, which is the order the UI expects. */
export function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
