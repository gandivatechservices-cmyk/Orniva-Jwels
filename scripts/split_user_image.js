const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function splitAndMakeTransparent(inputPath, outFreshToday, outIndianAsian) {
  console.log(`Processing uploaded image: ${inputPath}`);
  
  const source = sharp(inputPath);
  const metadata = await source.metadata();
  const width = metadata.width;
  const height = metadata.height;
  
  console.log(`Image dimensions: ${width}x${height}`);
  
  // Cut roughly in half with a slight margin
  const midX = Math.floor(width / 2);
  
  // Extract left half for Fresh Today
  const leftBuffer = await sharp(inputPath)
    .extract({ left: 0, top: 0, width: midX, height: height })
    .toBuffer();
    
  // Extract right half for Indian & Asian
  const rightBuffer = await sharp(inputPath)
    .extract({ left: midX, top: 0, width: width - midX, height: height })
    .toBuffer();
    
  // Process transparency for any buffer
  async function makeTransparent(buffer, outPath) {
    const img = sharp(buffer);
    const meta = await img.metadata();
    const w = meta.width;
    const h = meta.height;
    
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    const channels = info.channels;
    const totalPixels = w * h;
    const rgbaBuffer = Buffer.alloc(totalPixels * 4);
    
    // Background detection function (identifies white / near white background from perimeter)
    const isBgCandidate = (r, g, b) => {
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const diff = max - min;
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      return lum >= 242 && diff < 20;
    };
    
    const isNearEdge = (r, g, b) => {
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const diff = max - min;
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      return lum >= 220 && diff < 24;
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
      
      if (a === 0 || visited[i] === 2) {
        rgbaBuffer[outIdx] = 0;
        rgbaBuffer[outIdx + 1] = 0;
        rgbaBuffer[outIdx + 2] = 0;
        rgbaBuffer[outIdx + 3] = 0;
      } else if (visited[i] === 1) {
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const alphaFactor = Math.max(0, Math.min(1, (255 - lum) / 35));
        const alpha = Math.round(alphaFactor * 255);
        
        // Defringe
        const defringedR = Math.max(0, r - (255 - alpha));
        const defringedG = Math.max(0, g - (255 - alpha));
        const defringedB = Math.max(0, b - (255 - alpha));
        
        rgbaBuffer[outIdx] = defringedR;
        rgbaBuffer[outIdx + 1] = defringedG;
        rgbaBuffer[outIdx + 2] = defringedB;
        rgbaBuffer[outIdx + 3] = alpha;
      } else {
        rgbaBuffer[outIdx] = r;
        rgbaBuffer[outIdx + 1] = g;
        rgbaBuffer[outIdx + 2] = b;
        rgbaBuffer[outIdx + 3] = a;
      }
    }
    
    // Trim bounding box whitespace so cutout is clean
    const trimmed = await sharp(rgbaBuffer, {
      raw: { width: w, height: h, channels: 4 }
    })
    .trim()
    .png({ compressionLevel: 9 })
    .toBuffer();
    
    // Pad with comfortable margin
    await sharp(trimmed)
      .extend({
        top: 20,
        bottom: 20,
        left: 20,
        right: 20,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png({ compressionLevel: 9 })
      .toFile(outPath);
      
    console.log(`Saved transparent asset: ${outPath}`);
  }
  
  await makeTransparent(leftBuffer, outFreshToday);
  await makeTransparent(rightBuffer, outIndianAsian);
}

const inputPath = "C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\ec949545-e762-49c8-92f9-d8464282dcff\\.user_uploaded\\media_1790314552867.png";
const bannersDir = path.join(__dirname, "..", "public", "assets", "images", "banners");
const outFreshToday = path.join(bannersDir, "fresh-today.png");
const outIndianAsian = path.join(bannersDir, "indian-asian-grocery.png");

splitAndMakeTransparent(inputPath, outFreshToday, outIndianAsian).catch(console.error);
