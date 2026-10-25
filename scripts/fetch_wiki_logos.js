const https = require('https');
const fs = require('fs');
const path = require('path');

const WIKI_TITLES = [
  { file: 'File:Amul_official_logo.svg', saveAs: 'brand-amul.svg' },
  { file: "File:Haldiram's_Logo_SVG.svg", saveAs: 'brand-haldirams.svg' },
  { file: 'File:MDH_spices_logo.png', saveAs: 'brand-mdh.png' },
  { file: 'File:Tilda_Logo.jpg', saveAs: 'brand-tilda.jpg' },
  { file: 'File:Shan-Logo-PNG.png', saveAs: 'brand-shan.png' },
];

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'ShopperGroceryApp/1.0 (https://atlasgrocery.com; support@atlasgrocery.com)'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'ShopperGroceryApp/1.0 (https://atlasgrocery.com; support@atlasgrocery.com)'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed with status ${res.statusCode}`));
      }
      const stream = fs.createWriteStream(dest);
      res.pipe(stream);
      stream.on('finish', () => {
        stream.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function run() {
  const destDir = path.join(__dirname, '..', 'public', 'assets', 'images', 'brands');
  
  for (const item of WIKI_TITLES) {
    try {
      const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(item.file)}&prop=imageinfo&iiprop=url&format=json`;
      console.log(`Querying Wikimedia API for ${item.file}...`);
      const res = await fetchJson(apiUrl);
      const pages = res.query?.pages;
      const pageKey = Object.keys(pages || {})[0];
      const directUrl = pages?.[pageKey]?.imageinfo?.[0]?.url;
      
      if (directUrl) {
        console.log(`Found direct URL: ${directUrl}`);
        const dest = path.join(destDir, item.saveAs);
        await downloadFile(directUrl, dest);
        console.log(`✓ Successfully downloaded ${item.saveAs}`);
      } else {
        console.warn(`No URL found for ${item.file}`);
      }
    } catch (err) {
      console.error(`Error processing ${item.file}:`, err.message);
    }
  }
}

run();
