import React from 'react';
import { 
  X, 
  FileText, 
  Download, 
  ExternalLink, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  Smartphone,
  FolderOpen
} from 'lucide-react';

export default function CatalogSelectorModal({
  isOpen,
  onClose,
  settings
}) {
  if (!isOpen) return null;

  const catalogConfig = settings?.mobileCatalogConfig || {};
  const catalogs = (catalogConfig.catalogs || []).filter(c => c.enabled !== false);

  // Si no hay catálogos en la lista, usar el principal por defecto
  const displayCatalogs = catalogs.length > 0 ? catalogs : [
    {
      id: 'cat-default',
      name: catalogConfig.title || 'Catálogo Móvil Oficial (9:16)',
      season: 'Todo el año',
      badge: 'Colección General',
      description: catalogConfig.subtitle || 'Llaveros, macetas, letreros, tazas y piezas 3D con enlaces a MakerWorld.',
      fileName: catalogConfig.fileName || 'Catalogo_Movil_Artesano_Digital.pdf',
      fileUrl: catalogConfig.fileUrl || '/downloads/catalogo_movil_artesano_digital.pdf',
      fileSize: catalogConfig.fileSize || '1,312 KB',
      fileType: catalogConfig.fileType || 'application/pdf',
      isPrimary: true
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="p-6 pb-4 bg-gradient-to-r from-[#1F2421] via-[#2D4F3E] to-[#1F2421] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white">
                  {catalogConfig.title || 'Catálogos Oficiales de Temporada'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-400/20 text-amber-200 border border-amber-300/30">
                  {displayCatalogs.length} {displayCatalogs.length === 1 ? 'disponible' : 'disponibles'}
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                {catalogConfig.subtitle || 'Descarga o visualiza en tu celular nuestros catálogos en formato vertical 9:16 con enlaces directos.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de Catálogos */}
        <div className="p-6 overflow-y-auto space-y-4 divide-y divide-stone-100 flex-1">
          {displayCatalogs.map((cat, idx) => {
            const isPdf = cat.fileName?.toLowerCase().endsWith('.pdf') || cat.fileType === 'application/pdf';

            return (
              <div 
                key={cat.id || idx}
                className="pt-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAF9F5] border border-stone-200/80 hover:border-[#D4A359] transition-all hover:shadow-xs group"
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-amber-600 shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    <FileText className="w-6 h-6 text-[#2D4F3E]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="font-bold text-sm text-gray-900 group-hover:text-[#2D4F3E] transition-colors">
                        {cat.name}
                      </h4>
                      {cat.isPrimary && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          ★ Principal
                        </span>
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

                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-2">
                      {cat.description || 'Catálogo interactivo con especificaciones, variantes y fotografías de piezas de taller.'}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-gray-400">
                      <span>Formato: <strong className="text-gray-600">{isPdf ? 'PDF 9:16' : 'Documento'}</strong></span>
                      {cat.fileSize && <span>Tamaño: <strong className="text-gray-600">{cat.fileSize}</strong></span>}
                    </div>
                  </div>
                </div>

                {/* Acciones de descarga */}
                <div className="flex sm:flex-col gap-2 shrink-0">
                  <a
                    href={cat.fileUrl || '/downloads/catalogo_movil_artesano_digital.pdf'}
                    download={cat.fileName || `${cat.name}.pdf`}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D4F3E] hover:bg-[#233f32] text-white text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer text-center"
                    title={`Descargar ${cat.name}`}
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar PDF</span>
                  </a>

                  <a
                    href={cat.fileUrl || '/downloads/catalogo_movil_artesano_digital.pdf'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold border border-stone-300 transition-all cursor-pointer text-center"
                    title="Ver en pestaña nueva"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
                    <span>Ver en línea</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pie del modal */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Descarga en tu celular y compártelo por WhatsApp con tus clientes o familiares.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
