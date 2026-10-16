import { execFileSync } from 'child_process';
import fs from 'fs';

const baseDir = 'C:/Users/OEM/.gemini/antigravity/brain/05377439-c343-40ff-84b3-b5985838fb3d';
const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

function capture(name, width, height, url) {
  const outPath = `${baseDir}/${name}`;
  const args = [
    '--headless=new',
    '--disable-gpu',
    `--window-size=${width},${height}`,
    '--virtual-time-budget=5000',
    `--screenshot=${outPath}`,
    url
  ];
  console.log(`Capturando ${name} (${width}x${height})...`);
  execFileSync(chromePath, args);
  console.log(`Listo: ${name} (${fs.statSync(outPath).size} bytes)`);
}

// 1. Pantalla Inicial en Celular (iPhone / Galaxy viewport 390x844)
capture('captura_movil_pantalla_inicio.png', 390, 844, 'http://localhost:5000');

// 2. Vista extendida completa
capture('captura_movil_pantalla_completa.png', 390, 1600, 'http://localhost:5000');
