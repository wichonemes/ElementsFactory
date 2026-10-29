import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import { cloudDb, durableHandler } from './cloud-db.js';
import { storeImage, storeFile } from './cloud-files.js';
import { publicProduct, publicSettings, rateLimit } from './public-data.js';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { db } from './db.js';
import { repairProductCosts } from '../shared/costing.js';
import {
  processCatalogStudioPackage,
  processManualSlotImage,
  regenerateSingleSlot,
  getAiStudioConfig,
  getImageBuffer
} from './photo-studio.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5000;
const production = process.env.NODE_ENV === 'production';
const JWT_SECRET = (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32)
  ? process.env.JWT_SECRET
  : 'artesano_digital_super_secret_jwt_key_2026_production_safe_token';
if (production && !cloudDb.enabled) {
  console.log('[STORAGE] DATABASE_URL no configurado. Utilizando almacenamiento local persistente.');
}
if (production && (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)) {
  console.log('[STORAGE] Supabase Storage no configurado. Utilizando almacenamiento local en public/uploads.');
}
app.disable('x-powered-by');
if (process.env.RENDER) app.set('trust proxy', 1);
// Wrap only the final API handler: authentication and multipart parsing run first.
// Upload endpoints are excluded so long file network transfers don't hold database row locks.
for (const method of ['get', 'post', 'put', 'delete', 'patch']) {
  const register = app[method].bind(app);
  app[method] = (route, ...handlers) => {
    const isFileOperation = typeof route === 'string' && (
      route === '/api/upload' || 
      route === '/api/admin/catalog-pdf/upload' ||
      route.startsWith('/api/catalog-pdf/download')
    );
    if (typeof route === 'string' && route.startsWith('/api/') && !isFileOperation && handlers.length) {
      handlers[handlers.length - 1] = durableHandler(cloudDb, handlers.at(-1));
    }
    return register(route, ...handlers);
  };
}
app.get('/healthz', (_req, res) => {
  res.status(200).json({ ok: true, version: '2026-10-24-v5-live' });
});
app.get('/api/deploy-version', (_req, res) => {
  const assetsDir = path.join(distDir, 'assets');
  res.json({
    ok: true,
    version: '2026-10-24-v5-live',
    deployTimestamp: new Date().toISOString(),
    nodeVersion: process.version,
    distExists: fs.existsSync(distDir),
    assets: fs.existsSync(assetsDir) ? fs.readdirSync(assetsDir) : []
  });
});

// Middlewares
if (!production) app.use(cors());
app.use((_req, res, next) => { res.set('X-Content-Type-Options', 'nosniff'); next(); });
app.use('/api', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
app.use('/api/auth/login', rateLimit({ limit: 15, windowMs: 15 * 60 * 1000 }));
const trackingLimit = rateLimit({ limit: 120, windowMs: 60 * 1000 });
app.use(['/api/analytics/event', '/api/tracking'], trackingLimit);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Public static uploads
const uploadsDir = process.env.VERCEL
  ? path.join('/tmp', 'artesano-uploads')
  : path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Public static downloads (Catálogo PDF Móvil, etc.)
const downloadsDir = process.env.VERCEL
  ? path.join('/tmp', 'artesano-downloads')
  : path.join(__dirname, '..', 'public', 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

// Inicialización de respaldo binario persistente en PostgreSQL para catálogos PDF
async function initCatalogFilesStorage() {
  if (!cloudDb?.pool) return;
  try {
    await cloudDb.pool.query(`
      CREATE TABLE IF NOT EXISTS artisan_private.catalog_files (
        id text PRIMARY KEY,
        filename text NOT NULL,
        content_type text NOT NULL,
        data bytea NOT NULL,
        size_bytes integer NOT NULL,
        updated_at timestamptz DEFAULT now()
      );
    `);

    // Sembrar catalogo 25 octubre.pdf si existe en disco y aún no está en la base de datos
    const candidateFiles = [
      'catalogo_25_octubre_1792951400202.pdf',
      'catalogo_25_octubre.pdf',
      'catalogo 25 octubre.pdf'
    ];
    let sourceBuffer = null;
    let foundFilename = '';
    for (const cf of candidateFiles) {
      const p = path.join(downloadsDir, cf);
      if (fs.existsSync(p)) {
        sourceBuffer = fs.readFileSync(p);
        foundFilename = cf;
        break;
      }
    }

    if (sourceBuffer) {
      const aliases = [
        'cat-1792951400908-2mgu5',
        'catalogo_25_octubre_1792951400202.pdf',
        'catalogo_25_octubre.pdf',
        'catalogo 25 octubre.pdf'
      ];
      for (const alias of aliases) {
        await cloudDb.pool.query(`
          INSERT INTO artisan_private.catalog_files (id, filename, content_type, data, size_bytes, updated_at)
          VALUES ($1, $2, 'application/pdf', $3, $4, now())
          ON CONFLICT (id) DO NOTHING;
        `, [alias, 'catalogo 25 octubre.pdf', sourceBuffer, sourceBuffer.length]);
      }
      console.log('[STORAGE] Catálogo PDF de octubre respaldado con éxito en PostgreSQL.');
    }
  } catch (err) {
    console.warn('[STORAGE] Nota sobre inicialización de catalog_files:', err.message);
  }
}
if (!process.env.VERCEL) initCatalogFilesStorage().catch(() => {});

// Sincronización automática de proveedores reales, costos de taller y productos clave en PostgreSQL
async function syncCloudDbState() {
  if (!cloudDb?.pool) return;
  try {
    await cloudDb.transaction(async () => {
      const state = cloudDb.read();
      let changed = false;

      // 1. Sincronizar directorio de proveedores de materiales en México
      const seedSuppliers = db.getSuppliers();
      if (!Array.isArray(state.suppliers) || state.suppliers.length < seedSuppliers.length) {
        state.suppliers = state.suppliers || [];
        seedSuppliers.forEach(ss => {
          const idx = state.suppliers.findIndex(s => s.id === ss.id);
          if (idx === -1) {
            state.suppliers.push(ss);
            changed = true;
          } else {
            state.suppliers[idx] = { ...state.suppliers[idx], ...ss };
            changed = true;
          }
        });
      }

      // 2. Sincronizar materias primas diferenciadas y costos reales
      if (Array.isArray(state.rawMaterials)) {
        const localMats = (db.getRawMaterials ? db.getRawMaterials() : null) || [];
        localMats.forEach(lm => {
          if (!state.rawMaterials.some(m => m.id === lm.id)) {
            state.rawMaterials.push(lm);
            changed = true;
          }
        });
        state.rawMaterials.forEach(m => {
          if (m.materialType === 'PLA' && m.costPerUnit < 500) {
            m.costPerUnit = 500;
            changed = true;
          }
        });
      }

      // 3. Reparar costos desde la receta real (sin sobrescribir con valores fijos)
      if (Array.isArray(state.products)) {
        const mats = Array.isArray(state.rawMaterials) ? state.rawMaterials : [];
        const params = state.settings?.workshopParams || {};
        state.products = state.products.map(product => {
          const repaired = repairProductCosts(product, mats, params);
          const costChanged = Math.abs(Number(product.costPrice || 0) - Number(repaired.costPrice || 0)) > 0.01;
          const recipeMissing = !Array.isArray(product.manufacturingRecipe?.items) || product.manufacturingRecipe.items.length === 0;
          const recipeHasGeneric = (product.manufacturingRecipe?.items || []).some(item => /insumos especificos|materiales especificos|consumibles menores/i.test(item?.name || ''));
          if (costChanged || recipeMissing || recipeHasGeneric) {
            changed = true;
            return repaired;
          }
          return product;
        });
      }

      // 4. Sincronizar ficha comercial de Lámpara de mesa moderna T38 y Fidget Clicker T42
      if (Array.isArray(state.products)) {
        const t38 = state.products.find(p => p.id === 'lampara-mesa-t38');
        if (t38 && t38.price !== 449) {
          t38.price = 449;
          t38.specifications = {
            ...t38.specifications,
            material: 'Polímero biodegradable PLA Plus ($500/kg) y pantalla difusora translúcida',
            includes: 'Kit de luz LED USB 5V de bajo consumo con interruptor basculante integrado, cable de 1.5m, estructura continua 3D en C y difusor cónico'
          };
          t38.variants = [
            {
              name: 'Configuración y Luz',
              options: [
                'Lámpara completa (Estructura 3D + Kit de luz LED cálida e interruptor) - $449',
                'Solo estructura 3D (para armar con tu propia luz/socket) - $289'
              ]
            },
            {
              name: 'Color de estructura',
              options: [
                'Arena / Nogal claro',
                'Grafito carbón',
                'Blanco tiza',
                'Verde Olivo Taller',
                '🎨 Otro color a convenir'
              ]
            }
          ];
          changed = true;
        }

        if (!state.products.some(p => p.id === 'clicker-mecanico-fidget-t42')) {
          const allProds = db.getProducts ? db.getProducts() : [];
          const localProd = allProds.find(p => p.id === 'clicker-mecanico-fidget-t42');
          if (localProd) {
            state.products.push(localProd);
            changed = true;
          }
        }
      }

      if (changed) {
        cloudDb.save(state);
        console.log('[SYNC] artisan_private.state sincronizado en PostgreSQL con proveedores, costos y productos actualizados.');
      }
    });
  } catch (err) {
    console.warn('[SYNC] Nota sobre sincronización de estado en la nube:', err.message);
  }
}
if (!process.env.VERCEL) syncCloudDbState().catch(() => {});

// Handler inteligente y robusto para servir y descargar archivos de /downloads/
app.get('/downloads/:filename', async (req, res, next) => {
  const reqFilename = req.params.filename;
  if (!reqFilename) return next();

  const isAttachment = req.query.download === '1' || req.query.download === 'true';
  const dispositionType = isAttachment ? 'attachment' : 'inline';

  // 1. Probar ruta exacta en public/downloads o dist/downloads
  const candidatePaths = [
    path.join(downloadsDir, reqFilename),
    path.join(downloadsDir, decodeURIComponent(reqFilename)),
    path.join(__dirname, '..', 'dist', 'downloads', reqFilename),
    path.join(__dirname, '..', 'dist', 'downloads', decodeURIComponent(reqFilename))
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p) && fs.statSync(p).isFile()) {
      const isPdf = p.toLowerCase().endsWith('.pdf');
      res.setHeader('Content-Type', isPdf ? 'application/pdf' : 'application/octet-stream');
      res.setHeader('Content-Disposition', `${dispositionType}; filename="${encodeURIComponent(path.basename(p))}"`);
      return res.sendFile(p);
    }
  }

  // 2. Probar coincidencia inteligente por nombre base (omitiendo timestamps y guiones bajos)
  const cleanBase = reqFilename
    .replace(/\.pdf$/i, '')
    .replace(/_\d{10,}$/, '')
    .replace(/[_-]/g, ' ')
    .toLowerCase()
    .trim();

  const checkDirs = [downloadsDir, path.join(__dirname, '..', 'dist', 'downloads')];
  for (const dir of checkDirs) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      const matched = files.find(f => {
        const fClean = f.replace(/\.pdf$/i, '').replace(/_\d{10,}$/, '').replace(/[_-]/g, ' ').toLowerCase().trim();
        return fClean === cleanBase || (cleanBase.length > 5 && fClean.includes(cleanBase));
      });
      if (matched) {
        const fullPath = path.join(dir, matched);
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `${dispositionType}; filename="${encodeURIComponent(matched)}"`);
          return res.sendFile(fullPath);
        }
      }
    }
  }

  // 3. Probar si el archivo está en la base de datos PostgreSQL
  if (cloudDb?.pool) {
    try {
      const q = await cloudDb.pool.query(
        'SELECT filename, content_type, data FROM artisan_private.catalog_files WHERE id = $1 OR filename = $1 OR filename = $2 LIMIT 1',
        [reqFilename, decodeURIComponent(reqFilename)]
      );
      if (q.rows.length > 0) {
        const fileRow = q.rows[0];
        res.setHeader('Content-Type', fileRow.content_type || 'application/pdf');
        res.setHeader('Content-Disposition', `${dispositionType}; filename="${encodeURIComponent(fileRow.filename)}"`);
        return res.send(fileRow.data);
      }
    } catch (dbErr) {
      console.warn('[DOWNLOADS] Error consultando catalog_files en PostgreSQL:', dbErr.message);
    }
  }

  // 4. Si es un PDF no encontrado, enviar el catálogo móvil oficial predeterminado
  const defaultCatalog = path.join(downloadsDir, 'catalogo_movil_artesano_digital.pdf');
  if (fs.existsSync(defaultCatalog) && reqFilename.toLowerCase().endsWith('.pdf')) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `${dispositionType}; filename="Catalogo_Artesano_Digital.pdf"`);
    return res.sendFile(defaultCatalog);
  }

  next();
});

