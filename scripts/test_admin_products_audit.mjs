import { spawn } from 'child_process';
import fs from 'fs';

const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const baseDir = 'C:/Users/OEM/.gemini/antigravity/brain/05377439-c343-40ff-84b3-b5985838fb3d';
const port = 9253;
const profileDir = 'C:/Users/OEM/.gemini/antigravity/scratch/chrome_test_admin_products';

async function run() {
  console.log('Lanzando Chrome para auditar área de productos...');
  const proc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    '--window-size=1280,800',
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
    console.error('No se pudo conectar a Chrome');
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

  const consoleLogs = [];
  ws.addEventListener('message', (evt) => {
    const data = JSON.parse(evt.data);
    if (data.method === 'Runtime.consoleAPICalled') {
      consoleLogs.push({ type: data.params.type, args: data.params.args.map(a => a.value || a.description) });
    }
    if (data.method === 'Runtime.exceptionThrown') {
      consoleLogs.push({ type: 'EXCEPTION', text: data.params.exceptionDetails.text, exception: data.params.exceptionDetails.exception?.description });
    }
  });

  await send('Page.enable');
  await send('Runtime.enable');

  console.log('Navegando a localhost:5000...');
  await send('Page.navigate', { url: 'http://localhost:5000' });
  await new Promise(r => setTimeout(r, 2000));

  // Inyectar login en localStorage para acceder directamente al AdminPanel
  console.log('Obteniendo token de login...');
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'Artesano2026!' })
  });
  const loginData = await loginRes.json();
  console.log('Login status:', loginRes.status, 'Token recibido:', !!loginData.token);

  if (loginData.token) {
    await send('Runtime.evaluate', {
      expression: `(() => {
        localStorage.setItem('artesano_admin_token', '${loginData.token}');
        localStorage.setItem('artesano_admin_user', JSON.stringify(${JSON.stringify(loginData.user)}));
      })()`
    });
  }

  // Abrir AdminPanel haciendo clic en el botón de admin en el footer o disparando estado
  console.log('Abriendo AdminPanel...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      const adminBtn = buttons.find(b => b.textContent.includes('Admin') || b.textContent.includes('Acceso') || b.textContent.includes('Taller'));
      if (adminBtn) adminBtn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1500));

  // Tomar captura del AdminPanel
  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${baseDir}/captura_admin_audit_1.png`, Buffer.from(shot.data, 'base64'));

  // Evaluar estado de botones en la pestaña de productos
  const btnAudit = await send('Runtime.evaluate', {
    expression: `(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const newProdBtn = buttons.find(b => b.textContent.includes('Nuevo Producto'));
      const editBtns = buttons.filter(b => b.textContent.includes('Editar'));
      const areaBtns = buttons.filter(b => b.textContent.includes('Hogar') || b.textContent.includes('Negocios'));
      return {
        totalButtons: buttons.length,
        hasNewProdBtn: !!newProdBtn,
        newProdText: newProdBtn ? newProdBtn.innerText : null,
        editBtnsCount: editBtns.length,
        areaBtnsCount: areaBtns.length
      };
    })()`,
    returnByValue: true
  });
  console.log('Auditoría de botones:', btnAudit.result?.value);

  // Intentar hacer clic en "Nuevo Producto"
  console.log('Haciendo clic en "Nuevo Producto"...');
  const clickResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const newProdBtn = buttons.find(b => b.textContent.includes('Nuevo Producto'));
      if (newProdBtn) {
        newProdBtn.click();
        return 'Clicked Nuevo Producto';
      }
      return 'Nuevo Producto not found';
    })()`,
    returnByValue: true
  });
  console.log('Resultado del click:', clickResult.result?.value);
  await new Promise(r => setTimeout(r, 1000));

  // Verificar si se abrió el modal de editor
  const editorModalState = await send('Runtime.evaluate', {
    expression: `(() => {
      const modal = document.querySelector('form');
      const titles = Array.from(document.querySelectorAll('h3')).map(h => h.innerText);
      const inputs = Array.from(document.querySelectorAll('input')).map(i => i.placeholder || i.name || i.value);
      return {
        hasForm: !!modal,
        titles,
        inputCount: inputs.length
      };
    })()`,
    returnByValue: true
  });
  console.log('Estado del editor modal:', editorModalState.result?.value);

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${baseDir}/captura_admin_audit_2.png`, Buffer.from(shot.data, 'base64'));

  console.log('Logs capturados:', consoleLogs);

  ws.close();
  proc.kill();
}

run().catch(console.error);
