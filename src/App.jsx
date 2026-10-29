import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import QuoteCalculatorModal from './components/QuoteCalculatorModal';
import FloatingSideNav from './components/FloatingSideNav';
import TemuUrgencyModule from './components/TemuUrgencyModule';
import PackagesAndServicesView from './components/PackagesAndServicesView';
import ServiciosView from './components/ServiciosView';
import HomePackageCard from './components/HomePackageCard';
import BlitzClockWidget from './components/BlitzClockWidget';
import CatalogBottomNav from './components/CatalogBottomNav';
import WorkshopArcadeModal from './components/WorkshopArcadeModal';
import MobileMercadoLibreHeader from './components/MobileMercadoLibreHeader';
import MobileBannerCarousel from './components/MobileBannerCarousel';
import MobileBottomNav from './components/MobileBottomNav';
import MobileCategoriesModal from './components/MobileCategoriesModal';
import MobileSidebarDrawer from './components/MobileSidebarDrawer';
import CatalogSelectorModal from './components/CatalogSelectorModal';
import { useFlashDeal } from './hooks/useFlashDeal';
import { Home, Briefcase, CalendarHeart, Sparkles, ChevronRight, ShoppingBag, Layers, MessageCircle, Gift, RotateCw, Calendar, AlertTriangle, MapPin, Truck, Gamepad2 } from 'lucide-react';
import { formatServiceDate } from './utils/serviceStatus';
import { playCoinSound, playSoftAreaSwitchSound, playMarioPowerDownSound } from './utils/soundEffects';
import catalogFallbackData from './data/catalogFallback.json';

const normalizeAssetUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  if (/^(https?:|data:|blob:|\/\/)/.test(url)) return url;
  if (url.startsWith('/')) return '.' + url;
  return url;
};

const normalizeProductItem = (p) => {
  if (!p) return p;
  return {
    ...p,
    primaryImage: normalizeAssetUrl(p.primaryImage),
    whiteBgImage: normalizeAssetUrl(p.whiteBgImage),
    detailImage: normalizeAssetUrl(p.detailImage),
    measureImage: normalizeAssetUrl(p.measureImage),
    dimensionsImage: normalizeAssetUrl(p.dimensionsImage),
    gallery: Array.isArray(p.gallery) ? p.gallery.map(normalizeAssetUrl) : []
  };
};

const normalizeWorldItem = (w) => {
  if (!w) return w;
  return {
    ...w,
    image: normalizeAssetUrl(w.image),
    bannerImage: normalizeAssetUrl(w.bannerImage),
    icon: normalizeAssetUrl(w.icon)
  };
};

const normalizeSettingsData = (s) => {
  if (!s) return s;
  const clone = { ...s };
  if (clone.campaignsConfig) {
    if (clone.campaignsConfig.bannerImage) {
      clone.campaignsConfig.bannerImage = normalizeAssetUrl(clone.campaignsConfig.bannerImage);
    }
    if (Array.isArray(clone.campaignsConfig.seasons)) {
      clone.campaignsConfig.seasons = clone.campaignsConfig.seasons.map(season => ({
        ...season,
        bannerImage: normalizeAssetUrl(season.bannerImage)
      }));
    }
    if (clone.campaignsConfig.monthlyEvents?.showcaseSlides) {
      clone.campaignsConfig.monthlyEvents.showcaseSlides = clone.campaignsConfig.monthlyEvents.showcaseSlides.map(slide => ({
        ...slide,
        image: normalizeAssetUrl(slide.image)
      }));
    }
  }
  return clone;
};

