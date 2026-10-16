import { spawn } from 'child_process';
import fs from 'fs';

const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const baseDir = 'C:/Users/OEM/.gemini/antigravity/brain/05377439-c343-40ff-84b3-b5985838fb3d';

async function run() {
  console.log('Lanzando Chrome para capturar Paquetes móvil...');
  const proc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9235',
    '--user-data-dir=C:/Users/OEM/.gemini/antigravity/scratch/chrome_pkg_final',
    '--window-size=390,844',
    '--hide-scrollbars',
    'about:blank'
  ]);

  let wsUrl = null;
  for (let i = 0; i < 25; i++) {
    await new Promise(r => setTimeout(r, 400));
    try {
      const res = await fetch('http://127.0.0.1:9235/json');
      if (res.ok) {
        const pages = await res.json();
        const page = pages.find(p => p.type === 'page');
        if (page && page.webSocketDebuggerUrl) {
          wsUrl = page.webSocketDebuggerUrl;
          break;
        }
      }
    } catch {}
  }

  if (!wsUrl) {
    console.error('No se pudo encontrar página en CDP');
    proc.kill();
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

  console.log('Haciendo clic en el chip de Paquetes...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('header button, header div button'));
      const b = btns.find(x => x.textContent.includes('Paquetes'));
      if (b) b.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1200));

  console.log('Capturando parte superior limpia (Header + Patch Bar VIP)...');
  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  if (shot1 && shot1.data) {
    fs.writeFileSync(`${baseDir}/captura_paquetes_movil_top.png`, Buffer.from(shot1.data, 'base64'));
    console.log('Captura 1 guardada:', `${baseDir}/captura_paquetes_movil_top.png`);
  }

  console.log('Haciendo scroll a los paquetes de Hogar y Negocios...');
  await send('Runtime.evaluate', {
    expression: `window.scrollBy({ top: 580, behavior: 'instant' })`
  });
  await new Promise(r => setTimeout(r, 800));

  const shot2 = await send('Page.captureScreenshot', { format: 'png' });
  if (shot2 && shot2.data) {
    fs.writeFileSync(`${baseDir}/captura_paquetes_movil_hogar.png`, Buffer.from(shot2.data, 'base64'));
    console.log('Captura 2 guardada:', `${baseDir}/captura_paquetes_movil_hogar.png`);
  }

  ws.close();
  proc.kill();
  console.log('Completado con éxito.');
}

run().catch(console.error);
