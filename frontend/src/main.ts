import './style.css';
import { api, API_URL, type Note } from './api';
import { createRouter } from './router';

const app = document.querySelector<HTMLDivElement>('#app')!;

function shell(inner: string): string {
  return `<main>
    <header>
      <div>
        <h1><a href="/" data-link>Notes</a></h1>
        <div class="status" id="status">checking ${API_URL}…</div>
      </div>
    </header>
    ${inner}
  </main>`;
}

function noteItem(n: Note): string {
  return `<li>
    <div>
      <strong><a href="/notes/${n.id}" data-link>${escapeHtml(n.title)}</a></strong>
      <p>${escapeHtml(n.body)}</p>
      <time>${new Date(n.createdAt).toLocaleString()}</time>
    </div>
    <button class="ghost" data-delete="${n.id}">delete</button>
  </li>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string
  );
}

async function listView() {
  app.innerHTML = shell(`
    <form id="new-note">
      <input id="title" name="title" placeholder="Title" maxlength="80" required />
      <textarea id="body" name="body" placeholder="Anything worth remembering…"></textarea>
      <div><button type="submit">Add note</button></div>
    </form>
    <ul id="notes"><li class="empty">Loading…</li></ul>
  `);
  await refresh();

  app.querySelector<HTMLFormElement>('#new-note')!.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = app.querySelector<HTMLInputElement>('#title')!;
    const body = app.querySelector<HTMLTextAreaElement>('#body')!;
    try {
      await api.create(title.value, body.value);
      title.value = '';
      body.value = '';
      await refresh();
    } catch (err) {
      showError(err);
    }
  });
}

async function refresh() {
  const ul = app.querySelector<HTMLUListElement>('#notes');
  if (!ul) return;
  try {
    const notes = await api.list();
    ul.innerHTML = notes.length
      ? notes.map(noteItem).join('')
      : '<li class="empty">No notes yet. Add the first one.</li>';
    ul.querySelectorAll<HTMLButtonElement>('[data-delete]').forEach((btn) =>
      btn.addEventListener('click', async () => {
        try {
          await api.remove(btn.dataset.delete!);
          await refresh();
        } catch (err) {
          showError(err);
        }
      })
    );
  } catch (err) {
    ul.innerHTML = `<li class="error">Could not reach the API at ${API_URL}. Is the backend running?</li>`;
    console.error(err);
  }
}

async function detailView(params: Record<string, string>) {
  app.innerHTML = shell('<p class="empty">Loading…</p>');
  try {
    const note = await api.get(params.id);
    app.innerHTML = shell(`
      <ul><li><div>
        <strong>${escapeHtml(note.title)}</strong>
        <p>${escapeHtml(note.body)}</p>
        <time>${new Date(note.createdAt).toLocaleString()}</time>
      </div></li></ul>
      <p><a href="/" data-link>← All notes</a></p>
    `);
  } catch {
    app.innerHTML = shell('<p class="error">That note does not exist.</p><p><a href="/" data-link>← All notes</a></p>');
  }
  void health();
}

function notFound() {
  app.innerHTML = shell('<p class="error">Page not found.</p><p><a href="/" data-link>← All notes</a></p>');
  void health();
}

function showError(err: unknown) {
  const status = app.querySelector<HTMLDivElement>('#status');
  if (status) {
    status.textContent = err instanceof Error ? err.message : String(err);
    status.classList.add('down');
  }
}

async function health() {
  const status = app.querySelector<HTMLDivElement>('#status');
  if (!status) return;
  try {
    await api.health();
    status.textContent = `API ${API_URL} · healthy`;
    status.classList.remove('down');
  } catch {
    status.textContent = `API ${API_URL} · unreachable`;
    status.classList.add('down');
  }
}

const router = createRouter(
  {
    '/': async () => {
      await listView();
      void health();
    },
    '/notes/:id': detailView
  },
  notFound
);

// Intercept in-app links so the router handles them instead of the server.
document.addEventListener('click', (e) => {
  const link = (e.target as HTMLElement).closest('a[data-link]');
  if (link instanceof HTMLAnchorElement) {
    e.preventDefault();
    router.navigate(link.getAttribute('href')!);
  }
});

router.render();
