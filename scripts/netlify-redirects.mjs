import { writeFile } from 'node:fs/promises';

const target = process.env.API_PROXY_TARGET;
if (!target) {
  throw new Error('Configura API_PROXY_TARGET en Netlify con el origen HTTPS de la API.');
}

const url = new URL(target);
if (url.protocol !== 'https:' || url.origin !== target) {
  throw new Error('API_PROXY_TARGET debe ser un origen HTTPS, sin rutas ni barra final.');
}

await writeFile('dist/_redirects', `/api/* ${url.origin}/api/:splat 200!\n/* /index.html 200\n`);
