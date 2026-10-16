import { spawn } from 'child_process';
import fs from 'fs';

const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const baseDir = 'C:/Users/OEM/.gemini/antigravity/brain/05377439-c343-40ff-84b3-b5985838fb3d';
const port = 9246;
const profileDir = 'C:/Users/OEM/.gemini/antigravity/scratch/chrome_stock_profile';

async function run() {
  console.log('Lanzando Chrome para capturar Stock Móvil...');
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

  console.log('Navegando y logueando...');
  await send('Page.navigate', { url: 'http://localhost:5000' });
  await new Promise(r => setTimeout(r, 2000));

  await send('Runtime.evaluate', {
    expression: `(async () => {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'admin', password: 'Artesano2026!' })
        });
        const data = await res.json();
        if (data.token) {
          localStorage.setItem('artesano_admin_token', data.token);
          localStorage.setItem('artesano_admin_user', JSON.stringify(data.user));
        }
      } catch (e) {
        console.error(e);
      }
    })()`,
    awaitPromise: true
  });
  await new Promise(r => setTimeout(r, 500));

  await send('Page.navigate', { url: 'http://localhost:5000' });
  await new Promise(r => setTimeout(r, 2000));

  // Simular viewport móvil (iPhone 14 / Samsung Galaxy)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });

  // Abrir panel admin
  console.log('Abriendo panel admin...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      // Si estamos en movil, abrir drawer o botón de admin
      const adminBtns = Array.from(document.querySelectorAll('button')).filter(b => 
        b.title === 'Panel de Administración' || 
        b.textContent.includes('Admin') ||
        b.textContent.includes('Administración')
      );
      if (adminBtns.length > 0) adminBtns[0].click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1200));

  // Clic en Stock Insumos
  console.log('Navegando a Stock Insumos...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const stockBtn = buttons.find(b => 
        b.textContent.includes('Stock Insumos') || 
        b.textContent.includes('Insumos & Stock')
      );
      if (stockBtn) stockBtn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1200));

  // 1. Captura superior (Header, carrusel de diagnóstico, técnicas, buscador)
  const shotTop = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${baseDir}/captura_stock_movil_arriba_resuelto.png`, Buffer.from(shotTop.data, 'base64'));
  console.log('Captura superior guardada en captura_stock_movil_arriba_resuelto.png');

  // 2. Scroll hacia las tarjetas móviles
  console.log('Haciendo scroll hacia las tarjetas móviles de insumos...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const mobCards = document.querySelector('.md\\\\:hidden.divide-y') || document.querySelector('[class*="md:hidden divide-y"]');
      if (mobCards) {
        mobCards.scrollIntoView({ behavior: 'instant', block: 'start' });
        return 'cards found and scrolled';
      }
      const firstCard = document.querySelector('[key*="mob-"]') || document.querySelector('[class*="p-3.5 space-y-3"]');
      if (firstCard) {
        firstCard.scrollIntoView({ behavior: 'instant', block: 'start' });
        return 'firstCard found and scrolled';
      }
      return 'neither found';
    })()`,
    returnByValue: true
  });
  await new Promise(r => setTimeout(r, 1000));

  // Tomar captura de tarjetas
  const shotCards = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${baseDir}/captura_stock_movil_tarjetas_resuelto.png`, Buffer.from(shotCards.data, 'base64'));
  console.log('Captura de tarjetas guardada en captura_stock_movil_tarjetas_resuelto.png');

  ws.close();
  proc.kill();
}

run().catch(console.error);
