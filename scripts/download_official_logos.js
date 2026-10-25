const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const LOGO_SOURCES = [
  {
    id: 'amul',
    name: 'Amul',
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Amul_official_logo.svg',
    filename: 'brand-amul.svg'
  },
  {
    id: 'haldirams',
    name: "Haldiram's",
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Haldiram%27s_Logo_SVG.svg',
    filename: 'brand-haldirams.svg'
  },
  {
    id: 'shan',
    name: 'Shan',
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Shan-Logo-PNG.png',
    filename: 'brand-shan.png'
  },
  {
    id: 'mdh',
    name: 'MDH',
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/MDH_spices_logo.png',
    filename: 'brand-mdh.png'
  },
  {
    id: 'heera',
    name: 'Heera',
    url: 'https://www.heerafoods.com/wp-content/uploads/2025/07/Heera-logo-with-drop-down-stripe_1.png',
    filename: 'brand-heera.png'
  },
  {
    id: 'natco',
    name: 'Natco',
    url: 'https://www.natcofoods.com/wp-content/uploads/2022/08/natco-logo.png',
    fallbackUrl: 'https://www.natcofoods.com/wp-content/themes/natco/images/logo.png',
    filename: 'brand-natco.png'
  },
  {
    id: 'tilda',
    name: 'Tilda',
    url: 'https://www.tilda.com/wp-content/themes/tilda/dist/images/logo.svg',
    fallbackUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Tilda_Logo.jpg',
    filename: 'brand-tilda.svg'
  },
  {
    id: 'trs',
    name: 'TRS',
    url: 'https://www.trs.co.uk/wp-content/themes/trs/assets/images/logo.svg',
    fallbackUrl: 'https://www.trs.co.uk/wp-content/uploads/2020/09/trs-logo.png',
    filename: 'brand-trs.svg'
  }
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'ShopperGroceryBot/1.0 (https://atlasgrocery.com; support@atlasgrocery.com) Mozilla/5.0'
      }
    }, (res) => {
      // Handle redirect
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          const u = new URL(url);
          redirectUrl = `${u.protocol}//${u.host}${redirectUrl}`;
        }
        return downloadFile(redirectUrl, dest).then(resolve).catch(reject);
      }
      
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: status ${res.statusCode}`));
      }
      
      const fileStream = fs.createWriteStream(dest);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(dest);
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error(`Timeout downloading ${url}`));
    });
  });
}

async function run() {
  const destDir = path.join(__dirname, '..', 'public', 'assets', 'images', 'brands');
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  for (const item of LOGO_SOURCES) {
    const dest = path.join(destDir, item.filename);
    try {
      console.log(`Downloading ${item.name} from ${item.url}...`);
      await downloadFile(item.url, dest);
      console.log(`✓ Saved ${item.filename}`);
    } catch (err) {
      console.warn(`Primary failed for ${item.name}: ${err.message}`);
      if (item.fallbackUrl) {
        try {
          console.log(`Trying fallback for ${item.name}: ${item.fallbackUrl}...`);
          const fallbackExt = path.extname(new URL(item.fallbackUrl).pathname) || '.png';
          const fallbackDest = path.join(destDir, `${path.parse(item.filename).name}${fallbackExt}`);
          await downloadFile(item.fallbackUrl, fallbackDest);
          console.log(`✓ Saved fallback ${fallbackDest}`);
        } catch (fbErr) {
          console.error(`✗ Fallback also failed for ${item.name}: ${fbErr.message}`);
        }
      }
    }
  }
}

run().catch(console.error);