export default function App() {
  // Server Data (con inicio instantÃ¡neo desde respaldo estÃ¡tico)
  const [worlds, setWorlds] = useState(() => (catalogFallbackData.worlds || []).map(normalizeWorldItem));
  const [categories, setCategories] = useState(() => catalogFallbackData.categories || []);
  const [products, setProducts] = useState(() => (catalogFallbackData.products || []).map(normalizeProductItem));
  const [settings, setSettings] = useState(() => normalizeSettingsData(catalogFallbackData.settings || null));
  const [loading, setLoading] = useState(false);
  const [isArcadeOpen, setIsArcadeOpen] = useState(false);
  const [arcadeInitialTab, setArcadeInitialTab] = useState('play');

  const handleOpenArcade = (tab = 'play') => {
    playSoftAreaSwitchSound();
    setArcadeInitialTab(tab);
    setIsArcadeOpen(true);
  };
  const flashDeal = useFlashDeal(products, settings);

  // Navigation & Filter States
  const [activeWorld, setActiveWorld] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('area') || new URLSearchParams(window.location.search).get('view') || new URLSearchParams(window.location.search).get('world');
      if (p === 'industria' || p === 'publicidad-desarrollo' || p === 'servicios') return 'servicios';
      if (p === 'paquetes-servicios') return p;
      if (p) return p;
    }
    return 'all';
  });

  const [servicesInitialTab, setServicesInitialTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('area') || new URLSearchParams(window.location.search).get('view') || new URLSearchParams(window.location.search).get('tab');
      if (p === 'industria' || p === 'manufactura') return 'industria';
    }
    return 'diseno';
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTechnique, setSelectedTechnique] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [catalogSeed, setCatalogSeed] = useState(() => Math.floor(Math.random() * 1000000) + Date.now());
  const [packagesInitialArea, setPackagesInitialArea] = useState('all');

  // Aleatoriedad dinÃ¡mica: cada vez que el usuario cambie de pantalla, categorÃ­a o tÃ©cnica, se baraja una nueva posiciÃ³n
  useEffect(() => {
    setCatalogSeed(Math.floor(Math.random() * 1000000) + Date.now());
  }, [activeWorld, selectedCategory, selectedTechnique]);

  // Asegurar que al cambiar de Ã¡rea, categorÃ­a o vista el usuario SIEMPRE vea el inicio superior de la pÃ¡gina
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      try {
        window.history.scrollRestoration = 'manual';
      } catch (e) {}
    }
    // Salto instantÃ¡neo hacia la cima (top: 0) sin demoras de animaciÃ³n
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const frameId = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    });
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 35);
    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timer);
    };
  }, [activeWorld, selectedCategory, selectedTechnique]);

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
  const [campaignsConfig, setCampaignsConfig] = useState(() => catalogFallbackData.campaigns || null);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [isCatalogSelectorOpen, setIsCatalogSelectorOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(() => typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('menu'));
  const [mobileNavTab, setMobileNavTab] = useState(() => (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('menu')) ? 'menu' : 'home');

  const handleOpenCatalogSelector = () => {
    const catalogConfig = settings?.mobileCatalogConfig || {};
    const catalogs = (catalogConfig.catalogs || []).filter(c => c.enabled !== false);
    if (catalogs.length > 1) {
      setIsCatalogSelectorOpen(true);
    } else {
      const primaryCat = catalogs[0];
      const targetUrl = primaryCat?.fileUrl 
        ? `${primaryCat.fileUrl}${primaryCat.fileUrl.includes('?') ? '&' : '?'}download=1` 
        : (primaryCat?.id ? `/api/catalog-pdf/download/${primaryCat.id}?download=1` : '/downloads/catalogo_movil_artesano_digital.pdf?download=1');
      const targetName = primaryCat?.fileName || catalogConfig.fileName || 'Catalogo_Movil_Artesano_Digital.pdf';
      const link = document.createElement('a');
      link.href = targetUrl;
      link.download = targetName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

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

  // Apertura automÃ¡tica de producto cuando viene ?prod=... en la URL
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

  // SincronizaciÃ³n de restablecimiento inmediato de monedas de Arcade desde el servidor
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
    try {
      const fetchJsonWithFallback = async (liveUrl, staticUrl) => {
        try {
          const res = await fetch(liveUrl);
          if (res.ok) {
            const ct = res.headers.get('content-type') || '';
            if (ct.includes('application/json')) {
              return await res.json();
            }
          }
        } catch (_) {}
        try {
          const staticRes = await fetch(staticUrl);
          if (staticRes.ok) {
            const ct = staticRes.headers.get('content-type') || '';
            if (ct.includes('application/json') || staticUrl.endsWith('.json')) {
              return await staticRes.json();
            }
          }
        } catch (_) {}
        return null;
      };

      const [dataWorlds, dataCats, dataProds, dataSettings, dataCamp] = await Promise.all([
        fetchJsonWithFallback('/api/worlds', './api/worlds.json'),
        fetchJsonWithFallback('/api/categories', './api/categories.json'),
        fetchJsonWithFallback('/api/products?status=published', './api/products.json'),
        fetchJsonWithFallback('/api/settings', './api/settings.json'),
        fetchJsonWithFallback('/api/campaigns', './api/campaigns.json')
      ]);

      if (Array.isArray(dataWorlds) && dataWorlds.length > 0) setWorlds(dataWorlds.map(normalizeWorldItem));
      if (Array.isArray(dataCats) && dataCats.length > 0) setCategories(dataCats);
      if (Array.isArray(dataProds) && dataProds.length > 0) setProducts(dataProds.map(normalizeProductItem));
      if (dataSettings && typeof dataSettings === 'object') {
        let mergedSettings = dataSettings;
        try {
          const cached = JSON.parse(localStorage.getItem('artesano_settings_cache') || 'null');
          if (cached && typeof cached === 'object') {
            mergedSettings = {
              ...dataSettings,
              ...cached,
              categoryBackgroundPhotos: {
                ...(dataSettings.categoryBackgroundPhotos || {}),
                ...(cached.categoryBackgroundPhotos || {})
              }
            };
          }
        } catch {}
        setSettings(normalizeSettingsData(mergedSettings));
      }
      if (dataCamp && typeof dataCamp === 'object') setCampaignsConfig(dataCamp);
    } catch (err) {
      console.warn('CatÃ¡logo usando datos estÃ¡ticos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Area / World filter
      if (activeWorld !== 'all') {
        if (activeWorld === 'flash') {
          const hasDiscount = flashDeal?.isProductOnFlashDeal?.(p.id) || p.flashDealConfig?.discountPercent > 0 || (p.regularPrice && p.regularPrice > p.price);
          if (!hasDiscount) return false;
        } else if (!p.worlds || !p.worlds.includes(activeWorld)) {
          return false;
        }
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
          if (selectedTechnique === 'print') return t === 'print' || t === 'impresion_laser';
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

  // Paquetes para la vista actual (Inicio o Ãrea seleccionada) â€” rotados dinÃ¡micamente
  const currentAreaPackages = useMemo(() => {
    const list = products.filter(p => p.isBundle && (activeWorld === 'all' || p.worlds?.includes(activeWorld)));
    if (!list || list.length === 0) return [];

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
    const baseList = filteredProducts.filter(p => !p.isBundle);
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
      // Balanced interleaving by technique & personalizados al azar para que aparezca de todo
      const buckets = {
        '3d': shuffle(baseList.filter(p => p.techniques?.includes('3d') && !p.worlds?.includes('personalizados'))),
        'laser': shuffle(baseList.filter(p => p.techniques?.includes('laser'))),
        'sublimation': shuffle(baseList.filter(p => (p.techniques?.includes('sublimation') || p.techniques?.includes('sublimacion')))),
        'personalizados': shuffle(baseList.filter(p => p.worlds?.includes('personalizados'))),
        'vinyl': shuffle(baseList.filter(p => (p.techniques?.includes('vinyl') || p.techniques?.includes('vinil')))),
        'print': shuffle(baseList.filter(p => (p.techniques?.includes('print') || p.techniques?.includes('impresion_laser')))),
        'nfc': shuffle(baseList.filter(p => p.techniques?.includes('nfc')))
      };

      const keys = shuffle(['3d', 'laser', 'sublimation', 'personalizados', 'vinyl', 'print', 'nfc']);
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
    } else {
      // En categorÃ­as, Ã¡reas especÃ­ficas o filtros: barajado completo para que los productos siempre cambien de lugar
      list = shuffle(baseList);
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

  // Bucle infinito estilo Marketplace en la pantalla principal (scrolleo continuo de catÃ¡logo)
  const [infiniteLoopBatches, setInfiniteLoopBatches] = useState(1);
  const infiniteSentinelRef = useRef(null);

  // Reiniciar tandas al cambiar de Ã¡rea, categorÃ­a, tÃ©cnica o bÃºsqueda
  useEffect(() => {
    setInfiniteLoopBatches(1);
  }, [activeWorld, selectedCategory, selectedTechnique, searchQuery]);

  // Observador de intersecciÃ³n para aÃ±adir mÃ¡s tandas de productos al llegar al final
  useEffect(() => {
    const sentinel = infiniteSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry && entry.isIntersecting) {
        setInfiniteLoopBatches(prev => prev + 1);
      }
    }, {
      rootMargin: '400px'
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [searchQuery, filteredProducts.length, regularProducts.length]);

  // CatÃ¡logo continuo en bucle para sensaciÃ³n de abundancia infinita
  const loopedCatalogProducts = useMemo(() => {
    const baseList = searchQuery ? filteredProducts : regularProducts;
    if (!baseList || baseList.length === 0) return [];

    if (infiniteLoopBatches <= 1) {
      return baseList.map((p, idx) => ({ ...p, loopKey: `${p.id}-init-${idx}` }));
    }

    const res = [];
    for (let b = 0; b < infiniteLoopBatches; b++) {
      for (let i = 0; i < baseList.length; i++) {
        res.push({
          ...baseList[i],
          loopKey: `${baseList[i].id}-loop-${b}-${i}`
        });
      }
    }
    return res;
  }, [searchQuery, filteredProducts, regularProducts, infiniteLoopBatches]);

  // Go to Home handler
  const handleGoHome = () => {
    playSoftAreaSwitchSound();
    setActiveWorld('all');
    setSelectedCategory('all');
    setSelectedTechnique('all');
    setSearchQuery('');
    setCatalogSeed(Date.now());
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  // World / Area selector handler
  const handleSelectWorld = (worldId, tab, initialCategory = null) => {
    playSoftAreaSwitchSound();
    setSearchQuery(''); // Limpia la bÃºsqueda para que el catÃ¡logo abra inmediatamente
    if (worldId === 'industria') {
      setActiveWorld('servicios');
      setServicesInitialTab('industria');
    } else if (worldId === 'publicidad-desarrollo') {
      setActiveWorld('servicios');
      setServicesInitialTab('diseno');
    } else if (worldId === 'servicios') {
      setActiveWorld('servicios');
      if (tab) {
        setServicesInitialTab(tab);
      }
    } else {
      setActiveWorld(worldId);
    }
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    } else {
      setSelectedCategory('all');
    }
    setSelectedTechnique('all');
    setCatalogSeed(Date.now());
    // Posicionar limpiamente arriba de la pantalla para evitar saltos errÃ¡ticos hacia abajo
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  // Jump directly to an area to see its products and packages
  const handleSelectPackages = (area = 'all') => {
    handleSelectWorld(area === 'all' ? 'all' : area);
  };

  // Cart operations
  const handleAddToCart = (rawItem) => {
    if (!rawItem) return;
    const itemToAdd = rawItem.product
      ? rawItem
      : {
          product: rawItem,
          quantity: 1,
          selectedVariants: {},
          customText: ''
        };

    playCoinSound();
    setCartItems(prev => {
      // Find if duplicate with exact same variants & text exists
      const existingIdx = prev.findIndex(item => 
        item.product?.id === itemToAdd.product?.id &&
        JSON.stringify(item.selectedVariants || {}) === JSON.stringify(itemToAdd.selectedVariants || {}) &&
        (item.customText || '') === (itemToAdd.customText || '')
      );

      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx].quantity = (updated[existingIdx].quantity || 1) + (itemToAdd.quantity || 1);
        return updated;
      } else {
        return [...prev, itemToAdd];
      }
    });

    // Record quote started event
    if (itemToAdd.product?.id) {
      fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'quote_started', payload: { productId: itemToAdd.product.id, code: itemToAdd.product.code } })
      }).catch(() => {});
    }

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

    let msg = `*CONSULTA DIRECTA â€” ARTESANO DIGITAL*\n`;
    msg += `--------------------------------------\n`;
    msg += `Hola, me interesa cotizar el siguiente producto:\n\n`;
    msg += `â€¢ *[${product.code}] ${product.name}*\n`;
    msg += `â€¢ Cantidad: *${quantity} ${product.priceUnit || 'piezas'}*\n`;

    if (selectedVariants && Object.keys(selectedVariants).length > 0) {
      const vars = Object.entries(selectedVariants).map(([k, v]) => `${k}: ${v}`).join(', ');
      msg += `â€¢ Opciones: ${vars}\n`;
    }

    if (customText && customText.trim()) {
      msg += `â€¢ PersonalizaciÃ³n deseada: "${customText.trim()}"\n`;
    }

    if (product.priceType === 'quote' || product.price === null) {
      msg += `â€¢ Precio: A cotizar por diseÃ±o\n`;
    } else {
      msg += `â€¢ Precio de referencia: $${product.price} MXN\n`;
    }

    if (activePub) {
      msg += `\n*Ref. PublicaciÃ³n:* [${activePub}]\n`;
    }

    if (settings?.serviceStatus?.isPaused) {
      const resumeStr = formatServiceDate(settings.serviceStatus.pausedUntilDate) || 'prÃ³ximo aviso';
      msg += `\n*Nota de taller:* Taller reanuda actividades el ${resumeStr}.\n`;
    }

    msg += `\n_Â¿PodrÃ­an indicarme tiempos de entrega y costo con envÃ­o?_`;

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
        image: './uploads/img_001.jpg',
        badge: 'Hogar & DecoraciÃ³n',
        title: 'ColecciÃ³n Hogar & DecoraciÃ³n',
        description: 'LÃ¡mparas 3D, maceteros geomÃ©tricos y percheros de pared',
        worldId: 'hogar'
      },
      {
        id: 'branding-comercial',
        image: './uploads/pack_barberia_boutique_contexto.jpg',
        badge: 'Negocios & Marcas',
        title: 'Branding Comercial & Mostrador',
        description: 'SeÃ±alÃ©tica inteligente, QR y enlaces NFC para negocios',
        worldId: 'negocios'
      },
      {
        id: 'bodas-eventos',
        image: './uploads/bienvenida_ceremonia_boda.jpg',
        badge: 'Eventos Especiales',
        title: 'Bodas, XV AÃ±os & Recuerdos',
        description: 'Letreros de bienvenida, copas grabadas y souvenirs de taller',
        worldId: 'eventos'
      },
      {
        id: 'setup-gamer',
        image: './uploads/kit_home_office_gamer_contexto.jpg',
        badge: 'Setup & Gaming',
        title: 'Setup Gamer & Home Office',
        description: 'Soportes de audÃ­fonos, bandejas y organizadores 3D',
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
    } else if (tab === 'menu' || tab === 'more') {
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
          onOpenCatalog={handleOpenCatalogSelector}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          settings={settings}
        />
      </div>

      {/* Top Navigation para MÃ³viles estilo Mercado Libre */}
      {activeWorld !== 'industria' && activeWorld !== 'servicios' && activeWorld !== 'publicidad-desarrollo' && (
        <MobileMercadoLibreHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClearSearch={() => setSearchQuery('')}
          activeWorld={activeWorld}
          onSelectWorld={handleSelectWorld}
          onOpenCart={() => setIsCartOpen(true)}
          cartCount={totalCartCount}
          onToggleSidebar={() => setIsMoreMenuOpen(true)}
          settings={settings}
        />
      )}

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
                  <span>â¸ï¸ Aviso de Taller: No hay servicio hasta el {formatServiceDate(settings.serviceStatus.pausedUntilDate) || 'prÃ³ximo aviso'}</span>
                  <span className="px-2 py-0.2 rounded-full bg-black/25 text-amber-200 text-[10px] font-bold uppercase tracking-wider">
                    {settings.serviceStatus.pausedReason || 'Receso de taller'}
                  </span>
                </div>
                <p className="text-white/90 text-[11px] mt-0.5 leading-relaxed">
                  {settings.serviceStatus.pausedCustomMessage || 'Estamos en periodo de receso. Reanudamos producciÃ³n de pedidos en esa fecha. Puedes seguir explorando y enviar tu cotizaciÃ³n para ser agendada en orden.'}
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
                  <span><strong>Aviso de Cobertura:</strong> Servicio activo Ãºnicamente para entregas locales y recolecciÃ³n en taller. Los envÃ­os nacionales se encuentran temporalmente en pausa.</span>
                ) : settings.serviceStatus.localService === false && settings.serviceStatus.nationalService ? (
                  <span><strong>Aviso de Cobertura:</strong> EnvÃ­os nacionales activos a toda la RepÃºblica. Las entregas locales en taller estÃ¡n temporalmente pausadas.</span>
                ) : (
                  <span><strong>Aviso de Taller:</strong> Los servicios de entrega se encuentran en pausa temporal. Puedes dejar tu cotizaciÃ³n en espera.</span>
                )}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {/* BARRA DE FILTROS SUPERIOR EN PC: queda pegada bajo el navbar, antes del hero y de las Ã¡reas */}
      {!['servicios', 'publicidad-desarrollo', 'industria', 'paquetes-servicios'].includes(activeWorld) && (
        <div className="hidden md:block">
          <FiltersBar
            activeWorld={activeWorld}
            onSelectWorld={handleSelectWorld}
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedTechnique={selectedTechnique}
            onSelectTechnique={setSelectedTechnique}
            totalResults={searchQuery ? filteredProducts.length : regularProducts.length}
            onResetFilters={handleGoHome}
          />
        </div>
      )}

      {/* VISTA MÃ“VIL ESTILO MERCADO LIBRE: Banner Compacto + Cortinilla */}
      {activeWorld === 'all' && !searchQuery && (
        <div className="md:hidden">
          <MobileBannerCarousel
            slides={mobileSlides}
            onSelectSlide={handleSelectWorld}
            settings={settings}
          />
        </div>
      )}

      {/* Hero Section para Escritorio (Oculto en MÃ³viles para dar paso a la vista compacta) */}
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

      {/* Categories & Areas Overview para Escritorio (Oculto en MÃ³viles) */}
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
      {activeWorld !== 'all' && activeWorld !== 'paquetes-servicios' && activeWorld !== 'publicidad-desarrollo' && activeWorld !== 'industria' && activeWorld !== 'servicios' && currentWorldObj && (
        <div className="relative bg-[#1F2421] text-white overflow-hidden py-10 sm:py-14 border-b border-black/20">
          <div className="absolute inset-0 opacity-20">
            <img loading="lazy" src={currentWorldObj.image} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#1F2421] via-[#1F2421]/90 to-transparent"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                  ColecciÃ³n Oficial
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold font-heading">
                  {currentWorldObj.name}
                </h1>
                <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
                  {currentWorldObj.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vista Unificada de Servicios Especializados (DiseÃ±o, Publicidad & Manufactura Industrial) */}
      {(activeWorld === 'servicios' || activeWorld === 'publicidad-desarrollo' || activeWorld === 'industria') ? (
        <ServiciosView
          settings={settings}
          onGoHome={handleGoHome}
          onOpenCalculator={handleOpenCalculator}
          onSelectWorld={handleSelectWorld}
          initialTab={servicesInitialTab}
        />
      ) : activeWorld === 'paquetes-servicios' ? (
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

        {/* â”€â”€â”€ FILTROS EN MÃ“VIL â”€ la versiÃ³n de PC vive arriba, debajo del navbar â”€â”€â”€ */}
        <div className="md:hidden">
          <FiltersBar
            activeWorld={activeWorld}
            onSelectWorld={handleSelectWorld}
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedTechnique={selectedTechnique}
            onSelectTechnique={setSelectedTechnique}
            totalResults={searchQuery ? filteredProducts.length : regularProducts.length}
            onResetFilters={handleGoHome}
          />
        </div>

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
                  }}
                  className={`capitalize shrink-0 cursor-pointer ${selectedCategory === 'all' ? 'font-bold text-[#1F2421]' : 'hover:text-[#1F2421]'}`}
                >
                  {currentWorldObj ? currentWorldObj.name : activeWorld}
                </button>
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
                  BÃºsqueda: "{searchQuery}"
                </span>
              </>
            )}
          </nav>
        </div>

        {/* Banner Destacado MÃ³vil: Productos Personalizados */}
        {activeWorld === 'all' && !searchQuery && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-2">
            <div
              onClick={() => handleSelectWorld('personalizados')}
              className="rounded-2xl bg-gradient-to-r from-[#17251E] via-[#203a2c] to-[#121519] text-white p-3 sm:p-4 border border-emerald-500/30 shadow-md cursor-pointer flex items-center justify-between gap-3 active:scale-98 transition-transform"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex -space-x-3 shrink-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 border-white/20 bg-black/40 shadow-xs">
                    <img loading="lazy"
                      src="./uploads/personalizados-figuras-funko.jpg"
                      alt="Funko Custom"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 border-sky-400/50 bg-black/40 shadow-xs">
                    <img loading="lazy"
                      src="./uploads/personalizados-dibujo-figura-3d.jpg"
                      alt="De Dibujo a 3D"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                    Nuevo Â· 6 CategorÃ­as
                  </div>
                  <div className="font-heading font-black text-xs sm:text-sm text-white truncate">
                    Productos Personalizados
                  </div>
                  <div className="text-[11px] text-stone-300 truncate">
                    Mascotas, Parejas, Profesiones, Familia y De Dibujo a 3D
                  </div>
                </div>
              </div>

              <div className="shrink-0 px-3 py-1.5 rounded-xl bg-[#D4A359] text-[#121519] font-black text-xs flex items-center gap-1 shadow-xs">
                <span>Ver</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Filters Bar - REMOVIDO: ahora estÃ¡ arriba del breadcrumb */}

        {/* Catalog Grid with Interleaved Packages */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            
            {loading ? (
              <div className="py-24 text-center space-y-3">
                <img loading="lazy"
                  src="./brand/artesano_isotipo_transparente.png"
                  alt="Cargando"
                  className="w-10 h-10 object-contain mx-auto animate-bounce"
                />
                <p className="text-xs text-gray-500 font-medium">Cargando catÃ¡logo Artesano Digital...</p>
              </div>
            ) : (searchQuery ? filteredProducts : regularProducts).length === 0 ? (
              <div className="py-20 text-center space-y-4 bg-white rounded-3xl border border-[#E8E4DA] p-8 max-w-lg mx-auto">
                <div className="w-14 h-14 rounded-full bg-[#F4F0E8] text-[#2D4F3E] flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6 opacity-60" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#1F2421]">No se encontraron productos</h3>
                  <p className="text-xs text-gray-500">
                    Prueba cambiando los filtros de tÃ©cnica o buscando por otro tÃ©rmino.
                  </p>
                </div>
                <button
                  onClick={handleGoHome}
                  className="px-5 py-2.5 rounded-full bg-[#2D4F3E] text-white text-xs font-semibold hover:bg-[#20392C] cursor-pointer"
                >
                  Ver todo el catÃ¡logo
                </button>
              </div>
            ) : (
              <div className="space-y-10">
                {!searchQuery && currentAreaPackages.length > 0 ? (
                  /* Flujo intercalado en Inicio o en cada Ãrea: tandas de productos seguidas de un bloque designado de paquetes */
                  <div className="space-y-8 sm:space-y-12">
                    {Array.from({ length: Math.ceil(loopedCatalogProducts.length / 8) }).map((_, chunkIdx) => {
                      const chunkProds = loopedCatalogProducts.slice(chunkIdx * 8, (chunkIdx + 1) * 8);
                      const p1 = currentAreaPackages[(chunkIdx * 2) % currentAreaPackages.length];
                      const p2 = currentAreaPackages.length > 1
                        ? currentAreaPackages[(chunkIdx * 2 + 1) % currentAreaPackages.length]
                        : null;
                      const packagePair = [p1, p2].filter(Boolean);

                      return (
                        <React.Fragment key={`catalog-chunk-${activeWorld}-${chunkIdx}`}>
                          {/* CuadrÃ­cula de 8 productos regulares */}
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                            {chunkProds.map(product => (
                              <ProductCard
                                key={product.loopKey || `${product.id}-${chunkIdx}`}
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

                          {/* Bloque designado de paquetes intercalados para esta Ã¡rea */}
                          {packagePair.length > 0 && (
                            <div className="my-6 sm:my-8 p-3.5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#FAF8F5] via-[#F4EFE6] to-[#ECE5D8] border border-[#E8E4DA] shadow-xs">
                              <div className="flex items-center justify-between pb-2.5 sm:pb-3 mb-3 sm:mb-4 border-b border-[#E8E4DA]/80">
                                <div className="flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#D82B6E] animate-pulse"></span>
                                  <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#1F2421] font-heading">
                                    Paquetes &amp; Combos de Ahorro
                                  </span>
                                  <span className="hidden md:inline text-xs text-stone-500 font-medium">
                                    Â· {currentWorldObj ? `Soluciones coordinadas de ${currentWorldObj.name}` : 'Soluciones coordinadas de taller'}
                                  </span>
                                </div>
                                <span className="text-[11px] font-bold text-stone-600 bg-white px-2.5 sm:px-3 py-1 rounded-full border border-[#E8E4DA] shadow-2xs">
                                  {currentAreaPackages.length} {currentAreaPackages.length === 1 ? 'combo disponible' : 'combos disponibles'}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-6">
                                {packagePair.map((pkg, pIdx) => (
                                  <HomePackageCard
                                    key={`pkg-${activeWorld}-${chunkIdx}-${pkg.id}-${pIdx}`}
                                    packageItem={pkg}
                                    onSelectProduct={() => setSelectedProduct(pkg)}
                                    onAddToCart={handleAddToCart}
                                    onOpenCalculator={handleOpenCalculator}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                ) : (
                  /* CuadrÃ­cula estÃ¡ndar para bÃºsquedas o Ã¡reas sin paquetes */
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                    {loopedCatalogProducts.map(product => (
                      <ProductCard
                        key={product.loopKey || product.id}
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
                )}

                {/* Centinela de Scrolleo Infinito en Bucle Estilo Marketplace */}
                <div ref={infiniteSentinelRef} className="py-6 flex flex-col items-center justify-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 border border-[#E8E4DA] text-xs font-semibold text-gray-600 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-[#2D4F3E] animate-ping" />
                    <span>CatÃ¡logo continuo Â· Desliza para seguir explorando</span>
                  </div>
                </div>

                {/* Servicio Patch Bar en Vivo en Eventos (al final de los productos, justo antes de los paquetes combo de cada Ã¡rea) */}
                {activeWorld === 'eventos' && !searchQuery && selectedCategory === 'all' && (
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

                {/* NavegaciÃ³n al final del catÃ¡logo: Otros apartados y Paquetes de cada Ã¡rea */}
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

      </main>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          allProducts={products}
          activeWorld={activeWorld}
          onSelectProduct={(newProd) => setSelectedProduct(newProd)}
          settings={settings}
          isFlashDeal={flashDeal.isProductOnFlashDeal(selectedProduct.id)}
          flashDeal={flashDeal}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onOpenArcade={handleOpenArcade}
          onDirectWhatsAppQuote={handleDirectWhatsAppQuote}
          onOpenCalculator={handleOpenCalculator}
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

      {/* Reloj en pantalla para ofertas relÃ¡mpago de 15 minutos (ubicado a la derecha) */}
      <BlitzClockWidget
        blitzDeal={flashDeal.activeBlitzDeal}
        onSelectProduct={(prod) => setSelectedProduct(prod)}
        isArcadeOpen={isArcadeOpen}
      />

      {/* BotÃ³n Flotante Sutil: Easter Egg Arcade del Taller (sÃ³lo escritorio, en mÃ³vil estÃ¡ en el Bottom Nav) */}
      {settings?.arcadeConfig?.enabled !== false && settings?.arcadeConfig?.showFloatingEasterEgg !== false && !isArcadeOpen && (
        <div className="hidden md:block fixed bottom-5 left-4 z-40">
          <button
            type="button"
            onClick={() => handleOpenArcade('play')}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#17251E]/95 hover:bg-[#17251E] text-white text-xs font-bold border border-[#D4A359]/50 shadow-2xl backdrop-blur-md transition-all hover:scale-105 active:scale-95 group cursor-pointer"
            title="Arcade del Taller: Juega y gana cupones de descuento"
          >
            <Gamepad2 className="w-4 h-4 text-[#F5D061] group-hover:rotate-12 transition-transform shrink-0" />
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

      {/* Floating Right Side Navigation (Home, Logo de CatÃ¡logo, Calculadora & Carrito) */}
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

      {/* Barra Inferior Fija para Celular con Tema Adaptativo (Oscuro en Industria y Publicidad) */}
      {!isAdminOpen && !selectedProduct && (
        <MobileBottomNav
          activeTab={mobileNavTab}
          onSelectTab={handleMobileNavTab}
          cartCount={totalCartCount}
          activeWorld={activeWorld}
        />
      )}

      {/* Vista de CategorÃ­as Master-Detail para Celular estilo Mercado Libre */}
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

      {/* Barra Lateral Deslizable para MÃ³viles (Drawer con Cotizador, Arcade, CatÃ¡logo, WhatsApp y Admin) */}
      <MobileSidebarDrawer
        isOpen={isMoreMenuOpen}
        onClose={() => {
          setIsMoreMenuOpen(false);
          setMobileNavTab('home');
        }}
        onOpenAdmin={() => {
          setIsAdminOpen(true);
          setIsMoreMenuOpen(false);
          setMobileNavTab('home');
        }}
        onOpenArcade={handleOpenArcade}
        onOpenCalculator={() => handleOpenCalculator()}
        onOpenWhatsApp={handleOpenWhatsAppDirect}
        onSelectWorld={handleSelectWorld}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenCatalog={handleOpenCatalogSelector}
        cartCount={totalCartCount}
        settings={settings}
      />

      {/* Selector Interactivo de CatÃ¡logos de Temporada en PDF */}
      <CatalogSelectorModal
        isOpen={isCatalogSelectorOpen}
        onClose={() => setIsCatalogSelectorOpen(false)}
        settings={settings}
      />

    </div>
  );
}

