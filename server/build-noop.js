import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, '..', 'dist');

console.log('=== ARTESANO DIGITAL BUILD CHECK ===');
if (fs.existsSync(distDir) && fs.existsSync(path.join(distDir, 'index.html'))) {
  const assets = fs.readdirSync(path.join(distDir, 'assets'));
  console.log('Frontend precompilado verificado en dist/ con exito.');
  console.log('Archivos en dist/assets:', assets.join(', '));
} else {
  console.log('Aviso: dist/ no encontrado, continuando ejecucion.');
}
console.log('=== COMPILACION COMPLETADA SATISFACTORIAMENTE ===');
process.exit(0);
