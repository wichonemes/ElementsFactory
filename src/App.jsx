import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import WorldSelector from './components/WorldSelector';
import FiltersBar from './components/FiltersBar';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import QuoteDrawer from './components/QuoteDrawer';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import CraftShowcase from './components/CraftShowcase';
import PatchBarShowcase from './components/PatchBarShowcase';
import PromotionsSection from './components/PromotionsSection';
import QuoteCalculatorModal from './components/QuoteCalculatorModal';
import FloatingSideNav from './components/FloatingSideNav';
import TemuUrgencyModule from './components/TemuUrgencyModule';
import PackagesAndServicesView from './components/PackagesAndServicesView';
import BlitzClockWidget from './components/BlitzClockWidget';
import CatalogBottomNav from './components/CatalogBottomNav';
import WorkshopArcadeModal from './components/WorkshopArcadeModal';
import MobileMercadoLibreHeader from './components/MobileMercadoLibreHeader';
import MobileBannerCarousel from './components/MobileBannerCarousel';
import MobileFlashDealsSection from './components/MobileFlashDealsSection';
import MobileBottomNav from './components/MobileBottomNav';
import MobileCategoriesModal from './components/MobileCategoriesModal';
import MobileMoreMenuModal from './components/MobileMoreMenuModal';
import { useFlashDeal } from './hooks/useFlashDeal';
import { Home, Briefcase, CalendarHeart, Sparkles, ChevronRight, ShoppingBag, Layers, MessageCircle, Gift, RotateCw, Calendar, AlertTriangle, MapPin, Truck } from 'lucide-react';
import { formatServiceDate } from './utils/serviceStatus';
import { playCoinSound, playSoftAreaSwitchSound, playMarioPowerDownSound } from './utils/soundEffects';

