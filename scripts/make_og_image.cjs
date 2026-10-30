const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function makeOg() {
  const width = 1200;
  const height = 630;
  
  const svgOverlay = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#141E18" />
          <stop offset="50%" stop-color="#1B2B22" />
          <stop offset="100%" stop-color="#111A14" />
        </linearGradient>
        <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#D4A359" />
          <stop offset="100%" stop-color="#F3CA82" />
        </linearGradient>
      </defs>
      
      <!-- Fondo general -->
      <rect width="100%" height="100%" fill="url(#bg)" />
      
      <!-- Marco decorativo artesanal -->
      <rect x="36" y="36" width="1128" height="558" rx="28" fill="#1E2F26" stroke="#D4A359" stroke-width="2.5" stroke-opacity="0.5" />
      
      <!-- Círculos luminosos de fondo sutiles -->
      <circle cx="1020" cy="180" r="260" fill="#2D4F3E" opacity="0.45" />
      <circle cx="950" cy="450" r="180" fill="#D4A359" opacity="0.12" />
      
      <!-- Pastilla de Tienda & Taller Oficial -->
      <rect x="80" y="80" width="310" height="42" rx="21" fill="url(#gold)" />
      <text x="235" y="107" fill="#141E18" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="14" text-anchor="middle" letter-spacing="2">TIENDA &amp; TALLER OFICIAL</text>
      
      <!-- Título de Marca -->
      <text x="80" y="195" fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="58" letter-spacing="-1">Artesano Digital</text>
      
      <!-- Slogan -->
      <text x="80" y="255" fill="#EAD8B5" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="28" font-style="italic">✨ Si lo piensas, se hace</text>
      
      <!-- Descripción para WhatsApp -->
      <text x="80" y="320" fill="#C7D0CB" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="21">Diseño, personalización y fabricación de productos en México</text>
      
      <!-- Pastillas de Técnicas del Taller -->
      <g transform="translate(80, 365)">
        <rect x="0" y="0" width="170" height="46" rx="14" fill="#141E18" stroke="#3D6A54" stroke-width="1.5" />
        <text x="85" y="29" fill="#A7F3D0" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="15" text-anchor="middle">🖨️ Impresión 3D</text>

        <rect x="185" y="0" width="160" height="46" rx="14" fill="#141E18" stroke="#3D6A54" stroke-width="1.5" />
        <text x="265" y="29" fill="#FDE68A" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="15" text-anchor="middle">⚡ Corte Láser</text>

        <rect x="360" y="0" width="170" height="46" rx="14" fill="#141E18" stroke="#3D6A54" stroke-width="1.5" />
        <text x="445" y="29" fill="#FECDD3" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="15" text-anchor="middle">🎨 Sublimación</text>

        <rect x="545" y="0" width="150" height="46" rx="14" fill="#141E18" stroke="#3D6A54" stroke-width="1.5" />
        <text x="620" y="29" fill="#E0E7FF" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="15" text-anchor="middle">✂️ Vinil &amp; Textil</text>
      </g>
      
      <!-- Botón WhatsApp inferior -->
      <rect x="80" y="465" width="460" height="58" rx="29" fill="#16A34A" />
      <text x="310" y="501" fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="18" text-anchor="middle">💬 Cotizaciones Directas por WhatsApp</text>
      
      <!-- Dominio web oficial -->
      <text x="1100" y="502" fill="#D4A359" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="19" text-anchor="end">artesano-digital.vercel.app</text>
    </svg>
  `);
  
  const targetPath = path.join(__dirname, '..', 'public', 'brand', 'og_artesano_preview.jpg');
  const distTargetPath = path.join(__dirname, '..', 'dist', 'brand', 'og_artesano_preview.jpg');
  
  await sharp(svgOverlay)
    .jpeg({ quality: 92 })
    .toFile(targetPath);
    
  // También copiar a dist/brand si existe
  const distBrandDir = path.join(__dirname, '..', 'dist', 'brand');
  if (fs.existsSync(distBrandDir)) {
    fs.copyFileSync(targetPath, distTargetPath);
  }
  
  console.log('✓ Vista previa para WhatsApp generada con éxito en:', targetPath);
}

makeOg().catch(console.error);