app.use('/downloads', express.static(downloadsDir));

// Serve built frontend if exists
const distDir = path.join(__dirname, '..', 'dist');
const publicDir = path.join(__dirname, '..', 'public');

// Static routes for integrated portfolio
const portfolioAreas = [
  'maquetado-inicio-wicho-v2',
  'identidad-corporativa',
  'audiovisual',
  'animacion',
  'ilustracion',
  'modelado-3d',
  'interfaces',
  'impresos',
  'editorial',
  'fotografia'
];

portfolioAreas.forEach(area => {
  const areaDistDir = path.join(distDir, area);
  const areaPublicDir = path.join(publicDir, area);
  if (fs.existsSync(areaDistDir)) {
    app.use(`/${area}`, express.static(areaDistDir));
  } else if (fs.existsSync(areaPublicDir)) {
    app.use(`/${area}`, express.static(areaPublicDir));
  }
});

const portfolioPublicDir = path.join(publicDir, 'portfolio');
const portfolioDistDir = path.join(distDir, 'portfolio');
if (fs.existsSync(portfolioDistDir)) {
  app.use('/portfolio', express.static(portfolioDistDir));
} else if (fs.existsSync(portfolioPublicDir)) {
  app.use('/portfolio', express.static(portfolioPublicDir));
}

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir, { index: false }));
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e4)}`;
    cb(null, `${cleanName}_${uniqueSuffix}${ext}`);
  }
});
const upload = multer({
  storage: cloudDb.enabled ? multer.memoryStorage() : storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter: (req, file, cb) => {
    const allowedExtensions = new Set(['.jpeg', '.jpg', '.png', '.webp', '.gif']);
    const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.has(ext) && allowedTypes.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (JPG, PNG, WebP, GIF)'));
    }
  }
});

// Multer Storage Configuration for Catalog & Documents (up to 50MB)
const catalogStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, downloadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.pdf';
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e4)}`;
    cb(null, `${cleanName}_${uniqueSuffix}${ext}`);
  }
});
const catalogUpload = multer({
  storage: cloudDb.enabled ? multer.memoryStorage() : catalogStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedExtensions = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.doc', '.docx']);
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.has(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF, imágenes (JPG, PNG, WebP) o documentos (DOC/DOCX)'));
    }
  }
});

// Auth Middleware
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso no autorizado. Inicia sesión en el panel.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    if (!['admin', 'superadmin'].includes(decoded.role)) return res.status(403).json({ error: 'Acceso restringido al administrador.' });
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado. Vuelve a identificarte.' });
  }
}

// ==========================================
// 1. PUBLIC ROUTES
// ==========================================

