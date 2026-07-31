const fs = require('fs');
const path = require('path');
const root = __dirname;
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const assets = {
  '/': { body: read('index.html'), type: 'text/html; charset=utf-8' },
  '/index.html': { body: read('index.html'), type: 'text/html; charset=utf-8' },
  '/style.css': { body: read('style.css'), type: 'text/css; charset=utf-8' },
  '/ai-photo.css': { body: read('ai-photo.css'), type: 'text/css; charset=utf-8' },
  '/ocean-ai.css': { body: read('ocean-ai.css'), type: 'text/css; charset=utf-8' },
  '/social-features.css': { body: read('social-features.css'), type: 'text/css; charset=utf-8' },
  '/gameplay-expansion.css': { body: read('gameplay-expansion.css'), type: 'text/css; charset=utf-8' },
  '/visual-refresh.css': { body: read('visual-refresh.css'), type: 'text/css; charset=utf-8' },
  '/script.js': { body: read('script.js'), type: 'application/javascript; charset=utf-8' },
  '/ai-photo.js': { body: read('ai-photo.js'), type: 'application/javascript; charset=utf-8' },
  '/ocean-ai.js': { body: read('ocean-ai.js'), type: 'application/javascript; charset=utf-8' },
  '/firebase-auth.js': { body: read('firebase-auth.js'), type: 'application/javascript; charset=utf-8' },
  '/ocean-catalog.js': { body: read('ocean-catalog.js'), type: 'application/javascript; charset=utf-8' }
};
const worker = `const assets=${JSON.stringify(assets)};export default{fetch(request){const url=new URL(request.url);const asset=assets[url.pathname]||assets['/'];return new Response(asset.body,{headers:{'content-type':asset.type,'cache-control':url.pathname==='/'?'no-cache':'public, max-age=300'}})}};`;
fs.mkdirSync(path.join(root, 'dist', 'server'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist', 'server', 'index.js'), worker);
fs.mkdirSync(path.join(root, 'dist', '.openai'), { recursive: true });
fs.copyFileSync(path.join(root, '.openai', 'hosting.json'), path.join(root, 'dist', '.openai', 'hosting.json'));
