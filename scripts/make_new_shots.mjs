import { spawn } from 'child_process';
import fs from 'fs';

const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const baseDir = 'C:/Users/OEM/.gemini/antigravity/brain/05377439-c343-40ff-84b3-b5985838fb3d';

async function run() {
  console.log('Lanzando Chrome para generar nuevas capturas...');
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9225',
    '--user-data-dir=C:/Users/OEM/.gemini/antigravity/scratch/chrome_fresh_temp',
    '--window-size=390,844',
    '--hide-scrollbars',
    'about:blank'
  ]);

  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 400));
    try {
      const res = await fetch('http://127.0.0.1:9225/json/version');
      if (res.ok) {
        const d = await res.json();
        wsUrl = d.webSocketDebuggerUrl;
        break;
      }
    } catch {}
  }

  if (!wsUrl) {
    console.error('No se pudo conectar a CDP');
    chromeProc.kill();
    return;
  }

  const ws = new WebSocket(wsUrl);
  await new Promise(r => ws.onopen = r);

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
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });

  console.log('Navegando a http://localhost:5000...');
  await send('Page.navigate', { url: 'http://localhost:5000' });
  await new Promise(r => setTimeout(r, 2500));

  // 1. Captura de Inicio Limpio (Sin círculos gigantes, sin caja amarilla gigante)
  console.log('Tomando captura de inicio limpio...');
  const s1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${baseDir}/captura_movil_pantalla_inicio.png`, Buffer.from(s1.data, 'base64'));

  // 2. Abrir Barra Lateral Deslizable (Sidebar Drawer)
  console.log('Abriendo barra lateral deslizable...');
  await send('Runtime.evaluate', {
    expression: 'document.querySelector("button[title=\'Abrir menú de herramientas\']")?.click() || document.querySelector("header button")?.click()'
  });
  await new Promise(r => setTimeout(r, 600));

  console.log('Tomando captura de barra lateral...');
  const s2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${baseDir}/captura_movil_drawer_lateral.png`, Buffer.from(s2.data, 'base64'));

  // 3. Cerrar drawer y scrollear para ver los productos con ofertas sutiles
  console.log('Cerrando drawer y scrolleando hacia productos...');
  await send('Runtime.evaluate', {
    expression: 'document.querySelector("aside button[title=\'Cerrar menú\']")?.click()'
  });
  await new Promise(r => setTimeout(r, 400));

  await send('Runtime.evaluate', {
    expression: 'window.scrollTo({ top: 320, behavior: "instant" })'
  });
  await new Promise(r => setTimeout(r, 600));

  console.log('Tomando captura del feed de productos...');
  const s3 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${baseDir}/captura_movil_feed_productos.png`, Buffer.from(s3.data, 'base64'));

  ws.close();
  chromeProc.kill();
  console.log('¡Todas las capturas se generaron con éxito!');
}

run();
