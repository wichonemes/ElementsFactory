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
  console.log('🚀 Iniciando Chrome Headless para auditar el Estudio Fotográfico...');
  const chromePath = findChromePath();
  if (!chromePath) throw new Error('Chrome no encontrado');

  const cdpPort = 9226;
  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${cdpPort}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1280,950',
    'http://localhost:5000'
  ]);

  await delay(2500);

  try {
    const listRes = await fetch(`http://localhost:${cdpPort}/json`);
    const pages = await listRes.json();
    const page = pages.find(p => p.type === 'page');
    if (!page) throw new Error('No se encontró página en CDP');

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

    console.log('🌐 Navegando a localhost:5000...');
    await send('Page.navigate', { url: 'http://localhost:5000' });
    await delay(2000);

    // Obtener token
    console.log('🔑 Obteniendo token de login...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'Artesano2026!' })
    });
    const loginData = await loginRes.json();
    console.log('Login OK:', !!loginData.token);

    if (loginData.token) {
      await send('Runtime.evaluate', {
        expression: `(() => {
          localStorage.setItem('artesano_admin_token', '${loginData.token}');
          localStorage.setItem('artesano_admin_user', JSON.stringify(${JSON.stringify(loginData.user)}));
        })()`
      });
    }

    // Abrir AdminPanel haciendo clic en botón Administración
    console.log('📂 Abriendo AdminPanel...');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const buttons = Array.from(document.querySelectorAll('button, a'));
        const adminBtn = buttons.find(b => b.textContent.includes('Administración') || b.textContent.includes('Admin'));
        if (adminBtn) adminBtn.click();
      })()`
    });
    await delay(2000);

    // Capturar pantalla del panel admin con el botón Estudio Fotográfico
    console.log('📸 Captura 1: Panel de Productos con botón Estudio 4 Fotos IA...');
    const shot1 = await send('Page.captureScreenshot', { format: 'png' });
    const shot1Path = path.join(baseArtifactDir, 'captura_admin_estudio_boton.png');
    fs.writeFileSync(shot1Path, Buffer.from(shot1.data, 'base64'));
    console.log('✅ Guardada:', shot1Path);

    // Clic en "Estudio 4 Fotos IA"
    console.log('🖱️ Haciendo clic en "Estudio 4 Fotos IA"...');
    const clickStudio = await send('Runtime.evaluate', {
      expression: `(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.textContent.includes('Estudio 4 Fotos IA'));
        if (btn) {
          btn.click();
          return { clicked: true, text: btn.textContent.trim() };
        }
        return { clicked: false, buttons: buttons.map(b => b.textContent.trim()).filter(Boolean).slice(0, 10) };
      })()`,
      returnByValue: true
    });
    console.log('Resultado del clic:', clickStudio.result.value);

    await delay(1500);

    // Capturar pantalla del modal de Estudio Fotográfico abierto
    console.log('📸 Captura 2: Modal de Estudio Fotográfico (4 tomas)...');
    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    const shot2Path = path.join(baseArtifactDir, 'captura_estudio_modal_abierto.png');
    fs.writeFileSync(shot2Path, Buffer.from(shot2.data, 'base64'));
    console.log('✅ Guardada:', shot2Path);

    // Verificar estructura del modal
    const modalAudit = await send('Runtime.evaluate', {
      expression: `(() => {
        const title = document.querySelector('h2')?.textContent || '';
        const buttons = Array.from(document.querySelectorAll('button'));
        const replaceBtns = buttons.filter(b => b.textContent.includes('Subir / Reemplazar'));
        const regenBtns = buttons.filter(b => b.textContent.includes('Regenerar toma'));
        const applyBtn = buttons.find(b => b.textContent.includes('Aplicar las 4'));
        const infoBtn = buttons.find(b => b.textContent.includes('Info & Costos'));

        return {
          title,
          replaceBtnsCount: replaceBtns.length,
          regenBtnsCount: regenBtns.length,
          hasApplyBtn: Boolean(applyBtn),
          hasInfoBtn: Boolean(infoBtn)
        };
      })()`,
      returnByValue: true
    });
    console.log('Auditoría del modal:', modalAudit.result.value);

    // Clic en "Info & Costos IA" para auditar la transparencia
    console.log('🖱️ Abriendo modal de Info & Costos IA...');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const infoBtn = buttons.find(b => b.textContent.includes('Info & Costos') || b.title?.includes('costos'));
        if (infoBtn) infoBtn.click();
      })()`
    });
    await delay(800);

    // Capturar popup de transparencia
    console.log('📸 Captura 3: Modal de Transparencia de Motores y Costos IA...');
    const shot3 = await send('Page.captureScreenshot', { format: 'png' });
    const shot3Path = path.join(baseArtifactDir, 'captura_estudio_info_costos.png');
    fs.writeFileSync(shot3Path, Buffer.from(shot3.data, 'base64'));
    console.log('✅ Guardada:', shot3Path);

    console.log('\n🎉 AUDITORÍA VISUAL DEL ESTUDIO FOTOGRÁFICO COMPLETADA CON ÉXITO!');
  } finally {
    chromeProc.kill();
  }
}

runAudit().catch(err => {
  console.error('Error en auditoría visual:', err);
  process.exit(1);
});
