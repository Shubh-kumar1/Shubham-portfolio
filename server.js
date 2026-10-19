const http = require('node:http');
const { readFile } = require('node:fs/promises');
const path = require('node:path');
const { getLiveStats } = require('./lib/live-stats');

const root = __dirname;
const mimeTypes = { '.css': 'text/css', '.html': 'text/html', '.js': 'application/javascript', '.pdf': 'application/pdf' };

http.createServer(async (request, response) => {
  const url = new URL(request.url, 'http://localhost');
  if (url.pathname === '/api/live-stats') {
    try {
      const stats = await getLiveStats();
      response.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      response.end(JSON.stringify(stats));
    } catch {
      response.writeHead(503, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: 'Live coding stats are temporarily unavailable.' }));
    }
    return;
  }
  const fileName = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  const filePath = path.resolve(root, fileName);
  if (!filePath.startsWith(root)) { response.writeHead(403); response.end(); return; }
  try {
    const file = await readFile(filePath);
    response.writeHead(200, { 'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream' });
    response.end(file);
  } catch {
    response.writeHead(404); response.end('Not found');
  }
}).listen(4174, '127.0.0.1', () => console.log('Portfolio running at http://127.0.0.1:4174'));
