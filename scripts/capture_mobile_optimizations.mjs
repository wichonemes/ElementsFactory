import { spawn } from 'child_process';
import fs from 'fs';

const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const baseDir = 'C:/Users/OEM/.gemini/antigravity/brain/05377439-c343-40ff-84b3-b5985838fb3d';

async function run() {
  console.log('Lanzando Chrome para capturar optimizaciones móviles...');
  const proc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9238',
    '--user-data-dir=C:/Users/OEM/.gemini/antigravity/scratch/chrome_opt_mobile',
    '--window-size=390,844',
    '--hide-scrollbars',
    'about:blank'
  ]);

  let wsUrl = null;
  for (let i = 0; i < 25; i++) {
    await new Promise(r => setTimeout(r, 400));
    try {
      const res = await fetch('http://127.0.0.1:9238/json');
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
  await new Promise(r => setTimeout(r, 3000));

  // 1. Captura del Banner de Oferta Flash Discreto
  console.log('Capturando banner de oferta flash discreto en móvil...');
  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  if (shot1 && shot1.data) {
    fs.writeFileSync(`${baseDir}/captura_oferta_flash_discreta.png`, Buffer.from(shot1.data, 'base64'));
    console.log('Captura 1 guardada:', `${baseDir}/captura_oferta_flash_discreta.png`);
  }

  // 2. Abrir Arcade y capturar Controles Virtuales y Rotación
  console.log('Abriendo Arcade Modal...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      // Buscar botón de Arcade en barra lateral o navbar
      const btns = Array.from(document.querySelectorAll('button, a'));
      const arcadeBtn = btns.find(b => b.textContent.includes('Arcade') || b.title?.includes('Arcade') || b.getAttribute('aria-label')?.includes('Arcade'));
      if (arcadeBtn) {
        arcadeBtn.click();
      } else {
        // Fallback: abrir modal de arcade directamente si hay evento
        window.dispatchEvent(new CustomEvent('open-arcade'));
      }
    })()`
  });
  await new Promise(r => setTimeout(r, 1500));

  // Iniciar partida para ver los controles virtuales en pantalla
  console.log('Iniciando partida en Arcade para visualizar controles táctiles...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const playBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('JUGAR AHORA') || b.textContent.includes('Jugar'));
      if (playBtn) playBtn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1200));

  const shot2 = await send('Page.captureScreenshot', { format: 'png' });
  if (shot2 && shot2.data) {
    fs.writeFileSync(`${baseDir}/captura_arcade_movil_controles.png`, Buffer.from(shot2.data, 'base64'));
    console.log('Captura 2 guardada:', `${baseDir}/captura_arcade_movil_controles.png`);
  }

  // Cerrar arcade
  await send('Runtime.evaluate', {
    expression: `(() => {
      const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.querySelector('svg.lucide-x') || b.getAttribute('aria-label') === 'Cerrar');
      if (closeBtn) closeBtn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 800));

  // 3. Abrir Panel de Administración en móvil y loguearse vía API
  console.log('Autenticando como administrador...');
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
  await new Promise(r => setTimeout(r, 800));

  console.log('Abriendo Panel de Administración con sesión iniciada...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const adminBtn = Array.from(document.querySelectorAll('button, a')).find(b => b.textContent.includes('Admin') || b.title?.includes('Admin') || b.title?.includes('Administración'));
      if (adminBtn) adminBtn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 2500));

  const shot3 = await send('Page.captureScreenshot', { format: 'png' });
  if (shot3 && shot3.data) {
    fs.writeFileSync(`${baseDir}/captura_admin_panel_movil.png`, Buffer.from(shot3.data, 'base64'));
    console.log('Captura 3 guardada:', `${baseDir}/captura_admin_panel_movil.png`);
  }

  ws.close();
  proc.kill();
  console.log('Capturas completadas con éxito.');
}

run().catch(console.error);
