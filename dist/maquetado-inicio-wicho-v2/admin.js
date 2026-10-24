(() => {
  const KEY = 'wicho-home-admin-v2';
  const TOKEN_KEY = 'artesano_admin_token';
  const slots = {
    'hero-cover': 'Portada superior',
    'profile-photo': 'Foto de perfil',
    'logo-site': 'Logo junto a Wicho Nemes',
    'area-identidad': 'Identidad corporativa',
    'area-audiovisual': 'Audiovisual',
    'area-animacion': 'Animación',
    'area-ilustracion': 'Ilustración',
    'area-modelado': 'Modelado 3D',
    'area-ux': 'Diseño de interfaces',
    'area-impresos': 'Medios impresos',
    'area-editorial': 'Diseño editorial',
    'project-artesano': 'Imagen o logo · Artesano Digital',
    'project-civil': 'Imagen o logo · Civil Armory',
    'project-popol': 'Imagen o logo · Popol Vuh',
    'project-cafe': 'Imagen o logo · Café San Luis'
  };

  const groups = {
    'Portada e identidad': ['hero-cover', 'profile-photo', 'logo-site'],
    'Portadas de cada área': [
      'area-identidad', 'area-audiovisual', 'area-animacion', 'area-ilustracion',
      'area-modelado', 'area-ux', 'area-impresos', 'area-editorial'
    ],
    'Imágenes de proyectos destacados': [
      'project-artesano', 'project-civil', 'project-popol', 'project-cafe'
    ]
  };

  const panel = document.getElementById('adminPanel');
  const backdrop = document.getElementById('adminBackdrop');
  const toggle = document.getElementById('adminToggle');
  const status = document.getElementById('adminStatus');
  const login = document.getElementById('adminLogin');
  const loginForm = document.getElementById('adminLoginForm');
  const loginUser = document.getElementById('adminUser');
  const loginPass = document.getElementById('adminPass');
  const loginError = document.getElementById('adminLoginError');
  const loginClose = document.getElementById('adminLoginClose');
  const loginSubmit = document.getElementById('adminLoginSubmit');
  const logout = document.getElementById('adminLogout');
  const saveServerBtn = document.getElementById('saveServerConfig');

  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {};
  } catch {
    saved = {};
  }

  function say(text) {
    if (status) status.textContent = text;
  }

  function apply(slot, src) {
    document.querySelectorAll(`[data-image-slot="${slot}"]`).forEach(img => {
      img.src = src;
      img.hidden = false;
    });
    if (slot === 'logo-site') {
      const fb = document.querySelector('.logo-fallback');
      if (fb) fb.hidden = true;
    }
    if (slot === 'area-animacion' || slot === 'area-modelado') {
      const placeholder = document.querySelector(`[data-placeholder="${slot}"]`);
      if (placeholder) placeholder.hidden = true;
    }
  }

  function applyAll() {
    Object.entries(saved).forEach(([slot, src]) => {
      if (slots[slot] && typeof src === 'string') apply(slot, src);
    });
  }

  // Cargar estado inicial local
  applyAll();

  // Sincronizar con el servidor en segundo plano
  async function syncWithServer() {
    try {
      const res = await fetch('/api/portfolio/config');
      if (res.ok) {
        const data = await res.json();
        if (data && data.slots && typeof data.slots === 'object' && Object.keys(data.slots).length > 0) {
          saved = { ...saved, ...data.slots };
          try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch {}
          applyAll();
        }
      }
    } catch (e) {
      console.warn('Sincronización inicial con servidor:', e);
    }
  }
  syncWithServer();

  function getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || '';
    } catch {
      return '';
    }
  }

  function setToken(token) {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch {}
  }

  async function checkAuth() {
    const token = getToken();
    if (!token) return false;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.ok;
    } catch {
      return true; // En caso de desconexión momentánea, no expulsar
    }
  }

  async function open() {
    const authed = await checkAuth();
    if (!authed) {
      openLogin();
      return;
    }
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    backdrop.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
  }

  function close() {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    backdrop.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
  }

  function openLogin() {
    login.hidden = false;
    login.setAttribute('aria-hidden', 'false');
    loginError.hidden = true;
    loginError.textContent = 'Usuario o contraseña incorrectos.';
    loginForm.reset();
    loginSubmit.disabled = false;
    loginSubmit.textContent = 'Entrar';
    document.body.classList.add('login-open');
    setTimeout(() => loginUser.focus(), 40);
  }

  function closeLogin(restoreFocus = true) {
    login.hidden = true;
    login.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('login-open');
    if (restoreFocus) toggle.focus({ preventScroll: true });
  }

  async function submitLogin(event) {
    event.preventDefault();
    const username = loginUser.value.trim();
    const password = loginPass.value;
    loginError.hidden = true;
    loginSubmit.disabled = true;
    loginSubmit.textContent = 'Verificando…';

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        closeLogin(false);
        open();
        say('Sesión iniciada con éxito. Ya puedes guardar en el servidor.');
        return;
      } else {
        loginError.textContent = data.error || 'Credenciales incorrectas.';
        loginError.hidden = false;
        loginPass.value = '';
        loginPass.focus();
      }
    } catch (err) {
      loginError.textContent = 'No se pudo conectar con el servidor. Abre http://localhost:5000.';
      loginError.hidden = false;
    } finally {
      loginSubmit.disabled = false;
      loginSubmit.textContent = 'Entrar';
    }
  }

  async function saveToServer(explicit = false) {
    const token = getToken();
    if (!token) {
      say('⚠️ Inicia sesión con la contraseña única para guardar en el servidor.');
      openLogin();
      return false;
    }

    if (saveServerBtn) {
      saveServerBtn.disabled = true;
      saveServerBtn.textContent = '⏳ Guardando en el servidor…';
    }
    say('Enviando cambios al servidor…');

    try {
      const res = await fetch('/api/portfolio/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ slots: saved, replace: true })
      });

      if (res.ok) {
        const dateStr = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        say(`✅ ¡Cambios guardados permanentemente en el servidor! (${dateStr})`);
        if (saveServerBtn) {
          saveServerBtn.textContent = '✅ ¡Guardado con éxito!';
          setTimeout(() => {
            saveServerBtn.disabled = false;
            saveServerBtn.textContent = '💾 Guardar Cambios en el Servidor';
          }, 2500);
        }
        return true;
      } else if (res.status === 401 || res.status === 403) {
        setToken('');
        say('⚠️ Tu sesión expiró. Inicia sesión de nuevo.');
        openLogin();
        if (saveServerBtn) {
          saveServerBtn.disabled = false;
          saveServerBtn.textContent = '💾 Guardar Cambios en el Servidor';
        }
        return false;
      } else {
        const errData = await res.json().catch(() => ({}));
        say(`⚠️ Error al guardar: ${errData.error || 'Respuesta inesperada'}`);
        if (saveServerBtn) {
          saveServerBtn.disabled = false;
          saveServerBtn.textContent = '💾 Guardar Cambios en el Servidor';
        }
        return false;
      }
    } catch (err) {
      say('⚠️ Error de red al comunicarse con el servidor.');
      if (saveServerBtn) {
        saveServerBtn.disabled = false;
        saveServerBtn.textContent = '💾 Guardar Cambios en el Servidor';
      }
      return false;
    }
  }

  // Event Listeners
  toggle.addEventListener('click', async () => {
    const authed = await checkAuth();
    if (!authed) {
      openLogin();
      return;
    }
    if (panel.classList.contains('open')) close();
    else open();
  });

  loginForm.addEventListener('submit', submitLogin);
  loginClose.addEventListener('click', () => closeLogin());
  login.addEventListener('click', event => { if (event.target === login) closeLogin(); });

  document.getElementById('adminClose').addEventListener('click', close);
  backdrop.addEventListener('click', close);

  if (logout) {
    logout.addEventListener('click', () => {
      setToken('');
      close();
      say('Sesión cerrada.');
    });
  }

  if (saveServerBtn) {
    saveServerBtn.addEventListener('click', () => saveToServer(true));
  }

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (!login.hidden) { closeLogin(); return; }
    if (!backdrop.hidden) close();
  });

  // Campos de subida de imágenes
  const fields = document.getElementById('adminFields');
  if (fields) {
    for (const [group, names] of Object.entries(groups)) {
      const section = document.createElement('section');
      section.className = 'admin-group';
      section.innerHTML = `<h3>${group}</h3>`;
      for (const slot of names) {
        const row = document.createElement('label');
        row.className = 'upload-row';
        const name = document.createElement('span');
        name.textContent = slots[slot];
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.setAttribute('aria-label', `Elegir ${slots[slot]}`);

        input.addEventListener('change', async () => {
          const file = input.files?.[0];
          if (!file) return;
          try {
            say(`Procesando ${slots[slot]}…`);
            const bitmap = await createImageBitmap(file);
            const max = 1350;
            const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(bitmap.width * scale);
            canvas.height = Math.round(bitmap.height * scale);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
            bitmap.close?.();
            const data = canvas.toDataURL('image/webp', 0.82);

            saved[slot] = data;
            try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch {}
            apply(slot, data);
            say(`✔️ ${slots[slot]} actualizada. Presiona "Guardar Cambios en el Servidor" para sincronizar.`);
          } catch {
            say('No se pudo procesar la imagen. Prueba con un archivo JPG o PNG estándar.');
          }
        });

        row.append(name, input);
        section.append(row);
      }
      fields.append(section);
    }
  }

  const exportBtn = document.getElementById('exportConfig');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(saved)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'seleccion-imagenes-wicho.json';
      a.click();
      URL.revokeObjectURL(a.href);
      say('Selección descargada en un archivo JSON.');
    });
  }

  const importInput = document.getElementById('importConfig');
  if (importInput) {
    importInput.addEventListener('change', async e => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        if (!data || typeof data !== 'object' || Array.isArray(data)) throw Error();
        saved = {};
        for (const [k, v] of Object.entries(data)) {
          if (slots[k] && typeof v === 'string' && (v.startsWith('data:image/') || v.startsWith('/'))) {
            saved[k] = v;
          }
        }
        localStorage.setItem(KEY, JSON.stringify(saved));
        applyAll();
        say('Selección importada. Presiona "Guardar Cambios en el Servidor" si deseas aplicarla a todos los dispositivos.');
      } catch {
        say('Ese archivo no contiene una selección válida.');
      }
    });
  }

  const resetBtn = document.getElementById('resetConfig');
  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      if (!confirm('¿Deseas restablecer todas las imágenes a sus valores iniciales?')) return;
      saved = {};
      try { localStorage.removeItem(KEY); } catch {}
      const token = getToken();
      if (token) {
        try {
          await fetch('/api/portfolio/config', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ slots: {}, replace: true })
          });
        } catch {}
      }
      location.reload();
    });
  }
})();