// Worlds
app.get('/api/worlds', (req, res) => {
  try {
    const worlds = db.getWorlds(true);
    res.json(worlds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update World / Area Banner & Metadata
app.put('/api/worlds/:id', requireAdmin, (req, res) => {
  try {
    const updated = db.updateWorld(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/worlds/:id', requireAdmin, (req, res) => {
  try {
    const updated = db.updateWorld(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Categories (Public: excludes empty categories per requirements)
app.get('/api/categories', (req, res) => {
  try {
    const includeEmpty = req.query.all === 'true';
    const categories = db.getCategories(!includeEmpty);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Products
app.get('/api/products', (req, res) => {
  try {
    const { world, category, technique, search, featured, status } = req.query;
    // Public requests can only view 'published'. Admin can request 'all' or 'draft'.
    const filterStatus = 'published';
    const products = db.getProducts({
      world,
      category,
      technique,
      search,
      featured,
      status: filterStatus
    });
    res.json(products.map(publicProduct));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Single Product (Public detail + increments analytics view)
app.get('/api/products/:id', (req, res) => {
  try {
    const product = db.getProductById(req.params.id);
    if (!product || product.status !== 'published') {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    // Register product view event
    db.recordEvent('product_view', { productId: product.id, code: product.code, name: product.name });
    res.json(publicProduct(product));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Settings (Public business info)
app.get('/api/settings', (req, res) => {
  try {
    const settings = db.getSettings();
    res.json(publicSettings(settings));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Seasonal Campaigns & Monthly Specials (Public)
app.get('/api/admin/settings', requireAdmin, (_req, res) => res.json(db.getSettings()));

app.get('/api/campaigns', (req, res) => {
  try {
    const campaigns = db.getCampaignsConfig();
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Arcade & Mini-Juegos (Public)
app.get('/api/arcade/config', (req, res) => {
  try {
    const config = db.getArcadeConfig();
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cupones y Códigos de Descuento (Public)
app.get('/api/coupons', (req, res) => {
  try {
    const { category } = req.query;
    const { coupons } = db.getCoupons({ category, status: 'active' });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Registro de uso de cupón desde checkout / WhatsApp
app.post('/api/coupons/record-use', (req, res) => {
  try {
    const { code, orderTotal, discountAmount, customerName } = req.body;
    if (!code) return res.status(400).json({ error: 'Código de cupón requerido' });
    const result = db.recordCouponUse(code, { orderTotal, discountAmount, customerName });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Analytics tracking from client
app.post('/api/analytics/event', (req, res) => {
  try {
    const { type, payload } = req.body;
    if (type) {
      db.recordEvent(type, payload);
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public Tracking: Visits from marketing publications & UTM links
app.post('/api/tracking/visit', (req, res) => {
  try {
    const { pubCode, utmSource, utmMedium, utmCampaign, path } = req.body;
    if (pubCode) {
      db.recordPubTracking(pubCode, 'visit', { utmSource, utmMedium, utmCampaign, path });
      db.recordEvent('pub_visit', { pubCode, utmSource, utmCampaign });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public Tracking: Direct WhatsApp Clicks (distinguished strictly from inquiries & sales)
app.post('/api/tracking/whatsapp-click', (req, res) => {
  try {
    const { pubCode, productId, code, amount, context } = req.body;
    const activeCode = pubCode || 'desconocido';
    db.recordPubTracking(activeCode, 'whatsapp_click', { productId, code, amount, context });
    db.recordEvent('whatsapp_click', { pubCode: activeCode, productId, code, context });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. AUTHENTICATION ROUTES
// ==========================================

app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (typeof username !== 'string' || typeof password !== 'string' || !username || !password || password.length > 256) {
      return res.status(400).json({ error: 'Por favor ingresa usuario y contraseña.' });
    }

    const currentDb = db.read();
    const cleanUser = username.toLowerCase().trim();
    const user = (currentDb.users || []).find(u => 
      u.username.toLowerCase() === cleanUser || 
      (u.email || '').toLowerCase() === cleanUser ||
      cleanUser === 'wichonemes@gmail.com' ||
      cleanUser === 'wicho'
    );

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const isValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', requireAdmin, (req, res) => {
  res.json({ user: req.user });
});

app.post('/api/auth/change-password', requireAdmin, (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (typeof newPassword !== 'string' || newPassword.length < 12 || Buffer.byteLength(newPassword) > 72 || typeof currentPassword !== 'string') {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 12 caracteres y no superar 72 bytes.' });
    }

    const currentDb = db.read();
    const user = currentDb.users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const isValid = bcrypt.compareSync(currentPassword, user.passwordHash);
    if (!isValid) {
      return res.status(400).json({ error: 'La contraseña actual no coincide.' });
    }

    const salt = bcrypt.genSaltSync(10);
    user.passwordHash = bcrypt.hashSync(newPassword, salt);
    db.save(currentDb);

    res.json({ ok: true, message: 'Contraseña actualizada con éxito.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2.1 PORTFOLIO / MAQUETADO WICHO PERSISTENCE
// ==========================================

// GET /api/portfolio/config
app.get('/api/portfolio/config', (req, res) => {
  try {
    const currentDb = db.read();
    res.json(currentDb.portfolioConfig || { slots: {}, texts: {}, updatedAt: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/portfolio/config (Guardar cambios permanentemente)
app.post('/api/portfolio/config', requireAdmin, (req, res) => {
  try {
    const { slots, texts, replace } = req.body;
    const currentDb = db.read();
    
    currentDb.portfolioConfig = {
      slots: replace ? (slots || {}) : { ...(currentDb.portfolioConfig?.slots || {}), ...(slots || {}) },
      texts: replace ? (texts || {}) : { ...(currentDb.portfolioConfig?.texts || {}), ...(texts || {}) },
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.username || 'admin'
    };

    db.save(currentDb);
    res.json({ ok: true, message: 'Cambios guardados con éxito en el servidor.', config: currentDb.portfolioConfig });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. ADMIN MANAGEMENT ROUTES (PROTECTED)
// ==========================================

// Image Upload
app.post('/api/upload', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }
    if (cloudDb.enabled) return res.json(await storeImage(req.file.buffer));
    const publicUrl = `/uploads/${req.file.filename}`;
    res.json({
      url: publicUrl,
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin All Products (including drafts & archived)
app.get('/api/admin/products', requireAdmin, (req, res) => {
  try {
    const products = db.getProducts({ status: 'all' });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Product
app.post('/api/admin/products', requireAdmin, (req, res) => {
  try {
    const product = db.createProduct(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Product
app.put('/api/admin/products/:id', requireAdmin, (req, res) => {
  try {
    const updated = db.updateProduct(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Quick Update Stock / Availability
app.put('/api/admin/products/:id/stock', requireAdmin, (req, res) => {
  try {
    const { availability, stockQuantity } = req.body;
    const currentProd = db.getProductById(req.params.id);
    if (!currentProd) return res.status(404).json({ error: 'Producto no encontrado' });

    const patch = {};
    if (availability !== undefined) patch.availability = availability;
    if (stockQuantity !== undefined) patch.stockQuantity = Number(stockQuantity);

    const updated = db.updateProduct(currentProd.id, patch);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Flash Deals Batch & Area Controls (Pause, Resume, Reset per area or all)
app.post('/api/admin/flash-deals/control', requireAdmin, (req, res) => {
  try {
    const { action, area } = req.body;
    if (!action) {
      return res.status(400).json({ error: 'Acción no especificada' });
    }
    const result = db.controlFlashDeals({ action, area });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Flash Deals Limits Controls (Get and Update Cap per area)
app.get('/api/admin/flash-deals/limits', requireAdmin, (req, res) => {
  try {
    const limits = db.getFlashDealsLimits();
    res.json({ ok: true, limits });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/flash-deals/limits', requireAdmin, (req, res) => {
  try {
    const { limits } = req.body;
    if (!limits || typeof limits !== 'object') {
      return res.status(400).json({ error: 'Topes por área no especificados' });
    }
    const result = db.updateFlashDealsLimits(limits);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Duplicate Product
app.post('/api/admin/products/:id/duplicate', requireAdmin, (req, res) => {
  try {
    const duplicated = db.duplicateProduct(req.params.id);
    if (!duplicated) return res.status(404).json({ error: 'Producto original no encontrado' });
    res.status(201).json(duplicated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Product
app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
  try {
    const success = db.deleteProduct(req.params.id);
    if (!success) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ ok: true, message: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ESTUDIO FOTOGRÁFICO DE CATÁLOGO (4 TOMAS IA / SHARP)
// ==========================================

// Configuración y transparencia de motor
app.get('/api/admin/photo-studio/config', requireAdmin, (_req, res) => {
  try {
    res.json(getAiStudioConfig());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generar el paquete completo de 4 imágenes [Contexto, Fondo Blanco, Detalle, Medidas]
// Acepta 1 foto principal o hasta 4 tomas de referencia (frente, arriba, costado, detalle)
app.post('/api/admin/photo-studio/generate-all', requireAdmin, upload.any(), async (req, res) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);

    const findBuffer = async (fieldNames, bodyUrlKey) => {
      const f = files.find(file => fieldNames.includes(file.fieldname));
      if (f?.buffer) return f.buffer;
      if (f?.path) return await fs.promises.readFile(f.path);
      if (req.body[bodyUrlKey]) return await getImageBuffer(req.body[bodyUrlKey]);
      return null;
    };

    let frontBuffer = await findBuffer(['referenceImage', 'referenceFront', 'front', 'image'], 'referenceImageUrl');
    if (!frontBuffer && files.length > 0) {
      frontBuffer = files[0].buffer || (files[0].path ? await fs.promises.readFile(files[0].path) : null);
    }
    const topBuffer = await findBuffer(['referenceTop', 'top'], 'referenceTopUrl');
    const sideBuffer = await findBuffer(['referenceSide', 'side'], 'referenceSideUrl');
    const detailBuffer = await findBuffer(['referenceDetail', 'detail'], 'referenceDetailUrl');

    if (!frontBuffer) {
      return res.status(400).json({ error: 'Debes proporcionar al menos la fotografía frontal / principal de referencia (archivo o URL).' });
    }

    let specifications = {};
    if (typeof req.body.specifications === 'string') {
      try { specifications = JSON.parse(req.body.specifications); } catch { specifications = { dimensions: req.body.specifications }; }
    } else if (req.body.specifications) {
      specifications = req.body.specifications;
    }

    if (req.body.dimensions && !specifications.dimensions) specifications.dimensions = req.body.dimensions;
    if (req.body.materials && !specifications.material) specifications.material = req.body.materials;
    if (req.body.includes && !specifications.includes) specifications.includes = req.body.includes;

    let options = {};
    if (typeof req.body.options === 'string') {
      try { options = JSON.parse(req.body.options); } catch { options = {}; }
    } else if (req.body.options) {
      options = req.body.options;
    }

    const result = await processCatalogStudioPackage({
      inputBuffer: frontBuffer,
      referenceImages: {
        front: frontBuffer,
        top: topBuffer,
        side: sideBuffer,
        detail: detailBuffer
      },
      sku: req.body.sku || 'PROD-001',
      productName: req.body.productName || 'Producto Artesano',
      specifications,
      options
    });

    res.json(result);
  } catch (err) {
    console.error('Error en generate-all studio:', err);
    res.status(500).json({ error: err.message || 'Error al procesar paquete de catálogo' });
  }
});

// Subir y optimizar manualmente una imagen de reemplazo para una ranura específica (0, 1, 2 o 3)
app.post('/api/admin/photo-studio/upload-single', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    let inputBuffer = req.file?.buffer;
    if (!inputBuffer && req.file?.path) {
      inputBuffer = await fs.promises.readFile(req.file.path);
    }

    if (!inputBuffer) {
      return res.status(400).json({ error: 'No se recibió ninguna imagen para subir.' });
    }

    const slotIndex = Number(req.body.slotIndex ?? 0);
    const sku = req.body.sku || 'PROD-001';

    const result = await processManualSlotImage({
      inputBuffer,
      sku,
      slotIndex
    });

    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error('Error en upload-single studio:', err);
    res.status(500).json({ error: err.message || 'Error al subir imagen individual' });
  }
});

// Regenerar una sola toma con parámetros ajustados
app.post('/api/admin/photo-studio/regenerate-single', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    let inputBuffer = req.file?.buffer;
    if (!inputBuffer && req.file?.path) {
      inputBuffer = await fs.promises.readFile(req.file.path);
    }

    const slotIndex = Number(req.body.slotIndex ?? 0);
    const baseImageUrl = req.body.baseImageUrl;

    if (!inputBuffer && !baseImageUrl) {
      return res.status(400).json({ error: 'Se requiere una imagen base de referencia o archivo subido.' });
    }

    let specifications = {};
    if (typeof req.body.specifications === 'string') {
      try { specifications = JSON.parse(req.body.specifications); } catch { specifications = {}; }
    } else if (req.body.specifications) {
      specifications = req.body.specifications;
    }
    if (req.body.dimensions && !specifications.dimensions) specifications.dimensions = req.body.dimensions;
    if (req.body.materials && !specifications.material) specifications.material = req.body.materials;
    if (req.body.includes && !specifications.includes) specifications.includes = req.body.includes;

    let options = {};
    if (typeof req.body.options === 'string') {
      try { options = JSON.parse(req.body.options); } catch { options = {}; }
    } else if (req.body.options) {
      options = req.body.options;
    }

    const result = await regenerateSingleSlot({
      slotIndex,
      baseImageUrl,
      inputBuffer,
      sku: req.body.sku || 'PROD-001',
      productName: req.body.productName || '',
      specifications,
      options
    });

    res.json(result);
  } catch (err) {
    console.error('Error en regenerate-single studio:', err);
    res.status(500).json({ error: err.message || 'Error al regenerar ranura individual' });
  }
});

// Aplicar la galería generada al producto (guarda respaldo previo para permitir deshacer)
app.post('/api/admin/photo-studio/apply-to-product', requireAdmin, async (req, res) => {
  try {
    const { productId, gallery } = req.body;
    if (!productId) return res.status(400).json({ error: 'Se requiere el ID del producto.' });
    if (!Array.isArray(gallery) || gallery.length === 0) {
      return res.status(400).json({ error: 'La galería debe ser un arreglo de URLs válidas.' });
    }

    const currentProd = db.getProductById(productId);
    if (!currentProd) return res.status(404).json({ error: 'Producto no encontrado.' });

    // Guardar respaldo de la galería anterior
    const previousImagesBackup = {
      gallery: currentProd.gallery || [],
      primaryImage: currentProd.primaryImage || null,
      whiteBgImage: currentProd.whiteBgImage || null,
      detailImage: currentProd.detailImage || null,
      dimensionsImage: currentProd.dimensionsImage || null,
      measureImage: currentProd.measureImage || null,
      backedUpAt: new Date().toISOString()
    };

    const patch = {
      gallery: gallery,
      primaryImage: gallery[0] || currentProd.primaryImage,
      whiteBgImage: gallery[1] || currentProd.whiteBgImage,
      detailImage: gallery[2] || currentProd.detailImage,
      dimensionsImage: gallery[3] || currentProd.dimensionsImage,
      measureImage: gallery[3] || currentProd.measureImage,
      previousImagesBackup
    };

    const updated = db.updateProduct(productId, patch);
    res.json({
      success: true,
      message: 'Fotografías del catálogo actualizadas correctamente.',
      product: updated,
      hasBackup: true
    });
  } catch (err) {
    console.error('Error al aplicar galería a producto:', err);
    res.status(500).json({ error: err.message || 'Error al guardar la galería en el producto' });
  }
});

// Restaurar galería anterior respaldada
app.post('/api/admin/photo-studio/restore-gallery', requireAdmin, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ error: 'Se requiere el ID del producto.' });

    const currentProd = db.getProductById(productId);
    if (!currentProd) return res.status(404).json({ error: 'Producto no encontrado.' });

    const backup = currentProd.previousImagesBackup;
    if (!backup || !Array.isArray(backup.gallery) || backup.gallery.length === 0) {
      return res.status(400).json({ error: 'No existe un respaldo previo de galería para este producto.' });
    }

    const patch = {
      gallery: backup.gallery,
      primaryImage: backup.primaryImage || backup.gallery[0],
      whiteBgImage: backup.whiteBgImage || backup.gallery[1],
      detailImage: backup.detailImage || backup.gallery[2],
      dimensionsImage: backup.dimensionsImage || backup.gallery[3],
      measureImage: backup.measureImage || backup.gallery[3],
      previousImagesBackup: null // Limpiar respaldo una vez restaurado
    };

    const updated = db.updateProduct(productId, patch);
    res.json({
      success: true,
      message: 'Galería anterior restaurada con éxito.',
      product: updated
    });
  } catch (err) {
    console.error('Error al restaurar galería previa:', err);
    res.status(500).json({ error: err.message || 'Error al restaurar la galería anterior' });
  }
});


// Admin All Categories
app.get('/api/admin/categories', requireAdmin, (req, res) => {
  try {
    const categories = db.getCategories(false); // include empty ones
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Category
app.post('/api/admin/categories', requireAdmin, (req, res) => {
  try {
    const newCat = db.createCategory(req.body);
    res.status(201).json(newCat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Category
app.put('/api/admin/categories/:id', requireAdmin, (req, res) => {
  try {
    const updated = db.updateCategory(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Settings
app.put('/api/admin/settings', requireAdmin, (req, res) => {
  try {
    const updated = db.updateSettings(req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Campaigns & Monthly Specials
app.get('/api/admin/campaigns', requireAdmin, (req, res) => {
  try {
    const campaigns = db.getCampaignsConfig();
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/campaigns', requireAdmin, (req, res) => {
  try {
    const updated = db.updateCampaignsConfig(req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Arcade & Gamification Management (Admin)
app.get('/api/admin/arcade/config', requireAdmin, (req, res) => {
  try {
    const config = db.getArcadeConfig();
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/arcade/config', requireAdmin, (req, res) => {
  try {
    const updated = db.updateArcadeConfig(req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/arcade/reset-coins', requireAdmin, (req, res) => {
  try {
    const result = db.resetArcadeCoins();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Workshop Parameters (Costs & Margins)
app.get('/api/admin/workshop-params', requireAdmin, (req, res) => {
  try {
    const settings = db.getSettings();
    const defaultParams = {
      plaPerKg: 500,
      tpuPerKg: 700,
      electricityPerHour: 1.04,
      wearPerHour: 3.00,
      laborPerHour: 60,
      filamentWastePercent: 15,
      targetMarginPercent: 40,
      reservePercent: 10,
      rateStatus: 'Estimadas'
    };
    res.json(settings.workshopParams || defaultParams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/workshop-params', requireAdmin, (req, res) => {
  try {
    const settings = db.getSettings();
    settings.workshopParams = {
      ...(settings.workshopParams || {}),
      ...req.body
    };
    db.updateSettings(settings);
    res.json(settings.workshopParams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Workshop Machinery & Operational Cost Breakdown (CRUD & calculation)
app.get('/api/admin/workshop-machines', requireAdmin, (req, res) => {
  try {
    const machines = db.getWorkshopMachines();
    res.json(machines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/workshop-machines', requireAdmin, (req, res) => {
  try {
    const updated = db.updateWorkshopMachines(req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/workshop-machines/:id', requireAdmin, (req, res) => {
  try {
    const updated = db.updateWorkshopMachineById(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Máquina no encontrada' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Workshop Workers (Sueldos, Jornadas y Costo por Hora)
app.get('/api/admin/workshop-workers', requireAdmin, (req, res) => {
  try {
    const workers = db.getWorkshopWorkers();
    res.json(workers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/workshop-workers', requireAdmin, (req, res) => {
  try {
    const updated = db.updateWorkshopWorkers(req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/workshop-workers/:id', requireAdmin, (req, res) => {
  try {
    const updated = db.updateWorkshopWorkerById(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Trabajador no encontrado' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Analytics Stats
app.get('/api/admin/analytics', requireAdmin, (req, res) => {
  try {
    const stats = db.getAnalytics();
    const currentDb = db.read();
    res.json({
      ...stats,
      totalProducts: currentDb.products.length,
      publishedProducts: currentDb.products.filter(p => p.status === 'published').length,
      draftProducts: currentDb.products.filter(p => p.status === 'draft').length,
      totalCategories: currentDb.categories.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. VENTAS Y PUBLICACIONES (PROTECTED)
// ==========================================

// Publications (CRUD)
app.get('/api/admin/publications', requireAdmin, (req, res) => {
  try {
    const publications = db.getPublications();
    res.json(publications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/publications', requireAdmin, (req, res) => {
  try {
    const newPub = db.createPublication(req.body);
    res.status(201).json(newPub);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/admin/publications/:id', requireAdmin, (req, res) => {
  try {
    const updated = db.updatePublication(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Publicación no encontrada' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/admin/publications/:id', requireAdmin, (req, res) => {
  try {
    const success = db.deletePublication(req.params.id);
    if (!success) return res.status(404).json({ error: 'Publicación no encontrada' });
    res.json({ ok: true, message: 'Publicación eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Orders & Workshop Sales (CRUD)
app.get('/api/admin/orders', requireAdmin, (req, res) => {
  try {
    const { status, pubCode, productId, startDate, endDate, search } = req.query;
    const orders = db.getOrders({ status, pubCode, productId, startDate, endDate, search });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/orders', requireAdmin, (req, res) => {
  try {
    const newOrder = db.createOrder(req.body);
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/admin/orders/:id', requireAdmin, (req, res) => {
  try {
    const currentOrder = (db.getOrders({}).find(o => o.id === req.params.id));
    const updated = db.updateOrder(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Pedido no encontrado' });

    // Auto-descuento de insumos de taller si el pedido entra a fabricación o se confirma
    const shouldDeduct = req.body.consumeStock === true || (
      ['confirmado', 'pagado', 'fabricando', 'en_produccion'].includes(req.body.status) &&
      currentOrder && !currentOrder.materialsDeducted &&
      req.body.consumeStock !== false
    );

    if (shouldDeduct && !updated.materialsDeducted && updated.productId) {
      const deductionRes = db.deductRecipeMaterials(updated.productId, updated.quantity || 1, {
        orderId: updated.id,
        orderNumber: updated.orderNumber,
        productName: updated.productName,
        reason: `Fabricación de pedido #${updated.orderNumber}`
      });
      if (deductionRes.success) {
        db.updateOrder(updated.id, {
          materialsDeducted: true,
          materialsDeductedAt: new Date().toISOString()
        });
        updated.materialsDeducted = true;
        updated.materialsDeductedAt = new Date().toISOString();
      }
    } else if (req.body.revertStock === true || (req.body.status === 'cancelado' && currentOrder?.materialsDeducted)) {
      db.revertRecipeDeduction(updated.id);
      db.updateOrder(updated.id, {
        materialsDeducted: false,
        materialsDeductedAt: null
      });
      updated.materialsDeducted = false;
      updated.materialsDeductedAt = null;
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/admin/orders/:id', requireAdmin, (req, res) => {
  try {
    const success = db.deleteOrder(req.params.id);
    if (!success) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json({ ok: true, message: 'Pedido eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sales & Marketing Report with attribution & recurrence
app.get('/api/admin/sales-report', requireAdmin, (req, res) => {
  try {
    const { startDate, endDate, socialNetwork, productId } = req.query;
    const report = db.getSalesReport({ startDate, endDate, socialNetwork, productId });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4.5. GESTIÓN DE CUPONES Y DESCUENTOS (PROTECTED)
// ==========================================
app.get('/api/admin/coupons', requireAdmin, (req, res) => {
  try {
    const { category, status, search } = req.query;
    const data = db.getCoupons({ category, status, search });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/coupons', requireAdmin, (req, res) => {
  try {
    const newCoupon = db.createCoupon(req.body);
    res.status(201).json(newCoupon);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/admin/coupons/:id', requireAdmin, (req, res) => {
  try {
    const updated = db.updateCoupon(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Cupón no encontrado' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/admin/coupons/:id', requireAdmin, (req, res) => {
  try {
    const success = db.deleteCoupon(req.params.id);
    if (!success) return res.status(404).json({ error: 'Cupón no encontrado' });
    res.json({ ok: true, message: 'Cupón eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. MATERIAS PRIMAS DEL TALLER & COSTOS OPERATIVOS (PROTECTED)
// ==========================================

// Get all raw materials with stock status
app.get('/api/admin/raw-materials', requireAdmin, (req, res) => {
  try {
    const materials = db.getRawMaterials();
    res.json(materials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create raw material
app.post('/api/admin/raw-materials', requireAdmin, (req, res) => {
  try {
    const newMat = db.createRawMaterial(req.body);
    res.status(201).json(newMat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update raw material
app.put('/api/admin/raw-materials/:id', requireAdmin, (req, res) => {
  try {
    const updated = db.updateRawMaterial(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Materia prima no encontrada' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Quick adjust raw material stock
app.put('/api/admin/raw-materials/:id/stock', requireAdmin, (req, res) => {
  try {
    const { currentStock, delta } = req.body;
    const currentMat = db.getRawMaterialById(req.params.id);
    if (!currentMat) return res.status(404).json({ error: 'Materia prima no encontrada' });

    let newStock = Number(currentMat.currentStock) || 0;
    if (delta !== undefined) {
      newStock = Math.max(0, newStock + Number(delta));
    } else if (currentStock !== undefined) {
      newStock = Math.max(0, Number(currentStock));
    }

    const updated = db.updateRawMaterialStock(req.params.id, newStock);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete raw material
app.delete('/api/admin/raw-materials/:id', requireAdmin, (req, res) => {
  try {
    const success = db.deleteRawMaterial(req.params.id);
    if (!success) return res.status(404).json({ error: 'Materia prima no encontrada' });
    res.json({ ok: true, message: 'Materia prima eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// RECETAS DE MANUFACTURA & CONSUMO DE TALLER (BOM)
// ==========================================

// Obtener historial / bitácora de consumo de insumos por producción
app.get('/api/admin/production/logs', requireAdmin, (req, res) => {
  try {
    const limit = Number(req.query.limit) || 100;
    const logs = db.getProductionLogs(limit);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Simular fabricación y consumo de materiales de un producto
app.post('/api/admin/production/simulate', requireAdmin, (req, res) => {
  try {
    const { productId, units = 1 } = req.body;
    const customRecipe = req.body.customRecipe || req.body.recipe;
    const result = db.simulateRecipeProduction(productId, units, customRecipe);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Descontar insumos de taller por fabricación
app.post('/api/admin/production/deduct', requireAdmin, (req, res) => {
  try {
    const { productId, units = 1, orderId, orderNumber, reason, productName, productCode } = req.body;
    const customRecipe = req.body.customRecipe || req.body.recipe;
    const result = db.deductRecipeMaterials(productId, units, { orderId, orderNumber, reason, customRecipe, productName, productCode });
    if (!result.success) {
      return res.status(400).json({ error: result.error || 'Error al descontar insumos de taller' });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Revertir descuento de insumos de taller para un pedido
app.post('/api/admin/production/revert', requireAdmin, (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ error: 'orderId es requerido' });
    const result = db.revertRecipeDeduction(orderId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// SUPPLIERS (PROVEEDORES DEL TALLER)
// ==========================================

// Get all suppliers
app.get('/api/admin/suppliers', requireAdmin, (req, res) => {
  try {
    const suppliers = db.getSuppliers();
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get supplier by ID or name
app.get('/api/admin/suppliers/:id', requireAdmin, (req, res) => {
  try {
    const supplier = db.getSupplierById(req.params.id);
    if (!supplier) return res.status(404).json({ error: 'Proveedor no encontrado' });
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create supplier
app.post('/api/admin/suppliers', requireAdmin, (req, res) => {
  try {
    const newSup = db.createSupplier(req.body);
    res.status(201).json(newSup);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update supplier
app.put('/api/admin/suppliers/:id', requireAdmin, (req, res) => {
  try {
    const updated = db.updateSupplier(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Proveedor no encontrado' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete supplier
app.delete('/api/admin/suppliers/:id', requireAdmin, (req, res) => {
  try {
    const success = db.deleteSupplier(req.params.id);
    if (!success) return res.status(404).json({ error: 'Proveedor no encontrado' });
    res.json({ ok: true, message: 'Proveedor eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. BACKUPS DEL SISTEMA & RESPALDOS HISTÓRICOS (PROTECTED)
// ==========================================

// Listar respaldos existentes
app.get('/api/admin/backups', requireAdmin, async (req, res) => {
  try {
    const list = cloudDb.enabled ? await cloudDb.listBackups() : db.listBackups();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generar respaldo inmediato
app.post('/api/admin/backups/create', requireAdmin, async (req, res) => {
  try {
    const { label } = req.body || {};
    const backup = cloudDb.enabled ? await cloudDb.createBackup(label || 'manual') : db.createBackup(label || 'manual');
    res.status(201).json(backup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Restaurar un respaldo
app.post('/api/admin/backups/restore', requireAdmin, async (req, res) => {
  try {
    const { filename } = req.body || {};
    if (!filename) {
      return res.status(400).json({ error: 'Debes especificar el nombre del archivo a restaurar' });
    }
    const result = cloudDb.enabled ? await cloudDb.restoreBackup(filename) : db.restoreBackup(filename);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Descargar archivo de respaldo para guardarlo fuera de línea
app.get('/api/admin/backups/download/:filename', requireAdmin, async (req, res) => {
  try {
    if (cloudDb.enabled) {
      const data = await cloudDb.getBackup(req.params.filename);
      if (!data) return res.status(404).json({ error: 'Respaldo no encontrado.' });
      res.attachment(path.basename(req.params.filename));
      return res.json(data);
    }
    const filePath = db.getBackupPath(req.params.filename);
    if (!filePath) {
      return res.status(404).json({ error: 'Archivo de respaldo no encontrado' });
    }
    res.download(filePath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mobile Catalog Configuration & Multi-Catalog Upload Endpoints
app.get('/api/admin/catalog-pdf/config', requireAdmin, (_req, res) => {
  try {
    const config = db.getMobileCatalogConfig();
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint público para que los clientes descarguen o consulten los catálogos activos
app.get('/api/catalog-pdf/list', (_req, res) => {
  try {
    const config = db.getMobileCatalogConfig();
    const activeCatalogs = (config.catalogs || []).filter(c => c.enabled !== false);
    res.json({
      enabled: config.enabled !== false,
      title: config.title || 'Catálogos Oficiales de Temporada',
      subtitle: config.subtitle || 'Descarga nuestros catálogos en PDF vertical para celular',
      buttonText: config.buttonText || '📱 Catálogos PDF',
      catalogs: activeCatalogs,
      primaryCatalog: activeCatalogs.find(c => c.isPrimary) || activeCatalogs[0] || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para descargar o visualizar directamente un catálogo por ID
app.get('/api/catalog-pdf/download/:id', async (req, res) => {
  try {
    const isAttachment = req.query.download === '1' || req.query.download === 'true';
    const dispositionType = isAttachment ? 'attachment' : 'inline';

    // 1. Probar primero si el ID o nombre está directamente en artisan_private.catalog_files
    if (cloudDb?.pool) {
      try {
        const q = await cloudDb.pool.query(
          'SELECT filename, content_type, data FROM artisan_private.catalog_files WHERE id = $1 LIMIT 1',
          [req.params.id]
        );
        if (q.rows.length > 0) {
          const fileRow = q.rows[0];
          res.setHeader('Content-Type', fileRow.content_type || 'application/pdf');
          res.setHeader('Content-Disposition', `${dispositionType}; filename="${encodeURIComponent(fileRow.filename)}"`);
          return res.send(fileRow.data);
        }
      } catch (err) {
        console.warn('[STORAGE] Nota sobre búsqueda directa de catálogo en PostgreSQL:', err.message);
      }
    }

    // 2. Obtener la configuración de catálogos mediante transacción segura si cloudDb está activo
    let config;
    if (cloudDb?.enabled) {
      await cloudDb.transaction(async () => {
        config = db.getMobileCatalogConfig();
      });
    } else {
      config = db.getMobileCatalogConfig();
    }

    const catalogs = config?.catalogs || [];
    const item = catalogs.find(c => c.id === req.params.id) || 
      (req.params.id === 'primary' ? (catalogs.find(c => c.isPrimary) || catalogs[0]) : null);

    if (!item) {
      // Fallback al catálogo predeterminado si no se encuentra el ítem
      const defaultCatalog = path.join(downloadsDir, 'catalogo_movil_artesano_digital.pdf');
      if (fs.existsSync(defaultCatalog)) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `${dispositionType}; filename="Catalogo_Artesano_Digital.pdf"`);
        return res.sendFile(defaultCatalog);
      }
      return res.status(404).json({ error: 'Catálogo no encontrado' });
    }

    const fileName = item.fileName || `${item.name || 'catalogo'}.pdf`;

    // 3. Probar ruta de archivo local en public/downloads o dist/downloads
    if (item.fileUrl && item.fileUrl.startsWith('/downloads/')) {
      const diskFilename = item.fileUrl.replace('/downloads/', '');
      const candidatePaths = [
        path.join(downloadsDir, diskFilename),
        path.join(downloadsDir, decodeURIComponent(diskFilename)),
        path.join(__dirname, '..', 'dist', 'downloads', diskFilename),
        path.join(__dirname, '..', 'dist', 'downloads', decodeURIComponent(diskFilename)),
        path.join(downloadsDir, fileName),
        path.join(downloadsDir, decodeURIComponent(fileName))
      ];
      for (const p of candidatePaths) {
        if (fs.existsSync(p) && fs.statSync(p).isFile()) {
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `${dispositionType}; filename="${encodeURIComponent(fileName)}"`);
          return res.sendFile(p);
        }
      }
    }

    // 4. Probar en base de datos PostgreSQL por ID o nombre de archivo
    if (cloudDb?.pool) {
      try {
        const q = await cloudDb.pool.query(
          'SELECT filename, content_type, data FROM artisan_private.catalog_files WHERE id = $1 OR filename = $2 LIMIT 1',
          [item.id, item.fileName || fileName]
        );
        if (q.rows.length > 0) {
          const fileRow = q.rows[0];
          res.setHeader('Content-Type', fileRow.content_type || 'application/pdf');
          res.setHeader('Content-Disposition', `${dispositionType}; filename="${encodeURIComponent(fileRow.filename || fileName)}"`);
          return res.send(fileRow.data);
        }
      } catch (err) {
        console.warn('[STORAGE] Error recuperando PDF de PostgreSQL:', err.message);
      }
    }

    // 5. Si tiene URL externa http/https
    if (item.fileUrl && item.fileUrl.startsWith('http')) {
      return res.redirect(item.fileUrl);
    }

    // 6. Fallback final al catálogo oficial
    const defaultCatalog = path.join(downloadsDir, 'catalogo_movil_artesano_digital.pdf');
    if (fs.existsSync(defaultCatalog)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `${dispositionType}; filename="${encodeURIComponent(fileName)}"`);
      return res.sendFile(defaultCatalog);
    }

    res.status(404).json({ error: 'Archivo PDF no disponible' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/catalog-pdf/config', requireAdmin, (req, res) => {
  try {
    const updated = db.updateMobileCatalogConfig(req.body || {});
    res.json({ success: true, mobileCatalogConfig: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/catalog-pdf/upload', requireAdmin, catalogUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }
    let fileUrl = '';
    let fileName = req.file.originalname || 'catalogo.pdf';
    let fallbackFilename = '';
    const fileSizeFormatted = req.file.size > 1024 * 1024
      ? `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${Math.round(req.file.size / 1024)} KB`;

    if (cloudDb.enabled) {
      try {
        const stored = await storeFile(req.file.buffer, req.file.originalname, req.file.mimetype || 'application/pdf');
        fileUrl = stored.url;
        fileName = stored.filename || req.file.originalname;
      } catch (storeErr) {
        console.warn('Almacenamiento en la nube no disponible para PDF, usando almacenamiento local:', storeErr.message);
        const ext = path.extname(req.file.originalname).toLowerCase() || '.pdf';
        const cleanBase = path.basename(req.file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
        fallbackFilename = `${cleanBase}_${Date.now()}${ext}`;
        if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });
        const targetPath = path.join(downloadsDir, fallbackFilename);
        fs.writeFileSync(targetPath, req.file.buffer);
        // También respaldar en dist/downloads si existe la carpeta de compilación
        if (fs.existsSync(distDir)) {
          const distDownloads = path.join(distDir, 'downloads');
          if (!fs.existsSync(distDownloads)) fs.mkdirSync(distDownloads, { recursive: true });
          fs.writeFileSync(path.join(distDownloads, fallbackFilename), req.file.buffer);
        }
        fileUrl = `/downloads/${fallbackFilename}`;
        fileName = req.file.originalname || fallbackFilename;
      }
    } else {
      fileUrl = `/downloads/${req.file.filename}`;
      fileName = req.file.originalname || req.file.filename;
    }

    const { catalogId, name, season, badge, description, isPrimary, enabled } = req.body || {};
    const assignedId = catalogId || (`cat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);

    // Respaldar archivo PDF binario en la base de datos PostgreSQL
    if (cloudDb?.pool && req.file?.buffer) {
      try {
        const fileBuffer = req.file.buffer;
        const mimeType = req.file.mimetype || 'application/pdf';
        const keysToStore = [assignedId, fileName];
        if (typeof fallbackFilename !== 'undefined' && fallbackFilename) {
          keysToStore.push(fallbackFilename);
        }
        for (const k of keysToStore) {
          await cloudDb.pool.query(`
            INSERT INTO artisan_private.catalog_files (id, filename, content_type, data, size_bytes, updated_at)
            VALUES ($1, $2, $3, $4, $5, now())
            ON CONFLICT (id) DO UPDATE SET
              filename = EXCLUDED.filename,
              content_type = EXCLUDED.content_type,
              data = EXCLUDED.data,
              size_bytes = EXCLUDED.size_bytes,
              updated_at = now()
          `, [k, fileName, mimeType, fileBuffer, fileBuffer.length]);
        }
        console.log(`[STORAGE] Archivo PDF "${fileName}" respaldado en PostgreSQL bajo ID: ${assignedId}`);
      } catch (dbErr) {
        console.warn('[STORAGE] Advertencia guardando PDF en PostgreSQL:', dbErr.message);
      }
    }

    const applyItem = () => {
      if (catalogId) {
        db.updateMobileCatalogItem(catalogId, {
          fileName,
          fileUrl,
          fileSize: fileSizeFormatted,
          fileType: req.file.mimetype || 'application/pdf',
          ...(name ? { name } : {}),
          ...(season ? { season } : {}),
          ...(badge ? { badge } : {}),
          ...(description ? { description } : {}),
          ...(isPrimary !== undefined ? { isPrimary: isPrimary === 'true' || isPrimary === true } : {}),
          ...(enabled !== undefined ? { enabled: enabled === 'true' || enabled === true } : {})
        });
      } else {
        db.addMobileCatalogItem({
          id: assignedId,
          name: name || fileName.replace(/\.[^/.]+$/, '').replace(/[_|-]/g, ' '),
          season: season || 'Temporada Actual',
          badge: badge || 'Nuevo',
          description: description || 'Catálogo oficial descargable.',
          fileName,
          fileUrl,
          fileSize: fileSizeFormatted,
          fileType: req.file.mimetype || 'application/pdf',
          enabled: enabled !== undefined ? (enabled === 'true' || enabled === true) : true,
          isPrimary: isPrimary === 'true' || isPrimary === true
        });
      }
      return db.getMobileCatalogConfig();
    };

    let updatedConfig;
    if (cloudDb.enabled) {
      await cloudDb.transaction(async () => {
        updatedConfig = applyItem();
      });
    } else {
      updatedConfig = applyItem();
    }

    res.json({ success: true, mobileCatalogConfig: updatedConfig });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/catalog-pdf/item', requireAdmin, (req, res) => {
  try {
    const item = db.addMobileCatalogItem(req.body || {});
    res.json({ success: true, item, mobileCatalogConfig: db.getMobileCatalogConfig() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/catalog-pdf/item/:id', requireAdmin, (req, res) => {
  try {
    const updated = db.updateMobileCatalogItem(req.params.id, req.body || {});
    if (!updated) return res.status(404).json({ error: 'Catálogo no encontrado' });
    res.json({ success: true, catalog: updated, mobileCatalogConfig: db.getMobileCatalogConfig() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/catalog-pdf/item/:id', requireAdmin, (req, res) => {
  try {
    const ok = db.deleteMobileCatalogItem(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Catálogo no encontrado' });
    res.json({ success: true, mobileCatalogConfig: db.getMobileCatalogConfig() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/catalog-pdf/reset', requireAdmin, (_req, res) => {
  try {
    const reset = db.resetMobileCatalogConfig();
    res.json({ success: true, mobileCatalogConfig: reset });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/api', (_req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));
app.use((error, _req, res, _next) => {
  const message = error?.message || (error instanceof multer.MulterError ? 'El archivo excede el tamaño máximo permitido.' : 'No fue posible procesar la solicitud.');
  res.status(400).json({ error: message });
});

// Fallback for SPA routing if dist exists con soporte para Open Graph dinámico en WhatsApp
const distIndex = path.join(distDir, 'index.html');
if (fs.existsSync(distIndex)) {
  app.use((req, res) => {
    // Si la solicitud es para un asset o endpoint no HTML, dejar pasar
    if (req.path.startsWith('/assets/') || req.path.startsWith('/uploads/') || req.path.startsWith('/brand/')) {
      return res.status(404).end();
    }

    try {
      const baseHtml = fs.readFileSync(distIndex, 'utf8');
      const proto = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'https');
      const host = req.headers['x-forwarded-host'] || req.headers['host'] || 'artesano-digital.onrender.com';
      const baseUrl = `${proto}://${host}`;

      const targetProdCode = (req.query.prod || '').trim().toUpperCase();
      let matchedProduct = null;
      if (targetProdCode) {
        matchedProduct = db.getProducts({ status: 'all' }).find(p => 
          (p.code && p.code.toUpperCase() === targetProdCode) ||
          (p.id && String(p.id).toUpperCase() === targetProdCode) ||
          (p.sku && p.sku.toUpperCase() === targetProdCode)
        );
      }

      let renderedHtml = baseHtml;

      if (matchedProduct) {
        const prodName = matchedProduct.name || 'Producto Exclusivo';
        const prodPrice = matchedProduct.price ? `$${matchedProduct.price} MXN` : 'A cotizar';
        const prodDesc = `${matchedProduct.shortDescription || 'Pieza artesanal personalizada fabricada en taller'} · ${prodPrice} · Pedido directo por WhatsApp.`;
        const prodImg = matchedProduct.primaryImage && matchedProduct.primaryImage.startsWith('http')
          ? matchedProduct.primaryImage
          : `${baseUrl}${matchedProduct.primaryImage || '/brand/og_artesano_preview.jpg'}`;

        renderedHtml = renderedHtml
          .replace(/<title>[\s\S]*?<\/title>/i, `<title>${prodName} — Artesano Digital</title>`)
          .replace(/<meta\s+property=["']og:title["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:title" content="${prodName} — Artesano Digital" />`)
          .replace(/<meta\s+property=["']og:description["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:description" content="${prodDesc}" />`)
          .replace(/<meta\s+property=["']og:image["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:image" content="${prodImg}" />`)
          .replace(/<meta\s+property=["']og:image:secure_url["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:image:secure_url" content="${prodImg}" />`)
          .replace(/<meta\s+name=["']twitter:title["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="twitter:title" content="${prodName} — Artesano Digital" />`)
          .replace(/<meta\s+name=["']twitter:description["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="twitter:description" content="${prodDesc}" />`)
          .replace(/<meta\s+name=["']twitter:image["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="twitter:image" content="${prodImg}" />`);
      } else {
        // Enlace general de tienda: asegurar URLs absolutas válidas para el rastreador de WhatsApp
        const defaultImg = `${baseUrl}/brand/og_artesano_preview.jpg`;
        renderedHtml = renderedHtml
          .replace(/<meta\s+property=["']og:image["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:image" content="${defaultImg}" />`)
          .replace(/<meta\s+property=["']og:image:secure_url["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:image:secure_url" content="${defaultImg}" />`)
          .replace(/<meta\s+name=["']twitter:image["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="twitter:image" content="${defaultImg}" />`);
      }

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(renderedHtml);
    } catch {
      res.sendFile(distIndex);
    }
  });
}

app.post('/api/admin/sync-catalog', requireAdmin, (req, res) => {
  try {
    const result = db.syncCatalogWithCodebase();
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default app;

if (!process.env.VERCEL) {
  const server = app.listen(PORT, '0.0.0.0', async () => {
    console.log(`Server running at http://localhost:${server.address().port}`);
    
    if (cloudDb.enabled) {
      try {
        await cloudDb.transaction(() => {
          if (cloudDb.read().users.some(user => bcrypt.compareSync('Artesano2026!', user.passwordHash))) {
            console.warn('[SEGURIDAD] Recuerda cambiar la contraseña predeterminada del administrador.');
          }
          // Sincronizar catálogo oficial con Postgres al arrancar
          db.syncCatalogWithCodebase();
        });
      } catch (err) {
        console.error('[DATABASE] Error conectando a base de datos externa en arranque. Continuando con catálogo local:', err.message);
        db.syncCatalogWithCodebase();
      }
    } else if (process.env.NODE_ENV !== 'test') {
      // Sincronizar catálogo local (salvo en pruebas unitarias)
      try {
        db.syncCatalogWithCodebase();
      } catch (err) {
        console.error('[DATABASE] Error en sincronización local de catálogo:', err.message);
      }
    }
  });
}
