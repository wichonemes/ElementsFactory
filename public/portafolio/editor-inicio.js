/* ============================================================
   Portafolio · edición visual del inicio
   Mismo lenguaje que las demás páginas del portafolio:
   barra flotante «Modo edición» + lápices sobre cada texto/imagen.
   Guarda en el mismo estado que el panel clásico (admin.js).
   ============================================================ */
(() => {
  const api = window.__wichoInicio;
  if (!api) return;

  const doc = document;
  const $ = (s, r = doc) => r.querySelector(s);
  const $$ = (s, r = doc) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- aviso flotante ---------- */
  let toastTimer;
  const toastEl = doc.createElement('div');
  toastEl.className = 'we-toast';
  toastEl.setAttribute('role', 'status');
  toastEl.setAttribute('aria-live', 'polite');
  doc.body.appendChild(toastEl);
  const toast = (msg, ms = 3000) => {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), ms);
  };

  /* ---------- barra de edición ---------- */
  const toolbar = doc.createElement('div');
  toolbar.className = 'we-toolbar';
  toolbar.setAttribute('role', 'toolbar');
  toolbar.setAttribute('aria-label', 'Modo edición del portafolio');
  toolbar.innerHTML = '<span class="we-label"><i></i> Modo edición</span>'
    + '<button type="button" class="we-primary" data-we="add">＋ Agregar</button>'
    + '<button type="button" data-we="panel">☰ Panel</button>'
    + '<button type="button" data-we="help" aria-label="Ayuda">?</button>'
    + '<button type="button" data-we="exit">✓ Listo</button>';
  doc.body.appendChild(toolbar);
  toolbar.addEventListener('click', e => {
    const b = e.target.closest('button[data-we]');
    if (!b) return;
    const act = b.dataset.we;
    if (act === 'exit') exitEdit();
    else if (act === 'panel') api.openAdmin(true);
    else if (act === 'add') { api.openAdmin(true); toast('Usa el panel para agregar o reordenar contenido.'); }
    else if (act === 'help') openHelp();
  });

  /* ---------- capa de lápices ---------- */
  let editing = false;
  let pins = [];
  let raf = 0;
  const layer = doc.createElement('div');
  layer.className = 'we-pins';
  layer.setAttribute('aria-hidden', 'true');
  doc.body.appendChild(layer);

  const fileInput = doc.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.hidden = true;
  doc.body.appendChild(fileInput);
  let pendingSlot = null;

  /* ---------- entrar / salir ---------- */
  function enterEdit() {
    if (editing) return;
    editing = true;
    doc.body.classList.add('we-editing');
    const t = $('#adminToggle');
    if (t) t.setAttribute('aria-expanded', 'true');
    decorate();
    toast('Modo edición: toca el lápiz de un texto o de una imagen.', 3800);
  }
  function exitEdit() {
    if (!editing) return;
    editing = false;
    doc.body.classList.remove('we-editing');
    const t = $('#adminToggle');
    if (t) t.setAttribute('aria-expanded', 'false');
    clearPins();
    closeModal();
  }

  /* El botón del lápiz del encabezado entra al modo visual, no al panel clásico. */
  const oldToggle = $('#adminToggle');
  if (oldToggle) {
    const toggle = oldToggle.cloneNode(true);
    oldToggle.replaceWith(toggle);
    toggle.addEventListener('click', e => {
      e.preventDefault();
      editing ? exitEdit() : enterEdit();
    });
  }

  /* Evita que los enlaces del portafolio naveguen mientras se edita. */
  doc.addEventListener('click', e => {
    if (!editing) return;
    if (e.target.closest('.we-toolbar, .we-modal, .we-pins')) return;
    const link = e.target.closest('a');
    if (link) e.preventDefault();
  }, true);

  /* ---------- pines flotantes ---------- */
  function clearPins() {
    layer.innerHTML = '';
    pins = [];
    $$('.we-target').forEach(el => el.classList.remove('we-target'));
  }

  function addPin(target, kind, label, onPress, anchor = 'tr') {
    if (!target) return;
    const pin = doc.createElement('button');
    pin.type = 'button';
    pin.className = 'we-pin' + (kind === 'image' ? ' we-pin-shape' : '');
    pin.textContent = kind === 'image' ? '⤢' : '✎';
    pin.title = label;
    pin.setAttribute('aria-label', label);
    pin.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); onPress(); });
    layer.appendChild(pin);
    target.classList.add('we-target');
    pins.push({ pin, target, anchor });
  }

  function placePins() {
    const vw = innerWidth, vh = innerHeight;
    pins.forEach(({ pin, target, anchor }) => {
      const r = target.getBoundingClientRect();
      if (!r.width || r.bottom < 74 || r.top > vh + 30) { pin.style.display = 'none'; return; }
      pin.style.display = 'grid';
      let x, y;
      if (anchor === 'tl') { x = r.left + 4; y = r.top + 4; }
      else if (anchor === 'bl') { x = r.left + 4; y = r.bottom - 4; }
      else if (anchor === 'br') { x = r.right - 4; y = r.bottom - 4; }
      else if (anchor === 'text') {
        let tr = r;
        try {
          const range = doc.createRange();
          range.selectNodeContents(target);
          const rr = range.getBoundingClientRect();
          if (rr.width) tr = rr;
        } catch (err) { /* usa el bloque */ }
        x = tr.right + 9;
        y = r.top - 16;
        if (y < 18) y = r.top + 15;
      } else { x = r.right - 4; y = r.top + 4; }
      x = Math.max(15, Math.min(vw - 15, x));
      y = Math.max(74, Math.min(vh - 15, y));
      pin.style.left = x + 'px';
      pin.style.top = y + 'px';
    });
  }
  const schedule = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; placePins(); }); };
  const observer = ('ResizeObserver' in window) ? new ResizeObserver(() => schedule()) : null;
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);

  /* ---------- decorar la página ---------- */
  function decorate() {
    if (!editing) return;
    clearPins();
    const s = api.state;

    /* Textos del hero */
    addPin($('#inicio .kicker'), 'edit', 'Editar frase superior', () => editText($('#inicio .kicker'), () => s.copy.kicker, v => {
      s.copy.kicker = v; api.applyCopy(); api.save('Frase superior actualizada.');
    }), 'text');

    addPin($('#inicio h1'), 'edit', 'Editar título principal', () => editText($('#inicio h1'), () => s.copy.heroTitle, v => {
      s.copy.heroTitle = v; api.applyCopy(); api.save('Título principal actualizado.');
    }, true), 'text');

    addPin($('#inicio p'), 'edit', 'Editar descripción', () => editText($('#inicio p'), () => s.copy.heroText, v => {
      s.copy.heroText = v; api.applyCopy(); api.save('Descripción actualizada.');
    }), 'text');

    /* Imágenes principales */
    addPin($('.top-banner'), 'image', 'Cambiar banner principal', () => pickImage('hero-cover'), 'tr');
    addPin($('.profile-frame'), 'image', 'Cambiar foto de perfil', () => pickImage('profile-photo'), 'tr');
    addPin($('.brand-mark'), 'image', 'Cambiar logo personal', () => pickImage('logo-site'), 'tr');

    /* Sección de áreas */
    addPin($('#areas .section-head .kicker'), 'edit', 'Editar frase de áreas', () => editText($('#areas .section-head .kicker'), () => s.copy.areasKicker, v => {
      s.copy.areasKicker = v; api.applyCopy(); api.save('Frase de áreas actualizada.');
    }), 'text');
    addPin($('#areas .section-head h2'), 'edit', 'Editar título de áreas', () => editText($('#areas .section-head h2'), () => s.copy.areasTitle, v => {
      s.copy.areasTitle = v; api.applyCopy(); api.save('Título de áreas actualizado.');
    }), 'text');

    $$('#areas .area').forEach((card, i) => {
      const area = s.areas[i];
      if (!area) return;
      const h3 = card.querySelector('.area-info h3');
      const p = card.querySelector('.area-info p');
      const cover = card.querySelector('.area-cover');
      addPin(h3, 'edit', 'Editar nombre de la disciplina', () => editText(h3, () => area.title, v => {
        area.title = v; api.applyAreas(); api.save('Disciplina actualizada.');
      }), 'text');
      addPin(p, 'edit', 'Editar frase de la disciplina', () => editText(p, () => area.desc, v => {
        area.desc = v; api.applyAreas(); api.save('Frase actualizada.');
      }), 'text');
      addPin(cover, 'image', 'Cambiar portada de ' + area.title, () => pickImage(area.slot), 'tr');
    });

    /* Nota de disciplinas */
    addPin($('.area-note strong'), 'edit', 'Editar título de la nota', () => editText($('.area-note strong'), () => s.copy.areasNoteTitle, v => {
      s.copy.areasNoteTitle = v; api.applyCopy(); api.save('Nota actualizada.');
    }), 'text');
    addPin($('.area-note span'), 'edit', 'Editar texto de la nota', () => editText($('.area-note span'), () => s.copy.areasNoteText, v => {
      s.copy.areasNoteText = v; api.applyCopy(); api.save('Nota actualizada.');
    }), 'text');

    /* Proyectos */
    addPin($('#proyectos .section-head .kicker'), 'edit', 'Editar frase de proyectos', () => editText($('#proyectos .section-head .kicker'), () => s.copy.projectsKicker, v => {
      s.copy.projectsKicker = v; api.applyCopy(); api.save('Frase de proyectos actualizada.');
    }), 'text');
    addPin($('#proyectos .section-head h2'), 'edit', 'Editar título de proyectos', () => editText($('#proyectos .section-head h2'), () => s.copy.projectsTitle, v => {
      s.copy.projectsTitle = v; api.applyCopy(); api.save('Título de proyectos actualizado.');
    }), 'text');

    $$('#proyectos .project').forEach((card, i) => {
      const proj = s.projects[i];
      if (!proj) return;
      const span = card.querySelector('.project-body span');
      const h3 = card.querySelector('.project-body h3');
      const img = card.querySelector('img');
      addPin(h3, 'edit', 'Editar nombre del proyecto', () => editText(h3, () => proj.title, v => {
        proj.title = v; api.applyProjects(); api.save('Proyecto actualizado.');
      }), 'text');
      addPin(span, 'edit', 'Editar categoría del proyecto', () => editText(span, () => proj.tag, v => {
        proj.tag = v; api.applyProjects(); api.save('Categoría actualizada.');
      }), 'text');
      addPin(img || card, 'image', 'Cambiar imagen de ' + proj.title, () => pickImage(proj.slot), 'tr');
    });

    /* Cierre */
    addPin($('.about-strip .kicker'), 'edit', 'Editar frase de cierre', () => editText($('.about-strip .kicker'), () => s.copy.aboutKicker, v => {
      s.copy.aboutKicker = v; api.applyCopy(); api.save('Cierre actualizado.');
    }), 'text');
    addPin($('.about-strip p'), 'edit', 'Editar relato de cierre', () => editText($('.about-strip p'), () => s.copy.aboutText, v => {
      s.copy.aboutText = v; api.applyCopy(); api.save('Relato actualizado.');
    }), 'text');

    requestAnimationFrame(placePins);
    [250, 700, 1400].forEach(t => setTimeout(() => { if (editing) placePins(); }, t));
    if (observer) {
      observer.disconnect();
      observer.observe($('main') || doc.body);
    }
    $$('main img').forEach(img => { if (!img.complete) img.addEventListener('load', schedule, { once: true }); });
  }

  /* ---------- edición de texto en línea ---------- */
  function editText(el, get, set, html = false) {
    if (!el || el.isContentEditable) return;
    const originalHTML = el.innerHTML;
    const original = get();
    el.contentEditable = 'true';
    el.spellcheck = false;
    el.classList.add('we-editing-text');
    el.focus();
    try {
      const range = doc.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } catch (e) { /* sin selección */ }

    let done = false;
    function finish(commit) {
      if (done) return;
      done = true;
      el.removeEventListener('keydown', onKey);
      el.removeEventListener('blur', onBlur);
      el.contentEditable = 'false';
      el.classList.remove('we-editing-text');
      if (!el.isConnected) return;
      const value = html
        ? el.innerHTML.trim()
        : el.innerText.replace(/\s+/g, ' ').trim();
      if (commit && value && value !== original) {
        set(value);
      } else {
        el.innerHTML = originalHTML;
      }
      schedule();
    }
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); finish(false); }
      else if (e.key === 'Enter' && !e.shiftKey && !html) { e.preventDefault(); finish(true); }
      else if (e.key === 'Enter' && html && (e.ctrlKey || e.metaKey)) { e.preventDefault(); finish(true); }
    }
    function onBlur() { finish(true); }
    el.addEventListener('keydown', onKey);
    el.addEventListener('blur', onBlur);
    toast(html ? 'Edita el título · Ctrl+Enter guarda · Esc cancela' : 'Edita el texto · Enter guarda · Esc cancela', 4200);
  }

  /* ---------- imágenes ---------- */
  function pickImage(slot) {
    pendingSlot = slot;
    fileInput.value = '';
    fileInput.click();
  }
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file || !pendingSlot) return;
    const slot = pendingSlot;
    pendingSlot = null;
    try {
      const dataUrl = await api.processImageFile(file);
      if (!api.state.images) api.state.images = {};
      api.state.images[slot] = dataUrl;
      api.applyImage(slot, dataUrl);
      api.save('Imagen actualizada.');
      toast('Imagen actualizada.');
      if (editing) decorate();
    } catch (err) {
      toast('No se pudo procesar la imagen. Usa JPG, PNG o WebP.');
    }
  });

  /* ---------- modal de ayuda ---------- */
  const modal = doc.createElement('div');
  modal.className = 'we-modal';
  modal.hidden = true;
  doc.body.appendChild(modal);
  function closeModal() { modal.hidden = true; modal.innerHTML = ''; }
  modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('[data-close]')) closeModal(); });
  doc.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) { e.preventDefault(); closeModal(); } });

  function openHelp() {
    modal.innerHTML = '<div class="we-card" role="dialog" aria-modal="true" aria-labelledby="we-help-title">'
      + '<header class="we-card-head"><div><span class="we-kicker">Cómo funciona</span><h2 id="we-help-title">Edición visual</h2></div><button class="we-x" type="button" data-close aria-label="Cerrar">×</button></header>'
      + '<div class="we-help">'
      + '<div><b>✎</b><p><strong>Textos.</strong> Toca el lápiz junto a un título, una disciplina o un proyecto. Escribe y pulsa Enter. Esc cancela.</p></div>'
      + '<div><b>⤢</b><p><strong>Imágenes.</strong> Toca el botón de imagen sobre el banner, tu foto, un área o un proyecto para subir una nueva.</p></div>'
      + '<div><b>＋</b><p><strong>Más opciones.</strong> «Agregar» y «Panel» abren el panel clásico para reordenar, importar o descargar un respaldo.</p></div>'
      + '<div><b>✓</b><p><strong>Listo.</strong> Cierra el modo edición. Todo se guarda en este navegador y puedes enviarlo al servidor desde el panel.</p></div>'
      + '</div>'
      + '<p class="we-note">Los cambios se aplican al instante en esta portada.</p>'
      + '<footer class="we-card-foot"><button type="button" class="we-apply" data-close>Entendido</button></footer>'
      + '</div>';
    modal.hidden = false;
  }

  doc.addEventListener('keydown', e => {
    if (e.key === 'Escape' && editing && modal.hidden) exitEdit();
  });
})();
