const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const downloadsDir = path.join(__dirname, '..', 'public', 'downloads');
if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });

// Convertir imágenes a base64 para que el PDF sea 100% autónomo
const toBase64 = (relPath) => {
  const fullPath = path.join(__dirname, '..', relPath);
  if (fs.existsSync(fullPath)) {
    const ext = path.extname(fullPath).replace('.', '');
    const data = fs.readFileSync(fullPath).toString('base64');
    return `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${data}`;
  }
  return '';
};

const imgGym = toBase64('public/uploads/contexto_gimnasio_nfc.jpg');
const imgBarber = toBase64('public/uploads/contexto_barberia_pack.jpg');
const imgOffice = toBase64('public/uploads/contexto_home_office.jpg');
const imgFox = toBase64('public/uploads/contexto_zorro_lowpoly.jpg');
const imgTray = toBase64('public/uploads/bundle_promo_hogar_1.jpg') || toBase64('public/uploads/bandeja_vaciabolsillos_ovalada_contexto.jpg');

const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Catálogo Móvil · Artesano Digital</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');

    @page {
      size: 405pt 720pt; /* Proporción 9:16 vertical de smartphone */
      margin: 0;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #19261E;
      color: #FBF9F5;
      font-size: 11pt;
    }

    .page {
      width: 405pt;
      height: 720pt;
      page-break-after: always;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    /* Fondo de imagen de contexto que llena toda la página vertical */
    .bg-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      z-index: 1;
    }

    /* Degradado sutil para legibilidad de textos */
    .gradient-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        180deg,
        rgba(20, 34, 27, 0.45) 0%,
        rgba(20, 34, 27, 0.05) 30%,
        rgba(20, 34, 27, 0.20) 50%,
        rgba(15, 26, 21, 0.94) 80%,
        rgba(15, 26, 21, 0.99) 100%
      );
      z-index: 2;
    }

    .content {
      position: relative;
      z-index: 3;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 22pt 18pt 20pt 18pt;
    }

    /* Encabezado superior de página */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6pt 12pt;
      background: rgba(18, 30, 24, 0.65);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border-radius: 20pt;
      border: 0.5pt solid rgba(255, 255, 255, 0.15);
    }

    .brand-pill {
      font-size: 8.5pt;
      font-weight: 800;
      letter-spacing: 1.2pt;
      text-transform: uppercase;
      color: #F3E5AB;
      display: flex;
      align-items: center;
      gap: 4pt;
    }

    .tag-pill {
      font-size: 7.5pt;
      font-weight: 600;
      color: #E2D9C8;
      background: rgba(255, 255, 255, 0.12);
      padding: 2pt 7pt;
      border-radius: 12pt;
    }

    /* Tarjeta inferior tipo Lookbook flotante */
    .lookbook-card {
      background: rgba(18, 28, 23, 0.88);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 0.8pt solid rgba(212, 163, 89, 0.35);
      border-radius: 18pt;
      padding: 13pt 14pt 12pt 14pt;
      box-shadow: 0 12pt 24pt rgba(0, 0, 0, 0.45);
    }

    .collection-badge {
      display: inline-block;
      font-size: 7pt;
      font-weight: 800;
      letter-spacing: 0.8pt;
      text-transform: uppercase;
      background: rgba(212, 163, 89, 0.20);
      color: #F3E5AB;
      border: 0.5pt solid rgba(212, 163, 89, 0.50);
      padding: 2pt 7pt;
      border-radius: 6pt;
      margin-bottom: 4pt;
    }

    .card-title-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 2pt;
    }

    .card-title {
      font-size: 13pt;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -0.3pt;
    }

    .combo-price-subtle {
      font-size: 10pt;
      font-weight: 700;
      color: #E6D2B5;
      background: rgba(255, 255, 255, 0.08);
      border: 0.5pt solid rgba(212, 163, 89, 0.30);
      padding: 2pt 8pt;
      border-radius: 8pt;
      font-family: 'Inter', sans-serif;
    }

    .card-subtitle {
      font-size: 8pt;
      color: #A3B899;
      margin-bottom: 8pt;
      line-height: 1.3;
    }

    /* Lista de productos contextuales */
    .items-list {
      display: flex;
      flex-direction: column;
      gap: 5.5pt;
      border-top: 0.5pt solid rgba(255, 255, 255, 0.10);
      padding-top: 7pt;
    }

    .product-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255, 255, 255, 0.04);
      border: 0.5pt solid rgba(255, 255, 255, 0.06);
      border-radius: 8pt;
      padding: 4.5pt 8pt;
      text-decoration: none;
      color: inherit;
    }

    .prod-info {
      display: flex;
      flex-direction: column;
      gap: 1pt;
    }

    .prod-name {
      font-size: 8.8pt;
      font-weight: 700;
      color: #F8F6F0;
    }

    .prod-meta {
      font-size: 7.2pt;
      color: #94A3B8;
      display: flex;
      align-items: center;
      gap: 4pt;
    }

    .prod-price-discreet {
      font-size: 8.8pt;
      font-weight: 700;
      color: #D4A359;
      font-family: 'Inter', sans-serif;
      text-align: right;
    }

    /* Botón directo a MakerWorld */
    .makerworld-link {
      display: inline-flex;
      align-items: center;
      gap: 2.5pt;
      background: rgba(45, 79, 62, 0.90);
      color: #F3E5AB;
      border: 0.5pt solid rgba(212, 163, 89, 0.55);
      border-radius: 6pt;
      padding: 2.5pt 6pt;
      font-size: 7pt;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .makerworld-link:hover {
      background: #D4A359;
      color: #121C17;
    }

    /* PORTADA */
    .cover-page {
      background: radial-gradient(circle at 50% 30%, #2A4838 0%, #172B20 60%, #0F1C15 100%);
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 30pt 25pt;
    }

    .cover-border {
      border: 1pt solid rgba(212, 163, 89, 0.40);
      border-radius: 24pt;
      padding: 32pt 18pt;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      background: rgba(18, 30, 23, 0.55);
      backdrop-filter: blur(10pt);
    }

    .cover-logo-box {
      width: 64pt;
      height: 64pt;
      border-radius: 20pt;
      background: linear-gradient(135deg, #D4A359 0%, #A67C37 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28pt;
      box-shadow: 0 8pt 20pt rgba(0, 0, 0, 0.40);
      margin-bottom: 12pt;
    }

    .cover-title {
      font-size: 22pt;
      font-weight: 800;
      letter-spacing: 1.5pt;
      text-transform: uppercase;
      color: #FFFFFF;
      line-height: 1.1;
      margin-bottom: 6pt;
    }

    .cover-subtitle {
      font-size: 9.5pt;
      font-weight: 600;
      letter-spacing: 2pt;
      text-transform: uppercase;
      color: #D4A359;
      margin-bottom: 14pt;
    }

    .cover-desc {
      font-size: 9pt;
      line-height: 1.5;
      color: #C8D6C6;
      max-width: 280pt;
      margin: 0 auto 18pt auto;
    }

    .cover-pill-tech {
      display: inline-flex;
      gap: 6pt;
      flex-wrap: wrap;
      justify-content: center;
      margin-bottom: 15pt;
    }

    .cover-chip {
      font-size: 7.5pt;
      font-weight: 700;
      padding: 3pt 8pt;
      border-radius: 12pt;
      background: rgba(255, 255, 255, 0.08);
      border: 0.5pt solid rgba(255, 255, 255, 0.15);
      color: #E6E1D5;
    }

    .cover-btn-whatsapp {
      display: inline-flex;
      align-items: center;
      gap: 6pt;
      background: #25D366;
      color: #0A2413;
      padding: 9pt 18pt;
      border-radius: 16pt;
      font-size: 9.5pt;
      font-weight: 800;
      text-decoration: none;
      box-shadow: 0 4pt 15pt rgba(37, 211, 102, 0.35);
    }

    /* CONTRAPORTADA */
    .backcover-page {
      background: radial-gradient(circle at 50% 70%, #203A2D 0%, #122119 70%, #0B1610 100%);
      padding: 30pt 22pt;
      text-align: center;
      justify-content: space-between;
    }

    .contact-card {
      background: rgba(255, 255, 255, 0.05);
      border: 0.8pt solid rgba(212, 163, 89, 0.35);
      border-radius: 18pt;
      padding: 16pt;
      margin-top: 10pt;
      text-align: left;
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: 8pt;
      padding: 6pt 0;
      border-bottom: 0.5pt solid rgba(255, 255, 255, 0.08);
      font-size: 8.8pt;
      color: #EDE8DE;
      text-decoration: none;
    }

    .contact-item:last-child {
      border-bottom: none;
    }
  </style>
</head>
<body>

  <!-- ========================================== -->
  <!-- PÁGINA 1: PORTADA EDITORIAL SMARTPHONE     -->
  <!-- ========================================== -->
  <div class="page cover-page">
    <div class="cover-border">
      
      <div>
        <div class="brand-pill" style="justify-content: center; margin-bottom: 6pt;">
          ★ TALLER DE MANUFACTURA DIGITAL
        </div>
        <p style="font-size: 8pt; color: #94A3B8; letter-spacing: 0.8pt;">SAN LUIS POTOSÍ · MÉXICO</p>
      </div>

      <div style="display: flex; flex-direction: column; align-items: center;">
        <div class="cover-logo-box">
          ⚡
        </div>
        <h1 class="cover-title">ARTESANO<br>DIGITAL</h1>
        <div class="cover-subtitle">Líneas de Creación &amp; Catálogo 2026</div>
        
        <p class="cover-desc">
          "Si lo piensas, se hace." Combinamos tecnología de <strong>impresión 3D de alta velocidad</strong>, corte láser CNC y acabados artesanales para dar vida a proyectos únicos.
        </p>

        <div class="cover-pill-tech">
          <span class="cover-chip">🧊 Granja 3D (Bambu Lab)</span>
          <span class="cover-chip">🔥 Corte Láser 90x60</span>
          <span class="cover-chip">📲 Mostradores Smart NFC</span>
          <span class="cover-chip">✂️ Vinil Textil &amp; Grabado</span>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; align-items: center; gap: 8pt; width: 100%;">
        <a href="https://wa.me/524440000000?text=Hola%20Artesano%20Digital,%20quiero%20cotizar%20un%20proyecto" class="cover-btn-whatsapp" target="_blank">
          <span>💬</span>
          <span>Cotizar por WhatsApp</span>
        </a>
        <span style="font-size: 7.5pt; color: #8F9E8D;">
          Enlaces interactivos 3D incluidos para manufactura en MakerWorld
        </span>
      </div>

    </div>
  </div>

  <!-- ========================================== -->
  <!-- PÁGINA 2: PACK SMART NFC & GIMNASIOS       -->
  <!-- ========================================== -->
  <div class="page">
    <img src="${imgGym}" class="bg-image" alt="Contexto Gimnasio Smart NFC">
    <div class="gradient-overlay"></div>

    <div class="content">
      <div class="page-header">
        <div class="brand-pill">
          <span>⚡</span>
          <span>ARTESANO DIGITAL</span>
        </div>
        <div class="tag-pill">01 / NEGOCIOS &amp; MARCA</div>
      </div>

      <div class="lookbook-card">
        <div class="collection-badge">PACK MOSTRADOR INTELIGENTE</div>
        
        <div class="card-title-row">
          <h2 class="card-title">Kit Smart NFC &amp; Identidad</h2>
          <span class="combo-price-subtle">Combo: $780 MXN</span>
        </div>
        <p class="card-subtitle">
          Digitaliza la recepción de tu negocio o box de crossfit con tecnología NFC de registro instantáneo y merchandising de marca.
        </p>

        <div class="items-list">
          
          <div class="product-row">
            <div class="prod-info">
              <span class="prod-name">Display de Mostrador Smart NFC &amp; QR (T39)</span>
              <span class="prod-meta">Impreso en 3D grafito texturizado con chip NFC NTAG213</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6pt;">
              <span class="prod-price-discreet">$280</span>
              <a href="https://makerworld.com/en/search/models?keyword=nfc+stand+qr+display" class="makerworld-link" target="_blank">
                📥 3D MakerWorld
              </a>
            </div>
          </div>

          <div class="product-row">
            <div class="prod-info">
              <span class="prod-name">Soporte Celular Ángulo de Carga (T7)</span>
              <span class="prod-meta">Base antideslizante con paso de cable USB-C</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6pt;">
              <span class="prod-price-discreet">$129</span>
              <a href="https://makerworld.com/en/search/models?keyword=phone+stand+desk+charging" class="makerworld-link" target="_blank">
                📥 3D MakerWorld
              </a>
            </div>
          </div>

          <div class="product-row">
            <div class="prod-info">
              <span class="prod-name">Llavero Disco Olímpico con Tu Marca (T1)</span>
              <span class="prod-meta">Impresión bicolor en relieve con argolla reforzada</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6pt;">
              <span class="prod-price-discreet">$45</span>
              <a href="https://makerworld.com/en/search/models?keyword=weight+plate+keychain+gym" class="makerworld-link" target="_blank">
                📥 3D MakerWorld
              </a>
            </div>
          </div>

          <div class="product-row">
            <div class="prod-info">
              <span class="prod-name">Medalla de Premiación Deportiva Relieve (L12)</span>
              <span class="prod-meta">Oro cepillado con cinta textil verde olivo</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6pt;">
              <span class="prod-price-discreet">$65</span>
              <a href="https://makerworld.com/en/search/models?keyword=trophy+medal+award+3d" class="makerworld-link" target="_blank">
                📥 3D MakerWorld
              </a>
            </div>
          </div>

          <div class="product-row">
            <div class="prod-info">
              <span class="prod-name">Botella / Termo Grabado Láser Personalizado</span>
              <span class="prod-meta">Acero inoxidable 750ml con grabado indeleble</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6pt;">
              <span class="prod-price-discreet">$260</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>

  <!-- ========================================== -->
  <!-- PÁGINA 3: STARTER PACK BARBERÍA & SALÓN    -->
  <!-- ========================================== -->
  <div class="page">
    <img src="${imgBarber}" class="bg-image" alt="Contexto Barbería y Salón">
    <div class="gradient-overlay"></div>

    <div class="content">
      <div class="page-header">
        <div class="brand-pill">
          <span>⚡</span>
          <span>ARTESANO DIGITAL</span>
        </div>
        <div class="tag-pill">02 / ESTACIONES DE TRABAJO</div>
      </div>

      <div class="lookbook-card">
        <div class="collection-badge">EDICIÓN BARBERÍA &amp; SALÓN</div>
        
        <div class="card-title-row">
          <h2 class="card-title">Starter Pack Barbería &amp; Boutique</h2>
          <span class="combo-price-subtle">Set 27 pzas: $890 MXN</span>
        </div>
        <p class="card-subtitle">
          Organización profesional para estaciones de barbero y estilistas. Máxima higiene, ergonomía y elegancia en tu mesa de trabajo.
        </p>

        <div class="items-list">
          
          <div class="product-row">
            <div class="prod-info">
              <span class="prod-name">Organizador Escalonado de Peines / Guards (T40)</span>
              <span class="prod-meta">8 ranuras en ángulo para peines guía clipper en PLA grafito</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6pt;">
              <span class="prod-price-discreet">$195</span>
              <a href="https://makerworld.com/en/search/models?keyword=clipper+guard+holder+barber" class="makerworld-link" target="_blank">
                📥 3D MakerWorld
              </a>
            </div>
          </div>

          <div class="product-row">
            <div class="prod-info">
              <span class="prod-name">Porta Tijeras &amp; Utensilios Estriado (T11)</span>
              <span class="prod-meta">Diseño acanalado marfil con base acolchada para tijeras y navajas</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6pt;">
              <span class="prod-price-discreet">$119</span>
              <a href="https://makerworld.com/en/search/models?keyword=fluted+pencil+holder+vase" class="makerworld-link" target="_blank">
                📥 3D MakerWorld
              </a>
            </div>
          </div>

          <div class="product-row">
            <div class="prod-info">
              <span class="prod-name">Placa QR de Cobro &amp; Citas Verde Olivo (T39B)</span>
              <span class="prod-meta">Para transferencias CoDi/SPEI o enlace directo a Instagram</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6pt;">
              <span class="prod-price-discreet">$149</span>
              <a href="https://makerworld.com/en/search/models?keyword=qr+code+stand+business" class="makerworld-link" target="_blank">
                📥 3D MakerWorld
              </a>
            </div>
          </div>

          <div class="product-row">
            <div class="prod-info">
              <span class="prod-name">Tarjetero de Citas &amp; Mostrador Terracota (T28)</span>
              <span class="prod-meta">Ranura ergonómica para tarjetas de presentación 9x5 cm</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6pt;">
              <span class="prod-price-discreet">$89</span>
              <a href="https://makerworld.com/en/search/models?keyword=business+card+holder+desk" class="makerworld-link" target="_blank">
                📥 3D MakerWorld
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>

  <!-- ========================================== -->
  <!-- PÁGINA 4: ESTACIÓN HOME OFFICE & SETUP     -->
  <!-- ========================================== -->
  <div class="page">
    <img src="${imgOffice}" class="bg-image" alt="Contexto Home Office y Escritorio">
    <div class="gradient-overlay"></div>

    <div class="content">
      <div class="page-header">
        <div class="brand-pill">
          <span>⚡</span>
          <span>ARTESANO DIGITAL</span>
        </div>
        <div class="tag-pill">03 / HOME OFFICE &amp; GAMER</div>
      </div>

      <div class="lookbook-card">
        <div class="collection-badge">SETUP MINIMALISTA</div>
        
        <div class="card-title-row">
          <h2 class="card-title">Kit Home Office &amp; Gamer Pro</h2>
          <span class="combo-price-subtle">Kit 4 pzas: $520 MXN</span>
        </div>
        <p class="card-subtitle">
          Despeja tu escritorio y mantén tus cables, celular y papelería perfectamente ordenados con un toque botánico cálido.
        </p>

        <div class="items-list">
          
          <div class="product-row">
            <div class="prod-info">
              <span class="prod-name">Soporte Smartphone Vertical Texturizado (T7)</span>
              <span class="prod-meta">Inclinación ergonómica de 65° con paso para cable de carga</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6pt;">
              <span class="prod-price-discreet">$129</span>
              <a href="https://makerworld.com/en/search/models?keyword=phone+stand+charging+cable" class="makerworld-link" target="_blank">
                📥 3D MakerWorld
              </a>
            </div>
          </div>

          <div class="product-row">
            <div class="prod-info">
              <span class="prod-name">Organizador de Mesa Ranurado Verde Olivo (T37)</span>
              <span class="prod-meta">Doble compartimento para notas, clips y bolígrafos</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6pt;">
              <span class="prod-price-discreet">$180</span>
              <a href="https://makerworld.com/en/search/models?keyword=desk+organizer+pen+stationery" class="makerworld-link" target="_blank">
                📥 3D MakerWorld
              </a>
            </div>
          </div>

          <div class="product-row">
            <div class="prod-info">
              <span class="prod-name">Portalápices Geométrico Low-Poly Facetado (T11)</span>
              <span class="prod-meta">Acabado blanco mate sedoso estilo polímero cerámico</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6pt;">
              <span class="prod-price-discreet">$119</span>
              <a href="https://makerworld.com/en/search/models?keyword=low+poly+geometric+pencil+holder" class="makerworld-link" target="_blank">
                📥 3D MakerWorld
              </a>
            </div>
          </div>

          <div class="product-row">
            <div class="prod-info">
              <span class="prod-name">Sujetacables Minimalista en Madera Natural (T12)</span>
              <span class="prod-meta">4 ranuras biseladas para organizar cables USB y laptop</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6pt;">
              <span class="prod-price-discreet">$59</span>
              <a href="https://makerworld.com/en/search/models?keyword=cable+holder+organizer+desk" class="makerworld-link" target="_blank">
                📥 3D MakerWorld
              </a>
            </div>
          </div>

          <div class="product-row">
            <div class="prod-info">
              <span class="prod-name">Dock Macropad / Teclado Atajos de Escritorio (T42)</span>
              <span class="prod-meta">Teclas de colores en relieve para control de música y juegos</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6pt;">
              <span class="prod-price-discreet">$240</span>
              <a href="https://makerworld.com/en/search/models?keyword=macropad+shortcuts+desk+dock" class="makerworld-link" target="_blank">
                📥 3D MakerWorld
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>

  <!-- ========================================== -->
  <!-- PÁGINA 5: ARTE BOTÁNICO, ZORRO & HOGAR     -->
  <!-- ========================================== -->
  <div class="page">
    <img src="${imgFox}" class="bg-image" alt="Contexto Zorro Low Poly y Naturaleza">
    <div class="gradient-overlay"></div>

    <div class="content">
      <div class="page-header">
        <div class="brand-pill">
          <span>⚡</span>
          <span>ARTESANO DIGITAL</span>
        </div>
        <div class="tag-pill">04 / COLECCIONABLES &amp; HOGAR</div>
      </div>

      <div class="lookbook-card">
        <div class="collection-badge">ARTE GEOMÉTRICO &amp; DECORACIÓN</div>
        
        <div class="card-title-row">
          <h2 class="card-title">Colección Zorro Low-Poly &amp; Hogar</h2>
          <span class="combo-price-subtle">Set: $289 MXN</span>
        </div>
        <p class="card-subtitle">
          Figuras tridimensionales facetadas con acabados mate de alta precisión, acompañadas de complementos para el hogar.
        </p>

        <div class="items-list">
          
          <div class="product-row">
            <div class="prod-info">
              <span class="prod-name">Figura Zorro Geométrico Low-Poly 3D (T43)</span>
              <span class="prod-meta">Impresión bicolor en capas terracota y blanco marfil (12 cm)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6pt;">
              <span class="prod-price-discreet">$169</span>
              <a href="https://makerworld.com/en/search/models?keyword=low+poly+fox+sculpture" class="makerworld-link" target="_blank">
                📥 3D MakerWorld
              </a>
            </div>
          </div>

          <div class="product-row">
            <div class="prod-info">
              <span class="prod-name">Llavero Cabeza de Zorro Facetada (T44)</span>
              <span class="prod-meta">Miniatura ultraligera con argolla niquelada reforzada</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6pt;">
              <span class="prod-price-discreet">$45</span>
              <a href="https://makerworld.com/en/search/models?keyword=low+poly+fox+keychain" class="makerworld-link" target="_blank">
                📥 3D MakerWorld
              </a>
            </div>
          </div>

          <div class="product-row">
            <div class="prod-info">
              <span class="prod-name">Bandeja Vaciabolsillos Ovalada Mate (T29)</span>
              <span class="prod-meta">Bordes suaves para recibidor, llaves, monedas y joyas</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6pt;">
              <span class="prod-price-discreet">$149</span>
              <a href="https://makerworld.com/en/search/models?keyword=oval+valet+tray+minimalist" class="makerworld-link" target="_blank">
                📥 3D MakerWorld
              </a>
            </div>
          </div>

          <div class="product-row">
            <div class="prod-info">
              <span class="prod-name">Maceta Espiral Geométrica (T6)</span>
              <span class="prod-meta">Diseño helicoidal para suculentas y plantas pequeñas</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6pt;">
              <span class="prod-price-discreet">$149</span>
              <a href="https://makerworld.com/en/search/models?keyword=spiral+planter+vase+geometric" class="makerworld-link" target="_blank">
                📥 3D MakerWorld
              </a>
            </div>
          </div>

          <div class="product-row">
            <div class="prod-info">
              <span class="prod-name">Pack Stickers Troquelados Arte Botánico</span>
              <span class="prod-meta">Vinil adhesivo laminado resistente a la intemperie y agua</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6pt;">
              <span class="prod-price-discreet">$35</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>

  <!-- ========================================== -->
  <!-- PÁGINA 6: CONTRAPORTADA & CONTACTO         -->
  <!-- ========================================== -->
  <div class="page backcover-page">
    <div class="content" style="padding: 10pt 0;">
      
      <div style="text-align: center; margin-top: 15pt;">
        <div class="brand-pill" style="display: inline-flex; margin-bottom: 8pt;">
          ★ MANUFACTURA LOCAL &amp; MAYOREO
        </div>
        <h2 style="font-size: 18pt; font-weight: 800; color: #FFFFFF; line-height: 1.2;">
          ¿Tienes un diseño o maquila en mente?
        </h2>
        <p style="font-size: 9pt; color: #C2D1C0; max-width: 280pt; margin: 8pt auto 0 auto; line-height: 1.4;">
          Fabricamos desde 1 pieza personalizada para regalo hasta lotes de <strong>500+ piezas para empresas</strong> con descuentos escalonados y entrega en tiempo récord.
        </p>
      </div>

      <div class="contact-card">
        <h3 style="font-size: 10.5pt; font-weight: 800; color: #F3E5AB; margin-bottom: 8pt; text-transform: uppercase; letter-spacing: 0.8pt;">
          Canales de Contacto Directo:
        </h3>

        <a href="https://wa.me/524440000000?text=Hola%20Artesano%20Digital,%20me%20gustar%C3%ADa%20cotizar%20un%20proyecto" class="contact-item" target="_blank">
          <span style="font-size: 14pt;">💬</span>
          <div>
            <strong style="display: block; color: #25D366;">WhatsApp Oficial de Ventas</strong>
            <span style="font-size: 7.5pt; color: #94A3B8;">Respuesta inmediata y cotizaciones al momento</span>
          </div>
        </a>

        <a href="https://makerworld.com/en/search/models?keyword=artesano+digital" class="contact-item" target="_blank">
          <span style="font-size: 14pt;">🌐</span>
          <div>
            <strong style="display: block; color: #F3E5AB;">Repositorio 3D Oficial (MakerWorld)</strong>
            <span style="font-size: 7.5pt; color: #94A3B8;">Accede a los modelos STL/3MF listos para imprimir</span>
          </div>
        </a>

        <a href="https://artesanodigital.mx" class="contact-item" target="_blank">
          <span style="font-size: 14pt;">🛍️</span>
          <div>
            <strong style="display: block; color: #FFFFFF;">Tienda Web &amp; Simulador en Vivo</strong>
            <span style="font-size: 7.5pt; color: #94A3B8;">artesanodigital.mx · Catálogo completo con 57 piezas</span>
          </div>
        </a>

        <div class="contact-item">
          <span style="font-size: 14pt;">📍</span>
          <div>
            <strong style="display: block; color: #FFFFFF;">Taller Artesanal &amp; Fabricación</strong>
            <span style="font-size: 7.5pt; color: #94A3B8;">San Luis Potosí, S.L.P. · Envíos seguros a todo México</span>
          </div>
        </div>
      </div>

      <div style="text-align: center; padding-top: 12pt;">
        <p style="font-size: 7.5pt; color: #64748B;">
          © 2026 Artesano Digital · Todos los derechos reservados.<br>
          Modelos 3D optimizados para Bambu Lab A1, A1 Mini y Creator 5.
        </p>
      </div>

    </div>
  </div>

</body>
</html>
`;

const htmlFilePath = path.join(downloadsDir, 'catalogo_movil_preview.html');
const pdfFilePath = path.join(downloadsDir, 'catalogo_movil_artesano_digital.pdf');

fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
console.log('HTML de catálogo móvil generado en:', htmlFilePath);

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const bin = fs.existsSync(edgePath) ? edgePath : chromePath;

console.log('Compilando PDF para smartphone con Chromium headless...');
const cmd = `"${bin}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfFilePath}" "file:///${htmlFilePath.replace(/\\/g, '/')}"`;

execSync(cmd, { stdio: 'inherit' });

if (fs.existsSync(pdfFilePath)) {
  const sizeKb = Math.round(fs.statSync(pdfFilePath).size / 1024);
  console.log(`¡Catálogo PDF para celular generado exitosamente! (${sizeKb} KB)`);
  console.log(`Ruta del PDF: ${pdfFilePath}`);
} else {
  console.error('Error: No se pudo generar el archivo PDF.');
  process.exit(1);
}
