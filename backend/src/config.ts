// Every setting the app needs comes from the environment, with a sane default
// for local development. Lab note: these are the variables you must find and
// write down in block 0:00-0:15.
export const config = {
  port: Number(process.env.PORT ?? 3000),
  dataFile: process.env.DATA_FILE ?? './data/notes.json',
  corsOrigin: process.env.CORS_ORIGIN ?? '*'
};
