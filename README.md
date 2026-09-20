# DevOps labs — notes app

The application used in the Cloud/DevOps lab sessions. **You will not write
application code here.** The job is to package it, run it, connect the pieces,
break it, fix it and ship it.

| Folder | What it is | Runs on | Used in |
|---|---|---|---|
| `backend/` | Notes API — Node 20 + TypeScript + Express, notes stored in a JSON file | 3000 | Dockerfile, volumes, Compose, CI |
| `frontend/` | Notes UI — Vite + TypeScript, built to static files | 5173 dev, 80 in nginx | Dockerfile, build args, Compose |
| `broken-app/` | Four containers that refuse to work | 3000 | debugging lab |

## Before the lab

```sh
docker --version && docker run hello-world
node --version          # 20 or newer
docker pull node:20-alpine && docker pull nginx:alpine
```

Pull the base images at home. Thirty people pulling `node:20-alpine` at once
over college wifi is how a three-hour lab becomes a two-hour lab.

## Run it without Docker

Two terminals:

```sh
cd backend
cp .env.example .env
npm ci && npm run dev          # http://localhost:3000/health

cd frontend
cp .env.example .env
npm ci && npm run dev          # http://localhost:5173
```

Create a note in the browser. If the header says *unreachable*, the backend is
not running or `VITE_API_URL` points somewhere wrong.

## What you need to write down

Every lab block assumes you know these three things for each app:

1. **Node version** — 20 (see `engines` in `package.json`)
2. **Environment variables** — see `.env.example` in each folder
3. **Port** — backend 3000, frontend 5173 in dev and 80 inside nginx

## The API

| Method | Path | Notes |
|---|---|---|
| GET | `/health` | used by `HEALTHCHECK` and Compose `depends_on` |
| GET | `/api/notes` | newest first |
| POST | `/api/notes` | `{ "title": "…", "body": "…" }`, title required |
| GET | `/api/notes/:id` | 404 if unknown |
| DELETE | `/api/notes/:id` | 204 on success |

## Scripts

Both apps expose the same four, which is what the CI pipeline runs:

```sh
npm run lint      # eslint
npm test          # fast unit tests
npm run test:int  # integration tests against the real routes (backend only)
npm run build     # backend: tsc -> dist/   frontend: vite -> dist/
```

## Two things that will bite you

**The notes file.** The API writes to `DATA_FILE` (default `./data/notes.json`).
In a container that directory must exist and be writable by the user the app
runs as. With `USER node` in your Dockerfile, root owns `/app`, so the app
cannot create `/app/data` — it now says so at startup instead of failing later.
Either `chown` the directory in the Dockerfile or mount a volume. Remove a
container without a volume and the notes are gone; that is the point of the
volumes lab.

**The API URL.** `VITE_API_URL` is baked into the frontend bundle at *build*
time. Setting it on a running container changes nothing. That is why the
frontend Dockerfile takes it as an `ARG`.

## Branches

- `main` — the apps, no Dockerfiles. This is where you start.
- `checkpoint/*` — a working version of each stage. If you fall behind, check
  out the next one, compare it with yours, and keep going.
- `lab/ci-broken` — has a failing test and a lint error planted in it, for the
  pipeline exercise.
