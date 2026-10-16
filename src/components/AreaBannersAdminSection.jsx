import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon, Upload, Check, AlertTriangle, RefreshCw,
  Eye, Sparkles, Home, Briefcase, CalendarHeart, ExternalLink,
  Layers, ArrowRight, Save
} from 'lucide-react';

const SUGGESTED_AREA_IMAGES = {
  hogar: [
    { label: 'Hogar Cálido & Madera', url: '/uploads/bundle_promo_hogar_1.jpg' },
    { label: 'Lámparas & Decoración Nórdica', url: '/uploads/t38_lampara_madera_minimalista.png' },
    { label: 'Recibidor & Colgadores', url: '/uploads/l14_colgador_llaves_bienvenidos.png' },
    { label: 'Macetas & Geometría 3D', url: '/uploads/t6_maceta_geometrica_espiral_olivo.png' }
  ],
  negocios: [
    { label: 'Identidad Corporativa & Mostrador', url: '/uploads/bundle_promo_biz_1.jpg' },
    { label: 'Smart Deck & Escritorios Tech', url: '/uploads/t39_smart_deck_streamer_workspace.png' },
    { label: 'Soportes de Mostrador & QR', url: '/uploads/t16_soporte_qr_mostrador_olivo.png' },
    { label: 'Soporte Inteligente NFC Contacto', url: '/uploads/t33_smart_nfc_prisma_olivo.png' }
  ],
  eventos: [
    { label: 'Bodas & Ceremonias Rústicas', url: '/uploads/bienvenida_ceremonia_boda.jpg' },
    { label: 'Letrero de Arco Nupcial', url: '/uploads/l2_letrero_bienvenida_arco_boda.png' },
    { label: 'Recuerdos & Fiestas Todo Incluido', url: '/uploads/bundle_promo_ev_1.jpg' },
    { label: 'Números de Mesa 3D de Alta Presencia', url: '/uploads/t25_numero_mesa_07_volumen.png' }
  ]
};

const AREA_METADATA = {
  hogar: {
    label: 'Hogar & Espacios',
    icon: Home,
    color: 'emerald',
    badgeText: 'Colección Oficial Hogar',
    gradient: 'from-[#17251E] via-[#22382B] to-[#121A15]'
  },
  negocios: {
    label: 'Negocios & Marcas',
    icon: Briefcase,
    color: 'amber',
    badgeText: 'Colección Oficial Negocios',
    gradient: 'from-[#251A10] via-[#352516] to-[#19130D]'
  },
  eventos: {
    label: 'Eventos Especiales',
    icon: CalendarHeart,
    color: 'rose',
    badgeText: 'Colección Oficial Eventos',
    gradient: 'from-[#2D0F1B] via-[#3B1524] to-[#1A0B12]'
  }
};

