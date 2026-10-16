import React from 'react';
import { AlertCircle, Check, X, ShieldAlert, Sparkles, Layers, ArrowRight } from 'lucide-react';

/**
 * Modal de Confirmación con Desglose de Cambios para el Panel Administrador
 * Muestra detalladamente los campos modificados antes de aplicar cambios en la tienda.
 */
export default function AdminConfirmSaveModal({
  isOpen,
  title = 'Confirmar y Guardar Cambios',
  subtitle = 'Revisa el desglose detallado de modificaciones antes de aplicarlas en la tienda.',
  changes = [],
  onConfirm,
  onCancel,
  confirmText = 'Confirmar y Guardar',
  confirmIcon = null,
  cancelText = 'Cancelar / Seguir Editando',
  isSaving = false,
  badge = 'Confirmación Requerida'
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in text-xs">
      <div
        className="bg-white rounded-3xl border border-[#E8E4DA] shadow-2xl max-w-lg w-full overflow-hidden animate-scale-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Encabezado */}
        <div className="p-5 sm:p-6 bg-[#FAF9F5] border-b border-[#E8E4DA] flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 flex items-center justify-center font-bold text-lg border border-amber-500/30">
              📋
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-sm text-[#1F2421]">
                  {title}
                </h3>
                {badge && (
                  <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300">
                    {badge}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                {subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cuerpo: Desglose de Cambios */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span>Desglose de Modificaciones ({changes.length}):</span>
          </div>

          {changes.length === 0 ? (
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-center text-gray-500 text-xs">
              No se detectaron cambios específicos pendientes.
            </div>
          ) : (
            <div className="space-y-2">
              {changes.map((item, index) => (
                <div
                  key={index}
                  className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#E8E4DA] flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="font-bold text-gray-800 flex items-center gap-1.5">
                      {item.icon && <span>{item.icon}</span>}
                      <span>{item.label}</span>
                    </div>
                    {item.detail && (
                      <p className="text-[11px] text-gray-500 leading-snug">
                        {item.detail}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    {item.badge ? (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.badgeClass || 'bg-emerald-100 text-emerald-800 border border-emerald-300'}`}>
                        {item.badge}
                      </span>
                    ) : (
                      <span className="font-mono font-bold text-[#2D4F3E] text-xs">
                        {item.value}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Advertencia / Pregunta final */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-300/80 text-amber-950 flex items-start gap-2.5 shadow-2xs">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-xs text-amber-900 block">
                ¿Deseas guardar y aplicar estos cambios ahora?
              </span>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Al confirmar, las configuraciones se sincronizarán inmediatamente con la tienda y quedarán visibles para todos los visitantes.
              </p>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-200 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 font-bold text-gray-700 transition-colors cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isSaving}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#2D4F3E] hover:bg-[#1E362A] text-white font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                {confirmIcon || <Check className="w-4 h-4" />}
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
