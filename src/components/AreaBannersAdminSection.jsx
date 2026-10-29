import React, { useState, useEffect } from 'react';
import {
import ImageOptimized from './ImageOptimized';
  Image as ImageIcon, Upload, Check, AlertTriangle, RefreshCw,
  Eye, Sparkles, Home, Briefcase, CalendarHeart, ExternalLink,
  Layers, ArrowRight, Save, Gift, Wrench, Palette, Gamepad2,
  CheckCircle2, RotateCcw, Power, Sliders, Printer, Globe, Film,
  Boxes
} from 'lucide-react';

const SUGGESTED_AREA_IMAGES = {
  hogar: [
    { label: 'Hogar CÃ¡lido & Madera', url: '/uploads/bundle_promo_hogar_1.jpg' },
    { label: 'LÃ¡mparas & DecoraciÃ³n NÃ³rdica', url: '/uploads/t38_lampara_madera_minimalista.png' },
    { label: 'Recibidor & Colgadores', url: '/uploads/l14_colgador_llaves_bienvenidos.png' },
    { label: 'Macetas & GeometrÃ­a 3D', url: '/uploads/t6_maceta_geometrica_espiral_olivo.png' }
  ],
  negocios: [
    { label: 'Identidad Corporativa & Mostrador', url: '/uploads/bundle_promo_biz_1.jpg' },
    { label: 'Smart Deck & Escritorios Tech', url: '/uploads/t39_smart_deck_streamer_workspace.png' },
    { label: 'Soportes de Mostrador & QR', url: '/uploads/t16_soporte_qr_mostrador_olivo.png' },
    { label: 'Soporte Inteligente NFC Contacto', url: '/uploads/t33_smart_nfc_prisma_olivo.png' }
  ],
  juguetes: [
    { label: 'Jaguar Articulado Print-in-Place', url: '/uploads/catalog-v2-j1-context-oficial.webp' },
    { label: 'Zorrito Articulado Flexible', url: '/uploads/catalog-v2-j2-context-oficial.webp' }
  ],
  personalizados: [
    { label: 'De Dibujo a 3D (Dinosaurio)', url: '/uploads/catalog-v2-cust-dibujo-dino-1.webp' },
    { label: 'De Dibujo a 3D (Ajolote)', url: '/uploads/catalog-v2-cust-dibujo-ajolote-1.webp' },
    { label: 'De Dibujo a 3D (Cohete)', url: '/uploads/catalog-v2-cust-dibujo-cohete-1.webp' },
    { label: 'Figura Personalizada Funko', url: '/uploads/catalog-v2-cust-dibujo-1.webp' }
  ],
  eventos: [
    { label: 'Bodas & Ceremonias RÃºsticas', url: '/uploads/bienvenida_ceremonia_boda.jpg' },
    { label: 'Letrero de Arco Nupcial', url: '/uploads/l2_letrero_bienvenida_arco_boda.png' },
    { label: 'Recuerdos & Fiestas Todo Incluido', url: '/uploads/bundle_promo_ev_1.jpg' },
    { label: 'NÃºmeros de Mesa 3D de Alta Presencia', url: '/uploads/t25_numero_mesa_07_volumen.png' }
  ],
  'paquetes-servicios': [
    { label: 'Combo Hogar Inteligente', url: '/uploads/bundle_promo_hogar_1.jpg' },
    { label: 'Combo Marca & Branding', url: '/uploads/bundle_promo_biz_1.jpg' },
    { label: 'Kit de Recuerdos para Boda', url: '/uploads/bundle_promo_ev_1.jpg' }
  ],
  industria: [
    { label: 'Tobera Automotriz Taller', url: '/uploads/catalog-v2-ind1-context-oficial.webp' },
    { label: 'Galga Calibradora de Taller', url: '/uploads/catalog-v2-ind2-context-oficial.webp' },
    { label: 'Prototipado en PolÃ­meros TÃ©cnicos', url: '/uploads/catalog-v2-ind1-detail-oficial.webp' }
  ],
  'publicidad-desarrollo': [
    { label: 'Branding y Publicidad', url: '/uploads/bundle_promo_biz_1.jpg' },
    { label: 'DiseÃ±o GrÃ¡fico & Digital', url: '/uploads/t39_smart_deck_streamer_workspace.png' }
  ],
  servicios: [
    { label: 'Branding, DiseÃ±o & Lonas', url: '/uploads/brand_artesano_digital_og.jpg' },
    { label: 'Manufactura Aditiva e Industria', url: '/uploads/industria_portada_oficial_ingenieria.webp' }
  ]
};

const AREA_METADATA = {
  hogar: {
    label: 'Hogar & Espacios',
    icon: Home,
    color: 'emerald',
    badgeText: 'ColecciÃ³n Oficial Hogar',
    gradient: 'from-[#17251E] via-[#22382B] to-[#121A15]'
  },
  negocios: {
    label: 'Negocios & Marcas',
    icon: Briefcase,
    color: 'amber',
    badgeText: 'ColecciÃ³n Oficial Negocios',
    gradient: 'from-[#251A10] via-[#352516] to-[#19130D]'
  },
  juguetes: {
    label: 'Juguetes & NiÃ±os',
    icon: Gamepad2,
    color: 'pink',
    badgeText: 'ColecciÃ³n Oficial Juguetes',
    gradient: 'from-[#2D1225] via-[#3D1A33] to-[#1F0C19]'
  },
  personalizados: {
    label: 'Personalizados & Figuras',
    icon: Sparkles,
    color: 'purple',
    badgeText: 'ColecciÃ³n Oficial Personalizados',
    gradient: 'from-[#22102E] via-[#311842] to-[#160B1E]'
  },
  eventos: {
    label: 'Eventos Especiales',
    icon: CalendarHeart,
    color: 'rose',
    badgeText: 'ColecciÃ³n Oficial Eventos',
    gradient: 'from-[#2D0F1B] via-[#3B1524] to-[#1A0B12]'
  },
  'paquetes-servicios': {
    label: 'Paquetes & Servicios',
    icon: Gift,
    color: 'teal',
    badgeText: 'ColecciÃ³n Oficial Paquetes',
    gradient: 'from-[#0F2826] via-[#173B38] to-[#0A1C1A]'
  },
  industria: {
    label: 'Industria TÃ©cnica',
    icon: Wrench,
    color: 'slate',
    badgeText: 'ColecciÃ³n Oficial Industria',
    gradient: 'from-[#1A202C] via-[#2D3748] to-[#171923]'
  },
  'publicidad-desarrollo': {
    label: 'DiseÃ±o & Publicidad',
    icon: Palette,
    color: 'indigo',
    badgeText: 'ColecciÃ³n Oficial DiseÃ±o & Publicidad',
    gradient: 'from-[#181B34] via-[#242A52] to-[#101224]'
  },
  servicios: {
    label: 'Servicios (DiseÃ±o & Industria)',
    icon: Layers,
    color: 'amber',
    badgeText: 'Centro Oficial de Servicios',
    gradient: 'from-[#17251E] via-[#23352B] to-[#0E1713]'
  }
};

