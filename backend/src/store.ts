import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { Note } from './notes.js';

/**
 * Notes live in a JSON file on disk. That is deliberate: it is the simplest
 * thing that still makes the difference between a container and a volume
 * obvious. Delete the container without a volume and the notes are gone.
 */
export class NoteStore {
  constructor(private readonly file: string) {}

  async all(): Promise<Note[]> {
    try {
      return JSON.parse(await readFile(this.file, 'utf8')) as Note[];
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw err;
    }
  }

  async find(id: string): Promise<Note | undefined> {
    return (await this.all()).find((n) => n.id === id);
  }

  async add(note: Note): Promise<Note> {
    const notes = await this.all();
    notes.push(note);
    await this.save(notes);
    return note;
  }

  async remove(id: string): Promise<boolean> {
    const notes = await this.all();
    const left = notes.filter((n) => n.id !== id);
    if (left.length === notes.length) return false;
    await this.save(left);
    return true;
  }

  private async save(notes: Note[]): Promise<void> {
    await mkdir(dirname(this.file), { recursive: true });
    await writeFile(this.file, JSON.stringify(notes, null, 2), 'utf8');
  }
}
