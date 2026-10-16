import React, { useState, useEffect, useRef } from 'react';
import {
  X, Camera, Upload, Sparkles, RefreshCw, CheckCircle2,
  AlertTriangle, RotateCcw, Info, ZoomIn, Eye, Sliders, Check
} from 'lucide-react';

const SLOT_CONFIG = [
  {
    index: 0,
    slotName: 'En Contexto',
    number: '1',
    description: 'Ambiente realista de uso donde el producto es el protagonista, con decoración secundaria.',
    badgeColor: 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50'
  },
  {
    index: 1,
    slotName: 'Fondo Blanco',
    number: '2',
    description: 'Toma base centrada sobre fondo blanco puro (#FFFFFF) con iluminación uniforme y sombra de contacto.',
    badgeColor: 'bg-blue-900/60 text-blue-300 border-blue-700/50',
    isBase: true
  },
  {
    index: 2,
    slotName: 'Detalle Macro',
    number: '3',
    description: 'Recorte real ampliado de la toma 2 con filtro de nitidez en textura, grabado o acabado artesanal.',
    badgeColor: 'bg-purple-900/60 text-purple-300 border-purple-700/50'
  },
  {
    index: 3,
    slotName: 'Tamaño y Medidas',
    number: '4',
    description: 'Cotas en español con dimensiones técnicas y tarjeta de referencia de escala (8.6 × 5.4 cm).',
    badgeColor: 'bg-amber-900/60 text-amber-300 border-amber-700/50'
  }
];

