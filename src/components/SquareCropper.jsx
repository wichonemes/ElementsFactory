import React, { useEffect, useRef, useState } from 'react';
import { Check, X, ZoomIn, ZoomOut } from 'lucide-react';

const OUTPUT_SIZE = 1000;
const MIN_K = 0.6;
const MAX_K = 3;

export default function SquareCropper({ file, onCancel, onApply }) {
  const frameRef = useRef(null);
  const imgRef = useRef(null);
  const dragRef = useRef(null);
  const [src, setSrc] = useState('');
  const [natural, setNatural] = useState({ w: 1, h: 1 });
  const [frame, setFrame] = useState(360);
  const [k, setK] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const measure = () => {
      const width = frameRef.current?.clientWidth || 360;
      setFrame(width);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const fit = natural.w && natural.h ? Math.min(frame / natural.w, frame / natural.h) : 1;
  const scale = fit * k;
  const dw = natural.w * scale;
  const dh = natural.h * scale;

  const clampPos = (x, y, width, height) => ({
    x: width <= frame ? (frame - width) / 2 : Math.min(0, Math.max(frame - width, x)),
    y: height <= frame ? (frame - height) / 2 : Math.min(0, Math.max(frame - height, y))
  });

  // Al cambiar zoom se mantiene el centro de la foto
  const changeZoom = (nextK) => {
    const clamped = Math.min(MAX_K, Math.max(MIN_K, nextK));
    const nextScale = fit * clamped;
    const nw = natural.w * nextScale;
    const nh = natural.h * nextScale;
    const cx = frame / 2 - pos.x;
    const cy = frame / 2 - pos.y;
    const ratio = nextScale / scale;
    const x = frame / 2 - cx * ratio;
    const y = frame / 2 - cy * ratio;
    setK(clamped);
    setPos(clampPos(x, y, nw, nh));
  };

  useEffect(() => {
    if (!natural.w || !natural.h) return;
    setPos(clampPos((frame - dw) / 2, (frame - dh) / 2, dw, dh));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [natural, frame]);

  const onPointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY, start: { ...pos } };
  };
  const onPointerMove = (event) => {
    if (!dragRef.current) return;
    const nx = dragRef.current.start.x + (event.clientX - dragRef.current.x);
    const ny = dragRef.current.start.y + (event.clientY - dragRef.current.y);
    setPos(clampPos(nx, ny, dw, dh));
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  const apply = async () => {
    if (!imgRef.current) return;
    setBusy(true);
    try {
      const factor = OUTPUT_SIZE / frame;
      const canvas = document.createElement('canvas');
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(imgRef.current, pos.x * factor, pos.y * factor, dw * factor, dh * factor);
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(b => (b ? resolve(b) : reject(new Error('No se pudo recortar la imagen'))), 'image/jpeg', 0.92);
      });
      const baseName = String(file.name || 'producto').replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60) || 'producto';
      onApply(new File([blob], `${baseName}-cuadrado.jpg`, { type: 'image/jpeg' }));
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-[#1F2421]">Encuadrar foto cuadrada</h3>
            <p className="text-[11px] text-stone-500">Arrastra la foto. Con el zoom en 1× se ve completa con margen blanco.</p>
          </div>
          <button type="button" onClick={onCancel} className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div
            ref={frameRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className="relative w-full aspect-square bg-white border-2 border-dashed border-stone-300 overflow-hidden touch-none select-none cursor-move"
          >
            {src && (
              <img
                ref={imgRef}
                src={src}
                alt=""
                draggable={false}
                onLoad={(e) => setNatural({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
                style={{ position: 'absolute', left: pos.x, top: pos.y, width: dw, height: dh, maxWidth: 'none' }}
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => changeZoom(k - 0.1)} className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50 cursor-pointer">
              <ZoomOut className="w-4 h-4 text-stone-600" />
            </button>
            <input
              type="range"
              min={MIN_K}
              max={MAX_K}
              step="0.01"
              value={k}
              onChange={(e) => changeZoom(Number(e.target.value))}
              className="flex-1 accent-[#2D4F3E]"
              aria-label="Zoom"
            />
            <button type="button" onClick={() => changeZoom(k + 0.1)} className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50 cursor-pointer">
              <ZoomIn className="w-4 h-4 text-stone-600" />
            </button>
          </div>
          <div className="flex justify-between text-[10px] text-stone-500">
            <span>Alejar (margen)</span>
            <span>Acercar</span>
          </div>
        </div>

        <div className="px-4 py-3 border-t border-stone-200 flex items-center justify-end gap-2">
          <button type="button" onClick={onCancel} className="px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-stone-700 text-xs font-bold cursor-pointer">
            Cancelar
          </button>
          <button
            type="button"
            onClick={apply}
            disabled={busy || !natural.w}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D4F3E] text-white text-xs font-black cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4" /> Usar este encuadre
          </button>
        </div>
      </div>
    </div>
  );
}
