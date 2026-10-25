import React, { useState, useRef, useEffect } from 'react';
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
  Check,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Star,
  ExternalLink,
  Layers,
  X,
  Link as LinkIcon
} from 'lucide-react';

export default function MobileCatalogAdminSection({
  token,
  businessSettings,
  onUpdateSettings,
  onRefreshCatalog
}) {
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('artesano_admin_token') : '') || '';

  const initialConfig = businessSettings?.mobileCatalogConfig || {
    enabled: true,
    title: 'Catálogos Oficiales de Temporada (PDF Móvil)',
    subtitle: 'Piezas en 3D, Corte Láser, Sublimación y Vinil con enlaces a MakerWorld',
    buttonText: '📱 Catálogos PDF',
    fileName: 'Catalogo_Movil_Artesano_Digital.pdf',
    fileUrl: '/downloads/catalogo_movil_artesano_digital.pdf',
    fileSize: '1,312 KB',
    fileType: 'application/pdf',
    updatedAt: new Date().toISOString(),
    showInNavbar: true,
    showInDrawer: true,
    showInFooter: true,
    catalogs: [
      {
        id: 'cat-general-oficial',
        name: 'Catálogo Móvil Oficial 2026 (9:16)',
        season: 'Todo el año',
        badge: 'Colección General',
        description: 'Llaveros, macetas, letreros, tazas y piezas 3D con enlaces a MakerWorld.',
        fileName: 'Catalogo_Movil_Artesano_Digital.pdf',
        fileUrl: '/downloads/catalogo_movil_artesano_digital.pdf',
        fileSize: '1,312 KB',
        fileType: 'application/pdf',
        enabled: true,
        isPrimary: true,
        uploadedAt: new Date().toISOString()
      }
    ]
  };

  const [config, setConfig] = useState(() => {
    if (businessSettings?.mobileCatalogConfig) return businessSettings.mobileCatalogConfig;
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('artesano_mobile_catalogs_cache');
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return initialConfig;
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', type: '' });
  const uploadXhrRef = useRef(null);

  // Cancelar subida y cerrar modal de manera segura sin dejar la UI congelada
  const handleCancelModal = () => {
    if (uploadXhrRef.current) {
      try {
        uploadXhrRef.current.abort();
      } catch (e) {}
      uploadXhrRef.current = null;
    }
    setIsUploading(false);
    setUploadProgress(0);
    setCatalogModalOpen(false);
    setModalFile(null);
  };

  // Guardar configuración localmente para garantizar que nunca se pierdan cambios ni bloquee al usuario
  const persistConfigLocally = (newConfig) => {
    setConfig(newConfig);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('artesano_mobile_catalogs_cache', JSON.stringify(newConfig));
      }
    } catch (e) {}
    if (onUpdateSettings) {
      onUpdateSettings({ ...businessSettings, mobileCatalogConfig: newConfig });
    }
  };

  // Modales de confirmación para evitar bloqueos en celulares (window.confirm)
  const [deleteConfirmCat, setDeleteConfirmCat] = useState(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  // Modal para agregar o editar un catálogo
  const [catalogModalOpen, setCatalogModalOpen] = useState(false);
  const [editingCatalog, setEditingCatalog] = useState(null);
  const [modalForm, setModalForm] = useState({
    name: '',
    season: '',
    badge: '',
    description: '',
    fileUrl: '',
    fileName: '',
    isPrimary: false,
    enabled: true
  });
  const [modalFile, setModalFile] = useState(null);
  const [modalIsReplacingFile, setModalIsReplacingFile] = useState(false);

  // Sincronización en vivo con la base de datos al montar el componente
  useEffect(() => {
    let isMounted = true;
    const fetchLatestConfig = async () => {
      try {
        const res = await fetch('/api/admin/catalog-pdf/config', {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && isMounted) {
            setConfig(data);
          }
        }
      } catch (e) {
        console.warn('No fue posible consultar configuración remota de catálogos:', e);
      }
    };
    fetchLatestConfig();
    return () => { isMounted = false; };
  }, [authToken]);

  // Actualizar si las configuraciones del negocio cambian desde el padre
  useEffect(() => {
    if (businessSettings?.mobileCatalogConfig) {
      setConfig(businessSettings.mobileCatalogConfig);
    }
  }, [businessSettings?.mobileCatalogConfig]);

  const showFeedback = (text, type = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback({ text: '', type: '' }), 4500);
  };

  // Toggle maestro Activar / Desactivar
  const handleToggleActive = async (newVal) => {
    const nextState = newVal !== undefined ? newVal : !config.enabled;
    const updated = { ...config, enabled: nextState };
    setConfig(updated);

    try {
      const res = await fetch('/api/admin/catalog-pdf/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        showFeedback(
          nextState 
            ? '🟢 Catálogos móviles activados y visibles en la tienda online' 
            : '🔴 Catálogos móviles desactivados y ocultados en la tienda',
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

  // Abrir modal para crear nuevo catálogo
  const handleOpenCreateModal = () => {
    setEditingCatalog(null);
    setModalForm({
      name: '',
      season: 'Temporada Actual',
      badge: 'Novedad',
      description: '',
      fileUrl: '',
      fileName: '',
      isPrimary: (config.catalogs || []).length === 0,
      enabled: true
    });
    setModalFile(null);
    setModalIsReplacingFile(false);
    setCatalogModalOpen(true);
  };

  // Abrir modal para editar catálogo existente
  const handleOpenEditModal = (cat) => {
    setEditingCatalog(cat);
    setModalForm({
      name: cat.name || '',
      season: cat.season || '',
      badge: cat.badge || '',
      description: cat.description || '',
      fileUrl: cat.fileUrl || '',
      fileName: cat.fileName || '',
      isPrimary: Boolean(cat.isPrimary),
      enabled: cat.enabled !== false
    });
    setModalFile(null);
    setModalIsReplacingFile(false);
    setCatalogModalOpen(true);
  };

  // Guardar catálogo (Crear o Editar con o sin archivo)
  const handleSaveCatalogModal = async (e) => {
    e.preventDefault();
    const cleanName = (modalForm.name || '').trim();
    if (!cleanName) {
      showFeedback('Por favor asigna un nombre o título al catálogo.', 'error');
      return;
    }

    if (!editingCatalog && !modalFile && !(modalForm.fileUrl || '').trim()) {
      showFeedback('Por favor selecciona un archivo PDF o proporciona una URL de enlace.', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(5);

    try {
      if (modalFile) {
        // Subida mediante XMLHttpRequest para progreso real (0%-100%), timeout y manejo de errores
        const formData = new FormData();
        formData.append('file', modalFile);
        formData.append('name', cleanName);
        formData.append('season', (modalForm.season || '').trim());
        formData.append('badge', (modalForm.badge || '').trim());
        formData.append('description', (modalForm.description || '').trim());
        formData.append('isPrimary', modalForm.isPrimary ? 'true' : 'false');
        formData.append('enabled', modalForm.enabled ? 'true' : 'false');

        if (editingCatalog?.id) {
          formData.append('catalogId', editingCatalog.id);
        }

        const uploadResult = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          uploadXhrRef.current = xhr;
          xhr.open('POST', '/api/admin/catalog-pdf/upload');
          if (authToken) {
            xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
          }
          xhr.timeout = 60000; // 60 segundos de espera para archivos grandes

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable && event.total > 0) {
              const pct = Math.round((event.loaded / event.total) * 100);
              setUploadProgress(Math.min(pct, 95));
            }
          };

          xhr.onload = () => {
            uploadXhrRef.current = null;
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText);
                setUploadProgress(100);
                resolve({ ok: true, data });
              } catch (parseErr) {
                resolve({ ok: true, data: null });
              }
            } else {
              let errorMsg = `Error del servidor (${xhr.status})`;
              try {
                const errData = JSON.parse(xhr.responseText);
                if (errData?.error) errorMsg = errData.error;
              } catch {}
              reject(new Error(errorMsg));
            }
          };

          xhr.onerror = () => {
            uploadXhrRef.current = null;
            reject(new Error('Error de conexión al enviar el archivo PDF. Revisa tu internet o intenta de nuevo.'));
          };

          xhr.ontimeout = () => {
            uploadXhrRef.current = null;
            reject(new Error('La subida tardó demasiado (más de 60s). Comprueba tu conexión o usa un PDF más liviano.'));
          };

          xhr.onabort = () => {
            uploadXhrRef.current = null;
            reject(new Error('Subida cancelada'));
          };

          xhr.send(formData);
        });

        if (uploadResult?.data?.mobileCatalogConfig) {
          persistConfigLocally(uploadResult.data.mobileCatalogConfig);
        }

        showFeedback(
          editingCatalog 
            ? `✓ Catálogo "${cleanName}" actualizado con nuevo archivo.` 
            : `✓ ¡Nuevo catálogo "${cleanName}" subido y listo!`,
          'success'
        );
        setCatalogModalOpen(false);
        setModalFile(null);
        if (onRefreshCatalog) onRefreshCatalog();

      } else if (editingCatalog) {
        // Editar metadatos o URL
        const currentList = config.catalogs || [];
        let updatedList = currentList.map(c => c.id === editingCatalog.id ? {
          ...c,
          name: cleanName,
          season: (modalForm.season || '').trim(),
          badge: (modalForm.badge || '').trim(),
          description: (modalForm.description || '').trim(),
          fileUrl: (modalForm.fileUrl || '').trim() || editingCatalog.fileUrl,
          fileName: (modalForm.fileName || '').trim() || editingCatalog.fileName,
          isPrimary: Boolean(modalForm.isPrimary),
          enabled: modalForm.enabled !== false,
          updatedAt: new Date().toISOString()
        } : c);

        if (modalForm.isPrimary) {
          updatedList = updatedList.map(c => ({ ...c, isPrimary: c.id === editingCatalog.id }));
        }

        const updatedConfig = {
          ...config,
          catalogs: updatedList,
          updatedAt: new Date().toISOString()
        };
        persistConfigLocally(updatedConfig);
        showFeedback(`✓ Datos de "${cleanName}" actualizados con éxito.`, 'success');
        setCatalogModalOpen(false);

        // Sincronizar en segundo plano con el servidor
        fetch(`/api/admin/catalog-pdf/item/${editingCatalog.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
          },
          body: JSON.stringify({
            name: cleanName,
            season: (modalForm.season || '').trim(),
            badge: (modalForm.badge || '').trim(),
            description: (modalForm.description || '').trim(),
            fileUrl: (modalForm.fileUrl || '').trim() || editingCatalog.fileUrl,
            fileName: (modalForm.fileName || '').trim() || editingCatalog.fileName,
            isPrimary: Boolean(modalForm.isPrimary),
            enabled: modalForm.enabled !== false
          })
        }).catch(() => {});
        if (onRefreshCatalog) onRefreshCatalog();

      } else {
        // Crear nuevo catálogo mediante enlace directo / URL
        const fileUrlClean = (modalForm.fileUrl || '').trim() || '/downloads/catalogo_movil_artesano_digital.pdf';
        const fileNameClean = (modalForm.fileName || '').trim() || `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`;
        
        const newItem = {
          id: `cat-${Date.now()}`,
          name: cleanName,
          season: (modalForm.season || '').trim() || 'Temporada Actual',
          badge: (modalForm.badge || '').trim() || 'Novedad',
          description: (modalForm.description || '').trim(),
          fileUrl: fileUrlClean,
          fileName: fileNameClean,
          fileSize: 'PDF En Línea',
          fileType: 'application/pdf',
          isPrimary: Boolean(modalForm.isPrimary),
          enabled: modalForm.enabled !== false,
          uploadedAt: new Date().toISOString()
        };

        const currentList = config.catalogs || [];
        let updatedList = [newItem, ...currentList];
        if (modalForm.isPrimary) {
          updatedList = updatedList.map(c => ({ ...c, isPrimary: c.id === newItem.id }));
        }

        const updatedConfig = {
          ...config,
          catalogs: updatedList,
          updatedAt: new Date().toISOString()
        };
        persistConfigLocally(updatedConfig);
        showFeedback(`✓ ¡Catálogo "${cleanName}" registrado con éxito!`, 'success');
        setCatalogModalOpen(false);

        // Sincronizar en segundo plano con el servidor
        fetch('/api/admin/catalog-pdf/item', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
          },
          body: JSON.stringify(newItem)
        }).catch(() => {});
        if (onRefreshCatalog) onRefreshCatalog();
      }
    } catch (err) {
      showFeedback('Error al procesar el catálogo: ' + err.message, 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Eliminar un catálogo individual
  const handleDeleteCatalog = async (catId, catName) => {
    // 1. Eliminar inmediatamente en el estado local y caché
    const currentList = config.catalogs || [];
    let updatedList = currentList.filter(c => c.id !== catId);
    if (updatedList.length > 0 && !updatedList.some(c => c.isPrimary)) {
      updatedList[0].isPrimary = true;
    }
    const updatedConfig = {
      ...config,
      catalogs: updatedList,
      updatedAt: new Date().toISOString()
    };
    persistConfigLocally(updatedConfig);
    showFeedback(`✓ Catálogo "${catName}" eliminado del sistema.`, 'success');
    setDeleteConfirmCat(null);

    // 2. Sincronizar en segundo plano con el servidor
    try {
      await fetch(`/api/admin/catalog-pdf/item/${catId}`, {
        method: 'DELETE',
        headers: {
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        }
      });
    } catch (err) {
      console.warn('Sincronización remota de eliminación diferida:', err);
    }
    if (onRefreshCatalog) onRefreshCatalog();
  };

  // Toggle de activación individual de un catálogo
  const handleToggleCatalogItem = async (cat) => {
    const nextState = !cat.enabled;
    const currentList = config.catalogs || [];
    const updatedList = currentList.map(c => c.id === cat.id ? { ...c, enabled: nextState } : c);
    const updatedConfig = { ...config, catalogs: updatedList, updatedAt: new Date().toISOString() };
    persistConfigLocally(updatedConfig);
    showFeedback(
      nextState 
        ? `🟢 Catálogo "${cat.name}" activado para clientes` 
        : `🔴 Catálogo "${cat.name}" ocultado`,
      'success'
    );
    if (onRefreshCatalog) onRefreshCatalog();

    try {
      await fetch(`/api/admin/catalog-pdf/item/${cat.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({ enabled: nextState })
      });
    } catch (err) {}
  };

  // Marcar como catálogo principal
  const handleSetPrimary = async (cat) => {
    const currentList = config.catalogs || [];
    const updatedList = currentList.map(c => ({
      ...c,
      isPrimary: c.id === cat.id
    }));
    const updatedConfig = {
      ...config,
      catalogs: updatedList,
      fileUrl: cat.fileUrl || config.fileUrl,
      fileName: cat.fileName || config.fileName,
      updatedAt: new Date().toISOString()
    };
    persistConfigLocally(updatedConfig);
    showFeedback(`★ "${cat.name}" marcado como Catálogo Principal.`, 'success');
    if (onRefreshCatalog) onRefreshCatalog();

    try {
      await fetch(`/api/admin/catalog-pdf/item/${cat.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({ isPrimary: true })
      });
    } catch (err) {}
  };

  // Guardar configuración general (Textos y ubicaciones)
  const handleSaveSettings = async () => {
    setIsSaving(true);
    persistConfigLocally(config);
    showFeedback('✓ Configuración guardada exitosamente.', 'success');
    try {
      await fetch('/api/admin/catalog-pdf/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify(config)
      });
      if (onRefreshCatalog) onRefreshCatalog();
    } catch (err) {
      console.warn('Sincronización remota diferida:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Restaurar al catálogo original 9:16
  const executeResetToDefault = async () => {
    persistConfigLocally(initialConfig);
    showFeedback('✓ Catálogo restaurado a los valores predeterminados.', 'success');
    if (onRefreshCatalog) onRefreshCatalog();
    setResetConfirmOpen(false);

    try {
      await fetch('/api/admin/catalog-pdf/reset', {
        method: 'POST',
        headers: {
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        }
      });
    } catch (err) {}
  };

  const catalogList = config.catalogs || [];

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
                <span>Catálogos Móviles &amp; Colecciones de Temporada</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  config.enabled 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}>
                  {config.enabled ? '🟢 Activo en Tienda' : '🔴 Oculto'}
                </span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Administra múltiples catálogos en PDF (General, Bodas, Navidad, Mayoreo) y deja activos los que quieras para tus clientes.
              </p>
            </div>
          </div>

          {/* Interruptor maestro Activar / Desactivar */}
          <div className="flex items-center gap-3 bg-gray-50 p-2 sm:px-4 rounded-2xl border border-gray-200">
            <span className="text-xs font-semibold text-gray-700">
              Descargas públicas:
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
            <button onClick={() => setFeedback({ text: '', type: '' })} className="text-gray-400 hover:text-gray-600 cursor-pointer">
              &times;
            </button>
          </div>
        )}

        {/* Sección de Múltiples Catálogos */}
        <div className="mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-600" />
                <span>Tus Catálogos y Colecciones ({catalogList.length})</span>
              </h3>
              <p className="text-xs text-gray-500">
                Puedes tener varios catálogos en PDF activos al mismo tiempo. El cliente verá un selector para elegir el que le interese.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2D4F3E] hover:bg-[#233f32] text-white text-xs font-bold cursor-pointer transition-all shadow-sm hover:shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Subir Nuevo Catálogo PDF</span>
            </button>
          </div>

          {/* Lista de Catálogos Existentes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {catalogList.map((cat) => {
              const isPdf = cat.fileName?.toLowerCase().endsWith('.pdf') || cat.fileType === 'application/pdf';

              return (
                <div
                  key={cat.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    cat.enabled 
                      ? 'bg-[#FAF9F5] border-[#E8E4DA] hover:border-[#D4A359]' 
                      : 'bg-stone-50 border-stone-200 opacity-60'
                  }`}
                >
                  <div>
                    {/* Insignias y Acciones superiores */}
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {cat.isPrimary ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                            Principal
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(cat)}
                            className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-white hover:bg-stone-100 text-stone-600 border border-stone-300 cursor-pointer transition-colors"
                            title="Hacer este catálogo el principal"
                          >
                            Hacer Principal
                          </button>
                        )}

                        {cat.badge && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            {cat.badge}
                          </span>
                        )}

                        {cat.season && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-stone-200/80 text-stone-700 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-stone-500" />
                            {cat.season}
                          </span>
                        )}
                      </div>

                      {/* Switch Activo / Inactivo */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleCatalogItem(cat)}
                          className={`text-xs px-2 py-0.5 rounded-full font-bold cursor-pointer transition-all border ${
                            cat.enabled 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                              : 'bg-stone-100 text-stone-500 border-stone-300'
                          }`}
                        >
                          {cat.enabled ? '✓ Activo' : 'Oculto'}
                        </button>
                      </div>
                    </div>

                    {/* Nombre y archivo */}
                    <h4 className="font-bold text-sm text-gray-900 mb-1">
                      {cat.name}
                    </h4>

                    {cat.description && (
                      <p className="text-xs text-gray-600 mb-2.5 line-clamp-2 leading-relaxed">
                        {cat.description}
                      </p>
                    )}

                    {/* Ficha técnica de archivo */}
                    <div className="p-2.5 rounded-xl bg-white border border-stone-200/80 text-[11px] text-gray-500 space-y-1 mb-3">
                      <div className="truncate font-semibold text-gray-700 flex items-center gap-1.5" title={cat.fileName}>
                        <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">{cat.fileName}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-gray-400">
                        <span>{cat.fileSize || 'N/D'} · {isPdf ? 'PDF Móvil' : 'Archivo'}</span>
                        {cat.uploadedAt && <span>{new Date(cat.uploadedAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <a
                        href={cat.fileUrl || '/downloads/catalogo_movil_artesano_digital.pdf'}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 text-xs font-semibold flex items-center gap-1 transition-all"
                        title="Ver / Previsualizar"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Ver</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(cat)}
                        className="p-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                        title="Editar nombre, temporada y distintivo"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-amber-600" />
                        <span>Editar</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setDeleteConfirmCat(cat)}
                      className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                      title="Eliminar este catálogo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {catalogList.length === 0 && (
            <div className="p-8 rounded-2xl bg-stone-50 border border-dashed-2 border-stone-300 text-center text-xs text-stone-500">
              <FolderOpen className="w-8 h-8 mx-auto text-stone-400 mb-2" />
              <p className="font-bold text-stone-700">No hay catálogos subidos aún.</p>
              <p className="mt-1">Haz clic en «Subir Nuevo Catálogo PDF» para agregar tu primer catálogo o colección de temporada.</p>
            </div>
          )}
        </div>

        {/* Personalización de textos globales y botón público */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>✏️ Configuración General y Texto del Botón</span>
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
                placeholder="Ej. 📱 Catálogos PDF"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2D4F3E]/20 focus:border-[#2D4F3E]"
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block">
                Texto visible en la barra superior y cotizador.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Título General del Modal de Catálogos:
              </label>
              <input
                type="text"
                value={config.title || ''}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                placeholder="Ej. Catálogos Oficiales de Temporada"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2D4F3E]/20 focus:border-[#2D4F3E]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Subtítulo explicativo:
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

          {/* Opciones de Visibilidad */}
          <div className="mt-4 p-4 rounded-2xl bg-gray-50 border border-gray-200/80">
            <span className="text-xs font-bold text-gray-700 block mb-2.5">
              ¿Dónde mostrar el botón de catálogos cuando esté activado?
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

          {/* Botones de Guardar / Restaurar */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setResetConfirmOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-gray-600 hover:text-amber-800 text-xs font-semibold hover:bg-amber-50 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span>Restaurar Predeterminados</span>
            </button>

            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#2D4F3E] hover:bg-[#233f32] text-white text-xs font-bold cursor-pointer transition-all shadow-sm hover:shadow"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>{isSaving ? 'Guardando...' : 'Guardar Configuración'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal para Crear / Editar un Catálogo */}
      {catalogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div 
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-4">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#2D4F3E]" />
                <span>{editingCatalog ? `Editar Catálogo: ${editingCatalog.name}` : 'Subir Nuevo Catálogo PDF'}</span>
              </h3>
              <button
                onClick={handleCancelModal}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer transition-colors"
                title="Cerrar ventana"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCatalogModal} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Título del Catálogo *
                </label>
                <input
                  type="text"
                  required
                  value={modalForm.name}
                  onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
                  placeholder="Ej. Catálogo Especial Bodas & Eventos 2026"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2D4F3E]/20 focus:border-[#2D4F3E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Temporada / Colección:
                  </label>
                  <input
                    type="text"
                    value={modalForm.season}
                    onChange={(e) => setModalForm({ ...modalForm, season: e.target.value })}
                    placeholder="Ej. Invierno / Navidad, Primavera"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2D4F3E]/20 focus:border-[#2D4F3E]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Distintivo / Badge:
                  </label>
                  <input
                    type="text"
                    value={modalForm.badge}
                    onChange={(e) => setModalForm({ ...modalForm, badge: e.target.value })}
                    placeholder="Ej. Bodas, Navidad, Mayoreo"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2D4F3E]/20 focus:border-[#2D4F3E]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Descripción corta para el cliente:
                </label>
                <textarea
                  rows={2}
                  value={modalForm.description}
                  onChange={(e) => setModalForm({ ...modalForm, description: e.target.value })}
                  placeholder="Breve explicación de las piezas incluidas en este catálogo..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2D4F3E]/20 focus:border-[#2D4F3E]"
                />
              </div>

              {/* Selector de Archivo o Enlace Directo */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1.5">
                    {editingCatalog ? 'Archivo PDF / Folleto:' : 'Opción A: Subir Archivo PDF / Folleto:'}
                  </label>

                  {editingCatalog && !modalIsReplacingFile && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-stone-200 mb-2">
                      <span className="truncate font-semibold text-gray-700" title={editingCatalog.fileName}>
                        {editingCatalog.fileName}
                      </span>
                      <button
                        type="button"
                        onClick={() => setModalIsReplacingFile(true)}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] cursor-pointer"
                      >
                        Reemplazar archivo
                      </button>
                    </div>
                  )}

                  {(!editingCatalog || modalIsReplacingFile) && (
                    <div>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                        onChange={(e) => setModalFile(e.target.files?.[0] || null)}
                        className="w-full text-xs text-stone-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#2D4F3E] file:text-white hover:file:bg-[#233f32] cursor-pointer"
                      />
                      <span className="text-[10px] text-stone-400 mt-1 block">
                        Acepta PDF, JPG, PNG o documentos (hasta 50 MB).
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2.5 border-t border-stone-200">
                  <label className="block font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Opción B: O Enlace / URL Web Directo (Google Drive, Canva, Nube):</span>
                  </label>
                  <input
                    type="url"
                    value={modalForm.fileUrl || ''}
                    onChange={(e) => setModalForm({ ...modalForm, fileUrl: e.target.value })}
                    placeholder="https://... (enlace web a tu catálogo o PDF en la nube)"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#2D4F3E]/20 focus:border-[#2D4F3E]"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">
                    Si tu catálogo ya está alojado en Google Drive, Canva o tu web, puedes pegar su enlace directamente.
                  </span>
                </div>
              </div>

              {/* Opciones booleanas */}
              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modalForm.enabled}
                    onChange={(e) => setModalForm({ ...modalForm, enabled: e.target.checked })}
                    className="rounded text-[#2D4F3E] focus:ring-[#2D4F3E]"
                  />
                  <span className="font-semibold text-gray-700">Activo y disponible para descarga</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modalForm.isPrimary}
                    onChange={(e) => setModalForm({ ...modalForm, isPrimary: e.target.checked })}
                    className="rounded text-[#2D4F3E] focus:ring-[#2D4F3E]"
                  />
                  <span className="font-semibold text-gray-700">Marcar como Catálogo Principal</span>
                </label>
              </div>

              {/* Barra de progreso visual activa */}
              {isUploading && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-2 animate-in fade-in">
                  <div className="flex justify-between items-center text-[#2D4F3E] font-bold">
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      {uploadProgress < 100
                        ? `Subiendo archivo PDF (${uploadProgress}%)...`
                        : 'Guardando y registrando en el catálogo...'}
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-emerald-200/60 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-[#2D4F3E] h-2 rounded-full transition-all duration-150" 
                      style={{ width: `${Math.max(uploadProgress, 4)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-500">
                    No cierres esta ventana mientras se completa la transferencia.
                  </p>
                </div>
              )}

              {/* Botones de acción del Modal */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCancelModal}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#2D4F3E] hover:bg-[#233f32] text-white font-bold cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>
                    {isUploading 
                      ? (uploadProgress < 100 ? `Subiendo ${uploadProgress}%...` : 'Guardando...') 
                      : editingCatalog ? 'Guardar Cambios' : 'Subir Catálogo'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar catálogo */}
      {deleteConfirmCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-gray-900 mb-1">¿Eliminar este catálogo?</h3>
            <p className="text-xs text-gray-500 mb-5">
              Se eliminará «<strong className="text-gray-800">{deleteConfirmCat.name}</strong>» de la lista y no estará disponible para los clientes.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmCat(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = deleteConfirmCat;
                  setDeleteConfirmCat(null);
                  handleDeleteCatalog(target.id, target.name);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-sm"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para restaurar predeterminados */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-gray-900 mb-1">¿Restaurar catálogo inicial?</h3>
            <p className="text-xs text-gray-500 mb-5">
              Se restablecerá la configuración del Catálogo Móvil Oficial de Artesano Digital 2026.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setResetConfirmOpen(false);
                  executeResetToDefault();
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer shadow-sm"
              >
                Sí, Restaurar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
