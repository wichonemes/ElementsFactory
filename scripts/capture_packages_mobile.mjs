import { spawn } from 'child_process';
import fs from 'fs';

const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const baseDir = 'C:/Users/OEM/.gemini/antigravity/brain/05377439-c343-40ff-84b3-b5985838fb3d';

async function run() {
  console.log('Lanzando Chrome para capturar vista móvil de Paquetes...');
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9226',
    '--user-data-dir=C:/Users/OEM/.gemini/antigravity/scratch/chrome_pkg_temp',
    '--window-size=390,844',
    '--hide-scrollbars',
    'about:blank'
  ]);

  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 400));
    try {
      const res = await fetch('http://127.0.0.1:9226/json/version');
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

  let msgId = 1;
  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = msgId++;
      const handler = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');

  // Device emulation iPhone 14 Pro
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true });

  await send('Page.navigate', { url: 'http://localhost:5000' });
  await new Promise(r => setTimeout(r, 2500));

  // Click on "Paquetes" chip in header
  console.log('Haciendo clic en chip de Paquetes...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const buttons = Array.from(document.querySelectorAll('header button'));
      const pkgBtn = buttons.find(b => b.textContent.includes('Paquetes'));
      if (pkgBtn) pkgBtn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1200));

  // Capture top view of Paquetes (Header compacto + Patch Bar destacado)
  console.log('Capturando pantalla superior de Paquetes...');
  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  if (shot1 && shot1.data) {
    fs.writeFileSync(`${baseDir}/captura_paquetes_movil_top.png`, Buffer.from(shot1.data, 'base64'));
    console.log('Captura 1 guardada: captura_paquetes_movil_top.png');
  }

  // Scroll down to see the packages
  console.log('Desplazando hacia los paquetes de Hogar y Negocios...');
  await send('Runtime.evaluate', {
    expression: `window.scrollBy({ top: 480, behavior: 'instant' })`
  });
  await new Promise(r => setTimeout(r, 800));

  const shot2 = await send('Page.captureScreenshot', { format: 'png' });
  if (shot2 && shot2.data) {
    fs.writeFileSync(`${baseDir}/captura_paquetes_movil_hogar.png`, Buffer.from(shot2.data, 'base64'));
    console.log('Captura 2 guardada: captura_paquetes_movil_hogar.png');
  }

  ws.close();
  chromeProc.kill();
  console.log('Listo.');
}

run().catch(console.error);
