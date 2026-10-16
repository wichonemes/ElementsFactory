import { spawn } from 'child_process';
import fs from 'fs';

const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const baseDir = 'C:/Users/OEM/.gemini/antigravity/brain/05377439-c343-40ff-84b3-b5985838fb3d';
const port = 9245;
const profileDir = 'C:/Users/OEM/.gemini/antigravity/scratch/chrome_coupons_profile';

async function run() {
  console.log('Lanzando Chrome para capturar módulo de cupones...');
  const proc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    '--window-size=1280,900',
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

  // Autenticar por API para guardar token en localStorage
  console.log('Navegando a la aplicación...');
  await send('Page.navigate', { url: 'http://localhost:5000' });
  await new Promise(r => setTimeout(r, 2000));

  console.log('Iniciando sesión como admin y preparando carrito...');
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

      // Preparar carrito con productos y cupón activo
      localStorage.setItem('artesano_active_coupon', 'BIENVENIDO');
      localStorage.setItem('artesano_cart_items', JSON.stringify([
        {
          product: {
            id: 'colgador-llaves-l14',
            code: 'L14',
            name: 'Colgador de llaves Bienvenidos',
            price: 199,
            priceUnit: 'pieza',
            priceType: 'starting_at'
          },
          quantity: 2,
          selectedVariants: { 'Tono de madera': 'Natural claro' },
          customText: 'Familia Ramírez'
        }
      ]));
    })()`,
    awaitPromise: true
  });
  await new Promise(r => setTimeout(r, 600));

  // Recargar página para tomar los datos de localStorage limpiamente
  await send('Page.navigate', { url: 'http://localhost:5000' });
  await new Promise(r => setTimeout(r, 2000));

  // Cerrar cualquier modal que pudiera estar abierto por defecto
  await send('Runtime.evaluate', {
    expression: `(() => {
      document.querySelectorAll('.lucide-x').forEach(el => el.closest('button')?.click());
    })()`
  });
  await new Promise(r => setTimeout(r, 500));

  // 1. CAPTURA ESCRITORIO: Panel Admin -> Cupones
  console.log('1. Capturando Panel Admin Cupones en Escritorio...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  await send('Runtime.evaluate', {
    expression: `(() => {
      const adminBtn = Array.from(document.querySelectorAll('button')).find(b => b.title === 'Panel de Administración' || (b.textContent.includes('Administración') && !b.textContent.includes('Arcade')));
      if (adminBtn) adminBtn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1200));

  await send('Runtime.evaluate', {
    expression: `(() => {
      const couponsTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Cupones & Descuentos') || (b.textContent.includes('Cupones') && b.textContent.includes('🎟️')));
      if (couponsTab) couponsTab.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 2000));

  const shotDesktop = await send('Page.captureScreenshot', { format: 'png' });
  if (shotDesktop && shotDesktop.data) {
    fs.writeFileSync(`${baseDir}/captura_admin_cupones_escritorio.png`, Buffer.from(shotDesktop.data, 'base64'));
    console.log('Captura 1 guardada:', `${baseDir}/captura_admin_cupones_escritorio.png`);
  }

  // 2. CAPTURA MÓVIL: Panel Admin -> Cupones en Celular (390x844)
  console.log('2. Capturando Panel Admin Cupones en Celular (390x844)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await new Promise(r => setTimeout(r, 1000));

  await send('Runtime.evaluate', {
    expression: `(() => {
      const couponsChip = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Cupones') && b.textContent.includes('🎟️'));
      if (couponsChip) couponsChip.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1500));

  const shotMobile = await send('Page.captureScreenshot', { format: 'png' });
  if (shotMobile && shotMobile.data) {
    fs.writeFileSync(`${baseDir}/captura_admin_cupones_movil.png`, Buffer.from(shotMobile.data, 'base64'));
    console.log('Captura 2 guardada:', `${baseDir}/captura_admin_cupones_movil.png`);
  }

  // 3. CAPTURA MÓVIL: Carrito de Compras con Cupón Aplicado y Badge de Tipo
  console.log('3. Capturando Carrito de Compras con Cupón Aplicado...');
  // Cerrar panel admin
  await send('Runtime.evaluate', {
    expression: `(() => {
      const closeBtn = document.querySelector('button[title*="Cerrar"]') || document.querySelector('button .lucide-x')?.closest('button');
      if (closeBtn) closeBtn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 800));

  // Abrir carrito clikeando en el botón de carrito inferior o superior
  await send('Runtime.evaluate', {
    expression: `(() => {
      const cartBtn = document.querySelector('button[aria-label*="carrito"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Carrito') || b.querySelector('.lucide-shopping-bag'));
      if (cartBtn) cartBtn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1500));

  const shotCart = await send('Page.captureScreenshot', { format: 'png' });
  if (shotCart && shotCart.data) {
    fs.writeFileSync(`${baseDir}/captura_carrito_cupon_movil.png`, Buffer.from(shotCart.data, 'base64'));
    console.log('Captura 3 guardada:', `${baseDir}/captura_carrito_cupon_movil.png`);
  }

  ws.close();
  proc.kill();
  console.log('Capturas del módulo de cupones finalizadas con éxito.');
}

run().catch(console.error);
