// Tiny dependency-free static server for local preview: `npm start`
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)));
const port = Number(process.env.PORT) || 4173;
// Only these paths are served, so nothing unrelated in the folder is exposed.
const allowed = [/^\/$/, /^\/index\.html$/, /^\/styles\.css$/, /^\/script\.js$/, /^\/assets\/[\w\-./]+$/, /^\/vendor\/[\w\-./]+$/];
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.svg': 'image/svg+xml',
};

http.createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.includes('..') || !allowed.some((re) => re.test(p))) throw new Error('not allowed');
    if (p === '/') p = '/index.html';
    const file = normalize(join(root, p));
    if (!file.startsWith(root)) throw new Error('outside root');
    await stat(file);
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}).listen(port, () => console.log(`Portfolio running at http://localhost:${port}`));
