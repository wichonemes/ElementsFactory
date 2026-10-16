import { spawn } from 'child_process';
import fs from 'fs';

const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const outPath = 'C:/Users/OEM/.gemini/antigravity/brain/05377439-c343-40ff-84b3-b5985838fb3d/captura_ofertas_relampago_detalle.png';

async function main() {
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9223',
    '--user-data-dir=C:/Users/OEM/.gemini/antigravity/scratch/chrome_deals_temp',
    '--window-size=390,844',
    '--hide-scrollbars',
    'about:blank'
  ]);

  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 400));
    try {
      const res = await fetch('http://127.0.0.1:9223/json/version');
      if (res.ok) {
        const data = await res.json();
        wsUrl = data.webSocketDebuggerUrl;
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
  await new Promise(r => setTimeout(r, 3000));

  // Obtener posición del contenedor de Ofertas Relámpago
  const boxRes = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const el = document.querySelector('h3')?.closest('section');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    })()`
  });

  console.log('Posición Ofertas Relámpago:', boxRes?.value);
  if (boxRes?.value) {
    const clip = boxRes.value;
    const shot = await send('Page.captureScreenshot', {
      format: 'png',
      clip: {
        x: clip.x,
        y: clip.y,
        width: clip.width,
        height: clip.height,
        scale: 1
      }
    });
    fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
    console.log('¡Captura de detalle guardada!', fs.statSync(outPath).size, 'bytes');
  }

  ws.close();
  chromeProc.kill();
}

main();
