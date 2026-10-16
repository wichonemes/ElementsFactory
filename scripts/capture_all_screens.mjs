import { spawn } from 'child_process';
import fs from 'fs';

const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const outDir = 'C:/Users/OEM/.gemini/antigravity/brain/05377439-c343-40ff-84b3-b5985838fb3d';

async function main() {
  console.log('Lanzando Chrome headless con puerto de depuración 9222...');
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9222',
    '--window-size=390,844',
    '--hide-scrollbars',
    'about:blank'
  ]);

  // Esperar a que Chrome esté listo
  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 400));
    try {
      const res = await fetch('http://127.0.0.1:9222/json/version');
      if (res.ok) {
        const data = await res.json();
        wsUrl = data.webSocketDebuggerUrl;
        console.log('Chrome conectado:', wsUrl);
        break;
      }
    } catch {}
  }

  if (!wsUrl) {
    throw new Error('No se pudo conectar a Chrome DevTools en puerto 9222');
  }

  try {
    const ws = new WebSocket(wsUrl);
    await new Promise((resolve) => ws.onopen = resolve);

    let id = 1;
    const send = (method, params = {}) => new Promise((resolve) => {
      const msgId = id++;
      const handler = (evt) => {
        const data = JSON.parse(evt.data);
        if (data.id === msgId) {
          ws.removeEventListener('message', handler);
          resolve(data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });

    await send('Page.enable');
    await send('Runtime.enable');

    // Configurar viewport móvil iPhone / Android moderno
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });

    console.log('Navegando a http://localhost:5000...');
    await send('Page.navigate', { url: 'http://localhost:5000' });
    await new Promise(r => setTimeout(r, 2500));

    // Captura 1: Inicio (Cabecera ML + Banners + Ofertas Flash)
    console.log('Capturando Pantalla 1: Inicio Móvil...');
    const shot1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`${outDir}/captura_movil_1_inicio.png`, Buffer.from(shot1.data, 'base64'));

    // Scroll hacia productos
    console.log('Scrolleando hacia la sección de productos...');
    await send('Runtime.evaluate', {
      expression: 'window.scrollTo({ top: 480, behavior: "instant" })'
    });
    await new Promise(r => setTimeout(r, 600));

    // Captura 2: Cuadrícula de productos móvil 2 columnas
    console.log('Capturando Pantalla 2: Cuadrícula de Productos...');
    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`${outDir}/captura_movil_2_productos.png`, Buffer.from(shot2.data, 'base64'));

    // Abrir Modal de Categorías Master-Detail
    console.log('Abriendo modal de Categorías...');
    await send('Runtime.evaluate', {
      expression: 'document.querySelectorAll("button").forEach(b => { if (b.innerText.includes("Categorías")) b.click(); })'
    });
    await new Promise(r => setTimeout(r, 800));

    // Captura 3: Modal Categorías Master-Detail
    console.log('Capturando Pantalla 3: Categorías Master-Detail...');
    const shot3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`${outDir}/captura_movil_3_categorias.png`, Buffer.from(shot3.data, 'base64'));

    // Cerrar modal de categorías y abrir Menú Más
    console.log('Abriendo Menú Más...');
    await send('Runtime.evaluate', {
      expression: 'document.querySelectorAll("button").forEach(b => { if (b.innerText.includes("Más")) b.click(); })'
    });
    await new Promise(r => setTimeout(r, 800));

    // Captura 4: Menú Más
    console.log('Capturando Pantalla 4: Menú Más...');
    const shot4 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`${outDir}/captura_movil_4_menu_mas.png`, Buffer.from(shot4.data, 'base64'));

    console.log('¡Todas las capturas se generaron con éxito!');
    ws.close();
  } catch (err) {
    console.error('Error durante la captura:', err);
  } finally {
    chromeProc.kill();
  }
}

main();
