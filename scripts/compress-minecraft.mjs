import fs from 'node:fs';
import path from 'node:path';

const SOURCE_ROOT = './public';
const MINECRAFT_DIR = './public/minecraft';
const ASSETS_DIR = './public/minecraft/assets';
const OUTPUT_JSON = './public/minecraft/manifest.json';

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.json': 'application/json',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4'
};

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

async function compress() {
  const manifest = {
    version: "1.1.0",
    assets: {}
  };

  function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        walk(filePath);
      } else {
        if (file === 'manifest.json' || file === 'manifest' || file === 'sw.js' || file.endsWith('.zip')) continue;

        const relativePath = '/' + path.relative(SOURCE_ROOT, filePath).replace(/\\/g, '/');
        const mimeType = getMimeType(filePath);
        const data = fs.readFileSync(filePath).toString('base64');

        manifest.assets[relativePath] = {
          mimeType,
          data
        };
      }
    }
  }

  if (!fs.existsSync(MINECRAFT_DIR)) {
    console.error(`Error: ${MINECRAFT_DIR} not found.`);
    process.exit(1);
  }

  walk(MINECRAFT_DIR);

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(manifest, null, 3));

  if (fs.existsSync(ASSETS_DIR)) {
    fs.rmSync(ASSETS_DIR, { recursive: true, force: true });
  }
  
  const extractedIndex = path.join(MINECRAFT_DIR, 'index.html');
  if (fs.existsSync(extractedIndex)) {
     fs.unlinkSync(extractedIndex);
  }
}

compress().catch((err) => {
  console.error('Compression failed:', err);
  process.exit(1);
});
