import { spawn } from 'child_process';
import fs from 'fs';

const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const baseDir = 'C:/Users/OEM/.gemini/antigravity/brain/05377439-c343-40ff-84b3-b5985838fb3d';
const port = 9251;
const profileDir = 'C:/Users/OEM/.gemini/antigravity/scratch/chrome_arcade_playing_profile';

async function run() {
  console.log('Lanzando Chrome para capturar Arcade Jugando Móvil...');
  const proc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    '--window-size=390,844',
    '--hide-scrollbars',
    'about:blank'
  ]);

  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 400));
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json`);
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

  await send('Page.navigate', { url: 'http://localhost:5000' });
  await new Promise(r => setTimeout(r, 2000));

  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });

  // Abrir modal Arcade
  await send('Runtime.evaluate', {
    expression: `(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const arcadeBtn = buttons.find(b => b.textContent.includes('Arcade') || b.textContent.includes('🕹️'));
      if (arcadeBtn) arcadeBtn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1200));

  // Iniciar partida dando click en JUGAR AHORA
  await send('Runtime.evaluate', {
    expression: `(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const playBtn = buttons.find(b => b.textContent.includes('JUGAR AHORA'));
      if (playBtn) playBtn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1200));

  // Capturar vista jugando
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${baseDir}/captura_arcade_movil_jugando.png`, Buffer.from(shot.data, 'base64'));
  console.log('Captura jugando guardada en captura_arcade_movil_jugando.png');

  ws.close();
  proc.kill();
}

run().catch(console.error);
