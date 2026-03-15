import fs from 'node:fs';
import path from 'node:path';
import JSZip from 'jszip';

const FCS_FILE = './public/rover.fcs';
const OUTPUT_DIR = './public/rover';
const MANIFEST_FILE = path.join(OUTPUT_DIR, 'manifest.json');

async function extract() {
   if (!fs.existsSync(FCS_FILE)) {
      console.error(`Error: ${FCS_FILE} not found.`);
      return;
   }

   console.log(`Extracting ${FCS_FILE}...`);
   const data = fs.readFileSync(FCS_FILE);
   const zip = await JSZip.loadAsync(data);

   if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
   }

   const manifest = {
      animations: {},
   };

   const files = Object.keys(zip.files).filter((name) => !zip.files[name].dir && name.toLowerCase().endsWith('.bmp'));

   for (const filename of files) {
      const parts = filename.split('/');
      if (parts.length !== 2) continue;

      const [animName, frameName] = parts;
      const animDir = path.join(OUTPUT_DIR, animName);

      if (!fs.existsSync(animDir)) {
         fs.mkdirSync(animDir, { recursive: true });
      }

      const content = await zip.files[filename].async('nodebuffer');
      fs.writeFileSync(path.join(animDir, frameName), content);

      if (!manifest.animations[animName]) {
         manifest.animations[animName] = [];
      }
      manifest.animations[animName].push(frameName);
   }

   // sort frames numerically
   for (const anim in manifest.animations) {
      manifest.animations[anim].sort((a, b) => {
         const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
         const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
         return numA - numB;
      });
   }

   fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
   console.log(`Success! extracted assets and manifest generated at ${OUTPUT_DIR}`);
}

extract().catch(console.error);
