const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function processImageToTransparentPNG(inputPath, outputPath) {
  console.log(`Processing: ${inputPath} -> ${outputPath}`);
  
  // Read raw RGB pixels
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const width = metadata.width;
  const height = metadata.height;
  
  const { data, info } = await image
    .raw()
    .toBuffer({ resolveWithObject: true });
    
  // data contains RGB (3 channels) or RGBA (4 channels)
  const channels = info.channels;
  const totalPixels = width * height;
  
  // Create RGBA output buffer
  const rgbaBuffer = Buffer.alloc(totalPixels * 4);
  
  // Flood fill / background detection from perimeter
  // A pixel is background if it's connected to perimeter and is near-white (luminance > 242 and low saturation)
  const isBgCandidate = (r, g, b) => {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    return lum >= 244 && diff < 18;
  };
  
  const isNearEdge = (r, g, b) => {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    return lum >= 225 && diff < 22;
  };

  const visited = new Uint8Array(totalPixels);
  const queue = [];
  
  // Seed queue with border pixels
  for (let x = 0; x < width; x++) {
    // Top border
    queue.push(0 * width + x);
    // Bottom border
    queue.push((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    // Left border
    queue.push(y * width + 0);
    // Right border
    queue.push(y * width + (width - 1));
  }
  
  // BFS Flood fill
  let head = 0;
  while (head < queue.length) {
    const idx = queue[head++];
    if (visited[idx]) continue;
    
    const px = idx % width;
    const py = Math.floor(idx / width);
    const r = data[idx * channels];
    const g = data[idx * channels + 1];
    const b = data[idx * channels + 2];
    
    if (isBgCandidate(r, g, b)) {
      visited[idx] = 2; // confirmed background
      
      // Check 4 neighbors
      if (px > 0 && !visited[idx - 1]) queue.push(idx - 1);
      if (px < width - 1 && !visited[idx + 1]) queue.push(idx + 1);
      if (py > 0 && !visited[idx - width]) queue.push(idx - width);
      if (py < height - 1 && !visited[idx + width]) queue.push(idx + width);
    } else if (isNearEdge(r, g, b)) {
      visited[idx] = 1; // edge feathering candidate
    }
  }
  
  // Fill output RGBA
  for (let i = 0; i < totalPixels; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];
    
    const outIdx = i * 4;
    
    if (visited[i] === 2) {
      // Fully transparent
      rgbaBuffer[outIdx] = 0;
      rgbaBuffer[outIdx + 1] = 0;
      rgbaBuffer[outIdx + 2] = 0;
      rgbaBuffer[outIdx + 3] = 0;
    } else if (visited[i] === 1) {
      // Smooth alpha feathering
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const alphaFactor = Math.max(0, Math.min(1, (255 - lum) / 30));
      const alpha = Math.round(alphaFactor * 255);
      
      // Defringe white
      const defringedR = Math.max(0, r - (255 - alpha));
      const defringedG = Math.max(0, g - (255 - alpha));
      const defringedB = Math.max(0, b - (255 - alpha));
      
      rgbaBuffer[outIdx] = defringedR;
      rgbaBuffer[outIdx + 1] = defringedG;
      rgbaBuffer[outIdx + 2] = defringedB;
      rgbaBuffer[outIdx + 3] = alpha;
    } else {
      // Fully opaque subject
      rgbaBuffer[outIdx] = r;
      rgbaBuffer[outIdx + 1] = g;
      rgbaBuffer[outIdx + 2] = b;
      rgbaBuffer[outIdx + 3] = 255;
    }
  }
  
  // Save as high-quality PNG with alpha channel
  await sharp(rgbaBuffer, {
    raw: {
      width,
      height,
      channels: 4,
    }
  })
  .png({ compressionLevel: 9 })
  .toFile(outputPath);
  
  console.log(`Successfully created transparent PNG: ${outputPath}`);
}

async function run() {
  const freshTodaySrc = "C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\ec949545-e762-49c8-92f9-d8464282dcff\\fresh_today_cutout_1790312964632.jpg";
  const indianAsianSrc = "C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\ec949545-e762-49c8-92f9-d8464282dcff\\indian_asian_cutout_1790312993731.jpg";
  
  const bannersDir = path.join(__dirname, "..", "public", "assets", "images", "banners");
  if (!fs.existsSync(bannersDir)) {
    fs.mkdirSync(bannersDir, { recursive: true });
  }
  
  const freshTodayOut = path.join(bannersDir, "fresh-today.png");
  const indianAsianOut = path.join(bannersDir, "indian-asian-grocery.png");
  
  await processImageToTransparentPNG(freshTodaySrc, freshTodayOut);
  await processImageToTransparentPNG(indianAsianSrc, indianAsianOut);
}

run().catch(console.error);
