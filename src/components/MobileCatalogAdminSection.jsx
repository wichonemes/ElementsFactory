import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Smartphone, 
  Download, 
  ShieldCheck, 
  Globe, 
  Sparkles,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  FolderOpen,
  Check
} from 'lucide-react';

export default function MobileCatalogAdminSection({
  token,
  businessSettings,
  onUpdateSettings,
  onRefreshCatalog
}) {
  const fileInputRef = useRef(null);

  const initialConfig = businessSettings?.mobileCatalogConfig || {
    enabled: true,
    title: 'Catálogo Móvil Artesano Digital (9:16)',
    subtitle: 'Piezas en 3D, Corte Láser, Sublimación y Vinil con enlaces a MakerWorld',
    buttonText: '📱 Catálogo Móvil PDF',
    fileName: 'Catalogo_Movil_Artesano_Digital.pdf',
    fileUrl: '/downloads/catalogo_movil_artesano_digital.pdf',
    fileSize: '1,312 KB',
    fileType: 'application/pdf',
    updatedAt: new Date().toISOString(),
    showInNavbar: true,
    showInDrawer: true,
    showInFooter: true
  };

  const [config, setConfig] = useState(initialConfig);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', type: '' });

  const showFeedback = (text, type = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback({ text: '', type: '' }), 4500);
  };

  // Toggle rápido de Activar / Desactivar
  const handleToggleActive = async (newVal) => {
    const nextState = newVal !== undefined ? newVal : !config.enabled;
    const updated = { ...config, enabled: nextState };
    setConfig(updated);

    try {
      const res = await fetch('/api/admin/catalog-pdf/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        showFeedback(
          nextState 
            ? '🟢 Catálogo móvil activado y visible en la tienda online' 
            : '🔴 Catálogo móvil desactivado y ocultado en la tienda',
          'success'
        );
        if (onRefreshCatalog) onRefreshCatalog();
        if (onUpdateSettings) {
          onUpdateSettings({ ...businessSettings, mobileCatalogConfig: updated });
        }
      } else {
        showFeedback('No se pudo actualizar el estado en el servidor', 'error');
      }
    } catch (err) {
      showFeedback('Error de conexión al cambiar el estado: ' + err.message, 'error');
    }
  };

  // Subida de cualquier archivo (PDF, fotos, folletos, documentos)
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      showFeedback('El archivo supera el límite de 50MB. Intenta con un archivo más ligero.', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);

    try {
      const formData = new FormData();
      formData.append('file', file);

      setUploadProgress(45);
      const res = await fetch('/api/admin/catalog-pdf/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      setUploadProgress(85);
      const data = await res.json();

      if (res.ok && data.mobileCatalogConfig) {
        setConfig(data.mobileCatalogConfig);
        setUploadProgress(100);
        showFeedback(`¡Archivo "${file.name}" subido con éxito y activado en la tienda!`, 'success');
        if (onRefreshCatalog) onRefreshCatalog();
        if (onUpdateSettings) {
          onUpdateSettings({ ...businessSettings, mobileCatalogConfig: data.mobileCatalogConfig });
        }
      } else {
        showFeedback(data.error || 'No fue posible subir el archivo.', 'error');
      }
    } catch (err) {
      showFeedback('Error al subir el archivo: ' + err.message, 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Guardar cambios en títulos y opciones
  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/catalog-pdf/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (res.ok && data.mobileCatalogConfig) {
        setConfig(data.mobileCatalogConfig);
        showFeedback('Configuración del catálogo móvil guardada exitosamente.', 'success');
        if (onRefreshCatalog) onRefreshCatalog();
        if (onUpdateSettings) {
          onUpdateSettings({ ...businessSettings, mobileCatalogConfig: data.mobileCatalogConfig });
        }
      } else {
        showFeedback(data.error || 'Error al guardar los cambios.', 'error');
      }
    } catch (err) {
      showFeedback('Error al guardar: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Restaurar al catálogo original 9:16 con MakerWorld
  const handleResetToDefault = async () => {
    if (!window.confirm('¿Deseas restaurar al Catálogo Móvil 9:16 original con enlaces interactivos a MakerWorld?')) {
      return;
    }
    try {
      const res = await fetch('/api/admin/catalog-pdf/reset', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.mobileCatalogConfig) {
        setConfig(data.mobileCatalogConfig);
        showFeedback('Catálogo restaurado a la versión original 9:16 de Artesano Digital.', 'success');
        if (onRefreshCatalog) onRefreshCatalog();
        if (onUpdateSettings) {
          onUpdateSettings({ ...businessSettings, mobileCatalogConfig: data.mobileCatalogConfig });
        }
      } else {
        showFeedback('Error al restaurar catálogo predeterminado.', 'error');
      }
    } catch (err) {
      showFeedback('Error al restaurar: ' + err.message, 'error');
    }
  };

  const isPdf = config.fileName?.toLowerCase().endsWith('.pdf');
  const isImage = config.fileName?.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/i);

  return (
    <div className="space-y-6">
      {/* Cabecera principal */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-700">
              <Smartphone className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span>Catálogo Móvil &amp; Archivo de Descargas</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  config.enabled 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}>
                  {config.enabled ? '🟢 Activo en Tienda' : '🔴 Oculto'}
                </span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Activa o desactiva la descarga para tus clientes y sube cualquier documento, PDF o folleto que quieras publicar.
              </p>
            </div>
          </div>

          {/* Interruptor maestro Activar / Desactivar */}
          <div className="flex items-center gap-3 bg-gray-50 p-2 sm:px-4 rounded-2xl border border-gray-200">
            <span className="text-xs font-semibold text-gray-700">
              {config.enabled ? 'Tienda Pública:' : 'Tienda Pública:'}
            </span>
            <button
              type="button"
              onClick={() => handleToggleActive()}
              className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                config.enabled ? 'bg-emerald-600' : 'bg-gray-300'
              }`}
              title={config.enabled ? 'Clic para desactivar' : 'Clic para activar'}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  config.enabled ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-xs font-bold ${config.enabled ? 'text-emerald-700' : 'text-gray-500'}`}>
              {config.enabled ? 'Activado' : 'Desactivado'}
            </span>
          </div>
        </div>

        {/* Mensaje de feedback reactivo */}
        {feedback.text && (
          <div className={`mt-4 p-3.5 rounded-2xl flex items-center justify-between text-xs font-medium border ${
            feedback.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            <div className="flex items-center gap-2">
              {feedback.type === 'error' ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
              <span>{feedback.text}</span>
            </div>
            <button onClick={() => setFeedback({ text: '', type: '' })} className="text-gray-400 hover:text-gray-600">
              &times;
            </button>
          </div>
        )}

        {/* Bloque central: Archivo actualmente en línea y Zona de subida */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Tarjeta de Archivo Actual */}
          <div className="bg-[#FAF9F5] rounded-2xl p-5 border border-[#E8E4DA] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                  Archivo actualmente en línea
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-amber-100 text-amber-900">
                  {isPdf ? 'Documento PDF' : isImage ? 'Imagen / Folleto' : 'Archivo'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-gray-200 space-y-2">
                <div className="font-bold text-sm text-gray-900 truncate" title={config.fileName}>
                  {config.fileName || 'Catalogo_Movil_Artesano_Digital.pdf'}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span>Tamaño: <strong>{config.fileSize || '1,312 KB'}</strong></span>
                  <span>Formato: <strong>{config.fileType || 'application/pdf'}</strong></span>
                </div>
                {config.updatedAt && (
                  <div className="text-[11px] text-gray-400">
                    Actualizado: {new Date(config.updatedAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </div>

            {/* Botones de acción rápida sobre el archivo */}
            <div className="mt-4 pt-4 border-t border-gray-200/80 flex flex-wrap items-center gap-2">
              <a
                href={config.fileUrl || '/downloads/catalogo_movil_artesano_digital.pdf'}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-gray-50 text-gray-800 text-xs font-bold border border-gray-300 transition-all shadow-2xs"
              >
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                <span>Previsualizar / Descargar</span>
              </a>

              <button
                type="button"
                onClick={handleResetToDefault}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-gray-600 hover:text-amber-800 text-xs font-semibold hover:bg-amber-50 transition-all cursor-pointer ml-auto"
                title="Volver a poner el catálogo PDF 9:16 oficial de Artesano Digital"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                <span>Restaurar Catálogo Original 9:16</span>
              </button>
            </div>
          </div>

          {/* Tarjeta de Subida libre de cualquier archivo */}
          <div className="bg-white rounded-2xl p-5 border border-dashed-2 border-amber-300/80 hover:border-amber-500 bg-amber-50/20 transition-all flex flex-col justify-center items-center text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              id="mobile-catalog-upload-input"
              disabled={isUploading}
            />

            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 mb-3 shadow-inner">
              {isUploading ? (
                <RefreshCw className="w-7 h-7 animate-spin text-amber-700" />
              ) : (
                <Upload className="w-7 h-7 text-amber-700" />
              )}
            </div>

            <h3 className="font-bold text-sm text-gray-900 mb-1">
              {isUploading ? 'Subiendo archivo al servidor...' : 'Sube lo que tú quieras aquí'}
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mb-4 leading-relaxed">
              Puedes subir un nuevo catálogo en PDF, folleto en imagen (JPG/PNG), lista de precios o documento (hasta 50 MB). Al subirlo sustituirá de inmediato el archivo activo para todos tus clientes.
            </p>

            {isUploading ? (
              <div className="w-full max-w-xs space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-[11px] text-gray-500 font-semibold">{uploadProgress}% completado</span>
              </div>
            ) : (
              <label
                htmlFor="mobile-catalog-upload-input"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2D4F3E] hover:bg-[#233f32] text-white text-xs font-bold cursor-pointer shadow-sm hover:shadow transition-all"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Seleccionar y Subir Archivo</span>
              </label>
            )}
          </div>
        </div>

        {/* Formulario de personalización de títulos y botones */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>✏️ Personalización de Textos y Ubicaciones</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Texto del Botón en la Tienda:
              </label>
              <input
                type="text"
                value={config.buttonText || ''}
                onChange={(e) => setConfig({ ...config, buttonText: e.target.value })}
                placeholder="Ej. 📱 Catálogo Móvil PDF"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2D4F3E]/20 focus:border-[#2D4F3E]"
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block">
                Así aparecerá en la barra superior y en el cotizador.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Título del Catálogo:
              </label>
              <input
                type="text"
                value={config.title || ''}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                placeholder="Ej. Catálogo Móvil Artesano Digital (9:16)"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2D4F3E]/20 focus:border-[#2D4F3E]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Subtítulo o Descripción corta:
              </label>
              <input
                type="text"
                value={config.subtitle || ''}
                onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                placeholder="Ej. Piezas en 3D, Corte Láser, Sublimación y Vinil con enlaces a MakerWorld"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2D4F3E]/20 focus:border-[#2D4F3E]"
              />
            </div>
          </div>

          {/* Opciones de Visibilidad Específica */}
          <div className="mt-4 p-4 rounded-2xl bg-gray-50 border border-gray-200/80">
            <span className="text-xs font-bold text-gray-700 block mb-2.5">
              ¿Dónde quieres mostrar el botón de descarga cuando esté activado?
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-xl border border-gray-200 hover:border-gray-300">
                <input
                  type="checkbox"
                  checked={config.showInNavbar !== false}
                  onChange={(e) => setConfig({ ...config, showInNavbar: e.target.checked })}
                  className="rounded text-[#2D4F3E] focus:ring-[#2D4F3E]"
                />
                <span className="font-medium text-gray-800">Barra superior (Navbar)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-xl border border-gray-200 hover:border-gray-300">
                <input
                  type="checkbox"
                  checked={config.showInDrawer !== false}
                  onChange={(e) => setConfig({ ...config, showInDrawer: e.target.checked })}
                  className="rounded text-[#2D4F3E] focus:ring-[#2D4F3E]"
                />
                <span className="font-medium text-gray-800">Carrito &amp; Cotizador</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-xl border border-gray-200 hover:border-gray-300">
                <input
                  type="checkbox"
                  checked={config.showInFooter !== false}
                  onChange={(e) => setConfig({ ...config, showInFooter: e.target.checked })}
                  className="rounded text-[#2D4F3E] focus:ring-[#2D4F3E]"
                />
                <span className="font-medium text-gray-800">Menú Móvil</span>
              </label>
            </div>
          </div>

          {/* Botón Guardar Cambios */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#2D4F3E] hover:bg-[#233f32] text-white text-xs font-bold cursor-pointer transition-all shadow-sm hover:shadow"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>{isSaving ? 'Guardando...' : 'Guardar Cambios de Catálogo'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
