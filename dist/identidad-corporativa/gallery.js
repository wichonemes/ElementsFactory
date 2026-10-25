(() => {
  const STORE_KEY = 'wicho-identidad-editor-v1';
  const DB_NAME = 'wicho-identidad-images-v1';
  const defaults = (window.identidadProyectos || []).map((project, index) => ({ ...project, id: `source-${index + 1}` }));
  const baseCopy = {
    heroEyebrow: 'SISTEMAS VISUALES · MARCAS',
    title: 'Identidad corporativa',
    heroIntro: 'Ideas distintas, un lenguaje visual propio.',
    introEyebrow: 'EL LENGUAJE DE UNA MARCA',
    introTitle: 'Ideas que se vuelven reconocibles.',
    introText: 'Explora identidades creadas para proyectos de distintos mundos. Cada marca parte de una intención y encuentra su forma en el símbolo, el color, la tipografía y sus aplicaciones.'
  };
  const $ = (selector, root = document) => root.querySelector(selector);
  const grid = $('#projectGrid');
  const projectList = $('#adminProjectList');
  const status = $('#adminStatus');
  const panel = $('#adminPanel');
  const backdrop = $('#adminBackdrop');
  let dbPromise;
  let state = readState();
  let imageUrls = [];

  function readState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
      if (saved && Array.isArray(saved.projects)) return { copy: { ...baseCopy, ...(saved.copy || {}) }, bannerKey: saved.bannerKey || '', projects: saved.projects };
    } catch (error) { console.warn('No se pudo leer la personalización guardada.', error); }
    return { copy: { ...baseCopy }, bannerKey: '', projects: defaults.map(project => ({ ...project })) };
  }

  function saveState(message = 'Cambios guardados en este navegador.') {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
      status.textContent = message;
    } catch (error) {
      status.textContent = 'No se pudo guardar. Reduce las imágenes y vuelve a intentar.';
    }
  }

  function openDb() {
    if (!('indexedDB' in window)) return Promise.reject(new Error('Este navegador no permite guardar imágenes.'));
    if (!dbPromise) dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => request.result.createObjectStore('images');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return dbPromise;
  }

  async function saveImage(file) {
    if (!file || !file.type.startsWith('image/')) throw new Error('Selecciona un archivo de imagen.');
    const db = await openDb();
    const key = `image-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    await new Promise((resolve, reject) => {
      const tx = db.transaction('images', 'readwrite');
      tx.objectStore('images').put(file, key);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    return key;
  }

  async function isLandscape(file) {
    try {
      const image = await createImageBitmap(file);
      const landscape = image.width / image.height > 1.35;
      image.close();
      return landscape;
    } catch { return false; }
  }

  async function imageUrl(project) {
    if (project.imageKey) {
      const db = await openDb();
      const blob = await new Promise((resolve, reject) => {
        const request = db.transaction('images').objectStore('images').get(project.imageKey);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      if (blob) {
        const url = URL.createObjectURL(blob);
        imageUrls.push(url);
        return url;
      }
    }
    return `assets/${project.src}`;
  }

  async function bannerUrl() {
    if (!state.bannerKey) return 'assets/banner-identidad.jpg';
    const url = await imageUrl({ imageKey: state.bannerKey });
    return url;
  }

  function safeUrl(value) {
    try {
      const url = new URL(value, window.location.href);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '#';
    } catch { return '#'; }
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  }

  function splitAccent(value, tag = 'span') {
    const words = String(value || '').trim().split(/\s+/);
    if (words.length < 2) return escapeHtml(value);
    const final = words.pop();
    return `${escapeHtml(words.join(' '))} <${tag}>${escapeHtml(final)}</${tag}>`;
  }

  function applyCopy() {
    const eyebrow = $('#heroEyebrow');
    eyebrow.innerHTML = `<span></span> ${escapeHtml(state.copy.heroEyebrow)}`;
    $('#page-title').innerHTML = splitAccent(state.copy.title, 'em');
    $('#heroIntro').textContent = state.copy.heroIntro;
    $('#introEyebrow').textContent = state.copy.introEyebrow;
    $('#introTitle').innerHTML = splitAccent(state.copy.introTitle);
    $('#introText').textContent = state.copy.introText;
    document.title = `${state.copy.title} — Wicho Nemes`;
    document.querySelectorAll('[data-copy]').forEach(field => {
      const key = field.dataset.copy;
      field.value = key === 'title' ? state.copy.title : (state.copy[key] ?? '');
    });
  }

  async function renderGallery() {
    $('#projectCount').textContent = String(state.projects.length).padStart(2, '0');
    const pattern = ['tile--rectangle', '', '', 'tile--rectangle', '', '', '', 'tile--rectangle', '', '', '', ''];
    const cards = await Promise.all(state.projects.map(async (project, index) => {
      const shape = (project.wide ?? pattern[index % pattern.length]) ? 'tile--rectangle' : 'tile--square';
      const src = await imageUrl(project);
      return `<article class="project-card ${shape}">
        <a class="project-image" href="${escapeHtml(safeUrl(project.url))}" target="_blank" rel="noopener noreferrer" aria-label="Ver proyecto ${escapeHtml(project.name)}">
          <span class="project-arrow" aria-hidden="true">↗</span>
          <span class="project-art"><img src="${escapeHtml(src)}" alt="Identidad visual de ${escapeHtml(project.name)}" loading="lazy"></span>
          <span class="project-meta"><span class="project-title">${escapeHtml(project.name)}</span><span class="project-link">Ver proyecto <span aria-hidden="true">↗</span></span></span>
        </a>
      </article>`;
    }));
    grid.innerHTML = cards.join('');
  }

  async function renderAdminList() {
    $('#adminCount').textContent = `(${state.projects.length})`;
    const rows = await Promise.all(state.projects.map(async (project, index) => {
      const src = await imageUrl(project);
      return `<div class="admin-project" draggable="true" data-id="${escapeHtml(project.id)}" aria-label="Proyecto ${escapeHtml(project.name)}">
        <span class="drag-grip" aria-hidden="true">⠿</span><img src="${escapeHtml(src)}" alt="">
        <div class="admin-project-fields"><input aria-label="Nombre del proyecto" data-field="name" value="${escapeHtml(project.name)}"><input aria-label="Enlace del proyecto" data-field="url" value="${escapeHtml(project.url)}" placeholder="Enlace opcional">
        <label class="replace-image">Cambiar imagen<input type="file" data-image accept="image/*"></label></div>
        <div class="row-actions"><button type="button" data-move="-1" aria-label="Mover a la izquierda">←</button><button type="button" data-move="1" aria-label="Mover a la derecha">→</button><button type="button" class="delete-project" data-delete aria-label="Eliminar proyecto">×</button></div>
      </div>`;
    }));
    projectList.innerHTML = rows.join('');
  }

  async function renderAll() {
    imageUrls.forEach(url => URL.revokeObjectURL(url));
    imageUrls = [];
    applyCopy();
    const banner = await bannerUrl().catch(() => 'assets/banner-identidad.jpg');
    $('.hero-banner').src = banner;
    await Promise.all([renderGallery(), renderAdminList()]);
    document.dispatchEvent(new CustomEvent('wicho:render'));
  }

  function openAdmin(open) {
    panel.classList.toggle('is-open', open);
    panel.setAttribute('aria-hidden', String(!open));
    $('#adminToggle').setAttribute('aria-expanded', String(open));
    backdrop.hidden = !open;
    document.body.classList.toggle('admin-open', open);
    if (open) $('#adminClose').focus(); else $('#adminToggle').focus();
  }

  function moveProject(id, delta) {
    const index = state.projects.findIndex(project => project.id === id);
    const next = index + delta;
    if (index < 0 || next < 0 || next >= state.projects.length) return;
    [state.projects[index], state.projects[next]] = [state.projects[next], state.projects[index]];
    saveState('Orden actualizado.');
    renderAll();
  }

  $('#adminToggle').addEventListener('click', () => openAdmin(true));
  $('#adminClose').addEventListener('click', () => openAdmin(false));
  backdrop.addEventListener('click', () => openAdmin(false));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && panel.classList.contains('is-open')) openAdmin(false); });

  document.querySelectorAll('[data-copy]').forEach(field => field.addEventListener('input', () => {
    const key = field.dataset.copy;
    state.copy[key] = field.value;
    if (key === 'title') { $('#page-title').innerHTML = splitAccent(field.value, 'em'); document.title = `${field.value} — Wicho Nemes`; }
    else if (key === 'heroEyebrow') $('#heroEyebrow').innerHTML = `<span></span> ${escapeHtml(field.value)}`;
    else if (key === 'heroIntro') $('#heroIntro').textContent = field.value;
    else if (key === 'introEyebrow') $('#introEyebrow').textContent = field.value;
    else if (key === 'introTitle') $('#introTitle').innerHTML = splitAccent(field.value);
    else if (key === 'introText') $('#introText').textContent = field.value;
    saveState();
  }));

  $('#bannerFile').addEventListener('change', async event => {
    try {
      state.bannerKey = await saveImage(event.target.files[0]);
      saveState('Banner actualizado.');
      await renderAll();
    } catch (error) { status.textContent = error.message; }
  });

  $('#addProject').addEventListener('click', async () => {
    const name = $('#newName').value.trim();
    const file = $('#newImage').files[0];
    if (!name || !file) { status.textContent = 'Escribe un nombre y selecciona el logo para agregarlo.'; return; }
    try {
      const imageKey = await saveImage(file);
      state.projects.push({ id: `custom-${Date.now()}`, name, url: $('#newUrl').value.trim() || '#', imageKey, wide: await isLandscape(file) });
      $('#newName').value = '';
      $('#newUrl').value = '';
      $('#newImage').value = '';
      saveState('Proyecto agregado al final del mosaico.');
      await renderAll();
    } catch (error) { status.textContent = error.message; }
  });

  projectList.addEventListener('input', event => {
    const row = event.target.closest('.admin-project');
    if (!row || !event.target.dataset.field) return;
    const project = state.projects.find(item => item.id === row.dataset.id);
    if (!project) return;
    project[event.target.dataset.field] = event.target.value;
    saveState();
    if (event.target.dataset.field === 'name') {
      const card = [...grid.children].find((item, index) => state.projects[index]?.id === project.id);
      if (card) { $('.project-title', card).textContent = project.name; $('.project-image', card).setAttribute('aria-label', `Ver proyecto ${project.name}`); $('img', card).alt = `Identidad visual de ${project.name}`; }
    }
  });

  projectList.addEventListener('change', async event => {
    const row = event.target.closest('.admin-project');
    if (!row) return;
    const project = state.projects.find(item => item.id === row.dataset.id);
    if (event.target.matches('[data-image]') && event.target.files[0] && project) {
      try { project.imageKey = await saveImage(event.target.files[0]); project.wide = await isLandscape(event.target.files[0]); saveState('Imagen reemplazada y mosaico reajustado.'); await renderAll(); }
      catch (error) { status.textContent = error.message; }
    }
    if (event.target.matches('[data-field="url"]') && project) {
      const card = [...grid.children].find((item, index) => state.projects[index]?.id === project.id);
      if (card) { $('a.project-image', card).href = safeUrl(project.url); }
    }
  });

  projectList.addEventListener('click', event => {
    const row = event.target.closest('.admin-project');
    if (!row) return;
    const id = row.dataset.id;
    if (event.target.closest('[data-move]')) moveProject(id, Number(event.target.closest('[data-move]').dataset.move));
    if (event.target.closest('[data-delete]')) {
      state.projects = state.projects.filter(project => project.id !== id);
      saveState('Proyecto eliminado.');
      renderAll();
    }
  });

  let draggedId = '';
  projectList.addEventListener('dragstart', event => {
    const row = event.target.closest('.admin-project');
    if (!row) return;
    draggedId = row.dataset.id;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', draggedId);
    row.classList.add('is-dragging');
  });
  projectList.addEventListener('dragend', event => event.target.closest('.admin-project')?.classList.remove('is-dragging'));
  projectList.addEventListener('dragover', event => { if (event.target.closest('.admin-project')) { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; } });
  projectList.addEventListener('drop', event => {
    const target = event.target.closest('.admin-project');
    if (!target || !draggedId || draggedId === target.dataset.id) return;
    event.preventDefault();
    const from = state.projects.findIndex(project => project.id === draggedId);
    const to = state.projects.findIndex(project => project.id === target.dataset.id);
    const [project] = state.projects.splice(from, 1);
    state.projects.splice(to, 0, project);
    draggedId = '';
    saveState('Orden actualizado.');
    renderAll();
  });

  $('#exportAdmin').addEventListener('click', async () => {
    try {
      const keys = [...new Set([state.bannerKey, ...state.projects.map(project => project.imageKey)].filter(Boolean))];
      const db = await openDb();
      const images = {};
      for (const key of keys) {
        const blob = await new Promise((resolve, reject) => {
          const request = db.transaction('images').objectStore('images').get(key);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        if (blob) images[key] = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(blob);
        });
      }
      const backup = { format: 'wicho-identidad-backup-v1', state, images };
      const link = document.createElement('a');
      link.href = URL.createObjectURL(new Blob([JSON.stringify(backup)], { type: 'application/json' }));
      link.download = 'respaldo-identidad-wicho.json';
      link.click();
      URL.revokeObjectURL(link.href);
      status.textContent = 'Respaldo descargado. Puedes importarlo en otro dispositivo.';
    } catch (error) { status.textContent = `No se pudo crear el respaldo: ${error.message}`; }
  });

  $('#importAdmin').addEventListener('change', async event => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const backup = JSON.parse(await file.text());
      if (backup.format !== 'wicho-identidad-backup-v1' || !Array.isArray(backup.state?.projects)) throw new Error('El archivo no es un respaldo válido de Identidad.');
      const db = await openDb();
      await new Promise((resolve, reject) => {
        const tx = db.transaction('images', 'readwrite');
        tx.objectStore('images').clear();
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
      for (const [key, dataUrl] of Object.entries(backup.images || {})) {
        const blob = await fetch(dataUrl).then(response => response.blob());
        await new Promise((resolve, reject) => {
          const tx = db.transaction('images', 'readwrite');
          tx.objectStore('images').put(blob, key);
          tx.oncomplete = resolve;
          tx.onerror = () => reject(tx.error);
        });
      }
      state = { copy: { ...baseCopy, ...(backup.state.copy || {}) }, bannerKey: backup.state.bannerKey || '', projects: backup.state.projects };
      saveState('Respaldo importado.');
      await renderAll();
    } catch (error) { status.textContent = `No se pudo importar: ${error.message}`; }
    event.target.value = '';
  });

  $('#resetAdmin').addEventListener('click', async () => {
    if (!window.confirm('¿Restablecer los textos, imágenes y el orden original de esta sección?')) return;
    localStorage.removeItem(STORE_KEY);
    state = { copy: { ...baseCopy }, bannerKey: '', projects: defaults.map(project => ({ ...project })) };
    if (dbPromise) { const db = await dbPromise; await new Promise(resolve => { const tx = db.transaction('images', 'readwrite'); tx.objectStore('images').clear(); tx.oncomplete = tx.onerror = resolve; }); }
    saveState('Se restauró el contenido original.');
    await renderAll();
  });

  window.__identidad={get state(){return state},save:saveState,render:renderAll,saveImage,imageUrl,applyCopy,openAdmin,defaults};
  renderAll();
})();