// DefiniciÃ³n oficial de las 8 Tarjetas Selectoras (DiseÃ±o e Industria)
const SELECTION_CARDS_CATALOG = {
  diseno: [
    {
      key: 'branding',
      code: 'BRAND-01',
      title: 'Identidad de Marca',
      desc: 'Logotipos vectoriales, paleta de color y manual de marca para tu negocio.',
      defaultUrl: './portafolio/assets/artesano-cover.webp',
      badge: 'Identidad Visual',
      icon: Palette,
      accentColor: '#e8b84f',
      borderClass: 'border-[#e8b84f]',
      textAccent: 'text-[#e8b84f]'
    },
    {
      key: 'publicidad',
      code: 'PRINT-02',
      title: 'Lonas & Gran Formato',
      desc: 'Lonas de alta densidad, vinil cortado y microperforado para fachada o cancel.',
      defaultUrl: './portafolio/assets/civil-shirts.webp',
      badge: 'Gran Formato',
      icon: Printer,
      accentColor: '#10b981',
      borderClass: 'border-emerald-400',
      textAccent: 'text-emerald-400'
    },
    {
      key: 'web',
      code: 'DEV-03',
      title: 'Web & Tienda',
      desc: 'Sitios web responsivos, catÃ¡logos online y tiendas rÃ¡pidas optimizadas.',
      defaultUrl: './interfaces/assets/ui-01.jpg',
      badge: 'Desarrollo Web',
      icon: Globe,
      accentColor: '#06b6d4',
      borderClass: 'border-cyan-400',
      textAccent: 'text-cyan-400'
    },
    {
      key: 'editorial',
      code: 'EDIT-04',
      title: 'CatÃ¡logo & Redes',
      desc: 'MenÃºs digitales, catÃ¡logos en PDF y contenido grÃ¡fico para historias y posts.',
      defaultUrl: './portafolio/assets/popol-spread.webp',
      badge: 'Contenido & Impresos',
      icon: Film,
      accentColor: '#c084fc',
      borderClass: 'border-purple-400',
      textAccent: 'text-purple-400'
    }
  ],
  industria: [
    {
      key: 'proto',
      code: 'PROTO-01',
      title: 'Prototipos Funcionales',
      desc: 'ValidaciÃ³n rÃ¡pida de cotas, holguras y ensamble desde archivo 3D.',
      defaultUrl: './uploads/catalog-v2-ind1-context-oficial.webp',
      badge: 'ValidaciÃ³n RÃ¡pida',
      icon: Layers,
      accentColor: '#5BB8FF',
      borderClass: 'border-[#5BB8FF]',
      textAccent: 'text-[#5BB8FF]'
    },
    {
      key: 'jig',
      code: 'JIG-02',
      title: 'Utillaje y Herramientas',
      desc: 'Galgas de control, nidos Poka-Yoke y mordazas que no rayan piezas.',
      defaultUrl: './uploads/catalog-v2-ind2-context-oficial.webp',
      badge: 'LÃ­nea de ProducciÃ³n',
      icon: Wrench,
      accentColor: '#8FB99B',
      borderClass: 'border-[#8FB99B]',
      textAccent: 'text-[#8FB99B]'
    },
    {
      key: 'spare',
      code: 'SPARE-03',
      title: 'Refacciones y Obsoletos',
      desc: 'SustituciÃ³n de bujes, poleas y piezas descontinuadas desde 1 pieza.',
      defaultUrl: './uploads/industria_portada_oficial_ingenieria.webp',
      badge: 'SustituciÃ³n Directa',
      icon: RotateCcw,
      accentColor: '#fbbf24',
      borderClass: 'border-amber-400',
      textAccent: 'text-amber-400'
    },
    {
      key: 'batch',
      code: 'BATCH-04',
      title: 'Lotes Cortos y Preseries',
      desc: 'ProducciÃ³n continua de 10 a 500 piezas sin costo de apertura de molde.',
      defaultUrl: './uploads/catalog-v2-ind1-detail-oficial.webp',
      badge: 'Volumen Flexible',
      icon: Boxes,
      accentColor: '#c084fc',
      borderClass: 'border-purple-400',
      textAccent: 'text-purple-400'
    }
  ]
};