export default function App() {
  // Server Data
  const [worlds, setWorlds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isArcadeOpen, setIsArcadeOpen] = useState(false);
  const [arcadeInitialTab, setArcadeInitialTab] = useState('play');

  const handleOpenArcade = (tab = 'play') => {
    playSoftAreaSwitchSound();
    setArcadeInitialTab(tab);
    setIsArcadeOpen(true);
  };
  const flashDeal = useFlashDeal(products, settings);

  // Navigation & Filter States
  const [activeWorld, setActiveWorld] = useState('all'); // 'all' | 'hogar' | 'negocios' | 'eventos'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTechnique, setSelectedTechnique] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('catalog'); // 'catalog' | 'promotions'
  const [catalogSeed, setCatalogSeed] = useState(() => Date.now());
  const [packagesInitialArea, setPackagesInitialArea] = useState('all');

  // Cart / Quote State (Persisted in localStorage)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('artesano_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal / Drawer States
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [calculatorProduct, setCalculatorProduct] = useState(null);
  const [campaignsConfig, setCampaignsConfig] = useState(null);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [mobileNavTab, setMobileNavTab] = useState('home');

  // Sync Cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('artesano_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  // Initial Fetch & Analytics
  useEffect(() => {
    loadCatalogData();

    // Capture marketing publication code, direct product link, and UTM tracking parameters
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const prodParam = urlParams.get('prod');
      if (prodParam) {
        localStorage.setItem('artesano_target_prod', prodParam);
      }

      const pubCode = urlParams.get('pub') || urlParams.get('utm_content') || urlParams.get('ref');
      const utmSource = urlParams.get('utm_source') || '';
      const utmMedium = urlParams.get('utm_medium') || '';
      const utmCampaign = urlParams.get('utm_campaign') || '';

      if (pubCode) {
        const cleanPub = pubCode.trim().toUpperCase();
        localStorage.setItem('artesano_active_pub', cleanPub);

        // Register publication visit in database
        fetch('/api/tracking/visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pubCode: cleanPub,
            utmSource,
            utmMedium,
            utmCampaign,
            path: window.location.pathname
          })
        }).catch(() => {});
      }
    } catch (e) {
      console.error('Error tracking publication visit:', e);
    }

    // Track Page View
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'page_view', payload: { path: window.location.pathname } })
    }).catch(() => {});
  }, []);

  // Apertura automática de producto cuando viene ?prod=... en la URL
  useEffect(() => {
    if (products && products.length > 0) {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const targetProd = urlParams.get('prod') || localStorage.getItem('artesano_target_prod');
        if (targetProd) {
          const cleanTarget = targetProd.trim().toUpperCase();
          const match = products.find(p =>
            (p.code && p.code.toUpperCase() === cleanTarget) ||
            (p.id && String(p.id).toUpperCase() === cleanTarget) ||
            (p.slug && p.slug.toUpperCase() === cleanTarget)
          );
          if (match) {
            setSelectedProduct(match);
            localStorage.removeItem('artesano_target_prod');
          }
        }
      } catch (err) {
        console.error('Error auto-opening target product:', err);
      }
    }
  }, [products]);

  // Sincronización de restablecimiento inmediato de monedas de Arcade desde el servidor
  useEffect(() => {
    if (settings?.arcadeConfig?.lastResetTimestamp) {
      const serverReset = settings.arcadeConfig.lastResetTimestamp;
      const lastLocalReset = parseInt(localStorage.getItem('artesano_last_server_reset') || '0', 10);
      const sessionStart = parseInt(localStorage.getItem('artesano_coins_session_start') || '0', 10);

      if (serverReset > lastLocalReset || (sessionStart > 0 && sessionStart < serverReset)) {
        localStorage.setItem('artesano_coins', '0');
        localStorage.setItem('artesano_last_server_reset', serverReset.toString());
        localStorage.setItem('artesano_coins_session_start', Date.now().toString());
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('artesano_arcade_update'));
        }
      }
    }
  }, [settings]);

  const loadCatalogData = async () => {
    setLoading(true);
    try {
      const [resWorlds, resCats, resProds, resSettings, resCamp] = await Promise.all([
        fetch('/api/worlds'),
        fetch('/api/categories'),
        fetch('/api/products?status=published'),
        fetch('/api/settings'),
        fetch('/api/campaigns').catch(() => null)
      ]);

      const [dataWorlds, dataCats, dataProds, dataSettings, dataCamp] = await Promise.all([
        resWorlds.json(),
        resCats.json(),
        resProds.json(),
        resSettings.json(),
        resCamp && resCamp.ok ? resCamp.json().catch(() => null) : Promise.resolve(null)
      ]);

      setWorlds(dataWorlds || []);
      setCategories(dataCats || []);
      setProducts(dataProds || []);
      setSettings(dataSettings || null);
      if (dataCamp) setCampaignsConfig(dataCamp);
    } catch (err) {
      console.error('Error loading catalog data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Area / World filter
      if (activeWorld !== 'all' && (!p.worlds || !p.worlds.includes(activeWorld))) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'all' && (!p.categories || !p.categories.includes(selectedCategory))) {
        return false;
      }
      // Technique filter (supports bilingual tags like vinil/vinyl, sublimacion/sublimation)
      if (selectedTechnique !== 'all') {
        const matchesTech = p.techniques?.some(t => {
          if (selectedTechnique === 'vinyl') return t === 'vinyl' || t === 'vinil';
          if (selectedTechnique === 'sublimation') return t === 'sublimation' || t === 'sublimacion';
          return t === selectedTechnique;
        });
        if (!matchesTech) return false;
      }
      // Search term
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = p.name?.toLowerCase().includes(q);
        const matchCode = p.code?.toLowerCase().includes(q);
        const matchDesc = p.shortDescription?.toLowerCase().includes(q);
        const matchMat = p.specifications?.material?.toLowerCase().includes(q);
        return matchName || matchCode || matchDesc || matchMat;
      }
      return true;
    });
  }, [products, activeWorld, selectedCategory, selectedTechnique, searchQuery]);

  // Promotions for current area — rotated dynamically
  const areaPromotions = useMemo(() => {
    const list = products.filter(p => p.isBundle && (activeWorld === 'all' || p.worlds?.includes(activeWorld)));
    if (!list || list.length <= 1) return list;

    let s = ((catalogSeed + 7129) * 9301 + 49297) % 233280;
    const rnd = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    const res = [...list];
    let m = res.length, t, i;
    while (m) {
      i = Math.floor(rnd() * m--);
      t = res[m];
      res[m] = res[i];
      res[i] = t;
    }
    return res;
  }, [products, activeWorld, catalogSeed]);

  // Regular products for catalog grid:
  // When on Home (activeWorld === 'all' and no active search or technique filters),
  // we include all products (including combos and diverse techniques) and round-robin them
  // so the visitor immediately sees a rich, balanced mix of everything the workshop creates ("aparezcan de todo").
  const regularProducts = useMemo(() => {
    const isHome = activeWorld === 'all' && selectedCategory === 'all' && selectedTechnique === 'all' && !searchQuery;
    const baseList = isHome ? filteredProducts : filteredProducts.filter(p => !p.isBundle);
    if (!baseList || baseList.length === 0) return [];

    const flashIds = flashDeal?.activeFlashProductIds || [];

    // Pseudo-random generator using catalogSeed and activeWorld
    const worldHash = (activeWorld || 'all').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    let s = ((catalogSeed + worldHash) * 9301 + 49297) % 233280;
    const rnd = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };

    const shuffle = (arr) => {
      const res = [...arr];
      let m = res.length, t, i;
      while (m) {
        i = Math.floor(rnd() * m--);
        t = res[m];
        res[m] = res[i];
        res[i] = t;
      }
      return res;
    };

    let list = baseList;
    if (isHome) {
      // Balanced interleaving by technique & combos so the home feed shows a diverse kaleidoscope of everything
      const buckets = {
        '3d': shuffle(baseList.filter(p => p.techniques?.includes('3d') && !p.isBundle)),
        'laser': shuffle(baseList.filter(p => p.techniques?.includes('laser') && !p.isBundle)),
        'sublimation': shuffle(baseList.filter(p => (p.techniques?.includes('sublimation') || p.techniques?.includes('sublimacion')) && !p.isBundle)),
        'bundle': shuffle(baseList.filter(p => p.isBundle)),
        'vinyl': shuffle(baseList.filter(p => (p.techniques?.includes('vinyl') || p.techniques?.includes('vinil')) && !p.isBundle)),
        'nfc': shuffle(baseList.filter(p => p.techniques?.includes('nfc') && !p.isBundle))
      };

      const keys = ['3d', 'laser', 'sublimation', 'bundle', 'vinyl', 'nfc'];
      const maxLen = Math.max(...Object.values(buckets).map(b => b.length));
      const seen = new Set();
      const interleaved = [];

      for (let i = 0; i < maxLen; i++) {
        for (const k of keys) {
          const item = buckets[k]?.[i];
          if (item && !seen.has(item.id)) {
            seen.add(item.id);
            interleaved.push(item);
          }
        }
      }

      baseList.forEach(item => {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          interleaved.push(item);
        }
      });

      list = interleaved;
    }

    const flashItems = shuffle(list.filter(p => flashIds.includes(p.id)));
    const nonFlashItems = list.filter(p => !flashIds.includes(p.id));

    if (flashItems.length === 0) return nonFlashItems;
    if (nonFlashItems.length === 0) return flashItems;

    const result = [...nonFlashItems];
    // Disperse flash deals organically across the grid (spaced out, never forced at index 0)
    const interval = Math.max(2, Math.floor(result.length / (flashItems.length + 1)));

    flashItems.forEach((flashProd, idx) => {
      const jitter = Math.floor(rnd() * 2); // 0 or 1
      const targetIdx = Math.min(result.length, Math.max(1, (idx + 1) * interval + jitter - 1));
      result.splice(targetIdx, 0, flashProd);
    });

    return result;
  }, [filteredProducts, flashDeal?.activeFlashProductIds, catalogSeed, activeWorld, selectedCategory, selectedTechnique, searchQuery]);

  // Go to Home handler
  const handleGoHome = () => {
    playSoftAreaSwitchSound();
    setActiveWorld('all');
    setSelectedCategory('all');
    setSelectedTechnique('all');
    setSearchQuery('');
    setViewMode('catalog');
    setCatalogSeed(Date.now());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // World / Area selector handler
  const handleSelectWorld = (worldId) => {
    playSoftAreaSwitchSound();
    setSearchQuery(''); // Limpia la búsqueda para que el catálogo o paquetes abran inmediatamente
    setActiveWorld(worldId);
    setSelectedCategory('all');
    setViewMode('catalog');
    setCatalogSeed(Date.now());
    // Posicionar limpiamente arriba de la pantalla para evitar saltos erráticos hacia abajo
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Jump directly to packages of a specific area
  const handleSelectPackages = (area = 'all') => {
    playSoftAreaSwitchSound();
    setSearchQuery(''); // Limpia búsqueda para mostrar de inmediato la vista de paquetes
    setPackagesInitialArea(area);
    setActiveWorld('paquetes-servicios');
    setSelectedCategory('all');
    setViewMode('catalog');
    setCatalogSeed(Date.now());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart operations
  const handleAddToCart = (newItem) => {
    playCoinSound();
    setCartItems(prev => {
      // Find if duplicate with exact same variants & text exists
      const existingIdx = prev.findIndex(item => 
        item.product.id === newItem.product.id &&
        JSON.stringify(item.selectedVariants) === JSON.stringify(newItem.selectedVariants) &&
        item.customText === newItem.customText
      );

      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += newItem.quantity;
        return updated;
      } else {
        return [...prev, newItem];
      }
    });

    // Record quote started event
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'quote_started', payload: { productId: newItem.product.id, code: newItem.product.code } })
    }).catch(() => {});

    setIsCartOpen(true);
    setSelectedProduct(null);
  };

  const handleUpdateQuantity = (idx, newQty) => {
    setCartItems(prev => {
      const updated = [...prev];
      updated[idx].quantity = newQty;
      return updated;
    });
  };

  const handleRemoveItem = (idx) => {
    playMarioPowerDownSound();
    setCartItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleClearCart = () => {
    playMarioPowerDownSound();
    setCartItems([]);
  };

  // Open Quote Calculator for a specific product or general
  const handleOpenCalculator = (product = null) => {
    setCalculatorProduct(product || null);
    setIsCalculatorOpen(true);
  };

  // Direct single-product WhatsApp quote
  const handleDirectWhatsAppQuote = ({ product, quantity, selectedVariants, customText }) => {
    let activePub = '';
    try {
      activePub = localStorage.getItem('artesano_active_pub') || '';
    } catch {}

    let msg = `*CONSULTA DIRECTA — ARTESANO DIGITAL*\n`;
    msg += `--------------------------------------\n`;
    msg += `Hola, me interesa cotizar el siguiente producto:\n\n`;
    msg += `• *[${product.code}] ${product.name}*\n`;
    msg += `• Cantidad: *${quantity} ${product.priceUnit || 'piezas'}*\n`;

    if (selectedVariants && Object.keys(selectedVariants).length > 0) {
      const vars = Object.entries(selectedVariants).map(([k, v]) => `${k}: ${v}`).join(', ');
      msg += `• Opciones: ${vars}\n`;
    }

    if (customText && customText.trim()) {
      msg += `• Personalización deseada: "${customText.trim()}"\n`;
    }

    if (product.priceType === 'quote' || product.price === null) {
      msg += `• Precio: A cotizar por diseño\n`;
    } else {
      msg += `• Precio de referencia: $${product.price} MXN\n`;
    }

    if (activePub) {
      msg += `\n🏷️ *Ref. Publicación:* [${activePub}]\n`;
    }

    if (settings?.serviceStatus?.isPaused) {
      const resumeStr = formatServiceDate(settings.serviceStatus.pausedUntilDate) || 'próximo aviso';
      msg += `\n⏸️ *Nota:* Taller reanuda actividades el ${resumeStr}.\n`;
    }

    msg += `\n_¿Podrían indicarme tiempos de entrega y costo con envío?_`;

    const phone = (settings?.whatsappNumber || '5215500000000').replace(/[^0-9]/g, '');
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

    // Track dedicated publication WhatsApp click
    fetch('/api/tracking/whatsapp-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pubCode: activePub || 'desconocido',
        productId: product.id,
        code: product.code,
        amount: product.price ? product.price * quantity : null,
        context: 'product_direct'
      })
    }).catch(() => {});

    // General analytics fallback
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'whatsapp_click', payload: { pubCode: activePub, productId: product.id, code: product.code } })
    }).catch(() => {});

    window.open(url, '_blank');
  };

  const handleTrackWhatsAppQuote = (payload = {}) => {
    let activePub = '';
    try {
      activePub = localStorage.getItem('artesano_active_pub') || 'desconocido';
    } catch {
      activePub = 'desconocido';
    }

    fetch('/api/tracking/whatsapp-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pubCode: activePub,
        ...payload
      })
    }).catch(() => {});

    fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'whatsapp_click', payload: { pubCode: activePub, ...payload } })
    }).catch(() => {});
  };

  const totalCartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  // Active Category Name
  const currentCategoryObj = categories.find(c => c.id === selectedCategory);
  const currentWorldObj = worlds.find(w => w.id === activeWorld);

  const mobileSlides = useMemo(() => {
    if (campaignsConfig?.monthlyEvents?.showcaseSlides?.length > 0) {
      return campaignsConfig.monthlyEvents.showcaseSlides;
    }
    return [
      {
        id: 'hogar-estilo',
        image: '/uploads/img_001.jpg',
        badge: 'Hogar & Decoración',
        title: 'Colección Hogar & Decoración',
        description: 'Lámparas 3D, maceteros geométricos y percheros de pared',
        worldId: 'hogar'
      },
      {
        id: 'branding-comercial',
        image: '/uploads/pack_barberia_boutique_contexto.jpg',
        badge: 'Negocios & Marcas',
        title: 'Branding Comercial & Mostrador',
        description: 'Señalética inteligente, QR y enlaces NFC para negocios',
        worldId: 'negocios'
      },
      {
        id: 'bodas-eventos',
        image: '/uploads/bienvenida_ceremonia_boda.jpg',
        badge: 'Eventos Especiales',
        title: 'Bodas, XV Años & Recuerdos',
        description: 'Letreros de bienvenida, copas grabadas y souvenirs de taller',
        worldId: 'eventos'
      },
      {
        id: 'setup-gamer',
        image: '/uploads/kit_home_office_gamer_contexto.jpg',
        badge: 'Setup & Gaming',
        title: 'Setup Gamer & Home Office',
        description: 'Soportes de audífonos, bandejas y organizadores 3D',
        worldId: 'hogar'
      }
    ];
  }, [campaignsConfig]);

  const handleMobileNavTab = (tab) => {
    setMobileNavTab(tab);
    if (tab === 'home') {
      setActiveWorld('all');
      setSelectedCategory('all');
      setSelectedTechnique('all');
      setSearchQuery('');
      setViewMode('catalog');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'categories') {
      setIsCategoriesModalOpen(true);
    } else if (tab === 'cart') {
      setIsCartOpen(true);
    } else if (tab === 'arcade') {
      handleOpenArcade('play');
    } else if (tab === 'more') {
      setIsMoreMenuOpen(true);
    }
  };

  const handleOpenWhatsAppDirect = () => {
    if (settings?.whatsappNumber) {
      window.open(
        `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hola%20Artesano%20Digital,%20tengo%20una%20consulta.`,
        '_blank'
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1F2421] pb-20 lg:pb-0">
      
      {/* Top Navigation para Escritorio */}
      <div className="hidden md:block">
        <Navbar
          activeWorld={activeWorld}
          onSelectWorld={handleSelectWorld}
          onGoHome={handleGoHome}
          cartCount={totalCartCount}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenAdmin={() => setIsAdminOpen(true)}
          onOpenArcade={handleOpenArcade}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          settings={settings}
        />
      </div>

      {/* Top Navigation para Móviles estilo Mercado Libre */}
      <MobileMercadoLibreHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearSearch={() => setSearchQuery('')}
        activeWorld={activeWorld}
        onSelectWorld={handleSelectWorld}
        onOpenCart={() => setIsCartOpen(true)}
        cartCount={totalCartCount}
        onOpenWhatsApp={handleOpenWhatsAppDirect}
        onOpenCalculator={() => handleOpenCalculator()}
        onOpenArcade={() => handleOpenArcade('play')}
        onOpenFlashDeals={() => {
          setActiveWorld('all');
          setViewMode('catalog');
          const el = document.getElementById('catalogo-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        settings={settings}
      />

      {/* BANNER DE ESTADO DE SERVICIO: LOCAL, NACIONAL Y PAUSA DE TALLER (Escritorio) */}
      {settings?.serviceStatus?.isPaused ? (
        <div className="hidden md:block bg-gradient-to-r from-[#9E472A] via-[#B8573C] to-[#9E472A] text-white py-3 px-4 shadow-sm border-b border-black/20 animate-in fade-in">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-white/20 backdrop-blur-xs shrink-0 shadow-2xs">
                <Calendar className="w-5 h-5 text-amber-200" />
              </span>
              <div>
                <div className="font-extrabold text-sm sm:text-base flex items-center gap-2 flex-wrap">
                  <span>⏸️ Aviso de Taller: No hay servicio hasta el {formatServiceDate(settings.serviceStatus.pausedUntilDate) || 'próximo aviso'}</span>
                  <span className="px-2 py-0.2 rounded-full bg-black/25 text-amber-200 text-[10px] font-bold uppercase tracking-wider">
                    {settings.serviceStatus.pausedReason || 'Receso de taller'}
                  </span>
                </div>
                <p className="text-white/90 text-[11px] mt-0.5 leading-relaxed">
                  {settings.serviceStatus.pausedCustomMessage || 'Estamos en periodo de receso. Reanudamos producción de pedidos en esa fecha. Puedes seguir explorando y enviar tu cotización para ser agendada en orden.'}
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-white text-[#9E472A] text-[11px] font-black shrink-0 shadow-2xs">
              Cotizaciones activas
            </span>
          </div>
        </div>
      ) : (settings?.serviceStatus?.localService === false || settings?.serviceStatus?.nationalService === false) ? (
        <div className="hidden md:block bg-[#1F2421] text-amber-300 py-2.5 px-4 border-b border-amber-900/40 text-xs shadow-2xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <span className="text-[11.5px]">
                {settings.serviceStatus.localService && settings.serviceStatus.nationalService === false ? (
                  <span>📍 <strong>Aviso de Cobertura:</strong> Servicio activo únicamente para entregas locales y recolección en taller. Los envíos nacionales se encuentran temporalmente en pausa.</span>
                ) : settings.serviceStatus.localService === false && settings.serviceStatus.nationalService ? (
                  <span>📦 <strong>Aviso de Cobertura:</strong> Envíos nacionales activos a toda la República. Las entregas locales en taller están temporalmente pausadas.</span>
                ) : (
                  <span>⏸️ <strong>Aviso de Taller:</strong> Los servicios de entrega se encuentran en pausa temporal. Puedes dejar tu cotización en espera.</span>
                )}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {/* VISTA MÓVIL ESTILO MERCADO LIBRE: Banner Compacto + Cortinilla + Ofertas Relámpago */}
      {activeWorld === 'all' && !searchQuery && (
        <div className="md:hidden">
          <MobileBannerCarousel
            slides={mobileSlides}
            onSelectSlide={handleSelectWorld}
            settings={settings}
          />
          <MobileFlashDealsSection
            products={products}
            flashDeal={flashDeal}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onAddToCart={handleAddToCart}
          />
        </div>
      )}

      {/* Hero Section para Escritorio (Oculto en Móviles para dar paso a la vista compacta) */}
      {activeWorld === 'all' && !searchQuery && (
        <div className="hidden md:block">
          <Hero
            onExploreCatalog={() => {
              const el = document.getElementById('areas-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onOpenWorld={handleSelectWorld}
            settings={settings}
            campaignsConfig={campaignsConfig}
          />
        </div>
      )}

      {/* Categories & Areas Overview para Escritorio (Oculto en Móviles) */}
      {activeWorld === 'all' && !searchQuery && (
        <div className="hidden md:block">
          <WorldSelector
            worlds={worlds}
            activeWorld={activeWorld}
            onSelectWorld={handleSelectWorld}
            categories={categories}
          />
        </div>
      )}

      {/* Area Cover Banner (when a specific area is selected) */}
      {activeWorld !== 'all' && activeWorld !== 'paquetes-servicios' && currentWorldObj && (
        <div className="relative bg-[#1F2421] text-white overflow-hidden py-10 sm:py-14 border-b border-black/20">
          <div className="absolute inset-0 opacity-20">
            <img src={currentWorldObj.image} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#1F2421] via-[#1F2421]/90 to-transparent"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                  Colección Oficial
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold font-heading">
                  {currentWorldObj.name}
                </h1>
                <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
                  {currentWorldObj.description}
                </p>
              </div>

              {/* Botón de Paquetes y Promociones dentro de cada Área */}
              {areaPromotions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setViewMode(viewMode === 'promotions' ? 'catalog' : 'promotions')}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0 ${
                    viewMode === 'promotions'
                      ? 'bg-white text-[#1F2421] hover:bg-gray-100 ring-2 ring-white/20'
                      : 'bg-[#D82B6E] text-white hover:bg-[#c0235e]'
                  }`}
                >
                  <span>{viewMode === 'promotions' ? '← Ver catálogo regular' : `🎁 Ver paquetes y promociones de ${currentWorldObj.name}`}</span>
                  <span className="px-2 py-0.5 rounded-full bg-black/20 text-white text-[11px] font-black">
                    {areaPromotions.length}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Vista Dedicada de Paquetes y Servicios por Áreas */}
      {activeWorld === 'paquetes-servicios' ? (
        <PackagesAndServicesView
          products={products}
          onSelectProduct={(prod) => setSelectedProduct(prod)}
          onAddToCart={handleAddToCart}
          onOpenCalculator={handleOpenCalculator}
          settings={settings}
          initialAreaFilter={packagesInitialArea}
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery('')}
        />
      ) : (
        /* Main Catalog Section */
        <main id="catalogo-section" className="flex-1">
        
        {/* Breadcrumbs Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-1">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 font-medium overflow-x-auto scrollbar-none">
            <button
              onClick={handleGoHome}
              className="hover:text-[#1F2421] flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Inicio</span>
            </button>

            {activeWorld !== 'all' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setViewMode('catalog');
                  }}
                  className={`capitalize shrink-0 cursor-pointer ${selectedCategory === 'all' && viewMode === 'catalog' ? 'font-bold text-[#1F2421]' : 'hover:text-[#1F2421]'}`}
                >
                  {currentWorldObj ? currentWorldObj.name : activeWorld}
                </button>
              </>
            )}

            {viewMode === 'promotions' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="font-bold text-[#D82B6E] shrink-0">
                  🎁 Paquetes y Promociones
                </span>
              </>
            )}

            {selectedCategory !== 'all' && currentCategoryObj && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="font-bold text-[#2D4F3E] shrink-0">
                  {currentCategoryObj.name}
                </span>
              </>
            )}

            {searchQuery && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="font-bold text-gray-700 shrink-0">
                  Búsqueda: "{searchQuery}"
                </span>
              </>
            )}
          </nav>
        </div>

        {/* Dynamic Filters Bar with Paquetes & Promociones Switcher */}
        <FiltersBar
          activeWorld={activeWorld}
          onSelectWorld={handleSelectWorld}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedTechnique={selectedTechnique}
          onSelectTechnique={setSelectedTechnique}
          totalResults={viewMode === 'promotions' ? areaPromotions.length : (searchQuery ? filteredProducts.length : regularProducts.length)}
          onResetFilters={handleGoHome}
          viewMode={viewMode}
          onToggleViewMode={setViewMode}
          promosCount={areaPromotions.length}
        />

        {/* Paquetes & Promociones View (Only when viewMode === 'promotions') */}
        {viewMode === 'promotions' && (
          <div className="py-6">
            <PromotionsSection
              promotions={products.filter(p => p.isBundle)}
              activeWorld={activeWorld}
              onSelectProduct={(promo) => setSelectedProduct(promo)}
              onAddToCart={handleAddToCart}
              onOpenCalculator={handleOpenCalculator}
              settings={settings}
            />
          </div>
        )}

        {/* Regular Products Grid (when in catalog view or searching) */}
        {viewMode === 'catalog' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            
            {loading ? (
              <div className="py-24 text-center space-y-3">
                <img
                  src="/brand/artesano_isotipo_transparente.png"
                  alt="Cargando"
                  className="w-10 h-10 object-contain mx-auto animate-bounce"
                />
                <p className="text-xs text-gray-500 font-medium">Cargando catálogo Artesano Digital...</p>
              </div>
            ) : (searchQuery ? filteredProducts : regularProducts).length === 0 ? (
              <div className="py-20 text-center space-y-4 bg-white rounded-3xl border border-[#E8E4DA] p-8 max-w-lg mx-auto">
                <div className="w-14 h-14 rounded-full bg-[#F4F0E8] text-[#2D4F3E] flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6 opacity-60" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#1F2421]">No se encontraron productos</h3>
                  <p className="text-xs text-gray-500">
                    Prueba cambiando los filtros de técnica o buscando por otro término.
                  </p>
                </div>
                <button
                  onClick={handleGoHome}
                  className="px-5 py-2.5 rounded-full bg-[#2D4F3E] text-white text-xs font-semibold hover:bg-[#20392C] cursor-pointer"
                >
                  Ver todo el catálogo
                </button>
              </div>
            ) : (
              <div className="space-y-10">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                  {(searchQuery ? filteredProducts : regularProducts).map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isFlashDeal={flashDeal.isProductOnFlashDeal(product.id)}
                      flashDeal={flashDeal}
                      onSelectProduct={() => setSelectedProduct(product)}
                      onOpenDetail={() => setSelectedProduct(product)}
                      onQuickAdd={() => setSelectedProduct(product)}
                      onAddToCart={handleAddToCart}
                      onOpenCalculator={handleOpenCalculator}
                    />
                  ))}
                </div>

                {/* Servicio Patch Bar en Vivo en Eventos (al final de los productos, justo antes de los paquetes combo de cada área) */}
                {activeWorld === 'eventos' && !searchQuery && selectedCategory === 'all' && viewMode === 'catalog' && (
                  <div className="pt-2">
                    <PatchBarShowcase
                      onOpenPatchBarProduct={() => {
                        const p = products.find(x => x.code === 'EV-PATCHBAR');
                        if (p) setSelectedProduct(p);
                      }}
                      settings={settings}
                    />
                  </div>
                )}

                {/* Navegación al final del catálogo: Otros apartados y Paquetes de cada área */}
                {regularProducts.length > 0 && !searchQuery && (
                  <CatalogBottomNav
                    activeWorld={activeWorld}
                    currentWorldName={currentWorldObj?.name}
                    onSelectWorld={handleSelectWorld}
                    onSelectPackages={handleSelectPackages}
                    onScrollToTop={() => {
                      const el = document.getElementById('catalogo-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                  />
                )}
              </div>
            )}

          </div>
        )}

      </main>
      )}

      {/* Product Detail Modal with Loop Navigation */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          settings={settings}
          isFlashDeal={flashDeal.isProductOnFlashDeal(selectedProduct.id)}
          flashDeal={flashDeal}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onOpenArcade={handleOpenArcade}
          onDirectWhatsAppQuote={handleDirectWhatsAppQuote}
          onOpenCalculator={handleOpenCalculator}
          relatedProducts={products.filter(p => p.id !== selectedProduct.id && p.worlds?.some(w => selectedProduct.worlds?.includes(w)))}
          onSelectRelated={(prod) => setSelectedProduct(prod)}
          onNextProduct={() => {
            const list = activeWorld !== 'all' 
              ? products.filter(p => !p.isBundle && p.worlds?.includes(activeWorld))
              : products.filter(p => !p.isBundle);
            const idx = list.findIndex(p => p.id === selectedProduct.id);
            if (idx >= 0 && list.length > 1) {
              const next = (idx + 1) % list.length;
              setSelectedProduct(list[next]);
            }
          }}
          onPrevProduct={() => {
            const list = activeWorld !== 'all' 
              ? products.filter(p => !p.isBundle && p.worlds?.includes(activeWorld))
              : products.filter(p => !p.isBundle);
            const idx = list.findIndex(p => p.id === selectedProduct.id);
            if (idx >= 0 && list.length > 1) {
              const prev = (idx - 1 + list.length) % list.length;
              setSelectedProduct(list[prev]);
            }
          }}
        />
      )}

      {/* Quote Drawer (Shopping Cart Slide-Over) */}
      <QuoteDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        settings={settings}
        onTrackWhatsApp={handleTrackWhatsAppQuote}
        onOpenArcade={handleOpenArcade}
      />

      {/* Admin Panel Modal */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onRefreshCatalog={loadCatalogData}
        flashDeal={flashDeal}
      />



      {/* Workshop & Craftsmanship Showcase */}
      {activeWorld === 'all' && !searchQuery && (
        <CraftShowcase settings={settings} />
      )}

      {/* Footer */}
      <Footer
        onSelectWorld={handleSelectWorld}
        onOpenAdmin={() => setIsAdminOpen(true)}
        settings={settings}
      />

      {/* Reloj en pantalla para ofertas relámpago de 15 minutos (ubicado a la derecha) */}
      <BlitzClockWidget
        blitzDeal={flashDeal.activeBlitzDeal}
        onSelectProduct={(prod) => setSelectedProduct(prod)}
        isArcadeOpen={isArcadeOpen}
      />

      {/* Botón Flotante Sutil: Easter Egg Arcade del Taller (visible en móvil y escritorio) */}
      {settings?.arcadeConfig?.enabled !== false && settings?.arcadeConfig?.showFloatingEasterEgg !== false && !isArcadeOpen && (
        <div className="fixed bottom-20 sm:bottom-5 left-3 sm:left-4 z-40">
          <button
            type="button"
            onClick={() => handleOpenArcade('play')}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#17251E]/95 hover:bg-[#17251E] text-white text-xs font-bold border border-[#D4A359]/50 shadow-2xl backdrop-blur-md transition-all hover:scale-105 active:scale-95 group cursor-pointer"
            title="Arcade del Taller: Juega y gana cupones de descuento"
          >
            <span className="text-base group-hover:rotate-12 transition-transform">🕹️</span>
            <span className="font-heading text-[#F5D061] hidden xs:inline">Arcade del Taller</span>
            <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.2 rounded-full font-mono font-bold shadow-xs">
              Cupones
            </span>
          </button>
        </div>
      )}

      {/* Modal Arcade Global con soporte para tab inicial */}
      {isArcadeOpen && (
        <WorkshopArcadeModal
          isOpen={isArcadeOpen}
          onClose={() => setIsArcadeOpen(false)}
          initialTab={arcadeInitialTab}
          arcadeConfig={settings?.arcadeConfig}
          activeTheme={settings?.arcadeConfig?.activeTheme || 'clasico'}
        />
      )}

      {/* Floating Right Side Navigation (Home, Logo de Catálogo, Calculadora & Carrito) */}
      <FloatingSideNav
        onGoToAreas={() => {
          setActiveWorld('all');
          setSelectedCategory('all');
          setSelectedTechnique('all');
          setSearchQuery('');
          setViewMode('catalog');
          const el = document.getElementById('areas-section') || document.getElementById('catalogo-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onGoToCatalog={() => {
          setActiveWorld('all');
          setSelectedCategory('all');
          setSelectedTechnique('all');
          setSearchQuery('');
          setViewMode('catalog');
          const el = document.getElementById('areas-section') || document.getElementById('catalogo-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onGoHome={() => {
          setActiveWorld('all');
          setSelectedCategory('all');
          setSelectedTechnique('all');
          setSearchQuery('');
          setViewMode('catalog');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCalculator={handleOpenCalculator}
        onOpenCart={() => setIsCartOpen(true)}
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
      />

      {/* Interactive Quote Calculator Modal */}
      <QuoteCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        product={calculatorProduct}
        allProducts={products}
        settings={settings}
        onAddToCart={handleAddToCart}
      />

      {/* Barra Inferior Fija para Celular estilo Mercado Libre (5 Botones Nativos) */}
      <MobileBottomNav
        activeTab={mobileNavTab}
        onSelectTab={handleMobileNavTab}
        cartCount={totalCartCount}
      />

      {/* Vista de Categorías Master-Detail para Celular estilo Mercado Libre */}
      <MobileCategoriesModal
        isOpen={isCategoriesModalOpen}
        onClose={() => {
          setIsCategoriesModalOpen(false);
          setMobileNavTab('home');
        }}
        categories={categories}
        worlds={worlds}
        onSelectWorld={handleSelectWorld}
        onSelectCategory={setSelectedCategory}
        onSelectTechnique={setSelectedTechnique}
      />

      {/* Menú 'Más' para Celular estilo Mercado Libre */}
      <MobileMoreMenuModal
        isOpen={isMoreMenuOpen}
        onClose={() => {
          setIsMoreMenuOpen(false);
          setMobileNavTab('home');
        }}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenArcade={handleOpenArcade}
        onOpenCalculator={() => handleOpenCalculator()}
        onOpenWhatsApp={handleOpenWhatsAppDirect}
        onSelectPackages={handleSelectPackages}
        settings={settings}
      />

    </div>
  );
}
