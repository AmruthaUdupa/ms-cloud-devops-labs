export interface Note {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

// Read once, at module load. In a built bundle this is already a literal
// string - Vite replaced it during `npm run build`. That is the whole reason
// the Dockerfile passes it as an ARG and not as a runtime ENV.
export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${detail}`);
  }
  return (await res.json()) as T;
}

export const api = {
  health: () => fetch(`${API_URL}/health`).then((r) => json<{ status: string }>(r)),
  list: () => fetch(`${API_URL}/api/notes`).then((r) => json<Note[]>(r)),
  get: (id: string) => fetch(`${API_URL}/api/notes/${id}`).then((r) => json<Note>(r)),
  create: (title: string, body: string) =>
    fetch(`${API_URL}/api/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body })
    }).then((r) => json<Note>(r)),
  remove: async (id: string) => {
    const res = await fetch(`${API_URL}/api/notes/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`could not delete: ${res.status}`);
  }
};
