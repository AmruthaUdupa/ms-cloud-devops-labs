# Answers — read only after you have diagnosed each one

**Dockerfile.1** — `CMD` names `server.js`, but the file is `app.js`. Node exits
with code 1 and `docker logs` shows `Cannot find module '/app/server.js'`.
Lesson: the exit code and the logs together name the problem in seconds.
Fix: `CMD ["node", "app.js"]`.

**Dockerfile.2** — `PORT` is never set, so `listen(undefined)` binds a random
free port. The container stays Up and the logs say `listening on undefined`,
which is the giveaway, but nothing answers on 3000. Lesson: a container
inherits none of your shell's environment; `docker inspect` shows exactly which
variables it does have. Fix: add `ENV PORT=3000`, or pass `-e PORT=3000`.

**Dockerfile.3** — the app listens on 8080 while `-p 3000:3000` forwards to 3000
inside the container. Nothing is listening there. Lesson: `EXPOSE` documents,
`-p` forwards, and neither one changes what the app binds.
Fix: `-p 3000:8080`, or set `ENV PORT=3000`.

**Dockerfile.4** — shell form, so `sh` interprets the `&` and backgrounds node.
`sh` then has nothing left to do, exits 0, and the container stops instantly -
with empty logs, which is the confusing part. A container lives exactly as long
as its main process (PID 1). Fix: drop the `&` and run in the foreground.
Note the related trap: in *exec* form, `CMD ["node","app.js","&"]` does not
background anything at all, because no shell is involved - node just receives a
stray argument.
