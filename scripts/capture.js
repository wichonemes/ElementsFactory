import { execFileSync } from 'child_process';
import fs from 'fs';

const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const baseDir = 'C:/Users/OEM/.gemini/antigravity/brain/05377439-c343-40ff-84b3-b5985838fb3d';

function takeShot(filename, width, height, url = 'http://localhost:5000') {
  const outPath = `${baseDir}/${filename}`;
  const args = [
    '--headless=new',
    '--disable-gpu',
    `--window-size=${width},${height}`,
    '--virtual-time-budget=5000',
    `--screenshot=${outPath}`,
    url
  ];
  console.log(`Generando ${filename}...`);
  execFileSync(chromePath, args);
  console.log(`Listo: ${filename} (${fs.statSync(outPath).size} bytes)`);
}

// 1. Pantalla Inicial Limpia en Celular (390 x 844)
takeShot('captura_movil_pantalla_inicio.png', 390, 844);

// 2. Barra Lateral Deslizable Abierta (390 x 844)
takeShot('captura_movil_barra_lateral.png', 390, 844, 'http://localhost:5000/?menu=1');

// 3. Vista Completa del Feed de Productos (390 x 1500)
takeShot('captura_movil_pantalla_completa.png', 390, 1500);
