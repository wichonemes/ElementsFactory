const BRAND = {
  green: [45, 79, 62],
  dark: [31, 36, 33],
  cream: [250, 249, 245],
  amber: [212, 163, 89],
  muted: [107, 114, 128],
  line: [232, 228, 218]
};

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
    month: '2-digit',
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

function drawPageHeader(doc, { settings, folio, date }) {
  const businessName = safeText(settings?.businessName, 'Artesano Digital');

  doc.setFillColor(...BRAND.green);
  doc.rect(0, 0, 210, 24, 'F');
  doc.setFillColor(...BRAND.amber);
  doc.rect(0, 24, 210, 1.2, 'F');

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, 7.5, 10, 10, 2, 2, 'F');
  doc.setTextColor(...BRAND.green);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('AD', 19, 14, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12.5);
  doc.text(businessName.toUpperCase(), 27, 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(220, 238, 228);
  doc.text(safeText(settings?.tagline, 'Si lo piensas, se hace.'), 27, 17.3);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text('COTIZACIÓN ESTIMADA', 196, 10.5, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.text(`Folio ${folio}`, 196, 15.2, { align: 'right' });
  doc.text(`Fecha ${formatDate(date)}`, 196, 19.2, { align: 'right' });
}

function drawFooter(doc, page, pages, settings) {
  const phone = String(settings?.whatsappNumber || '').replace(/[^0-9]/g, '');
  const contact = [
    phone ? `WhatsApp +${phone}` : '',
    safeText(settings?.businessEmail, ''),
    'Precios en MXN'
  ].filter(Boolean).join('  ·  ');

  doc.setDrawColor(...BRAND.line);
  doc.setLineWidth(0.25);
  doc.line(14, 286, 196, 286);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.4);
  doc.setTextColor(...BRAND.muted);
  doc.text(contact, 14, 290.5);
  doc.text(`Página ${page} de ${pages}`, 196, 290.5, { align: 'right' });
  doc.setFontSize(5.8);
  doc.text('Documento generado automáticamente desde el carrito. No es comprobante fiscal.', 14, 294);
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
  const [{ jsPDF }, { autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable')
  ]);

  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  doc.setProperties({
    title: `Cotización estimada ${folio} - ${safeText(settings?.businessName, 'Artesano Digital')}`,
    subject: 'Cotización estimada de productos y servicios personalizados',
    author: safeText(settings?.businessName, 'Artesano Digital'),
    creator: 'Artesano Digital'
  });

  // Bloque de cliente y proyecto
  const y = 31;
  doc.setFillColor(...BRAND.cream);
  doc.setDrawColor(...BRAND.line);
  doc.roundedRect(14, y, 182, 31, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  doc.setTextColor(...BRAND.muted);
  doc.text('CLIENTE / RAZÓN SOCIAL', 18, y + 5);
  doc.text('CONTACTO', 106, y + 5);
  doc.text('ENTREGA', 18, y + 16);
  doc.text('PROYECTO / NOTAS', 106, y + 16);

  doc.setTextColor(...BRAND.dark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.text(doc.splitTextToSize(safeText(customer.name, 'Cliente por confirmar'), 82), 18, y + 10);
  const contact = [customer.phone, customer.email].filter(Boolean).join(' · ');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.text(doc.splitTextToSize(safeText(contact, 'Teléfono / correo por confirmar'), 82), 106, y + 10);
  doc.text(doc.splitTextToSize(safeText(customer.city, 'Ciudad / C.P. por confirmar'), 82), 18, y + 21);
  doc.text(
    doc.splitTextToSize(safeText(customer.notes || notes, 'Sin notas adicionales'), 82),
    106,
    y + 21
  );

  const pricedItems = items.filter(item => {
    const price = item?.product?.price;
    return item?.product?.priceType !== 'quote' && price !== null && price !== undefined;
  });
  const pendingItems = items.length - pricedItems.length;

  const rows = items.map((item, index) => {
    const product = item.product || {};
    const price = Number(product.price);
    const hasPrice = product.priceType !== 'quote' && Number.isFinite(price) && price > 0;
    const variantText = item.selectedVariants && Object.keys(item.selectedVariants).length
      ? Object.entries(item.selectedVariants).map(([key, value]) => `${key}: ${value}`).join(' · ')
      : '';
    const details = [
      product.code ? `Código ${product.code}` : '',
      variantText ? `Opciones: ${variantText}` : '',
      item.customText ? `Personalización: ${item.customText}` : ''
    ].filter(Boolean).join('\n');

    return [
      String(index + 1).padStart(2, '0'),
      `${safeText(product.name, 'Producto o servicio')}${details ? `\n${details}` : ''}`,
      detectQuoteArea(product),
      String(item.quantity || 1),
      hasPrice ? formatQuoteMoney(price) : 'Por cotizar',
      hasPrice ? formatQuoteMoney(price * (Number(item.quantity) || 1)) : 'Por cotizar'
    ];
  });

  autoTable(doc, {
    startY: 67,
    head: [['#', 'Producto / servicio', 'Área', 'Cant.', 'P. unit.', 'Importe']],
    body: rows,
    theme: 'grid',
    margin: { top: 30, left: 14, right: 14, bottom: 18 },
    styles: {
      font: 'helvetica',
      fontSize: 7.7,
      cellPadding: 2.1,
      textColor: BRAND.dark,
      lineColor: BRAND.line,
      lineWidth: 0.12,
      overflow: 'linebreak',
      valign: 'top'
    },
    headStyles: {
      fillColor: BRAND.green,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 6.9,
      halign: 'left'
    },
    alternateRowStyles: { fillColor: [252, 251, 247] },
    columnStyles: {
      0: { halign: 'center', cellWidth: 9 },
      3: { halign: 'center', cellWidth: 13 },
      4: { halign: 'right', cellWidth: 25 },
      5: { halign: 'right', cellWidth: 30 }
    },
    willDrawPage: () => drawPageHeader(doc, { settings, folio, date })
  });

  let cursorY = (doc.lastAutoTable?.finalY || 120) + 8;
  if (cursorY > 226) {
    doc.addPage();
    drawPageHeader(doc, { settings, folio, date });
    cursorY = 32;
  }

  const roundMoney = (value) => Math.round((Number(value) || 0) * 100) / 100;
  const grossBefore = Number(subtotal) || 0;
  const discountValue = Number(discount) || 0;
  const netBefore = taxMode === 'included' ? roundMoney(grossBefore / 1.16) : roundMoney(grossBefore);
  const netDiscount = taxMode === 'included' ? roundMoney(discountValue / 1.16) : roundMoney(discountValue);
  const netAfter = roundMoney(netBefore - netDiscount);
  const calculatedIva = taxMode === 'included'
    ? roundMoney((grossBefore - discountValue) - netAfter)
    : roundMoney(netAfter * 0.16);
  const calculatedTotal = taxMode === 'included'
    ? roundMoney(grossBefore - discountValue)
    : roundMoney(netAfter + calculatedIva);
  const calculatedAdvance = roundMoney(calculatedTotal * 0.5);

  const boxX = 116;
  const boxW = 80;
  const labelX = 119;
  const valueX = 193;
  const rowsToDraw = [];
  rowsToDraw.push(['Subtotal', formatQuoteMoney(netBefore)]);
  if (discountValue > 0) {
    rowsToDraw.push([`Descuento${discountCode ? ` (${discountCode})` : ''}`, `-${formatQuoteMoney(netDiscount)}`]);
    rowsToDraw.push(['Subtotal con descuento', formatQuoteMoney(netAfter)]);
  }
  rowsToDraw.push([taxMode === 'included' ? 'IVA 16% incluido' : 'IVA 16%', formatQuoteMoney(calculatedIva)]);
  rowsToDraw.push(['TOTAL', formatQuoteMoney(calculatedTotal)]);
  rowsToDraw.push(['Anticipo 50%', formatQuoteMoney(calculatedAdvance)]);
  rowsToDraw.push(['Saldo al entregar', formatQuoteMoney(Math.max(0, calculatedTotal - calculatedAdvance))]);

  const boxH = 8 + rowsToDraw.length * 5.2;
  doc.setFillColor(...BRAND.cream);
  doc.setDrawColor(...BRAND.line);
  doc.roundedRect(boxX, cursorY, boxW, boxH, 2, 2, 'FD');

  rowsToDraw.forEach(([label, value], index) => {
    const rowY = cursorY + 5.5 + index * 5.2;
    const isTotal = label === 'TOTAL';
    doc.setFont('helvetica', isTotal ? 'bold' : 'normal');
    doc.setFontSize(isTotal ? 8.6 : 7.1);
    doc.setTextColor(...(isTotal ? BRAND.green : BRAND.muted));
    doc.text(label, labelX, rowY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...(isTotal ? BRAND.green : BRAND.dark));
    doc.text(value, valueX, rowY, { align: 'right' });
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.4);
  doc.setTextColor(...BRAND.dark);
  doc.text('CONDICIONES COMERCIALES', 14, cursorY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.9);
  doc.setTextColor(...BRAND.muted);
  const terms = [
    'Anticipo del 50% para iniciar producción. Saldo al entregar.',
    'Vigencia de la cotización: 15 días naturales.',
    'Envío no incluido; se cotiza según destino y paquetería.',
    'Los tiempos de producción inician al confirmar diseño y anticipo.',
    pendingItems > 0 ? `${pendingItems} partida(s) marcadas "Por cotizar" se confirmarán por separado.` : '',
    safeText(settings?.quoteNoteDefault, '')
  ].filter(Boolean);
  doc.text(doc.splitTextToSize(terms.join(' '), 94), 14, cursorY + 10);

  doc.setFontSize(6.2);
  doc.setTextColor(...BRAND.muted);
  doc.text(`Vigencia hasta ${formatDate(addDays(date, 15))} · Precios en MXN`, 14, cursorY + 30);

  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    drawFooter(doc, page, pages, settings);
  }

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
