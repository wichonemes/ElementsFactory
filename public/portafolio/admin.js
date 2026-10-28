(() => {
  const STORE = 'wicho-inicio-editor-v3';
  const LEGACY_KEY = 'wicho-home-admin-v2';
  const TOKEN_KEY = 'artesano_admin_token';

  const defaultCopy = {
    kicker: 'Diseñador gráfico · Digital',
    heroTitle: 'Ideas claras.<br><span>Diseño con intención.</span>',
    heroText: 'Exploro identidad, imagen y experiencias digitales para convertir ideas en piezas visuales cuidadas y funcionales.',
    areasKicker: 'Explora el portafolio',
    areasTitle: 'Un mundo para cada disciplina.',
    areasNoteTitle: 'Cada disciplina tiene su propio lenguaje.',
    areasNoteText: 'Explora cómo cambian las ideas cuando pasan de una marca a una imagen, una experiencia o un objeto.',
    projectsKicker: 'Selección de proyectos',
    projectsTitle: 'Trabajo que cuenta historias.',
    aboutKicker: 'Diseño en evolución',
    aboutText: 'Un portafolio para explorar mis proyectos, mostrar cómo pienso cada disciplina y seguir construyendo experiencias visuales cada vez más claras y funcionales.'
  };

  const defaultAreas = [
    { id: 'identidad', slot: 'area-identidad', title: 'Identidad corporativa', desc: 'Marcas con voz y sistema visual.' },
    { id: 'audiovisual', slot: 'area-audiovisual', title: 'Audiovisual', desc: 'Tiempo, luz y entorno.' },
    { id: 'animacion', slot: 'area-animacion', title: 'Animación', desc: 'Movimiento y expresión.' },
    { id: 'ilustracion', slot: 'area-ilustracion', title: 'Ilustración', desc: 'Forma, color e imaginación.' },
    { id: 'modelado', slot: 'area-modelado', title: 'Modelado 3D', desc: 'Forma, material y luz.' },
    { id: 'interfaces', slot: 'area-ux', title: 'Diseño de interfaces', desc: 'Del wireframe al código.' },
    { id: 'impresos', slot: 'area-impresos', title: 'Medios impresos', desc: 'Ideas llevadas a objetos.' },
    { id: 'editorial', slot: 'area-editorial', title: 'Diseño editorial', desc: 'Historias con ritmo y lectura.' }
  ];

  const defaultProjects = [
    { id: 'artesano', slot: 'project-artesano', tag: 'Identidad · Comunicación', title: 'Artesano Digital' },
    { id: 'civil', slot: 'project-civil', tag: 'Marca · Indumentaria', title: 'Civil Armory' },
    { id: 'popol', slot: 'project-popol', tag: 'Editorial · Ilustración', title: 'Popol Vuh' },
    { id: 'cafe', slot: 'project-cafe', tag: 'Identidad · Producto', title: 'Café San Luis' }
  ];

  const slotsMap = {
    'hero-cover': 'Portada superior (Banner)',
    'profile-photo': 'Foto de perfil',
    'logo-site': 'Logo de marca personal',
    'area-identidad': 'Identidad corporativa',
    'area-audiovisual': 'Audiovisual',
    'area-animacion': 'Animación',
    'area-ilustracion': 'Ilustración',
    'area-modelado': 'Modelado 3D',
    'area-ux': 'Diseño de interfaces',
    'area-impresos': 'Medios impresos',
    'area-editorial': 'Diseño editorial',
    'project-artesano': 'Artesano Digital',
    'project-civil': 'Civil Armory',
    'project-popol': 'Popol Vuh',
    'project-cafe': 'Café San Luis'
  };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  let state = readState();
  const panel = $('#adminPanel');
  const backdrop = $('#adminBackdrop');
  const toggle = $('#adminToggle');
  const status = $('#adminStatus');
  const saveServerBtn = $('#saveServerConfig');

  function readState() {
    try {
      const s = JSON.parse(localStorage.getItem(STORE) || 'null');
      if (s && s.copy && Array.isArray(s.areas)) return s;
    } catch (e) {
      console.warn('No se pudo leer el estado del editor:', e);
    }

    // Si no hay estado nuevo, importar imágenes legacy si existen
    let legacyImages = {};
    try {
      legacyImages = JSON.parse(localStorage.getItem(LEGACY_KEY) || '{}') || {};
    } catch {}

    return {
      copy: JSON.parse(JSON.stringify(defaultCopy)),
      areas: JSON.parse(JSON.stringify(defaultAreas)),
      projects: JSON.parse(JSON.stringify(defaultProjects)),
      images: legacyImages
    };
  }

  function save(msg = 'Cambios guardados automáticamente en este navegador.') {
    try {
      localStorage.setItem(STORE, JSON.stringify(state));
      // Mantener compatibilidad con slots legacy
      if (state.images && typeof state.images === 'object') {
        localStorage.setItem(LEGACY_KEY, JSON.stringify(state.images));
      }
      if (status) status.textContent = msg;
    } catch (e) {
      if (status) status.textContent = 'Espacio de almacenamiento local lleno. Prueba con fotos más livianas.';
    }
  }

  function applyCopy() {
    const c = state.copy;
    const heroKicker = $('#inicio .kicker');
    if (heroKicker) heroKicker.textContent = c.kicker;
    const heroH1 = $('#inicio h1');
    if (heroH1) heroH1.innerHTML = c.heroTitle;
    const heroP = $('#inicio p');
    if (heroP) heroP.textContent = c.heroText;

    const areasKicker = $('#areas .section-head .kicker');
    if (areasKicker) areasKicker.textContent = c.areasKicker;
    const areasTitle = $('#areas .section-head h2');
    if (areasTitle) areasTitle.textContent = c.areasTitle;

    const noteStrong = $('.area-note p strong');
    if (noteStrong) noteStrong.textContent = c.areasNoteTitle;
    const noteSpan = $('.area-note p span');
    if (noteSpan) noteSpan.textContent = c.areasNoteText;

    const projKicker = $('#proyectos .section-head .kicker');
    if (projKicker) projKicker.textContent = c.projectsKicker;
    const projTitle = $('#proyectos .section-head h2');
    if (projTitle) projTitle.textContent = c.projectsTitle;

    const aboutKicker = $('.about-strip .kicker');
    if (aboutKicker) aboutKicker.textContent = c.aboutKicker;
    const aboutP = $('.about-strip p');
    if (aboutP) aboutP.textContent = c.aboutText;

    // Actualizar inputs del panel
    $$('[data-copy]').forEach(input => {
      const k = input.dataset.copy;
      if (k && c[k] !== undefined && document.activeElement !== input) {
        input.value = c[k];
      }
    });
  }

  function applyAreas() {
    state.areas.forEach((area, i) => {
      const card = $(`#areas .area[data-area="${area.id}"]`) || $$('#areas .area')[i];
      if (!card) return;
      const h3 = card.querySelector('.area-info h3');
      if (h3) h3.textContent = area.title;
      const p = card.querySelector('.area-info p');
      if (p) p.textContent = area.desc;
    });
  }

  function applyProjects() {
    state.projects.forEach((proj, i) => {
      const card = $(`#proyectos .project[data-project="${proj.id}"]`) || $$('#proyectos .project')[i];
      if (!card) return;
      const span = card.querySelector('.project-body span');
      if (span) span.textContent = proj.tag;
      const h3 = card.querySelector('.project-body h3');
      if (h3) h3.textContent = proj.title;
    });
  }

  function applyImage(slot, src) {
    if (!slot || !src) return;
    $$(`[data-image-slot="${slot}"]`).forEach(img => {
      img.src = src;
      img.hidden = false;
    });
    if (slot === 'logo-site') {
      const fb = $('.logo-fallback');
      if (fb) fb.hidden = true;
    }
  }

  function applyImages() {
    Object.entries(state.images || {}).forEach(([slot, src]) => {
      if (src && typeof src === 'string') applyImage(slot, src);
    });
  }

  function applyAll() {
    applyCopy();
    applyAreas();
    applyProjects();
    applyImages();
  }

  function renderAdminFields() {
    // Campos de Áreas
    const areasContainer = $('#adminAreasFields');
    if (areasContainer) {
      areasContainer.innerHTML = state.areas.map((area, idx) => `
        <div class="admin-card-row">
          <h4>${esc(area.title)}</h4>
          <label>Nombre de la disciplina
            <input data-area-idx="${idx}" data-field="title" value="${esc(area.title)}">
          </label>
          <label>Frase breve
            <input data-area-idx="${idx}" data-field="desc" value="${esc(area.desc)}">
          </label>
          <label class="upload-field" style="margin-top:4px;">Cambiar portada de ${esc(area.title)}
            <input type="file" data-image="${esc(area.slot)}" accept="image/*">
          </label>
        </div>
      `).join('');
    }

    // Campos de Proyectos
    const projectsContainer = $('#adminProjectsFields');
    if (projectsContainer) {
      projectsContainer.innerHTML = state.projects.map((proj, idx) => `
        <div class="admin-card-row">
          <h4>${esc(proj.title)}</h4>
          <label>Título del proyecto
            <input data-proj-idx="${idx}" data-field="title" value="${esc(proj.title)}">
          </label>
          <label>Categoría / Subtítulo
            <input data-proj-idx="${idx}" data-field="tag" value="${esc(proj.tag)}">
          </label>
          <label class="upload-field" style="margin-top:4px;">Cambiar imagen de ${esc(proj.title)}
            <input type="file" data-image="${esc(proj.slot)}" accept="image/*">
          </label>
        </div>
      `).join('');
    }
  }

  function openAdmin(open) {
    if (!panel) return;
    panel.classList.toggle('open', open);
    panel.setAttribute('aria-hidden', String(!open));
    if (toggle) toggle.setAttribute('aria-expanded', String(open));
    if (backdrop) backdrop.hidden = !open;
    document.body.classList.toggle('admin-open', open);
    if (open) {
      renderAdminFields();
      const firstInput = panel.querySelector('input');
      if (firstInput) firstInput.focus();
    } else {
      if (toggle) toggle.focus();
    }
  }

  async function processImageFile(file) {
    const bitmap = await createImageBitmap(file);
    const max = 1400;
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    return canvas.toDataURL('image/webp', 0.85);
  }

  // Sincronizar en segundo plano con el servidor si está disponible
  async function syncServerInitial() {
    try {
      const res = await fetch('/api/portfolio/config');
      if (res.ok) {
        const data = await res.json();
        if (data?.slots && typeof data.slots === 'object' && Object.keys(data.slots).length > 0) {
          state.images = { ...(state.images || {}), ...data.slots };
          save('Imágenes sincronizadas con el servidor.');
          applyImages();
        }
      }
    } catch {}
  }

  async function saveToServer() {
    if (saveServerBtn) {
      saveServerBtn.disabled = true;
      saveServerBtn.textContent = '⏳ Guardando en el servidor…';
    }
    if (status) status.textContent = 'Enviando cambios al servidor…';

    try {
      const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || '';
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/portfolio/config', {
        method: 'POST',
        headers,
        body: JSON.stringify({ slots: state.images || {}, config: state, replace: true })
      });

      if (res.ok) {
        const dateStr = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        save(`✅ ¡Guardado con éxito en el servidor a las ${dateStr}!`);
        if (saveServerBtn) {
          saveServerBtn.textContent = '✅ ¡Guardado en el servidor!';
          setTimeout(() => {
            saveServerBtn.disabled = false;
            saveServerBtn.textContent = '💾 Guardar cambios en el servidor';
          }, 2400);
        }
      } else {
        save('⚠️ Guardado localmente en este navegador. Para la nube, inicia sesión en la plataforma.');
        if (saveServerBtn) {
          saveServerBtn.disabled = false;
          saveServerBtn.textContent = '💾 Guardar cambios en el servidor';
        }
      }
    } catch (e) {
      save('⚠️ Guardado localmente en este navegador (modo sin conexión).');
      if (saveServerBtn) {
        saveServerBtn.disabled = false;
        saveServerBtn.textContent = '💾 Guardar cambios en el servidor';
      }
    }
  }

  // Configurar Eventos
  if (toggle) {
    toggle.onclick = e => {
      e.preventDefault();
      openAdmin(!panel.classList.contains('open'));
    };
  }

  const closeBtn = $('#adminClose');
  if (closeBtn) closeBtn.onclick = () => openAdmin(false);
  if (backdrop) backdrop.onclick = () => openAdmin(false);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panel && panel.classList.contains('open')) {
      openAdmin(false);
    }
  });

  // Escuchar edición de textos principales
  document.querySelectorAll('[data-copy]').forEach(el => {
    el.addEventListener('input', () => {
      const key = el.dataset.copy;
      if (!key) return;
      state.copy[key] = el.value;
      applyCopy();
      save();
    });
  });

  // Delegar edición de áreas
  const areasContainer = $('#adminAreasFields');
  if (areasContainer) {
    areasContainer.addEventListener('input', e => {
      const idx = Number(e.target.dataset.areaIdx);
      const field = e.target.dataset.field;
      if (isNaN(idx) || !field || !state.areas[idx]) return;
      state.areas[idx][field] = e.target.value;
      applyAreas();
      save();
    });
  }

  // Delegar edición de proyectos
  const projectsContainer = $('#adminProjectsFields');
  if (projectsContainer) {
    projectsContainer.addEventListener('input', e => {
      const idx = Number(e.target.dataset.projIdx);
      const field = e.target.dataset.field;
      if (isNaN(idx) || !field || !state.projects[idx]) return;
      state.projects[idx][field] = e.target.value;
      applyProjects();
      save();
    });
  }

  // Subida de imágenes (en todo el panel)
  if (panel) {
    panel.addEventListener('change', async e => {
      if (!e.target.matches('[data-image]') || !e.target.files?.[0]) return;
      const slot = e.target.dataset.image;
      const file = e.target.files[0];
      const slotName = slotsMap[slot] || slot;
      try {
        if (status) status.textContent = `Procesando imagen para ${slotName}…`;
        const dataUrl = await processImageFile(file);
        if (!state.images) state.images = {};
        state.images[slot] = dataUrl;
        applyImage(slot, dataUrl);
        save(`✔️ ${slotName} actualizada correctamente.`);
      } catch (err) {
        if (status) status.textContent = 'No se pudo procesar la imagen. Usa formato JPG, PNG o WebP.';
      }
    });
  }

  if (saveServerBtn) {
    saveServerBtn.onclick = () => saveToServer();
  }

  // Exportar respaldo
  const exportBtn = $('#exportConfig');
  if (exportBtn) {
    exportBtn.onclick = () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'respaldo-inicio-wicho.json';
      a.click();
      URL.revokeObjectURL(a.href);
      if (status) status.textContent = 'Respaldo descargado con éxito.';
    };
  }

  // Importar respaldo
  const importInput = $('#importConfig');
  if (importInput) {
    importInput.onchange = async e => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const imported = JSON.parse(text);
        if (imported?.copy && Array.isArray(imported?.areas)) {
          state = imported;
        } else if (imported && typeof imported === 'object') {
          // Si es formato legacy de solo imágenes
          state.images = { ...(state.images || {}), ...imported };
        }
        save('Respaldo importado correctamente.');
        applyAll();
        renderAdminFields();
      } catch {
        if (status) status.textContent = 'El archivo no contiene un respaldo válido.';
      }
      e.target.value = '';
    };
  }

  // Restablecer originales
  const resetBtn = $('#resetConfig');
  if (resetBtn) {
    resetBtn.onclick = () => {
      if (!confirm('¿Restablecer los textos e imágenes originales de la página de inicio?')) return;
      localStorage.removeItem(STORE);
      localStorage.removeItem(LEGACY_KEY);
      state = {
        copy: JSON.parse(JSON.stringify(defaultCopy)),
        areas: JSON.parse(JSON.stringify(defaultAreas)),
        projects: JSON.parse(JSON.stringify(defaultProjects)),
        images: {}
      };
      save('Contenido original restablecido.');
      location.reload();
    };
  }

  // Inicializar
  applyAll();
  renderAdminFields();
  syncServerInitial();

  window.__wichoInicio = {
    get state() { return state; },
    save,
    applyAll,
    applyCopy,
    applyAreas,
    applyProjects,
    applyImage,
    applyImages,
    processImageFile,
    renderAdminFields,
    openAdmin
  };
})();
