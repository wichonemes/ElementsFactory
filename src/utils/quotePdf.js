const COLORS = {
  header: [42, 44, 47],
  ink: [31, 36, 33],
  green: [74, 154, 43],
  pink: [219, 77, 140],
  cream: [250, 245, 232],
  paper: [250, 249, 245],
  tint: [243, 244, 240],
  line: [222, 218, 207],
  muted: [110, 116, 122],
  soft: [196, 201, 198]
};

const LOGO_SRC = '/brand/logo_artesano_blanco.png';
const LOGO_CROP = { x: 0.31, y: 0.32, w: 0.38, h: 0.38 };
const PAGE_BOTTOM = 266;
const CARD_H = 86;
const ROW_H = 23;
const IVA_RATE = 0.16;

export function formatQuoteMoney(value) {
  return `$${(Number(value) || 0).toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

export function buildQuoteFolio(date = new Date()) {
  const stamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `AD-${stamp}-${random}`;
}

export function detectQuoteArea(product = {}) {
  const techniques = Array.isArray(product.techniques)
    ? product.techniques.join(' ').toLowerCase()
    : '';
  const worlds = Array.isArray(product.worlds)
    ? product.worlds.join(' ').toLowerCase()
    : '';
  const categories = Array.isArray(product.categories)
    ? product.categories.join(' ').toLowerCase()
    : '';
  const text = `${techniques} ${worlds} ${categories} ${product.name || ''}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  if (/3d|filamento|fdm|resina|figura|fidget/.test(text)) return 'Impresión 3D';
  if (/laser|mdf|madera|acrilico|grabado/.test(text)) return 'Corte y grabado láser';
  if (/sublim|taza|termo|ceramica|playera|textil/.test(text)) return 'Sublimación';
  if (/vinil|vinyl|sticker|rotulaci|transfer/.test(text)) return 'Corte de vinil';
  if (/diseno|branding|identidad|logo|publicidad/.test(text)) return 'Diseño gráfico';
  if (/impresi|tinta|papel|invitaci|offset/.test(text)) return 'Impresión';
  return 'Taller artesanal';
}

