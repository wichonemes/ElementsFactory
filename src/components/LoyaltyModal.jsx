import React, { useState, useEffect } from 'react';
import { X, Sparkles, Gift, Check, Phone, Award, HelpCircle } from 'lucide-react';

export default function LoyaltyModal({ isOpen, onClose, customerPhone = '' }) {
  const [phone, setPhone] = useState(() => {
    return customerPhone || (typeof window !== 'undefined' ? localStorage.getItem('artesano_loyalty_phone') || '' : '');
  });
  const [stamps, setStamps] = useState(1); // 1 sello inicial de bienvenida de cortesía
  const [hasQueried, setHasQueried] = useState(false);

  useEffect(() => {
    if (customerPhone && !phone) {
      setPhone(customerPhone);
    }
  }, [customerPhone]);

  useEffect(() => {
    if (phone) {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const savedStamps = localStorage.getItem(`artesano_loyalty_stamps_${cleanPhone}`);
      if (savedStamps !== null) {
        setStamps(Number(savedStamps) || 1);
      } else {
        setStamps(1); // Cortesía por registro
      }
    }
  }, [phone]);

  if (!isOpen) return null;

  const handleSavePhone = (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    localStorage.setItem('artesano_loyalty_phone', cleanPhone);
    const existing = localStorage.getItem(`artesano_loyalty_stamps_${cleanPhone}`);
    if (existing === null) {
      localStorage.setItem(`artesano_loyalty_stamps_${cleanPhone}`, '1');
      setStamps(1);
    } else {
      setStamps(Number(existing) || 1);
    }
    setHasQueried(true);
  };

  const stampList = [
    { num: 1, label: 'Bienvenida', desc: '¡Tu 1er sello de regalo!' },
    { num: 2, label: 'Diseño', desc: 'Compra $350+' },
    { num: 3, label: 'Corte & 3D', desc: 'Compra $350+' },
    { num: 4, label: 'Taller', desc: 'Compra $350+' },
    { num: 5, label: 'Artesano', desc: 'Compra $350+' },
    { num: 6, label: '¡PREMIO!', desc: 'Pieza de regalo o $200 saldo', isReward: true }
  ];

  const isCompleted = stamps >= 6;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-white border border-stone-200 shadow-2xl overflow-hidden">
        {/* Cabecera artesanal */}
        <div className="bg-gradient-to-br from-[#1F2421] via-[#2D4F3E] to-[#1F2421] text-white p-5 sm:p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold tracking-wider uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Club Artesano · Lealtad</span>
          </div>

          <h3 className="font-heading font-black text-xl text-white">
            Tarjeta de Sellos del Taller
          </h3>
          <p className="text-xs text-gray-300 mt-1">
            Cada compra de $350+ o pedidos de mayoreo acumulan sellos. ¡Al 6to sello ganas tu recompensa!
          </p>
        </div>

        {/* Cuerpo */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Identificación de WhatsApp */}
          <form onSubmit={handleSavePhone} className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <label className="block text-[11px] font-bold text-gray-700">
              Registra tu WhatsApp para consultar o guardar tus sellos:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej. 55 1234 5678"
                  className="w-full pl-8 pr-2.5 py-1.5 rounded-xl border border-stone-300 bg-white text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-[#2D4F3E] hover:bg-[#20392C] text-white text-xs font-black transition-colors cursor-pointer"
              >
                Guardar
              </button>
            </div>
            {hasQueried && (
              <p className="text-[10px] text-emerald-700 font-semibold">
                ✓ Número vinculado. Tus sellos se actualizan con cada pedido confirmado.
              </p>
            )}
          </form>

          {/* Tarjeta Visual de Sellos */}
          <div className="rounded-2xl border-2 border-dashed border-amber-300/80 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-gray-700 border-b border-amber-200/60 pb-2">
              <span className="flex items-center gap-1.5 text-amber-900 font-heading">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Progreso: {Math.min(6, stamps)} de 6 sellos</span>
              </span>
              <span className="text-[10px] text-emerald-800 font-black px-2 py-0.5 rounded-full bg-emerald-100">
                {isCompleted ? '¡COMPLETO!' : `${6 - Math.min(6, stamps)} para tu premio`}
              </span>
            </div>

            {/* Rejilla de 6 casillas */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              {stampList.map((slot) => {
                const filled = stamps >= slot.num;
                return (
                  <div
                    key={slot.num}
                    className={`relative flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all ${
                      filled
                        ? slot.isReward
                          ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white border-amber-500 shadow-md ring-2 ring-amber-300'
                          : 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                        : slot.isReward
                          ? 'bg-amber-50/70 border-amber-300 text-amber-900 border-dashed'
                          : 'bg-white border-stone-200 text-stone-400'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs mb-1">
                      {filled ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : slot.isReward ? (
                        <Gift className="w-4 h-4 text-amber-700" />
                      ) : (
                        slot.num
                      )}
                    </div>
                    <span className="text-[10px] font-black leading-tight">
                      {slot.label}
                    </span>
                    <span className={`text-[8.5px] mt-0.5 leading-tight ${filled ? 'text-emerald-100' : 'text-gray-400'}`}>
                      {slot.desc}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Recompensa */}
            <div className="p-3 rounded-xl bg-amber-100/70 border border-amber-300/80 text-amber-950 text-xs space-y-1">
              <div className="font-black flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-amber-700" />
                <span>¿Cuál es tu recompensa al llenar la tarjeta?</span>
              </div>
              <p className="text-[11px] text-amber-900/90 leading-relaxed">
                Tú eliges: <strong>1 pieza artesanal personalizada de regalo</strong> (llavero grabado, portavasos o termo) o <strong>$200 MXN de saldo</strong> descontado en tu pedido.
              </p>
            </div>
          </div>

          {/* Cómo funciona */}
          <div className="space-y-2 text-[11px] text-gray-600 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
            <h4 className="font-bold text-gray-800 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
              <span>Reglas sencillas del Club Artesano:</span>
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-gray-600">
              <li>Cada compra individual de <strong>$350 MXN o más</strong> = 1 sello.</li>
              <li>Compras de mayoreo (<strong>12+ piezas</strong>) = <strong>2 sellos dobles</strong>.</li>
              <li>Al confirmar tu pedido por WhatsApp, el taller te valida tus sellos acumulados.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between gap-2">
          <span className="text-[10px] text-gray-500">
            Artesano Digital · Hecho en México
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#2D4F3E] hover:bg-[#20392C] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            ¡Entendido!
          </button>
        </div>
      </div>
    </div>
  );
}
