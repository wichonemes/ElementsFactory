import fs from 'fs';

const filePath = 'src/components/QuoteDrawer.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add Eye to lucide-react imports
const oldImports = `import {
  X, Trash2, MessageCircle, Copy, Check, ShoppingBag, ArrowRight,
  Info, Calendar, MapPin, User, Truck, AlertTriangle, Zap, Tag, Sparkles, RotateCcw,
  Paintbrush, FileText, Gift, Ticket, Coins, Download, Loader2, Mail, Phone
} from 'lucide-react';`;

const newImports = `import {
  X, Trash2, MessageCircle, Copy, Check, ShoppingBag, ArrowRight,
  Info, Calendar, MapPin, User, Truck, AlertTriangle, Zap, Tag, Sparkles, RotateCcw,
  Paintbrush, FileText, Gift, Ticket, Coins, Download, Loader2, Mail, Phone, Eye
} from 'lucide-react';`;

// 2. Add onSelectProduct to QuoteDrawer props
const oldProps = `export default function QuoteDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  settings,
  onTrackWhatsApp,
  onOpenArcade
}) {`;

const newProps = `export default function QuoteDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  settings,
  onTrackWhatsApp,
  onOpenArcade,
  onSelectProduct
}) {`;

// 3. Clickable item thumbnail and title
const oldItemRender = `                      {/* Miniatura Cuadrada */}
                      <img loading="lazy"
                        src={p.primaryImage}
                        alt={p.name}
                        className="w-16 h-16 rounded-xl object-cover bg-gray-50 border border-gray-100 shrink-0"
                      />

                      {/* Info del Producto */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-[11px] font-mono font-bold text-gray-500">
                            [{p.code}]
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              playMarioPowerDownSound();
                              onRemoveItem(idx);
                            }}
                            className="text-gray-300 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Eliminar del carrito"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <h5 className="text-xs font-bold text-[#1F2421] truncate">
                          {p.name}
                        </h5>`;

const newItemRender = `                      {/* Miniatura Cuadrada Clickeable */}
                      <button
                        type="button"
                        onClick={() => onSelectProduct && onSelectProduct(p)}
                        className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0 cursor-pointer hover:ring-2 hover:ring-[#2D4F3E] transition-all relative group/thumb"
                        title={\`Ver detalles de \${p.name}\`}
                      >
                        <img loading="lazy"
                          src={(p.primaryImage || '').replace(/^\\.\\//, '/')}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/brand/artesano_digital_icono.png';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                          <Eye className="w-4 h-4 text-white drop-shadow" />
                        </div>
                      </button>

                      {/* Info del Producto */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-[11px] font-mono font-bold text-gray-500">
                            [{p.code}]
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              playMarioPowerDownSound();
                              onRemoveItem(idx);
                            }}
                            className="text-gray-300 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Eliminar del carrito"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onSelectProduct && onSelectProduct(p)}
                          className="text-left block w-full group/title cursor-pointer"
                          title={\`Ver detalles de \${p.name}\`}
                        >
                          <h5 className="text-xs font-bold text-[#1F2421] group-hover/title:text-[#2D4F3E] transition-colors truncate">
                            {p.name}
                          </h5>
                          <span className="text-[10px] text-[#2D4F3E] hover:underline flex items-center gap-1 mt-0.5 font-medium">
                            <Eye className="w-3 h-3 inline shrink-0" />
                            <span>Ver detalles y medidas</span>
                          </span>
                        </button>`;

let norm = content.replace(/\r\n/g, '\n');

if (!norm.includes(oldImports.replace(/\r\n/g, '\n'))) {
  console.error('Failed to match oldImports');
  process.exit(1);
}
norm = norm.replace(oldImports.replace(/\r\n/g, '\n'), newImports.replace(/\r\n/g, '\n'));

if (!norm.includes(oldProps.replace(/\r\n/g, '\n'))) {
  console.error('Failed to match oldProps');
  process.exit(1);
}
norm = norm.replace(oldProps.replace(/\r\n/g, '\n'), newProps.replace(/\r\n/g, '\n'));

if (!norm.includes(oldItemRender.replace(/\r\n/g, '\n'))) {
  console.error('Failed to match oldItemRender');
  process.exit(1);
}
norm = norm.replace(oldItemRender.replace(/\r\n/g, '\n'), newItemRender.replace(/\r\n/g, '\n'));

if (content.includes('\r\n')) {
  norm = norm.replace(/\n/g, '\r\n');
}

fs.writeFileSync(filePath, norm, 'utf8');
console.log('Successfully patched QuoteDrawer.jsx');
