const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const rootDir = process.cwd();
const publicDir = path.join(rootDir, 'public');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

const server = http.createServer((req, res) => {
  try {
    const parsedUrl = url.parse(req.url);
    let pathname = decodeURIComponent(parsedUrl.pathname);

    // Default to index.html for root
    if (pathname === '/') {
      pathname = '/index.html';
    }

    // Check if file exists in public directory first
    let filePath = path.join(publicDir, pathname);
    let isPublic = true;

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      // Check if file exists in root directory (e.g. product image folders)
      const rootFilePath = path.join(rootDir, pathname);
      if (fs.existsSync(rootFilePath) && !fs.statSync(rootFilePath).isDirectory()) {
        filePath = rootFilePath;
        isPublic = false;
      } else {
        // SPA Fallback for client routes (/catalogo, /catalogo/premier-league, etc.)
        if (!path.extname(pathname)) {
          filePath = path.join(publicDir, 'index.html');
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('404 Not Found');
          return;
        }
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    const headers = {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    };

    // Cache static images for high performance
    if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.woff2'].includes(ext)) {
      headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    } else {
      headers['Cache-Control'] = 'no-cache';
    }

    const stream = fs.createReadStream(filePath);
    stream.on('error', (err) => {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('500 Server Error');
    });

    res.writeHead(200, headers);
    stream.pipe(res);
  } catch (err) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('400 Bad Request');
  }
});

server.listen(PORT, () => {
  console.log(`\n🚀 PL FORNECIMENTO — Servidor do Catálogo rodando com sucesso!`);
  console.log(`🌐 Acesse: http://localhost:${PORT}`);
  console.log(`📦 Catálogo ativo com 13.952 produtos e 79.840 imagens.\n`);
});
