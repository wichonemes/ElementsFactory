const fs = require('fs');
const path = require('path');

async function getMakerWorldImages() {
  const models = [
    { code: 'T6', id: '2641589', name: 'Spiral Planter Skadis' },
    { code: 'T12', id: '1810947', name: 'Geometric Cable Holders' },
    { code: 'T37', id: '2087519', name: 'Modular Desk Organizer' },
    { code: 'T39', id: '3134067', name: 'NFC QR Smart Desk Command Center' }
  ];

  const results = {};

  for (const m of models) {
    try {
      const url = `https://makerworld.com/es/models/${m.id}`;
      console.log(`Fetching ${m.code}: ${url}...`);
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      const html = await res.text();
      
      const ogMatch = html.match(/<meta property="og:image" content="([^"]+)"/i) ||
                      html.match(/<meta name="twitter:image" content="([^"]+)"/i) ||
                      html.match(/"coverUrl":"([^"]+)"/i) ||
                      html.match(/https:\/\/[^"']+(?:bblmw\.com|makerworld)[^"']+\.(?:jpg|png|webp)/i);

      if (ogMatch) {
        const imgUrl = (ogMatch[1] || ogMatch[0]).replace(/\\u002F/g, '/');
        console.log(`SUCCESS ${m.code}: ${imgUrl}`);
        results[m.code] = imgUrl;

        // Download to artifacts directory
        const imgRes = await fetch(imgUrl);
        const buffer = Buffer.from(await imgRes.arrayBuffer());
        const ext = imgUrl.includes('.png') ? '.png' : imgUrl.includes('.webp') ? '.webp' : '.jpg';
        const targetPath = path.join('C:\\Users\\OEM\\.gemini\\antigravity\\brain\\05377439-c343-40ff-84b3-b5985838fb3d', `${m.code.toLowerCase()}_makerworld_ref${ext}`);
        fs.writeFileSync(targetPath, buffer);
        console.log(`Saved reference to: ${targetPath}`);
      } else {
        console.log(`NO IMAGE MATCH FOR ${m.code}`);
      }
    } catch (err) {
      console.error(`ERROR ${m.code}:`, err.message);
    }
  }
}

getMakerWorldImages();
