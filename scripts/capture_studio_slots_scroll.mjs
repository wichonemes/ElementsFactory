import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function findChromePath() {
  const possiblePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

const baseArtifactDir = 'C:\\Users\\OEM\\.gemini\\antigravity\\brain\\05377439-c343-40ff-84b3-b5985838fb3d';

async function runAudit() {
  const chromePath = findChromePath();
  const cdpPort = 9227;
  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${cdpPort}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1280,1050',
    'http://localhost:5000'
  ]);

  await delay(2500);

  try {
    const listRes = await fetch(`http://localhost:${cdpPort}/json`);
    const pages = await listRes.json();
    const page = pages.find(p => p.type === 'page');

    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const msgId = id++;
      const handler = (evt) => {
        const data = JSON.parse(evt.data);
        if (data.id === msgId) {
          ws.removeEventListener('message', handler);
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Page.navigate', { url: 'http://localhost:5000' });
    await delay(1800);

    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'Artesano2026!' })
    });
    const loginData = await loginRes.json();

    if (loginData.token) {
      await send('Runtime.evaluate', {
        expression: `(() => {
          localStorage.setItem('artesano_admin_token', '${loginData.token}');
          localStorage.setItem('artesano_admin_user', JSON.stringify(${JSON.stringify(loginData.user)}));
        })()`
      });
    }

    await send('Runtime.evaluate', {
      expression: `(() => {
        const buttons = Array.from(document.querySelectorAll('button, a'));
        const adminBtn = buttons.find(b => b.textContent.includes('Administración') || b.textContent.includes('Admin'));
        if (adminBtn) adminBtn.click();
      })()`
    });
    await delay(1800);

    // Abrir estudio
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Estudio 4 Fotos IA'));
        if (btn) btn.click();
      })()`
    });
    await delay(1200);

    // Scroll down inside the modal
    await send('Runtime.evaluate', {
      expression: `(() => {
        const modalContainer = document.querySelector('.fixed.inset-0.z-50');
        if (modalContainer) {
          modalContainer.scrollTop = 700;
        }
      })()`
    });
    await delay(800);

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const shotPath = path.join(baseArtifactDir, 'captura_estudio_botones_reemplazo.png');
    fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
    console.log('✅ Captura de botones de reemplazo guardada:', shotPath);

  } finally {
    chromeProc.kill();
  }
}

runAudit().catch(console.error);
