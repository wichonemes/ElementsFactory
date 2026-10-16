import React, { useState, useEffect, useMemo } from 'react';
import {
  X, Shield, Lock, LogOut, Plus, Edit, Copy, Trash2, Eye,
  BarChart3, Package, FolderTree, Settings, Upload, Check, AlertTriangle,
  ExternalLink, Search, RefreshCw, KeyRound, Sparkles,
  Flame, Clock, Zap, Percent, Image as ImageIcon, Layers, Tag, HelpCircle,
  TrendingUp, CheckCircle2, ArrowRight,
  Sliders, DollarSign, Calculator, Boxes, Minus, ChevronDown, ChevronUp,
  Home, Briefcase, PartyPopper, Printer, Palette, Scissors, Radio, Filter,
  Megaphone, Truck, MapPin, Calendar, Power, AlertCircle, Gift, Building2,
  Database, Save, Download, Gamepad2, Smartphone
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import SalesMarketingSection from './SalesMarketingSection';
import MobileCatalogAdminSection from './MobileCatalogAdminSection';
import RawMaterialsSection, { parsePackageInfo } from './RawMaterialsSection';
import FlashDealsControlSection from './FlashDealsControlSection';
import CampaignsAdminSection from './CampaignsAdminSection';
import ArcadeAdminSection from './ArcadeAdminSection';
import AreaBannersAdminSection from './AreaBannersAdminSection';
import PackagesAdminSection from './PackagesAdminSection';
import AdminConfirmSaveModal from './AdminConfirmSaveModal';
import {
  DEFAULT_SERVICE_STATUS,
  formatServiceDate,
  getDatePlusDays,
  getNextMondayDate,
  getNextMonthFirstDay,
  getServiceStatusSummary
} from '../utils/serviceStatus';
import { getFilamentColor, getProductColorOptions } from '../utils/colorUtils';
import {
  SKU_AREAS,
  SKU_TECHNIQUES,
  SKU_MATERIALS,
  SKU_FINISHES,
  buildSku,
  parseSku,
  suggestSkuForProduct
} from '../utils/skuHelper';

export default function AdminPanel({ isOpen, onClose, onRefreshCatalog, flashDeal = null }) {
  if (!isOpen) return null;

  // Auth State
  const [token, setToken] = useState(() => localStorage.getItem('artesano_admin_token') || '');
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('artesano_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState('products'); // 'stats' | 'products' | 'categories' | 'settings'
  const [rawMaterialsSubTab, setRawMaterialsSubTab] = useState('inventory');

  // Data State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [businessSettings, setBusinessSettings] = useState(null);
  const [loadingData, setLoadingData] = useState(false);

  // Product Filter State
  const [productSearch, setProductSearch] = useState('');
  const [filterWorld, setFilterWorld] = useState('all'); // 'all' | 'hogar' | 'negocios' | 'eventos'
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterStock, setFilterStock] = useState('all'); // 'all' | 'in_stock' | 'made_to_order'
  const [filterTechnique, setFilterTechnique] = useState('all');

  // Cost & Margins (Workshop Parameters & Calculations)
  const [workshopParams, setWorkshopParams] = useState({
    plaPerKg: 500,
    tpuPerKg: 700,
    electricityPerHour: 1.04,
    wearPerHour: 3.00,
    laborPerHour: 60,
    filamentWastePercent: 15,
    targetMarginPercent: 40,
    reservePercent: 10,
    rateStatus: 'Estimadas'
  });
  const [savingParams, setSavingParams] = useState(false);
  const [paramsSaveMsg, setParamsSaveMsg] = useState('');
  const [showWorkshopParams, setShowWorkshopParams] = useState(false);
  const [marginsSearch, setMarginsSearch] = useState('');
  const [marginsWorld, setMarginsWorld] = useState('all');
  const [marginsTechnique, setMarginsTechnique] = useState('all');
  const [marginsStatus, setMarginsStatus] = useState('all'); // 'all' | 'optimal' | 'low' | 'loss' | 'missing'

  // Category Filter & Technique Audit State
  const [categoryWorld, setCategoryWorld] = useState('all');
  const [categoryTechnique, setCategoryTechnique] = useState('all');
  const [categorySearch, setCategorySearch] = useState('');

  // Detailed Cost Breakdown Modal State (Recipe Calculator)
  const [breakdownModalProduct, setBreakdownModalProduct] = useState(null);
  const [breakdownForm, setBreakdownForm] = useState(null);
  const [rawMaterialsList, setRawMaterialsList] = useState([]);
  const [showAddQuantityModal, setShowAddQuantityModal] = useState(false);
  const [recipeSelectedMatId, setRecipeSelectedMatId] = useState('');
  const [recipeCustomMatName, setRecipeCustomMatName] = useState('');
  const [recipeNewMatQty, setRecipeNewMatQty] = useState(12);
  const [recipeNewMatUnit, setRecipeNewMatUnit] = useState('g');
  const [recipeCustomUnitCost, setRecipeCustomUnitCost] = useState(0.8);
  const [recipeMatSearch, setRecipeMatSearch] = useState('');

  // Product Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editorForm, setEditorForm] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [customColorInput, setCustomColorInput] = useState('');
  const [newIncludedItemInput, setNewIncludedItemInput] = useState('');
  const [editorActiveSlot, setEditorActiveSlot] = useState(0); // 0: Portada/Contexto, 1: Fondo blanco, 2: Detalle, 3: Medidas/Escala
  const [editorSkuAccordion, setEditorSkuAccordion] = useState(false);
  const [editorColorsAccordion, setEditorColorsAccordion] = useState(false);
  const [editorFlashAccordion, setEditorFlashAccordion] = useState(false);

  // Password change state
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });
  const [serviceStatusMsg, setServiceStatusMsg] = useState({ text: '', type: '' });

  // Backups State
  const [backupsList, setBackupsList] = useState([]);
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupMsg, setBackupMsg] = useState({ text: '', type: '' });

  // Modal de Confirmación y Desglose de Cambios
  const [adminConfirmModal, setAdminConfirmModal] = useState({
    isOpen: false,
    title: '',
    subtitle: '',
    badge: '',
    confirmText: 'Confirmar y Guardar',
    changes: [],
    onConfirm: null
  });

  // Load Data when token is present
  useEffect(() => {
    if (token) {
      loadAllData();
    }
  }, [token]);

  const loadAllData = async () => {
    setLoadingData(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [resProd, resCat, resStats, resSett, resMats] = await Promise.all([
        fetch('/api/admin/products', { headers }),
        fetch('/api/admin/categories', { headers }),
        fetch('/api/admin/analytics', { headers }),
        fetch('/api/admin/settings', { headers }),
        fetch('/api/admin/raw-materials', { headers }).catch(() => null)
      ]);

      if (resProd.status === 401 || resCat.status === 401) {
        handleLogout();
        return;
      }

      const [dataProd, dataCat, dataStats, dataSett] = await Promise.all([
        resProd.json(),
        resCat.json(),
        resStats.json(),
        resSett.json()
      ]);
      loadBackups();

      setProducts(dataProd || []);
      setCategories(dataCat || []);
      setAnalytics(dataStats || null);
      setBusinessSettings(dataSett || null);
      if (dataSett?.workshopParams) {
        setWorkshopParams(dataSett.workshopParams);
      }
      if (resMats && resMats.ok) {
        try {
          const dataMats = await resMats.json();
          setRawMaterialsList(Array.isArray(dataMats) ? dataMats : []);
        } catch {
          // fallback
        }
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.error || 'Credenciales incorrectas');
        return;
      }

      setToken(data.token);
      setCurrentUser(data.user);
      localStorage.setItem('artesano_admin_token', data.token);
      localStorage.setItem('artesano_admin_user', JSON.stringify(data.user));
    } catch (err) {
      setLoginError('Error al conectar con el servidor.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    setCurrentUser(null);
    localStorage.removeItem('artesano_admin_token');
    localStorage.removeItem('artesano_admin_user');
  };

  // Backups Handlers
  const loadBackups = async () => {
    try {
      const res = await fetch('/api/admin/backups', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBackupsList(data || []);
      }
    } catch (e) {
      console.error('Error al cargar respaldos:', e);
    }
  };

  const handleCreateBackup = async (label = 'manual') => {
    setBackupLoading(true);
    setBackupMsg({ text: '', type: '' });
    try {
      const res = await fetch('/api/admin/backups/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ label })
      });
      if (res.ok) {
        const data = await res.json();
        setBackupMsg({ text: `✓ Respaldo generado con éxito (${data.sizeKb} KB)`, type: 'success' });
        loadBackups();
      } else {
        setBackupMsg({ text: 'Error al generar respaldo', type: 'error' });
      }
    } catch (e) {
      setBackupMsg({ text: e.message, type: 'error' });
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestoreBackup = async (filename) => {
    if (!window.confirm(`¿Estás seguro de restaurar el respaldo "${filename}"? Los datos actuales se reemplazarán por esta copia.`)) {
      return;
    }
    setBackupLoading(true);
    setBackupMsg({ text: '', type: '' });
    try {
      const res = await fetch('/api/admin/backups/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ filename })
      });
      if (res.ok) {
        setBackupMsg({ text: '✓ Base de datos restaurada correctamente', type: 'success' });
        loadAllData();
        loadBackups();
      } else {
        const err = await res.json();
        setBackupMsg({ text: err.error || 'Error al restaurar respaldo', type: 'error' });
      }
    } catch (e) {
      setBackupMsg({ text: e.message, type: 'error' });
    } finally {
      setBackupLoading(false);
    }
  };

  // Product Actions
  const handleOpenNewProduct = (initialOpts = {}) => {
    setEditingProduct(null);
    const seq = String((products?.length || 0) + 1).padStart(3, '0');
    const isBundle = Boolean(initialOpts.isBundle || initialOpts.worlds?.includes('paquetes'));
    const initialSku = buildSku({
      area: isBundle ? 'PAQ' : 'HOG',
      technique: '3D',
      material: 'PLA',
      finish: 'MAT',
      sequence: seq
    });
    setEditorForm({
      code: initialSku,
      sku: initialSku,
      skuArea: isBundle ? 'PAQ' : 'HOG',
      skuTechnique: '3D',
      skuMaterial: 'PLA',
      skuFinish: 'MAT',
      skuSequence: seq,
      name: '',
      priceType: 'starting_at',
      price: isBundle ? 499 : 199,
      priceUnit: isBundle ? 'combo' : 'pieza',
      status: 'published',
      featured: false,
      isBundle,
      regularPrice: isBundle ? 649 : 249,
      savings: isBundle ? 150 : 50,
      includedItems: [],
      tiers: [],
      worlds: initialOpts.worlds || (isBundle ? ['paquetes'] : ['hogar']),
      categories: [],
      techniques: ['3d'],
      primaryImage: '/uploads/bandeja_vaciabolsillos_ovalada_white.jpg',
      whiteBgImage: '/uploads/bandeja_vaciabolsillos_ovalada_white.jpg',
      detailImage: '',
      measureImage: '',
      gallery: [
        '/uploads/bandeja_vaciabolsillos_ovalada_white.jpg',
        '',
        '',
        ''
      ],
      flashDealConfig: {
        enabled: false,
        durationMinutes: 120,
        discountPercent: 20
      },
      shortDescription: '',
      fullDescription: '',
      specifications: {
        dimensions: '',
        material: 'Polímero PLA / Madera / Acrílico',
        finish: 'Satinado mate',
        includes: isBundle ? 'Set coordinado de taller' : 'Pieza terminada en taller',
        minQuantity: 1,
        estimatedLeadTime: '2 a 4 días hábiles',
        careNotes: 'Limpieza con paño seco y suave.'
      },
      variants: [],
      customizationOptions: ['Grabado personalizado'],
      availability: 'in_stock',
      stockQuantity: 10,
      costPrice: isBundle ? 180 : 65,
      costBreakdown: {
        plaGrams: 60,
        tpuGrams: 0,
        otherMaterialsCost: 10,
        machineHours: 2.5,
        otherEquipCost: 0,
        manualWorkMin: 6,
        prepCost: 0,
        packagingCost: 4,
        additionalFailuresCost: 0,
        fixedOverheadCost: 0,
        shippingCost: 0,
        costStatus: 'Estimado'
      },
      privateNotes: ''
    });
    setNewIncludedItemInput('');
    setEditorActiveSlot(0);
    setEditorSkuAccordion(false);
    setEditorColorsAccordion(false);
    setEditorFlashAccordion(false);
    setEditorMessage({ text: '', type: '' });
    setIsEditorOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    if (!prod) return;
    setEditingProduct(prod);
    setEditorActiveSlot(0);
    setEditorSkuAccordion(false);
    setEditorColorsAccordion(false);
    setEditorFlashAccordion(false);
    setNewIncludedItemInput('');

    const gal = prod.gallery && prod.gallery.length > 0 ? [...prod.gallery] : [
      prod.primaryImage || '/uploads/bandeja_vaciabolsillos_ovalada_white.jpg',
      prod.whiteBgImage || '',
      prod.detailImage || '',
      prod.measureImage || ''
    ];
    while (gal.length < 4) gal.push('');

    const resolvedSku = prod.sku || suggestSkuForProduct(prod, products);
    const parsed = parseSku(resolvedSku);

    const isBundle = Boolean(
      prod.isBundle ||
      prod.category === 'paquetes' ||
      prod.code?.startsWith('PROMO') ||
      prod.code?.includes('PATCH') ||
      prod.worlds?.includes('paquetes') ||
      prod.worlds?.includes('paquetes-servicios')
    );

    const regularPrice = prod.regularPrice || (prod.price ? Math.round(prod.price * 1.25) : 0);
    const savings = prod.savings || (regularPrice && prod.price ? Math.max(0, regularPrice - prod.price) : 0);

    setEditorForm({
      ...prod,
      id: prod.id,
      name: prod.name || '',
      code: prod.code || resolvedSku,
      sku: resolvedSku,
      skuArea: prod.skuBreakdown?.area || parsed.area?.code || (isBundle ? 'PAQ' : 'HOG'),
      skuTechnique: prod.skuBreakdown?.technique || parsed.tech?.code || '3D',
      skuMaterial: prod.skuBreakdown?.material || parsed.mat?.code || 'PLA',
      skuFinish: prod.skuBreakdown?.finish || parsed.fin?.code || 'MAT',
      skuSequence: prod.skuBreakdown?.sequence || parsed.sequence || (prod.code?.match(/\d+/)?.[0]?.padStart(3, '0') || '001'),
      primaryImage: prod.primaryImage || gal[0] || '/uploads/bandeja_vaciabolsillos_ovalada_white.jpg',
      whiteBgImage: prod.whiteBgImage || gal[1] || '',
      detailImage: prod.detailImage || gal[2] || '',
      measureImage: prod.measureImage || gal[3] || '',
      gallery: gal,
      isBundle,
      regularPrice,
      savings,
      includedItems: Array.isArray(prod.includedItems) ? [...prod.includedItems] : [],
      tiers: Array.isArray(prod.tiers) ? [...prod.tiers] : [],
      price: prod.price ?? '',
      priceUnit: prod.priceUnit || (isBundle ? 'combo' : 'pieza'),
      priceType: prod.priceType || 'starting_at',
      status: prod.status || 'published',
      featured: Boolean(prod.featured),
      worlds: Array.isArray(prod.worlds) ? [...prod.worlds] : (isBundle ? ['paquetes'] : ['hogar']),
      techniques: Array.isArray(prod.techniques) ? [...prod.techniques] : ['3d'],
      categories: Array.isArray(prod.categories) ? [...prod.categories] : [],
      shortDescription: prod.shortDescription || '',
      fullDescription: prod.fullDescription || '',
      availability: prod.availability || 'made_to_order',
      stockQuantity: prod.stockQuantity ?? (prod.availability === 'in_stock' ? 10 : 0),
      costPrice: prod.costPrice ?? (prod.price ? Math.round(prod.price * 0.4) : 0),
      costBreakdown: prod.costBreakdown || {},
      flashDealConfig: prod.flashDealConfig || {
        enabled: false,
        durationMinutes: 120,
        discountPercent: 20
      },
      specifications: prod.specifications || {},
      variants: Array.isArray(prod.variants) ? [...prod.variants] : [],
      customizationOptions: Array.isArray(prod.customizationOptions) ? [...prod.customizationOptions] : []
    });
    setEditorMessage({ text: '', type: '' });
    setIsEditorOpen(true);
  };

  const handleEditProduct = handleOpenEditProduct;

  // Handlers para administración de componentes de paquetes y combos
  const handleAddIncludedItem = () => {
    if (!newIncludedItemInput.trim()) return;
    setEditorForm(prev => ({
      ...prev,
      includedItems: [...(prev.includedItems || []), newIncludedItemInput.trim()]
    }));
    setNewIncludedItemInput('');
  };

  const handleRemoveIncludedItem = (idx) => {
    setEditorForm(prev => ({
      ...prev,
      includedItems: (prev.includedItems || []).filter((_, i) => i !== idx)
    }));
  };

  const handleUpdateIncludedItem = (idx, text) => {
    setEditorForm(prev => {
      const items = [...(prev.includedItems || [])];
      items[idx] = text;
      return { ...prev, includedItems: items };
    });
  };

  // Quick 1-click toggle for Stock / Availability from table
  const handleToggleStock = async (prod, e) => {
    if (e) e.stopPropagation();
    const isCurrentlyInStock = prod.availability === 'in_stock';
    const newAvailability = isCurrentlyInStock ? 'made_to_order' : 'in_stock';
    const newStockQty = newAvailability === 'in_stock'
      ? (prod.stockQuantity && Number(prod.stockQuantity) > 0 ? Number(prod.stockQuantity) : 10)
      : 0;

    // Optimistic UI update
    setProducts(prev => prev.map(p => p.id === prod.id ? { ...p, availability: newAvailability, stockQuantity: newStockQty } : p));

    try {
      const res = await fetch(`/api/admin/products/${prod.id}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          availability: newAvailability,
          stockQuantity: newStockQty
        })
      });

      if (!res.ok) {
        await loadAllData();
      } else {
        if (onRefreshCatalog) onRefreshCatalog();
      }
    } catch (err) {
      console.error('Error toggling stock:', err);
      await loadAllData();
    }
  };

  // Quick adjustment of physical stock count (+1 / -1)
  const handleAdjustStockQuantity = async (prod, delta, e) => {
    if (e) e.stopPropagation();
    const currentQty = Number(prod.stockQuantity) || 0;
    const newQty = Math.max(0, currentQty + delta);
    const newAvailability = newQty > 0 ? 'in_stock' : 'made_to_order';

    // Optimistic UI update
    setProducts(prev => prev.map(p => p.id === prod.id ? { ...p, availability: newAvailability, stockQuantity: newQty } : p));

    try {
      await fetch(`/api/admin/products/${prod.id}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          availability: newAvailability,
          stockQuantity: newQty
        })
      });
      if (onRefreshCatalog) onRefreshCatalog();
    } catch (err) {
      console.error('Error adjusting stock qty:', err);
      await loadAllData();
    }
  };

  // Save Workshop Parameters (PLA $/kg, TPU $/kg, Electricity, Wear, Labor, Margin, Reserve)
  const handleSaveWorkshopParams = (e) => {
    if (e) e.preventDefault();
    const changes = [
      {
        icon: '🧵',
        label: 'Costo Filamento PLA',
        detail: `$${workshopParams.plaCostPerKg || 350} MXN por kg`,
        badge: 'PLA'
      },
      {
        icon: '🪡',
        label: 'Costo Filamento TPU',
        detail: `$${workshopParams.tpuCostPerKg || 550} MXN por kg`,
        badge: 'TPU'
      },
      {
        icon: '⚡',
        label: 'Tarifa Eléctrica del Taller',
        detail: `$${workshopParams.electricityKwhRate || 3.5} MXN por kWh (${workshopParams.printerKw || 0.15} kW de impresora)`
      },
      {
        icon: '⏱️',
        label: 'Mano de Obra & Desgaste',
        detail: `$${workshopParams.hourlyLaborCost || 80} MXN/h labor humana · $${workshopParams.wearRatePerHour || 1.8} MXN/h depreciación máquina`
      },
      {
        icon: '📈',
        label: 'Margen de Utilidad & Reserva',
        detail: `${workshopParams.defaultMarkupPercent || 150}% margen de utilidad deseado · ${workshopParams.failureReservePercent || 10}% reserva por fallos`
      }
    ];

    setAdminConfirmModal({
      isOpen: true,
      title: 'Confirmar Parámetros de Costo de Taller',
      subtitle: '¿Deseas aplicar estos nuevos costos y parámetros a todas las estimaciones y cálculos automáticos del taller?',
      badge: 'Costos de Taller',
      confirmText: 'Sí, Guardar Parámetros',
      changes,
      onConfirm: async () => {
        setAdminConfirmModal(prev => ({ ...prev, isOpen: false }));
        await executeSaveWorkshopParams();
      }
    });
  };

  const executeSaveWorkshopParams = async () => {
    setSavingParams(true);
    setParamsSaveMsg('');
    try {
      const res = await fetch('/api/admin/workshop-params', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(workshopParams)
      });
      if (res.ok) {
        setParamsSaveMsg('✓ Parámetros guardados y sincronizados');
        setTimeout(() => setParamsSaveMsg(''), 3000);
        await loadAllData();
      }
    } catch (err) {
      console.error('Error saving workshop params:', err);
    } finally {
      setSavingParams(false);
    }
  };

  // Inline update of product unit cost from the Margins table
  const handleUpdateProductCost = async (prod, newCost) => {
    const cost = parseFloat(newCost);
    if (isNaN(cost) || cost < 0) return;

    setProducts(prev => prev.map(p => p.id === prod.id ? { ...p, costPrice: cost } : p));

    try {
      await fetch(`/api/admin/products/${prod.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...prod,
          costPrice: cost
        })
      });
      if (onRefreshCatalog) onRefreshCatalog();
    } catch (err) {
      console.error('Error updating cost price:', err);
    }
  };

  // Inline update of product sale price from the Margins table or Products table
  const handleUpdateProductPrice = async (prod, newPrice) => {
    const price = parseFloat(newPrice);
    if (isNaN(price) || price < 0) return;

    setProducts(prev => prev.map(p => p.id === prod.id ? { ...p, price: price, priceType: 'starting_at' } : p));

    try {
      await fetch(`/api/admin/products/${prod.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...prod,
          price: price,
          priceType: 'starting_at'
        })
      });
      if (onRefreshCatalog) onRefreshCatalog();
    } catch (err) {
      console.error('Error updating sale price:', err);
    }
  };

  // Inline update of product price unit (e.g. pieza, lote, paquete, etc.)
  const handleUpdateProductUnit = async (prod, newUnit) => {
    const unit = (newUnit || '').trim();
    if (!unit) return;

    setProducts(prev => prev.map(p => p.id === prod.id ? { ...p, priceUnit: unit } : p));

    try {
      await fetch(`/api/admin/products/${prod.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...prod,
          priceUnit: unit
        })
      });
      if (onRefreshCatalog) onRefreshCatalog();
    } catch (err) {
      console.error('Error updating product unit:', err);
    }
  };

  // Open Detailed Cost Breakdown Modal for product
  const handleOpenCostBreakdown = (prod) => {
    setBreakdownModalProduct(prod);
    const cb = prod.costBreakdown || {};

    // Construcción de items iniciales de la receta estilo app móvil
    let initialRecipeItems = [];
    if (cb.recipeItems && Array.isArray(cb.recipeItems) && cb.recipeItems.length > 0) {
      initialRecipeItems = cb.recipeItems;
    } else {
      const plaKg = Number(workshopParams.plaPerKg) || 500;
      const plaGrams = Number(cb.plaGrams || (prod.techniques?.includes('3d') ? 12 : 0));
      if (plaGrams > 0) {
        initialRecipeItems.push({
          id: `rec-pla-${Date.now()}`,
          rawMaterialId: 'mat-pla-olivo',
          name: 'Pla',
          quantity: plaGrams,
          unit: 'g',
          unitCost: Math.round((plaKg / 1000) * 100) / 100,
          lineTotal: Math.round(((plaGrams * plaKg) / 1000) * 100) / 100
        });
      }
      const tpuKg = Number(workshopParams.tpuPerKg) || 700;
      const tpuGrams = Number(cb.tpuGrams || 0);
      if (tpuGrams > 0) {
        initialRecipeItems.push({
          id: `rec-tpu-${Date.now()}`,
          rawMaterialId: 'mat-tpu-negro',
          name: 'Tpu Flexible',
          quantity: tpuGrams,
          unit: 'g',
          unitCost: Math.round((tpuKg / 1000) * 100) / 100,
          lineTotal: Math.round(((tpuGrams * tpuKg) / 1000) * 100) / 100
        });
      }
      const otherCost = Number(cb.otherMaterialsCost || 0);
      if (otherCost > 0) {
        initialRecipeItems.push({
          id: `rec-other-${Date.now()}`,
          name: 'Insumo Directo / Base',
          quantity: 1,
          unit: 'pza',
          unitCost: otherCost,
          lineTotal: otherCost
        });
      }
      const packagingCost = Number(cb.packagingCost || 0);
      if (packagingCost > 0) {
        initialRecipeItems.push({
          id: `rec-pack-${Date.now()}`,
          name: 'Empaque & Embalaje',
          quantity: 1,
          unit: 'pza',
          unitCost: packagingCost,
          lineTotal: packagingCost
        });
      }
    }

    setBreakdownForm({
      salePrice: prod.price ?? (prod.priceType === 'quote' ? 0 : 199),
      recipeName: cb.recipeName || prod.name || 'Impresión 3d',
      recipeItems: initialRecipeItems,
      yieldUnits: Number(cb.yieldUnits) || 1,
      overheadPercent: cb.overheadPercent !== undefined ? Number(cb.overheadPercent) : 50,
      targetProfitPercent: cb.targetProfitPercent !== undefined ? Number(cb.targetProfitPercent) : 200,
      recipeNotes: cb.recipeNotes || '',
      plaGrams: cb.plaGrams || 0,
      tpuGrams: cb.tpuGrams || 0,
      otherMaterialsCost: cb.otherMaterialsCost ?? (prod.techniques?.includes('3d') ? 0 : prod.costPrice || 0),
      machineHours: cb.machineHours || 0,
      otherEquipCost: cb.otherEquipCost || 0,
      manualWorkMin: cb.manualWorkMin || 0,
      prepCost: cb.prepCost || 0,
      packagingCost: cb.packagingCost || 0,
      additionalFailuresCost: cb.additionalFailuresCost || 0,
      fixedOverheadCost: cb.fixedOverheadCost || 0,
      shippingCost: cb.shippingCost || 0,
      costStatus: cb.costStatus || 'Verificado'
    });
    setShowAddQuantityModal(false);
  };

  // Helper para añadir item de materia prima a la receta
  const handleAddRecipeItemFromModal = (e) => {
    if (e) e.preventDefault();
    if (!breakdownForm) return;

    let newItem = null;
    if (recipeSelectedMatId) {
      const mat = rawMaterialsList.find(m => m.id === recipeSelectedMatId);
      if (mat) {
        const pkgInfo = parsePackageInfo(mat);
        const pkgCost = Number(mat.costPerUnit || mat.packageCost || 0);
        const pkgQty = Number(pkgInfo.packageQuantity) || 1;
        const pkgUnit = (pkgInfo.packageMeasurement || 'pza').toLowerCase().trim();
        const reqUnit = (recipeNewMatUnit || pkgUnit).toLowerCase().trim();
        const numQty = Number(recipeNewMatQty) || 0;

        let unitCost = pkgCost / pkgQty;
        if ((reqUnit === 'g' || reqUnit === 'gr') && (pkgUnit === 'kg' || pkgUnit === 'kilo')) {
          unitCost = pkgCost / (pkgQty * 1000);
        } else if ((reqUnit === 'kg' || reqUnit === 'kilo') && (pkgUnit === 'g' || pkgUnit === 'gr')) {
          unitCost = (pkgCost / pkgQty) * 1000;
        } else if ((reqUnit === 'ml' || reqUnit === 'mililitro') && (pkgUnit === 'l' || pkgUnit === 'litro')) {
          unitCost = pkgCost / (pkgQty * 1000);
        } else if ((reqUnit === 'l' || reqUnit === 'litro') && (pkgUnit === 'ml' || pkgUnit === 'mililitro')) {
          unitCost = (pkgCost / pkgQty) * 1000;
        }

        const lineTotal = Math.round(numQty * unitCost * 100) / 100;
        newItem = {
          id: `rec-item-${Date.now()}-${Math.round(Math.random() * 1000)}`,
          rawMaterialId: mat.id,
          name: mat.name,
          quantity: numQty,
          unit: recipeNewMatUnit,
          unitCost: Math.round(unitCost * 100) / 100,
          lineTotal
        };
      }
    } else if (recipeCustomMatName.trim()) {
      const numQty = Number(recipeNewMatQty) || 0;
      const numUnitCost = Number(recipeCustomUnitCost) || 0;
      const lineTotal = Math.round(numQty * numUnitCost * 100) / 100;
      newItem = {
        id: `rec-item-${Date.now()}-${Math.round(Math.random() * 1000)}`,
        name: recipeCustomMatName.trim(),
        quantity: numQty,
        unit: recipeNewMatUnit,
        unitCost: numUnitCost,
        lineTotal
      };
    }

    if (newItem) {
      setBreakdownForm(prev => ({
        ...prev,
        recipeItems: [...(prev.recipeItems || []), newItem]
      }));
      setShowAddQuantityModal(false);
      setRecipeSelectedMatId('');
      setRecipeCustomMatName('');
    }
  };

  const handleRemoveRecipeItem = (itemId) => {
    setBreakdownForm(prev => ({
      ...prev,
      recipeItems: (prev.recipeItems || []).filter(i => i.id !== itemId)
    }));
  };

  // Save Cost Breakdown from modal and apply to product
  const handleSaveCostBreakdown = async () => {
    if (!breakdownModalProduct || !breakdownForm) return;

    const plaKg = Number(workshopParams.plaPerKg) || 500;
    const tpuKg = Number(workshopParams.tpuPerKg) || 700;
    const filamentWaste = (Number(workshopParams.filamentWastePercent) || 15) / 100;
    const electHour = Number(workshopParams.electricityPerHour) || 1.04;
    const wearHour = Number(workshopParams.wearPerHour) || 3.00;
    const laborHour = Number(workshopParams.laborPerHour) || 60;

    const recipeItems = Array.isArray(breakdownForm.recipeItems) ? breakdownForm.recipeItems : [];
    const recipeRawMaterialsCost = recipeItems.reduce((acc, it) => acc + (Number(it.lineTotal) || 0), 0);
    const yieldUnits = Math.max(1, Number(breakdownForm.yieldUnits) || 1);
    const rawMaterialsPerUnit = recipeRawMaterialsCost / yieldUnits;
    const overheadPercent = breakdownForm.overheadPercent !== undefined ? Number(breakdownForm.overheadPercent) : 50;
    const overheadCostPerUnit = rawMaterialsPerUnit * (overheadPercent / 100);
    const recipeTotalUnitCost = Math.round((rawMaterialsPerUnit + overheadCostPerUnit) * 10) / 10;
    const targetProfitPercent = breakdownForm.targetProfitPercent !== undefined ? Number(breakdownForm.targetProfitPercent) : 200;
    const recipeSuggestedPrice = Math.round(recipeTotalUnitCost * (1 + targetProfitPercent / 100));

    // Desglose clásico para compatibilidad y fallback
    const filamentCost = ((Number(breakdownForm.plaGrams || 0) * plaKg) + (Number(breakdownForm.tpuGrams || 0) * tpuKg)) / 1000 * (1 + filamentWaste);
    const energyWearCost = Number(breakdownForm.machineHours || 0) * (electHour + wearHour);
    const laborCost = (Number(breakdownForm.manualWorkMin || 0) / 60) * laborHour;
    const otherCosts = Number(breakdownForm.otherMaterialsCost || 0) + Number(breakdownForm.otherEquipCost || 0) + Number(breakdownForm.prepCost || 0) + Number(breakdownForm.packagingCost || 0) + Number(breakdownForm.additionalFailuresCost || 0) + Number(breakdownForm.fixedOverheadCost || 0) + Number(breakdownForm.shippingCost || 0);
    const classicTotal = Math.round((filamentCost + energyWearCost + laborCost + otherCosts) * 10) / 10;

    // Si tiene items de receta usamos el costo calculado por receta
    const totalCalculated = recipeItems.length > 0 ? recipeTotalUnitCost : classicTotal;

    const updatedPrice = breakdownForm.salePrice !== undefined && breakdownForm.salePrice !== '' && !isNaN(Number(breakdownForm.salePrice))
      ? Number(breakdownForm.salePrice)
      : (recipeSuggestedPrice > 0 ? recipeSuggestedPrice : breakdownModalProduct.price);

    const costBreakdownPayload = {
      ...breakdownForm,
      recipeName: breakdownForm.recipeName || breakdownModalProduct.name || 'Impresión 3d',
      recipeItems,
      yieldUnits,
      overheadPercent,
      targetProfitPercent,
      recipeNotes: breakdownForm.recipeNotes || '',
      rawMaterialsCost: Math.round(rawMaterialsPerUnit * 100) / 100,
      overheadCost: Math.round(overheadCostPerUnit * 100) / 100,
      recipeTotalUnitCost,
      recipeSuggestedPrice,
      costStatus: breakdownForm.costStatus || 'Verificado'
    };

    try {
      if (isEditorOpen) {
        setEditorForm(prev => ({
          ...prev,
          costPrice: totalCalculated,
          price: updatedPrice,
          costBreakdown: costBreakdownPayload
        }));
      }

      if (breakdownModalProduct.id) {
        const res = await fetch(`/api/admin/products/${breakdownModalProduct.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            ...breakdownModalProduct,
            costPrice: totalCalculated,
            price: updatedPrice,
            priceType: updatedPrice > 0 ? 'starting_at' : breakdownModalProduct.priceType,
            costBreakdown: costBreakdownPayload
          })
        });
        if (res.ok) {
          await loadAllData();
          if (onRefreshCatalog) onRefreshCatalog();
        }
      }
      setBreakdownModalProduct(null);
    } catch (err) {
      console.error('Error saving cost breakdown:', err);
    }
  };

  // Quick 1-click toggle for Flash Deal from table
  const handleToggleProductFlash = async (prod, e) => {
    if (e) e.stopPropagation();
    try {
      const currentConfig = prod.flashDealConfig || { enabled: false, durationMinutes: 120, discountPercent: 20 };
      const newEnabled = !currentConfig.enabled;
      const updatedConfig = {
        ...currentConfig,
        enabled: newEnabled,
        startedAt: newEnabled ? Date.now() : null,
        expiresAt: newEnabled ? Date.now() + (currentConfig.durationMinutes || 120) * 60 * 1000 : null
      };

      const res = await fetch(`/api/admin/products/${prod.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...prod,
          flashDealConfig: updatedConfig
        })
      });

      if (res.ok) {
        await loadAllData();
        if (onRefreshCatalog) onRefreshCatalog();
      }
    } catch (err) {
      console.error('Error toggling flash deal:', err);
    }
  };

  // Change flash deal duration and settings directly
  const handleSetFlashDuration = async (prod, durationMinutes, discountPercent = 20) => {
    try {
      const currentConfig = prod.flashDealConfig || {};
      const updatedConfig = {
        ...currentConfig,
        enabled: true,
        durationMinutes,
        discountPercent,
        startedAt: Date.now(),
        expiresAt: Date.now() + durationMinutes * 60 * 1000
      };

      const res = await fetch(`/api/admin/products/${prod.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...prod,
          flashDealConfig: updatedConfig
        })
      });

      if (res.ok) {
        await loadAllData();
        if (onRefreshCatalog) onRefreshCatalog();
      }
    } catch (err) {
      console.error('Error updating flash deal duration:', err);
    }
  };

  // Live active flash deals (combining manual enabled products and hook cyclical deals)
  const activeFlashList = useMemo(() => {
    const list = [];
    const seenIds = new Set();

    // 1. Manual flash deals from admin products state
    products.forEach(p => {
      if (p.flashDealConfig?.enabled) {
        seenIds.add(p.id);
        const timerInfo = flashDeal?.getTimeForProduct ? flashDeal.getTimeForProduct(p.id) : null;
        list.push({
          product: p,
          isManual: true,
          durationMinutes: p.flashDealConfig.durationMinutes || 120,
          discountPercent: p.flashDealConfig.discountPercent || 20,
          timerInfo
        });
      }
    });

    // 2. Cyclical active flash deals from flashDeal engine
    if (flashDeal?.activeFlashProducts) {
      flashDeal.activeFlashProducts.forEach(p => {
        if (!seenIds.has(p.id)) {
          seenIds.add(p.id);
          const timerInfo = flashDeal?.getTimeForProduct ? flashDeal.getTimeForProduct(p.id) : null;
          list.push({
            product: p,
            isManual: false,
            durationMinutes: timerInfo?.cycleDuration ? Math.round(timerInfo.cycleDuration / 60) : 120,
            discountPercent: timerInfo?.discountPercent || 20,
            timerInfo
          });
        }
      });
    }

    return list;
  }, [products, flashDeal]);

  // Service status & workshop availability
  const activeServiceStatus = useMemo(() => {
    return businessSettings?.serviceStatus || DEFAULT_SERVICE_STATUS;
  }, [businessSettings]);

  const serviceSummary = useMemo(() => {
    return getServiceStatusSummary(activeServiceStatus);
  }, [activeServiceStatus]);

  // Area flash limits statistics based on strict user rules
  const areaLimitsStats = useMemo(() => {
    const hogarProds = products.filter(p => p.status === 'published' && !p.isBundle && p.worlds?.includes('hogar'));
    const negociosProds = products.filter(p => p.status === 'published' && !p.isBundle && p.worlds?.includes('negocios'));
    const eventosProds = products.filter(p => p.status === 'published' && !p.isBundle && p.worlds?.includes('eventos'));
    const paquetesProds = products.filter(p => p.status === 'published' && (p.isBundle || p.category === 'paquetes' || p.category === 'servicios' || p.code?.startsWith('PROMO') || p.code?.includes('PATCH') || p.worlds?.includes('paquetes')));

    const hogarActive = activeFlashList.filter(item => item.product.worlds?.includes('hogar')).length;
    const negociosActive = activeFlashList.filter(item => item.product.worlds?.includes('negocios')).length;
    const eventosActive = activeFlashList.filter(item => item.product.worlds?.includes('eventos')).length;
    const paquetesActive = activeFlashList.filter(item => {
      const p = item.product;
      return p.isBundle || p.category === 'paquetes' || p.category === 'servicios' || p.code?.startsWith('PROMO') || p.code?.includes('PATCH') || p.worlds?.includes('paquetes');
    }).length;

    // Hogar: Solo entre 2 y 3 oferta flash activa cada 13 productos
    const hogarTarget = Math.min(hogarProds.length, Math.max(2, Math.round(hogarProds.length * (2.5 / 13))));
    // Negocios: Solo 2 y 3 oferta flash activa cada 10 productos
    const negociosTarget = Math.min(negociosProds.length, Math.max(2, Math.round(negociosProds.length * (2.5 / 10))));
    // Eventos Especiales: Máximo 4 a 5 ofertas flash activas cada 13 productos
    const eventosTarget = Math.min(5, Math.max(4, Math.round(eventosProds.length * (4.5 / 13))));
    // Paquetes & Servicios: 1 a 2 ofertas promocionales activas
    const paquetesTarget = Math.min(3, Math.max(1, Math.round(paquetesProds.length * (2 / 10))));

    return {
      hogar: {
        id: 'hogar',
        name: 'Hogar & Decoración',
        icon: '🏠',
        rule: 'Solo entre 2 y 3 oferta flash activa cada 13 productos',
        shortRule: '2 a 3 por cada 13 productos',
        total: hogarProds.length,
        active: hogarActive,
        target: hogarTarget
      },
      negocios: {
        id: 'negocios',
        name: 'Negocios & Marca',
        icon: '💼',
        rule: 'Solo 2 y 3 oferta flash activa cada 10 productos',
        shortRule: '2 a 3 por cada 10 productos',
        total: negociosProds.length,
        active: negociosActive,
        target: negociosTarget
      },
      eventos: {
        id: 'eventos',
        name: 'Eventos Especiales',
        icon: '🎉',
        rule: 'Máximo 4 a 5 ofertas flash activas cada 13 productos',
        shortRule: 'Máximo 4 a 5 por cada 13 productos',
        total: eventosProds.length,
        active: eventosActive,
        target: eventosTarget
      },
      paquetes: {
        id: 'paquetes',
        name: 'Paquetes & Servicios',
        icon: '🎁',
        rule: 'Combos y paquetes con oferta blitz activa',
        shortRule: '1 a 2 paquetes en oferta flash',
        total: paquetesProds.length,
        active: paquetesActive,
        target: paquetesTarget
      }
    };
  }, [products, activeFlashList]);

  const handleDuplicateProduct = async (id) => {
    try {
      const res = await fetch(`/api/admin/products/${id}/duplicate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        await loadAllData();
        if (onRefreshCatalog) onRefreshCatalog();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este producto del catálogo?')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        await loadAllData();
        if (onRefreshCatalog) onRefreshCatalog();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Upload handler for specific image slot ('portada' | 'blanco' | 'detalle' | 'escala' | number | 'extra')
  const handleUploadSlot = async (slotKey, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(slotKey);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setEditorForm(prev => {
          const updated = { ...prev };
          const gal = [...(prev.gallery || [])];
          while (gal.length < 4) gal.push('');

          if (slotKey === 'portada') {
            updated.primaryImage = data.url;
            gal[0] = data.url;
          } else if (slotKey === 'blanco') {
            updated.whiteBgImage = data.url;
            gal[1] = data.url;
          } else if (slotKey === 'detalle') {
            updated.detailImage = data.url;
            gal[2] = data.url;
          } else if (slotKey === 'escala') {
            updated.measureImage = data.url;
            gal[3] = data.url;
          } else if (typeof slotKey === 'number') {
            gal[slotKey] = data.url;
          } else if (slotKey === 'extra') {
            gal.push(data.url);
          }

          updated.gallery = gal;
          return updated;
        });
      } else {
        alert(data.error || 'Error al subir imagen');
      }
    } catch (err) {
      console.error(err);
      alert('Error al conectar para subir archivo.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUpdateSlotUrl = (slotKey, newUrl) => {
    setEditorForm(prev => {
      const updated = { ...prev };
      const gal = [...(prev.gallery || [])];
      while (gal.length < 4) gal.push('');

      if (slotKey === 'portada') {
        updated.primaryImage = newUrl;
        gal[0] = newUrl;
      } else if (slotKey === 'blanco') {
        updated.whiteBgImage = newUrl;
        gal[1] = newUrl;
      } else if (slotKey === 'detalle') {
        updated.detailImage = newUrl;
        gal[2] = newUrl;
      } else if (slotKey === 'escala') {
        updated.measureImage = newUrl;
        gal[3] = newUrl;
      } else if (typeof slotKey === 'number') {
        gal[slotKey] = newUrl;
      }

      updated.gallery = gal;
      return updated;
    });
  };

  const handleRemoveExtraImage = (index) => {
    setEditorForm(prev => {
      const gal = [...(prev.gallery || [])];
      gal.splice(index, 1);
      return {
        ...prev,
        gallery: gal
      };
    });
  };

  const handleAddExtraImage = () => {
    setEditorForm(prev => {
      const gal = [...(prev.gallery || [])];
      while (gal.length < 4) gal.push('');
      gal.push('/uploads/img_002.jpg');
      return {
        ...prev,
        gallery: gal
      };
    });
  };

  // Material and Color customization helpers
  const WORKSHOP_MATERIALS = [
    'PLA Biodegradable (Impresión 3D)',
    'PETG / TPU Flexible (Impresión 3D)',
    'Madera Natural / Triplay / MDF (Corte Láser)',
    'Acrílico Óptico (Cristalino / Negro / Humo)',
    'Cuero y Curpiel Genuino',
    'Vinil Adhesivo Permanente (Cameo)',
    'Vinil Textil Térmico (Cameo)',
    'Papel y Cartulina Especial',
    'A convenir / Especial'
  ];

  const STANDARD_PALETTE_COLORS = [
    'Blanco Marfil / Ártico',
    'Negro Carbón / Grafito',
    'Verde Olivo / Bosque',
    'Terracota / Ladrillo',
    'Arena / Crema / Beige',
    'Gris Espacial / Perla',
    'Dorado / Cobre Seda',
    'Textura Madera PLA',
    'Azul Cobalto',
    'Amarillo Mostaza',
    'Rojo Escarlata',
    'Rosa Pastel',
    '🎨 Otro color a elegir (A convenir)'
  ];

  const handleToggleMaterial = (mat) => {
    setEditorForm(prev => {
      const current = prev.specifications?.material || '';
      let parts = current.split('/').map(s => s.trim()).filter(Boolean);
      const key = mat.split(' ')[0].toLowerCase();
      const exists = parts.some(p => p.toLowerCase().includes(key));
      if (exists) {
        parts = parts.filter(p => !p.toLowerCase().includes(key));
      } else {
        parts.push(mat);
      }
      return {
        ...prev,
        specifications: {
          ...(prev.specifications || {}),
          material: parts.join(' / ')
        }
      };
    });
  };

  const getColorVariant = () => {
    if (!editorForm?.variants) return null;
    return editorForm.variants.find(v => 
      v?.name?.toLowerCase().includes('color') ||
      v?.name?.toLowerCase().includes('estructura') ||
      v?.name?.toLowerCase().includes('marco') ||
      v?.name?.toLowerCase().includes('base') ||
      v?.name?.toLowerCase().includes('acento')
    ) || null;
  };

  const handleToggleColorOption = (colorName) => {
    setEditorForm(prev => {
      const variants = [...(prev.variants || [])];
      let colorVar = variants.find(v => 
        v?.name?.toLowerCase().includes('color') ||
        v?.name?.toLowerCase().includes('estructura') ||
        v?.name?.toLowerCase().includes('marco') ||
        v?.name?.toLowerCase().includes('base') ||
        v?.name?.toLowerCase().includes('acento')
      );

      if (!colorVar) {
        colorVar = { name: 'Color', options: [] };
        variants.push(colorVar);
      }

      const options = [...(colorVar.options || [])];
      const idx = options.findIndex(opt => opt.toLowerCase() === colorName.toLowerCase());
      if (idx >= 0) {
        options.splice(idx, 1);
      } else {
        options.push(colorName);
      }
      colorVar.options = options;

      return {
        ...prev,
        variants
      };
    });
  };

  const handleAddCustomColor = (color) => {
    const trimmed = (color || '').trim();
    if (!trimmed) return;
    handleToggleColorOption(trimmed);
    setCustomColorInput('');
  };

  const handleRemoveColorOption = (colorName) => {
    setEditorForm(prev => {
      const variants = [...(prev.variants || [])];
      const colorVar = variants.find(v => 
        v?.name?.toLowerCase().includes('color') ||
        v?.name?.toLowerCase().includes('estructura') ||
        v?.name?.toLowerCase().includes('marco') ||
        v?.name?.toLowerCase().includes('base') ||
        v?.name?.toLowerCase().includes('acento')
      );
      if (colorVar) {
        colorVar.options = (colorVar.options || []).filter(opt => opt !== colorName);
      }
      return { ...prev, variants };
    });
  };

  // Save Product
  const handleSaveProduct = async (e) => {
    if (e) e.preventDefault();

    if (!editorForm?.name || !editorForm.name.trim()) {
      setEditorMessage({ text: 'Por favor ingresa el nombre del producto o paquete.', type: 'error' });
      return;
    }

    setEditorMessage({ text: 'Guardando...', type: 'info' });

    try {
      const isEdit = !!editingProduct;
      const url = isEdit ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
      const method = isEdit ? 'PUT' : 'POST';

      const payload = { ...editorForm };

      // Limpiar includedItems si es paquete
      if (payload.isBundle && Array.isArray(payload.includedItems)) {
        payload.includedItems = payload.includedItems.filter(item => typeof item === 'string' && item.trim().length > 0);
      }
      
      // Sincronizar SKU estructurado y ficha técnica de taller para personal interno
      const finalSku = payload.sku || payload.code || (isEdit ? editingProduct.code : 'HOG-3D-PLA-MAT-001');
      const parsed = parseSku(finalSku);
      payload.sku = finalSku;
      payload.code = payload.code || finalSku;
      payload.skuBreakdown = {
        standardSku: finalSku,
        legacyCode: payload.code,
        area: editorForm.skuArea || parsed.area?.code || (payload.isBundle ? 'PAQ' : 'HOG'),
        technique: editorForm.skuTechnique || parsed.tech?.code || '3D',
        material: editorForm.skuMaterial || parsed.mat?.code || 'PLA',
        finish: editorForm.skuFinish || parsed.fin?.code || 'MAT',
        sequence: editorForm.skuSequence || parsed.sequence || '001',
        instructionsForStaff: parsed.explanation
      };

      // Sync gallery slots
      const gal = [...(payload.gallery || [])];
      while (gal.length < 4) gal.push('');
      if (payload.primaryImage) gal[0] = payload.primaryImage;
      if (payload.whiteBgImage) gal[1] = payload.whiteBgImage;
      if (payload.detailImage) gal[2] = payload.detailImage;
      if (payload.measureImage) gal[3] = payload.measureImage;
      payload.gallery = gal;

      // Sync flash deal config timestamp if enabled
      if (payload.flashDealConfig?.enabled) {
        payload.flashDealConfig.startedAt = payload.flashDealConfig.startedAt || Date.now();
        payload.flashDealConfig.expiresAt = Date.now() + (payload.flashDealConfig.durationMinutes || 120) * 60 * 1000;
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.status === 401) {
        setEditorMessage({ text: 'Tu sesión expiró. Por favor cierra sesión y vuelve a ingresar.', type: 'error' });
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setEditorMessage({ text: data.error || 'Error al guardar cambios', type: 'error' });
        return;
      }

      setEditorMessage({ text: '¡Cambios guardados y sincronizados exitosamente!', type: 'success' });
      await loadAllData();
      if (onRefreshCatalog) onRefreshCatalog();
      setTimeout(() => setIsEditorOpen(false), 800);
    } catch (err) {
      console.error('Error saving product:', err);
      setEditorMessage({ text: 'Error de conexión con el servidor de taller', type: 'error' });
    }
  };

  // Save Business Settings
  const handleSaveSettings = (e) => {
    e.preventDefault();
    const changes = [
      {
        icon: '🏢',
        label: 'Datos de la Tienda y Contacto',
        detail: `Nombre: "${businessSettings?.businessName || 'Artesano Digital'}" · WhatsApp: ${businessSettings?.whatsappNumber || 'Sin configurar'}`
      },
      {
        icon: '📍',
        label: 'Ubicación y Entregas',
        detail: `${businessSettings?.address || 'Dirección de taller registrada'}`
      },
      {
        icon: '🚚',
        label: 'Tarifas de Envío',
        detail: `Local: $${businessSettings?.shipping?.localPrice || 0} MXN · Nacional: $${businessSettings?.shipping?.nationalPrice || 0} MXN · Envío gratis desde: $${businessSettings?.shipping?.freeShippingMinOrder || 0} MXN`
      }
    ];

    setAdminConfirmModal({
      isOpen: true,
      title: 'Confirmar Ajustes del Negocio',
      subtitle: '¿Deseas guardar las modificaciones en la información de contacto y envíos de la tienda?',
      badge: 'Ajustes Tienda',
      confirmText: 'Sí, Guardar Ajustes',
      changes,
      onConfirm: async () => {
        setAdminConfirmModal(prev => ({ ...prev, isOpen: false }));
        await executeSaveSettings();
      }
    });
  };

  const executeSaveSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(businessSettings)
      });
      if (res.ok) {
        setServiceStatusMsg({ text: 'Configuración guardada exitosamente.', type: 'success' });
        setTimeout(() => setServiceStatusMsg({ text: '', type: '' }), 4000);
        if (onRefreshCatalog) onRefreshCatalog();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update Service Status (Local, National, Paused until date)
  const handleUpdateServiceStatus = async (partialStatus) => {
    const current = businessSettings?.serviceStatus || DEFAULT_SERVICE_STATUS;
    const updatedServiceStatus = { ...current, ...partialStatus };
    const updatedSettings = {
      ...businessSettings,
      serviceStatus: updatedServiceStatus
    };
    setBusinessSettings(updatedSettings);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedSettings)
      });
      if (res.ok) {
        setServiceStatusMsg({ text: 'Disponibilidad y estado de servicio actualizados', type: 'success' });
        setTimeout(() => setServiceStatusMsg({ text: '', type: '' }), 4000);
        if (onRefreshCatalog) onRefreshCatalog();
      } else {
        setServiceStatusMsg({ text: 'Error al guardar en el servidor', type: 'error' });
      }
    } catch (err) {
      console.error('Error updating service status:', err);
      setServiceStatusMsg({ text: 'Error al conectar con el servidor', type: 'error' });
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ text: '', type: '' });
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(passwordForm)
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordMsg({ text: 'Contraseña cambiada con éxito.', type: 'success' });
        setPasswordForm({ currentPassword: '', newPassword: '' });
      } else {
        setPasswordMsg({ text: data.error || 'Error al cambiar contraseña', type: 'error' });
      }
    } catch (err) {
      setPasswordMsg({ text: 'Error de servidor', type: 'error' });
    }
  };

  // Toggle Category Hidden
  const handleToggleCategory = async (cat) => {
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isHidden: !cat.isHidden })
      });
      if (res.ok) {
        await loadAllData();
        if (onRefreshCatalog) onRefreshCatalog();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Real-time stock counts grouped by Area (Hogar, Negocios, Eventos, Paquetes, Todas)
  const stockAreaStats = useMemo(() => {
    const getStats = (wKey) => {
      const list = wKey === 'all'
        ? products
        : wKey === 'paquetes'
          ? products.filter(p => p.isBundle || p.category === 'paquetes' || p.category === 'servicios' || p.code?.startsWith('PROMO') || p.code?.includes('PATCH') || p.worlds?.includes('paquetes') || p.worlds?.includes('paquetes-servicios'))
          : products.filter(p => p.worlds && p.worlds.includes(wKey));

      const inStock = list.filter(p => p.availability === 'in_stock');
      const madeToOrder = list.filter(p => p.availability === 'made_to_order' || !p.availability);
      const outOfStock = list.filter(p => p.availability === 'out_of_stock');
      const totalUnits = inStock.reduce((acc, p) => acc + (Number(p.stockQuantity) || 0), 0);

      return {
        total: list.length,
        inStock: inStock.length,
        madeToOrder: madeToOrder.length,
        outOfStock: outOfStock.length,
        totalUnits
      };
    };

    return {
      all: getStats('all'),
      hogar: getStats('hogar'),
      negocios: getStats('negocios'),
      eventos: getStats('eventos'),
      paquetes: getStats('paquetes')
    };
  }, [products]);

  // Financial analysis (Excel Sheet 1 & Sheet 2 formulas)
  const marginsStats = useMemo(() => {
    const targetMargin = (Number(workshopParams.targetMarginPercent) || 40) / 100;
    const reservePct = (Number(workshopParams.reservePercent) || 10) / 100;

    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    let totalReserve = 0;
    let itemsCounted = 0;
    let optimalCount = 0;
    let lowMarginCount = 0;
    let lossCount = 0;
    let missingCostCount = 0;
    let quoteCount = 0;

    const rows = products.map(p => {
      const price = Number(p.price) || 0;
      const isQuote = p.priceType === 'quote' || price === 0;
      const hasCost = p.costPrice !== undefined && p.costPrice !== null && p.costPrice !== '';
      const cost = hasCost ? Number(p.costPrice) : 0;
      const commission = 0; // Venta directa por defecto
      const fixedFee = 0;

      let profit = 0;
      let margin = 0;
      let markup = 0;
      let maxCost = 0;
      let targetPrice = 0;
      let reserve = 0;
      let available = 0;
      let statusLabel = '';
      let statusColor = '';

      if (isQuote) {
        statusLabel = 'A cotizar';
        statusColor = 'gray';
        quoteCount++;
      } else if (!hasCost) {
        statusLabel = 'Faltan costos';
        statusColor = 'blue';
        missingCostCount++;
        maxCost = Math.round(price * (1 - targetMargin) * 10) / 10;
      } else {
        profit = Math.round((price * (1 - commission) - fixedFee - cost) * 10) / 10;
        margin = price > 0 ? (profit / price) : 0;
        markup = cost > 0 ? (profit / cost) : 0;
        maxCost = Math.round((price * (1 - commission - targetMargin) - fixedFee) * 10) / 10;
        targetPrice = (1 - commission - targetMargin) > 0 
          ? Math.round(((cost + fixedFee) / (1 - commission - targetMargin)) * 10) / 10 
          : 0;
        reserve = profit > 0 ? Math.round((profit * reservePct) * 10) / 10 : 0;
        available = Math.round((profit - reserve) * 10) / 10;

        totalRevenue += price;
        totalCost += cost;
        totalProfit += profit;
        totalReserve += reserve;
        itemsCounted++;

        if (profit < 0) {
          statusLabel = 'En pérdida';
          statusColor = 'rose';
          lossCount++;
        } else if (margin < targetMargin) {
          statusLabel = 'Bajo objetivo (<40%)';
          statusColor = 'amber';
          lowMarginCount++;
        } else {
          statusLabel = 'Margen óptimo (≥40%)';
          statusColor = 'emerald';
          optimalCount++;
        }
      }

      return {
        product: p,
        price,
        isQuote,
        cost,
        hasCost,
        commission,
        fixedFee,
        profit,
        marginPct: Math.round(margin * 1000) / 10,
        markupPct: Math.round(markup * 1000) / 10,
        maxCost,
        targetPrice,
        reserve,
        available,
        statusLabel,
        statusColor
      };
    });

    const avgMargin = itemsCounted > 0 && totalRevenue > 0 
      ? Math.round((totalProfit / totalRevenue) * 1000) / 10 
      : 0;

    return {
      rows,
      totalRevenue: Math.round(totalRevenue * 10) / 10,
      totalCost: Math.round(totalCost * 10) / 10,
      totalProfit: Math.round(totalProfit * 10) / 10,
      totalReserve: Math.round(totalReserve * 10) / 10,
      totalAvailable: Math.round((totalProfit - totalReserve) * 10) / 10,
      avgMargin,
      optimalCount,
      lowMarginCount,
      lossCount,
      missingCostCount,
      quoteCount
    };
  }, [products, workshopParams]);

  // Technique List & Definitions for Filtering and Audits
  const techniqueList = [
    { id: 'all', label: 'Todas las Técnicas', shortLabel: 'Todas', icon: '⚡' },
    { id: '3d', label: 'Impresión 3D', shortLabel: '3D (PLA/TPU)', icon: '🖨️' },
    { id: 'laser', label: 'Corte & Grabado Láser', shortLabel: 'Láser', icon: '🔥' },
    { id: 'sublimation', label: 'Sublimación', shortLabel: 'Sublimación', icon: '🎨' },
    { id: 'vinyl', label: 'Corte de Vinil', shortLabel: 'Vinil', icon: '✂️' },
    { id: 'nfc', label: 'Enlace NFC / Smart', shortLabel: 'NFC', icon: '📡' }
  ];

  // Helper: Match product with selected technique
  const checkProductMatchesTechnique = (p, tech) => {
    if (!tech || tech === 'all') return true;
    const list = p?.techniques || [];
    if (tech === '3d') return list.includes('3d');
    if (tech === 'laser') return list.includes('laser');
    if (tech === 'sublimation') return list.includes('sublimation') || list.includes('sublimacion');
    if (tech === 'vinyl') return list.includes('vinyl') || list.includes('vinil');
    if (tech === 'nfc') return list.includes('nfc');
    return list.includes(tech);
  };

  // Real-time product counts by technique
  const techniqueCounts = useMemo(() => {
    const counts = { all: products.length, '3d': 0, laser: 0, sublimation: 0, vinyl: 0, nfc: 0 };
    products.forEach(p => {
      const t = p.techniques || [];
      if (t.includes('3d')) counts['3d']++;
      if (t.includes('laser')) counts.laser++;
      if (t.includes('sublimation') || t.includes('sublimacion')) counts.sublimation++;
      if (t.includes('vinyl') || t.includes('vinil')) counts.vinyl++;
      if (t.includes('nfc')) counts.nfc++;
    });
    return counts;
  }, [products]);

  // Filtered Products for Table
  const filteredProducts = products.filter(p => {
    if (filterWorld === 'paquetes') {
      const isBundleOrService = p.isBundle || p.category === 'paquetes' || p.category === 'servicios' || p.code?.startsWith('PROMO') || p.code?.includes('PATCH') || p.worlds?.includes('paquetes') || p.worlds?.includes('paquetes-servicios');
      if (!isBundleOrService) return false;
    } else if (filterWorld !== 'all' && (!p.worlds || !p.worlds.includes(filterWorld))) {
      return false;
    }
    if (filterTechnique !== 'all' && !checkProductMatchesTechnique(p, filterTechnique)) {
      return false;
    }
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (filterStock === 'in_stock' && p.availability !== 'in_stock') return false;
    if (filterStock === 'made_to_order' && p.availability === 'in_stock') return false;
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      const matchName = p.name?.toLowerCase().includes(q);
      const matchCode = p.code?.toLowerCase().includes(q);
      const matchSku = p.sku?.toLowerCase().includes(q);
      return matchName || matchCode || matchSku;
    }
    return true;
  });

  // Filtered Margins Rows for Margins Tab
  const filteredMarginsRows = useMemo(() => {
    return marginsStats.rows.filter(item => {
      const p = item.product;
      if (marginsWorld === 'paquetes') {
        const isBundleOrService = p.isBundle || p.category === 'paquetes' || p.category === 'servicios' || p.code?.startsWith('PROMO') || p.code?.includes('PATCH') || p.worlds?.includes('paquetes') || p.worlds?.includes('paquetes-servicios');
        if (!isBundleOrService) return false;
      } else if (marginsWorld !== 'all' && (!p.worlds || !p.worlds.includes(marginsWorld))) {
        return false;
      }
      if (marginsTechnique !== 'all' && !checkProductMatchesTechnique(p, marginsTechnique)) {
        return false;
      }
      if (marginsStatus === 'optimal' && item.statusColor !== 'emerald') return false;
      if (marginsStatus === 'low' && item.statusColor !== 'amber') return false;
      if (marginsStatus === 'loss' && item.statusColor !== 'rose') return false;
      if (marginsStatus === 'missing' && (item.hasCost || item.isQuote)) return false;
      if (marginsSearch.trim()) {
        const q = marginsSearch.toLowerCase();
        const matchName = p.name?.toLowerCase().includes(q);
        const matchCode = p.code?.toLowerCase().includes(q);
        const matchSku = p.sku?.toLowerCase().includes(q);
        return matchName || matchCode || matchSku;
      }
      return true;
    });
  }, [marginsStats.rows, marginsWorld, marginsTechnique, marginsStatus, marginsSearch]);

  // Dynamic Margins Financial Summary for the active filters (Area + Technique + Search)
  const activeMarginsSummary = useMemo(() => {
    let revenue = 0;
    let cost = 0;
    let profit = 0;
    let reserve = 0;
    let itemsCounted = 0;
    let optimalCount = 0;
    let lowMarginCount = 0;
    let lossCount = 0;
    let missingCostCount = 0;
    let quoteCount = 0;

    filteredMarginsRows.forEach(item => {
      if (item.isQuote) {
        quoteCount++;
        return;
      }
      if (!item.hasCost) {
        missingCostCount++;
        return;
      }

      revenue += item.price;
      cost += item.cost;
      profit += item.profit;
      reserve += item.reserve;
      itemsCounted++;

      if (item.profit < 0) {
        lossCount++;
      } else if (item.statusColor === 'amber') {
        lowMarginCount++;
      } else if (item.statusColor === 'emerald') {
        optimalCount++;
      }
    });

    const avgMargin = itemsCounted > 0 && revenue > 0
      ? Math.round((profit / revenue) * 1000) / 10
      : 0;

    return {
      revenue: Math.round(revenue * 10) / 10,
      cost: Math.round(cost * 10) / 10,
      profit: Math.round(profit * 10) / 10,
      reserve: Math.round(reserve * 10) / 10,
      available: Math.round((profit - reserve) * 10) / 10,
      avgMargin,
      optimalCount,
      lowMarginCount,
      lossCount,
      missingCostCount,
      quoteCount,
      totalItems: filteredMarginsRows.length
    };
  }, [filteredMarginsRows]);

  // Technique Overview for Categories Tab ("Cuánto estoy haciendo de cada cosa")
  const techniqueOverview = useMemo(() => {
    const map = {
      '3d': { id: '3d', label: 'Impresión 3D', shortLabel: '3D', icon: '🖨️', count: 0, catalogValue: 0, categoriesCount: new Set(), color: 'emerald' },
      laser: { id: 'laser', label: 'Corte & Grabado Láser', shortLabel: 'Láser', icon: '🔥', count: 0, catalogValue: 0, categoriesCount: new Set(), color: 'amber' },
      sublimation: { id: 'sublimation', label: 'Sublimación', shortLabel: 'Sublimación', icon: '🎨', count: 0, catalogValue: 0, categoriesCount: new Set(), color: 'blue' },
      vinyl: { id: 'vinyl', label: 'Corte de Vinil', shortLabel: 'Vinil', icon: '✂️', count: 0, catalogValue: 0, categoriesCount: new Set(), color: 'purple' },
      nfc: { id: 'nfc', label: 'Enlace NFC / Smart', shortLabel: 'NFC', icon: '📡', count: 0, catalogValue: 0, categoriesCount: new Set(), color: 'rose' }
    };

    products.forEach(p => {
      const price = typeof p.price === 'number' ? p.price : 0;
      const cIds = p.categories || (p.category ? [p.category] : []);
      const t = p.techniques || [];

      if (t.includes('3d')) {
        map['3d'].count++;
        map['3d'].catalogValue += price;
        cIds.forEach(cid => map['3d'].categoriesCount.add(cid));
      }
      if (t.includes('laser')) {
        map.laser.count++;
        map.laser.catalogValue += price;
        cIds.forEach(cid => map.laser.categoriesCount.add(cid));
      }
      if (t.includes('sublimation') || t.includes('sublimacion')) {
        map.sublimation.count++;
        map.sublimation.catalogValue += price;
        cIds.forEach(cid => map.sublimation.categoriesCount.add(cid));
      }
      if (t.includes('vinyl') || t.includes('vinil')) {
        map.vinyl.count++;
        map.vinyl.catalogValue += price;
        cIds.forEach(cid => map.vinyl.categoriesCount.add(cid));
      }
      if (t.includes('nfc')) {
        map.nfc.count++;
        map.nfc.catalogValue += price;
        cIds.forEach(cid => map.nfc.categoriesCount.add(cid));
      }
    });

    return Object.values(map).map(item => ({
      ...item,
      categoriesCount: item.categoriesCount.size,
      percentOfCatalog: products.length > 0 ? Math.round((item.count / products.length) * 100) : 0
    }));
  }, [products]);

  // Enriched Categories with Per-Technique Counts & Financial Value
  const enrichedCategories = useMemo(() => {
    return categories.map(cat => {
      const categoryProducts = products.filter(p => {
        const cIds = p.categories || (p.category ? [p.category] : []);
        return cIds.includes(cat.id);
      });

      const techCounts = {
        '3d': 0,
        laser: 0,
        sublimation: 0,
        vinyl: 0,
        nfc: 0
      };

      let categoryTotalValue = 0;
      categoryProducts.forEach(p => {
        categoryTotalValue += (typeof p.price === 'number' ? p.price : 0);
        const t = p.techniques || [];
        if (t.includes('3d')) techCounts['3d']++;
        if (t.includes('laser')) techCounts.laser++;
        if (t.includes('sublimation') || t.includes('sublimacion')) techCounts.sublimation++;
        if (t.includes('vinyl') || t.includes('vinil')) techCounts.vinyl++;
        if (t.includes('nfc')) techCounts.nfc++;
      });

      const matchingProducts = categoryTechnique === 'all'
        ? categoryProducts
        : categoryProducts.filter(p => checkProductMatchesTechnique(p, categoryTechnique));

      let matchingValue = 0;
      matchingProducts.forEach(p => {
        matchingValue += (typeof p.price === 'number' ? p.price : 0);
      });

      return {
        ...cat,
        actualProductCount: categoryProducts.length,
        matchingProductCount: matchingProducts.length,
        techCounts,
        categoryTotalValue,
        matchingValue
      };
    });
  }, [categories, products, categoryTechnique]);

  // Filtered Categories based on World, Technique, and Search
  const filteredCategories = useMemo(() => {
    return enrichedCategories.filter(cat => {
      if (categoryWorld !== 'all' && cat.worldId !== categoryWorld) {
        return false;
      }
      if (categoryTechnique !== 'all' && cat.matchingProductCount === 0) {
        return false;
      }
      if (categorySearch.trim()) {
        const q = categorySearch.toLowerCase();
        const matchName = cat.name?.toLowerCase().includes(q);
        const matchId = cat.id?.toLowerCase().includes(q);
        return matchName || matchId;
      }
      return true;
    });
  }, [enrichedCategories, categoryWorld, categoryTechnique, categorySearch]);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
        <div
          className="w-full max-w-[97vw] 2xl:max-w-7xl h-[95vh] bg-[#FBF9F5] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#E8E4DA]"
          onClick={e => e.stopPropagation()}
        >
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-[#1F2421] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold font-heading flex items-center gap-2">
                <span>Panel Privado Artesano Digital</span>
                <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-700">
                  Autenticación Activa
                </span>
              </div>
              <div className="text-xs text-gray-400">
                {currentUser ? `Conectado como: ${currentUser.name} (${currentUser.username})` : 'Acceso Restringido'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {token && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-rose-900/60 text-gray-300 hover:text-white text-xs font-semibold transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cerrar sesión</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Not Logged In Screen */}
        {!token ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-[#E8E4DA] shadow-xl space-y-6">
              <div className="text-center space-y-3">
                <div className="flex justify-center pb-2">
                  <BrandLogo showTagline={true} />
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D4F3E]/10 text-[#2D4F3E] text-xs font-semibold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Acceso de Administración</span>
                </div>
                <h3 className="text-lg font-extrabold text-[#1F2421] font-heading">
                  Iniciar Sesión de Administrador
                </h3>
                <p className="text-xs text-gray-500">
                  Ingresa las credenciales autorizadas para gestionar el catálogo, precios y fotos.
                </p>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                    Usuario
                  </label>
                  <input
                    type="text"
                    required
                    value={loginForm.username}
                    onChange={e => setLoginForm({ ...loginForm, username: e.target.value })}
                    placeholder="admin"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#2D4F3E] focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    value={loginForm.password}
                    onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#2D4F3E] focus:outline-none text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 px-4 rounded-xl bg-[#2D4F3E] text-white text-sm font-bold hover:bg-[#20392C] active:scale-98 transition-all shadow-md disabled:opacity-60"
                >
                  {loginLoading ? 'Verificando...' : 'Acceder al Panel'}
                </button>
              </form>

              <div className="text-[11px] text-gray-500 text-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                Acceso exclusivo para la administración de Artesano Digital.
              </div>
            </div>
          </div>
        ) : (
          /* Logged In Dashboard & Tabs */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-w-0 min-h-0">
            
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64 bg-white border-r border-b md:border-b-0 border-[#E8E4DA] p-2.5 sm:p-3 flex md:flex-col justify-between shrink-0 overflow-x-auto md:overflow-y-auto scrollbar-thin">
              <nav className="flex md:flex-col gap-2.5 sm:gap-3 w-full min-w-max md:min-w-0">

                {/* GRUPO 1: CATÁLOGO & TIENDA */}
                <div className="space-y-1">
                  <div className="px-3 text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Catálogo &amp; Tienda
                  </div>

                  <button
                    onClick={() => setActiveTab('products')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'products' ? 'bg-[#2D4F3E] text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      <span>Productos</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      activeTab === 'products' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {products.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('flash-deals')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'flash-deals' ? 'bg-[#9E472A] text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Flame className={`w-4 h-4 ${activeTab === 'flash-deals' ? 'text-white fill-white' : 'text-[#9E472A] fill-[#9E472A]'}`} />
                      <span>Ofertas Flash &amp; Cupos</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      activeTab === 'flash-deals' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {activeFlashList.length} activas
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('area-banners')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'area-banners' ? 'bg-[#2D4F3E] text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-emerald-600" />
                      <span>Banners de Áreas</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      activeTab === 'area-banners' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      3 Áreas
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('categories')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'categories' ? 'bg-[#2D4F3E] text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FolderTree className="w-4 h-4" />
                      <span>Categorías</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      activeTab === 'categories' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {categories.length}
                    </span>
                  </button>
                </div>

                {/* GRUPO 2: TALLER & MANUFACTURA */}
                <div className="space-y-1 pt-1 border-t border-gray-100">
                  <div className="px-3 pt-2 text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Taller &amp; Manufactura
                  </div>

                  <button
                    onClick={() => {
                      setRawMaterialsSubTab('inventory');
                      setActiveTab('raw-materials');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'raw-materials' && rawMaterialsSubTab === 'inventory' ? 'bg-[#2D4F3E] text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Boxes className="w-4 h-4" />
                      <span>Stock del Taller</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      activeTab === 'raw-materials' && rawMaterialsSubTab === 'inventory' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      Insumos
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setRawMaterialsSubTab('suppliers');
                      setActiveTab('raw-materials');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'raw-materials' && rawMaterialsSubTab === 'suppliers' ? 'bg-[#2D4F3E] text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <span>Proveedores de Taller</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      activeTab === 'raw-materials' && rawMaterialsSubTab === 'suppliers' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      Contactos
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('margins')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'margins' ? 'bg-[#2D4F3E] text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>Costos &amp; Márgenes</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      activeTab === 'margins' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {marginsStats.avgMargin}%
                    </span>
                  </button>
                </div>

                {/* GRUPO 3: MARKETING & PUBLICIDAD */}
                <div className="space-y-1 pt-1 border-t border-gray-100">
                  <div className="px-3 pt-2 text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Marketing &amp; Publicidad
                  </div>

                  <button
                    onClick={() => setActiveTab('campaigns')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'campaigns' ? 'bg-[#2D4F3E] text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Temporadas &amp; Eventos</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      activeTab === 'campaigns' ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-700'
                    }`}>
                      Especial
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('arcade')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'arcade' ? 'bg-[#2D4F3E] text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4 text-amber-500" />
                      <span>Arcade del Taller</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      activeTab === 'arcade' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                    }`}>
                      10 Juegos
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('packages')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'packages' ? 'bg-[#2D4F3E] text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#D4A359]" />
                      <span>Paquetes &amp; Combos</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      activeTab === 'packages' ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-700'
                    }`}>
                      {products.filter(p => p.isBundle).length} kits
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('sales')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'sales' ? 'bg-[#2D4F3E] text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Megaphone className="w-4 h-4" />
                      <span>Ventas y publicaciones</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      activeTab === 'sales' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      ROI
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('stats')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'stats' ? 'bg-[#2D4F3E] text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      <span>Métricas &amp; Tráfico</span>
                    </div>
                  </button>
                </div>

                {/* GRUPO 4: AJUSTES */}
                <div className="space-y-1 pt-1 border-t border-gray-100">
                  <div className="px-3 pt-2 text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Ajustes
                  </div>

                  <button
                    onClick={() => setActiveTab('catalog-mobile')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'catalog-mobile' ? 'bg-[#2D4F3E] text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      <span>Catálogo Móvil &amp; Descargas</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      activeTab === 'catalog-mobile'
                        ? 'bg-white/20 text-white'
                        : (businessSettings?.mobileCatalogConfig?.enabled !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200')
                    }`}>
                      {businessSettings?.mobileCatalogConfig?.enabled !== false ? 'Activo' : 'Oculto'}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'settings' ? 'bg-[#2D4F3E] text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      <span>Datos &amp; Cobertura</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold border ${
                      activeTab === 'settings' ? 'bg-white/20 text-white border-white/20' : serviceSummary.color
                    }`}>
                      {serviceSummary.badge}
                    </span>
                  </button>
                </div>

              </nav>

              <div className="hidden md:block p-3 rounded-xl bg-gray-50 border border-gray-100 text-[11px] text-gray-500">
                Confirma cada cambio antes de cerrar el panel.
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 overflow-y-auto p-3 sm:p-5 lg:p-6 space-y-6">
              
              {/* TAB: CATÁLOGO MÓVIL & ARCHIVO DE DESCARGAS */}
              {activeTab === 'catalog-mobile' && (
                <MobileCatalogAdminSection
                  token={token}
                  businessSettings={businessSettings}
                  onUpdateSettings={(updated) => setBusinessSettings(updated)}
                  onRefreshCatalog={onRefreshCatalog}
                />
              )}

              {/* TAB: VENTAS Y PUBLICACIONES */}
              {activeTab === 'sales' && (
                <SalesMarketingSection
                  token={token}
                  products={products}
                  settings={businessSettings}
                  onRefreshCatalog={onRefreshCatalog}
                />
              )}

              {/* TAB: MATERIAS PRIMAS DEL TALLER & COSTOS OPERATIVOS */}
              {activeTab === 'raw-materials' && (
                <RawMaterialsSection
                  token={token}
                  products={products}
                  workshopParams={workshopParams}
                  onSaveWorkshopParams={(updated) => {
                    setWorkshopParams(updated);
                    loadAllData();
                  }}
                  onRefreshCatalog={onRefreshCatalog}
                  initialSubTab={rawMaterialsSubTab}
                  onSubTabChange={setRawMaterialsSubTab}
                  initialMaterials={rawMaterialsList}
                />
              )}

              {/* TAB: OFERTAS FLASH & CUPOS POR ÁREA */}
              {activeTab === 'flash-deals' && (
                <FlashDealsControlSection
                  products={products}
                  settings={businessSettings}
                  flashDeal={flashDeal}
                  token={token}
                  onRefreshCatalog={async () => {
                    await loadAllData();
                    if (onRefreshCatalog) onRefreshCatalog();
                  }}
                  onEditProduct={handleOpenEditProduct}
                />
              )}

              {/* TAB: TEMPORADAS, EFECTOS & EVENTOS */}
              {activeTab === 'campaigns' && (
                <CampaignsAdminSection
                  token={token}
                  products={products}
                  onEditProduct={handleOpenEditProduct}
                  onOpenCreateProduct={handleOpenNewProduct}
                  onRefreshCatalog={async () => {
                    await loadAllData();
                    if (onRefreshCatalog) onRefreshCatalog();
                  }}
                />
              )}

              {/* TAB: ARCADE DEL TALLER & MINI-JUEGOS (MÓDULO INDEPENDIENTE) */}
              {activeTab === 'arcade' && (
                <ArcadeAdminSection token={token} />
              )}

              {/* TAB: BANNERS DE ÁREAS (HOGAR, NEGOCIOS, EVENTOS) */}
              {activeTab === 'area-banners' && (
                <AreaBannersAdminSection
                  token={token}
                  onWorldsUpdated={async () => {
                    await loadAllData();
                    if (onRefreshCatalog) onRefreshCatalog();
                  }}
                />
              )}

              {/* TAB: PAQUETES & COMBOS DE TALLER */}
              {activeTab === 'packages' && (
                <PackagesAdminSection
                  token={token}
                  products={products}
                  onEditProduct={handleOpenEditProduct}
                  onOpenCreateProduct={handleOpenNewProduct}
                  onRefreshCatalog={async () => {
                    await loadAllData();
                    if (onRefreshCatalog) onRefreshCatalog();
                  }}
                />
              )}

              {/* TAB 1: PRODUCTOS */}
              {/* TAB 1: PRODUCTOS CON DIVISIÓN POR ÁREAS Y SWITCH DE STOCK */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  {/* ÁREAS INTERACTIVAS: DIVISIÓN VISUAL RÁPIDA */}
                  <div className="bg-white p-3 sm:p-4 rounded-2xl border border-[#E8E4DA] shadow-2xs space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Boxes className="w-4 h-4 text-[#2D4F3E]" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 font-heading">
                          División de Catálogo por Áreas
                        </h4>
                      </div>
                      <span className="text-[11px] text-gray-500">
                        Selecciona un área para auditar productos y stock de forma ágil
                      </span>
                    </div>

                    {/* 5 Pestañas de Área con Indicadores de Stock */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                      {[
                        { id: 'all', label: 'Todas las Áreas', icon: '🌐', stats: stockAreaStats.all },
                        { id: 'hogar', label: 'Hogar & Decoración', icon: '🏠', stats: stockAreaStats.hogar },
                        { id: 'negocios', label: 'Negocios & Marca', icon: '💼', stats: stockAreaStats.negocios },
                        { id: 'eventos', label: 'Eventos Especiales', icon: '🎉', stats: stockAreaStats.eventos },
                        { id: 'paquetes', label: 'Paquetes & Servicios', icon: '🎁', stats: stockAreaStats.paquetes }
                      ].map(area => {
                        const isSelected = filterWorld === area.id;
                        return (
                          <button
                            key={area.id}
                            type="button"
                            onClick={() => setFilterWorld(area.id)}
                            className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                              isSelected
                                ? 'bg-[#2D4F3E] text-white border-[#2D4F3E] shadow-sm'
                                : 'bg-gray-50/80 hover:bg-gray-100 text-gray-700 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-xs font-bold flex items-center gap-1.5">
                                <span className="text-sm">{area.icon}</span>
                                <span className="truncate">{area.label}</span>
                              </span>
                              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                              }`}>
                                {area.stats.total}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[10.5px] pt-1 border-t border-white/10 border-gray-200">
                              <span className={`flex items-center gap-1 font-semibold ${
                                isSelected ? 'text-emerald-200' : 'text-emerald-700'
                              }`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                <span>{area.stats.inStock} en stock</span>
                              </span>
                              <span className={isSelected ? 'text-gray-200' : 'text-gray-500'}>
                                {area.stats.madeToOrder} s/pedido
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* RESUMEN RÁPIDO DE STOCK DEL ÁREA SELECCIONADA */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-white border border-[#E8E4DA] shadow-2xs">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>En Existencia Inmediata</span>
                      </div>
                      <div className="text-xl font-black text-[#1F2421] mt-1">
                        {stockAreaStats[filterWorld]?.inStock || 0}
                      </div>
                      <div className="text-[10.5px] text-gray-500 mt-0.5">
                        Modelos listos para entrega
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-[#E8E4DA] shadow-2xs">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span>Bajo Pedido (Taller)</span>
                      </div>
                      <div className="text-xl font-black text-[#1F2421] mt-1">
                        {stockAreaStats[filterWorld]?.madeToOrder || 0}
                      </div>
                      <div className="text-[10.5px] text-gray-500 mt-0.5">
                        Fabricación sobre orden
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-[#E8E4DA] shadow-2xs">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        <span>Agotados / Pausados</span>
                      </div>
                      <div className="text-xl font-black text-[#1F2421] mt-1">
                        {stockAreaStats[filterWorld]?.outOfStock || 0}
                      </div>
                      <div className="text-[10.5px] text-gray-500 mt-0.5">
                        Sin existencia por ahora
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-[#E8E4DA] shadow-2xs">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#2D4F3E] flex items-center gap-1">
                        <Package className="w-3 h-3 text-[#2D4F3E]" />
                        <span>Piezas Físicas en Stock</span>
                      </div>
                      <div className="text-xl font-black text-[#2D4F3E] mt-1">
                        {stockAreaStats[filterWorld]?.totalUnits || 0} pzs
                      </div>
                      <div className="text-[10.5px] text-gray-500 mt-0.5">
                        Total de unidades en bodega
                      </div>
                    </div>
                  </div>

                  {/* BARRA DE FILTROS Y ACCIÓN */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E8E4DA]">
                    <div className="flex flex-wrap items-center gap-2 flex-1">
                      <div className="relative flex-1 min-w-[200px] max-w-xs">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar código o nombre..."
                          value={productSearch}
                          onChange={e => setProductSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#2D4F3E]"
                        />
                      </div>

                      {/* Technique / Service filter */}
                      <select
                        value={filterTechnique}
                        onChange={e => setFilterTechnique(e.target.value)}
                        className="px-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-white font-medium"
                      >
                        <option value="all">⚡ Todas las técnicas</option>
                        <option value="3d">🖨️ Impresión 3D ({techniqueCounts['3d'] || 0})</option>
                        <option value="laser">🔥 Corte & Grabado Láser ({techniqueCounts.laser || 0})</option>
                        <option value="sublimation">🎨 Sublimación ({techniqueCounts.sublimation || 0})</option>
                        <option value="vinyl">✂️ Corte de Vinil ({techniqueCounts.vinyl || 0})</option>
                        <option value="nfc">📡 Enlace NFC ({techniqueCounts.nfc || 0})</option>
                      </select>

                      {/* Stock filter */}
                      <select
                        value={filterStock}
                        onChange={e => setFilterStock(e.target.value)}
                        className="px-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-white"
                      >
                        <option value="all">Todas las existencias</option>
                        <option value="in_stock">✓ Solo en existencia</option>
                        <option value="made_to_order">⏳ Solo bajo pedido</option>
                      </select>

                      {/* Status filter */}
                      <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="px-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-white"
                      >
                        <option value="all">Todos los Estados</option>
                        <option value="published">Publicados</option>
                        <option value="draft">Borradores</option>
                        <option value="archived">Archivados</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleOpenNewProduct}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D4F3E] text-white text-xs font-bold hover:bg-[#20392C] active:scale-95 transition-all shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Nuevo Producto</span>
                      </button>
                    </div>
                  </div>

                  {/* TABLA DE PRODUCTOS CON SWITCH DE STOCK (100% AJUSTADA A LA VENTANA) */}
                  <div className="bg-white rounded-2xl border border-[#E8E4DA] overflow-hidden shadow-xs min-w-0">
                    <div className="w-full">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#F8F7F2] border-b border-[#E8E4DA] text-gray-600 uppercase font-bold text-[9.5px]">
                          <tr>
                            <th className="py-1.5 px-2">Foto &amp; Código</th>
                            <th className="py-1.5 px-2">Producto</th>
                            <th className="py-1.5 px-1.5">Áreas / Técnicas</th>
                            <th className="py-1.5 px-1.5">Precio &amp; Unidad</th>
                            <th className="py-1.5 px-1.5 text-center">Existencia / Stock</th>
                            <th className="py-1.5 px-1.5 text-center">Oferta Flash</th>
                            <th className="py-1.5 px-1.5">Estado</th>
                            <th className="py-1.5 px-2 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredProducts.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-1 px-2">
                                <div className="flex items-center gap-1.5">
                                  <img
                                    src={p.primaryImage}
                                    alt=""
                                    className="w-7 h-7 rounded-md object-cover bg-gray-100 border border-gray-200 shrink-0 shadow-2xs"
                                  />
                                  <div className="flex flex-col gap-0 min-w-0">
                                    <span className="font-mono font-bold text-gray-800 bg-gray-100 px-1 py-0 rounded text-[10px] border border-gray-200 w-fit">
                                      {p.sku || p.code}
                                    </span>
                                    {p.skuBreakdown && (
                                      <span className="text-[8.5px] text-gray-500 font-sans tracking-tight truncate max-w-[140px]">
                                        {p.skuBreakdown.area} • {p.skuBreakdown.technique} • {p.skuBreakdown.material}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td className="py-1 px-2">
                                <div className="font-bold text-[#1F2421] text-xs leading-snug">{p.name}</div>
                                <div className="text-[10px] text-gray-400 line-clamp-1">{p.shortDescription}</div>
                                {/* Circulitos de color del producto compactos */}
                                {(() => {
                                  const colorOpts = getProductColorOptions(p);
                                  if (colorOpts.length === 0) return null;
                                  return (
                                    <div className="flex items-center gap-1 select-none mt-0.5" title={`${colorOpts.length} colores: ${colorOpts.join(', ')}`}>
                                      <div className="flex items-center gap-0.5">
                                        {colorOpts.slice(0, 6).map((c, idx) => {
                                          const sw = getFilamentColor(c);
                                          return (
                                            <span
                                              key={idx}
                                              className="w-2.5 h-2.5 rounded-full border border-black/25 shadow-2xs inline-block shrink-0"
                                              style={{
                                                background: sw?.css || '#D1D5DB',
                                                borderColor: sw?.border || '#9CA3AF'
                                              }}
                                              title={c}
                                            />
                                          );
                                        })}
                                      </div>
                                      {colorOpts.length > 6 && (
                                        <span className="text-[8.5px] font-bold text-gray-400">+{colorOpts.length - 6}</span>
                                      )}
                                      <span className="text-[8.5px] text-gray-400 font-medium">
                                        ({colorOpts.length} col.)
                                      </span>
                                    </div>
                                  );
                                })()}
                              </td>

                              <td className="py-1 px-1.5">
                                <div className="flex flex-wrap gap-0.5">
                                  {p.isBundle && (
                                    <span className="px-1 py-0 rounded bg-purple-100 text-purple-800 text-[9px] font-bold flex items-center gap-0.5">
                                      <span>🎁</span>
                                      <span>Paquete</span>
                                    </span>
                                  )}
                                  {(p.code?.includes('PATCH') || p.category === 'servicios') && (
                                    <span className="px-1 py-0 rounded bg-amber-100 text-amber-800 text-[9px] font-bold flex items-center gap-0.5">
                                      <span>⚡</span>
                                      <span>Servicio</span>
                                    </span>
                                  )}
                                  {p.worlds?.map(w => (
                                    <span key={w} className="px-1 py-0 rounded bg-gray-100 text-gray-600 text-[9px] font-medium capitalize">
                                      {w}
                                    </span>
                                  ))}
                                  {p.techniques?.map(t => (
                                    <span key={t} className="px-1 py-0 rounded bg-emerald-50 text-emerald-800 text-[9px] font-medium uppercase">
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              </td>

                              <td className="py-1 px-1.5">
                                <div className="flex flex-col gap-0">
                                  <span className="font-bold text-gray-900 font-mono text-xs leading-none">
                                    {p.priceType === 'quote' ? (
                                      <span className="text-gray-400 font-sans font-medium text-[11px]">A cotizar</span>
                                    ) : (
                                      `$${p.price}`
                                    )}
                                  </span>
                                  <select
                                    value={p.priceUnit || 'pieza'}
                                    onChange={(e) => handleUpdateProductUnit(p, e.target.value)}
                                    className="text-[9.5px] font-bold text-[#2D4F3E] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded px-1 py-0 cursor-pointer focus:outline-none w-fit transition-colors mt-0.5"
                                    title="Haz clic para cambiar el tipo de unidad"
                                  >
                                    <option value="pieza">/ pieza</option>
                                    <option value="pza">/ pza</option>
                                    <option value="lote">/ lote</option>
                                    <option value="paquete">/ paquete</option>
                                    <option value="docena">/ docena</option>
                                    <option value="juego">/ juego</option>
                                    <option value="par">/ par</option>
                                    <option value="metro">/ m</option>
                                    <option value="combo">/ combo</option>
                                    <option value="servicio">/ servicio</option>
                                  </select>
                                </div>
                              </td>

                              {/* SWITCH DE STOCK INTERACTIVO DE 1 CLIC COMPACTO */}
                              <td className="py-1 px-1.5 text-center">
                                <div className="inline-flex flex-col items-center gap-0.5">
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={(e) => handleToggleStock(p, e)}
                                      className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                        p.availability === 'in_stock' ? 'bg-emerald-600' : 'bg-gray-300'
                                      }`}
                                      title={p.availability === 'in_stock' ? 'En existencia. Clic para desactivar' : 'Sin stock inmediato. Clic para activar existencia'}
                                    >
                                      <span
                                        className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                          p.availability === 'in_stock' ? 'translate-x-3' : 'translate-x-0'
                                        }`}
                                      />
                                    </button>
                                    <span className={`text-[9.5px] font-bold ${
                                      p.availability === 'in_stock' ? 'text-emerald-700' : 'text-gray-500'
                                    }`}>
                                      {p.availability === 'in_stock' ? 'En exist.' : (p.availability === 'out_of_stock' ? 'Agotado' : 'Pedido')}
                                    </span>
                                  </div>

                                  {p.availability === 'in_stock' && (
                                    <div className="flex items-center gap-0.5 bg-gray-100 px-1 py-0 rounded text-[9.5px]">
                                      <span className="text-gray-600 font-semibold">
                                        <strong>{p.stockQuantity || 0}</strong> pz
                                      </span>
                                      <button
                                        type="button"
                                        onClick={(e) => handleAdjustStockQuantity(p, -1, e)}
                                        className="w-3 h-3 rounded bg-white hover:bg-gray-200 text-gray-700 flex items-center justify-center text-[9px] font-black shadow-2xs cursor-pointer"
                                        title="Restar 1 pieza"
                                      >
                                        -
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => handleAdjustStockQuantity(p, 1, e)}
                                        className="w-3 h-3 rounded bg-white hover:bg-gray-200 text-gray-700 flex items-center justify-center text-[9px] font-black shadow-2xs cursor-pointer"
                                        title="Sumar 1 pieza"
                                      >
                                        +
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>

                              <td className="py-1 px-1.5 text-center">
                                <button
                                  type="button"
                                  onClick={(e) => handleToggleProductFlash(p, e)}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                                    p.flashDealConfig?.enabled
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 shadow-2xs'
                                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'
                                  }`}
                                  title={p.flashDealConfig?.enabled ? "Oferta activa. Clic para desactivar" : "Clic para activar oferta en este producto"}
                                >
                                  <Zap className={`w-3 h-3 ${p.flashDealConfig?.enabled ? 'fill-amber-500 text-amber-600' : 'text-gray-400'}`} />
                                  <span>
                                    {p.flashDealConfig?.enabled 
                                      ? `${p.flashDealConfig.durationMinutes <= 15 ? '⚡ 15M' : `${p.flashDealConfig.durationMinutes || 120}m`}`
                                      : 'Off'}
                                  </span>
                                </button>
                              </td>

                              <td className="py-1 px-1.5">
                                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                                  p.status === 'published' ? 'bg-emerald-100 text-emerald-800' :
                                  p.status === 'draft' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {p.status === 'published' ? 'Publicado' : p.status === 'draft' ? 'Borrador' : 'Archivado'}
                                </span>
                              </td>

                              <td className="py-1 px-2 text-right">
                                <div className="flex items-center justify-end gap-0.5">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenEditProduct(p);
                                    }}
                                    className="p-1 text-gray-500 hover:text-[#2D4F3E] hover:bg-gray-100 rounded cursor-pointer"
                                    title="Editar"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDuplicateProduct(p.id)}
                                    className="p-1 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded cursor-pointer"
                                    title="Duplicar como plantilla"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(p.id)}
                                    className="p-1 text-gray-400 hover:text-rose-600 hover:bg-gray-100 rounded cursor-pointer"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: COSTOS DE PRODUCCIÓN & MÁRGENES DE GANANCIA (EXCEL MODEL) */}
              {activeTab === 'margins' && (
                <div className="space-y-5 min-w-0">
                  {/* CABECERA & GUÍA FINANCIERA */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E4DA] shadow-xs space-y-3 min-w-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2D4F3E] to-[#1F2421] text-emerald-400 flex items-center justify-center shadow-xs shrink-0">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-extrabold text-[#1F2421] font-heading">
                            Costos de Producción, Márgenes & Ganancias
                          </h4>
                          <p className="text-xs text-gray-500">
                            Fórmulas financieras en vivo: Ganancia = Venta − Costo · Margen % = Ganancia / Venta · Objetivo: {workshopParams.targetMarginPercent}%.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setRawMaterialsSubTab('inventory');
                            setActiveTab('raw-materials');
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 hover:border-[#2D4F3E] bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-900 transition-all cursor-pointer shadow-2xs"
                          title="Ir al apartado de Materias Primas del Taller"
                        >
                          <Boxes className="w-3.5 h-3.5 text-[#2D4F3E]" />
                          <span>Materias Primas del Taller</span>
                          <ArrowRight className="w-3 h-3 text-[#2D4F3E]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowWorkshopParams(!showWorkshopParams)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-[#2D4F3E] bg-gray-50 hover:bg-white text-xs font-bold text-gray-700 transition-all cursor-pointer"
                        >
                          <Sliders className="w-3.5 h-3.5 text-[#2D4F3E]" />
                          <span>Tarifas Rápidas</span>
                          {showWorkshopParams ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* ACORDEÓN DE PARÁMETROS DEL TALLER (CONFIGURACIÓN EXCEL) */}
                    {showWorkshopParams && (
                      <form onSubmit={handleSaveWorkshopParams} className="p-4 rounded-xl bg-[#F8F7F2] border border-[#E8E4DA] space-y-4 animate-fade-in min-w-0">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-200/80 pb-2">
                          <div className="text-xs font-bold text-[#1F2421] uppercase tracking-wider flex items-center gap-1.5">
                            <Calculator className="w-4 h-4 text-[#2D4F3E]" />
                            <span>Tarifas Base de Taller &amp; Materias Primas</span>
                          </div>
                          <span className="text-[11px] text-gray-500">
                            Modifica cualquier tarifa y se recalcularán los márgenes de todo el catálogo
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 text-xs">
                          <div>
                            <label className="font-bold text-gray-700 block mb-1">Filamento PLA ($/kg)</label>
                            <input
                              type="number"
                              step="any"
                              value={workshopParams.plaPerKg}
                              onChange={e => setWorkshopParams({ ...workshopParams, plaPerKg: Number(e.target.value) })}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white font-semibold"
                            />
                            <span className="text-[10px] text-gray-400 mt-0.5 block">${(workshopParams.plaPerKg / 1000).toFixed(3)}/g</span>
                          </div>

                          <div>
                            <label className="font-bold text-gray-700 block mb-1">Filamento TPU ($/kg)</label>
                            <input
                              type="number"
                              step="any"
                              value={workshopParams.tpuPerKg}
                              onChange={e => setWorkshopParams({ ...workshopParams, tpuPerKg: Number(e.target.value) })}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white font-semibold"
                            />
                            <span className="text-[10px] text-gray-400 mt-0.5 block">${(workshopParams.tpuPerKg / 1000).toFixed(3)}/g</span>
                          </div>

                          <div>
                            <label className="font-bold text-gray-700 block mb-1">Energía 3D ($/hora)</label>
                            <input
                              type="number"
                              step="any"
                              value={workshopParams.electricityPerHour}
                              onChange={e => setWorkshopParams({ ...workshopParams, electricityPerHour: Number(e.target.value) })}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white font-semibold"
                            />
                            <span className="text-[10px] text-gray-400 mt-0.5 block">Consumo eléctrico CFE</span>
                          </div>

                          <div>
                            <label className="font-bold text-gray-700 block mb-1">Desgaste 3D ($/hora)</label>
                            <input
                              type="number"
                              step="any"
                              value={workshopParams.wearPerHour}
                              onChange={e => setWorkshopParams({ ...workshopParams, wearPerHour: Number(e.target.value) })}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white font-semibold"
                            />
                            <span className="text-[10px] text-gray-400 mt-0.5 block">Mantenimiento de boquilla</span>
                          </div>

                          <div>
                            <label className="font-bold text-gray-700 block mb-1">Mano de Obra ($/hora)</label>
                            <input
                              type="number"
                              step="any"
                              value={workshopParams.laborPerHour}
                              onChange={e => setWorkshopParams({ ...workshopParams, laborPerHour: Number(e.target.value) })}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white font-semibold"
                            />
                            <span className="text-[10px] text-gray-400 mt-0.5 block">${(workshopParams.laborPerHour / 60).toFixed(2)}/min de trabajo</span>
                          </div>

                          <div>
                            <label className="font-bold text-gray-700 block mb-1">Merma Filamento (%)</label>
                            <input
                              type="number"
                              step="any"
                              value={workshopParams.filamentWastePercent}
                              onChange={e => setWorkshopParams({ ...workshopParams, filamentWastePercent: Number(e.target.value) })}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white font-semibold"
                            />
                            <span className="text-[10px] text-gray-400 mt-0.5 block">Soportes, purgas y fallas</span>
                          </div>

                          <div>
                            <label className="font-bold text-gray-700 block mb-1">Margen Objetivo (%)</label>
                            <input
                              type="number"
                              step="any"
                              value={workshopParams.targetMarginPercent}
                              onChange={e => setWorkshopParams({ ...workshopParams, targetMarginPercent: Number(e.target.value) })}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white font-semibold"
                            />
                            <span className="text-[10px] text-gray-400 mt-0.5 block">Meta de rentabilidad mínima</span>
                          </div>

                          <div>
                            <label className="font-bold text-gray-700 block mb-1">Reserva de Utilidad (%)</label>
                            <input
                              type="number"
                              step="any"
                              value={workshopParams.reservePercent}
                              onChange={e => setWorkshopParams({ ...workshopParams, reservePercent: Number(e.target.value) })}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white font-semibold"
                            />
                            <span className="text-[10px] text-gray-400 mt-0.5 block">Fondo de ahorro/taller</span>
                          </div>

                          <div className="col-span-1 sm:col-span-2 flex items-end gap-2">
                            <button
                              type="submit"
                              disabled={savingParams}
                              className="px-4 py-2 rounded-xl bg-[#2D4F3E] text-white text-xs font-bold hover:bg-[#20392C] transition-all disabled:opacity-50 cursor-pointer"
                            >
                              {savingParams ? 'Guardando...' : 'Guardar Parámetros de Taller'}
                            </button>
                            {paramsSaveMsg && (
                              <span className="text-xs font-bold text-emerald-700">
                                {paramsSaveMsg}
                              </span>
                            )}
                          </div>
                        </div>
                      </form>
                    )}

                    {/* 4 KPIS SUPERIORES DE SALUD FINANCIERA (CALCULADOS EN TIEMPO REAL SEGÚN ÁREA Y TÉCNICA) */}
                    <div className="space-y-2">
                      {(marginsTechnique !== 'all' || marginsWorld !== 'all' || marginsSearch.trim()) && (
                        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                          <div className="flex items-center gap-1.5 font-medium">
                            <span className="font-bold text-amber-800">Filtrado activo:</span>
                            <span>{marginsWorld === 'all' ? 'Todas las áreas' : `Área: ${marginsWorld}`}</span>
                            <span>•</span>
                            <span>{techniqueList.find(t => t.id === marginsTechnique)?.label || 'Todas las técnicas'}</span>
                            {marginsSearch.trim() && <span>• Búsqueda: "{marginsSearch}"</span>}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setMarginsWorld('all');
                              setMarginsTechnique('all');
                              setMarginsSearch('');
                              setMarginsStatus('all');
                            }}
                            className="text-[11px] font-bold text-amber-800 underline hover:text-amber-950 cursor-pointer"
                          >
                            Restablecer todos
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 pt-1 min-w-0">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
                          <div className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-800">
                            Margen Promedio {marginsTechnique !== 'all' ? `(${techniqueList.find(t => t.id === marginsTechnique)?.shortLabel})` : 'del Catálogo'}
                          </div>
                          <div className="text-2xl font-black text-emerald-900 mt-1">
                            {activeMarginsSummary.avgMargin}%
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-emerald-700 mt-1.5">
                            <span>Objetivo: {workshopParams.targetMarginPercent}%</span>
                            <span className="font-bold">
                              {activeMarginsSummary.avgMargin >= workshopParams.targetMarginPercent ? '✓ Meta superada' : '⚠️ Por afinar'}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                          <div className="text-[10.5px] font-bold uppercase tracking-wider text-blue-800">
                            Ganancia Neta {marginsTechnique !== 'all' ? `(${techniqueList.find(t => t.id === marginsTechnique)?.shortLabel})` : 'Proyectada'}
                          </div>
                          <div className="text-2xl font-black text-blue-900 mt-1">
                            ${activeMarginsSummary.profit.toLocaleString('es-MX')} MXN
                          </div>
                          <div className="text-[11px] text-blue-700 mt-1.5">
                            Suma si se vende 1 unidad ({activeMarginsSummary.totalItems} productos)
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                          <div className="text-[10.5px] font-bold uppercase tracking-wider text-amber-800">
                            Costo vs Venta {marginsTechnique !== 'all' ? `(${techniqueList.find(t => t.id === marginsTechnique)?.shortLabel})` : 'de Selección'}
                          </div>
                          <div className="text-lg font-black text-amber-900 mt-1">
                            ${activeMarginsSummary.cost.toLocaleString('es-MX')} / ${activeMarginsSummary.revenue.toLocaleString('es-MX')}
                          </div>
                          <div className="text-[11px] text-amber-700 mt-1.5">
                            Costo es el {activeMarginsSummary.revenue > 0 ? Math.round((activeMarginsSummary.cost / activeMarginsSummary.revenue) * 100) : 0}% de la venta
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-200">
                          <div className="text-[10.5px] font-bold uppercase tracking-wider text-purple-800">
                            Reserva ({workshopParams.reservePercent}%) &amp; Libre
                          </div>
                          <div className="text-lg font-black text-purple-900 mt-1">
                            ${activeMarginsSummary.reserve.toLocaleString('es-MX')} / ${activeMarginsSummary.available.toLocaleString('es-MX')}
                          </div>
                          <div className="text-[11px] text-purple-700 mt-1.5">
                            Reserva contingencia / Libre retiro
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SEMÁFORO DE SALUD DE RENTABILIDAD DINÁMICO */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 text-xs">
                      <span className="text-gray-500 font-semibold text-[11px]">Filtrar por rentabilidad:</span>
                      <button
                        type="button"
                        onClick={() => setMarginsStatus(marginsStatus === 'optimal' ? 'all' : 'optimal')}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                          marginsStatus === 'optimal' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        }`}
                      >
                        ✓ {activeMarginsSummary.optimalCount} Margen Óptimo (≥40%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setMarginsStatus(marginsStatus === 'low' ? 'all' : 'low')}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                          marginsStatus === 'low' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                      >
                        ⚠️ {activeMarginsSummary.lowMarginCount} Bajo Objetivo (&lt;40%)
                      </button>
                      {activeMarginsSummary.lossCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setMarginsStatus(marginsStatus === 'loss' ? 'all' : 'loss')}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                            marginsStatus === 'loss' ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          ✕ {activeMarginsSummary.lossCount} En Pérdida
                        </button>
                      )}
                      {activeMarginsSummary.missingCostCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setMarginsStatus(marginsStatus === 'missing' ? 'all' : 'missing')}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                            marginsStatus === 'missing' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                          }`}
                        >
                          📋 {activeMarginsSummary.missingCostCount} Faltan Costos
                        </button>
                      )}
                      <span className="text-[11px] text-gray-400 ml-auto">
                        ⚙️ {activeMarginsSummary.quoteCount} Cotización abierta
                      </span>
                    </div>
                  </div>

                  {/* FILTROS DE ÁREA, TÉCNICA Y BÚSQUEDA */}
                  <div className="space-y-2.5 bg-white p-3.5 rounded-2xl border border-[#E8E4DA] min-w-0">
                    {/* Fila 1: Filtro por Área y Buscador */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2 flex-1">
                        <div className="flex flex-wrap items-center gap-1 bg-gray-100 p-1 rounded-xl">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 px-2 py-0.5">Área:</span>
                          {[
                            { id: 'all', label: 'Todas', icon: '🌐' },
                            { id: 'hogar', label: 'Hogar', icon: '🏠' },
                            { id: 'negocios', label: 'Negocios', icon: '💼' },
                            { id: 'eventos', label: 'Eventos', icon: '🎉' },
                            { id: 'paquetes', label: 'Paquetes & Servicios', icon: '🎁' }
                          ].map(area => (
                            <button
                              key={area.id}
                              type="button"
                              onClick={() => setMarginsWorld(area.id)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                marginsWorld === area.id
                                  ? 'bg-white text-[#2D4F3E] shadow-2xs font-extrabold'
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              <span>{area.icon}</span>
                              <span>{area.label}</span>
                            </button>
                          ))}
                        </div>

                        <div className="relative flex-1 min-w-[180px] max-w-xs">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Buscar SKU o nombre..."
                            value={marginsSearch}
                            onChange={e => setMarginsSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#2D4F3E]"
                          />
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 font-medium shrink-0">
                        Mostrando <strong>{filteredMarginsRows.length}</strong> de {products.length} productos
                      </div>
                    </div>

                    {/* Fila 2: Filtro por Servicio / Técnica de Fabricación */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mr-1 flex items-center gap-1">
                        <Filter className="w-3 h-3 text-[#2D4F3E]" />
                        <span>Técnica / Servicio:</span>
                      </span>
                      {techniqueList.map(tech => {
                        const isSelected = marginsTechnique === tech.id;
                        return (
                          <button
                            key={tech.id}
                            type="button"
                            onClick={() => setMarginsTechnique(tech.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                              isSelected
                                ? 'bg-[#2D4F3E] text-white shadow-2xs scale-102'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }`}
                          >
                            <span>{tech.icon}</span>
                            <span>{tech.shortLabel}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                            }`}>
                              {techniqueCounts[tech.id] || 0}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* TABLA DE COSTOS, MÁRGENES Y GANANCIAS (100% AJUSTADA A LA VENTANA) */}
                  <div className="bg-white rounded-2xl border border-[#E8E4DA] overflow-hidden shadow-xs">
                    <div className="w-full">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#F8F7F2] border-b border-[#E8E4DA] text-gray-600 uppercase font-bold text-[9.5px]">
                          <tr>
                            <th className="py-1.5 px-2">SKU &amp; Producto</th>
                            <th className="py-1.5 px-2 text-right">P. Venta &amp; Unidad</th>
                            <th className="py-1.5 px-2 text-right">Costo Unit.</th>
                            <th className="py-1.5 px-2 text-right">Ganancia &amp; Margen</th>
                            <th className="py-1.5 px-2 text-right">Utilidad &amp; Reserva</th>
                            <th className="py-1.5 px-2 text-center">Estado &amp; Desglose</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredMarginsRows.map(row => {
                            const p = row.product;
                            return (
                              <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                                <td className="py-1 px-2">
                                  <div className="flex items-center gap-1.5">
                                    <img
                                      src={p.primaryImage}
                                      alt=""
                                      className="w-7 h-7 rounded-md object-cover bg-gray-100 border border-gray-200 shrink-0 shadow-2xs"
                                    />
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1 flex-wrap">
                                        <span className="font-mono font-bold text-gray-800 bg-gray-100 px-1 py-0 rounded text-[9.5px] border border-gray-200">
                                          {p.sku || p.code}
                                        </span>
                                        <span className="font-bold text-[#1F2421] text-xs truncate max-w-[200px]" title={p.name}>
                                          {p.name}
                                        </span>
                                      </div>
                                      <div className="flex flex-wrap items-center gap-1 mt-0.5">
                                        {(p.techniques || []).map(tKey => {
                                          const norm = tKey.replace('sublimacion', 'sublimation').replace('vinil', 'vinyl');
                                          const techInfo = techniqueList.find(t => t.id === norm);
                                          return (
                                            <span
                                              key={tKey}
                                              className={`text-[8.5px] font-bold px-1 py-0 rounded ${
                                                norm === '3d' ? 'bg-emerald-100 text-emerald-800' :
                                                norm === 'laser' ? 'bg-amber-100 text-amber-800' :
                                                norm === 'sublimation' ? 'bg-blue-100 text-blue-800' :
                                                norm === 'vinyl' ? 'bg-purple-100 text-purple-800' :
                                                norm === 'nfc' ? 'bg-rose-100 text-rose-800' :
                                                'bg-gray-100 text-gray-700'
                                              }`}
                                            >
                                              {techInfo?.shortLabel || tKey}
                                            </span>
                                          );
                                        })}
                                        <span className="text-[8.5px] text-gray-400">· {p.worlds?.join(', ')}</span>
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {/* Precio de Venta & Unidad (Editable en Vivo) */}
                                <td className="py-1 px-2 text-right">
                                  <div className="inline-flex flex-col items-end gap-0.5">
                                    <div className="inline-flex items-center justify-end gap-0.5 bg-emerald-50/70 border border-emerald-300 rounded px-1 py-0 focus-within:ring-1 focus-within:ring-[#2D4F3E]">
                                      <span className="text-emerald-700 text-[10px] font-black">$</span>
                                      <input
                                        type="number"
                                        step="any"
                                        min="0"
                                        value={p.price ?? ''}
                                        onChange={(e) => handleUpdateProductPrice(p, e.target.value)}
                                        placeholder="0.00"
                                        className="w-14 text-right text-xs font-mono font-black text-gray-900 bg-transparent focus:outline-none py-0"
                                        title="Haz clic para editar el precio de venta en catálogo"
                                      />
                                    </div>
                                    <div className="inline-flex items-center gap-1">
                                      <select
                                        value={p.priceUnit || 'pieza'}
                                        onChange={(e) => handleUpdateProductUnit(p, e.target.value)}
                                        className="text-[9px] font-bold text-gray-600 bg-gray-100 hover:bg-emerald-100 hover:text-emerald-900 border border-gray-200 rounded px-1 py-0 cursor-pointer focus:outline-none transition-colors"
                                        title="Haz clic para cambiar el tipo de unidad (pieza, lote, paquete, etc.)"
                                      >
                                        <option value="pieza">/ pieza</option>
                                        <option value="pza">/ pza</option>
                                        <option value="lote">/ lote</option>
                                        <option value="paquete">/ paquete</option>
                                        <option value="docena">/ docena</option>
                                        <option value="juego">/ juego</option>
                                        <option value="par">/ par</option>
                                        <option value="metro">/ metro</option>
                                        <option value="cm²">/ cm²</option>
                                        <option value="combo">/ combo</option>
                                        <option value="servicio">/ servicio</option>
                                      </select>
                                    </div>
                                  </div>
                                </td>

                                {/* Costo Unitario de Producción (Editable en Vivo) */}
                                <td className="py-1 px-2 text-right">
                                  <div className="inline-flex flex-col items-end gap-0.5">
                                    <div className="inline-flex items-center justify-end gap-0.5 bg-amber-50/70 border border-amber-300 rounded px-1 py-0 focus-within:ring-1 focus-within:ring-[#2D4F3E]">
                                      <span className="text-amber-800 text-[10px] font-black">$</span>
                                      <input
                                        type="number"
                                        step="any"
                                        min="0"
                                        value={p.costPrice ?? ''}
                                        onChange={(e) => handleUpdateProductCost(p, e.target.value)}
                                        placeholder="0.00"
                                        className="w-14 text-right text-xs font-mono font-bold text-gray-900 bg-transparent focus:outline-none py-0"
                                        title="Haz clic para editar el costo de producción"
                                      />
                                    </div>
                                    <span className="text-[9px] text-gray-400 font-mono" title={`Costo máximo sugerido para 40% margen: $${row.maxCost}`}>
                                      {row.hasCost ? `Obj: $${row.maxCost}` : 'Sin costear'}
                                    </span>
                                  </div>
                                </td>

                                {/* Ganancia & Margen % */}
                                <td className="py-1 px-2 text-right">
                                  {row.isQuote ? (
                                    <span className="text-gray-300 font-mono">-</span>
                                  ) : (
                                    <div className="inline-flex flex-col items-end">
                                      <span className={`font-mono font-black text-xs ${row.profit < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                                        {row.profit < 0 ? `-$${Math.abs(row.profit)}` : `+$${row.profit}`}
                                      </span>
                                      {row.hasCost && (
                                        <span className={`inline-block px-1 py-0 rounded font-black text-[9px] mt-0.5 ${
                                          row.statusColor === 'emerald' ? 'bg-emerald-100 text-emerald-800' :
                                          row.statusColor === 'amber' ? 'bg-amber-100 text-amber-800' :
                                          'bg-rose-100 text-rose-800'
                                        }`}>
                                          {row.marginPct}%
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </td>

                                {/* Utilidad Disponible & Reserva 10% */}
                                <td className="py-1 px-2 text-right">
                                  {row.isQuote || row.profit <= 0 ? (
                                    <span className="text-gray-300 font-mono">-</span>
                                  ) : (
                                    <div className="inline-flex flex-col items-end text-[10px]">
                                      <span className="font-bold text-emerald-800 font-mono" title="Utilidad neta disponible libre de reserva">
                                        Disp: ${row.available}
                                      </span>
                                      <span className="text-purple-700 font-mono text-[9px]" title="Reserva del 10% para imprevistos de taller">
                                        Res: ${row.reserve}
                                      </span>
                                      <span className="text-gray-400 font-mono text-[8.5px]" title={`Recargo / Markup: ${row.markupPct}%`}>
                                        {row.markupPct}% rec.
                                      </span>
                                    </div>
                                  )}
                                </td>

                                {/* Estado & Botón Desglose */}
                                <td className="py-1 px-2 text-center">
                                  <div className="inline-flex flex-col items-center gap-1">
                                    <span className={`inline-block px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                                      row.statusColor === 'emerald' ? 'bg-emerald-100 text-emerald-800' :
                                      row.statusColor === 'amber' ? 'bg-amber-100 text-amber-800' :
                                      row.statusColor === 'rose' ? 'bg-rose-100 text-rose-800' :
                                      row.statusColor === 'blue' ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-600'
                                    }`}>
                                      {row.statusLabel}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenCostBreakdown(p)}
                                      className="px-1.5 py-0 rounded border border-gray-200 text-gray-600 hover:text-[#2D4F3E] hover:border-[#2D4F3E] hover:bg-emerald-50/50 transition-all text-[9.5px] font-bold inline-flex items-center gap-0.5 cursor-pointer"
                                      title="Abrir calculadora detallada de filamento, máquina y mano de obra"
                                    >
                                      <Calculator className="w-2.5 h-2.5 text-[#2D4F3E]" />
                                      <span>Desglose</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CATEGORÍAS & AUDITORÍA DE PRODUCCIÓN POR TÉCNICA */}
              {activeTab === 'categories' && (
                <div className="space-y-5">
                  {/* PANEL DE AUDITORÍA: ¿CUÁNTO ESTOY HACIENDO DE CADA COSA? */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E8E4DA] shadow-2xs space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Boxes className="w-4 h-4 text-[#2D4F3E]" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 font-heading">
                          Auditoría de Fabricación por Técnica ("¿Cuánto estoy haciendo de cada cosa?")
                        </h4>
                      </div>
                      <span className="text-[11px] text-gray-500">
                        Haz clic en una tarjeta para filtrar automáticamente las ramas de esa tecnología
                      </span>
                    </div>

                    {/* 5 Tarjetas Resumen por Técnica */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                      {techniqueOverview.map(tInfo => {
                        const isSelected = categoryTechnique === tInfo.id;
                        return (
                          <button
                            key={tInfo.id}
                            type="button"
                            onClick={() => setCategoryTechnique(isSelected ? 'all' : tInfo.id)}
                            className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                              isSelected
                                ? 'bg-[#2D4F3E] text-white border-[#2D4F3E] shadow-sm scale-102 ring-2 ring-[#2D4F3E]/20'
                                : 'bg-gray-50/90 hover:bg-white hover:border-gray-300 text-gray-800 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-xs font-bold flex items-center gap-1.5">
                                <span className="text-base">{tInfo.icon}</span>
                                <span className="truncate">{tInfo.shortLabel}</span>
                              </span>
                              <span className={`text-[10.5px] font-black px-1.5 py-0.5 rounded-full ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-800'
                              }`}>
                                {tInfo.count}
                              </span>
                            </div>

                            <div className="space-y-0.5 pt-1 border-t border-gray-200/60">
                              <div className={`text-sm font-black ${isSelected ? 'text-white' : 'text-[#1F2421]'}`}>
                                ${tInfo.catalogValue.toLocaleString('es-MX')} <span className="text-[10px] font-normal">MXN</span>
                              </div>
                              <div className={`text-[10px] flex items-center justify-between ${
                                isSelected ? 'text-emerald-200' : 'text-gray-500'
                              }`}>
                                <span>{tInfo.percentOfCatalog}% catálogo</span>
                                <span>{tInfo.categoriesCount} ramas</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* BARRA DE FILTROS PARA CATEGORÍAS */}
                  <div className="space-y-2.5 bg-white p-3.5 rounded-2xl border border-[#E8E4DA] min-w-0">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      {/* Filtro por Técnica */}
                      <div className="flex flex-wrap items-center gap-1.5 flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1 mr-1">
                          <Filter className="w-3 h-3 text-[#2D4F3E]" />
                          <span>Técnica:</span>
                        </span>
                        {techniqueList.map(tech => {
                          const isSelected = categoryTechnique === tech.id;
                          return (
                            <button
                              key={tech.id}
                              type="button"
                              onClick={() => setCategoryTechnique(tech.id)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                isSelected
                                  ? 'bg-[#2D4F3E] text-white shadow-2xs font-extrabold'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              <span>{tech.icon}</span>
                              <span>{tech.shortLabel}</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-white text-gray-600'
                              }`}>
                                {techniqueCounts[tech.id] || 0}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Buscador de Subcategorías */}
                      <div className="relative min-w-[200px] max-w-xs">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar categoría..."
                          value={categorySearch}
                          onChange={e => setCategorySearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#2D4F3E]"
                        />
                      </div>
                    </div>

                    {/* Fila secundaria: Selector de Área y Contador */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 px-1">Área:</span>
                        {[
                          { id: 'all', label: 'Todas las áreas', icon: '🌐' },
                          { id: 'hogar', label: 'Hogar', icon: '🏠' },
                          { id: 'negocios', label: 'Negocios', icon: '💼' },
                          { id: 'eventos', label: 'Eventos', icon: '🎉' }
                        ].map(area => (
                          <button
                            key={area.id}
                            type="button"
                            onClick={() => setCategoryWorld(area.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                              categoryWorld === area.id
                                ? 'bg-gray-800 text-white font-bold'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                          >
                            <span>{area.icon}</span>
                            <span>{area.label}</span>
                          </button>
                        ))}
                      </div>

                      <div className="text-xs text-gray-500 font-medium">
                        Mostrando <strong>{filteredCategories.length}</strong> de {categories.length} categorías
                        {categoryTechnique !== 'all' && (
                          <span className="ml-1 text-[#2D4F3E] font-bold">
                            (con {techniqueList.find(t => t.id === categoryTechnique)?.shortLabel})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* TABLA DETALLADA DE CATEGORÍAS CON DESGLOSE DE TÉCNICAS */}
                  <div className="bg-white rounded-2xl border border-[#E8E4DA] overflow-hidden shadow-xs">
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#F8F7F2] border-b border-[#E8E4DA] text-gray-600 uppercase font-bold text-[9.5px]">
                          <tr>
                            <th className="py-1.5 px-3">Subcategoría &amp; Clave</th>
                            <th className="py-1.5 px-2">Área</th>
                            <th className="py-1.5 px-2">Técnicas que se fabrican</th>
                            <th className="py-1.5 px-2 text-center">Piezas en Catálogo</th>
                            <th className="py-1.5 px-2 text-right">Valor Acumulado</th>
                            <th className="py-1.5 px-2">Visibilidad</th>
                            <th className="py-1.5 px-3 text-right">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredCategories.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-6 text-center text-gray-400">
                                No se encontraron categorías con los filtros seleccionados.
                              </td>
                            </tr>
                          ) : (
                            filteredCategories.map(cat => {
                              const hasTechs = Object.values(cat.techCounts).some(v => v > 0);
                              return (
                                <tr key={cat.id} className="hover:bg-gray-50/80 transition-colors">
                                  <td className="py-1.5 px-3 font-bold text-[#1F2421]">
                                    <div>{cat.name}</div>
                                    <div className="text-[9.5px] text-gray-400 font-mono font-normal">{cat.id}</div>
                                  </td>

                                  <td className="py-1.5 px-2 text-gray-600 capitalize">
                                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                                      cat.worldId === 'hogar' ? 'bg-amber-100 text-amber-800' :
                                      cat.worldId === 'negocios' ? 'bg-blue-100 text-blue-800' :
                                      'bg-purple-100 text-purple-800'
                                    }`}>
                                      {cat.worldId}
                                    </span>
                                  </td>

                                  {/* Badges de Técnicas de Fabricación presentes */}
                                  <td className="py-1.5 px-2">
                                    <div className="flex flex-wrap items-center gap-1">
                                      {cat.techCounts['3d'] > 0 && (
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9.5px] font-bold">
                                          <span>🖨️</span> <span>3D: {cat.techCounts['3d']}</span>
                                        </span>
                                      )}
                                      {cat.techCounts.laser > 0 && (
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9.5px] font-bold">
                                          <span>🔥</span> <span>Láser: {cat.techCounts.laser}</span>
                                        </span>
                                      )}
                                      {cat.techCounts.sublimation > 0 && (
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[9.5px] font-bold">
                                          <span>🎨</span> <span>Sublimación: {cat.techCounts.sublimation}</span>
                                        </span>
                                      )}
                                      {cat.techCounts.vinyl > 0 && (
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 text-[9.5px] font-bold">
                                          <span>✂️</span> <span>Vinil: {cat.techCounts.vinyl}</span>
                                        </span>
                                      )}
                                      {cat.techCounts.nfc > 0 && (
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 text-[9.5px] font-bold">
                                          <span>📡</span> <span>NFC: {cat.techCounts.nfc}</span>
                                        </span>
                                      )}
                                      {!hasTechs && (
                                        <span className="text-[9.5px] text-gray-400 italic">Sin piezas asignadas</span>
                                      )}
                                    </div>
                                  </td>

                                  {/* Conteo de Piezas Activas */}
                                  <td className="py-1.5 px-2 text-center">
                                    {categoryTechnique !== 'all' ? (
                                      <div className="inline-flex flex-col items-center">
                                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-[#2D4F3E] text-white">
                                          {cat.matchingProductCount} con {techniqueList.find(t => t.id === categoryTechnique)?.shortLabel}
                                        </span>
                                        <span className="text-[9px] text-gray-400 mt-0.5">
                                          de {cat.actualProductCount} totales
                                        </span>
                                      </div>
                                    ) : (
                                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                        cat.actualProductCount > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                                      }`}>
                                        {cat.actualProductCount} productos
                                      </span>
                                    )}
                                  </td>

                                  {/* Valor en Catálogo */}
                                  <td className="py-1.5 px-2 text-right font-mono font-bold text-[#1F2421]">
                                    ${(categoryTechnique !== 'all' ? cat.matchingValue : cat.categoryTotalValue).toLocaleString('es-MX')}
                                  </td>

                                  {/* Visibilidad */}
                                  <td className="py-1.5 px-2">
                                    {cat.isHidden ? (
                                      <span className="text-gray-400 font-medium text-[10px]">Oculta manualmente</span>
                                    ) : cat.actualProductCount === 0 ? (
                                      <span className="text-amber-600 font-medium text-[10px]">Oculta (vacía)</span>
                                    ) : (
                                      <span className="text-emerald-700 font-medium text-[10px] flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                        <span>Visible</span>
                                      </span>
                                    )}
                                  </td>

                                  <td className="py-1.5 px-3 text-right">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleCategory(cat)}
                                      className="px-2 py-0.5 rounded border border-gray-200 text-[11px] font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
                                    >
                                      {cat.isHidden ? 'Mostrar' : 'Ocultar'}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                    <div>
                      <strong>Regla de catálogo automático:</strong> Las subcategorías sin productos publicados permanecen ocultas en la navegación pública de la tienda. Al asignarles un producto y publicarlo, se activarán de inmediato.
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: MÉTRICAS REALES */}
              {activeTab === 'stats' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl bg-white border border-[#E8E4DA] shadow-xs">
                      <div className="text-xs font-bold uppercase text-gray-400">Total Productos</div>
                      <div className="text-2xl font-black text-[#1F2421] mt-1">{analytics?.totalProducts || 0}</div>
                      <div className="text-[11px] text-emerald-600 mt-1">{analytics?.publishedProducts || 0} publicados</div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-[#E8E4DA] shadow-xs">
                      <div className="text-xs font-bold uppercase text-gray-400">Visitas a la Web</div>
                      <div className="text-2xl font-black text-[#2D4F3E] mt-1">{analytics?.pageViews || 0}</div>
                      <div className="text-[11px] text-gray-500 mt-1">Interacciones reales registradas</div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-[#E8E4DA] shadow-xs">
                      <div className="text-xs font-bold uppercase text-gray-400">Clics a WhatsApp</div>
                      <div className="text-2xl font-black text-emerald-600 mt-1">{analytics?.whatsappClicks || 0}</div>
                      <div className="text-[11px] text-gray-500 mt-1">Solicitudes de cotización abiertas</div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-[#E8E4DA] shadow-xs">
                      <div className="text-xs font-bold uppercase text-gray-400">Carritos Iniciados</div>
                      <div className="text-2xl font-black text-[#D82B6E] mt-1">{analytics?.quotesStarted || 0}</div>
                      <div className="text-[11px] text-gray-500 mt-1">Productos añadidos a cotización</div>
                    </div>
                  </div>

                  {/* Top viewed products */}
                  <div className="bg-white p-5 rounded-2xl border border-[#E8E4DA] space-y-3">
                    <h4 className="text-sm font-bold text-[#1F2421]">
                      Productos más consultados
                    </h4>
                    <div className="space-y-2">
                      {analytics?.productViews && Object.entries(analytics.productViews).map(([id, views]) => {
                        const prod = products.find(p => p.id === id);
                        return (
                          <div key={id} className="flex items-center justify-between text-xs py-2 border-b border-gray-100 last:border-none">
                            <span className="font-semibold text-gray-800">
                              {prod ? `[${prod.code}] ${prod.name}` : id}
                            </span>
                            <span className="font-bold text-[#2D4F3E] bg-[#F4F0E8] px-2.5 py-0.5 rounded-full">
                              {views} consultas
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* APARTADO: DELIMITADORES Y CONTROL DE OFERTAS FLASH POR ÁREA */}
                  <FlashDealsControlSection
                    products={products}
                    settings={businessSettings}
                    flashDeal={flashDeal}
                    token={token}
                    onRefreshCatalog={async () => {
                      await loadAllData();
                      if (onRefreshCatalog) onRefreshCatalog();
                    }}
                    onEditProduct={handleOpenEditProduct}
                  />
                </div>
              )}

              {/* TAB 4: DATOS DEL NEGOCIO */}
              {activeTab === 'settings' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* CARD DE GESTIÓN: DISPONIBILIDAD & COBERTURA DE SERVICIO (LOCAL, NACIONAL Y PAUSA) */}
                  <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-[#E8E4DA] shadow-xs space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0">
                          <Truck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm sm:text-base font-bold text-[#1F2421] font-heading">
                              Disponibilidad &amp; Cobertura de Servicio del Taller
                            </h4>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${serviceSummary.color}`}>
                              {serviceSummary.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Controla si aceptas entregas locales, envíos nacionales a toda la República o si el taller está en pausa temporal hasta cierta fecha.
                          </p>
                        </div>
                      </div>

                      {serviceStatusMsg.text && (
                        <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-in fade-in shrink-0 ${
                          serviceStatusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{serviceStatusMsg.text}</span>
                        </div>
                      )}
                    </div>

                    {/* 2 Columnas de Cobertura: Servicio Local y Servicio Nacional */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 1. SERVICIO LOCAL */}
                      <div className={`p-4 rounded-xl border transition-all ${
                        activeServiceStatus.localService
                          ? 'bg-emerald-50/40 border-emerald-200 shadow-2xs'
                          : 'bg-gray-50/70 border-gray-200 opacity-80'
                      }`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              activeServiceStatus.localService ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-500'
                            }`}>
                              <MapPin className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-gray-900">
                                Servicio &amp; Entregas Locales
                              </div>
                              <div className="text-[10.5px] text-gray-500">
                                Entregas y recolección en taller / zona metropolitana
                              </div>
                            </div>
                          </div>

                          {/* Toggle Switch */}
                          <button
                            type="button"
                            onClick={() => handleUpdateServiceStatus({ localService: !activeServiceStatus.localService })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                              activeServiceStatus.localService ? 'bg-[#2D4F3E]' : 'bg-gray-300'
                            }`}
                            title={activeServiceStatus.localService ? 'Desactivar servicio local' : 'Activar servicio local'}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                activeServiceStatus.localService ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-200/60 space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-gray-600">Estado en Tienda:</span>
                            <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                              activeServiceStatus.localService ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {activeServiceStatus.localService ? '● Activo en Tienda' : '○ Pausado / Desactivado'}
                            </span>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                              Detalles de entrega local (opcional):
                            </label>
                            <input
                              type="text"
                              value={activeServiceStatus.localDetails || ''}
                              onChange={(e) => setBusinessSettings({
                                ...businessSettings,
                                serviceStatus: {
                                  ...activeServiceStatus,
                                  localDetails: e.target.value
                                }
                              })}
                              onBlur={(e) => handleUpdateServiceStatus({ localDetails: e.target.value })}
                              placeholder="Ej. Entregas en taller o punto acordado en zona metropolitana"
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#2D4F3E]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 2. SERVICIO NACIONAL */}
                      <div className={`p-4 rounded-xl border transition-all ${
                        activeServiceStatus.nationalService
                          ? 'bg-blue-50/40 border-blue-200 shadow-2xs'
                          : 'bg-gray-50/70 border-gray-200 opacity-80'
                      }`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              activeServiceStatus.nationalService ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-500'
                            }`}>
                              <Truck className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-gray-900">
                                Servicio &amp; Envíos Nacionales
                              </div>
                              <div className="text-[10.5px] text-gray-500">
                                Envíos por paquetería a toda la República Mexicana
                              </div>
                            </div>
                          </div>

                          {/* Toggle Switch */}
                          <button
                            type="button"
                            onClick={() => handleUpdateServiceStatus({ nationalService: !activeServiceStatus.nationalService })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                              activeServiceStatus.nationalService ? 'bg-[#2D4F3E]' : 'bg-gray-300'
                            }`}
                            title={activeServiceStatus.nationalService ? 'Desactivar servicio nacional' : 'Activar servicio nacional'}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                activeServiceStatus.nationalService ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-200/60 space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-gray-600">Estado en Tienda:</span>
                            <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                              activeServiceStatus.nationalService ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {activeServiceStatus.nationalService ? '● Activo en Tienda' : '○ Pausado / Desactivado'}
                            </span>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                              Detalles de envío foráneo (opcional):
                            </label>
                            <input
                              type="text"
                              value={activeServiceStatus.nationalDetails || ''}
                              onChange={(e) => setBusinessSettings({
                                ...businessSettings,
                                serviceStatus: {
                                  ...activeServiceStatus,
                                  nationalDetails: e.target.value
                                }
                              })}
                              onBlur={(e) => handleUpdateServiceStatus({ nationalDetails: e.target.value })}
                              placeholder="Ej. Envíos con guía rastreable vía DHL, FedEx o Estafeta"
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#2D4F3E]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3. MODO PAUSA TEMPORAL / NO HAY SERVICIO HASTA X DÍA */}
                    <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      activeServiceStatus.isPaused
                        ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/20 shadow-xs'
                        : 'bg-gray-50/60 border-gray-200'
                    }`}>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-200/60 pb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            activeServiceStatus.isPaused ? 'bg-amber-500 text-white shadow-xs' : 'bg-gray-200 text-gray-500'
                          }`}>
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                              <span>Modo Suspensión Temporal de Taller</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                activeServiceStatus.isPaused ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-600'
                              }`}>
                                {activeServiceStatus.isPaused ? '⏸️ TALLER EN PAUSA' : '🟢 TALLER OPERANDO'}
                              </span>
                            </div>
                            <div className="text-[11px] text-gray-500 mt-0.5">
                              Activa este interruptor cuando no haya servicio hasta cierta fecha (vacaciones, mantenimiento o saturación de pedidos).
                            </div>
                          </div>
                        </div>

                        {/* Switch de Pausa */}
                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                          <span className="text-xs font-bold text-gray-700">
                            {activeServiceStatus.isPaused ? 'Pausa Activada' : 'Pausar Taller'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateServiceStatus({ isPaused: !activeServiceStatus.isPaused })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                              activeServiceStatus.isPaused ? 'bg-amber-600' : 'bg-gray-300'
                            }`}
                            title={activeServiceStatus.isPaused ? 'Reanudar taller' : 'Pausar servicio de taller'}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                activeServiceStatus.isPaused ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Campos condicionales cuando la pausa está activa */}
                      <div className={`mt-4 space-y-4 text-xs ${!activeServiceStatus.isPaused ? 'opacity-60 pointer-events-none' : ''}`}>
                        
                        {/* Selector de Fecha */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-1">
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">
                              📅 No hay servicio hasta el día:
                            </label>
                            <input
                              type="date"
                              value={activeServiceStatus.pausedUntilDate || ''}
                              onChange={(e) => handleUpdateServiceStatus({ pausedUntilDate: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-bold text-[#1F2421] focus:ring-1 focus:ring-[#2D4F3E]"
                            />
                            {activeServiceStatus.pausedUntilDate && (
                              <p className="text-[11px] font-bold text-[#9E472A] mt-1">
                                Reanudación: {formatServiceDate(activeServiceStatus.pausedUntilDate)}
                              </p>
                            )}
                          </div>

                          {/* Accesos Rápidos de Fecha */}
                          <div className="sm:col-span-2 space-y-1">
                            <label className="block text-[11px] font-bold text-gray-600 mb-1">
                              Atajos rápidos de fecha:
                            </label>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {[
                                { label: '+2 días', fn: () => getDatePlusDays(2) },
                                { label: '+3 días', fn: () => getDatePlusDays(3) },
                                { label: '+1 semana', fn: () => getDatePlusDays(7) },
                                { label: 'Próximo lunes', fn: () => getNextMondayDate() },
                                { label: 'Primer día próximo mes', fn: () => getNextMonthFirstDay() }
                              ].map((btn, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleUpdateServiceStatus({ pausedUntilDate: btn.fn() })}
                                  className="px-2.5 py-1 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-semibold text-[11px] cursor-pointer shadow-2xs"
                                >
                                  {btn.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Motivo de la Pausa con botones rápidos */}
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-bold text-gray-700">
                            Motivo principal del receso:
                          </label>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {[
                              { id: 'vacaciones', label: '🏖️ Vacaciones de taller' },
                              { id: 'mantenimiento', label: '🔧 Mantenimiento preventivo de maquinaria' },
                              { id: 'surtido', label: '📦 Resurtido de filamentos y materias primas' },
                              { id: 'saturacion', label: '⚡ Saturación de pedidos / Cupo completo' }
                            ].map(preset => (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => {
                                  const reasonText = preset.label;
                                  const dateText = activeServiceStatus.pausedUntilDate
                                    ? `el ${formatServiceDate(activeServiceStatus.pausedUntilDate)}`
                                    : 'próximamente';
                                  const customMsg = `Aviso de taller: Estamos en periodo de ${preset.label.slice(2).toLowerCase()}. No hay servicio de producción ni entregas hasta ${dateText}. Puedes dejar tu cotización y se agendará por orden de llegada.`;
                                  handleUpdateServiceStatus({
                                    pausedReason: reasonText,
                                    pausedCustomMessage: customMsg
                                  });
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                                  activeServiceStatus.pausedReason === preset.label
                                    ? 'bg-amber-100 text-amber-900 border-amber-400 font-extrabold shadow-2xs'
                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                }`}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Mensaje público personalizado para clientes */}
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">
                            Mensaje público visible en el banner de la tienda y cotizador:
                          </label>
                          <textarea
                            rows={2}
                            value={activeServiceStatus.pausedCustomMessage || ''}
                            onChange={(e) => setBusinessSettings({
                              ...businessSettings,
                              serviceStatus: {
                                ...activeServiceStatus,
                                pausedCustomMessage: e.target.value
                              }
                            })}
                            onBlur={(e) => handleUpdateServiceStatus({ pausedCustomMessage: e.target.value })}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-[#2D4F3E]"
                            placeholder="Describe el aviso que verán los clientes en la tienda..."
                          />
                        </div>

                        {/* Vista previa en vivo del banner */}
                        {activeServiceStatus.isPaused && (
                          <div className="p-3.5 rounded-xl bg-amber-100/70 border border-amber-300 text-amber-950 text-xs space-y-1">
                            <span className="text-[10px] uppercase tracking-wider font-black text-amber-800 block">
                              Vista Previa de cómo lo verán tus clientes en la tienda:
                            </span>
                            <div className="font-bold flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-amber-700 shrink-0" />
                              <span>
                                ⏸️ Aviso del Taller: No hay servicio hasta el {formatServiceDate(activeServiceStatus.pausedUntilDate) || '[Fecha seleccionada]'}
                              </span>
                            </div>
                            <p className="text-[11px] text-amber-900">
                              {activeServiceStatus.pausedCustomMessage || 'Reanudamos servicio en esa fecha. Las cotizaciones se agendan en orden de llegada.'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Business info form */}
                  <div className="bg-white p-6 rounded-2xl border border-[#E8E4DA] space-y-4">
                    <h4 className="text-sm font-bold text-[#1F2421] font-heading">
                      Configuración de Contacto & Cotización
                    </h4>
                    {businessSettings && (
                      <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
                        <div>
                          <label className="font-semibold text-gray-700 block mb-1">
                            WhatsApp del Negocio (con lada de país) *
                          </label>
                          <input
                            type="text"
                            value={businessSettings.whatsappNumber || ''}
                            onChange={e => setBusinessSettings({ ...businessSettings, whatsappNumber: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#2D4F3E]"
                            placeholder="5215500000000"
                          />
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            A este número llegarán todos los mensajes automáticos preparados por los clientes.
                          </p>
                        </div>

                        <div>
                          <label className="font-semibold text-gray-700 block mb-1">
                            Correo Electrónico
                          </label>
                          <input
                            type="email"
                            value={businessSettings.businessEmail || ''}
                            onChange={e => setBusinessSettings({ ...businessSettings, businessEmail: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#2D4F3E]"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-gray-700 block mb-1">
                            Zona de Servicio / Cobertura
                          </label>
                          <input
                            type="text"
                            value={businessSettings.serviceZone || ''}
                            onChange={e => setBusinessSettings({ ...businessSettings, serviceZone: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#2D4F3E]"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-gray-700 block mb-1">
                            Horario de Atención
                          </label>
                          <input
                            type="text"
                            value={businessSettings.businessHours || ''}
                            onChange={e => setBusinessSettings({ ...businessSettings, businessHours: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#2D4F3E]"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-gray-700 block mb-1">
                            Nota fija de cotización
                          </label>
                          <textarea
                            rows={2}
                            value={businessSettings.quoteNoteDefault || ''}
                            onChange={e => setBusinessSettings({ ...businessSettings, quoteNoteDefault: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#2D4F3E]"
                          />
                        </div>

                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-[#2D4F3E] text-white font-bold hover:bg-[#20392C]"
                        >
                          Guardar Configuración
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Security / Password form */}
                  <div className="bg-white p-6 rounded-2xl border border-[#E8E4DA] space-y-4">
                    <h4 className="text-sm font-bold text-[#1F2421] font-heading flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-amber-600" />
                      <span>Cambio de Contraseña de Administrador</span>
                    </h4>

                    {passwordMsg.text && (
                      <div className={`p-3 rounded-xl text-xs font-medium ${
                        passwordMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                      }`}>
                        {passwordMsg.text}
                      </div>
                    )}

                    <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
                      <div>
                        <label className="font-semibold text-gray-700 block mb-1">
                          Contraseña Actual
                        </label>
                        <input
                          type="password"
                          required
                          value={passwordForm.currentPassword}
                          onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#2D4F3E]"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-gray-700 block mb-1">
                          Nueva Contraseña (mínimo 12 caracteres)
                        </label>
                        <input
                          type="password"
                          required
                          value={passwordForm.newPassword}
                          minLength={12}
                          onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#2D4F3E]"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-gray-900 text-white font-bold hover:bg-black"
                      >
                        Actualizar Contraseña
                      </button>
                    </form>
                  </div>
                </div>
              )}

            </main>
          </div>
        )}

      </div>
    </div>

      {/* FULL PRODUCT & PACKAGE EDITOR MODAL (Top-Level Viewport Overlay z-[70]) */}
      {isEditorOpen && editorForm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-6xl max-h-[94vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#E8E4DA]"
            onClick={e => e.stopPropagation()}
          >
            {/* Editor Header */}
            <div className="px-5 py-3.5 bg-[#FBF9F5] border-b border-[#E8E4DA] flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="p-2 rounded-xl bg-[#2D4F3E] text-white shrink-0">
                  <Package className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#1F2421] font-heading truncate">
                      {editingProduct
                        ? (editorForm.isBundle ? `Editar Paquete: ${editorForm.name || 'Combo'}` : `Editar Producto: ${editorForm.name || 'Producto'}`)
                        : (editorForm.isBundle ? 'Crear Nuevo Paquete / Combo' : 'Crear Nuevo Producto')}
                    </h3>
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded-lg bg-[#2D4F3E]/10 text-[#2D4F3E] border border-[#2D4F3E]/20 shrink-0">
                      {editorForm.code || editorForm.sku || 'NUEVO-PRODUCTO'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 truncate">
                    {editorForm.name || 'Sin título especificado'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold ${
                  editorForm.status === 'published'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {editorForm.status === 'published' ? '● Publicado en Tienda' : '○ En Borrador'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                  title="Cerrar ventana"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Editor Body: Grid de 2 Columnas (Izquierda: Visor Visual | Derecha: Formulario Ergonómico) */}
            <form onSubmit={handleSaveProduct} noValidate className="flex-1 overflow-y-auto flex flex-col">
              
              {editorMessage.text && (
                <div className={`mx-6 mt-4 p-3 rounded-xl font-medium text-xs ${
                  editorMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {editorMessage.text}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 sm:p-6">
                
                {/* ======================================================== */}
                {/* COLUMNA IZQUIERDA: VISOR FOTOGRÁFICO Y MINIATURAS (5 col) */}
                {/* ======================================================== */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  
                  {/* Visor Grande de la Fotografía Activa */}
                  {(() => {
                    // Resolver URL de la toma activa
                    let activeImgUrl = '';
                    let slotName = '🌿 Toma 1 • Portada en Ambiente Real';
                    let slotKey = 'portada';

                    if (editorActiveSlot === 0) {
                      activeImgUrl = editorForm.primaryImage || editorForm.gallery?.[0] || '';
                      slotName = '🌿 Toma 1 • En Ambiente Real';
                      slotKey = 'portada';
                    } else if (editorActiveSlot === 1) {
                      activeImgUrl = editorForm.whiteBgImage || editorForm.gallery?.[1] || '';
                      slotName = '📦 Toma 2 • Fondo Blanco Puro (#FFFFFF)';
                      slotKey = 'blanco';
                    } else if (editorActiveSlot === 2) {
                      activeImgUrl = editorForm.detailImage || editorForm.gallery?.[2] || '';
                      slotName = '🔍 Toma 3 • Detalle y Macro';
                      slotKey = 'detalle';
                    } else if (editorActiveSlot === 3) {
                      activeImgUrl = editorForm.measureImage || editorForm.gallery?.[3] || '';
                      slotName = '📐 Toma 4 • Medidas y Escala';
                      slotKey = 'escala';
                    } else {
                      activeImgUrl = editorForm.gallery?.[editorActiveSlot] || '';
                      slotName = `✨ Toma Adicional #${editorActiveSlot + 1}`;
                      slotKey = editorActiveSlot;
                    }

                    const fallbackImg = '/uploads/bandeja_vaciabolsillos_ovalada_white.jpg';

                    return (
                      <div className="space-y-3">
                        <div className="relative rounded-3xl overflow-hidden border-2 border-stone-200 bg-stone-100 aspect-square shadow-md group flex items-center justify-center">
                          <img
                            src={activeImgUrl || fallbackImg}
                            alt="Fotografía activa del producto"
                            className="w-full h-full object-contain p-2 bg-white"
                          />

                          {/* Badge de Posición Fotográfica */}
                          <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-bold shadow-sm pointer-events-none flex items-center gap-1.5">
                            <span>{slotName}</span>
                          </div>

                          {/* Botón Flotante para Subir o Cambiar Foto de esta Toma */}
                          <div className="absolute bottom-3 right-3 flex items-center gap-2">
                            <label className="px-3.5 py-2 rounded-xl bg-[#2D4F3E] hover:bg-[#20392C] text-white text-xs font-bold cursor-pointer transition-all shadow-lg flex items-center gap-1.5 active:scale-95">
                              <Upload className="w-3.5 h-3.5" />
                              <span>{uploadingImage === slotKey ? 'Subiendo...' : 'Subir foto'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={e => handleUploadSlot(slotKey, e)}
                                disabled={uploadingImage === slotKey}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>

                        {/* Input de URL directa para la toma activa */}
                        <div className="flex items-center gap-1.5 bg-stone-50 p-2 rounded-xl border border-stone-200">
                          <span className="text-[10px] font-bold text-stone-500 uppercase shrink-0">Ruta:</span>
                          <input
                            type="text"
                            value={activeImgUrl}
                            onChange={e => handleUpdateSlotUrl(slotKey, e.target.value)}
                            placeholder="/uploads/... o https://..."
                            className="flex-1 px-2 py-1 text-xs font-mono rounded-lg border border-gray-200 bg-white"
                          />
                          {activeImgUrl && (
                            <button
                              type="button"
                              onClick={() => handleUpdateSlotUrl(slotKey, '')}
                              className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                              title="Limpiar imagen"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* 4 Miniaturas Táctiles del Estándar Oficial de Catálogo */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                      <span>Estándar Oficial de 4 Fotografías:</span>
                      <span className="text-[10px] text-gray-400">Toca una miniatura para verla</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {[
                        {
                          idx: 0,
                          key: 'portada',
                          label: '1. Portada / En Contexto Real',
                          shortLabel: 'En contexto',
                          icon: '🌿',
                          src: editorForm.primaryImage || editorForm.gallery?.[0]
                        },
                        {
                          idx: 1,
                          key: 'blanco',
                          label: '2. Fondo Blanco Puro (#FFFFFF)',
                          shortLabel: 'Fondo blanco',
                          icon: '📦',
                          src: editorForm.whiteBgImage || editorForm.gallery?.[1]
                        },
                        {
                          idx: 2,
                          key: 'detalle',
                          label: '3. Detalle y Cualidades',
                          shortLabel: 'Detalle',
                          icon: '🔍',
                          src: editorForm.detailImage || editorForm.gallery?.[2]
                        },
                        {
                          idx: 3,
                          key: 'escala',
                          label: '4. Medidas y Escala',
                          shortLabel: 'Medidas & escala',
                          icon: '📐',
                          src: editorForm.measureImage || editorForm.gallery?.[3]
                        }
                      ].map(slot => {
                        const isSelected = editorActiveSlot === slot.idx;
                        const hasImg = Boolean(slot.src);
                        return (
                          <div key={slot.idx} className="flex flex-col gap-1">
                            <button
                              type="button"
                              onClick={() => setEditorActiveSlot(slot.idx)}
                              className={`p-1.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center gap-1 text-center relative w-full ${
                                isSelected
                                  ? 'border-[#2D4F3E] bg-[#FAF9F5] ring-2 ring-[#2D4F3E]/20 shadow-xs'
                                  : 'border-stone-200 bg-white hover:border-stone-300'
                              }`}
                            >
                              <div className="w-full aspect-square rounded-xl overflow-hidden bg-stone-100 flex items-center justify-center border border-stone-100">
                                {hasImg ? (
                                  <img
                                    src={slot.src}
                                    alt={slot.label}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-sm opacity-50">{slot.icon}</span>
                                )}
                              </div>
                              <span className={`text-[10px] font-bold line-clamp-1 ${
                                isSelected ? 'text-[#2D4F3E]' : 'text-gray-600'
                              }`}>
                                {slot.shortLabel}
                              </span>
                              {hasImg && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1 right-1 border border-white" />
                              )}
                            </button>

                            {/* Subida rápida independiente de slot */}
                            <label className="text-[9.5px] font-semibold text-center text-[#2D4F3E] hover:underline cursor-pointer block truncate" title={slot.label}>
                              <span>Subir</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={e => {
                                  if (slot.key === 'portada') handleUploadSlot('portada', e);
                                  else if (slot.key === 'blanco') handleUploadSlot('blanco', e);
                                  else if (slot.key === 'detalle') handleUploadSlot('detalle', e);
                                  else if (slot.key === 'escala') handleUploadSlot('escala', e);
                                  else handleUploadSlot(slot.key, e);
                                }}
                                disabled={uploadingImage === slot.key}
                                className="hidden"
                              />
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Resumen Visual de Taller para Identificación Inmediata */}
                  <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-stone-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Identificador de Taller:</span>
                      <span className="font-mono text-xs font-black text-[#2D4F3E]">
                        {editorForm.sku || editorForm.code}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-xl bg-white border border-stone-200">
                        <span className="text-[9px] font-bold text-gray-400 block uppercase">Áreas activas</span>
                        <span className="font-bold text-gray-800">
                          {editorForm.worlds?.length ? editorForm.worlds.join(', ') : 'Ninguna'}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-stone-200">
                        <span className="text-[9px] font-bold text-gray-400 block uppercase">Técnicas</span>
                        <span className="font-bold text-emerald-800">
                          {editorForm.techniques?.length ? editorForm.techniques.join(', ') : '3D'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Fotografías adicionales ilimitadas para paquetes y servicios */}
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-800">
                        fotografías adicionales ilimitadas para paquetes y servicios
                      </span>
                      <button
                        type="button"
                        onClick={handleAddExtraImage}
                        className="px-2.5 py-1 rounded-lg bg-[#2D4F3E] text-white text-[11px] font-bold hover:bg-[#20392C] transition-colors cursor-pointer"
                      >
                        + Agregar otra fotografía
                      </button>
                    </div>

                    {editorForm.gallery && editorForm.gallery.length > 4 ? (
                      <div className="grid grid-cols-4 gap-2 pt-1">
                        {editorForm.gallery.slice(4).map((extraUrl, idx) => {
                          const actualIndex = 4 + idx;
                          return (
                            <div
                              key={actualIndex}
                              onClick={() => setEditorActiveSlot(actualIndex)}
                              className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer ${
                                editorActiveSlot === actualIndex ? 'border-[#2D4F3E] ring-2 ring-[#2D4F3E]/20' : 'border-stone-200'
                              }`}
                            >
                              <img src={extraUrl || '/uploads/bandeja_vaciabolsillos_ovalada_white.jpg'} alt="" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleRemoveExtraImage(actualIndex); }}
                                className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-rose-600 text-white cursor-pointer"
                                title="Eliminar foto adicional"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[11px] text-gray-400 italic">
                        Solo tiene las 4 fotos base. Pulsa "+ Agregar otra fotografía" para sumar más tomas de este paquete o servicio.
                      </p>
                    )}
                  </div>
                </div>

                {/* ======================================================== */}
                {/* COLUMNA DERECHA: CAMPOS ESENCIALES Y AMIGABLES (7 col)  */}
                {/* ======================================================== */}
                <div className="lg:col-span-7 flex flex-col gap-4 text-xs">
                  
                  {/* 1. Nombre del Producto y Estado */}
                  <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-stone-200 space-y-3">
                    <div>
                      <label className="font-bold text-gray-800 block mb-1 text-xs">Nombre del Producto *</label>
                      <input
                        type="text"
                        required
                        value={editorForm.name}
                        onChange={e => setEditorForm({ ...editorForm, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-bold text-sm text-gray-900 bg-white focus:ring-1 focus:ring-[#2D4F3E]"
                        placeholder="Ej. Bandeja vaciabolsillos ovalada"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="font-bold text-gray-700 block mb-1 text-[11px]">Estado de Publicación</label>
                        <select
                          value={editorForm.status}
                          onChange={e => setEditorForm({ ...editorForm, status: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-semibold"
                        >
                          <option value="published">🟢 Publicado (visible en tienda)</option>
                          <option value="draft">🟡 Borrador (oculto en tienda)</option>
                          <option value="archived">⚪ Archivado</option>
                        </select>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 pt-3 sm:col-span-2">
                        <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800 select-none">
                          <input
                            type="checkbox"
                            checked={!!editorForm.featured}
                            onChange={e => setEditorForm({ ...editorForm, featured: e.target.checked })}
                            className="w-4 h-4 rounded text-[#2D4F3E] focus:ring-0"
                          />
                          <span>⭐ Destacar en Inicio &amp; Catálogo</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer font-bold text-purple-900 select-none bg-purple-50 px-2.5 py-1 rounded-xl border border-purple-200">
                          <input
                            type="checkbox"
                            checked={!!editorForm.isBundle}
                            onChange={e => {
                              const checked = e.target.checked;
                              const worlds = editorForm.worlds || [];
                              const newWorlds = checked
                                ? (worlds.includes('paquetes') ? worlds : [...worlds, 'paquetes'])
                                : worlds;
                              setEditorForm({
                                ...editorForm,
                                isBundle: checked,
                                worlds: newWorlds,
                                priceUnit: checked ? 'combo' : (editorForm.priceUnit === 'combo' ? 'pieza' : editorForm.priceUnit)
                              });
                            }}
                            className="w-4 h-4 rounded text-purple-700 focus:ring-0"
                          />
                          <span>🎁 Es un Paquete o Combo Promocional</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* 2. Tarjeta Ergonómica de Precio, Costo, Margen y Stock Físico */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-[#F4F9F5] to-emerald-50/50 border border-emerald-200/90 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      
                      {/* Precio de Venta */}
                      <div>
                        <label className="font-bold text-gray-800 block mb-1 text-[11px]">Precio de Venta ($ MXN)</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            disabled={editorForm.priceType === 'quote'}
                            value={editorForm.price ?? ''}
                            onChange={e => setEditorForm({ ...editorForm, price: e.target.value ? Number(e.target.value) : null })}
                            className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-black text-sm text-[#2D4F3E]"
                            placeholder="149"
                          />
                          <select
                            value={['pieza', 'lote', 'paquete', 'docena', 'combo'].includes(editorForm.priceUnit) ? editorForm.priceUnit : 'custom'}
                            onChange={e => {
                              if (e.target.value !== 'custom') {
                                setEditorForm({ ...editorForm, priceUnit: e.target.value });
                              }
                            }}
                            className="px-2 py-2 rounded-xl border border-gray-300 bg-white font-semibold text-xs"
                          >
                            <option value="pieza">/ pza</option>
                            <option value="lote">/ lote</option>
                            <option value="paquete">/ paq</option>
                            <option value="combo">/ combo</option>
                          </select>
                        </div>
                      </div>

                      {/* Stock Físico */}
                      <div>
                        <label className="font-bold text-gray-800 block mb-1 text-[11px] flex items-center justify-between">
                          <span>Piezas Físicas (Stock)</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            editorForm.availability === 'in_stock' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {editorForm.availability === 'in_stock' ? 'Inmediato' : 'Bajo Pedido'}
                          </span>
                        </label>
                        <div className="flex items-center border border-gray-300 rounded-xl bg-white overflow-hidden shadow-2xs">
                          <button
                            type="button"
                            onClick={() => {
                              const currentQty = Math.max(0, (Number(editorForm.stockQuantity) || 0) - 1);
                              setEditorForm({
                                ...editorForm,
                                stockQuantity: currentQty,
                                availability: currentQty > 0 ? 'in_stock' : 'made_to_order'
                              });
                            }}
                            className="px-2.5 py-2 text-gray-500 hover:bg-gray-100 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={editorForm.stockQuantity ?? 0}
                            onChange={e => {
                              const val = Math.max(0, parseInt(e.target.value) || 0);
                              setEditorForm({
                                ...editorForm,
                                stockQuantity: val,
                                availability: val > 0 ? 'in_stock' : 'made_to_order'
                              });
                            }}
                            className="w-full text-center font-mono font-bold text-xs text-gray-800 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const currentQty = (Number(editorForm.stockQuantity) || 0) + 1;
                              setEditorForm({
                                ...editorForm,
                                stockQuantity: currentQty,
                                availability: 'in_stock'
                              });
                            }}
                            className="px-2.5 py-2 text-gray-500 hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Costo Unitario */}
                      <div>
                        <label className="font-bold text-gray-800 block mb-1 text-[11px]">Costo Producción ($ MXN)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-xs font-bold text-gray-400">$</span>
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            value={editorForm.costPrice ?? ''}
                            onChange={e => setEditorForm({ ...editorForm, costPrice: e.target.value ? parseFloat(e.target.value) : 0 })}
                            className="w-full pl-6 pr-3 py-2 rounded-xl border border-gray-300 bg-white font-mono font-bold text-xs text-gray-800"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                    </div>

                    {/* Resumen de Margen de Ganancia */}
                    {editorForm.price && Number(editorForm.price) > 0 && editorForm.costPrice !== undefined && (
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-emerald-200/60 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 font-medium">Margen financiero:</span>
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                            (Number(editorForm.price) - Number(editorForm.costPrice)) / Number(editorForm.price) >= 0.4
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            Ganancia: ${(Number(editorForm.price) - Number(editorForm.costPrice)).toFixed(1)} MXN ({Math.round(((Number(editorForm.price) - Number(editorForm.costPrice)) / Number(editorForm.price)) * 100)}%)
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenCostBreakdown({
                            ...editorForm,
                            id: editingProduct?.id,
                            name: editorForm.name || 'Nuevo Producto'
                          })}
                          className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 hover:bg-emerald-50 text-[11px] font-bold text-emerald-800 flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                        >
                          <Calculator className="w-3 h-3" />
                          <span>Desglosar en Taller</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* CONFIGURACIÓN EXCLUSIVA DE PAQUETE O COMBO PROMOCIONAL */}
                  {editorForm.isBundle && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50/80 via-[#FAF9F5] to-amber-50/50 border-2 border-purple-300/90 space-y-3.5 shadow-xs">
                      <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-xl bg-purple-100 text-purple-700">
                            <Boxes className="w-4 h-4" />
                          </span>
                          <div>
                            <h4 className="font-heading font-extrabold text-xs text-purple-950 flex items-center gap-1.5">
                              <span>Cualidades de Paquete &amp; Combo Promocional</span>
                              <span className="px-2 py-0.2 rounded-full bg-purple-200 text-purple-900 text-[9.5px] font-bold">
                                Combo Activo
                              </span>
                            </h4>
                            <p className="text-[10.5px] text-gray-500">
                              Define qué piezas incluye el combo y el ahorro que verá el cliente
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Precios de Lista y Ahorro */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="font-bold text-gray-700 block mb-1 text-[11px]">
                            Precio Regular de Lista ($ MXN)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={editorForm.regularPrice ?? ''}
                            onChange={e => {
                              const reg = e.target.value ? Number(e.target.value) : 0;
                              const curPrice = Number(editorForm.price) || 0;
                              setEditorForm({
                                ...editorForm,
                                regularPrice: reg,
                                savings: Math.max(0, reg - curPrice)
                              });
                            }}
                            className="w-full px-3 py-1.5 rounded-xl border border-gray-300 bg-white font-mono font-bold text-xs text-gray-800"
                            placeholder="Ej: 649"
                          />
                          <span className="text-[9.5px] text-gray-400">Suma del precio individual</span>
                        </div>

                        <div>
                          <label className="font-bold text-gray-700 block mb-1 text-[11px]">
                            Ahorro para el Cliente ($ MXN)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={editorForm.savings ?? ''}
                            onChange={e => setEditorForm({ ...editorForm, savings: e.target.value ? Number(e.target.value) : 0 })}
                            className="w-full px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50/50 font-mono font-bold text-xs text-emerald-800"
                            placeholder="Ej: 150"
                          />
                          <span className="text-[9.5px] text-emerald-700 font-semibold">
                            {editorForm.regularPrice && editorForm.price
                              ? `-${Math.round((((Number(editorForm.regularPrice) - Number(editorForm.price)) / Number(editorForm.regularPrice)) * 100))}% de descuento aplicado`
                              : 'Descuento visible'}
                          </span>
                        </div>

                        <div>
                          <label className="font-bold text-gray-700 block mb-1 text-[11px]">
                            Tipo de Presentación
                          </label>
                          <div className="flex items-center gap-1.5 pt-1">
                            <span className="px-2.5 py-1.5 rounded-xl bg-purple-100 text-purple-900 font-bold text-xs flex items-center gap-1">
                              <span>🎁</span>
                              <span>Combo Multitécnica</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Lista Interactiva de Piezas Incluidas */}
                      <div className="space-y-2 pt-1 border-t border-purple-100">
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-purple-950 text-[11px] uppercase tracking-wider flex items-center gap-1">
                            <span>📦 Componentes y Piezas Incluidas ({(editorForm.includedItems || []).length} piezas):</span>
                          </label>
                          <span className="text-[10px] text-gray-400">Aparecen en viñetas destacadas en la tienda</span>
                        </div>

                        {/* Lista actual de piezas */}
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                          {(editorForm.includedItems || []).length === 0 ? (
                            <p className="text-[11px] text-gray-400 italic p-2 bg-white rounded-xl border border-dashed border-gray-200">
                              No hay piezas agregadas a este paquete aún. Usa el campo de abajo para agregar las piezas que contiene el combo.
                            </p>
                          ) : (
                            (editorForm.includedItems || []).map((item, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-stone-200 shadow-2xs">
                                <span className="w-5 h-5 rounded-full bg-[#2D4F3E] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                                  {idx + 1}
                                </span>
                                <input
                                  type="text"
                                  value={item}
                                  onChange={e => handleUpdateIncludedItem(idx, e.target.value)}
                                  className="flex-1 px-2 py-1 text-xs rounded-lg border border-transparent hover:border-gray-300 focus:border-[#2D4F3E] bg-transparent focus:bg-white font-medium"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveIncludedItem(idx)}
                                  className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                                  title="Eliminar pieza del paquete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Input para agregar nueva pieza */}
                        <div className="flex items-center gap-1.5 pt-1">
                          <input
                            type="text"
                            value={newIncludedItemInput}
                            onChange={e => setNewIncludedItemInput(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddIncludedItem();
                              }
                            }}
                            placeholder="Ej: 1 Bandeja vaciabolsillos curva ergonómica (18 x 12 cm)..."
                            className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-gray-300 bg-white"
                          />
                          <button
                            type="button"
                            onClick={handleAddIncludedItem}
                            className="px-3.5 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-2xs shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Agregar Pieza</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. Descripciones Breve y Completa */}
                  <div className="space-y-2">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1 text-[11px]">Descripción Breve (1 línea para catálogo)</label>
                      <input
                        type="text"
                        value={editorForm.shortDescription || ''}
                        onChange={e => setEditorForm({ ...editorForm, shortDescription: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                        placeholder="Resumen atractivo en una línea..."
                      />
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1 text-[11px]">Descripción Completa (para la ficha detallada)</label>
                      <textarea
                        rows={2}
                        value={editorForm.fullDescription || ''}
                        onChange={e => setEditorForm({ ...editorForm, fullDescription: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                        placeholder="Detalles sobre materiales, ventajas y personalización..."
                      />
                    </div>
                  </div>

                  {/* 4. Delimitador de Áreas de Activación y Técnicas */}
                  <div className="p-3.5 bg-[#FAF9F5] rounded-2xl border border-stone-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-[#1F2421] text-xs uppercase tracking-wider font-heading flex items-center gap-1.5">
                        <span>🏷️</span>
                        <span>Delimitador de Áreas de Activación del Producto *</span>
                      </label>
                      <span className="text-[10.5px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.2 rounded-full">
                        {(editorForm.worlds?.length || 0)} de 4 áreas activadas
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'hogar', label: 'Hogar', icon: '🏠' },
                        { id: 'negocios', label: 'Negocios', icon: '💼' },
                        { id: 'eventos', label: 'Eventos', icon: '🎉' },
                        { id: 'paquetes', label: 'Paquetes', icon: '🎁' }
                      ].map(w => {
                        const isChecked = editorForm.worlds?.includes(w.id);
                        return (
                          <button
                            key={w.id}
                            type="button"
                            onClick={() => {
                              const curr = editorForm.worlds || [];
                              const updated = isChecked ? curr.filter(x => x !== w.id) : [...curr, w.id];
                              setEditorForm({
                                ...editorForm,
                                worlds: updated,
                                isBundle: updated.includes('paquetes') ? true : editorForm.isBundle
                              });
                            }}
                            className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-left ${
                              isChecked
                                ? 'bg-white border-[#2D4F3E] text-[#2D4F3E] ring-1 ring-[#2D4F3E]/20 shadow-xs'
                                : 'bg-stone-50 border-stone-200 text-gray-500 hover:bg-white'
                            }`}
                          >
                            <span className="font-bold text-xs flex items-center gap-1">
                              <span>{w.icon}</span>
                              <span>{w.label}</span>
                            </span>
                            <div className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] font-black ${
                              isChecked ? 'bg-[#2D4F3E] text-white' : 'border border-gray-300'
                            }`}>
                              {isChecked && '✓'}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Técnicas de Fabricación */}
                    <div className="pt-2 border-t border-stone-200 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase mr-1">Técnicas:</span>
                      {[
                        { id: '3d', label: 'Impresión 3D' },
                        { id: 'laser', label: 'Corte/Grabado Láser' },
                        { id: 'sublimation', label: 'Sublimación' },
                        { id: 'vinyl', label: 'Vinil' },
                        { id: 'nfc', label: 'NFC' }
                      ].map(tech => {
                        const isChecked = editorForm.techniques?.includes(tech.id);
                        return (
                          <button
                            key={tech.id}
                            type="button"
                            onClick={() => {
                              const curr = editorForm.techniques || [];
                              const updated = isChecked ? curr.filter(x => x !== tech.id) : [...curr, tech.id];
                              setEditorForm({ ...editorForm, techniques: updated });
                            }}
                            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
                              isChecked
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                : 'bg-white border-stone-200 text-gray-500 hover:border-stone-300'
                            }`}
                          >
                            {isChecked ? '✓ ' : '+ '}
                            {tech.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 5. Acordeón: Sistema Estandarizado de SKU de Taller & Ficha Técnica */}
                  <div className="rounded-2xl border border-[#D4A359]/60 bg-gradient-to-r from-stone-50 via-[#FAF9F5] to-amber-50/30 overflow-hidden shadow-2xs">
                    <div
                      onClick={() => setEditorSkuAccordion(prev => !prev)}
                      className="p-3.5 flex items-center justify-between cursor-pointer select-none hover:bg-black/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[#2D4F3E]" />
                        <div>
                          <h4 className="font-heading font-black text-xs text-[#1F2421] flex items-center gap-2">
                            <span>Sistema Estandarizado de SKU de Taller</span>
                            <span className="text-[10px] font-mono px-2 py-0.2 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                              {editorForm.sku || editorForm.code}
                            </span>
                          </h4>
                          <span className="text-[10.5px] text-gray-500">
                            Cualidades de maquinaria, material y acabado para bodega y operadores
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const auto = suggestSkuForProduct(editorForm, products);
                            const parsed = parseSku(auto);
                            setEditorForm({
                              ...editorForm,
                              code: auto,
                              sku: auto,
                              skuArea: parsed.area?.code || 'HOG',
                              skuTechnique: parsed.tech?.code || '3D',
                              skuMaterial: parsed.mat?.code || 'PLA',
                              skuFinish: parsed.fin?.code || 'MAT',
                              skuSequence: parsed.sequence || '001'
                            });
                          }}
                          className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#D4A359] to-amber-500 text-[#17251E] font-black text-[11px] hover:brightness-105 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                          title="Calcular automáticamente el SKU óptimo a partir de las técnicas y materiales"
                        >
                          <Zap className="w-3 h-3" />
                          <span>Autogenerar SKU Inteligente</span>
                        </button>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${editorSkuAccordion ? 'rotate-180' : ''}`} />
                      </div>
                    </div>

                    {/* Contenido desplegable del SKU */}
                    {editorSkuAccordion && (
                      <div className="p-3.5 pt-0 border-t border-[#E8E4DA] space-y-3">
                        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2">
                          {/* 1. Área */}
                          <div>
                            <label className="text-[9.5px] font-bold text-gray-700 uppercase block mb-1">1. Área</label>
                            <select
                              value={editorForm.skuArea || 'HOG'}
                              onChange={e => {
                                const val = e.target.value;
                                const newSku = buildSku({
                                  area: val,
                                  technique: editorForm.skuTechnique || '3D',
                                  material: editorForm.skuMaterial || 'PLA',
                                  finish: editorForm.skuFinish || 'MAT',
                                  sequence: editorForm.skuSequence || '001'
                                });
                                setEditorForm({ ...editorForm, skuArea: val, code: newSku, sku: newSku });
                              }}
                              className="w-full px-2 py-1.5 rounded-lg border border-gray-300 bg-white font-bold text-[11px]"
                            >
                              {Object.values(SKU_AREAS).map(a => (
                                <option key={a.code} value={a.code}>{a.icon} {a.code}</option>
                              ))}
                            </select>
                          </div>

                          {/* 2. Técnica */}
                          <div>
                            <label className="text-[9.5px] font-bold text-gray-700 uppercase block mb-1">2. Técnica</label>
                            <select
                              value={editorForm.skuTechnique || '3D'}
                              onChange={e => {
                                const val = e.target.value;
                                const newSku = buildSku({
                                  area: editorForm.skuArea || 'HOG',
                                  technique: val,
                                  material: editorForm.skuMaterial || 'PLA',
                                  finish: editorForm.skuFinish || 'MAT',
                                  sequence: editorForm.skuSequence || '001'
                                });
                                setEditorForm({ ...editorForm, skuTechnique: val, code: newSku, sku: newSku });
                              }}
                              className="w-full px-2 py-1.5 rounded-lg border border-gray-300 bg-white font-bold text-[11px]"
                            >
                              {Object.values(SKU_TECHNIQUES).map(t => (
                                <option key={t.code} value={t.code}>{t.icon} {t.code}</option>
                              ))}
                            </select>
                          </div>

                          {/* 3. Material */}
                          <div>
                            <label className="text-[9.5px] font-bold text-gray-700 uppercase block mb-1">3. Material</label>
                            <select
                              value={editorForm.skuMaterial || 'PLA'}
                              onChange={e => {
                                const val = e.target.value;
                                const newSku = buildSku({
                                  area: editorForm.skuArea || 'HOG',
                                  technique: editorForm.skuTechnique || '3D',
                                  material: val,
                                  finish: editorForm.skuFinish || 'MAT',
                                  sequence: editorForm.skuSequence || '001'
                                });
                                setEditorForm({ ...editorForm, skuMaterial: val, code: newSku, sku: newSku });
                              }}
                              className="w-full px-2 py-1.5 rounded-lg border border-gray-300 bg-white font-bold text-[11px]"
                            >
                              {Object.values(SKU_MATERIALS).map(m => (
                                <option key={m.code} value={m.code}>🪵 {m.code}</option>
                              ))}
                            </select>
                          </div>

                          {/* 4. Acabado */}
                          <div>
                            <label className="text-[9.5px] font-bold text-gray-700 uppercase block mb-1">4. Acabado</label>
                            <select
                              value={editorForm.skuFinish || 'MAT'}
                              onChange={e => {
                                const val = e.target.value;
                                const newSku = buildSku({
                                  area: editorForm.skuArea || 'HOG',
                                  technique: editorForm.skuTechnique || '3D',
                                  material: editorForm.skuMaterial || 'PLA',
                                  finish: val,
                                  sequence: editorForm.skuSequence || '001'
                                });
                                setEditorForm({ ...editorForm, skuFinish: val, code: newSku, sku: newSku });
                              }}
                              className="w-full px-2 py-1.5 rounded-lg border border-gray-300 bg-white font-bold text-[11px]"
                            >
                              {Object.values(SKU_FINISHES).map(f => (
                                <option key={f.code} value={f.code}>✨ {f.code}</option>
                              ))}
                            </select>
                          </div>

                          {/* 5. Número / Serie */}
                          <div>
                            <label className="text-[9.5px] font-bold text-gray-700 uppercase block mb-1">5. Serie</label>
                            <input
                              type="text"
                              value={editorForm.skuSequence || '001'}
                              onChange={e => {
                                const val = e.target.value;
                                const newSku = buildSku({
                                  area: editorForm.skuArea || 'HOG',
                                  technique: editorForm.skuTechnique || '3D',
                                  material: editorForm.skuMaterial || 'PLA',
                                  finish: editorForm.skuFinish || 'MAT',
                                  sequence: val
                                });
                                setEditorForm({ ...editorForm, skuSequence: val, code: newSku, sku: newSku });
                              }}
                              className="w-full px-2 py-1.5 rounded-lg border border-gray-300 bg-white font-mono font-bold text-[11px] text-center"
                              placeholder="001"
                            />
                          </div>

                          {/* 6. Código / SKU Final */}
                          <div>
                            <label className="text-[9.5px] font-bold text-gray-700 uppercase block mb-1">SKU Final *</label>
                            <input
                              type="text"
                              value={editorForm.code || ''}
                              onChange={e => {
                                const val = e.target.value.toUpperCase();
                                setEditorForm({ ...editorForm, code: val, sku: val });
                              }}
                              className="w-full px-2 py-1.5 rounded-lg border-2 border-[#2D4F3E] bg-white font-mono font-black text-[11px] text-[#2D4F3E]"
                              placeholder="HOG-3D-PLA-MAT-001"
                            />
                          </div>
                        </div>

                        {/* Ficha Técnica de Manufactura para Personal Interno */}
                        {(() => {
                          const activeSku = editorForm.code || editorForm.sku || 'HOG-3D-PLA-MAT-001';
                          const breakdown = parseSku(activeSku);
                          return (
                            <div className="p-3 rounded-xl bg-white border border-[#2D4F3E]/30 shadow-2xs space-y-2">
                              <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                                <span className="text-[11px] font-bold text-gray-600 uppercase">Ficha Técnica Interna:</span>
                                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                  ✓ Guía de Preparación para Bodega y Taller
                                </span>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                                <div className="p-1.5 rounded-lg bg-gray-50 border border-gray-100">
                                  <div className="font-bold text-gray-400 uppercase text-[9px]">🏭 Destino / Área</div>
                                  <div className="font-bold text-gray-800 mt-0.5">{breakdown.explanation.destino}</div>
                                </div>
                                <div className="p-1.5 rounded-lg bg-gray-50 border border-gray-100">
                                  <div className="font-bold text-gray-400 uppercase text-[9px]">⚙️ Maquinaria / Proceso</div>
                                  <div className="font-bold text-emerald-800 mt-0.5">{breakdown.explanation.maquinaria}</div>
                                </div>
                                <div className="p-1.5 rounded-lg bg-gray-50 border border-gray-100">
                                  <div className="font-bold text-gray-400 uppercase text-[9px]">🪵 Materia Prima Requerida</div>
                                  <div className="font-bold text-amber-800 mt-0.5">{breakdown.explanation.materiaPrima}</div>
                                </div>
                                <div className="p-1.5 rounded-lg bg-gray-50 border border-gray-100">
                                  <div className="font-bold text-gray-400 uppercase text-[9px]">✨ Acabado Especificado</div>
                                  <div className="font-bold text-purple-800 mt-0.5">{breakdown.explanation.acabadoTaller}</div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>

                  {/* 6. Acordeón: Colores y Opciones de Acabado */}
                  <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-2xs">
                    <div
                      onClick={() => setEditorColorsAccordion(prev => !prev)}
                      className="p-3.5 flex items-center justify-between cursor-pointer select-none hover:bg-stone-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-purple-600" />
                        <div>
                          <h5 className="font-heading font-bold text-xs text-[#1F2421]">
                            Colores y Materiales Disponibles ({getColorVariant()?.options?.length || 0} colores)
                          </h5>
                          <span className="text-[10.5px] text-gray-500">
                            Paleta seleccionable por el cliente en tienda
                          </span>
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${editorColorsAccordion ? 'rotate-180' : ''}`} />
                    </div>

                    {editorColorsAccordion && (
                      <div className="p-3.5 pt-0 border-t border-stone-100 space-y-3">
                        {/* Colores Activos */}
                        {(() => {
                          const colorVar = getColorVariant();
                          const currentColors = colorVar?.options || [];
                          return (
                            <div className="space-y-1.5 pt-2">
                              <span className="text-[10px] font-bold text-gray-600 uppercase block">Colores asignados:</span>
                              {currentColors.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-stone-50 border border-stone-200">
                                  {currentColors.map(color => {
                                    const sw = getFilamentColor(color);
                                    return (
                                      <span
                                        key={color}
                                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white border border-stone-200 text-[11px] font-semibold text-gray-800 shadow-2xs"
                                      >
                                        <span
                                          className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                                          style={{ background: sw?.css || '#D1D5DB' }}
                                        />
                                        <span>{color}</span>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveColorOption(color)}
                                          className="text-gray-400 hover:text-rose-600 font-bold ml-0.5"
                                        >
                                          ×
                                        </button>
                                      </span>
                                    );
                                  })}
                                </div>
                              ) : (
                                <p className="text-[11px] text-gray-400 italic">Sin colores específicos asignados.</p>
                              )}
                            </div>
                          );
                        })()}

                        {/* Paleta Rápida de Circulitos */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-gray-500 uppercase block">Paleta rápida de taller (haz clic para agregar):</span>
                          <div className="flex flex-wrap items-center gap-1.5 p-2 bg-stone-50 rounded-xl border border-stone-200">
                            {STANDARD_PALETTE_COLORS.map(color => {
                              const colorVar = getColorVariant();
                              const isSelected = (colorVar?.options || []).some(opt => opt.toLowerCase() === color.toLowerCase());
                              const sw = getFilamentColor(color);
                              return (
                                <button
                                  key={color}
                                  type="button"
                                  onClick={() => handleToggleColorOption(color)}
                                  className={`w-6 h-6 rounded-full border flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-2xs ${
                                    isSelected ? 'ring-2 ring-[#2D4F3E] ring-offset-1 scale-105' : 'border-black/20'
                                  }`}
                                  style={{ background: sw?.css || '#D1D5DB' }}
                                  title={color}
                                >
                                  {isSelected && <span className="text-[9px] font-black text-white drop-shadow-sm">✓</span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Agregar color libre */}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={customColorInput}
                            onChange={e => setCustomColorInput(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddCustomColor(customColorInput);
                              }
                            }}
                            placeholder="Escribe otro color o acabado personalizado..."
                            className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-gray-300 bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddCustomColor(customColorInput)}
                            className="px-3 py-1.5 rounded-xl bg-[#2D4F3E] text-white text-xs font-bold hover:bg-[#20392C] transition-colors"
                          >
                            + Agregar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 7. Acordeón: Oferta Flash & Relámpago */}
                  <div className="rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50/50 via-stone-50 to-amber-50/30 overflow-hidden shadow-2xs">
                    <div
                      onClick={() => setEditorFlashAccordion(prev => !prev)}
                      className="p-3.5 flex items-center justify-between cursor-pointer select-none hover:bg-black/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <div>
                          <h4 className="font-heading font-extrabold text-xs text-gray-900 flex items-center gap-2">
                            <span>Control de Oferta Flash &amp; Relámpago</span>
                            {editorForm.flashDealConfig?.enabled && (
                              <span className="px-2 py-0.2 rounded-full bg-amber-400 text-stone-950 text-[9.5px] font-black uppercase">
                                ACTIVA (-{editorForm.flashDealConfig.discountPercent || 20}%)
                              </span>
                            )}
                          </h4>
                          <span className="text-[10.5px] text-gray-500">
                            Descuento por tiempo limitado con reloj de cuenta regresiva
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={Boolean(editorForm.flashDealConfig?.enabled)}
                          onChange={e => {
                            e.stopPropagation();
                            setEditorForm({
                              ...editorForm,
                              flashDealConfig: {
                                ...(editorForm.flashDealConfig || {}),
                                enabled: e.target.checked,
                                durationMinutes: editorForm.flashDealConfig?.durationMinutes || 120,
                                discountPercent: editorForm.flashDealConfig?.discountPercent || 20
                              }
                            });
                          }}
                          className="w-4 h-4 rounded text-amber-600 focus:ring-0 cursor-pointer"
                        />
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${editorFlashAccordion ? 'rotate-180' : ''}`} />
                      </div>
                    </div>

                    {editorFlashAccordion && editorForm.flashDealConfig?.enabled && (
                      <div className="p-3.5 pt-0 border-t border-amber-200/60 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          <div>
                            <label className="text-[11px] font-bold text-gray-700 block mb-1">Duración de la Oferta</label>
                            <select
                              value={editorForm.flashDealConfig.durationMinutes || 120}
                              onChange={e => setEditorForm({
                                ...editorForm,
                                flashDealConfig: {
                                  ...editorForm.flashDealConfig,
                                  durationMinutes: Number(e.target.value)
                                }
                              })}
                              className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 bg-white text-xs font-semibold"
                            >
                              <option value={15}>⚡ 15 Minutos (Blitz Relámpago)</option>
                              <option value={60}>1 Hora</option>
                              <option value={120}>2 Horas (Estándar)</option>
                              <option value={360}>6 Horas</option>
                              <option value={1440}>24 Horas (1 Día)</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-gray-700 block mb-1">Porcentaje de Descuento</label>
                            <select
                              value={editorForm.flashDealConfig.discountPercent || 20}
                              onChange={e => setEditorForm({
                                ...editorForm,
                                flashDealConfig: {
                                  ...editorForm.flashDealConfig,
                                  discountPercent: Number(e.target.value)
                                }
                              })}
                              className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 bg-white text-xs font-semibold"
                            >
                              <option value={10}>10% de descuento</option>
                              <option value={15}>15% de descuento</option>
                              <option value={20}>20% de descuento (Recomendado)</option>
                              <option value={30}>30% de descuento</option>
                              <option value={50}>50% de descuento (Liquidación)</option>
                            </select>
                          </div>
                        </div>

                        {editorForm.price && (
                          <div className="p-2.5 rounded-xl bg-white border border-amber-200 flex items-center justify-between text-xs">
                            <span className="text-gray-500">Precio normal: <strong className="line-through">${editorForm.price}</strong></span>
                            <span className="text-[#2D4F3E] font-black text-sm">
                              Precio Flash: ${Math.round(editorForm.price * (1 - (editorForm.flashDealConfig.discountPercent || 20) / 100))} MXN
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 8. Medidas y Notas Privadas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1 text-[11px]">Medidas / Dimensiones (cm)</label>
                      <input
                        type="text"
                        value={editorForm.specifications?.dimensions || ''}
                        onChange={e => setEditorForm({
                          ...editorForm,
                          specifications: { ...editorForm.specifications, dimensions: e.target.value }
                        })}
                        placeholder="Ej: 22 x 13 x 2.2 cm"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-gray-700 block mb-1 text-[11px]">Tiempo de Elaboración</label>
                      <input
                        type="text"
                        value={editorForm.specifications?.estimatedLeadTime || ''}
                        onChange={e => setEditorForm({
                          ...editorForm,
                          specifications: { ...editorForm.specifications, estimatedLeadTime: e.target.value }
                        })}
                        placeholder="Ej: 2 a 3 días hábiles"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold text-gray-700 block mb-1 text-[11px]">
                        Notas Privadas de Manufactura (Solo para ti y el taller, no visibles para clientes)
                      </label>
                      <input
                        type="text"
                        value={editorForm.privateNotes || ''}
                        onChange={e => setEditorForm({ ...editorForm, privateNotes: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-amber-50/50 text-xs"
                        placeholder="Parámetros de boquilla, relleno concéntrico al 20%, proveedor de material..."
                      />
                    </div>
                  </div>

                </div>

              </div>

              {/* Botones Fijos de Acción Inferior */}
              <div className="p-4 px-6 bg-[#FBF9F5] border-t border-[#E8E4DA] flex items-center justify-between shrink-0 mt-auto">
                <span className="text-[11px] text-gray-400">
                  Los cambios se guardan y sincronizan automáticamente con la base de datos de taller.
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 font-semibold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-[#2D4F3E] text-white font-bold text-xs hover:bg-[#20392C] transition-all cursor-pointer shadow-md active:scale-98"
                  >
                    Guardar Cambios del Producto
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Detailed Cost Breakdown Modal (Excel Formulas & 3D Workshop Calculation) */}
      {breakdownModalProduct && breakdownForm && (() => {
        const plaKg = Number(workshopParams.plaPerKg) || 500;
        const tpuKg = Number(workshopParams.tpuPerKg) || 700;
        const filamentWaste = (Number(workshopParams.filamentWastePercent) || 15) / 100;
        const electHour = Number(workshopParams.electricityPerHour) || 1.04;
        const wearHour = Number(workshopParams.wearPerHour) || 3.00;
        const laborHour = Number(workshopParams.laborPerHour) || 60;

        // Fórmulas de la Calculadora de Costos Recetas (Estilo App Móvil)
        const recipeItems = Array.isArray(breakdownForm.recipeItems) ? breakdownForm.recipeItems : [];
        const recipeRawMaterialsCost = recipeItems.reduce((acc, it) => acc + (Number(it.lineTotal) || 0), 0);
        const yieldUnits = Math.max(1, Number(breakdownForm.yieldUnits) || 1);
        const rawMaterialsPerUnit = recipeRawMaterialsCost / yieldUnits;
        const overheadPercent = breakdownForm.overheadPercent !== undefined ? Number(breakdownForm.overheadPercent) : 50;
        const overheadCostPerUnit = rawMaterialsPerUnit * (overheadPercent / 100);
        const recipeTotalUnitCost = Math.round((rawMaterialsPerUnit + overheadCostPerUnit) * 10) / 10;
        const targetProfitPercent = breakdownForm.targetProfitPercent !== undefined ? Number(breakdownForm.targetProfitPercent) : 200;
        const suggestedPriceFromRecipe = Math.round(recipeTotalUnitCost * (1 + targetProfitPercent / 100));
        const profitFromRecipe = Math.max(0, suggestedPriceFromRecipe - recipeTotalUnitCost);

        // Fórmulas clásicas de taller de respaldo
        const plaSubtotal = ((Number(breakdownForm.plaGrams || 0) * plaKg) / 1000) * (1 + filamentWaste);
        const tpuSubtotal = ((Number(breakdownForm.tpuGrams || 0) * tpuKg) / 1000) * (1 + filamentWaste);
        const filamentSubtotal = plaSubtotal + tpuSubtotal;
        const machineSubtotal = Number(breakdownForm.machineHours || 0) * (electHour + wearHour);
        const laborSubtotal = (Number(breakdownForm.manualWorkMin || 0) / 60) * laborHour;
        const otherSubtotal = Number(breakdownForm.otherMaterialsCost || 0) + Number(breakdownForm.packagingCost || 0) + Number(breakdownForm.prepCost || 0) + Number(breakdownForm.shippingCost || 0) + Number(breakdownForm.additionalFailuresCost || 0) + Number(breakdownForm.fixedOverheadCost || 0);
        const classicTotal = Math.round((filamentSubtotal + machineSubtotal + laborSubtotal + otherSubtotal) * 10) / 10;

        // Si tiene items de receta, el costo vivo de fabricación unitario es recipeTotalUnitCost
        const liveTotalCost = recipeItems.length > 0 ? recipeTotalUnitCost : classicTotal;

        const salePrice = breakdownForm.salePrice !== undefined && breakdownForm.salePrice !== '' && !isNaN(Number(breakdownForm.salePrice))
          ? Number(breakdownForm.salePrice)
          : (suggestedPriceFromRecipe > 0 ? suggestedPriceFromRecipe : (Number(breakdownModalProduct.price) || 0));

        const liveProfit = salePrice > 0 ? Math.round((salePrice - liveTotalCost) * 10) / 10 : 0;
        const liveMargin = salePrice > 0 ? Math.round((liveProfit / salePrice) * 1000) / 10 : 0;
        const liveMarkup = liveTotalCost > 0 ? Math.round((liveProfit / liveTotalCost) * 1000) / 10 : 0;
        const liveTargetPrice = suggestedPriceFromRecipe > 0 ? suggestedPriceFromRecipe : Math.round((liveTotalCost / 0.6) * 10) / 10;
        const liveReserve = liveProfit > 0 ? Math.round((liveProfit * 0.10) * 10) / 10 : 0;
        const liveFreeProfit = Math.round((liveProfit - liveReserve) * 10) / 10;

        // Filtrado de materiales para el selector
        const filteredMaterialsForRecipe = rawMaterialsList.filter(m => {
          if (!recipeMatSearch.trim()) return true;
          const q = recipeMatSearch.toLowerCase();
          return (m.name || '').toLowerCase().includes(q) || (m.materialType || '').toLowerCase().includes(q) || (m.color || '').toLowerCase().includes(q);
        });

        // Preview del costo en el modal de añadir cantidades
        let previewCalculatedPrice = 0;
        if (recipeSelectedMatId) {
          const selMat = rawMaterialsList.find(m => m.id === recipeSelectedMatId);
          if (selMat) {
            const pkg = parsePackageInfo(selMat);
            const cost = Number(selMat.costPerUnit || selMat.packageCost || 0);
            const pkgQty = Number(pkg.packageQuantity) || 1;
            const pkgUnit = (pkg.packageMeasurement || 'pza').toLowerCase().trim();
            const reqUnit = (recipeNewMatUnit || pkgUnit).toLowerCase().trim();
            const qty = Number(recipeNewMatQty) || 0;
            let unitC = cost / pkgQty;
            if ((reqUnit === 'g' || reqUnit === 'gr') && (pkgUnit === 'kg' || pkgUnit === 'kilo')) unitC = cost / (pkgQty * 1000);
            else if ((reqUnit === 'kg' || reqUnit === 'kilo') && (pkgUnit === 'g' || pkgUnit === 'gr')) unitC = (cost / pkgQty) * 1000;
            else if ((reqUnit === 'ml' || reqUnit === 'mililitro') && (pkgUnit === 'l' || pkgUnit === 'litro')) unitC = cost / (pkgQty * 1000);
            else if ((reqUnit === 'l' || reqUnit === 'litro') && (pkgUnit === 'ml' || pkgUnit === 'mililitro')) unitC = (cost / pkgQty) * 1000;
            previewCalculatedPrice = Math.round(qty * unitC * 100) / 100;
          }
        } else if (recipeCustomMatName.trim()) {
          previewCalculatedPrice = Math.round((Number(recipeNewMatQty) || 0) * (Number(recipeCustomUnitCost) || 0) * 100) / 100;
        }

        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-fade-in">
            <div
              className="bg-[#FBF9F5] rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-[#E8E4DA] shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 bg-[#1F2421] text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-white/10 text-emerald-400">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-heading flex items-center gap-2">
                      <span>Calculadora de Costos &amp; Márgenes</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 text-[10px] font-bold border border-emerald-700">
                        Fórmulas de Taller 3D
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400">
                      Producto: <strong className="text-white">{breakdownModalProduct.name}</strong> • Código: <span className="font-mono text-emerald-300">{breakdownModalProduct.code || 'S/C'}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setBreakdownModalProduct(null)}
                  className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">

                {/* Banner de Tarifas Aplicadas */}
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-[11px] text-emerald-900">
                  <div className="flex items-center gap-2 font-medium">
                    <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>
                      Tarifas activas: PLA <strong>${plaKg}/kg</strong> • TPU <strong>${tpuKg}/kg</strong> • Merma <strong>{workshopParams.filamentWastePercent || 15}%</strong> • Luz+Desgaste <strong>${(electHour + wearHour).toFixed(2)}/h</strong> • Mano de obra <strong>${laborHour}/h</strong>
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-white text-emerald-800 font-bold border border-emerald-200">
                    Auto-sincronizado con Excel
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* COLUMNA 1: Calculadora de Costos Recetas (Estilo App Móvil Beauty Tools Apps) */}
                  <div className="bg-[#141615] text-white p-4 sm:p-5 rounded-2xl border-2 border-[#EA580C] shadow-xl space-y-4 flex flex-col justify-between">
                    
                    {/* Header de la Receta */}
                    <div>
                      <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[#EA580C] font-black text-lg">←</span>
                          <h4 className="text-base font-black text-white font-heading tracking-wide">
                            Receta
                          </h4>
                          <span className="px-2 py-0.5 rounded-full bg-[#EA580C]/20 text-[#FF7A00] text-[10px] font-bold border border-[#EA580C]/40">
                            Calculadora de Taller
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            // Feedback táctil al recalcular
                            const btn = document.getElementById('btn-recipe-calc-action');
                            if (btn) {
                              btn.classList.add('text-amber-400');
                              setTimeout(() => btn.classList.remove('text-amber-400'), 500);
                            }
                          }}
                          id="btn-recipe-calc-action"
                          className="text-white hover:text-[#FF7A00] text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#FF7A00]" />
                          <span>CALCULAR</span>
                        </button>
                      </div>

                      {/* Nombre de la Receta */}
                      <div className="mt-3 space-y-1">
                        <label className="block text-xs font-bold text-gray-300">
                          Nombre de la receta
                        </label>
                        <input
                          type="text"
                          value={breakdownForm.recipeName || ''}
                          onChange={e => setBreakdownForm({ ...breakdownForm, recipeName: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#222524] border border-gray-700 text-white font-bold text-xs focus:border-[#EA580C] focus:outline-none transition-all"
                          placeholder="Impresión 3d"
                        />
                      </div>

                      {/* Botón Naranja Central: AÑADIR CANTIDADES */}
                      <div className="my-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setRecipeSelectedMatId('');
                            setRecipeCustomMatName('');
                            setRecipeNewMatQty(12);
                            setRecipeNewMatUnit('g');
                            setShowAddQuantityModal(true);
                          }}
                          className="w-full py-2.5 px-4 rounded-xl bg-[#FF7A00] hover:bg-[#E66E00] active:scale-[0.98] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                          <span>AÑADIR CANTIDADES</span>
                        </button>
                      </div>

                      {/* Lista de Cantidades de Materiales (Borde Naranja) */}
                      <div className="rounded-xl border-2 border-[#EA580C] bg-[#1C1F1E] p-3 space-y-2.5 max-h-52 overflow-y-auto">
                        {recipeItems.length === 0 ? (
                          <div className="py-4 px-2 text-center text-xs font-medium text-gray-400">
                            Receta sin cantidades de material
                          </div>
                        ) : (
                          recipeItems.map(item => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between border-b border-gray-800/80 pb-2 last:border-b-0 last:pb-0"
                            >
                              <div className="min-w-0 pr-2">
                                <div className="text-xs font-black text-white truncate">
                                  {item.quantity} {item.unit} - {item.name}
                                </div>
                                <div className="text-[11px] font-bold text-gray-300">
                                  Precio: <span className="font-mono text-amber-300">${item.lineTotal.toFixed(2)}</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveRecipeItem(item.id)}
                                className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer shrink-0"
                                title="Eliminar de la receta"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Parámetros de la Receta (Borde Naranja) */}
                      <div className="rounded-xl border-2 border-[#EA580C] bg-[#1C1F1E] p-3.5 space-y-3 mt-3">
                        {/* Rendimiento */}
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-gray-200">
                            ¿Cuántas unidades rinde la receta?
                          </label>
                          <input
                            type="number"
                            step="1"
                            min="1"
                            value={breakdownForm.yieldUnits ?? 1}
                            onChange={e => setBreakdownForm({ ...breakdownForm, yieldUnits: Math.max(1, parseFloat(e.target.value) || 1) })}
                            className="w-24 px-3 py-1.5 rounded-lg bg-[#141615] border border-gray-700 text-white font-mono font-bold text-xs focus:border-[#EA580C] focus:outline-none"
                            placeholder="1"
                          />
                        </div>

                        {/* Porcentaje Adicional sobre Costos */}
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-gray-200 leading-tight">
                            Porcentaje adicional sobre costos (mano de obra, agua, electricidad, etc.)
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="any"
                              min="0"
                              value={breakdownForm.overheadPercent ?? 50}
                              onChange={e => setBreakdownForm({ ...breakdownForm, overheadPercent: parseFloat(e.target.value) || 0 })}
                              className="w-24 px-3 py-1.5 rounded-lg bg-[#141615] border border-gray-700 text-white font-mono font-bold text-xs focus:border-[#EA580C] focus:outline-none"
                              placeholder="50"
                            />
                            <span className="text-sm font-black text-[#FF7A00]">%</span>
                          </div>
                        </div>

                        {/* Porcentaje de Beneficio Esperado */}
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-gray-200">
                            Porcentaje de beneficio esperado
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="any"
                              min="0"
                              value={breakdownForm.targetProfitPercent ?? 200}
                              onChange={e => setBreakdownForm({ ...breakdownForm, targetProfitPercent: parseFloat(e.target.value) || 0 })}
                              className="w-24 px-3 py-1.5 rounded-lg bg-[#141615] border border-gray-700 text-white font-mono font-bold text-xs focus:border-[#EA580C] focus:outline-none"
                              placeholder="200"
                            />
                            <span className="text-sm font-black text-[#FF7A00]">%</span>
                          </div>
                        </div>
                      </div>

                      {/* Notas de la Receta */}
                      <div className="mt-3 space-y-1">
                        <label className="block text-xs font-bold text-gray-300">
                          Notas
                        </label>
                        <textarea
                          rows={2}
                          value={breakdownForm.recipeNotes || ''}
                          onChange={e => setBreakdownForm({ ...breakdownForm, recipeNotes: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-xl bg-[#222524] border border-gray-700 text-white text-xs focus:border-[#EA580C] focus:outline-none resize-none"
                          placeholder="Notas opcionales de preparación o taller..."
                        />
                      </div>
                    </div>

                    {/* Resumen Financiero Directo de la Receta con botón para aplicar precio */}
                    <div className="pt-2 border-t border-gray-800 space-y-2">
                      <div className="p-3 rounded-xl bg-[#0F1110] border border-gray-800 text-[11px] space-y-1 text-gray-300">
                        <div className="flex justify-between">
                          <span>Materia Prima ({yieldUnits > 1 ? `Lote $${recipeRawMaterialsCost.toFixed(2)}` : 'unidad'}):</span>
                          <strong className="font-mono text-white">${rawMaterialsPerUnit.toFixed(2)}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Adicional operativo ({overheadPercent}%):</span>
                          <strong className="font-mono text-amber-300">+${overheadCostPerUnit.toFixed(2)}</strong>
                        </div>
                        <div className="flex justify-between font-bold text-white border-t border-gray-800 pt-1">
                          <span>Costo Fabricación Unidad:</span>
                          <span className="font-mono text-emerald-400">${recipeTotalUnitCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-[#FF7A00] font-bold">
                          <span>Beneficio esperado ({targetProfitPercent}%):</span>
                          <span className="font-mono">+${profitFromRecipe.toFixed(2)}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setBreakdownForm({ ...breakdownForm, salePrice: suggestedPriceFromRecipe })}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#EA580C] to-[#FF7A00] hover:from-[#C2410C] hover:to-[#EA580C] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Zap className="w-4 h-4 fill-black" />
                        <span>Aplicar Precio Sugerido: ${suggestedPriceFromRecipe} MXN</span>
                      </button>
                    </div>

                  </div>

                  {/* COLUMNA 2: Tiempos de Máquina y Mano de Obra */}
                  <div className="space-y-4 bg-white p-4 rounded-2xl border border-[#E8E4DA]">
                    <h4 className="font-bold text-sm text-[#1F2421] border-b pb-2 flex items-center gap-2">
                      <span>⚡ 2. Tiempo de Máquina &amp; Mano de Obra</span>
                    </h4>

                    {/* Horas Máquina */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-gray-700">Horas de Impresión 3D / Máquina</label>
                        <span className="font-mono font-bold text-emerald-700">${machineSubtotal.toFixed(2)} MXN</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.25"
                          min="0"
                          value={breakdownForm.machineHours ?? 0}
                          onChange={e => setBreakdownForm({ ...breakdownForm, machineHours: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono font-bold"
                          placeholder="2.5"
                        />
                        <span className="text-gray-400 font-medium">hrs</span>
                      </div>
                      <p className="text-[10px] text-gray-400">Calculado a ${electHour}/h luz + ${wearHour}/h amortización y boquilla.</p>
                    </div>

                    {/* Minutos Mano de Obra */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-gray-700">Mano de Obra / Acabado (Minutos)</label>
                        <span className="font-mono font-bold text-emerald-700">${laborSubtotal.toFixed(2)} MXN</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={breakdownForm.manualWorkMin ?? 0}
                          onChange={e => setBreakdownForm({ ...breakdownForm, manualWorkMin: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono font-bold"
                          placeholder="6"
                        />
                        <span className="text-gray-400 font-medium">min</span>
                      </div>
                      <p className="text-[10px] text-gray-400">Post-proceso, retiro de soportes, ensamblado manual (${laborHour}/h = $1/min).</p>
                    </div>

                    {/* Costos Indirectos / Varios */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                      <div>
                        <label className="font-bold text-gray-700 block mb-1">Diseño / STL ($)</label>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={breakdownForm.prepCost ?? 0}
                          onChange={e => setBreakdownForm({ ...breakdownForm, prepCost: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2 py-1.5 rounded-lg border border-gray-300 font-mono"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-gray-700 block mb-1">Fallas / Merma ($)</label>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={breakdownForm.additionalFailuresCost ?? 0}
                          onChange={e => setBreakdownForm({ ...breakdownForm, additionalFailuresCost: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2 py-1.5 rounded-lg border border-gray-300 font-mono"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Estado de Costeo */}
                    <div className="pt-2 border-t border-gray-100">
                      <label className="font-bold text-gray-700 block mb-1">Estado de Verificación de Costo</label>
                      <select
                        value={breakdownForm.costStatus || 'Verificado'}
                        onChange={e => setBreakdownForm({ ...breakdownForm, costStatus: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-medium"
                      >
                        <option value="Verificado">✅ Verificado (Basado en piezas reales)</option>
                        <option value="Estimado">⚠️ Estimado (Pendiente de pesar)</option>
                        <option value="En cotización">💬 En cotización especial</option>
                      </select>
                    </div>

                    {/* Subtotal Tiempos */}
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                      <span className="font-bold text-gray-700">Subtotal Taller &amp; Trabajo:</span>
                      <span className="font-mono font-black text-gray-900 text-sm">
                        ${(machineSubtotal + laborSubtotal + Number(breakdownForm.prepCost || 0) + Number(breakdownForm.additionalFailuresCost || 0)).toFixed(2)} MXN
                      </span>
                    </div>

                  </div>

                </div>

                {/* Resumen Financiero Completo en Vivo */}
                <div className="p-5 rounded-2xl bg-[#1F2421] text-white space-y-4 shadow-md">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="font-bold text-sm text-emerald-300 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4" />
                      <span>Análisis de Rentabilidad Resultante</span>
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                      liveProfit < 0
                        ? 'bg-rose-900 text-rose-200'
                        : liveMargin >= 40
                          ? 'bg-emerald-900 text-emerald-300'
                          : 'bg-amber-900 text-amber-200'
                    }`}>
                      {liveProfit < 0 ? 'En Pérdida' : liveMargin >= 40 ? 'Margen Óptimo (≥40%)' : 'Bajo Objetivo (<40%)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Costo Total</div>
                      <div className="text-lg font-black font-mono text-white mt-0.5">${liveTotalCost.toFixed(1)}</div>
                      <div className="text-[10px] text-gray-400">filamento + máquina + mo</div>
                    </div>

                    <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex flex-col justify-center items-center">
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold flex items-center gap-1 mb-1">
                        <span>Precio de Venta</span>
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded font-bold">Editable</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-emerald-400 font-bold text-sm">$</span>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={breakdownForm.salePrice !== undefined ? breakdownForm.salePrice : (breakdownModalProduct.price || '')}
                          onChange={e => {
                            const val = e.target.value;
                            setBreakdownForm({ ...breakdownForm, salePrice: val === '' ? '' : parseFloat(val) });
                          }}
                          className="w-24 px-1.5 py-0.5 text-center text-lg font-black font-mono text-emerald-400 bg-white/10 border border-emerald-500/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:bg-white/20 transition-all"
                          placeholder="0"
                        />
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1">se guardará en catálogo</div>
                    </div>

                    <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Ganancia Neta</div>
                      <div className={`text-lg font-black font-mono mt-0.5 ${liveProfit >= 0 ? 'text-emerald-300' : 'text-rose-400'}`}>
                        ${liveProfit.toFixed(1)}
                      </div>
                      <div className="text-[10px] text-gray-400">libre de costos</div>
                    </div>

                    <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Margen s/ Venta</div>
                      <div className={`text-lg font-black font-mono mt-0.5 ${liveMargin >= 40 ? 'text-emerald-300' : liveProfit < 0 ? 'text-rose-400' : 'text-amber-300'}`}>
                        {liveMargin}%
                      </div>
                      <div className="text-[10px] text-gray-400">Markup: {liveMarkup}%</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-300">
                    <div className="flex items-center gap-4">
                      <span>Reserva taller (10%): <strong className="text-amber-300 font-mono">${liveReserve.toFixed(1)} MXN</strong></span>
                      <span>Utilidad de bolsillo: <strong className="text-emerald-300 font-mono">${liveFreeProfit.toFixed(1)} MXN</strong></span>
                    </div>
                    <div>
                      <span>Precio sugerido (para 40% margen): <strong className="text-white font-mono bg-white/10 px-2 py-0.5 rounded">${liveTargetPrice.toFixed(1)} MXN</strong></span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer Buttons */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setBreakdownModalProduct(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveCostBreakdown}
                  className="px-6 py-2.5 rounded-xl bg-[#2D4F3E] text-white font-bold hover:bg-[#20392C] transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Guardar Costo (${liveTotalCost.toFixed(1)}) y Precio (${salePrice > 0 ? `${salePrice}` : '0'} MXN)</span>
                </button>
              </div>

              {/* Modal Flotante: AÑADIR CANTIDADES (Estilo App Beauty Tools Apps) */}
              {showAddQuantityModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
                  <div
                    className="bg-[#18181B] text-white rounded-3xl max-w-md w-full p-5 sm:p-6 border-2 border-[#EA580C] shadow-2xl space-y-4"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between border-b border-gray-700/80 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-[#EA580C]/20 text-[#FF7A00]">
                          <Plus className="w-4 h-4 stroke-[3]" />
                        </span>
                        <div>
                          <h4 className="text-sm font-extrabold text-white font-heading">
                            Añadir Cantidades a la Receta
                          </h4>
                          <p className="text-[10px] text-gray-400">
                            Selecciona del inventario de taller o ingresa un insumo libre
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddQuantityModal(false)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3.5 text-xs">
                      {/* Buscador de Insumos */}
                      <div>
                        <label className="block text-gray-300 font-bold mb-1">
                          Insumos del Taller ({rawMaterialsList.length} disponibles)
                        </label>
                        <div className="relative mb-2">
                          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            placeholder="Buscar insumo (ej. PLA, fijador, alcohol, madera, taza)..."
                            value={recipeMatSearch}
                            onChange={e => setRecipeMatSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#27272A] border border-gray-700 text-white placeholder-gray-500 text-xs focus:border-[#EA580C] focus:outline-none"
                          />
                        </div>

                        <select
                          value={recipeSelectedMatId}
                          onChange={e => {
                            const id = e.target.value;
                            setRecipeSelectedMatId(id);
                            if (id) {
                              const mat = rawMaterialsList.find(m => m.id === id);
                              if (mat) {
                                const pkg = parsePackageInfo(mat);
                                setRecipeNewMatUnit(pkg.packageMeasurement || 'g');
                              }
                            }
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-[#27272A] border border-gray-700 text-white text-xs focus:border-[#EA580C] focus:outline-none"
                        >
                          <option value="">-- Seleccionar de inventario ({filteredMaterialsForRecipe.length} opciones) --</option>
                          {filteredMaterialsForRecipe.slice(0, 100).map(mat => (
                            <option key={mat.id} value={mat.id}>
                              {mat.name} ({mat.unit || 'unidad'}) — ${mat.costPerUnit || mat.packageCost || 0}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* O Insumo Personalizado */}
                      {!recipeSelectedMatId && (
                        <div className="p-3 bg-white/5 rounded-xl border border-gray-700/70 space-y-2">
                          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                            O ingresa un insumo personalizado:
                          </span>
                          <input
                            type="text"
                            placeholder="Nombre del insumo (ej. Laca fijadora, alcohol, argolla)"
                            value={recipeCustomMatName}
                            onChange={e => setRecipeCustomMatName(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-[#27272A] border border-gray-700 text-white text-xs focus:border-[#EA580C] focus:outline-none"
                          />
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Costo unitario ($ MXN):</span>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1 text-gray-500 font-bold">$</span>
                              <input
                                type="number"
                                step="any"
                                min="0"
                                value={recipeCustomUnitCost}
                                onChange={e => setRecipeCustomUnitCost(parseFloat(e.target.value) || 0)}
                                className="w-24 pl-6 pr-2 py-1 rounded bg-[#27272A] border border-gray-700 text-white text-xs font-mono font-bold focus:border-[#EA580C] focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Cantidad y Unidad */}
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-gray-300 font-bold mb-1">Cantidad Usada</label>
                          <input
                            type="number"
                            step="any"
                            min="0.001"
                            value={recipeNewMatQty}
                            onChange={e => setRecipeNewMatQty(parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 rounded-xl bg-[#27272A] border border-gray-700 text-white font-mono font-bold text-sm focus:border-[#EA580C] focus:outline-none"
                            placeholder="12"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-300 font-bold mb-1">Unidad de Medida</label>
                          <select
                            value={recipeNewMatUnit}
                            onChange={e => setRecipeNewMatUnit(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-[#27272A] border border-gray-700 text-white text-xs focus:border-[#EA580C] focus:outline-none font-bold"
                          >
                            <option value="g">Gramos (g)</option>
                            <option value="kg">Kilogramos (kg)</option>
                            <option value="mL">Mililitros (mL)</option>
                            <option value="L">Litros (L)</option>
                            <option value="pza">Piezas (pza)</option>
                            <option value="cm²">Centímetros² (cm²)</option>
                            <option value="m">Metros (m)</option>
                            <option value="hoja">Hojas (hoja)</option>
                          </select>
                        </div>
                      </div>

                      {/* Vista previa en vivo del precio calculado */}
                      <div className="p-3 bg-[#FF7A00]/10 rounded-xl border border-[#FF7A00]/40 flex items-center justify-between">
                        <div>
                          <div className="text-[11px] text-gray-400">Precio estimado del insumo:</div>
                          <div className="text-[10px] text-gray-500">
                            {recipeNewMatQty} {recipeNewMatUnit}
                          </div>
                        </div>
                        <span className="font-mono font-black text-amber-400 text-lg">
                          ${previewCalculatedPrice.toFixed(2)} MXN
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-800">
                      <button
                        type="button"
                        onClick={() => setShowAddQuantityModal(false)}
                        className="px-4 py-2 rounded-xl border border-gray-600 text-gray-300 hover:bg-white/10 text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleAddRecipeItemFromModal}
                        disabled={!recipeSelectedMatId && !recipeCustomMatName.trim()}
                        className="px-5 py-2 rounded-xl bg-[#FF7A00] hover:bg-[#E66E00] disabled:opacity-50 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Añadir a la receta</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        );
      })()}

      {/* Modal General de Confirmación y Desglose de Cambios del Panel Administrador */}
      <AdminConfirmSaveModal
        isOpen={adminConfirmModal.isOpen}
        title={adminConfirmModal.title}
        subtitle={adminConfirmModal.subtitle}
        badge={adminConfirmModal.badge}
        confirmText={adminConfirmModal.confirmText}
        changes={adminConfirmModal.changes}
        onConfirm={adminConfirmModal.onConfirm}
        onCancel={() => setAdminConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}
