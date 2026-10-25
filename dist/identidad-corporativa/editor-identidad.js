/* Modo de edicion visual para Identidad (motor gallery.js) */
(() => {
  const idn = window.__identidad;
  if (!idn) return;
  const doc = document;
  const $ = (s, r = doc) => r.querySelector(s);
  const $$ = (s, r = doc) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  let toastTimer;
  const toastEl = doc.createElement('div');
  toastEl.className = 'we-toast';
  toastEl.setAttribute('role', 'status');
  toastEl.setAttribute('aria-live', 'polite');
  doc.body.appendChild(toastEl);
  const toast = (msg, ms = 2800) => {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), ms);
  };

  const toolbar = doc.createElement('div');
  toolbar.className = 'we-toolbar';
  toolbar.setAttribute('role', 'toolbar');
  toolbar.setAttribute('aria-label', 'Modo edición');
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
    else if (act === 'panel') idn.openAdmin(true);
    else if (act === 'add') openAdd();
    else if (act === 'help') openHelp();
  });

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
  let pendingImage = null;

  /* Quitar el listener original del boton y usar el modo visual */
  const oldToggle = $('#adminToggle');
  let toggle = oldToggle;
  if (oldToggle) {
    toggle = oldToggle.cloneNode(true);
    oldToggle.replaceWith(toggle);
    toggle.addEventListener('click', e => { e.preventDefault(); editing ? exitEdit() : enterEdit(); });
  }

  function enterEdit() {
    if (editing) return;
    editing = true;
    doc.body.classList.add('we-editing');
    if (toggle) {toggle.setAttribute('aria-expanded', 'true'); }
    decorate();
    toast('Modo edición: toca el lápiz de un texto, imagen o proyecto.', 3800);
  }
  function exitEdit() {
    if (!editing) return;
    editing = false;
    doc.body.classList.remove('we-editing');
    if (toggle) {toggle.setAttribute('aria-expanded', 'false'); }
    clearPins();
    closeModal();
  }

  function clearPins() {
    layer.innerHTML = '';
    pins = [];
    $$('.we-target').forEach(el => el.classList.remove('we-target'));
  }
  function addPin(target, kind, label, onPress, anchor = 'tr') {
    const pin = doc.createElement('button');
    pin.type = 'button';
    pin.className = 'we-pin' + (kind === 'shape' ? ' we-pin-shape' : '') + (kind === 'del' ? ' we-pin-del' : '');
    pin.textContent = kind === 'shape' ? '⤢' : (kind === 'del' ? '×' : '✎');
    pin.title = label;
    pin.setAttribute('aria-label', label);
    pin.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); onPress(); });
    if (!target) return;
    layer.appendChild(pin);
    target.classList.add('we-target');
    pins.push({ pin, target, anchor });
  }
  function placePins() {
    const vw = innerWidth, vh = innerHeight;
    pins.forEach(({ pin, target, anchor }) => {
      const r = target.getBoundingClientRect();
      if (!r.width || r.bottom < 76 || r.top > vh + 30) { pin.style.display = 'none'; return; }
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
        x = tr.right + 9; y = r.top - 16; if (y < 18) y = r.top + 15;
      }
      else if (anchor === 'tr-above') { x = r.left + 10; y = r.top - 16; if (y < 18) y = r.top + 15; }
      else if (anchor === 'tr-above-r') { x = r.right - 2; y = r.top - 16; if (y < 18) y = r.top + 15; }
      else { x = r.right - 4; y = r.top + 4; }
      x = Math.max(15, Math.min(vw - 15, x));
      y = Math.max(76, Math.min(vh - 15, y));
      pin.style.left = x + 'px';
      pin.style.top = y + 'px';
    });
  }
  const schedule = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; placePins(); }); };
  const contentObserver = ('ResizeObserver' in window) ? new ResizeObserver(() => schedule()) : null;
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);

  function decorate() {
    if (!editing) return;
    clearPins();

    const copyFields = [
      ['#heroEyebrow', 'heroEyebrow', 'text'],
      ['#page-title', 'title', 'text'],
      ['#heroIntro', 'heroIntro', 'text'],
      ['#introEyebrow', 'introEyebrow', 'text'],
      ['#introTitle', 'introTitle', 'text'],
      ['#introText', 'introText', 'text']
    ];
    copyFields.forEach(([sel, key, anchor]) => {
      const el = $(sel);
      if (el) addPin(el, 'edit', 'Editar texto', () => editCopy(el, key), anchor);
    });

    const banner = $('.hero-banner');
    if (banner) addPin(banner, 'edit', 'Cambiar banner', () => pickImage(null, true));

    $$('#projectGrid .project-card').forEach((card, i) => {
      const project = idn.state.projects[i];
      if (!project) return;
      const title = card.querySelector('.project-title');
      const art = card.querySelector('.project-art');
      const img = card.querySelector('img');
      const artTarget = img || art;
      if (title) addPin(title, 'edit', 'Editar nombre del proyecto', () => editField(title, () => project.name, v => {
        project.name = v;
        idn.save('Proyecto actualizado.');
        title.textContent = v;
        const link = card.querySelector('.project-image');
        if (link) link.setAttribute('aria-label', 'Ver proyecto ' + v);
        if (img) img.alt = 'Identidad visual de ' + v;
      }), 'text');
      if (artTarget && img) {
        addPin(artTarget, 'edit', 'Cambiar imagen', () => pickImage(project, false));
        addPin(artTarget, 'shape', 'Cambiar forma del proyecto', () => openShape(project, card, img), 'bl');
        addPin(artTarget, 'del', 'Quitar proyecto', () => removeProject(project), 'tl');
      }
    });

    requestAnimationFrame(placePins);
    [250, 700, 1400].forEach(t => setTimeout(() => { if (editing) placePins(); }, t));
    if (contentObserver) {
      contentObserver.disconnect();
      const grid = $('#projectGrid');
      if (grid) contentObserver.observe(grid);
    }
    $$('#projectGrid img').forEach(img => { if (!img.complete) img.addEventListener('load', schedule, { once: true }); });
  }

  function editCopy(el, key) {
    editField(el, () => idn.state.copy[key], v => {
      idn.state.copy[key] = v;
      idn.save('Texto actualizado.');
      idn.applyCopy();
    }, true);
  }
  function editField(el, get, set, reapply) {
    if (el.isContentEditable) return;
    const original = get();
    const originalHTML = el.innerHTML;
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
    } catch (e) { /* sin seleccion */ }

    let done = false;
    function finish(commit) {
      if (done) return;
      done = true;
      el.removeEventListener('keydown', onKey);
      el.removeEventListener('blur', onBlur);
      el.contentEditable = 'false';
      el.classList.remove('we-editing-text');
      if (!el.isConnected) return;
      const prevTransform = el.style.textTransform;
      el.style.textTransform = 'none';
      const value = el.innerText.replace(/\s+/g, ' ').trim();
      el.style.textTransform = prevTransform;
      if (commit && value && value !== original) {
        set(value);
        if (!reapply) el.textContent = value;
      } else {
        if (reapply) { try { idn.applyCopy(); } catch (e) { el.innerHTML = originalHTML; } }
        else el.innerHTML = originalHTML;
      }
      schedule();
    }
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); finish(false); }
      else if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); finish(true); }
    }
    function onBlur() { finish(true); }
    el.addEventListener('keydown', onKey);
    el.addEventListener('blur', onBlur);
    toast('Edita el texto · Enter para guardar · Esc para cancelar', 4000);
  }

  function pickImage(project, banner) {
    pendingImage = { project, banner };
    fileInput.value = '';
    fileInput.click();
  }
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file || !pendingImage) return;
    const target = pendingImage;
    try {
      const key = await idn.saveImage(file);
      if (target.banner) idn.state.bannerKey = key;
      else target.project.imageKey = key;
      pendingImage = null;
      idn.save(target.banner ? 'Banner actualizado.' : 'Imagen actualizada.');
      await idn.render();
      toast(target.banner ? 'Banner actualizado.' : 'Imagen actualizada.');
    } catch (err) {
      toast(err.message || 'No se pudo subir la imagen.');
    }
  });

  async function removeProject(project) {
    if (!confirm('¿Quitar «' + project.name + '» del mosaico?\\n\\nPuedes recuperarlo importando un respaldo.')) return;
    idn.state.projects = idn.state.projects.filter(p => p.id !== project.id);
    idn.save('Proyecto eliminado.');
    await idn.render();
    toast('Proyecto eliminado.');
  }

  const modal = doc.createElement('div');
  modal.className = 'we-modal';
  modal.hidden = true;
  doc.body.appendChild(modal);
  let shapeCtx = null;
  function closeModal() { modal.hidden = true; modal.innerHTML = ''; shapeCtx = null; }
  modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('[data-close]')) closeModal(); });
  doc.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) { e.preventDefault(); closeModal(); } });

  function openShape(project, card, img) {
    const current = project.wide ?? card.classList.contains('tile--rectangle');
    shapeCtx = { project, choice: current ? 'rect' : 'square' };
    modal.innerHTML = '<div class="we-card" role="dialog" aria-modal="true" aria-labelledby="we-shape-title">'
      + '<header class="we-card-head"><div><span class="we-kicker">Forma del proyecto</span><h2 id="we-shape-title">' + esc(project.name) + '</h2></div><button class="we-x" type="button" data-close aria-label="Cerrar">×</button></header>'
      + '<div class="we-preview" data-preview><img alt=""></div>'
      + '<div class="we-chips"><button type="button" data-choice="square">Cuadrada</button><button type="button" data-choice="rect">Rectángulo</button></div>'
      + '<p class="we-note">El mosaico alterna piezas cuadradas y rectangulares. La imagen se muestra completa dentro de la forma.</p>'
      + '<footer class="we-card-foot"><button type="button" class="we-ghost" data-close>Cancelar</button><button type="button" class="we-apply" data-apply>Aplicar forma</button></footer>'
      + '</div>';
    modal.hidden = false;
    const preview = $('[data-preview]', modal);
    $('img', preview).src = img.currentSrc || img.src;
    const render = () => {
      preview.style.height = shapeCtx.choice === 'square' ? '300px' : '200px';
      preview.style.width = '100%';
      $$('.we-chips button', modal).forEach(b => b.classList.toggle('is-on', b.dataset.choice === shapeCtx.choice));
    };
    $$('.we-chips button', modal).forEach(b => { b.onclick = () => { shapeCtx.choice = b.dataset.choice; render(); }; });
    render();
    $('[data-apply]', modal).onclick = async () => {
      project.wide = shapeCtx.choice === 'rect';
      closeModal();
      idn.save('Forma actualizada.');
      await idn.render();
      toast('Forma actualizada.');
    };
  }

  function openAdd() {
    modal.innerHTML = '<div class="we-card" role="dialog" aria-modal="true" aria-labelledby="we-add-title">'
      + '<header class="we-card-head"><div><span class="we-kicker">Nuevo proyecto</span><h2 id="we-add-title">Agregar al mosaico</h2></div><button class="we-x" type="button" data-close aria-label="Cerrar">×</button></header>'
      + '<label class="we-field"><span>Nombre</span><input name="name" placeholder="Ej. Nueva marca" autocomplete="off"></label>'
      + '<label class="we-field"><span>Enlace (opcional)</span><input name="url" placeholder="https://..."></label>'
      + '<label class="we-field"><span>Imagen / logo</span><input name="image" type="file" accept="image/*"></label>'
      + '<label class="we-field"><span>Forma</span><select name="shape"><option value="square">Cuadrada</option><option value="rect">Rectángulo</option></select></label>'
      + '<p class="we-error" data-error></p>'
      + '<footer class="we-card-foot"><button type="button" class="we-ghost" data-close>Cancelar</button><button type="button" class="we-apply" data-add>Agregar proyecto</button></footer>'
      + '</div>';
    modal.hidden = false;
    const err = $('[data-error]', modal);
    setTimeout(() => $('[name=name]', modal).focus(), 60);
    $('[data-add]', modal).onclick = async () => {
      const name = $('[name=name]', modal).value.trim();
      const url = $('[name=url]', modal).value.trim();
      const file = $('[name=image]', modal).files && $('[name=image]', modal).files[0];
      if (!name) { err.textContent = 'Escribe un nombre.'; return; }
      if (!file) { err.textContent = 'Selecciona una imagen o logo.'; return; }
      try {
        const imageKey = await idn.saveImage(file);
        idn.state.projects.push({ id: 'custom-' + Date.now(), name, url: url || '#', imageKey, wide: $('[name=shape]', modal).value === 'rect' });
        idn.save('Proyecto agregado.');
        closeModal();
        await idn.render();
        toast('Proyecto agregado al final del mosaico.');
      } catch (e) {
        err.textContent = e.message || 'No se pudo agregar el proyecto.';
      }
    };
  }

  function openHelp() {
    modal.innerHTML = '<div class="we-card" role="dialog" aria-modal="true" aria-labelledby="we-help-title">'
      + '<header class="we-card-head"><div><span class="we-kicker">Cómo funciona</span><h2 id="we-help-title">Edición visual</h2></div><button class="we-x" type="button" data-close aria-label="Cerrar">×</button></header>'
      + '<div class="we-help">'
      + '<div><b>✎</b><p><strong>Textos.</strong> Toca el lápiz del título, la introducción o el nombre de un proyecto. Enter guarda; Esc cancela.</p></div>'
      + '<div><b>⤢</b><p><strong>Forma.</strong> Cada proyecto puede ser cuadrado o rectángulo, como las piezas del mosaico.</p></div>'
      + '<div><b>＋</b><p><strong>Agregar.</strong> Suma un proyecto con nombre, enlace, logo y forma.</p></div>'
      + '<div><b>×</b><p><strong>Quitar.</strong> Retira el proyecto del mosaico; pide confirmación.</p></div>'
      + '</div>'
      + '<p class="we-note">Todo se guarda en este navegador. Usa «Panel» para reordenar, cambiar el banner o descargar un respaldo.</p>'
      + '<footer class="we-card-foot"><button type="button" class="we-apply" data-close>Entendido</button></footer>'
      + '</div>';
    modal.hidden = false;
  }

  doc.addEventListener('wicho:render', () => { if (editing) decorate(); });
})();
