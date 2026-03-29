import fs from 'node:fs';
import path from 'node:path';

const MANIFEST_PATH = './public/minecraft/manifest.json';
const OUTPUT_BASE = './public';

async function extract() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`Error: ${MANIFEST_PATH} not found.`);
    process.exit(1);
  }

  const manifestData = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const { assets } = manifestData;

  if (!assets) {
    console.error('Error: No assets found in manifest.');
    process.exit(1);
  }

  const assetKeys = Object.keys(assets);
  for (const assetPath of assetKeys) {
    const asset = assets[assetPath];
    if (!asset.data) continue;

    const relativePath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
    const fullPath = path.resolve(OUTPUT_BASE, relativePath);
    const dir = path.dirname(fullPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const buffer = Buffer.from(asset.data, 'base64');
    fs.writeFileSync(fullPath, buffer);
  }
}

extract().catch((err) => {
  console.error('Extraction failed:', err);
  process.exit(1);
});