function formatDate(date) {
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function safeText(value, fallback = 'Por confirmar') {
  const text = String(value || '').trim();
  return text || fallback;
}

function formatPhone(value) {
  const digits = String(value || '').replace(/[^0-9]/g, '');
  if (!digits) return '';
  if (digits.length === 12 && digits.startsWith('52')) {
    return `+52 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  return `+${digits}`;
}

function productImageSource(product = {}) {
  const gallery = Array.isArray(product.gallery) ? product.gallery : [];
  return product.whiteBgImage || gallery[1] || product.primaryImage || gallery[0] || '';
}

function loadImage(src) {
  return new Promise(resolve => {
    if (!src || typeof window === 'undefined') {
      resolve(null);
      return;
    }
    const img = new Image();
    const timer = setTimeout(() => resolve(null), 10000);
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(null);
    };
    img.src = src.startsWith('data:') ? src : new URL(src, window.location.href).href;
  });
}

function imageToDataUrl(img, { crop = null, maxSide = 900, background = '#FFFFFF' } = {}) {
  if (!img) return null;
  try {
    const srcW = img.naturalWidth || img.width;
    const srcH = img.naturalHeight || img.height;
    const sx = crop ? Math.round(srcW * crop.x) : 0;
    const sy = crop ? Math.round(srcH * crop.y) : 0;
    const sw = crop ? Math.round(srcW * crop.w) : srcW;
    const sh = crop ? Math.round(srcH * crop.h) : srcH;
    const scale = Math.min(1, maxSide / Math.max(sw, sh));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(sw * scale));
    canvas.height = Math.max(1, Math.round(sh * scale));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    return {
      dataUrl: canvas.toDataURL('image/jpeg', 0.9),
      width: canvas.width,
      height: canvas.height
    };
  } catch {
    return null;
  }
}

function drawImageInBox(doc, visual, x, y, w, h) {
  if (!visual) {
    doc.setFillColor(...COLORS.tint);
    doc.rect(x, y, w, h, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...COLORS.muted);
    doc.text('Sin foto', x + w / 2, y + h / 2 + 1, { align: 'center' });
    return;
  }
  const ratio = Math.min(w / visual.width, h / visual.height);
  const drawW = visual.width * ratio;
  const drawH = visual.height * ratio;
  doc.addImage(visual.dataUrl, 'JPEG', x + (w - drawW) / 2, y + (h - drawH) / 2, drawW, drawH);
}

function drawSmallHeader(doc, { logo, folio, date }) {
  doc.setFillColor(...COLORS.header);
  doc.rect(0, 0, 210, 19, 'F');
  doc.setFillColor(...COLORS.green);
  doc.rect(0, 19, 140, 1.2, 'F');
  doc.setFillColor(...COLORS.pink);
  doc.rect(140, 19, 70, 1.2, 'F');

  if (logo) doc.addImage(logo.dataUrl, 'JPEG', 14, 2, 15, 15);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.cream);
  doc.text('COTIZACIÓN ESTIMADA', 33, 9.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.6);
  doc.setTextColor(...COLORS.soft);
  doc.text('Desglose por producto', 33, 14.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(...COLORS.cream);
  doc.text(`Folio ${folio}`, 196, 9.5, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.soft);
  doc.text(`Fecha ${formatDate(date)}`, 196, 14.5, { align: 'right' });
}

function drawBigHeader(doc, { logo, status }) {
  doc.setFillColor(...COLORS.header);
  doc.rect(0, 0, 210, 44, 'F');
  doc.setFillColor(...COLORS.green);
  doc.rect(0, 44, 140, 1.6, 'F');
  doc.setFillColor(...COLORS.pink);
  doc.rect(140, 44, 70, 1.6, 'F');

  if (logo) doc.addImage(logo.dataUrl, 'JPEG', 14, 5, 34, 34);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(27);
  doc.setTextColor(...COLORS.cream);
  doc.text('COTIZACIÓN', 196, 22, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.soft);
  doc.text('DISEÑO · FABRICACIÓN · PERSONALIZACIÓN', 196, 29, { align: 'right' });

  doc.setFillColor(55, 59, 63);
  doc.roundedRect(136, 33, 60, 7.5, 3.75, 3.75, 'F');
  doc.setFillColor(...COLORS.pink);
  doc.circle(141, 36.75, 1.1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...COLORS.cream);
  doc.text(status, 144.5, 37.6);
}

function drawFooter(doc, page, pages, settings) {
  const phone = formatPhone(settings?.whatsappNumber);
  const email = safeText(settings?.businessEmail, '');
  const line1 = ['Artesano Digital', phone ? `WhatsApp ${phone}` : '', email].filter(Boolean).join('  ·  ');
  const hours = safeText(settings?.businessHours, '');
  const zone = safeText(settings?.serviceZone, '');
  const line2 = doc.splitTextToSize([hours, zone].filter(Boolean).join('  ·  '), 150)[0] || '';

  doc.setDrawColor(...COLORS.line);
  doc.setLineWidth(0.25);
  doc.line(14, 281, 196, 281);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.6);
  doc.setTextColor(...COLORS.ink);
  doc.text(line1, 14, 285);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(...COLORS.muted);
  doc.text(line2, 14, 289);
  doc.text(`Página ${page} de ${pages}`, 196, 285, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.green);
  doc.text('SI LO PIENSAS, SE HACE', 196, 289, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.8);
  doc.setTextColor(...COLORS.muted);
  doc.text('Documento informativo generado desde el carrito. No es comprobante fiscal.', 14, 293);
}

export async function downloadQuotePdf({
  items,
  customer = {},
  settings = {},
  folio,
  date = new Date(),
  taxMode = 'included',
  subtotal = 0,
  baseSubtotal = 0,
  discount = 0,
  discountCode = '',
  iva = 0,
  total = 0,
  advance = 0,
  notes = ''
}) {
  const { jsPDF } = await import('jspdf');

  const logoImage = await loadImage(LOGO_SRC);
  const logo = imageToDataUrl(logoImage, { crop: LOGO_CROP, maxSide: 600, background: '#2A2C2F' });

  const visuals = await Promise.all(items.map(async item => {
    const img = await loadImage(productImageSource(item.product || {}));
    return imageToDataUrl(img, { maxSide: 900 });
  }));

  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  doc.setProperties({
    title: `Cotización estimada ${folio} - ${safeText(settings?.businessName, 'Artesano Digital')}`,
    subject: 'Cotización estimada de productos y servicios personalizados',
    author: safeText(settings?.businessName, 'Artesano Digital'),
    creator: 'Artesano Digital'
  });

  const roundMoney = (value) => Math.round((Number(value) || 0) * 100) / 100;
  const grossBefore = Number(subtotal) || 0;
  const discountValue = Number(discount) || 0;
  const netBefore = taxMode === 'included' ? roundMoney(grossBefore / (1 + IVA_RATE)) : roundMoney(grossBefore);
  const netDiscount = taxMode === 'included' ? roundMoney(discountValue / (1 + IVA_RATE)) : roundMoney(discountValue);
  const netAfter = roundMoney(netBefore - netDiscount);
  const calculatedIva = taxMode === 'included'
    ? roundMoney((grossBefore - discountValue) - netAfter)
    : roundMoney(netAfter * IVA_RATE);
  const calculatedTotal = taxMode === 'included'
    ? roundMoney(grossBefore - discountValue)
    : roundMoney(netAfter + calculatedIva);
  const calculatedAdvance = roundMoney(calculatedTotal * 0.5);
  const pricedCount = items.filter(item => item?.product?.priceType !== 'quote' && Number(item?.product?.price) > 0).length;
  const pendingItems = items.length - pricedCount;

  const setText = (size, style, color) => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
  };

  const newPage = () => {
    doc.addPage();
    drawSmallHeader(doc, { logo, folio, date });
    return 27;
  };

  drawBigHeader(doc, { logo, status: 'ESTIMADA · PAGO PENDIENTE' });

  const field = (label, value, x, y, width) => {
    setText(6, 'bold', COLORS.green);
    doc.text(label, x, y);
    setText(8.4, 'bold', COLORS.ink);
    doc.text(doc.splitTextToSize(value, width)[0] || '', x, y + 6);
    doc.setDrawColor(...COLORS.line);
    doc.setLineWidth(0.3);
    doc.line(x, y + 8, x + width, y + 8);
  };

  const contactLine = [customer.phone, customer.email].filter(Boolean).join(' · ');
  field('CLIENTE / RAZÓN SOCIAL', safeText(customer.name, 'Por especificar'), 14, 52, 88);
  field('TELÉFONO / CORREO', safeText(contactLine, 'Por especificar'), 110, 52, 86);
  field('FECHA DE EMISIÓN', formatDate(date), 14, 67, 60);
  field('FOLIO', safeText(folio, 'Por asignar'), 80, 67, 60);
  field('VIGENCIA HASTA', formatDate(addDays(date, 15)), 146, 67, 50);

  let y = 83;
  doc.setFillColor(...COLORS.pink);
  doc.rect(14, y - 4.2, 1.6, 5.6, 'F');
  setText(10, 'bold', COLORS.ink);
  doc.text('DETALLE DE PRODUCTOS', 18, y);
  setText(6.4, 'normal', COLORS.muted);
  doc.text('MONEDA MXN', 196, y, { align: 'right' });
  y += 4;

  const drawTableHead = (top) => {
    doc.setFillColor(...COLORS.tint);
    doc.rect(14, top, 182, 8, 'F');
    doc.setFillColor(...COLORS.green);
    doc.rect(14, top, 1.6, 8, 'F');
    setText(6.4, 'bold', COLORS.muted);
    doc.text('PRODUCTO / SERVICIO', 38, top + 5.2);
    doc.text('CANT.', 132, top + 5.2, { align: 'center' });
    doc.text('PRECIO UNIT.', 168, top + 5.2, { align: 'right' });
    doc.text('IMPORTE', 194, top + 5.2, { align: 'right' });
    return top + 8;
  };

  y = drawTableHead(y);

  items.forEach((item, index) => {
    const product = item.product || {};
    const qty = Number(item.quantity) || 1;
    const price = Number(product.price);
    const hasPrice = product.priceType !== 'quote' && Number.isFinite(price) && price > 0;

    if (y + ROW_H > PAGE_BOTTOM) {
      y = newPage();
      y = drawTableHead(y);
    }

    drawImageInBox(doc, visuals[index], 18, y + 3.5, 16, 16);

    const variantText = item.selectedVariants && Object.keys(item.selectedVariants).length
      ? Object.entries(item.selectedVariants).map(([key, value]) => `${key}: ${value}`).join(' · ')
      : '';
    setText(8.4, 'bold', COLORS.ink);
    const nameLines = doc.splitTextToSize(safeText(product.name, 'Producto o servicio'), 84).slice(0, 2);
    doc.text(nameLines, 38, y + 6.4);
    let textY = y + 6.4 + nameLines.length * 3.6 + 0.6;
    setText(6.5, 'normal', COLORS.muted);
    doc.text(detectQuoteArea(product), 38, textY);
    textY += 3.3;
    if (variantText || item.customText) {
      const detail = [variantText, item.customText ? `Personalización: ${item.customText}` : ''].filter(Boolean).join(' · ');
      doc.text(doc.splitTextToSize(detail, 84).slice(0, 1), 38, textY);
    }

    const midY = y + ROW_H / 2 + 1.2;
    setText(8, 'bold', COLORS.ink);
    doc.text(`${qty} pza`, 132, midY, { align: 'center' });
    if (hasPrice) {
      doc.text(formatQuoteMoney(price), 168, midY, { align: 'right' });
      doc.text(formatQuoteMoney(price * qty), 194, midY, { align: 'right' });
    } else {
      setText(7, 'bold', COLORS.muted);
      doc.text('Por cotizar', 168, midY, { align: 'right' });
      doc.text('Por cotizar', 194, midY, { align: 'right' });
    }

    doc.setDrawColor(...COLORS.line);
    doc.setLineWidth(0.2);
    doc.line(14, y + ROW_H, 196, y + ROW_H);
    y += ROW_H;
  });

  y += 7;
  if (y + 52 > PAGE_BOTTOM) {
    y = newPage();
  }

  const boxH = 52;
  doc.setFillColor(...COLORS.paper);
  doc.setDrawColor(...COLORS.line);
  doc.roundedRect(14, y, 108, boxH, 2, 2, 'FD');
  doc.setFillColor(...COLORS.green);
  doc.rect(14, y, 1.6, boxH, 'F');
  setText(7.4, 'bold', COLORS.ink);
  doc.text('CONDICIONES COMERCIALES', 20, y + 6);

  const terms = [
    'Anticipo del 50% para iniciar producción; saldo al entregar.',
    'Envío no incluido; se cotiza según destino y paquetería.',
    'Los tiempos de producción inician al confirmar diseño y anticipo.',
    'Vigencia de la cotización: 15 días naturales.',
    pendingItems > 0 ? `${pendingItems} partida(s) "Por cotizar" se confirmarán por separado.` : '',
    notes || customer.notes ? `Notas: ${notes || customer.notes}` : '',
    safeText(settings?.quoteNoteDefault, '')
  ].filter(Boolean);

  setText(6.6, 'normal', COLORS.muted);
  let termY = y + 11;
  terms.forEach(term => {
    const lines = doc.splitTextToSize(`•  ${term}`, 98);
    lines.forEach(line => {
      if (termY < y + boxH - 3) {
        doc.text(line, 20, termY);
        termY += 3.5;
      }
    });
  });

  const totalX = 126;
  doc.setFillColor(...COLORS.header);
  doc.roundedRect(totalX, y, 70, boxH, 2, 2, 'F');
  doc.setFillColor(...COLORS.pink);
  doc.rect(totalX, y, 1.6, boxH, 'F');

  setText(6.4, 'bold', COLORS.soft);
  doc.text('TOTAL DE LA COTIZACIÓN', totalX + 6, y + 6);

  const summaryRows = [['Subtotal', formatQuoteMoney(netBefore)]];
  if (discountValue > 0) {
    summaryRows.push([`Descuento${discountCode ? ` (${discountCode})` : ''}`, `-${formatQuoteMoney(netDiscount)}`]);
  }
  summaryRows.push([taxMode === 'included' ? 'IVA 16% incluido' : 'IVA 16%', formatQuoteMoney(calculatedIva)]);
  let summaryY = y + 11;
  summaryRows.forEach(([label, value]) => {
    setText(6.6, 'normal', COLORS.soft);
    doc.text(label, totalX + 6, summaryY);
    setText(6.6, 'bold', COLORS.cream);
    doc.text(value, totalX + 64, summaryY, { align: 'right' });
    summaryY += 4;
  });

  setText(17, 'bold', COLORS.cream);
  doc.text(formatQuoteMoney(calculatedTotal), totalX + 64, y + 33, { align: 'right' });
  setText(6, 'bold', COLORS.soft);
  doc.text('MXN', totalX + 64, y + 37.5, { align: 'right' });

  doc.setDrawColor(70, 74, 78);
  doc.setLineWidth(0.2);
  doc.line(totalX + 6, y + 40, totalX + 64, y + 40);
  setText(6.8, 'bold', COLORS.cream);
  doc.text('ANTICIPO 50%', totalX + 6, y + 45);
  doc.text(formatQuoteMoney(calculatedAdvance), totalX + 64, y + 45, { align: 'right' });
  setText(6.2, 'normal', COLORS.soft);
  doc.text(`Saldo al entregar: ${formatQuoteMoney(Math.max(0, calculatedTotal - calculatedAdvance))}`, totalX + 6, y + 49.5);

  y = newPage();
  setText(10, 'bold', COLORS.ink);
  doc.setFillColor(...COLORS.pink);
  doc.rect(14, y - 4.2, 1.6, 5.6, 'F');
  doc.text('DESGLOSE POR PRODUCTO', 18, y);
  setText(6.4, 'normal', COLORS.muted);
  doc.text('IMPORTES EN MXN', 196, y, { align: 'right' });
  y += 4;

  items.forEach((item, index) => {
    if (y + CARD_H > PAGE_BOTTOM) {
      y = newPage();
    }

    const product = item.product || {};
    const qty = Number(item.quantity) || 1;
    const price = Number(product.price);
    const hasPrice = product.priceType !== 'quote' && Number.isFinite(price) && price > 0;
    const gross = hasPrice ? price * qty : 0;
    const net = taxMode === 'included' ? gross / (1 + IVA_RATE) : gross;
    const iva = taxMode === 'included' ? gross - net : net * IVA_RATE;
    const totalLine = taxMode === 'included' ? gross : net + iva;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...COLORS.line);
    doc.setLineWidth(0.25);
    doc.roundedRect(14, y, 182, CARD_H, 2.5, 2.5, 'FD');

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(18, y + 4, 62, 56, 2, 2, 'FD');
    drawImageInBox(doc, visuals[index], 19.5, y + 5.5, 59, 53);

    const tx = 88;
    const textWidth = 104;
    setText(6.6, 'bold', COLORS.green);
    doc.text(`PRODUCTO ${String(index + 1).padStart(2, '0')}`, tx, y + 8);

    setText(11.5, 'bold', COLORS.ink);
    const nameLines = doc.splitTextToSize(safeText(product.name, 'Producto o servicio'), textWidth).slice(0, 2);
    doc.text(nameLines, tx, y + 13.5);
    let ty = y + 13.5 + nameLines.length * 4.8 + 1;

    const meta = [detectQuoteArea(product), product.code ? `Código ${product.code}` : '', product.sku ? `SKU ${product.sku}` : '']
      .filter(Boolean).join('  ·  ');
    setText(6.6, 'normal', COLORS.muted);
    doc.text(doc.splitTextToSize(meta, textWidth)[0] || '', tx, ty);
    ty += 4.2;

    const description = safeText(product.shortDescription || product.description, '');
    if (description) {
      setText(7, 'normal', COLORS.ink);
      const descLines = doc.splitTextToSize(description, textWidth).slice(0, 2);
      doc.text(descLines, tx, ty);
      ty += descLines.length * 3.4 + 2;
    }

    const includes = String(product.includes || '')
      .split(/\s\+\s|;|\n/)
      .map(part => part.trim())
      .filter(Boolean);
    const variantText = item.selectedVariants && Object.keys(item.selectedVariants).length
      ? Object.entries(item.selectedVariants).map(([key, value]) => `${key}: ${value}`).join(' · ')
      : '';
    const incluidoLines = [
      ...includes.map(entry => `•  ${entry}`),
      variantText ? `•  Opciones elegidas: ${variantText}` : '',
      item.customText ? `•  Personalización: ${item.customText}` : ''
    ].filter(Boolean);

    if (incluidoLines.length) {
      setText(6.4, 'bold', COLORS.green);
      doc.text('INCLUYE', tx, ty);
      ty += 3.4;
      setText(6.8, 'normal', COLORS.muted);
      for (const entry of incluidoLines) {
        const lines = doc.splitTextToSize(entry, textWidth);
        if (ty + lines.length * 3.1 > y + 66) break;
        doc.text(lines, tx, ty);
        ty += lines.length * 3.1;
      }
    }

    const stripY = y + 68;
    doc.setFillColor(...COLORS.tint);
    doc.roundedRect(18, stripY, 174, 14, 1.5, 1.5, 'F');
    const cells = [
      ['CANTIDAD', `${qty} pza`],
      ['PRECIO UNITARIO', hasPrice ? formatQuoteMoney(price) : 'Por cotizar'],
      ['SUBTOTAL SIN IVA', hasPrice ? formatQuoteMoney(net) : 'Por cotizar'],
      [taxMode === 'included' ? 'IVA 16% INCLUIDO' : 'IVA 16%', hasPrice ? formatQuoteMoney(iva) : 'Por cotizar'],
      ['IMPORTE TOTAL', hasPrice ? formatQuoteMoney(totalLine) : 'Por cotizar']
    ];
    const cellW = 174 / cells.length;
    cells.forEach(([label, value], cellIndex) => {
      const cx = 18 + cellIndex * cellW + cellW / 2;
      setText(5.6, 'bold', COLORS.muted);
      doc.text(label, cx, stripY + 5, { align: 'center' });
      setText(8, 'bold', cellIndex === cells.length - 1 ? COLORS.green : COLORS.ink);
      doc.text(value, cx, stripY + 10.5, { align: 'center' });
    });

    y += CARD_H + 5;
  });

  drawFooterAll(doc, doc.getNumberOfPages(), settings);

  const safeName = String(customer.name || 'Cliente')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 32) || 'Cliente';

  const fileName = `Cotizacion_${folio}_${safeName}.pdf`;
  doc.save(fileName);
  return fileName;
}

function drawFooterAll(doc, pages, settings) {
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    drawFooter(doc, page, pages, settings);
  }
}
