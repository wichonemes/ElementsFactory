import React, { useEffect, useMemo, useState } from 'react';
import {
  ShoppingCart, Plus, Search, Edit, CheckCircle2, Clock, Truck, X, Save,
  AlertCircle, TrendingUp, DollarSign, Package, List, LayoutGrid,
  Calendar, Wallet, RefreshCw, CreditCard, Hammer, FileText, ArrowRight,
  CircleDollarSign, Eye
} from 'lucide-react';

const STATUS_META = {
  consulta: { label: 'Consulta', tone: 'bg-sky-50 text-sky-800 border-sky-200', dot: 'bg-sky-500' },
  cotizado: { label: 'Cotizado', tone: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
  confirmado: { label: 'Confirmado · En producción', tone: 'bg-purple-50 text-purple-800 border-purple-200', dot: 'bg-purple-500' },
  fabricando: { label: 'Fabricando', tone: 'bg-indigo-50 text-indigo-800 border-indigo-200', dot: 'bg-indigo-500' },
  en_produccion: { label: 'En producción', tone: 'bg-indigo-50 text-indigo-800 border-indigo-200', dot: 'bg-indigo-500' },
  pagado: { label: 'Pagado', tone: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' },
  cancelado: { label: 'Cancelado', tone: 'bg-rose-50 text-rose-800 border-rose-200', dot: 'bg-rose-500' }
};

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function money(value) {
  return `$${(Number(value) || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function dateKey(value) {
  const text = String(value || '').slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : new Date().toISOString().slice(0, 10);
}

function monthKey(value) {
  return dateKey(value).slice(0, 7);
}

function monthLabel(key) {
  const [year, month] = String(key || '').split('-');
  return `${MONTH_NAMES[Number(month) - 1] || 'Mes'} ${year || ''}`.trim();
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function addDays(value, days) {
  const date = new Date(`${dateKey(value)}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function orderDeliveryDate(order) {
  return order.deliveryDate || addDays(order.date || order.createdAt, 5);
}

function statusMeta(status) {
  return STATUS_META[status] || { label: status || 'Sin estado', tone: 'bg-stone-50 text-stone-700 border-stone-200', dot: 'bg-stone-400' };
}

function orderProfit(order) {
  if (order.totalCost === null || order.totalCost === undefined) return null;
  return Math.round(((Number(order.amount) || 0) - (Number(order.totalCost) || 0)) * 100) / 100;
}

function orderMargin(order) {
  const profit = orderProfit(order);
  if (profit === null || !Number(order.amount)) return null;
  return Math.round((profit / Number(order.amount)) * 1000) / 10;
}

export default function OrdersWorkSection({ token, products = [] }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pedidos');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState(() => currentMonth());
  const [viewMode, setViewMode] = useState('cards');
  const [message, setMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [form, setForm] = useState(() => ({
    orderNumber: '',
    date: new Date().toISOString().slice(0, 10),
    productId: '',
    productName: '',
    quantity: 1,
    amount: 0,
    status: 'consulta',
    customerCode: '',
    deliveryDate: addDays(new Date(), 5),
    notes: '',
    costBreakdown: { materialsCost: 0, laborCost: 0, equipmentCost: 0, packagingCost: 0, commissionsCost: 0, absorbedShippingCost: 0, costStatus: 'estimado' }
  }));

  const headers = useMemo(() => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  }), [token]);

  const notify = (text, type = 'success') => {
    setMessage({ text, type });
    window.setTimeout(() => setMessage(null), 4200);
  };

  const loadOrders = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch('/api/admin/orders', { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading orders', error);
      notify('No se pudo cargar el libro de pedidos.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [token]);

  const productForOrder = (order) => products.find(product => product.id === order.productId || product.code === order.productId) || null;

  const makeFormForProduct = (product, quantity = 1) => {
    const qty = Math.max(1, Number(quantity) || 1);
    const unitPrice = product && product.priceType !== 'quote' ? Number(product.price) || 0 : 0;
    const unitCost = Number(product?.costPrice) || 0;
    return {
      productId: product?.id || '',
      productName: product?.name || '',
      quantity: qty,
      amount: Math.round(unitPrice * qty * 100) / 100,
      deliveryDate: addDays(new Date(), 5),
      costBreakdown: {
        materialsCost: Math.round(unitCost * qty * 100) / 100,
        laborCost: 0,
        equipmentCost: 0,
        packagingCost: 0,
        commissionsCost: 0,
        absorbedShippingCost: 0,
        costStatus: 'estimado'
      }
    };
  };

  const openNewOrder = () => {
    const product = products.find(item => item.status === 'published') || products[0] || null;
    setEditingOrder(null);
    setForm(prev => ({
      ...prev,
      ...makeFormForProduct(product, 1),
      orderNumber: `PED-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().slice(0, 10),
      status: 'consulta',
      customerCode: '',
      notes: ''
    }));
    setIsModalOpen(true);
  };

  const openEditOrder = (order) => {
    setEditingOrder(order);
    const cost = order.costBreakdown || {};
    setForm({
      orderNumber: order.orderNumber || '',
      date: order.date || dateKey(order.createdAt),
      productId: order.productId || '',
      productName: order.productName || '',
      quantity: Number(order.quantity) || 1,
      amount: Number(order.amount) || 0,
      status: order.status || 'consulta',
      customerCode: order.customerCode || '',
      deliveryDate: order.deliveryDate || addDays(order.date || order.createdAt, 5),
      notes: order.notes || '',
      costBreakdown: {
        materialsCost: Number(cost.materialsCost) || 0,
        laborCost: Number(cost.laborCost) || 0,
        equipmentCost: Number(cost.equipmentCost) || 0,
        packagingCost: Number(cost.packagingCost) || 0,
        commissionsCost: Number(cost.commissionsCost) || 0,
        absorbedShippingCost: Number(cost.absorbedShippingCost) || 0,
        costStatus: cost.costStatus || 'estimado'
      }
    });
    setIsModalOpen(true);
  };

  const handleProductChange = (productId) => {
    const product = products.find(item => item.id === productId);
    setForm(prev => ({
      ...prev,
      productId,
      productName: product?.name || '',
      ...makeFormForProduct(product, prev.quantity),
      date: prev.date,
      status: prev.status,
      customerCode: prev.customerCode,
      notes: prev.notes,
      orderNumber: prev.orderNumber
    }));
  };

  const handleQuantityChange = (value) => {
    const quantity = Math.max(1, Number(value) || 1);
    const product = products.find(item => item.id === form.productId);
    const unitPrice = product && product.priceType !== 'quote' ? Number(product.price) || 0 : 0;
    const unitCost = Number(product?.costPrice) || 0;
    setForm(prev => ({
      ...prev,
      quantity,
      amount: unitPrice > 0 ? Math.round(unitPrice * quantity * 100) / 100 : prev.amount,
      costBreakdown: {
        ...prev.costBreakdown,
        materialsCost: unitCost > 0 ? Math.round(unitCost * quantity * 100) / 100 : prev.costBreakdown.materialsCost
      }
    }));
  };

  const handleSaveOrder = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      quantity: Math.max(1, Number(form.quantity) || 1),
      amount: Math.max(0, Number(form.amount) || 0),
      customerCode: String(form.customerCode || '').trim(),
      costBreakdown: {
        ...form.costBreakdown,
        materialsCost: Math.max(0, Number(form.costBreakdown.materialsCost) || 0),
        laborCost: Math.max(0, Number(form.costBreakdown.laborCost) || 0),
        equipmentCost: Math.max(0, Number(form.costBreakdown.equipmentCost) || 0),
        packagingCost: Math.max(0, Number(form.costBreakdown.packagingCost) || 0),
        commissionsCost: Math.max(0, Number(form.costBreakdown.commissionsCost) || 0),
        absorbedShippingCost: Math.max(0, Number(form.costBreakdown.absorbedShippingCost) || 0)
      },
      hasCosts: true
    };
    try {
      const response = await fetch(editingOrder ? `/api/admin/orders/${editingOrder.id}` : '/api/admin/orders', {
        method: editingOrder ? 'PUT' : 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        notify(data.error || 'No se pudo guardar el pedido.', 'error');
        return;
      }
      setIsModalOpen(false);
      await loadOrders();
      notify(editingOrder ? 'Pedido actualizado.' : 'Pedido registrado en el libro.');
    } catch (error) {
      console.error(error);
      notify('Error de conexión al guardar el pedido.', 'error');
    }
  };

  const updateOrder = async (order, patch, successText) => {
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(patch)
      });
      const data = await response.json();
      if (!response.ok) {
        notify(data.error || 'No se pudo actualizar el pedido.', 'error');
        return;
      }
      await loadOrders();
      notify(successText || 'Pedido actualizado.');
    } catch (error) {
      console.error(error);
      notify('Error de conexión al actualizar el pedido.', 'error');
    }
  };

  const confirmOrder = (order) => {
    if (!window.confirm(`¿Confirmar el pedido ${order.orderNumber}? Se enviará a producción y se descontarán los insumos de la receta.`)) return;
    updateOrder(order, { status: 'confirmado' }, 'Pedido confirmado. Revisa el descuento de insumos.');
  };

  const markPaid = (order) => {
    if (!window.confirm(`¿Marcar el pedido ${order.orderNumber} como pagado? Se moverá a Ventas del mes.`)) return;
    updateOrder(order, { status: 'pagado', paidAt: new Date().toISOString() }, 'Pedido pagado y enviado a Ventas del mes.');
  };

  const markDelivered = (order) => {
    updateOrder(order, { deliveryStatus: 'entregado', deliveredAt: new Date().toISOString() }, 'Pedido marcado como entregado.');
  };

  const cancelOrder = (order) => {
    if (!window.confirm(`¿Cancelar el pedido ${order.orderNumber}? Si ya se descontaron insumos, se devolverán al almacén.`)) return;
    updateOrder(order, { status: 'cancelado' }, 'Pedido cancelado.');
  };

  const deductStock = (order) => {
    if (!window.confirm(`¿Descontar ahora los insumos de la receta para ${order.orderNumber}?`)) return;
    updateOrder(order, { consumeStock: true }, 'Insumos descontados del almacén.');
  };

  const revertStock = (order) => {
    if (!window.confirm(`¿Devolver al almacén los insumos descontados de ${order.orderNumber}?`)) return;
    updateOrder(order, { revertStock: true }, 'Insumos devueltos al almacén.');
  };

  const activeOrders = useMemo(() => orders.filter(order => !['pagado', 'cancelado'].includes(order.status)), [orders]);
  const paidOrders = useMemo(() => orders.filter(order => order.status === 'pagado'), [orders]);
  const workingOrders = useMemo(() => orders.filter(order => {
    if (['confirmado', 'fabricando', 'en_produccion'].includes(order.status)) return order.deliveryStatus !== 'entregado';
    return order.status === 'pagado' && order.deliveryStatus !== 'entregado';
  }), [orders]);

  const statusCounts = useMemo(() => ({
    consulta: orders.filter(order => order.status === 'consulta').length,
    cotizado: orders.filter(order => order.status === 'cotizado').length,
    confirmado: orders.filter(order => ['confirmado', 'fabricando', 'en_produccion'].includes(order.status)).length,
    pagado: paidOrders.length
  }), [orders, paidOrders.length]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return activeOrders.filter(order => {
      const statusOk = statusFilter === 'all' || order.status === statusFilter;
      const queryOk = !query || `${order.orderNumber} ${order.productName} ${order.customerCode} ${order.notes}`.toLowerCase().includes(query);
      return statusOk && queryOk;
    });
  }, [activeOrders, statusFilter, search]);

  const monthOptions = useMemo(() => {
    const keys = new Set(paidOrders.map(order => monthKey(order.paidAt || order.date || order.createdAt)));
    keys.add(currentMonth());
    return [...keys].sort().reverse();
  }, [paidOrders]);

  const monthOrders = useMemo(() => paidOrders
    .filter(order => monthKey(order.paidAt || order.date || order.createdAt) === monthFilter)
    .sort((a, b) => new Date(b.paidAt || b.date) - new Date(a.paidAt || a.date)), [paidOrders, monthFilter]);

  const monthSummary = useMemo(() => {
    const revenue = monthOrders.reduce((sum, order) => sum + (Number(order.amount) || 0), 0);
    const cost = monthOrders.reduce((sum, order) => sum + (Number(order.totalCost) || 0), 0);
    const profit = revenue - cost;
    return {
      revenue,
      cost,
      profit,
      margin: revenue > 0 ? Math.round((profit / revenue) * 1000) / 10 : 0,
      count: monthOrders.length
    };
  }, [monthOrders]);

  const filteredWorking = useMemo(() => {
    const query = search.trim().toLowerCase();
    return workingOrders.filter(order => !query || `${order.orderNumber} ${order.productName} ${order.customerCode}`.toLowerCase().includes(query));
  }, [workingOrders, search]);

  const exportMonth = () => {
    const rows = [
      ['Pedido', 'Fecha pago', 'Cliente', 'Producto', 'Cantidad', 'Venta', 'Costo', 'Ganancia', 'Margen %', 'Entrega'],
      ...monthOrders.map(order => {
        const profit = orderProfit(order);
        return [
          order.orderNumber,
          dateKey(order.paidAt || order.date),
          order.customerCode || 'Anónimo',
          order.productName,
          order.quantity,
          order.amount,
          order.totalCost ?? '',
          profit ?? '',
          orderMargin(order) ?? '',
          order.deliveryStatus === 'entregado' ? 'Entregado' : orderDeliveryDate(order)
        ];
      })
    ];
    const csv = rows.map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ventas-${monthFilter}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const statusPill = (status) => {
    const meta = statusMeta(status);
    return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-black ${meta.tone}`}><span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />{meta.label}</span>;
  };

  const orderCard = (order, compact = false) => {
    const product = productForOrder(order);
    const profit = orderProfit(order);
    const margin = orderMargin(order);
    const isWorking = ['confirmado', 'fabricando', 'en_produccion'].includes(order.status) || (order.status === 'pagado' && order.deliveryStatus !== 'entregado');
    return (
      <div key={order.id} className={`rounded-2xl border bg-white shadow-xs overflow-hidden ${compact ? 'p-2.5' : 'p-3.5'}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-mono font-black text-[11px] text-[#2D4F3E]">{order.orderNumber}</span>
              {statusPill(order.status)}
              {order.materialsDeducted && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700">Insumos descontados</span>}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">{dateKey(order.date || order.createdAt)} · {order.customerCode || 'Anónimo'}</div>
          </div>
          <span className="text-[9px] text-gray-400 font-mono shrink-0">{order.deliveryStatus === 'entregado' ? 'Entregado' : `Entrega ${orderDeliveryDate(order)}`}</span>
        </div>

        <div className="mt-2 flex items-center gap-2">
          {product?.primaryImage ? (
            <img src={product.primaryImage} alt="" className="w-10 h-10 rounded-xl object-cover border border-stone-200 shrink-0" />
          ) : (
            <span className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0"><Package className="w-4 h-4 text-stone-500" /></span>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold text-gray-900 truncate" title={order.productName}>{order.productName || 'Pedido general'}</div>
            <div className="text-[9px] text-gray-500">Cant. {order.quantity} · {product?.sku || product?.code || order.productId || 'Sin SKU'}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5 mt-2">
          <div className="rounded-lg bg-[#FAF9F5] border border-[#E8E4DA] px-2 py-1">
            <span className="text-[7.5px] uppercase text-gray-400 font-bold block">Venta</span>
            <span className="text-[10.5px] font-black text-[#2D4F3E]">{money(order.amount)}</span>
          </div>
          <div className="rounded-lg bg-[#FAF9F5] border border-[#E8E4DA] px-2 py-1">
            <span className="text-[7.5px] uppercase text-gray-400 font-bold block">Costo</span>
            <span className="text-[10.5px] font-black text-gray-700">{order.totalCost !== null && order.totalCost !== undefined ? money(order.totalCost) : 'Pendiente'}</span>
          </div>
          <div className={`rounded-lg border px-2 py-1 ${margin !== null && margin >= 40 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
            <span className={`text-[7.5px] uppercase font-bold block ${margin !== null && margin >= 40 ? 'text-emerald-700' : 'text-amber-700'}`}>Margen</span>
            <span className={`text-[10.5px] font-black ${margin !== null && margin >= 40 ? 'text-emerald-800' : 'text-amber-800'}`}>{margin !== null ? `${margin}%` : '—'}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
          {['consulta', 'cotizado'].includes(order.status) && (
            <button type="button" onClick={() => confirmOrder(order)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#2D4F3E] text-white text-[9px] font-black hover:bg-[#20392C] cursor-pointer">
              <CheckCircle2 className="w-3 h-3" /> Confirmar pedido
            </button>
          )}
          {isWorking && order.status !== 'pagado' && (
            <button type="button" onClick={() => markPaid(order)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-600 text-white text-[9px] font-black hover:bg-emerald-700 cursor-pointer">
              <CreditCard className="w-3 h-3" /> Marcar pagado
            </button>
          )}
          {isWorking && order.deliveryStatus !== 'entregado' && (
            <button type="button" onClick={() => markDelivered(order)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 text-[9px] font-bold hover:bg-sky-100 cursor-pointer">
              <Truck className="w-3 h-3" /> Entregar
            </button>
          )}
          {!order.materialsDeducted && !['cancelado', 'pagado'].includes(order.status) && (
            <button type="button" onClick={() => deductStock(order)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-[9px] font-bold hover:bg-amber-100 cursor-pointer">
              <Hammer className="w-3 h-3" /> Descontar stock
            </button>
          )}
          {order.materialsDeducted && (
            <button type="button" onClick={() => revertStock(order)} className="text-[8.5px] text-gray-400 hover:text-rose-600 underline cursor-pointer">
              Revertir stock
            </button>
          )}
          <button type="button" onClick={() => openEditOrder(order)} className="ml-auto inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-stone-200 text-[9px] font-bold text-stone-600 hover:bg-stone-50 cursor-pointer">
            <Edit className="w-3 h-3" /> Editar
          </button>
          {!['cancelado', 'pagado'].includes(order.status) && (
            <button type="button" onClick={() => cancelOrder(order)} className="text-[8.5px] text-rose-500 hover:text-rose-700 underline cursor-pointer">
              Cancelar
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-fade-in text-[#1F2421]">
      <section className="rounded-3xl bg-gradient-to-br from-[#1F3A2C] via-[#2D4F3E] to-[#456B55] text-white p-4 sm:p-5 shadow-lg overflow-hidden relative">
        <div className="absolute -right-16 -top-20 w-56 h-56 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <span className="text-[9px] uppercase tracking-[0.2em] text-emerald-200 font-black">Área especial · Pedidos</span>
              <h2 className="text-xl sm:text-2xl font-black font-heading mt-1">Pedidos & Producción</h2>
              <p className="text-[11px] sm:text-xs text-white/70 mt-1 max-w-2xl">
                Del carrito a la entrega: confirma el pedido, descuenta insumos de la receta, controla la producción y separa las ventas por mes.
              </p>
            </div>
            <button type="button" onClick={openNewOrder} className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-[#20392C] hover:bg-amber-50 text-[11px] font-black shadow-sm shrink-0 cursor-pointer active:scale-95">
              <Plus className="w-3.5 h-3.5" /> Nuevo pedido
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-4">
            {[
              ['Por atender', statusCounts.consulta + statusCounts.cotizado, 'Consulta + cotizado'],
              ['En producción', statusCounts.confirmado, 'Confirmados'],
              ['Pagados', statusCounts.pagado, 'En ventas del mes'],
              ['Ventas del mes', money(monthSummary.revenue), monthLabel(monthFilter)]
            ].map(([label, value, sub]) => (
              <div key={label} className="rounded-xl bg-white/10 border border-white/15 px-3 py-2">
                <span className="text-[8px] uppercase tracking-wider text-white/60 font-bold">{label}</span>
                <div className="text-lg font-black font-mono leading-tight">{value}</div>
                <span className="text-[8.5px] text-white/55">{sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="bg-white border border-[#E8E4DA] rounded-2xl p-1.5 flex flex-wrap gap-1 shadow-xs">
        {[
          { id: 'pedidos', label: 'Pedidos', icon: ShoppingCart, count: activeOrders.length },
          { id: 'ventas', label: 'Ventas del mes', icon: Wallet, count: monthOrders.length },
          { id: 'trabajando', label: 'Productos trabajando', icon: Hammer, count: workingOrders.length }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10.5px] font-black transition-all cursor-pointer ${
                activeTab === tab.id ? 'bg-[#2D4F3E] text-white shadow-sm' : 'text-gray-600 hover:bg-stone-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {tab.label}
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${activeTab === tab.id ? 'bg-white/20' : 'bg-stone-100 border border-stone-200'}`}>{tab.count}</span>
            </button>
          );
        })}
        <button type="button" onClick={loadOrders} className="ml-auto inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-[10px] font-bold text-gray-500 hover:bg-stone-100 cursor-pointer">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Actualizar
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-xl border text-[11px] font-semibold flex items-start gap-2 ${
          message.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : message.type === 'info' ? 'bg-sky-50 border-sky-200 text-sky-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {message.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {activeTab === 'pedidos' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              ['consulta', 'Consulta', 'bg-sky-50 border-sky-200 text-sky-900', Clock],
              ['cotizado', 'Cotizado', 'bg-amber-50 border-amber-200 text-amber-900', FileText],
              ['confirmado', 'En producción', 'bg-purple-50 border-purple-200 text-purple-900', Hammer],
              ['pagado', 'Pagado', 'bg-emerald-50 border-emerald-200 text-emerald-900', Wallet]
            ].map(([id, label, tone, Icon]) => (
              <button key={id} type="button" onClick={() => { if (id === 'pagado') setActiveTab('ventas'); else setStatusFilter(statusFilter === id ? 'all' : id); }} className={`text-left rounded-xl border p-2.5 transition-all cursor-pointer ${tone} ${statusFilter === id ? 'ring-2 ring-[#2D4F3E]/30' : ''}`}>
                <Icon className="w-4 h-4 mb-1" />
                <div className="text-lg font-black font-mono">{statusCounts[id] || 0}</div>
                <div className="text-[9px] font-bold opacity-75">{label}</div>
              </button>
            ))}
          </div>

          <div className="bg-white border border-[#E8E4DA] rounded-2xl p-3 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar pedido, cliente o producto…" className="w-full pl-8 pr-2 py-2 rounded-xl border border-stone-300 bg-white text-[11px] focus:outline-none focus:ring-2 focus:ring-emerald-300" />
            </div>
            <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} className="px-2.5 py-2 rounded-xl border border-stone-300 bg-white text-[10.5px] font-bold">
              <option value="all">Todos los estados</option>
              <option value="consulta">Consulta</option>
              <option value="cotizado">Cotizado</option>
              <option value="confirmado">Confirmado / En producción</option>
            </select>
            <button type="button" onClick={loadOrders} className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl border border-stone-200 bg-stone-50 text-[10px] font-bold text-gray-600 hover:bg-stone-100 cursor-pointer"><RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Actualizar</button>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-[#D8D2C4] p-8 text-center">
              <ShoppingCart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-700">No hay pedidos en esta vista.</p>
              <p className="text-[11px] text-gray-500 mt-1">Registra un pedido o cambia el filtro. Los pedidos pagados se mueven a Ventas del mes.</p>
              <button type="button" onClick={openNewOrder} className="mt-3 inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#2D4F3E] text-white text-[10px] font-black cursor-pointer"><Plus className="w-3.5 h-3.5" /> Registrar pedido</button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-2.5">
              {filteredOrders.map(order => orderCard(order))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'ventas' && (
        <div className="space-y-3">
          <div className="bg-white border border-[#E8E4DA] rounded-2xl p-3 flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[9px] uppercase tracking-wider font-black text-gray-500 mr-1">Mes:</span>
              {monthOptions.map(key => (
                <button key={key} type="button" onClick={() => setMonthFilter(key)} className={`px-2 py-1 rounded-lg border text-[9.5px] font-bold cursor-pointer ${monthFilter === key ? 'bg-[#2D4F3E] border-[#2D4F3E] text-white' : 'bg-white border-stone-200 text-gray-600 hover:border-emerald-300'}`}>
                  {monthLabel(key)}
                </button>
              ))}
            </div>
            <button type="button" onClick={exportMonth} className="ml-auto inline-flex items-center gap-1 px-2.5 py-2 rounded-xl border border-stone-200 bg-stone-50 text-[10px] font-bold text-gray-600 hover:bg-stone-100 cursor-pointer"><FileText className="w-3.5 h-3.5" /> Exportar mes</button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {[
              ['Ventas', monthSummary.revenue, 'bg-emerald-50 border-emerald-200 text-emerald-900'],
              ['Costo', monthSummary.cost, 'bg-stone-50 border-stone-200 text-stone-800'],
              ['Ganancia', monthSummary.profit, 'bg-sky-50 border-sky-200 text-sky-900'],
              ['Margen', `${monthSummary.margin}%`, 'bg-amber-50 border-amber-200 text-amber-900']
            ].map(([label, value, tone]) => (
              <div key={label} className={`rounded-xl border p-3 ${tone}`}>
                <span className="text-[8px] uppercase tracking-wider font-bold opacity-70">{label}</span>
                <div className="text-lg font-black font-mono mt-0.5">{typeof value === 'number' ? money(value) : value}</div>
                <span className="text-[8.5px] opacity-60">{monthSummary.count} pedido(s)</span>
              </div>
            ))}
          </div>

          <div className="bg-white border border-[#E8E4DA] rounded-2xl overflow-hidden">
            <div className="px-3 py-2.5 bg-[#FAF9F5] border-b border-[#E8E4DA] flex items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-black text-gray-900">Ventas de {monthLabel(monthFilter)}</h3>
                <p className="text-[9px] text-gray-500">Los pedidos pagados quedan guardados por mes según su fecha de pago.</p>
              </div>
              <span className="text-[9px] font-bold px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">{monthOrders.length} pagado(s)</span>
            </div>
            {monthOrders.length === 0 ? (
              <div className="p-8 text-center">
                <Wallet className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-700">Aún no hay ventas pagadas en {monthLabel(monthFilter)}.</p>
                <p className="text-[11px] text-gray-500 mt-1">Marca un pedido como pagado en la pestaña Pedidos.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[10.5px]">
                  <thead className="bg-stone-50 text-gray-500 uppercase text-[8px] font-black">
                    <tr>
                      <th className="px-3 py-2">Pedido</th>
                      <th className="px-3 py-2">Fecha pago</th>
                      <th className="px-3 py-2">Cliente</th>
                      <th className="px-3 py-2">Producto</th>
                      <th className="px-3 py-2 text-right">Venta</th>
                      <th className="px-3 py-2 text-right">Costo</th>
                      <th className="px-3 py-2 text-right">Ganancia</th>
                      <th className="px-3 py-2 text-right">Margen</th>
                      <th className="px-3 py-2">Entrega</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {monthOrders.map(order => {
                      const profit = orderProfit(order);
                      const margin = orderMargin(order);
                      return (
                        <tr key={order.id} className="hover:bg-stone-50/60">
                          <td className="px-3 py-2 font-mono font-bold text-[#2D4F3E]">{order.orderNumber}</td>
                          <td className="px-3 py-2 text-gray-500">{dateKey(order.paidAt || order.date)}</td>
                          <td className="px-3 py-2 text-gray-700">{order.customerCode || 'Anónimo'}</td>
                          <td className="px-3 py-2 font-semibold text-gray-900 max-w-[220px] truncate" title={order.productName}>{order.productName}</td>
                          <td className="px-3 py-2 text-right font-black text-emerald-800">{money(order.amount)}</td>
                          <td className="px-3 py-2 text-right text-gray-600">{order.totalCost !== null && order.totalCost !== undefined ? money(order.totalCost) : 'Pendiente'}</td>
                          <td className={`px-3 py-2 text-right font-bold ${profit !== null && profit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{profit !== null ? money(profit) : '—'}</td>
                          <td className="px-3 py-2 text-right font-bold">{margin !== null ? `${margin}%` : '—'}</td>
                          <td className="px-3 py-2 text-gray-500">{order.deliveryStatus === 'entregado' ? 'Entregado' : orderDeliveryDate(order)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'trabajando' && (
        <div className="space-y-3">
          <div className="bg-white border border-[#E8E4DA] rounded-2xl p-3 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar producto, pedido o cliente…" className="w-full pl-8 pr-2 py-2 rounded-xl border border-stone-300 bg-white text-[11px] focus:outline-none focus:ring-2 focus:ring-emerald-300" />
            </div>
            <div className="inline-flex rounded-xl border border-stone-200 p-0.5 bg-stone-50">
              <button type="button" onClick={() => setViewMode('cards')} className={`px-2.5 py-1.5 rounded-lg text-[9.5px] font-bold inline-flex items-center gap-1 cursor-pointer ${viewMode === 'cards' ? 'bg-white text-[#2D4F3E] shadow-xs' : 'text-gray-500'}`}><LayoutGrid className="w-3.5 h-3.5" /> Fichas</button>
              <button type="button" onClick={() => setViewMode('list')} className={`px-2.5 py-1.5 rounded-lg text-[9.5px] font-bold inline-flex items-center gap-1 cursor-pointer ${viewMode === 'list' ? 'bg-white text-[#2D4F3E] shadow-xs' : 'text-gray-500'}`}><List className="w-3.5 h-3.5" /> Lista</button>
            </div>
            <span className="text-[9px] text-gray-500 font-bold">{filteredWorking.length} en trabajo</span>
          </div>

          {filteredWorking.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-[#D8D2C4] p-8 text-center">
              <Hammer className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-700">No hay productos trabajando.</p>
              <p className="text-[11px] text-gray-500 mt-1">Confirma un pedido para enviarlo a producción y verlo aquí.</p>
            </div>
          ) : viewMode === 'cards' ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-2.5">
              {filteredWorking.map(order => orderCard(order, true))}
            </div>
          ) : (
            <div className="bg-white border border-[#E8E4DA] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[10.5px]">
                  <thead className="bg-stone-50 text-gray-500 uppercase text-[8px] font-black">
                    <tr>
                      <th className="px-3 py-2">Pedido</th>
                      <th className="px-3 py-2">Producto</th>
                      <th className="px-3 py-2">Cliente</th>
                      <th className="px-3 py-2">Estado</th>
                      <th className="px-3 py-2">Entrega</th>
                      <th className="px-3 py-2 text-right">Venta</th>
                      <th className="px-3 py-2 text-right">Costo</th>
                      <th className="px-3 py-2 text-right">Margen</th>
                      <th className="px-3 py-2">Stock</th>
                      <th className="px-3 py-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredWorking.map(order => {
                      const margin = orderMargin(order);
                      return (
                        <tr key={order.id} className="hover:bg-stone-50/60">
                          <td className="px-3 py-2 font-mono font-bold text-[#2D4F3E]">{order.orderNumber}</td>
                          <td className="px-3 py-2 font-semibold text-gray-900 max-w-[220px] truncate" title={order.productName}>{order.productName}</td>
                          <td className="px-3 py-2 text-gray-600">{order.customerCode || 'Anónimo'}</td>
                          <td className="px-3 py-2">{statusPill(order.status)}</td>
                          <td className="px-3 py-2 text-gray-500">{order.deliveryStatus === 'entregado' ? 'Entregado' : orderDeliveryDate(order)}</td>
                          <td className="px-3 py-2 text-right font-black text-emerald-800">{money(order.amount)}</td>
                          <td className="px-3 py-2 text-right text-gray-600">{order.totalCost !== null && order.totalCost !== undefined ? money(order.totalCost) : 'Pendiente'}</td>
                          <td className="px-3 py-2 text-right font-bold">{margin !== null ? `${margin}%` : '—'}</td>
                          <td className="px-3 py-2">{order.materialsDeducted ? <span className="text-[8.5px] font-bold text-emerald-700">Descontado</span> : <span className="text-[8.5px] font-bold text-amber-700">Pendiente</span>}</td>
                          <td className="px-3 py-2">
                            <div className="flex flex-wrap gap-1">
                              {order.deliveryStatus !== 'entregado' && <button type="button" onClick={() => markDelivered(order)} className="px-1.5 py-0.5 rounded border border-sky-200 bg-sky-50 text-sky-800 text-[8.5px] font-bold cursor-pointer">Entregar</button>}
                              <button type="button" onClick={() => openEditOrder(order)} className="px-1.5 py-0.5 rounded border border-stone-200 bg-white text-stone-600 text-[8.5px] font-bold cursor-pointer">Editar</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[92vh] bg-[#FBF9F5] rounded-3xl shadow-2xl border border-[#E8E4DA] flex flex-col overflow-hidden" onClick={event => event.stopPropagation()}>
            <div className="px-4 sm:px-5 py-3 bg-[#1F2421] text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm font-black font-heading">{editingOrder ? 'Editar pedido' : 'Registrar nuevo pedido'}</h3>
                <p className="text-[10px] text-gray-400">El estado inicial puede ser consulta o cotizado; después se confirma en el libro.</p>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSaveOrder} className="p-4 sm:p-5 overflow-y-auto space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-gray-500 uppercase block mb-0.5">Pedido</label>
                  <input value={form.orderNumber} onChange={event => setForm({ ...form, orderNumber: event.target.value })} className="w-full px-2.5 py-2 rounded-xl border border-stone-300 bg-white font-mono font-bold" />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-gray-500 uppercase block mb-0.5">Fecha</label>
                  <input type="date" value={form.date} onChange={event => setForm({ ...form, date: event.target.value })} className="w-full px-2.5 py-2 rounded-xl border border-stone-300 bg-white font-bold" />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-bold text-gray-500 uppercase block mb-0.5">Producto del catálogo</label>
                <select value={form.productId} onChange={event => handleProductChange(event.target.value)} className="w-full px-2.5 py-2 rounded-xl border border-stone-300 bg-white font-semibold">
                  <option value="">Pedido general / producto manual</option>
                  {products.map(product => <option key={product.id} value={product.id}>{product.code ? `[${product.code}] ` : ''}{product.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-bold text-gray-500 uppercase block mb-0.5">Nombre del producto o servicio</label>
                <input value={form.productName} onChange={event => setForm({ ...form, productName: event.target.value })} className="w-full px-2.5 py-2 rounded-xl border border-stone-300 bg-white font-semibold" placeholder="Ej: Taza personalizada" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-gray-500 uppercase block mb-0.5">Cantidad</label>
                  <input type="number" min="1" value={form.quantity} onChange={event => handleQuantityChange(event.target.value)} className="w-full px-2.5 py-2 rounded-xl border border-stone-300 bg-white font-bold" />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-gray-500 uppercase block mb-0.5">Venta MXN</label>
                  <input type="number" min="0" step="0.01" value={form.amount} onChange={event => setForm({ ...form, amount: event.target.value })} className="w-full px-2.5 py-2 rounded-xl border border-stone-300 bg-white font-bold" />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-gray-500 uppercase block mb-0.5">Costo taller</label>
                  <input type="number" min="0" step="0.01" value={form.costBreakdown.materialsCost} onChange={event => setForm({ ...form, costBreakdown: { ...form.costBreakdown, materialsCost: event.target.value } })} className="w-full px-2.5 py-2 rounded-xl border border-stone-300 bg-white font-bold" />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-gray-500 uppercase block mb-0.5">Estado</label>
                  <select value={form.status} onChange={event => setForm({ ...form, status: event.target.value })} className="w-full px-2.5 py-2 rounded-xl border border-stone-300 bg-white font-semibold">
                    <option value="consulta">Consulta</option>
                    <option value="cotizado">Cotizado</option>
                    {editingOrder && <option value="confirmado">Confirmado</option>}
                    {editingOrder && <option value="pagado">Pagado</option>}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-gray-500 uppercase block mb-0.5">Cliente / código</label>
                  <input value={form.customerCode} onChange={event => setForm({ ...form, customerCode: event.target.value })} className="w-full px-2.5 py-2 rounded-xl border border-stone-300 bg-white" placeholder="Nombre, teléfono o CLI-XXXX" />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-gray-500 uppercase block mb-0.5">Entrega estimada</label>
                  <input type="date" value={form.deliveryDate} onChange={event => setForm({ ...form, deliveryDate: event.target.value })} className="w-full px-2.5 py-2 rounded-xl border border-stone-300 bg-white font-bold" />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-bold text-gray-500 uppercase block mb-0.5">Notas del pedido</label>
                <textarea rows="3" value={form.notes} onChange={event => setForm({ ...form, notes: event.target.value })} className="w-full px-2.5 py-2 rounded-xl border border-stone-300 bg-white" placeholder="Personalización, medidas, referencia o condiciones especiales…" />
              </div>
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-[10px] text-emerald-900">
                <strong>Margen estimado:</strong> {form.amount > 0 ? `${Math.round(((Number(form.amount) - Number(form.costBreakdown.materialsCost)) / Number(form.amount)) * 1000) / 10}%` : '—'} · Venta {money(form.amount)} · Costo {money(form.costBreakdown.materialsCost)}
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-stone-700 text-[10.5px] font-bold cursor-pointer">Cancelar</button>
                <button type="submit" className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-[#2D4F3E] text-white text-[10.5px] font-black hover:bg-[#20392C] cursor-pointer"><Save className="w-3.5 h-3.5" /> Guardar pedido</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
