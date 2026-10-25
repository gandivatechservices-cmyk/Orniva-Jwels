const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createCutout() {
  const inputPath = 'C:/Users/MSI/.gemini/antigravity-ide/brain/0bf16d9b-9695-492d-b130-fec366c27957/packaged_food_cutout_1791048574407.jpg';
  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  const isBg = new Uint8Array(width * height);
  const queueX = new Int32Array(width * height);
  const queueY = new Int32Array(width * height);
  let qHead = 0, qTail = 0;

  function push(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const pIdx = y * width + x;
    if (isBg[pIdx]) return;

    const dIdx = pIdx * 3;
    // Check if near white
    if (data[dIdx] >= 238 && data[dIdx + 1] >= 238 && data[dIdx + 2] >= 238) {
      isBg[pIdx] = 1;
      queueX[qTail] = x;
      queueY[qTail] = y;
      qTail++;
    }
  }

  // Push all border pixels
  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 1; y < height - 1; y++) {
    push(0, y);
    push(width - 1, y);
  }

  // Also seed inside the handle arch
  push(600, 95);

  while (qHead < qTail) {
    const x = queueX[qHead];
    const y = queueY[qHead];
    qHead++;

    if (x > 0) push(x - 1, y);
    if (x < width - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < height - 1) push(x, y + 1);
  }

  console.log(`Processed ${qTail} background pixels.`);

  // Build RGBA with smooth antialiased alpha feathering
  const rgba = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pIdx = y * width + x;
      const dIdx = pIdx * 3;
      const rIdx = pIdx * 4;

      const r = data[dIdx], g = data[dIdx + 1], b = data[dIdx + 2];

      if (isBg[pIdx]) {
        rgba[rIdx] = 0;
        rgba[rIdx + 1] = 0;
        rgba[rIdx + 2] = 0;
        rgba[rIdx + 3] = 0;
      } else {
        // Count background neighbors within 2px radius
        let bgCount = 0;
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              if (isBg[ny * width + nx]) bgCount++;
            }
          }
        }

        rgba[rIdx] = r;
        rgba[rIdx + 1] = g;
        rgba[rIdx + 2] = b;

        if (bgCount > 0 && r >= 230 && g >= 230 && b >= 230) {
          const whiteness = (r + g + b) / (3 * 255);
          const alpha = Math.max(0, Math.min(255, Math.round(255 * (1 - whiteness * (bgCount / 25)))));
          rgba[rIdx + 3] = alpha;
        } else {
          rgba[rIdx + 3] = 255;
        }
      }
    }
  }

  const outDir1 = path.join(__dirname, '../public/assets/images/hero');
  const outDir2 = path.join(__dirname, '../public/assets/images/banners');
  if (!fs.existsSync(outDir1)) fs.mkdirSync(outDir1, { recursive: true });
  if (!fs.existsSync(outDir2)) fs.mkdirSync(outDir2, { recursive: true });

  const targetPath1 = path.join(outDir1, 'hero-packaged-food.png');
  const targetPath2 = path.join(outDir2, 'shop-all-packaged-food.png');
  const artifactPath = 'C:/Users/MSI/.gemini/antigravity-ide/brain/0bf16d9b-9695-492d-b130-fec366c27957/packaged_food_hero_transparent.png';

  const trimmed = await sharp(rgba, { raw: { width, height, channels: 4 } })
    .trim({ threshold: 5 })
    .png({ compressionLevel: 9 })
    .toBuffer();

  fs.writeFileSync(targetPath1, trimmed);
  fs.writeFileSync(targetPath2, trimmed);
  fs.writeFileSync(artifactPath, trimmed);
  console.log('Successfully saved trimmed transparent PNG to all targets!');
}

createCutout().catch(err => {
  console.error(err);
  process.exit(1);
});