export default function AreaBannersAdminSection({
  token,
  businessSettings = null,
  onUpdateSettings = null,
  onWorldsUpdated = null
}) {
  // PestaÃ±a principal: 'cards' (Tarjetas de selecciÃ³n) o 'banners' (Banners de portada)
  const [activeSectionTab, setActiveSectionTab] = useState('cards');

  const [worlds, setWorlds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeAreaId, setActiveAreaId] = useState('publicidad-desarrollo');
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    image: ''
  });
  const [uploading, setUploading] = useState(false);
  const [uploadingCardKey, setUploadingCardKey] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savingCards, setSavingCards] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // ConfiguraciÃ³n de tarjetas (sincronizada con businessSettings)
  const [cardsConfig, setCardsConfig] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = JSON.parse(localStorage.getItem('artesano_settings_cache') || 'null');
        if (cached?.categoryBackgroundPhotos?.diseno || cached?.categoryBackgroundPhotos?.industria) {
          return cached.categoryBackgroundPhotos;
        }
      } catch {}
    }
    return {
    diseno: {
      branding: { url: './portafolio/assets/artesano-cover.webp', enabled: false },
      publicidad: { url: './portafolio/assets/civil-shirts.webp', enabled: false },
      web: { url: './interfaces/assets/ui-01.jpg', enabled: false },
      editorial: { url: './portafolio/assets/popol-spread.webp', enabled: false }
    },
    industria: {
      proto: { url: './uploads/catalog-v2-ind1-context-oficial.webp', enabled: false },
      jig: { url: './uploads/catalog-v2-ind2-context-oficial.webp', enabled: false },
      spare: { url: './uploads/industria_portada_oficial_ingenieria.webp', enabled: false },
      batch: { url: './uploads/catalog-v2-ind1-detail-oficial.webp', enabled: false }
    }
    };
  });

  // Inicializar tarjetas desde businessSettings o API
  useEffect(() => {
    if (businessSettings?.categoryBackgroundPhotos) {
      const bDiseno = businessSettings.categoryBackgroundPhotos.diseno || {};
      const bInd = businessSettings.categoryBackgroundPhotos.industria || {};
      setCardsConfig({
        diseno: {
          branding: typeof bDiseno.branding === 'string' ? { url: bDiseno.branding, enabled: false } : (bDiseno.branding || { url: './portafolio/assets/artesano-cover.webp', enabled: false }),
          publicidad: typeof bDiseno.publicidad === 'string' ? { url: bDiseno.publicidad, enabled: false } : (bDiseno.publicidad || { url: './portafolio/assets/civil-shirts.webp', enabled: false }),
          web: typeof bDiseno.web === 'string' ? { url: bDiseno.web, enabled: false } : (bDiseno.web || { url: './interfaces/assets/ui-01.jpg', enabled: false }),
          editorial: typeof bDiseno.editorial === 'string' ? { url: bDiseno.editorial, enabled: false } : (bDiseno.editorial || { url: './portafolio/assets/popol-spread.webp', enabled: false })
        },
        industria: {
          proto: typeof bInd.proto === 'string' ? { url: bInd.proto, enabled: false } : (bInd.proto || { url: './uploads/catalog-v2-ind1-context-oficial.webp', enabled: false }),
          jig: typeof bInd.jig === 'string' ? { url: bInd.jig, enabled: false } : (bInd.jig || { url: './uploads/catalog-v2-ind2-context-oficial.webp', enabled: false }),
          spare: typeof bInd.spare === 'string' ? { url: bInd.spare, enabled: false } : (bInd.spare || { url: './uploads/industria_portada_oficial_ingenieria.webp', enabled: false }),
          batch: typeof bInd.batch === 'string' ? { url: bInd.batch, enabled: false } : (bInd.batch || { url: './uploads/catalog-v2-ind1-detail-oficial.webp', enabled: false })
        }
      });
    }
  }, [businessSettings]);

  // Cargar Ã¡reas desde la API
  const loadWorlds = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/worlds');
      if (res.ok) {
        const data = await res.json();
        setWorlds(data);
        const current = data.find(w => w.id === activeAreaId) || data[0];
        if (current) {
          setFormData({
            name: current.name || '',
            tagline: current.tagline || '',
            description: current.description || '',
            image: current.image || ''
          });
        }
      }

      // Si no viene businessSettings cargado, consultar /api/settings
      if (!businessSettings) {
        const setRes = await fetch('/api/settings');
        if (setRes.ok) {
          const sData = await setRes.json();
          if (sData?.categoryBackgroundPhotos) {
            setCardsConfig(sData.categoryBackgroundPhotos);
          }
        }
      }
    } catch (err) {
      console.error('Error cargando Ã¡reas:', err);
      setStatusMsg({ type: 'error', text: 'No se pudieron cargar las Ã¡reas del taller.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorlds();
  }, []);

  // Al cambiar de Ã¡rea seleccionada, actualizar el formulario
  const handleSelectArea = (areaId) => {
    setActiveAreaId(areaId);
    setStatusMsg({ type: '', text: '' });
    const target = worlds.find(w => w.id === areaId);
    if (target) {
      setFormData({
        name: target.name || '',
        tagline: target.tagline || '',
        description: target.description || '',
        image: target.image || ''
      });
    }
  };

  // Subida de imagen para el banner principal
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMsg({ type: 'error', text: 'Por favor selecciona un archivo de imagen vÃ¡lido (JPG, PNG, WEBP).' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStatusMsg({ type: 'error', text: 'La imagen excede el lÃ­mite de 5MB.' });
      return;
    }

    setUploading(true);
    setStatusMsg({ type: 'info', text: 'Subiendo imagen de banner al taller...' });

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      let imageUrl = '';
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers,
          body: uploadFormData
        });
        if (res.ok) {
          const data = await res.json();
          imageUrl = data.imageUrl;
        }
      } catch (err) {}

      if (!imageUrl) {
        imageUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target.result);
          reader.readAsDataURL(file);
        });
      }

      setFormData(prev => ({ ...prev, image: imageUrl }));
      setStatusMsg({ type: 'success', text: 'Â¡FotografÃ­a subida exitosamente! Haz clic en "Guardar Banner" para aplicar los cambios.' });
    } catch (err) {
      console.error('Error subiendo imagen:', err);
      setStatusMsg({ type: 'error', text: `No se pudo subir la imagen: ${err.message}` });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Guardar cambios del banner en el backend (PUT /api/worlds/:id)
  const handleSaveBanner = async () => {
    setSaving(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/worlds/${activeAreaId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${res.status}`);
      }

      const updatedWorld = await res.json();
      setWorlds(prev => prev.map(w => w.id === activeAreaId ? updatedWorld : w));
      setStatusMsg({
        type: 'success',
        text: `Â¡Banner de "${updatedWorld.name}" guardado y publicado en la tienda con Ã©xito!`
      });

      if (onWorldsUpdated) {
        onWorldsUpdated();
      }
    } catch (err) {
      console.error('Error guardando banner:', err);
      setStatusMsg({ type: 'error', text: `Error al guardar: ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // GESTIÃ“N DE LAS 8 TARJETAS DE SELECCIÃ“N
  // ==========================================

  const persistCardsPreview = (updated) => {
    const draftSettings = {
      ...(businessSettings || {}),
      showCategoryBackgroundPhotos: true,
      categoryBackgroundPhotos: updated
    };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('artesano_settings_cache', JSON.stringify(draftSettings));
      } catch {}
    }
    if (onUpdateSettings) onUpdateSettings(draftSettings);
  };

  // Activar o desactivar foto de una tarjeta especÃ­fica
  const handleToggleCardPhoto = (section, cardKey) => {
    const current = cardsConfig[section]?.[cardKey] || { url: '', enabled: false };
    const newEnabled = !current.enabled;
    const updated = {
      ...cardsConfig,
      [section]: {
        ...cardsConfig[section],
        [cardKey]: {
          ...current,
          enabled: newEnabled
        }
      }
    };
    setCardsConfig(updated);

    persistCardsPreview(updated);

    setStatusMsg({
      type: 'info',
      text: newEnabled
        ? `Foto de "${cardKey.toUpperCase()}" activada. Haz clic en "Guardar Cambios de Tarjetas" para publicar.`
        : `Foto de "${cardKey.toUpperCase()}" desactivada (Modo oscuro activo). Haz clic en "Guardar Cambios de Tarjetas" para publicar.`
    });
  };

  // Subir imagen para una tarjeta especÃ­fica (desde celular o computadora)
  const handleUploadCardPhoto = async (section, cardKey, file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMsg({ type: 'error', text: 'Por favor selecciona un archivo de imagen vÃ¡lido.' });
      return;
    }

    setUploadingCardKey(`${section}_${cardKey}`);
    setStatusMsg({ type: 'info', text: `Subiendo foto para ${cardKey.toUpperCase()}...` });

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      let imageUrl = '';
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers,
          body: uploadFormData
        });
        if (res.ok) {
          const data = await res.json();
          imageUrl = data.imageUrl;
        }
      } catch (err) {}

      // Fallback a Data URL si el backend estÃ¡ en modo estÃ¡tico/offline
      if (!imageUrl) {
        imageUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target.result);
          reader.readAsDataURL(file);
        });
      }

      const current = cardsConfig[section]?.[cardKey] || {};
      const updated = {
        ...cardsConfig,
        [section]: {
          ...cardsConfig[section],
          [cardKey]: {
            ...current,
            url: imageUrl,
            enabled: true // Se activa automÃ¡ticamente al subir la foto
          }
        }
      };

      setCardsConfig(updated);
      persistCardsPreview(updated);
      setStatusMsg({
        type: 'success',
        text: `Â¡Foto de "${cardKey.toUpperCase()}" subida y activada! Recuerda dar clic en "Guardar Cambios de Tarjetas".`
      });
    } catch (err) {
      console.error('Error subiendo foto de tarjeta:', err);
      setStatusMsg({ type: 'error', text: 'Error al subir imagen: ' + err.message });
    } finally {
      setUploadingCardKey(null);
    }
  };

  // Cambiar URL manualmente
  const handleCardUrlChange = (section, cardKey, newUrl) => {
    const current = cardsConfig[section]?.[cardKey] || {};
    setCardsConfig({
      ...cardsConfig,
      [section]: {
        ...cardsConfig[section],
        [cardKey]: {
          ...current,
          url: newUrl
        }
      }
    });
  };

  // Restaurar foto original
  const handleResetCard = (section, cardKey, defaultUrl) => {
    const restored = {
      ...cardsConfig,
      [section]: {
        ...cardsConfig[section],
        [cardKey]: {
          url: defaultUrl,
          enabled: false
        }
      }
    };
    setCardsConfig(restored);
    persistCardsPreview(restored);
    setStatusMsg({ type: 'info', text: `Tarjeta "${cardKey.toUpperCase()}" restaurada a foto original (desactivada).` });
  };

  // Desactivar todas las fotos de un jalÃ³n (Modo oscuro total)
  const handleDisableAllCards = () => {
    const updated = {
      diseno: Object.fromEntries(Object.entries(cardsConfig.diseno || {}).map(([k, v]) => [k, { ...v, enabled: false }])),
      industria: Object.fromEntries(Object.entries(cardsConfig.industria || {}).map(([k, v]) => [k, { ...v, enabled: false }]))
    };
    setCardsConfig(updated);
    persistCardsPreview(updated);
    setStatusMsg({ type: 'info', text: 'Todas las fotos de fondo han sido desactivadas (Modo oscuro activo para las 8 tarjetas).' });
  };

  // Activar todas las fotos de un jalÃ³n
  const handleEnableAllCards = () => {
    const updated = {
      diseno: Object.fromEntries(Object.entries(cardsConfig.diseno || {}).map(([k, v]) => [k, { ...v, enabled: true }])),
      industria: Object.fromEntries(Object.entries(cardsConfig.industria || {}).map(([k, v]) => [k, { ...v, enabled: true }]))
    };
    setCardsConfig(updated);
    persistCardsPreview(updated);
    setStatusMsg({ type: 'info', text: 'Todas las fotos de fondo han sido activadas.' });
  };

  // Guardar todas las tarjetas en la configuraciÃ³n general
  const handleSaveAllCards = async () => {
    setSavingCards(true);
    setStatusMsg({ type: '', text: '' });

    const updatedSettings = {
      ...(businessSettings || {}),
      showCategoryBackgroundPhotos: true,
      categoryBackgroundPhotos: cardsConfig
    };

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers,
        body: JSON.stringify(updatedSettings)
      });

      if (!res.ok) {
        throw new Error(`El servidor respondiÃ³ ${res.status}; se guardÃ³ la vista local.`);
      }

      localStorage.setItem('artesano_settings_cache', JSON.stringify(updatedSettings));
      if (onUpdateSettings) {
        onUpdateSettings(updatedSettings);
      }
      setStatusMsg({
        type: 'success',
        text: 'Â¡Las 8 tarjetas de DiseÃ±o e Industria se guardaron y sincronizaron con Ã©xito en la tienda!'
      });

      if (onWorldsUpdated) {
        onWorldsUpdated();
      }
    } catch (err) {
      console.warn('Guardado en fallback local:', err);
      localStorage.setItem('artesano_settings_cache', JSON.stringify(updatedSettings));
      if (onUpdateSettings) onUpdateSettings(updatedSettings);
      setStatusMsg({
        type: 'success',
        text: 'Â¡Tarjetas guardadas y actualizadas localmente en tu navegador!'
      });
    } finally {
      setSavingCards(false);
    }
  };

  const meta = AREA_METADATA[activeAreaId] || AREA_METADATA.hogar;
  const ActiveIcon = meta.icon;
  const suggestedList = SUGGESTED_AREA_IMAGES[activeAreaId] || [];

  return (
    <div className="space-y-6">
      
      {/* SELECTOR DE PESTAÃ‘A PRINCIPAL (BANNERS DE PORTADA VS TARJETAS DE SELECCIÃ“N) */}
      <div className="bg-white p-3 rounded-2xl sm:rounded-3xl border border-[#E8E4DA] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-[#FAF9F5] border border-[#E8E4DA] rounded-2xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveSectionTab('cards')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSectionTab === 'cards'
                ? 'bg-[#2D4F3E] text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-200/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Tarjetas de DiseÃ±o & Industria (8 Tarjetas)</span>
            <span className="px-1.5 py-0.5 rounded text-[9.5px] bg-amber-400 text-stone-950 font-black">
              Tu PeticiÃ³n
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSectionTab('banners')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSectionTab === 'banners'
                ? 'bg-[#2D4F3E] text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-200/60'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Banners de Portada de Ãrea</span>
          </button>
        </div>

        <button
          type="button"
          onClick={loadWorlds}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer self-stretch sm:self-auto"
          title="Recargar datos del servidor"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refrescar</span>
        </button>
      </div>

      {/* NOTIFICACIÃ“N DE ESTADO FLOTANTE */}
      {statusMsg.text && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 border animate-in fade-in shadow-xs ${
          statusMsg.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : statusMsg.type === 'error'
            ? 'bg-red-50 text-red-800 border-red-200'
            : 'bg-blue-50 text-blue-800 border-blue-200'
        }`}>
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 1: TARJETAS DE SELECCIÃ“N (DISEÃ‘O E INDUSTRIA)                      */}
      {/* ========================================================================= */}
      {activeSectionTab === 'cards' && (
        <div className="space-y-6">
          
          {/* Header de la secciÃ³n de tarjetas */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E4DA] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#2D4F3E]">
                <Sliders className="w-4 h-4 text-[#D4A359]" />
                <span>Control Individual de Tarjetas</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-heading text-[#1F2421]">
                Tarjetas de SelecciÃ³n: DiseÃ±o & Industria
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed">
                AquÃ­ puedes <strong>activar o desactivar la foto</strong> de cada una de las 8 tarjetas de forma independiente, o <strong>subir tu propia imagen</strong> desde tu celular o computadora. Si la desactivas, la tarjeta lucirÃ¡ con su modo oscuro minimalista y nÃ­tido.
              </p>
            </div>

            {/* Botones de acciÃ³n rÃ¡pida global */}
            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
              <button
                type="button"
                onClick={handleDisableAllCards}
                className="px-3 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                title="Desactivar todas las fotos para que se vean en modo oscuro"
              >
                â—‹ Desactivar Todas
              </button>
              <button
                type="button"
                onClick={handleEnableAllCards}
                className="px-3 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                title="Activar fotos de fondo en todas las tarjetas"
              >
                â— Activar Todas
              </button>
              <button
                type="button"
                onClick={handleSaveAllCards}
                disabled={savingCards}
                className="px-5 py-2.5 rounded-xl bg-[#2D4F3E] hover:bg-[#20392C] text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
              >
                <Save className={`w-4 h-4 ${savingCards ? 'animate-spin' : ''}`} />
                <span>{savingCards ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
            </div>
          </div>

          {/* 1. SECTOR DISEÃ‘O & PUBLICIDAD (4 TARJETAS) */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E4DA] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 flex items-center justify-center font-bold">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#1F2421]">
                    Tarjetas de DiseÃ±o & Publicidad
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Secciones: Identidad de Marca, Lonas & Gran Formato, Web & Tienda, CatÃ¡logo & Redes
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md border self-start sm:self-auto">
                4 Tarjetas Disponibles
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {SELECTION_CARDS_CATALOG.diseno.map(card => {
                const current = cardsConfig.diseno?.[card.key] || { url: card.defaultUrl, enabled: false };
                const isPhotoActive = Boolean(current.enabled);
                const IconComp = card.icon;
                const isUploadingThis = uploadingCardKey === `diseno_${card.key}`;

                return (
                  <div
                    key={card.key}
                    className={`rounded-2xl border p-3.5 flex flex-col justify-between transition-all space-y-3 ${
                      isPhotoActive
                        ? 'border-emerald-300 bg-emerald-50/20 shadow-2xs'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    {/* Header de la tarjeta */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-heading font-black text-xs uppercase tracking-wider text-gray-900">
                        {card.code}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        isPhotoActive
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}>
                        {isPhotoActive ? 'â— Foto Activa' : 'â—‹ Modo Oscuro'}
                      </span>
                    </div>

                    {/* PrevisualizaciÃ³n idÃ©ntica a cÃ³mo se verÃ¡ en la tienda */}
                    <div className="relative rounded-xl overflow-hidden bg-[#0B0D11] border border-white/10 p-3 h-32 flex flex-col justify-between text-white select-none">
                      {/* Imagen con desenfoque condicional */}
                      {isPhotoActive && (
                        <>
                          <img loading="lazy"
                            src={current.url || card.defaultUrl}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover filter blur-[0.6px] opacity-65 scale-105"
                            onError={(e) => { e.currentTarget.src = card.defaultUrl; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D11] via-[#0B0D11]/70 to-[#0B0D11]/25" />
                        </>
                      )}

                      <div className="relative z-10 flex items-center justify-between">
                        <span className="font-mono text-[9px] text-[#e8b84f] font-bold">
                          {card.code}
                        </span>
                        <div className="w-5 h-5 rounded-md bg-black/60 border border-white/15 flex items-center justify-center">
                          <IconComp className="w-3 h-3 text-[#e8b84f]" />
                        </div>
                      </div>

                      <div className="relative z-10 space-y-0.5">
                        <span className="text-[7.5px] uppercase font-bold px-1.5 py-0.5 rounded bg-black/60 border border-white/10 text-stone-300">
                          {card.badge}
                        </span>
                        <div className="font-bold text-xs text-white truncate leading-tight">
                          {card.title}
                        </div>
                      </div>
                    </div>

                    {/* Controles para activar, subir foto o restaurar */}
                    <div className="space-y-2 pt-1">
                      {/* BotÃ³n de Activar / Desactivar */}
                      <button
                        type="button"
                        onClick={() => handleToggleCardPhoto('diseno', card.key)}
                        className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isPhotoActive
                            ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                            : 'bg-[#2D4F3E] hover:bg-[#20392C] text-white shadow-xs'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{isPhotoActive ? 'Desactivar Foto' : 'Activar Foto'}</span>
                      </button>

                      {/* BotÃ³n Subir Foto desde Celular/PC */}
                      <div className="relative">
                        <input
                          type="file"
                          id={`upload-diseno-${card.key}`}
                          accept="image/*"
                          disabled={isUploadingThis}
                          onChange={(e) => handleUploadCardPhoto('diseno', card.key, e.target.files?.[0])}
                          className="hidden"
                        />
                        <label
                          htmlFor={`upload-diseno-${card.key}`}
                          className="w-full py-1.5 px-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Upload className={`w-3.5 h-3.5 ${isUploadingThis ? 'animate-bounce text-[#2D4F3E]' : 'text-gray-600'}`} />
                          <span>{isUploadingThis ? 'Subiendo...' : 'Subir mi imagen'}</span>
                        </label>
                      </div>

                      {/* Campo de ruta o URL */}
                      <div>
                        <input
                          type="text"
                          value={current.url || ''}
                          onChange={(e) => handleCardUrlChange('diseno', card.key, e.target.value)}
                          placeholder="./uploads/tu_foto.jpg"
                          className="w-full px-2.5 py-1 text-[10.5px] rounded-lg border border-gray-200 bg-gray-50/70 focus:bg-white focus:outline-none focus:border-[#2D4F3E]"
                          title="Ruta o URL de la fotografÃ­a"
                        />
                      </div>

                      {/* BotÃ³n Restaurar original */}
                      <button
                        type="button"
                        onClick={() => handleResetCard('diseno', card.key, card.defaultUrl)}
                        className="w-full text-center text-[10px] text-gray-400 hover:text-gray-600 transition-colors py-0.5 cursor-pointer"
                      >
                        Restablecer foto original
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. SECTOR INDUSTRIA TÃ‰CNICA (4 TARJETAS) */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E4DA] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-700 flex items-center justify-center font-bold">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#1F2421]">
                    Tarjetas de Industria TÃ©cnica & Manufactura
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Secciones: Prototipos Funcionales, Utillaje y Herramientas, Refacciones y Obsoletos, Lotes Cortos y Preseries
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md border self-start sm:self-auto">
                4 Tarjetas Disponibles
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {SELECTION_CARDS_CATALOG.industria.map(card => {
                const current = cardsConfig.industria?.[card.key] || { url: card.defaultUrl, enabled: false };
                const isPhotoActive = Boolean(current.enabled);
                const IconComp = card.icon;
                const isUploadingThis = uploadingCardKey === `industria_${card.key}`;

                return (
                  <div
                    key={card.key}
                    className={`rounded-2xl border p-3.5 flex flex-col justify-between transition-all space-y-3 ${
                      isPhotoActive
                        ? 'border-emerald-300 bg-emerald-50/20 shadow-2xs'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    {/* Header de la tarjeta */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-heading font-black text-xs uppercase tracking-wider text-gray-900">
                        {card.code}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        isPhotoActive
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}>
                        {isPhotoActive ? 'â— Foto Activa' : 'â—‹ Modo Oscuro'}
                      </span>
                    </div>

                    {/* PrevisualizaciÃ³n idÃ©ntica a cÃ³mo se verÃ¡ en la tienda */}
                    <div className="relative rounded-xl overflow-hidden bg-[#0A0E11] border border-white/10 p-3 h-32 flex flex-col justify-between text-white select-none">
                      {/* Imagen con desenfoque condicional */}
                      {isPhotoActive && (
                        <>
                          <img loading="lazy"
                            src={current.url || card.defaultUrl}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover filter blur-[0.6px] opacity-65 scale-105"
                            onError={(e) => { e.currentTarget.src = card.defaultUrl; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#060A0D] via-[#060A0D]/70 to-[#060A0D]/25" />
                        </>
                      )}

                      <div className="relative z-10 flex items-center justify-between">
                        <span className="font-mono text-[9px] text-[#5BB8FF] font-bold">
                          {card.code}
                        </span>
                        <div className="w-5 h-5 rounded-md bg-black/60 border border-white/15 flex items-center justify-center">
                          <IconComp className="w-3 h-3 text-[#5BB8FF]" />
                        </div>
                      </div>

                      <div className="relative z-10 space-y-0.5">
                        <span className="text-[7.5px] uppercase font-bold px-1.5 py-0.5 rounded bg-black/60 border border-white/10 text-stone-300">
                          {card.badge}
                        </span>
                        <div className="font-bold text-xs text-white truncate leading-tight">
                          {card.title}
                        </div>
                      </div>
                    </div>

                    {/* Controles para activar, subir foto o restaurar */}
                    <div className="space-y-2 pt-1">
                      {/* BotÃ³n de Activar / Desactivar */}
                      <button
                        type="button"
                        onClick={() => handleToggleCardPhoto('industria', card.key)}
                        className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isPhotoActive
                            ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                            : 'bg-[#2D4F3E] hover:bg-[#20392C] text-white shadow-xs'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{isPhotoActive ? 'Desactivar Foto' : 'Activar Foto'}</span>
                      </button>

                      {/* BotÃ³n Subir Foto desde Celular/PC */}
                      <div className="relative">
                        <input
                          type="file"
                          id={`upload-ind-${card.key}`}
                          accept="image/*"
                          disabled={isUploadingThis}
                          onChange={(e) => handleUploadCardPhoto('industria', card.key, e.target.files?.[0])}
                          className="hidden"
                        />
                        <label
                          htmlFor={`upload-ind-${card.key}`}
                          className="w-full py-1.5 px-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Upload className={`w-3.5 h-3.5 ${isUploadingThis ? 'animate-bounce text-[#2D4F3E]' : 'text-gray-600'}`} />
                          <span>{isUploadingThis ? 'Subiendo...' : 'Subir mi imagen'}</span>
                        </label>
                      </div>

                      {/* Campo de ruta o URL */}
                      <div>
                        <input
                          type="text"
                          value={current.url || ''}
                          onChange={(e) => handleCardUrlChange('industria', card.key, e.target.value)}
                          placeholder="./uploads/tu_foto.jpg"
                          className="w-full px-2.5 py-1 text-[10.5px] rounded-lg border border-gray-200 bg-gray-50/70 focus:bg-white focus:outline-none focus:border-[#2D4F3E]"
                          title="Ruta o URL de la fotografÃ­a"
                        />
                      </div>

                      {/* BotÃ³n Restaurar original */}
                      <button
                        type="button"
                        onClick={() => handleResetCard('industria', card.key, card.defaultUrl)}
                        className="w-full text-center text-[10px] text-gray-400 hover:text-gray-600 transition-colors py-0.5 cursor-pointer"
                      >
                        Restablecer foto original
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Barra inferior de guardado */}
          <div className="bg-white p-4 rounded-2xl border border-[#E8E4DA] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-gray-500 font-medium text-center sm:text-left">
              Los cambios que actives o desactives se reflejarÃ¡n de inmediato para todos los clientes en la tienda oficial.
            </span>
            <button
              type="button"
              onClick={handleSaveAllCards}
              disabled={savingCards}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#2D4F3E] hover:bg-[#20392C] text-white text-xs font-black transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              <Save className={`w-4 h-4 ${savingCards ? 'animate-spin' : ''}`} />
              <span>{savingCards ? 'Guardando...' : 'Guardar y Publicar en Tienda'}</span>
            </button>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: BANNERS DE PORTADA DE ÃREA                                      */}
      {/* ========================================================================= */}
      {activeSectionTab === 'banners' && (
        <div className="space-y-6">

          {/* Encabezado Principal de Banners */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E4DA] shadow-xs space-y-1">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#2D4F3E]">
              <ImageIcon className="w-4 h-4 text-[#D4A359]" />
              <span>Banners de Cabecera Superior</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-heading text-[#1F2421]">
              Banners de Portada por Ãrea
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-3xl">
              Sube o cambia la imagen principal panorÃ¡mica, tÃ­tulo, lema y descripciÃ³n de cada una de las Ã¡reas maestras del taller.
            </p>
          </div>

          {/* Selector de Ãreas del CatÃ¡logo */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'hogar', label: 'Hogar & Deco', icon: Home, desc: 'LÃ¡mparas, percheros y macetas' },
              { id: 'negocios', label: 'Negocios & Marcas', icon: Briefcase, desc: 'Smart Decks, QR y branding' },
              { id: 'juguetes', label: 'Juguetes & NiÃ±os', icon: Gamepad2, desc: 'Articulados y dinÃ¡micos' },
              { id: 'personalizados', label: 'Personalizados', icon: Sparkles, desc: 'Dibujos 3D y creaciones' },
              { id: 'eventos', label: 'Eventos Especiales', icon: CalendarHeart, desc: 'Bodas, fiestas y recuerdos' },
              { id: 'paquetes-servicios', label: 'Paquetes & Kits', icon: Gift, desc: 'Combos promocionales' },
              { id: 'industria', label: 'Industria TÃ©cnica', icon: Wrench, desc: 'Piezas mecÃ¡nicas y utillaje' },
              { id: 'publicidad-desarrollo', label: 'DiseÃ±o & Publicidad', icon: Palette, desc: 'Branding y diseÃ±o web' }
            ].map(area => {
              const isSelected = activeAreaId === area.id;
              const Icon = area.icon;
              return (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => handleSelectArea(area.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2.5 shadow-2xs ${
                    isSelected
                      ? 'bg-[#17251E] text-white border-[#D4A359] ring-2 ring-[#D4A359]/40 scale-101 shadow-md'
                      : 'bg-white hover:bg-gray-50 text-gray-800 border-[#E8E4DA]'
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${
                    isSelected ? 'bg-[#D4A359] text-stone-950 font-black' : 'bg-gray-100 text-gray-700'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-extrabold text-xs sm:text-sm truncate">{area.label}</div>
                    <div className={`text-[10px] sm:text-[10.5px] truncate mt-0.5 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                      {area.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* CALLOUT: Acceso rÃ¡pido a las tarjetas selectoras si estÃ¡ en diseÃ±o o industria */}
          {(activeAreaId === 'publicidad-desarrollo' || activeAreaId === 'industria') && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2.5 text-xs text-amber-950">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Â¿Quieres <strong>activar/desactivar o cambiar las fotos</strong> de las tarjetas selectoras de esta secciÃ³n ({activeAreaId === 'publicidad-desarrollo' ? 'Identidad de Marca, Lonas, Web, Redes' : 'Prototipos, Utillaje, Refacciones, Lotes'})?
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveSectionTab('cards')}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
              >
                <span>Ir a Tarjetas Selectoras</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* PrevisualizaciÃ³n en Vivo del Banner */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-gray-600">
                <Eye className="w-3.5 h-3.5 text-[#2D4F3E]" />
                <span>PrevisualizaciÃ³n en Vivo del Banner ({meta.label})</span>
              </div>
              <span className="text-[11px] text-gray-400">
                Aspecto idÃ©ntico al catÃ¡logo de la tienda
              </span>
            </div>

            <div className="relative rounded-3xl overflow-hidden bg-[#1F2421] text-white shadow-xl border-2 border-white/10 min-h-[190px] sm:min-h-[220px] flex items-center">
              {formData.image ? (
                <ImageOptimized loading="lazy"
                  src={formData.image}
                  alt={formData.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-35"
                />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-r ${meta.gradient} opacity-50`} />
              )}

              <div className="absolute inset-0 bg-gradient-to-r from-[#17251E] via-[#17251E]/85 to-transparent" />

              <div className="relative z-10 p-6 sm:p-8 max-w-2xl space-y-2">
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10.5px] font-black uppercase tracking-widest">
                  {meta.badgeText}
                </span>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-white tracking-tight">
                  {formData.name || 'Nombre del Ãrea'}
                </h1>
                <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-normal">
                  {formData.description || 'DescripciÃ³n del Ã¡rea y tipos de manufactura artesanal disponibles...'}
                </p>
                {formData.tagline && (
                  <p className="text-[11px] font-medium text-amber-300/90 italic">
                    &ldquo;{formData.tagline}&rdquo;
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Formulario de EdiciÃ³n del Banner de Portada */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white p-6 rounded-3xl border border-[#E8E4DA] shadow-xs">
            
            {/* LADO IZQUIERDO: Subir o Elegir Imagen */}
            <div className="lg:col-span-5 space-y-4 border-b lg:border-b-0 lg:border-r border-gray-100 pb-5 lg:pb-0 lg:pr-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1F2421]">
                <Upload className="w-4 h-4 text-[#2D4F3E]" />
                <span>1. Imagen de Portada</span>
              </div>

              <div className="border-2 border-dashed border-gray-300 hover:border-[#2D4F3E] rounded-2xl p-5 text-center transition-all bg-[#FAF9F5] group">
                <input
                  type="file"
                  id="area-banner-upload"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <label
                  htmlFor="area-banner-upload"
                  className="cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 shadow-2xs flex items-center justify-center text-[#2D4F3E] group-hover:scale-105 transition-transform">
                    <Upload className={`w-5 h-5 ${uploading ? 'animate-bounce' : ''}`} />
                  </div>
                  <div className="text-xs font-black text-[#1F2421]">
                    {uploading ? 'Subiendo imagen...' : 'Subir imagen desde tu computadora'}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Formato JPG, PNG o WEBP (mÃ¡x. 5MB)
                  </p>
                </label>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  O escribe la URL / ruta de la imagen:
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="/uploads/tu_foto.jpg"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2D4F3E]"
                />
              </div>

              {/* ImÃ¡genes Sugeridas del Taller */}
              {suggestedList.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    FotografÃ­as recomendadas para {meta.label}:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {suggestedList.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, image: item.url }))}
                        className={`p-2 rounded-xl border text-left text-[11px] font-semibold transition-all flex flex-col gap-1.5 cursor-pointer ${
                          formData.image === item.url
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-1 ring-emerald-400'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                      >
                        <ImageOptimized loading="lazy"
                          src={item.url}
                          alt={item.label}
                          className="w-full h-14 rounded-lg object-cover bg-gray-200"
                        />
                        <span className="line-clamp-1">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* LADO DERECHO: Textos del Banner */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1F2421]">
                <Palette className="w-4 h-4 text-[#D4A359]" />
                <span>2. Textos y PresentaciÃ³n de Portada</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  Nombre Oficial del Ãrea:
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej. Hogar & DecoraciÃ³n"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2D4F3E]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  Slogan o Lema del Ãrea:
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                  placeholder="Ej. Piezas cÃ¡lidas en madera y resina para vestir tus espacios..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2D4F3E]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  DescripciÃ³n completa (visible en la portada del catÃ¡logo):
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Explica quÃ© encontrarÃ¡ el cliente en esta Ã¡rea, materiales y opciones de personalizaciÃ³n..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#2D4F3E]"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleSaveBanner}
                  disabled={saving || uploading}
                  className="px-6 py-2.5 rounded-2xl bg-[#2D4F3E] hover:bg-[#20392C] text-white text-xs font-black transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
                  <span>{saving ? 'Guardando en Servidor...' : `Guardar Banner de ${meta.label}`}</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