export default function AreaBannersAdminSection({
  token,
  onWorldsUpdated = null
}) {
  const [worlds, setWorlds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeAreaId, setActiveAreaId] = useState('hogar');
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    image: ''
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Cargar áreas desde la API
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
    } catch (err) {
      console.error('Error cargando áreas:', err);
      setStatusMsg({ type: 'error', text: 'No se pudieron cargar las áreas del taller.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorlds();
  }, []);

  // Al cambiar de área seleccionada, actualizar el formulario
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

  // Subida de imagen para el banner
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMsg({ type: 'error', text: 'Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP).' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStatusMsg({ type: 'error', text: 'La imagen excede el límite de 5MB.' });
      return;
    }

    setUploading(true);
    setStatusMsg({ type: 'info', text: 'Subiendo imagen de banner al taller...' });

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers,
        body: uploadFormData
      });

      if (!res.ok) {
        throw new Error(`Error en servidor: ${res.statusText}`);
      }

      const data = await res.json();
      if (data.imageUrl) {
        setFormData(prev => ({ ...prev, image: data.imageUrl }));
        setStatusMsg({ type: 'success', text: '¡Fotografía subida exitosamente! Haz clic en "Guardar Banner" para aplicar los cambios.' });
      } else {
        throw new Error('Respuesta inválida al subir imagen.');
      }
    } catch (err) {
      console.error('Error subiendo imagen:', err);
      setStatusMsg({ type: 'error', text: `No se pudo subir la imagen: ${err.message}` });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Guardar cambios en el backend (PUT /api/worlds/:id)
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

      // Actualizar estado local
      setWorlds(prev => prev.map(w => w.id === activeAreaId ? updatedWorld : w));
      setStatusMsg({
        type: 'success',
        text: `¡Banner de "${updatedWorld.name}" guardado y publicado en la tienda con éxito!`
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

  const meta = AREA_METADATA[activeAreaId] || AREA_METADATA.hogar;
  const ActiveIcon = meta.icon;
  const suggestedList = SUGGESTED_AREA_IMAGES[activeAreaId] || [];

  return (
    <div className="space-y-6">
      
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-3xl border border-[#E8E4DA] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#2D4F3E]">
            <ImageIcon className="w-4 h-4 text-[#D4A359]" />
            <span>Personalización de Vitrinas</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-heading text-[#1F2421]">
            Banners de Portada por Área (Hogar, Negocios, Eventos)
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-3xl">
            Sube o cambia la imagen principal, título, lema y descripción de cada una de las 3 áreas maestras del taller. Se refleja en la pantalla de inicio y en las cabeceras de catálogo.
          </p>
        </div>

        <button
          type="button"
          onClick={loadWorlds}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          title="Recargar datos del servidor"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refrescar</span>
        </button>
      </div>

      {/* Selector de Áreas en 3 Pestañas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { id: 'hogar', label: 'Hogar & Decoración', icon: Home, desc: 'Lámparas, percheros y macetas' },
          { id: 'negocios', label: 'Negocios & Marcas', icon: Briefcase, desc: 'Smart Decks, QR y branding' },
          { id: 'eventos', label: 'Eventos Especiales', icon: CalendarHeart, desc: 'Bodas, fiestas y recuerdos' }
        ].map(area => {
          const isSelected = activeAreaId === area.id;
          const Icon = area.icon;
          return (
            <button
              key={area.id}
              type="button"
              onClick={() => handleSelectArea(area.id)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 shadow-2xs ${
                isSelected
                  ? 'bg-[#17251E] text-white border-[#D4A359] ring-2 ring-[#D4A359]/40 scale-101 shadow-md'
                  : 'bg-white hover:bg-gray-50 text-gray-800 border-[#E8E4DA]'
              }`}
            >
              <div className={`p-2.5 rounded-xl shrink-0 ${
                isSelected ? 'bg-[#D4A359] text-stone-950 font-black' : 'bg-gray-100 text-gray-700'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-extrabold text-sm truncate">{area.label}</div>
                <div className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                  {area.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Notificación de estado */}
      {statusMsg.text && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 border animate-in fade-in ${
          statusMsg.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : statusMsg.type === 'error'
            ? 'bg-red-50 text-red-800 border-red-200'
            : 'bg-blue-50 text-blue-800 border-blue-200'
        }`}>
          {statusMsg.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Previsualización en Vivo del Banner */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-gray-600">
            <Eye className="w-3.5 h-3.5 text-[#2D4F3E]" />
            <span>Previsualización en Vivo del Banner ({meta.label})</span>
          </div>
          <span className="text-[11px] text-gray-400">
            Aspecto idéntico al catálogo de la tienda
          </span>
        </div>

        {/* Banner Preview Frame */}
        <div className="relative rounded-3xl overflow-hidden bg-[#1F2421] text-white shadow-xl border-2 border-white/10 min-h-[190px] sm:min-h-[220px] flex items-center">
          {/* Imagen de fondo con opacidad */}
          {formData.image ? (
            <img
              src={formData.image}
              alt={formData.name}
              className="absolute inset-0 w-full h-full object-cover opacity-35"
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-r ${meta.gradient} opacity-50`} />
          )}

          {/* Degradado para legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#17251E] via-[#17251E]/85 to-transparent" />

          {/* Contenido sobre el banner */}
          <div className="relative z-10 p-6 sm:p-8 max-w-2xl space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10.5px] font-black uppercase tracking-widest">
              {meta.badgeText}
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-white tracking-tight">
              {formData.name || 'Nombre del Área'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-normal">
              {formData.description || 'Descripción del área y tipos de manufactura artesanal disponibles...'}
            </p>
            {formData.tagline && (
              <p className="text-[11px] font-medium text-amber-300/90 italic">
                &ldquo;{formData.tagline}&rdquo;
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Formulario de Edición y Subida de Imagen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white p-6 rounded-3xl border border-[#E8E4DA] shadow-xs">
        
        {/* LADO IZQUIERDO: Subir o Elegir Imagen */}
        <div className="lg:col-span-5 space-y-4 border-b lg:border-b-0 lg:border-r border-gray-100 pb-5 lg:pb-0 lg:pr-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1F2421]">
            <Upload className="w-4 h-4 text-[#2D4F3E]" />
            <span>1. Imagen de Portada</span>
          </div>

          {/* Botón de subida de archivo */}
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
                Formato JPG, PNG o WEBP (máx. 5MB)
              </p>
            </label>
          </div>

          {/* URL Directa de Imagen */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">
              O escribe la ruta / URL de imagen:
            </label>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
              placeholder="/uploads/banner.jpg o https://..."
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#2D4F3E]"
            />
          </div>

          {/* Galería Sugerida de Taller */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs font-bold text-gray-700">
              <span>Fotografías sugeridas de taller:</span>
              <span className="text-[10px] text-gray-400">Clic para aplicar</span>
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
                  <img
                    src={item.url}
                    alt={item.label}
                    className="w-full h-14 rounded-lg object-cover bg-gray-200"
                  />
                  <span className="line-clamp-1">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* LADO DERECHO: Textos y Datos del Banner */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1F2421]">
            <ActiveIcon className="w-4 h-4 text-[#D4A359]" />
            <span>2. Textos & Contenido del Área</span>
          </div>

          {/* Nombre Oficial del Área */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">
              Nombre de la Colección / Área:
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ej. Hogar & Decoración"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2D4F3E]"
            />
          </div>

          {/* Slogan / Tagline */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">
              Slogan o Lema del Área:
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
              placeholder="Ej. Piezas cálidas en madera y resina para vestir tus espacios..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2D4F3E]"
            />
          </div>

          {/* Descripción Completa */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">
              Descripción completa (visible en la portada del catálogo):
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Explica qué encontrará el cliente en esta área, materiales y opciones de personalización..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#2D4F3E]"
            />
          </div>

          {/* Botón de Guardar */}
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
  );
}
