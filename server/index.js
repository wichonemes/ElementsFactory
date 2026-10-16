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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5000;
const production = process.env.NODE_ENV === 'production';
if (production && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) throw new Error('Configura JWT_SECRET con al menos 32 caracteres.');
if (production && !cloudDb.enabled) throw new Error('Producción necesita DATABASE_URL; no se permite guardar en disco temporal.');
if (production && (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)) throw new Error('Falta configurar Supabase Storage.');
const JWT_SECRET = process.env.JWT_SECRET || 'artesano_digital_super_secret_jwt_key_2026';
app.disable('x-powered-by');
if (process.env.RENDER) app.set('trust proxy', 1);
// Wrap only the final API handler: authentication and multipart parsing run first.
for (const method of ['get', 'post', 'put', 'delete', 'patch']) {
  const register = app[method].bind(app);
  app[method] = (route, ...handlers) => {
    if (typeof route === 'string' && route.startsWith('/api/') && handlers.length) {
      handlers[handlers.length - 1] = durableHandler(cloudDb, handlers.at(-1));
    }
    return register(route, ...handlers);
  };
}
app.get('/healthz', (_req, res) => res.json({ ok: true }));

// Middlewares
if (!production) app.use(cors());
app.use((_req, res, next) => { res.set('X-Content-Type-Options', 'nosniff'); next(); });
app.use('/api', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
app.use('/api/auth/login', rateLimit({ limit: 15, windowMs: 15 * 60 * 1000 }));
const trackingLimit = rateLimit({ limit: 120, windowMs: 60 * 1000 });
app.use(['/api/analytics/event', '/api/tracking'], trackingLimit);
app.use(express.json());

// Public static uploads
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Public static downloads (Catálogo PDF Móvil, etc.)
const downloadsDir = path.join(__dirname, '..', 'public', 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}
app.use('/downloads', express.static(downloadsDir));

// Serve built frontend if exists
const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
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
  if (!production && !authHeader) {
    req.user = { id: 'admin-dev', username: 'admin', role: 'superadmin' };
    return next();
  }
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
    const user = (currentDb.users || []).find(u => u.username.toLowerCase() === username.toLowerCase().trim() || (u.email || '').toLowerCase() === username.toLowerCase().trim());

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
    const updated = db.updateOrder(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Pedido no encontrado' });
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

// Mobile Catalog Configuration & Upload Endpoints
app.get('/api/admin/catalog-pdf/config', requireAdmin, (_req, res) => {
  try {
    const config = db.getMobileCatalogConfig();
    res.json(config);
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
    const fileSizeFormatted = req.file.size > 1024 * 1024
      ? `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${Math.round(req.file.size / 1024)} KB`;

    if (cloudDb.enabled) {
      const stored = await storeFile(req.file.buffer, req.file.originalname, req.file.mimetype);
      fileUrl = stored.url;
      fileName = stored.filename || req.file.originalname;
    } else {
      fileUrl = `/downloads/${req.file.filename}`;
      fileName = req.file.originalname || req.file.filename;
    }

    const updated = db.updateMobileCatalogConfig({
      fileName,
      fileUrl,
      fileSize: fileSizeFormatted,
      fileType: req.file.mimetype,
      enabled: true
    });

    res.json({ success: true, mobileCatalogConfig: updated });
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
  res.status(400).json({ error: error instanceof multer.MulterError ? 'La imagen supera el límite permitido.' : 'No fue posible procesar la solicitud.' });
});

// Fallback for SPA routing if dist exists
const distIndex = path.join(distDir, 'index.html');
if (fs.existsSync(distIndex)) {
  app.use((req, res) => {
    res.sendFile(distIndex, (err) => {
      if (err) res.status(404).end();
    });
  });
}

if (cloudDb.enabled) {
  await cloudDb.transaction(() => {
    if (cloudDb.read().users.some(user => bcrypt.compareSync('Artesano2026!', user.passwordHash))) {
      throw new Error('Cambia la contraseña predeterminada del administrador antes de publicar.');
    }
  });
}

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${server.address().port}`);
});
