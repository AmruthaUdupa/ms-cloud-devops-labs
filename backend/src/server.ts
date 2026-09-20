import { mkdir, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { config } from './config.js';
import { createApp } from './app.js';
import { NoteStore } from './store.js';

/**
 * Fail fast, and say why. Inside a container running as a non-root user, the
 * app often cannot create its data directory. Discovering that on the first
 * POST, hours later, is miserable; discovering it at startup is a one-line fix
 * (chown the directory in the Dockerfile, or mount a volume).
 */
async function checkStorage(file: string): Promise<void> {
  const dir = dirname(resolve(file));
  try {
    await mkdir(dir, { recursive: true });
    await access(dir, constants.W_OK);
  } catch (err) {
    console.error(`FATAL: cannot write to ${dir} (DATA_FILE=${file})`);
    console.error('Running as a non-root user? Make sure the directory exists and is owned by that user.');
    console.error(err);
    process.exit(1);
  }
}

await checkStorage(config.dataFile);

const app = createApp(new NoteStore(config.dataFile), config.corsOrigin);

// Listening on 0.0.0.0 matters inside a container: binding to 127.0.0.1 would
// make the port unreachable from outside, even with -p.
const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`notes-backend listening on ${config.port}, data file ${config.dataFile}`);
});

// Docker sends SIGTERM on `docker stop`. Without this handler the process is
// killed 10 seconds later by SIGKILL instead of shutting down cleanly.
for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.on(signal, () => {
    console.log(`${signal} received, shutting down`);
    server.close(() => process.exit(0));
  });
}
