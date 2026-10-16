import { spawn } from 'child_process';
import fs from 'fs';

const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const baseDir = 'C:/Users/OEM/.gemini/antigravity/brain/05377439-c343-40ff-84b3-b5985838fb3d';

async function run() {
  console.log('Lanzando Chrome headless...');
  const proc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9230',
    '--user-data-dir=C:/Users/OEM/.gemini/antigravity/scratch/chrome_shot_temp',
    '--window-size=390,844',
    '--hide-scrollbars',
    'about:blank'
  ]);

  let wsUrl = null;
  for (let i = 0; i < 25; i++) {
    await new Promise(r => setTimeout(r, 400));
    try {
      const res = await fetch('http://127.0.0.1:9230/json/version');
      if (res.ok) {
        const d = await res.json();
        wsUrl = d.webSocketDebuggerUrl;
        break;
      }
    } catch {}
  }

  if (!wsUrl) {
    console.error('No se pudo conectar a Chrome');
    proc.kill();
    return;
  }

  const ws = new WebSocket(wsUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const msgId = id++;
    const timer = setTimeout(() => {
      ws.removeEventListener('message', handler);
      reject(new Error('CDP timeout: ' + method));
    }, 10000);
    const handler = (evt) => {
      const data = JSON.parse(evt.data);
      if (data.id === msgId) {
        clearTimeout(timer);
        ws.removeEventListener('message', handler);
        if (data.error) reject(new Error(JSON.stringify(data.error)));
        else resolve(data.result);
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
  await new Promise(r => setTimeout(r, 3000));

  console.log('Haciendo clic en chip Paquetes...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('header button, header div button'));
      const b = btns.find(x => x.textContent.includes('Paquetes'));
      if (b) b.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1500));

  console.log('Tomando captura superior de Paquetes...');
  const s1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${baseDir}/captura_paquetes_movil_top.png`, Buffer.from(s1.data, 'base64'));
  console.log('Captura 1 guardada:', `${baseDir}/captura_paquetes_movil_top.png`);

  console.log('Haciendo scroll para ver los paquetes de Hogar y Negocios...');
  await send('Runtime.evaluate', {
    expression: `window.scrollBy({ top: 520, behavior: 'instant' })`
  });
  await new Promise(r => setTimeout(r, 1000));

  const s2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${baseDir}/captura_paquetes_movil_hogar.png`, Buffer.from(s2.data, 'base64'));
  console.log('Captura 2 guardada:', `${baseDir}/captura_paquetes_movil_hogar.png`);

  ws.close();
  proc.kill();
  console.log('Terminado exitosamente.');
}

run().catch(console.error);
