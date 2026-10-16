import { spawn } from 'child_process';
import fs from 'fs';

const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const outPath = 'C:/Users/OEM/.gemini/antigravity/brain/05377439-c343-40ff-84b3-b5985838fb3d/captura_movil_barra_lateral.png';

async function run() {
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9226',
    '--user-data-dir=C:/Users/OEM/.gemini/antigravity/scratch/chrome_drawer_temp',
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

  await send('Page.navigate', { url: 'http://localhost:5000' });
  await new Promise(r => setTimeout(r, 2500));

  // Abrir barra lateral (drawer)
  await send('Runtime.evaluate', {
    expression: 'document.querySelector("button[title=\'Abrir menú de herramientas\']")?.click() || document.querySelectorAll("header button")[0]?.click()'
  });
  await new Promise(r => setTimeout(r, 800));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  console.log('Raw shot keys:', Object.keys(shot || {}));
  const data = shot?.data || shot?.result?.data;
  console.log('Shot recibido:', !!data);
  if (data) {
    fs.writeFileSync(outPath, Buffer.from(data, 'base64'));
    console.log('Captura de barra lateral guardada:', fs.statSync(outPath).size, 'bytes');
  }

  ws.close();
  chromeProc.kill();
}

run();
