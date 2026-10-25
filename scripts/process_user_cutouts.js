const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function processDarkBgToTransparent(inputPath, outputPath) {
  console.log(`Processing: ${inputPath} -> ${outputPath}`);
  
  const img = sharp(inputPath);
  const meta = await img.metadata();
  const w = meta.width;
  const h = meta.height;
  
  console.log(`Dimensions: ${w}x${h}`);
  
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const channels = info.channels;
  const totalPixels = w * h;
  const rgbaBuffer = Buffer.alloc(totalPixels * 4);
  
  // Inspect top-left pixel color to get exact background color
  const bgR = data[0];
  const bgG = data[1];
  const bgB = data[2];
  console.log(`Detected background color sample: rgb(${bgR}, ${bgG}, ${bgB})`);
  
  // A pixel is background if it matches the dark background color
  const isBgCandidate = (r, g, b) => {
    const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
    return dist < 28;
  };
  
  const isNearEdge = (r, g, b) => {
    const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
    return dist < 45;
  };

  const visited = new Uint8Array(totalPixels);
  const queue = [];
  
  // Seed queue with border pixels
  for (let x = 0; x < w; x++) {
    queue.push(0 * w + x);
    queue.push((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    queue.push(y * w + 0);
    queue.push(y * w + (w - 1));
  }
  
  // BFS Flood fill
  let head = 0;
  while (head < queue.length) {
    const idx = queue[head++];
    if (visited[idx]) continue;
    
    const px = idx % w;
    const py = Math.floor(idx / w);
    const r = data[idx * channels];
    const g = data[idx * channels + 1];
    const b = data[idx * channels + 2];
    
    if (isBgCandidate(r, g, b)) {
      visited[idx] = 2; // confirmed background
      if (px > 0 && !visited[idx - 1]) queue.push(idx - 1);
      if (px < w - 1 && !visited[idx + 1]) queue.push(idx + 1);
      if (py > 0 && !visited[idx - w]) queue.push(idx - w);
      if (py < h - 1 && !visited[idx + w]) queue.push(idx + w);
    } else if (isNearEdge(r, g, b)) {
      visited[idx] = 1; // edge feathering
    }
  }
  
  // Fill RGBA output
  for (let i = 0; i < totalPixels; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];
    const a = channels === 4 ? data[i * channels + 3] : 255;
    const outIdx = i * 4;
    
    if (visited[i] === 2) {
      // 100% Transparent
      rgbaBuffer[outIdx] = 0;
      rgbaBuffer[outIdx + 1] = 0;
      rgbaBuffer[outIdx + 2] = 0;
      rgbaBuffer[outIdx + 3] = 0;
    } else if (visited[i] === 1) {
      const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
      // Fade alpha from 0 at dist=25 to 255 at dist=45
      const alphaFactor = Math.max(0, Math.min(1, (dist - 25) / 20));
      const alpha = Math.round(alphaFactor * 255);
      
      rgbaBuffer[outIdx] = r;
      rgbaBuffer[outIdx + 1] = g;
      rgbaBuffer[outIdx + 2] = b;
      rgbaBuffer[outIdx + 3] = alpha;
    } else {
      // Fully opaque
      rgbaBuffer[outIdx] = r;
      rgbaBuffer[outIdx + 1] = g;
      rgbaBuffer[outIdx + 2] = b;
      rgbaBuffer[outIdx + 3] = a;
    }
  }
  
  // Convert raw buffer to PNG buffer
  const pngBuffer = await sharp(rgbaBuffer, {
    raw: { width: w, height: h, channels: 4 }
  })
  .png({ compressionLevel: 9 })
  .toBuffer();
  
  // Trim bounding box whitespace so cutout is clean and centered
  const trimmed = await sharp(pngBuffer)
    .trim()
    .toBuffer();
  
  // Save with slight margin
  await sharp(trimmed)
    .extend({
      top: 8,
      bottom: 8,
      left: 8,
      right: 8,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
    
  console.log(`Successfully generated transparent cutout: ${outputPath}`);
}

async function run() {
  const freshTodayInput = "C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\ec949545-e762-49c8-92f9-d8464282dcff\\.user_uploaded\\media_1790318240938.png";
  const indianAsianInput = "C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\ec949545-e762-49c8-92f9-d8464282dcff\\.user_uploaded\\media_1790318258014.png";
  
  const bannersDir = path.join(__dirname, "..", "public", "assets", "images", "banners");
  const outFreshToday = path.join(bannersDir, "fresh-today.png");
  const outIndianAsian = path.join(bannersDir, "indian-asian-grocery.png");
  
  await processDarkBgToTransparent(freshTodayInput, outFreshToday);
  await processDarkBgToTransparent(indianAsianInput, outIndianAsian);
}

run().catch(console.error);