export default function ProductPhotoStudioModal({
  isOpen,
  onClose,
  products = [],
  initialProductId = null,
  onProductUpdated
}) {
  const [selectedProductId, setSelectedProductId] = useState(initialProductId || '');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Technical specifications
  const [dimensions, setDimensions] = useState('');
  const [materials, setMaterials] = useState('');
  const [includes, setIncludes] = useState('');

  // Reference photo
  const [referenceFile, setReferenceFile] = useState(null);
  const [referencePreview, setReferencePreview] = useState('');
  const fileInputRef = useRef(null);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedGallery, setGeneratedGallery] = useState(['', '', '', '']);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [staleSlots, setStaleSlots] = useState({ 0: false, 2: false, 3: false });

  // Detail crop controls (Slot 2)
  const [cropPosition, setCropPosition] = useState('center');
  const [cropZoom, setCropZoom] = useState(2.2);

  // Slot action states
  const [replacingSlotIndex, setReplacingSlotIndex] = useState(null);
  const slotFileInputRefs = useRef([]);

  // Toast / notification
  const [notice, setNotice] = useState({ text: '', type: 'info' });
  const [isSaving, setIsSaving] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiConfig, setAiConfig] = useState(null);

  // Sync initialProductId when modal opens or initialProductId changes
  useEffect(() => {
    if (initialProductId) {
      setSelectedProductId(initialProductId);
    } else if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [initialProductId, isOpen, products]);

  // Load selected product data
  useEffect(() => {
    const prod = products.find(p => p.id === selectedProductId);
    setSelectedProduct(prod || null);

    if (prod) {
      const specs = prod.specifications || {};
      setDimensions(specs.dimensions || '');
      setMaterials(specs.material || specs.materials || '');
      setIncludes(specs.includes || '');

      // Load existing gallery if available
      if (Array.isArray(prod.gallery) && prod.gallery.length >= 4) {
        setGeneratedGallery([...prod.gallery]);
      } else if (prod.primaryImage) {
        setGeneratedGallery([
          prod.primaryImage,
          prod.whiteBgImage || prod.primaryImage,
          prod.detailImage || prod.primaryImage,
          prod.dimensionsImage || prod.measureImage || prod.primaryImage
        ]);
      } else {
        setGeneratedGallery(['', '', '', '']);
      }

      // Initial reference preview from primary image
      if (prod.primaryImage || prod.whiteBgImage) {
        setReferencePreview(prod.whiteBgImage || prod.primaryImage);
      }
      setHasUnsavedChanges(false);
      setStaleSlots({ 0: false, 2: false, 3: false });
    }
  }, [selectedProductId, products]);

  // Fetch AI transparency info on mount
  useEffect(() => {
    fetch('/api/admin/photo-studio/config')
      .then(res => res.json())
      .then(data => setAiConfig(data))
      .catch(err => console.warn('No se pudo cargar config de IA:', err));
  }, []);

  if (!isOpen) return null;

  const showToast = (text, type = 'info') => {
    setNotice({ text, type });
    setTimeout(() => setNotice({ text: '', type: 'info' }), 4500);
  };

  // Handle reference photo selection
  const handleReferenceFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Por favor selecciona un archivo de imagen válido (JPG, PNG o WebP).', 'error');
      return;
    }

    setReferenceFile(file);
    const objectUrl = URL.createObjectURL(file);
    setReferencePreview(objectUrl);
    showToast('Foto de referencia cargada correctamente. Lista para procesar.', 'success');
  };

  // Generate all 4 images
  const handleGenerateAll = async () => {
    if (!referenceFile && !referencePreview) {
      showToast('Sube o selecciona una foto de referencia para comenzar.', 'warning');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(10);
    setGenerationStep('Iniciando toma 2: Fondo blanco puro (#FFFFFF) centrado...');

    try {
      const formData = new FormData();
      if (referenceFile) {
        formData.append('referenceImage', referenceFile);
      } else if (referencePreview) {
        formData.append('referenceImageUrl', referencePreview);
      }

      formData.append('sku', selectedProduct?.sku || 'PROD-001');
      formData.append('productName', selectedProduct?.name || 'Producto Artesano');
      formData.append('dimensions', dimensions);
      formData.append('materials', materials);
      formData.append('includes', includes);
      formData.append('options', JSON.stringify({ cropPosition, zoom: cropZoom }));

      // Simulate step updates for user feedback
      const timer1 = setTimeout(() => {
        setGenerationProgress(35);
        setGenerationStep('Toma 2 lista. Generando toma 3: Recorte de detalle macro...');
      }, 700);

      const timer2 = setTimeout(() => {
        setGenerationProgress(65);
        setGenerationStep('Generando toma 1: Ambientación en contexto de uso...');
      }, 1400);

      const timer3 = setTimeout(() => {
        setGenerationProgress(85);
        setGenerationStep('Generando toma 4: Infografía técnica con medidas y escala...');
      }, 2100);

      const res = await fetch('/api/admin/photo-studio/generate-all', {
        method: 'POST',
        body: formData
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Error del servidor (${res.status})`);
      }

      const data = await res.json();
      setGenerationProgress(100);
      setGenerationStep('¡Las 4 imágenes han sido creadas con éxito en 1000 × 1000 WebP!');
      setGeneratedGallery(data.gallery);
      setHasUnsavedChanges(true);
      setStaleSlots({ 0: false, 2: false, 3: false });
      showToast('¡4 tomas generadas exitosamente! Revisa cada una antes de aplicar.', 'success');
    } catch (err) {
      console.error('Error al generar fotos:', err);
      showToast(`Error al procesar: ${err.message}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Replace a single slot manually with a user-uploaded image
  const handleManualSlotUpload = async (slotIndex, file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Selecciona una imagen válida.', 'error');
      return;
    }

    setReplacingSlotIndex(slotIndex);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('sku', selectedProduct?.sku || 'PROD-001');
      formData.append('slotIndex', slotIndex.toString());

      const res = await fetch('/api/admin/photo-studio/upload-single', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Error al subir imagen de reemplazo');
      }

      const data = await res.json();
      const updatedGallery = [...generatedGallery];
      updatedGallery[slotIndex] = data.url;
      setGeneratedGallery(updatedGallery);
      setHasUnsavedChanges(true);

      // Si se reemplaza la toma base (slot 1), marcar las demás como desactualizadas
      if (slotIndex === 1) {
        setStaleSlots({ 0: true, 2: true, 3: true });
        showToast('Toma 2 (Base) reemplazada. Te recomendamos regenerar las tomas 1, 3 y 4 para mantener coherencia.', 'warning');
      } else {
        showToast(`Toma ${slotIndex + 1} actualizada con tu propia fotografía.`, 'success');
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setReplacingSlotIndex(null);
    }
  };

  // Regenerate a single slot (AI / Sharp)
  const handleRegenerateSingle = async (slotIndex) => {
    const baseWhiteUrl = generatedGallery[1];
    if (!baseWhiteUrl && slotIndex !== 1) {
      showToast('Primero genera o sube la Toma 2 (Fondo Blanco) para usarla como base.', 'warning');
      return;
    }

    setReplacingSlotIndex(slotIndex);
    try {
      const res = await fetch('/api/admin/photo-studio/regenerate-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotIndex,
          baseImageUrl: slotIndex === 1 ? (referencePreview || baseWhiteUrl) : baseWhiteUrl,
          sku: selectedProduct?.sku || 'PROD-001',
          productName: selectedProduct?.name || 'Producto Artesano',
          specifications: { dimensions, material: materials, includes },
          options: { cropPosition, zoom: cropZoom }
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Error al regenerar ranura');
      }

      const data = await res.json();
      const updatedGallery = [...generatedGallery];
      updatedGallery[slotIndex] = data.url;
      setGeneratedGallery(updatedGallery);
      setHasUnsavedChanges(true);

      if (slotIndex === 1) {
        setStaleSlots({ 0: true, 2: true, 3: true });
        showToast('Toma 2 regenerada. Toma base actualizada.', 'info');
      } else {
        setStaleSlots(prev => ({ ...prev, [slotIndex]: false }));
        showToast(`Toma ${slotIndex + 1} regenerada exitosamente.`, 'success');
      }
    } catch (err) {
      showToast(`Error al regenerar: ${err.message}`, 'error');
    } finally {
      setReplacingSlotIndex(null);
    }
  };

  // Apply gallery to product
  const handleApplyToProduct = async () => {
    if (!selectedProduct?.id) {
      showToast('Selecciona un producto válido primero.', 'error');
      return;
    }

    // Verify all 4 images are present
    const validCount = generatedGallery.filter(url => Boolean(url)).length;
    if (validCount < 4) {
      showToast(`El paquete debe tener las 4 tomas completas. Actualmente hay ${validCount} de 4.`, 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/photo-studio/apply-to-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          gallery: generatedGallery
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Error al aplicar cambios');
      }

      const data = await res.json();
      setHasUnsavedChanges(false);
      setSelectedProduct(data.product);
      if (onProductUpdated) onProductUpdated(data.product);
      showToast('¡Fotografías aplicadas al producto y catálogo con éxito! Respaldo anterior creado.', 'success');
    } catch (err) {
      showToast(`Error al guardar: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Restore previous gallery
  const handleRestoreGallery = async () => {
    if (!selectedProduct?.id) return;
    if (!selectedProduct?.previousImagesBackup) {
      showToast('Este producto no tiene un respaldo de galería anterior.', 'info');
      return;
    }

    const confirmRestore = window.confirm('¿Deseas restaurar la galería anterior de este producto? Se descartarán las imágenes actuales.');
    if (!confirmRestore) return;

    setIsRestoring(true);
    try {
      const res = await fetch('/api/admin/photo-studio/restore-gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: selectedProduct.id })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Error al restaurar galería');
      }

      const data = await res.json();
      setSelectedProduct(data.product);
      if (Array.isArray(data.product.gallery)) {
        setGeneratedGallery([...data.product.gallery]);
      }
      setHasUnsavedChanges(false);
      if (onProductUpdated) onProductUpdated(data.product);
      showToast('Galería anterior restaurada correctamente.', 'success');
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-start justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-4 sm:my-8 text-slate-100">
        
        {/* Header */}
        <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 sticky top-0 z-20 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Estudio Fotográfico de Catálogo (4 Tomas)
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 border border-emerald-600/50 text-emerald-300">
                  <Sparkles className="w-3 h-3" /> Sharp Nativo · $0.00 MXN
                </span>
              </div>
              <p className="text-xs text-slate-400">
                1 foto de referencia → 4 tomas estándar profesionales (1000 × 1000 WebP)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAiModal(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition"
              title="Transparencia de IA y costos"
            >
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Info & Costos IA</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition border border-slate-700"
              title="Cerrar estudio"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast Notice */}
        {notice.text && (
          <div className={`mx-4 mt-4 px-4 py-3 rounded-xl border text-sm flex items-center gap-3 shadow-lg transition animate-slideDown ${
            notice.type === 'success' ? 'bg-emerald-950/90 border-emerald-600 text-emerald-200' :
            notice.type === 'error' ? 'bg-rose-950/90 border-rose-600 text-rose-200' :
            notice.type === 'warning' ? 'bg-amber-950/90 border-amber-600 text-amber-200' :
            'bg-slate-800/90 border-slate-600 text-slate-200'
          }`}>
            {notice.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {notice.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />}
            {notice.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
            {notice.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
            <span className="flex-1 font-medium">{notice.text}</span>
          </div>
        )}

        {/* Main Content */}
        <div className="p-4 sm:p-6 space-y-6">

          {/* Section 1: Product Selector & Tech Specs */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 sm:p-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              
              {/* Product Select */}
              <div className="lg:col-span-5 space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Producto de Catálogo a Fotografiar
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku || p.code || 'Sin SKU'}) - ${p.price?.toLocaleString('es-MX')} MXN
                    </option>
                  ))}
                </select>
                {selectedProduct && (
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pt-1">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                      SKU: {selectedProduct.sku || 'N/A'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                      Cat: {selectedProduct.categories?.[0] || 'General'}
                    </span>
                    {selectedProduct.previousImagesBackup && (
                      <span className="px-2 py-0.5 rounded bg-blue-950/80 border border-blue-700/60 text-blue-300">
                        Tiene respaldo previo
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Editable Tech Specs */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-300">
                    Dimensiones (Toma 4)
                  </label>
                  <input
                    type="text"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    placeholder="Ej. 22 × 14 × 3.5 cm"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-slate-500">Para cotas numéricas</span>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-300">
                    Materiales
                  </label>
                  <input
                    type="text"
                    value={materials}
                    onChange={(e) => setMaterials(e.target.value)}
                    placeholder="Ej. PLA madera / Cerámica"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-slate-500">Textura y acabados</span>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-300">
                    Piezas Incluidas
                  </label>
                  <input
                    type="text"
                    value={includes}
                    onChange={(e) => setIncludes(e.target.value)}
                    placeholder="Ej. 1 bandeja + accesorios"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-slate-500">Componentes reales</span>
                </div>
              </div>

            </div>
          </div>

          {/* Section 2: Reference Photo & Generate CTA */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            
            {/* Upload Box */}
            <div className="lg:col-span-5 bg-slate-950/40 border-2 border-dashed border-slate-700 hover:border-amber-500/70 rounded-2xl p-4 flex flex-col justify-between transition group">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-amber-400" /> 1 Foto de Referencia Original
                  </span>
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    Móvil o PC
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Puede estar mal iluminada, inclinada o tomada con celular. El motor la endereza, centra sobre fondo blanco puro y genera las 4 tomas.
                </p>

                {referencePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900 max-h-44 flex items-center justify-center">
                    <img
                      src={referencePreview}
                      alt="Referencia"
                      className="max-h-44 object-contain"
                    />
                    <button
                      onClick={() => {
                        setReferenceFile(null);
                        setReferencePreview('');
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded-lg border border-rose-700 transition"
                      title="Quitar foto"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer py-8 px-4 flex flex-col items-center justify-center text-center bg-slate-900/60 rounded-xl hover:bg-slate-800/60 transition border border-slate-800"
                  >
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2 group-hover:scale-105 transition">
                      <Camera className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold text-slate-200">
                      Toma una foto o selecciónala de tu galería
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1">
                      JPG, PNG o WebP hasta 15MB
                    </span>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleReferenceFileChange}
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-1.5 px-3 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition"
                >
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  {referencePreview ? 'Cambiar foto de referencia' : 'Cargar foto'}
                </button>
                {selectedProduct?.primaryImage && !referencePreview && (
                  <button
                    type="button"
                    onClick={() => setReferencePreview(selectedProduct.primaryImage)}
                    className="py-1.5 px-3 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                    title="Usar imagen existente del producto"
                  >
                    Usar actual
                  </button>
                )}
              </div>
            </div>

            {/* Action Card & Generation Status */}
            <div className="lg:col-span-7 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Proceso Automatizado en 4 Pasos
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-800">
                    Orden Estricto: 2 → 3 → 1 → 4
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  {SLOT_CONFIG.map(slot => (
                    <div key={slot.index} className="bg-slate-950/60 border border-slate-800 rounded-lg p-2 text-center">
                      <div className="text-[10px] font-bold text-amber-400">Paso {slot.number}</div>
                      <div className="text-xs font-semibold text-slate-200 truncate">{slot.slotName}</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">1000×1000 px</div>
                    </div>
                  ))}
                </div>

                {/* Progress bar when generating */}
                {isGenerating && (
                  <div className="space-y-2 bg-slate-950/80 border border-amber-500/30 rounded-xl p-3 my-2 animate-pulse">
                    <div className="flex justify-between text-xs font-medium text-amber-300">
                      <span>{generationStep}</span>
                      <span>{generationProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                        style={{ width: `${generationProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Generate CTA Button */}
              <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  disabled={isGenerating || (!referenceFile && !referencePreview)}
                  onClick={handleGenerateAll}
                  className={`w-full sm:flex-1 py-3 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition ${
                    isGenerating || (!referenceFile && !referencePreview)
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 hover:shadow-amber-500/20 active:scale-[0.99]'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      Generando las 4 tomas de catálogo...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generar las 4 imágenes de catálogo
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

          {/* Section 3: The 4 Generated Slots Grid */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Galería de Catálogo Oficial (Orden 1, 2, 3 y 4)
                </h3>
                <span className="text-xs text-slate-400">
                  Haz clic en cualquier toma para reemplazarla con tu propia foto o regenerarla.
                </span>
              </div>

              {hasUnsavedChanges && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                  ⚠️ Cambios pendientes de guardar
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {SLOT_CONFIG.map((slot) => {
                const imgUrl = generatedGallery[slot.index];
                const isReplacing = replacingSlotIndex === slot.index;
                const isStale = staleSlots[slot.index];

                return (
                  <div
                    key={slot.index}
                    className={`bg-slate-950 border rounded-2xl p-3 flex flex-col justify-between transition relative overflow-hidden ${
                      isStale
                        ? 'border-amber-600/60 shadow-lg shadow-amber-950/20'
                        : imgUrl
                        ? 'border-slate-800 hover:border-slate-700'
                        : 'border-slate-800/60 opacity-80'
                    }`}
                  >
                    {/* Slot Header */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${slot.badgeColor}`}>
                        {slot.number}. {slot.slotName}
                      </span>
                      {slot.isBase && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                          Toma Base
                        </span>
                      )}
                    </div>

                    {/* Stale Warning Badge if base changed */}
                    {isStale && (
                      <div className="mb-2 px-2 py-1 bg-amber-950/80 border border-amber-600 text-[10px] text-amber-200 rounded-lg flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>Se sugiere regenerar para mantener coherencia.</span>
                      </div>
                    )}

                    {/* Image Preview Box */}
                    <div className="w-full aspect-square rounded-xl bg-slate-900 border border-slate-800 overflow-hidden relative flex items-center justify-center group mb-3">
                      {isReplacing ? (
                        <div className="flex flex-col items-center justify-center p-4 text-center">
                          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mb-2" />
                          <span className="text-xs text-slate-300 font-medium">Procesando toma...</span>
                        </div>
                      ) : imgUrl ? (
                        <>
                          <img
                            src={imgUrl}
                            alt={slot.slotName}
                            className="w-full h-full object-contain transition duration-300 group-hover:scale-105"
                          />
                          <a
                            href={imgUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-slate-900 text-slate-300 hover:text-white rounded-lg border border-slate-700 opacity-0 group-hover:opacity-100 transition"
                            title="Ver en tamaño completo (1000 × 1000)"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </a>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4 text-center text-slate-500">
                          <Camera className="w-8 h-8 mb-1 text-slate-600" />
                          <span className="text-xs">Pendiente de generar</span>
                        </div>
                      )}
                    </div>

                    {/* Detail Controls (Only for Slot 2: Detalle Macro) */}
                    {slot.index === 2 && (
                      <div className="bg-slate-900/90 border border-purple-900/40 rounded-xl p-2.5 mb-2.5 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-purple-300 font-semibold text-[11px]">
                          <span className="flex items-center gap-1">
                            <ZoomIn className="w-3 h-3" /> Enfoque de Recorte
                          </span>
                          <span>{cropZoom}x Zoom</span>
                        </div>
                        <div className="grid grid-cols-5 gap-1">
                          {[
                            { id: 'top', label: 'Arriba' },
                            { id: 'left', label: 'Izq' },
                            { id: 'center', label: 'Centro' },
                            { id: 'right', label: 'Der' },
                            { id: 'bottom', label: 'Abajo' }
                          ].map(pos => (
                            <button
                              key={pos.id}
                              type="button"
                              onClick={() => setCropPosition(pos.id)}
                              className={`py-1 text-[10px] rounded font-medium transition ${
                                cropPosition === pos.id
                                  ? 'bg-purple-600 text-white font-bold'
                                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                              }`}
                            >
                              {pos.label}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[10px] text-slate-400">Zoom:</span>
                          {[1.8, 2.2, 2.6, 3.0].map(z => (
                            <button
                              key={z}
                              type="button"
                              onClick={() => setCropZoom(z)}
                              className={`flex-1 py-0.5 text-[10px] rounded transition ${
                                cropZoom === z
                                  ? 'bg-purple-600 text-white font-bold'
                                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                              }`}
                            >
                              {z}x
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions per slot */}
                    <div className="space-y-1.5 pt-1">
                      
                      {/* Subir / Reemplazar Foto (Botón explícito pedido por el usuario) */}
                      <button
                        type="button"
                        disabled={isReplacing}
                        onClick={() => slotFileInputRefs.current[slot.index]?.click()}
                        className="w-full py-1.5 px-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 border border-slate-700 hover:border-slate-500 flex items-center justify-center gap-1.5 transition"
                      >
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        Subir / Reemplazar foto
                      </button>
                      <input
                        ref={el => (slotFileInputRefs.current[slot.index] = el)}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleManualSlotUpload(slot.index, file);
                          e.target.value = '';
                        }}
                      />

                      {/* Regenerar Toma Individual con Sharp / IA */}
                      <button
                        type="button"
                        disabled={isReplacing || (!generatedGallery[1] && slot.index !== 1 && !referencePreview)}
                        onClick={() => handleRegenerateSingle(slot.index)}
                        className="w-full py-1 px-2 rounded-lg text-[11px] font-medium bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 flex items-center justify-center gap-1 transition"
                      >
                        <RefreshCw className={`w-3 h-3 ${isReplacing ? 'animate-spin' : ''}`} />
                        Regenerar toma con IA
                      </button>

                    </div>

                    <p className="text-[10px] text-slate-500 mt-2 line-clamp-2 leading-tight">
                      {slot.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Final Action Bar & Disclaimers */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            
            <div className="flex items-center gap-2 text-xs text-slate-400 max-w-lg">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Aviso de Catálogo:</strong> Las imágenes generadas son referencias visuales de alta precisión del producto. No modifican precios, existencias ni especificaciones comerciales.
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Restore Button (if backup exists) */}
              {selectedProduct?.previousImagesBackup && (
                <button
                  type="button"
                  disabled={isRestoring}
                  onClick={handleRestoreGallery}
                  className="py-2 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition"
                  title="Revertir a la galería anterior antes de los cambios"
                >
                  <RotateCcw className={`w-3.5 h-3.5 text-blue-400 ${isRestoring ? 'animate-spin' : ''}`} />
                  Restaurar galería anterior
                </button>
              )}

              {/* Cancel Button */}
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition"
              >
                Cerrar
              </button>

              {/* Apply to Product Button */}
              <button
                type="button"
                disabled={isSaving || generatedGallery.filter(Boolean).length < 4}
                onClick={handleApplyToProduct}
                className={`py-2 px-5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition ${
                  isSaving || generatedGallery.filter(Boolean).length < 4
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-emerald-600/20 active:scale-95'
                }`}
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Guardando en catálogo...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Aplicar las 4 fotos al producto
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* AI Transparency & Config Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Info className="w-5 h-5 text-amber-400" />
                Transparencia de Motores y Costos de IA
              </h3>
              <button
                onClick={() => setShowAiModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-3 bg-emerald-950/60 border border-emerald-700/60 rounded-xl space-y-1">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  {aiConfig?.engineName || 'Motor Nativo Sharp v0.35.5'} (Activo por defecto)
                </div>
                <p className="text-emerald-200/90">
                  <strong>Costo:</strong> {aiConfig?.costPerImage || '$0.00 MXN / Gratis e Ilimitado'}.
                </p>
                <p className="text-slate-300">
                  Opera 100% en el servidor (Render / Supabase). Corrige encuadres, compone sobre fondo blanco puro con sombras vectoriales difusas, recorta detalles macro reales con filtro de nitidez y calcula cotas de medidas en español sin cuotas externas.
                </p>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Proveedor Externo Opcional: {aiConfig?.externalAi?.provider || 'Google Gemini / Imagen 3'}
                </div>
                <p className="text-slate-400">
                  <strong>Estado:</strong> {aiConfig?.externalAi?.available ? '✅ Conectado' : '⚪ No configurado (No necesario)'}
                </p>
                <p className="text-slate-400">
                  <strong>Costo estimado si se activa:</strong> {aiConfig?.externalAi?.estimatedCost || '~$0.03 USD (~$0.60 MXN) por imagen generada'}
                </p>
                <p className="text-slate-400">
                  {aiConfig?.externalAi?.note}
                </p>
              </div>

              <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl space-y-1 text-slate-400">
                <strong>Almacenamiento Persistente en Render:</strong>
                <p>
                  Destino: <span className="font-mono text-amber-300">{aiConfig?.storageTarget}</span>. Las imágenes generadas se guardan de forma permanente y no se borran al reiniciar o desplegar la aplicación en Render.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAiModal(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold text-xs transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
