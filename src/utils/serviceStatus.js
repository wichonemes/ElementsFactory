/**
 * Utilidades para el control de disponibilidad de servicio:
 * - Servicio Local (taller y entregas locales)
 * - Servicio Nacional (envíos foráneos a toda la República)
 * - Modo Pausa / Suspensión temporal de taller hasta una fecha específica
 */

export const DEFAULT_SERVICE_STATUS = {
  localService: true,
  localDetails: 'Entregas en taller y zona metropolitana de San Luis Potosí',
  nationalService: true,
  nationalDetails: 'Envíos a toda la República Mexicana por paquetería (DHL, FedEx, Estafeta)',
  isPaused: false,
  pausedUntilDate: '',
  pausedReason: 'Mantenimiento preventivo y surtido de taller',
  pausedCustomMessage: 'Taller en periodo de mantenimiento y descanso técnico. Reanudamos producción de pedidos el próximo día hábil. Las cotizaciones recibidas se responderán por orden de llegada.'
};

/**
 * Formatea una fecha YYYY-MM-DD en texto en español de México legible (ej. "25 de octubre de 2026")
 */
export function formatServiceDate(dateStr) {
  if (!dateStr) return '';
  const parts = String(dateStr).split('-');
  if (parts.length === 3) {
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const d = parseInt(parts[2], 10);
    const m = months[parseInt(parts[1], 10) - 1];
    const y = parts[0];
    if (m && !isNaN(d)) {
      return `${d} de ${m} de ${y}`;
    }
  }
  return dateStr;
}

/**
 * Calcula una fecha YYYY-MM-DD sumando N días desde hoy
 */
export function getDatePlusDays(days = 1) {
  const d = new Date();
  d.setDate(d.getDate() + Number(days));
  return d.toISOString().split('T')[0];
}

/**
 * Calcula la fecha del próximo lunes (YYYY-MM-DD)
 */
export function getNextMondayDate() {
  const d = new Date();
  const day = d.getDay();
  const diff = (day === 0 ? 1 : 8 - day);
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

/**
 * Calcula el primer día del próximo mes (YYYY-MM-DD)
 */
export function getNextMonthFirstDay() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1, 1);
  return d.toISOString().split('T')[0];
}

/**
 * Genera un resumen textual del estado de cobertura actual
 */
export function getServiceStatusSummary(status = DEFAULT_SERVICE_STATUS) {
  if (!status) status = DEFAULT_SERVICE_STATUS;

  if (status.isPaused) {
    const formattedDate = formatServiceDate(status.pausedUntilDate);
    return {
      type: 'paused',
      badge: '⏸️ Taller en Pausa',
      label: formattedDate ? `Sin servicio hasta el ${formattedDate}` : 'Sin servicio temporalmente',
      color: 'bg-amber-100 text-amber-800 border-amber-300'
    };
  }

  if (status.localService && status.nationalService) {
    return {
      type: 'all_active',
      badge: 'Servicio Completo',
      label: 'Local y Nacional activo',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-300'
    };
  }

  if (status.localService && !status.nationalService) {
    return {
      type: 'local_only',
      badge: 'Solo Local',
      label: 'Envíos nacionales pausados',
      color: 'bg-blue-100 text-blue-800 border-blue-300'
    };
  }

  if (!status.localService && status.nationalService) {
    return {
      type: 'national_only',
      badge: 'Solo Nacional',
      label: 'Entregas locales pausadas',
      color: 'bg-purple-100 text-purple-800 border-purple-300'
    };
  }

  return {
    type: 'closed',
    badge: 'En Pausa',
    label: 'Sin cobertura activa',
    color: 'bg-rose-100 text-rose-800 border-rose-300'
  };
}
