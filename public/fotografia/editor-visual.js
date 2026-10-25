/* ============================================================
   Wicho Nemes · interfaz de área
   - barra de áreas flotante y color propio (CSS)
   - progreso de lectura en el color del área
   - modo de edición visual (texto e imagen) para las áreas narrativas
   ============================================================ */
(() => {
  const doc = document;
  const w = window.__wicho;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- progreso de lectura ---------- */
  const progress = doc.createElement('div');
  progress.className = 'we-progress';
  progress.setAttribute('aria-hidden', 'true');
  progress.innerHTML = '<i></i>';
  doc.body.appendChild(progress);
  const fill = progress.firstElementChild;
  const updateProgress = () => {
    const max = doc.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    fill.style.transform = 'scaleX(' + p + ')';
  };
  addEventListener('scroll', updateProgress, { passive: true });
  addEventListener('resize', updateProgress);
  updateProgress();

  /* ---------- pestaña activa visible en pantallas pequeñas ---------- */
  const activeTab = doc.querySelector('.area-tabs a.is-active');
  if (activeTab) {
    const nav = activeTab.closest('.area-tabs');
    if (nav) {
      requestAnimationFrame(() => {
        if (nav.scrollWidth > nav.clientWidth) {
          nav.scrollLeft = activeTab.offsetLeft - (nav.clientWidth - activeTab.offsetWidth) / 2;
        }
      });
    }
  }

  if (!w) return; // áreas con otro motor (Identidad) conservan su administrador

  /* ---------- utilidades ---------- */
  const $ = (s, r = doc) => r.querySelector(s);
  const $$ = (s, r = doc) => [...r.querySelectorAll(s)];
  const round = n => Math.round(n * 1000) / 1000;
  const ratioLabel = r => {
    if (!r) return '—';
    if (Math.abs(r - 1) < 0.02) return '1 : 1';
    const a = r >= 1 ? r : 1 / r;
    const common = [[1, 1], [4, 3], [3, 2], [16, 9], [5, 4], [2, 3], [3, 4], [9, 16], [4, 5]];
    for (const [x, y] of common) if (Math.abs(a - x / y) < 0.03) return r >= 1 ? x + ' : ' + y : y + ' : ' + x;
    return (r >= 1 ? r.toFixed(2) + ' : 1' : '1 : ' + (1 / r).toFixed(2));
  };

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

  /* ---------- barra de edición ---------- */
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
    else if (act === 'panel') w.openAdmin(true);
    else if (act === 'add') openAdd();
    else if (act === 'help') openHelp();
  });

  let editing = false;
  const layer = doc.createElement('div');
  layer.className = 'we-pins';
  layer.setAttribute('aria-hidden', 'true');
  doc.body.appendChild(layer);
  let pins = [];

  const fileInput = doc.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.hidden = true;
  doc.body.appendChild(fileInput);
  let pendingImage = null;

  /* ---------- entrar / salir ---------- */
  function enterEdit() {
    if (editing) return;
    editing = true;
    doc.body.classList.add('we-editing');
    const t = $('#adminToggle');
    if (t) {t.setAttribute('aria-expanded', 'true'); }
    decorate();
    toast('Modo edición: toca el lápiz de un texto o de una imagen.', 3800);
  }
  function exitEdit() {
    if (!editing) return;
    editing = false;
    doc.body.classList.remove('we-editing');
    const t = $('#adminToggle');
    if (t) {t.setAttribute('aria-expanded', 'false'); }
    clearPins();
    closeModal();
  }
  const toggle = $('#adminToggle');
  if (toggle) toggle.onclick = e => { e.preventDefault(); editing ? exitEdit() : enterEdit(); };

  /* ---------- pines flotantes ---------- */
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
    layer.appendChild(pin);
    target.classList.add('we-target');
    pins.push({ pin, target, anchor });
  }
  let raf = 0;
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
        // arriba del final real del texto, cerca de lo que se edita
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
      }
      else if (anchor === 'tr-above') {
        // el lapiz flota arriba del inicio del texto para no taparlo
        x = r.left + 10;
        y = r.top - 16;
        if (y < 18) y = r.top + 15;
      } else if (anchor === 'tr-above-r') {
        // variante para pies de foto: arriba a la derecha, lejos de la forma
        x = r.right - 2;
        y = r.top - 16;
        if (y < 18) y = r.top + 15;
      } else { x = r.right - 4; y = r.top + 4; }
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

  /* ---------- decorar la página ---------- */
  function decorate() {
    if (!editing) return;
    clearPins();

    const copyFields = [
      ['#kicker', 'kicker', 'text'],
      ['#title', 'title', 'text'],
      ['#heroText', 'heroText', 'text'],
      ['#introKicker', 'introKicker', 'text'],
      ['#introTitle', 'introTitle', 'text'],
      ['#introText', 'introText', 'text'],
      ['#collectionTitle', 'collectionTitle', 'text']
    ];
    copyFields.forEach(([sel, key, anchor]) => {
      const el = $(sel);
      if (el) addPin(el, 'edit', 'Editar texto', () => editCopy(el, key), anchor);
    });

    const hero = $('#heroImage');
    if (hero) addPin(hero, 'edit', 'Cambiar banner', () => pickImage(null, true));

    $$('#storySections .story-section').forEach(sec => {
      const h3 = sec.querySelector('h3');
      const intro = sec.querySelector('.story-section-head p');
      const sid = (h3 && h3.id ? h3.id.replace('section-', '') : '');
      const section = w.state.content.sections.find(s => s.id === sid);
      if (h3 && section) addPin(h3, 'edit', 'Editar nombre de la sección', () => editField(h3, () => section.name, v => { section.name = v; w.save('Sección actualizada.'); }), 'text');
      if (intro && section) addPin(intro, 'edit', 'Editar introducción de la sección', () => editField(intro, () => section.intro, v => { section.intro = v; w.save('Sección actualizada.'); }), 'text');

      sec.querySelectorAll('.story-card').forEach(card => {
        const item = w.state.content.stories.find(s => s.id === card.dataset.id);
        if (!item) return;
        const h4 = card.querySelector('h4');
        const cap = card.querySelector('.story-copy p:last-child');
        const media = card.querySelector('.story-image');
        const img = card.querySelector('img');
        const isVideo = Boolean(card.querySelector('a.story-image'));

        if (h4) addPin(h4, 'edit', 'Editar título', () => editField(h4, () => item.title, v => {
          item.title = v; w.save('Título actualizado.');
          if (img) img.alt = item.caption ? item.title + ': ' + item.caption : item.title;
        }), 'text');
        if (cap) addPin(cap, 'edit', 'Editar historia', () => editField(cap, () => item.caption, v => {
          item.caption = v; w.save('Historia actualizada.');
          if (img) img.alt = item.caption ? item.title + ': ' + item.caption : item.title;
        }), 'text');
        if (media && img) {
          addPin(media, 'edit', 'Cambiar imagen', () => pickImage(item, false, img));
          if (!isVideo) addPin(media, 'shape', 'Cambiar forma de la imagen', () => openShape(item, img), 'bl');
          addPin(media, 'del', 'Quitar pieza', () => removeItem(item), 'tl');
        } else {
          addPin(card, 'del', 'Quitar pieza', () => removeItem(item), 'tl');
        }
      });
    });

    // videos de la sección de films (Audiovisual)
    const films = w.state.content.films;
    if (Array.isArray(films)) {
      $$('#filmGrid .film-card').forEach((card, i) => {
        const film = films[i];
        if (!film) return;
        const h3 = card.querySelector('.film-caption h3');
        const p = card.querySelector('.film-caption p');
        if (h3) addPin(h3, 'edit', 'Editar título del video', () => editField(h3, () => film.title, v => { film.title = v; w.save('Video actualizado.'); }), 'text');
        if (p) addPin(p, 'edit', 'Editar descripción del video', () => editField(p, () => film.caption, v => { film.caption = v; w.save('Video actualizado.'); }), 'text');
      });
    }

    requestAnimationFrame(placePins);
    [250, 700, 1400].forEach(t => setTimeout(() => { if (editing) placePins(); }, t));
    if (contentObserver) {
      contentObserver.disconnect();
      const content = $('#storySections');
      if (content) contentObserver.observe(content);
    }
    $$('#storySections img').forEach(img => { if (!img.complete) img.addEventListener('load', schedule, { once: true }); });
  }

  /* ---------- edición de texto ---------- */
  function editCopy(el, key) {
    editField(el, () => w.state.content.copy[key], v => {
      w.state.content.copy[key] = v;
      w.save('Texto actualizado.');
      w.applyCopy();
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
      const prevTransform = el.style.textTransform;
      el.style.textTransform = 'none';
      const value = el.innerText.replace(/\s+/g, ' ').trim();
      el.style.textTransform = prevTransform;
      if (commit && value && value !== original) {
        set(value);
        if (!reapply) el.textContent = value;
      } else {
        if (reapply) { try { w.applyCopy(); } catch (e) { el.innerHTML = originalHTML; } }
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

  /* ---------- imagen ---------- */
  function pickImage(item, banner, img) {
    pendingImage = { item, banner, img };
    fileInput.value = '';
    fileInput.click();
  }
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file || !pendingImage) return;
    const target = pendingImage;
    try {
      const key = await w.putImage(file);
      if (target.banner) {
        w.state.bannerKey = key;
      } else {
        const oldNatural = target.img && target.img.naturalWidth && target.img.naturalHeight
          ? target.img.naturalWidth / target.img.naturalHeight
          : null;
        let newNatural = null;
        try {
          const bmp = await createImageBitmap(file);
          newNatural = bmp.width / bmp.height;
          if (bmp.close) bmp.close();
        } catch (err) { /* sin medición: conserva la forma actual */ }
        target.item.imageKey = key;
        if (oldNatural && newNatural && typeof target.item.ratio === 'number' && Math.abs(target.item.ratio - oldNatural) < 0.03) {
          target.item.ratio = round(newNatural);
        }
      }
      pendingImage = null;
      w.save(target.banner ? 'Banner actualizado.' : 'Imagen actualizada.');
      await w.render();
      toast(target.banner ? 'Banner actualizado.' : 'Imagen actualizada.');
    } catch (err) {
      toast(err.message || 'No se pudo subir la imagen.');
    }
  });

  /* ---------- quitar pieza ---------- */
  async function removeItem(item) {
    if (!confirm('¿Quitar «' + item.title + '» del área?\n\nPuedes recuperarla importando un respaldo.')) return;
    w.state.content.stories = w.state.content.stories.filter(s => s.id !== item.id);
    w.state.content.sections.forEach(s => { s.ids = s.ids.filter(id => id !== item.id); });
    w.save('Pieza eliminada.');
    await w.render();
    toast('Pieza eliminada.');
  }

  /* ---------- modales ---------- */
  const modal = doc.createElement('div');
  modal.className = 'we-modal';
  modal.hidden = true;
  doc.body.appendChild(modal);
  let shapeCtx = null;
  let pull = null;

  function closeModal() {
    modal.hidden = true;
    modal.innerHTML = '';
    shapeCtx = null;
    pull = null;
  }
  modal.addEventListener('click', e => {
    if (e.target === modal || e.target.closest('[data-close]')) closeModal();
  });
  doc.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.hidden) { e.preventDefault(); closeModal(); }
  });

  function ratioFor(item) {
    const r = Number(item.ratio);
    return r > 0 ? r : 1;
  }

  function openShape(item, img) {
    const natural = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : ratioFor(item);
    const start = ratioFor(item);
    let mode = Math.abs(start - natural) < 0.02 ? 'natural' : (Math.abs(start - 1) < 0.02 ? 'square' : 'rect');
    shapeCtx = { item, natural, ratio: mode === 'natural' ? natural : start, mode };

    modal.innerHTML = '<div class="we-card" role="dialog" aria-modal="true" aria-labelledby="we-shape-title">'
      + '<header class="we-card-head"><div><span class="we-kicker">Forma de la imagen</span><h2 id="we-shape-title">' + esc(item.title) + '</h2></div><button class="we-x" type="button" data-close aria-label="Cerrar">×</button></header>'
      + '<div class="we-preview" data-preview><img alt="" data-preview-img><span class="we-ratio" data-ratio></span><button class="we-handle" type="button" data-handle aria-label="Arrastra para cambiar el alto"></button></div>'
      + '<div class="we-chips"><button type="button" data-preset="natural">Natural</button><button type="button" data-preset="square">Cuadrada</button><button type="button" data-preset="rect">Rectángulo</button></div>'
      + '<p class="we-note">La imagen nunca se recorta: se ve completa dentro de la forma. Arrastra la barra inferior para ajustar el rectángulo.</p>'
      + '<footer class="we-card-foot"><button type="button" class="we-ghost" data-close>Cancelar</button><button type="button" class="we-apply" data-apply>Aplicar forma</button></footer>'
      + '</div>';
    modal.hidden = false;

    const preview = $('[data-preview]', modal);
    const ratioTag = $('[data-ratio]', modal);
    const previewImg = $('[data-preview-img]', modal);
    previewImg.src = img.currentSrc || img.src;
    previewImg.alt = img.alt || item.title;

    const render = () => {
      const pw = preview.clientWidth || 320;
      const ph = Math.max(110, Math.min(620, Math.round(pw / shapeCtx.ratio)));
      preview.style.height = ph + 'px';
      ratioTag.textContent = ratioLabel(shapeCtx.ratio);
      $$('.we-chips button', modal).forEach(b => b.classList.toggle('is-on', b.dataset.preset === shapeCtx.mode));
    };
    requestAnimationFrame(render);

    $$('.we-chips button', modal).forEach(b => {
      b.onclick = () => {
        shapeCtx.mode = b.dataset.preset;
        if (shapeCtx.mode === 'natural') shapeCtx.ratio = shapeCtx.natural;
        else if (shapeCtx.mode === 'square') shapeCtx.ratio = 1;
        render();
      };
    });

    const handle = $('[data-handle]', modal);
    handle.addEventListener('pointerdown', e => {
      e.preventDefault();
      shapeCtx.mode = 'rect';
      const r = preview.getBoundingClientRect();
      pull = { y: e.clientY, h: r.height, w: r.width };
      try { handle.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
    });
    handle.addEventListener('pointermove', e => {
      if (!pull) return;
      const h = Math.max(110, Math.min(640, pull.h + (e.clientY - pull.y)));
      shapeCtx.ratio = pull.w / h;
      preview.style.height = Math.round(h) + 'px';
      ratioTag.textContent = ratioLabel(shapeCtx.ratio);
      $$('.we-chips button', modal).forEach(b => b.classList.toggle('is-on', b.dataset.preset === 'rect'));
    });
    const stop = () => { pull = null; };
    handle.addEventListener('pointerup', stop);
    handle.addEventListener('pointercancel', stop);

    $('[data-apply]', modal).onclick = async () => {
      item.ratio = round(shapeCtx.ratio);
      shapeCtx = null;
      closeModal();
      w.save('Forma actualizada.');
      await w.render();
      toast('Forma actualizada.');
    };
  }

  function openAdd() {
    const sections = w.state.content.sections;
    modal.innerHTML = '<div class="we-card" role="dialog" aria-modal="true" aria-labelledby="we-add-title">'
      + '<header class="we-card-head"><div><span class="we-kicker">Nueva pieza</span><h2 id="we-add-title">Agregar al área</h2></div><button class="we-x" type="button" data-close aria-label="Cerrar">×</button></header>'
      + '<label class="we-field"><span>Título</span><input name="title" placeholder="Ej. Retrato en exterior" autocomplete="off"></label>'
      + '<label class="we-field"><span>Sección</span><select name="section"></select></label>'
      + '<label class="we-field"><span>Historia breve</span><textarea name="caption" rows="2" placeholder="Una breve historia de la pieza"></textarea></label>'
      + '<label class="we-field"><span>Imagen</span><input name="image" type="file" accept="image/*"></label>'
      + '<label class="we-field"><span>ID de YouTube (opcional)</span><input name="youtube" placeholder="Solo si la pieza es video"></label>'
      + '<p class="we-error" data-error></p>'
      + '<footer class="we-card-foot"><button type="button" class="we-ghost" data-close>Cancelar</button><button type="button" class="we-apply" data-add>Agregar pieza</button></footer>'
      + '</div>';
    modal.hidden = false;
    const sel = $('[name=section]', modal);
    sel.innerHTML = sections.map(s => '<option value="' + esc(s.id) + '">' + esc(s.name) + '</option>').join('');
    if (sections.length) sel.value = sections[sections.length - 1].id;
    const err = $('[data-error]', modal);
    setTimeout(() => $('[name=title]', modal).focus(), 60);

    $('[data-add]', modal).onclick = async () => {
      const title = $('[name=title]', modal).value.trim();
      const caption = $('[name=caption]', modal).value.trim();
      const youtubeId = $('[name=youtube]', modal).value.trim();
      const file = $('[name=image]', modal).files && $('[name=image]', modal).files[0];
      if (!title) { err.textContent = 'Escribe un título.'; return; }
      if (!file && !youtubeId) { err.textContent = 'Agrega una imagen o un ID de YouTube.'; return; }
      try {
        const item = { id: 'custom-' + Date.now(), title, caption };
        if (youtubeId) item.youtubeId = youtubeId;
        if (file) item.imageKey = await w.putImage(file);
        w.state.content.stories.push(item);
        const dest = sections.find(s => s.id === sel.value) || sections[sections.length - 1];
        if (dest) dest.ids.push(item.id);
        w.save('Pieza agregada.');
        closeModal();
        await w.render();
        toast('Pieza agregada a ' + (dest ? dest.name : 'la última sección') + '.');
      } catch (e) {
        err.textContent = e.message || 'No se pudo agregar la pieza.';
      }
    };
  }

  function openHelp() {
    modal.innerHTML = '<div class="we-card" role="dialog" aria-modal="true" aria-labelledby="we-help-title">'
      + '<header class="we-card-head"><div><span class="we-kicker">Cómo funciona</span><h2 id="we-help-title">Edición visual</h2></div><button class="we-x" type="button" data-close aria-label="Cerrar">×</button></header>'
      + '<div class="we-help">'
      + '<div><b>✎</b><p><strong>Textos.</strong> Toca el lápiz junto a un título, una historia o una sección. Escribe y pulsa Enter. Esc cancela.</p></div>'
      + '<div><b>⤢</b><p><strong>Forma.</strong> En cada imagen, el botón de forma permite dejarla natural, cuadrada o ajustar un rectángulo arrastrando la barra. Nunca se recorta.</p></div>'
      + '<div><b>＋</b><p><strong>Agregar.</strong> Añade una pieza con título, sección, historia e imagen (o un video de YouTube).</p></div>'
      + '<div><b>×</b><p><strong>Quitar.</strong> El botón rojo de la esquina retira la pieza de esta área. Pide confirmación.</p></div>'
      + '</div>'
      + '<p class="we-note">Todo se guarda en este navegador. Usa «Panel» para reordenar, cambiar el banner o descargar un respaldo.</p>'
      + '<footer class="we-card-foot"><button type="button" class="we-apply" data-close>Entendido</button></footer>'
      + '</div>';
    modal.hidden = false;
  }

  /* ---------- re-decorar cuando el motor vuelve a pintar ---------- */
  doc.addEventListener('wicho:render', () => { if (editing) decorate(); });
})();
