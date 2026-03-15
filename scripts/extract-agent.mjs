import fs from 'node:fs';
import path from 'node:path';
import JSZip from 'jszip';
import { Jimp } from 'jimp';

const FCS_FILE = './public/rover.fcs';
const OUTPUT_DIR = './public/rover';
const MANIFEST_FILE = path.join(OUTPUT_DIR, 'manifest.json');

function replaceBackgroundWithTransparency(rgbaBuffer) {
   const output = Buffer.from(rgbaBuffer);
   const bgR = output[0];
   const bgG = output[1];
   const bgB = output[2];

   for (let i = 0; i < output.length; i += 4) {
      if (output[i] === bgR && output[i + 1] === bgG && output[i + 2] === bgB) {
         output[i + 3] = 0;
      }
   }

   return output;
}

async function convertBmpBufferToTransparentPngBuffer(bmpBuffer) {
   const image = await Jimp.read(bmpBuffer);
   const transparentRgba = replaceBackgroundWithTransparency(image.bitmap.data);
   image.bitmap.data = transparentRgba;
   return image.getBuffer('image/png');
}

async function extract() {
   if (!fs.existsSync(FCS_FILE)) {
      console.error(`Error: ${FCS_FILE} not found.`);
      return;
   }

   console.log(`Extracting ${FCS_FILE}...`);
   const data = fs.readFileSync(FCS_FILE);
   const sourceStats = fs.statSync(FCS_FILE);
   const zip = await JSZip.loadAsync(data);

   fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
   fs.mkdirSync(OUTPUT_DIR, { recursive: true });

   const manifest = {
      version: String(sourceStats.mtimeMs),
      format: 'base64',
      transparency: 'top-left-chroma-key',
      animations: {},
   };

   const files = Object.keys(zip.files).filter((name) => !zip.files[name].dir && name.toLowerCase().endsWith('.bmp'));
   const tempFrames = {};

   for (const filename of files) {
      const parts = filename.split('/');
      if (parts.length !== 2) continue;

      const [animName, frameName] = parts;

      const content = await zip.files[filename].async('nodebuffer');
      const convertedPng = await convertBmpBufferToTransparentPngBuffer(content);
      const base64String = `data:image/png;base64,${convertedPng.toString('base64')}`;

      if (!tempFrames[animName]) {
         tempFrames[animName] = [];
      }

      tempFrames[animName].push({
         name: frameName,
         data: base64String,
      });
   }

   for (const anim in tempFrames) {
      tempFrames[anim].sort((a, b) => {
         const numA = parseInt(a.name.replace(/\D/g, ''), 10) || 0;
         const numB = parseInt(b.name.replace(/\D/g, ''), 10) || 0;
         return numA - numB;
      });

      manifest.animations[anim] = tempFrames[anim].map((frame) => frame.data);
   }

   fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest));
   console.log(`Success! extracted assets and manifest generated at ${MANIFEST_FILE}`);
}

extract().catch(console.error);
