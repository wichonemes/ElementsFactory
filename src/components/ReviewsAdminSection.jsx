import React, { useState, useEffect, useMemo } from 'react';
import {
  Star, Plus, Edit, Trash2, Check, RefreshCw, Filter, Search,
  AlertCircle, CheckCircle2, MessageCircle, ExternalLink, ThumbsUp,
  ShieldCheck, Share2, Eye, EyeOff, Sparkles, User
} from 'lucide-react';

export default function ReviewsAdminSection({ token, products = [] }) {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ average: 4.9, total: 0, recommendPercent: 98 });
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });

  // Filtros
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'approved' | 'hidden'
  const [searchQuery, setSearchQuery] = useState('');

  // Modal de Crear Reseña Manual
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    author: '',
    city: 'San Luis Potosí',
    productId: 'general',
    productName: 'Taller General y Atención',
    rating: 5,
    comment: '',
    approved: true
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Auto-limpieza de mensajes
  useEffect(() => {
    if (actionMessage.text) {
      const timer = setTimeout(() => setActionMessage({ text: '', type: '' }), 4500);
      return () => clearTimeout(timer);
    }
  }, [actionMessage]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reviews?status=all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Error al consultar las opiniones');
      const data = await res.json();
      setReviews(Array.isArray(data.reviews) ? data.reviews : []);
      if (data.summary) setSummary(data.summary);
    } catch (err) {
      setActionMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [token]);

  // Filtrado de opiniones
  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      // Estatus
      if (filterStatus === 'approved' && r.approved === false) return false;
      if (filterStatus === 'hidden' && r.approved !== false) return false;

      // Búsqueda
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesAuthor = (r.author || '').toLowerCase().includes(q);
        const matchesCity = (r.city || '').toLowerCase().includes(q);
        const matchesProduct = (r.productName || '').toLowerCase().includes(q);
        const matchesComment = (r.comment || '').toLowerCase().includes(q);
        if (!matchesAuthor && !matchesCity && !matchesProduct && !matchesComment) return false;
      }

      return true;
    });
  }, [reviews, filterStatus, searchQuery]);

  // Cambiar estatus de aprobación (toggle aprobado / oculto)
  const handleToggleApproval = async (review) => {
    const newStatus = review.approved === false;
    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ approved: newStatus })
      });
      if (!res.ok) throw new Error('No se pudo actualizar el estado');
      setReviews(prev => prev.map(r => r.id === review.id ? { ...r, approved: newStatus } : r));
      setActionMessage({
        text: newStatus ? '✓ Opinión aprobada y visible en tienda' : 'Opinión ocultada de la tienda',
        type: 'success'
      });
    } catch (err) {
      setActionMessage({ text: err.message, type: 'error' });
    }
  };

  // Eliminar opinión
  const handleDelete = async (id, author) => {
    if (!window.confirm(`¿Estás seguro de eliminar la opinión de "${author}"?`)) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('No se pudo eliminar la opinión');
      setReviews(prev => prev.filter(r => r.id !== id));
      setActionMessage({ text: 'Opinión eliminada permanentemente', type: 'success' });
    } catch (err) {
      setActionMessage({ text: err.message, type: 'error' });
    }
  };

  // Guardar nueva reseña manual
  const handleSaveForm = async (e) => {
    e.preventDefault();
    if (!form.comment.trim()) {
      setFormError('El comentario es obligatorio');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Error al registrar la opinión manual');
      const saved = await res.json();
      setReviews(prev => [saved, ...prev]);
      setIsModalOpen(false);
      setForm({
        author: '',
        city: 'San Luis Potosí',
        productId: 'general',
        productName: 'Taller General y Atención',
        rating: 5,
        comment: '',
        approved: true
      });
      setActionMessage({ text: '✓ Reseña manual registrada y visible en tienda', type: 'success' });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const approvedCount = reviews.filter(r => r.approved !== false).length;
  const hiddenCount = reviews.filter(r => r.approved === false).length;

  return (
    <div className="space-y-6">
      {/* Alerta de notificación flotante */}
      {actionMessage.text && (
        <div className={`p-4 rounded-2xl flex items-center gap-2.5 text-xs font-bold shadow-md transition-all ${
          actionMessage.type === 'error'
            ? 'bg-rose-50 text-rose-800 border border-rose-200'
            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
        }`}>
          {actionMessage.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Encabezado y Métricas */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8E4DA] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Star className="w-5 h-5 fill-amber-500 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#1F2421] font-heading">
                Opiniones &amp; Calificaciones de Clientes
              </h3>
              <p className="text-xs text-gray-500">
                Modera las reseñas que aparecen en tus productos y registra comentarios recibidos por WhatsApp.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadReviews}
              disabled={loading}
              className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-[#2D4F3E] transition-all cursor-pointer"
              title="Recargar opiniones"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#2D4F3E]' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#2D4F3E] text-white text-xs font-bold hover:bg-[#20392C] flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Agregar Reseña Manual</span>
            </button>
          </div>
        </div>

        {/* Tarjetas de Métricas Rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
              Promedio General
            </span>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              <span className="text-xl font-black text-stone-900 font-heading">
                {summary.average || '4.9'}
              </span>
              <span className="text-xs text-gray-400">/ 5.0</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
              Total de Opiniones
            </span>
            <span className="text-xl font-black text-stone-900 font-heading block mt-1">
              {reviews.length}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
              Aprobadas (Visibles)
            </span>
            <span className="text-xl font-black text-emerald-800 font-heading block mt-1">
              {approvedCount}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-100 border border-stone-200">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-600 block">
              Ocultadas / Pausadas
            </span>
            <span className="text-xl font-black text-stone-700 font-heading block mt-1">
              {hiddenCount}
            </span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-[#E8E4DA]">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'all'
                ? 'bg-[#2D4F3E] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Todas ({reviews.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('approved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'approved'
                ? 'bg-[#2D4F3E] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Aprobadas ({approvedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('hidden')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'hidden'
                ? 'bg-[#2D4F3E] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Ocultas ({hiddenCount})
          </button>
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, ciudad o texto..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-[#2D4F3E]"
          />
        </div>
      </div>

      {/* Lista de Reseñas */}
      <div className="space-y-3">
        {filteredReviews.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#E8E4DA] text-gray-500 text-xs">
            No se encontraron opiniones con los filtros seleccionados.
          </div>
        ) : (
          filteredReviews.map(review => (
            <div
              key={review.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                review.approved === false
                  ? 'bg-stone-50 border-stone-200 opacity-60'
                  : 'bg-white border-[#E8E4DA] hover:border-[#2D4F3E]/40 hover:shadow-xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs sm:text-sm text-stone-900">
                        {review.author}
                      </span>
                      {review.city && (
                        <span className="text-[10px] text-gray-400 font-medium">
                          · {review.city}
                        </span>
                      )}
                      {review.source === 'seed' && (
                        <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                          Inicial de Taller
                        </span>
                      )}
                      {review.source === 'admin_manual' && (
                        <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                          WhatsApp / Presencial
                        </span>
                      )}
                    </div>
                    <span className="text-[10.5px] font-semibold text-emerald-800 block">
                      Producto: {review.productName || review.productId || 'General de Taller'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="text-[10px] font-mono text-gray-400">
                    {review.date}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleApproval(review)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      review.approved !== false
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                    }`}
                    title={review.approved !== false ? 'Ocultar de la tienda' : 'Aprobar y mostrar'}
                  >
                    {review.approved !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{review.approved !== false ? 'Aprobada' : 'Oculta'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(review.id, review.author)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title="Eliminar opinión"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Estrellas */}
              <div className="flex items-center gap-1 mt-2.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < (review.rating || 5)
                        ? 'fill-amber-400 text-amber-500'
                        : 'text-gray-300 fill-gray-100'
                    }`}
                  />
                ))}
                <span className="text-xs font-bold text-stone-700 ml-1">
                  ({review.rating || 5}/5)
                </span>
              </div>

              {/* Comentario */}
              <p className="text-xs text-stone-700 mt-2 leading-relaxed bg-stone-50/60 p-3 rounded-xl border border-stone-200/60">
                "{review.comment}"
              </p>
            </div>
          ))
        )}
      </div>

      {/* Modal para Agregar Reseña Manual */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 border border-gray-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h4 className="text-sm font-bold text-[#1F2421] font-heading flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-700" />
                <span>Registrar Opinión de Cliente (WhatsApp / Taller)</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveForm} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Nombre del Cliente:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Roberto Garza o Barber 44"
                    value={form.author}
                    onChange={e => setForm({ ...form, author: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#2D4F3E]"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Ciudad / Origen:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. San Luis Potosí, Querétaro"
                    value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#2D4F3E]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Producto que compró:
                </label>
                <select
                  value={form.productId}
                  onChange={e => {
                    const selId = e.target.value;
                    const prod = products.find(p => p.id === selId || p.code === selId);
                    setForm({
                      ...form,
                      productId: selId,
                      productName: prod ? prod.name : 'Taller General y Atención'
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#2D4F3E]"
                >
                  <option value="general">Taller General (Atención / Pedido Personalizado)</option>
                  {products.map(p => (
                    <option key={p.id || p.code} value={p.id || p.code}>
                      [{p.code}] {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Calificación de Estrellas:
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm({ ...form, rating: star })}
                      className="p-1 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          form.rating >= star
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-gray-300 fill-gray-100'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="font-bold text-xs text-stone-700 ml-2">
                    {form.rating} de 5 estrellas
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Comentario del cliente:
                </label>
                <textarea
                  required
                  rows="3"
                  placeholder="Escribe o pega el mensaje que te mandó el cliente por WhatsApp..."
                  value={form.comment}
                  onChange={e => setForm({ ...form, comment: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#2D4F3E] text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#2D4F3E] text-white font-bold hover:bg-[#20392C] shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Guardando...' : 'Guardar y Publicar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
