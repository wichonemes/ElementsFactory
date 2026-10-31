import React, { useEffect, useMemo, useState } from 'react';
import {
  ShoppingCart, Plus, Search, Edit, CheckCircle2, Clock, Truck, X, Save,
  AlertCircle, Package, List, LayoutGrid, Calendar, Wallet, RefreshCw,
  CreditCard, Hammer, FileText, ArrowRight, CircleDollarSign, Minus, Ban, TrendingUp, MessageCircle, MapPin
} from 'lucide-react';

const DAY = 86400000;
const TERMINAL_FEE_RATE = 0.04;

function terminalFee(cardAmount) {
  return round2((Number(cardAmount) || 0) * TERMINAL_FEE_RATE);
}

const STATUS_META = {
  consulta: { label: 'Consulta', tone: 'bg-sky-50 text-sky-800 border-sky-200', dot: 'bg-sky-500' },
  cotizado: { label: 'Cotizado', tone: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
  confirmado: { label: 'En producción', tone: 'bg-purple-50 text-purple-800 border-purple-200', dot: 'bg-purple-500' },
  fabricando: { label: 'Fabricando', tone: 'bg-indigo-50 text-indigo-800 border-indigo-200', dot: 'bg-indigo-500' },
  en_produccion: { label: 'En producción', tone: 'bg-indigo-50 text-indigo-800 border-indigo-200', dot: 'bg-indigo-500' },
  pagado: { label: 'Pagado', tone: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' },
  cancelado: { label: 'Cancelado', tone: 'bg-rose-50 text-rose-800 border-rose-200', dot: 'bg-rose-500' }
};

const SIGNALS = {
  vencido: { label: 'Vencido', tone: 'bg-rose-600 text-white border-rose-700', bar: 'bg-rose-600', text: 'text-rose-700', level: 4 },
  urgente: { label: 'Urgente', tone: 'bg-rose-50 text-rose-800 border-rose-300', bar: 'bg-rose-500', text: 'text-rose-700', level: 4 },
  naranja: { label: 'Con presión', tone: 'bg-orange-50 text-orange-800 border-orange-300', bar: 'bg-orange-500', text: 'text-orange-700', level: 3 },
  amarillo: { label: 'A tiempo justo', tone: 'bg-amber-50 text-amber-900 border-amber-300', bar: 'bg-amber-400', text: 'text-amber-700', level: 2 },
  verde: { label: 'A tiempo', tone: 'bg-emerald-50 text-emerald-800 border-emerald-300', bar: 'bg-emerald-500', text: 'text-emerald-700', level: 1 },
  entregado: { label: 'Entregado', tone: 'bg-stone-100 text-stone-600 border-stone-300', bar: 'bg-stone-300', text: 'text-stone-500', level: 0 },
  cancelado: { label: 'Cancelado', tone: 'bg-rose-50 text-rose-600 border-rose-200', bar: 'bg-rose-200', text: 'text-rose-500', level: 0 }
};

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function money(value) {
  return `$${(Number(value) || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function round2(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
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

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function orderDeliveryDate(order) {
  return order.deliveryDate || addDays(order.date || order.createdAt, 5);
}

function daysToDeliver(order) {
  const target = new Date(`${orderDeliveryDate(order)}T12:00:00`).getTime();
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  return Math.round((target - now.getTime()) / DAY);
}

function deliverySignal(order) {
  if (order.status === 'cancelado') return { key: 'cancelado', ...SIGNALS.cancelado, days: null };
  if (order.deliveryStatus === 'entregado') return { key: 'entregado', ...SIGNALS.entregado, days: null };
  const days = daysToDeliver(order);
  if (days < 0) return { key: 'vencido', ...SIGNALS.vencido, days };
  if (days <= 2) return { key: 'urgente', ...SIGNALS.urgente, days };
  if (days <= 5) return { key: 'naranja', ...SIGNALS.naranja, days };
  if (days <= 9) return { key: 'amarillo', ...SIGNALS.amarillo, days };
  return { key: 'verde', ...SIGNALS.verde, days };
}

function signalTimeText(signal) {
  if (signal.key === 'cancelado') return 'Sin entrega';
  if (signal.key === 'entregado') return 'Completado';
  const days = signal.days;
  if (days < 0) return `Vencido ${Math.abs(days)} d`;
  if (days === 0) return 'Entrega hoy';
  if (days === 1) return 'Entrega mañana';
  return `${days} días`;
}

function statusMeta(status) {
  return STATUS_META[status] || { label: status || 'Sin estado', tone: 'bg-stone-50 text-stone-700 border-stone-200', dot: 'bg-stone-400' };
}

function orderTotal(order) {
  return round2(order.amount);
}

function orderUnitPrice(order) {
  const stored = Number(order.unitPrice) || 0;
  if (stored > 0) return round2(stored);
  const quantity = Math.max(1, Number(order.quantity) || 1);
  return round2(orderTotal(order) / quantity);
}

function amountReceived(order) {
  const paid = Number(order.amountPaid);
  if (Number.isFinite(paid) && paid > 0) return round2(paid);
  return round2(order.advanceReceived);
}

function advanceExpected(order) {
  return round2(orderTotal(order) * 0.5);
}

function balanceDue(order) {
  return Math.max(0, round2(orderTotal(order) - amountReceived(order)));
}

function isDepositPaid(order) {
  return Boolean(order.advancePaid) || amountReceived(order) > 0;
}

function orderProfit(order) {
  if (order.totalCost === null || order.totalCost === undefined) return null;
  return round2(orderTotal(order) - (Number(order.totalCost) || 0));
}

function orderMargin(order) {
  const profit = orderProfit(order);
  if (profit === null || !orderTotal(order)) return null;
  return Math.round((profit / orderTotal(order)) * 1000) / 10;
}

function productCostTotal(order, products) {
  const product = products.find(item => item.id === order.productId || item.code === order.productId);
  const unitCost = Number(product?.costPrice) || 0;
  return round2(unitCost * (Number(order.quantity) || 1));
}

function SignalBadge({ signal }) {
  return (
    <div className={`rounded-xl border px-2 py-1 text-right shrink-0 ${signal.tone}`}>
      <div className="flex items-center justify-end gap-1.5">
        {[1, 2, 3, 4].map(step => (
          <span key={step} className={`h-1.5 w-2.5 rounded-full ${step <= signal.level ? signal.bar : 'bg-current/15'}`} />
        ))}
      </div>
      <div className="text-[9px] font-black leading-tight mt-0.5">{signal.label}</div>
      <div className="text-[8px] font-semibold opacity-80 leading-tight">{signalTimeText(signal)}</div>
    </div>
  );
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
  const [paymentModal, setPaymentModal] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ cash: 0, card: 0 });
  const [qtyModal, setQtyModal] = useState(null);
  const [qtyForm, setQtyForm] = useState({ quantity: 1, unitPrice: 0, adjustStock: true });
  const [cancelModal, setCancelModal] = useState(null);

  const [form, setForm] = useState(() => ({
    orderNumber: '',
    date: todayISO(),
    productId: '',
    productName: '',
    quantity: 1,
    unitPrice: 0,
    amount: 0,
    customerCode: '',
    deliveryDate: addDays(todayISO(), 5),
    notes: '',
    costBreakdown: { materialsCost: 0, laborCost: 0, equipmentCost: 0, packagingCost: 0, commissionsCost: 0, absorbedShippingCost: 0, costStatus: 'estimado' }
  }));

  const headers = useMemo(() => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  }), [token]);

  const notify = (text, type = 'success') => {
    setMessage({ text, type });
    window.setTimeout(() => setMessage(null), 4800);
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

  const patchOrder = async (order, patch) => {
    const response = await fetch(`/api/admin/orders/${order.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(patch)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'No se pudo actualizar el pedido.');
    return data;
  };

  const updateOrder = async (order, patch, successText) => {
    try {
      await patchOrder(order, patch);
      await loadOrders();
      notify(successText || 'Pedido actualizado.');
    } catch (error) {
      console.error(error);
      notify(error.message, 'error');
    }
  };

  // ---------------- Nuevo / editar pedido ----------------

  const fillFromProduct = (product, quantity = 1) => {
    const qty = Math.max(1, Number(quantity) || 1);
    const unitPrice = product && product.priceType !== 'quote' ? round2(product.price) : 0;
    const unitCost = Number(product?.costPrice) || 0;
    return {
      productId: product?.id || '',
      productName: product?.name || '',
      quantity: qty,
      unitPrice,
      amount: round2(unitPrice * qty),
      costBreakdown: {
        materialsCost: round2(unitCost * qty),
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
    const year = new Date().getFullYear();
    setEditingOrder(null);
    setForm(prev => ({
      ...prev,
      ...fillFromProduct(product, 1),
      orderNumber: `PED-${year}-${String(orders.length + 1).padStart(3, '0')}`,
      date: todayISO(),
      customerCode: '',
      deliveryDate: addDays(todayISO(), 5),
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
      unitPrice: orderUnitPrice(order),
      amount: orderTotal(order),
      customerCode: order.customerCode || '',
      deliveryDate: orderDeliveryDate(order),
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
      ...fillFromProduct(product, prev.quantity),
      date: prev.date,
      customerCode: prev.customerCode,
      notes: prev.notes,
      orderNumber: prev.orderNumber,
      deliveryDate: prev.deliveryDate
    }));
  };

  const setFormQuantity = (value) => {
    const quantity = Math.max(1, Math.round(Number(value) || 1));
    setForm(prev => ({ ...prev, quantity, amount: round2(prev.unitPrice * quantity) }));
  };

  const setFormUnitPrice = (value) => {
    const unitPrice = Math.max(0, Number(value) || 0);
    setForm(prev => ({ ...prev, unitPrice, amount: round2(unitPrice * prev.quantity) }));
  };

  const handleSaveOrder = async (event) => {
    event.preventDefault();
    if (!form.productName.trim()) {
      notify('Escribe el nombre del producto o servicio.', 'error');
      return;
    }
    const payload = {
      ...form,
      quantity: Math.max(1, Math.round(Number(form.quantity) || 1)),
      unitPrice: Math.max(0, Number(form.unitPrice) || 0),
      amount: round2(Math.max(0, Number(form.unitPrice) || 0) * Math.max(1, Math.round(Number(form.quantity) || 1))),
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
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        notify(data.error || 'No se pudo guardar el pedido.', 'error');
        return;
      }
      setIsModalOpen(false);
      await loadOrders();
      notify(editingOrder ? 'Pedido actualizado.' : 'Pedido registrado. Aparece en Pedidos para iniciar con anticipo.');
    } catch (error) {
      console.error(error);
      notify('Error de conexión al guardar el pedido.', 'error');
    }
  };

  // ---------------- Anticipo y cobro ----------------

  const openPayment = (order, mode) => {
    const total = orderTotal(order);
    const received = amountReceived(order);
    const suggested = mode === 'advance' ? advanceExpected(order) : Math.max(0, round2(total - received));
    setPaymentModal({ order, mode });
    setPaymentForm({ cash: suggested, card: 0 });
  };

  const confirmPayment = async () => {
    if (!paymentModal) return;
    const { order, mode } = paymentModal;
    const total = orderTotal(order);
    const already = amountReceived(order);
    const cash = Math.max(0, round2(paymentForm.cash));
    const card = Math.max(0, round2(paymentForm.card));
    const received = round2(cash + card);
    const surcharge = terminalFee(card);
    const terminalCharge = round2(card + surcharge);
    const payment = {
      id: `pay-${Date.now()}`,
      kind: mode,
      cash,
      card,
      surcharge,
      terminalCharge,
      amount: received,
      at: new Date().toISOString()
    };
    const payments = [...(Array.isArray(order.payments) ? order.payments : []), payment];
    const terminalSurcharge = round2((Number(order.terminalSurcharge) || 0) + surcharge);
    try {
      if (mode === 'advance') {
        const required = advanceExpected(order);
        if (received + 0.001 < required) {
          notify(`Para iniciar producción se requiere al menos el 50%: ${money(required)}.`, 'error');
          return;
        }
        const newPaid = round2(already + received);
        const fullyPaid = newPaid + 0.01 >= total;
        await patchOrder(order, {
          status: fullyPaid ? 'pagado' : 'confirmado',
          advancePaid: true,
          advanceReceived: received,
          amountPaid: newPaid,
          advanceAt: new Date().toISOString(),
          paidAt: fullyPaid ? new Date().toISOString() : (order.paidAt || null),
          deliveryStatus: 'pendiente',
          payments,
          terminalSurcharge
        });
        await loadOrders();
        notify(`${fullyPaid
          ? `Pago completo de ${money(newPaid)} registrado. Pedido en producción y ya aparece en Ventas del mes.`
          : `Anticipo de ${money(received)} registrado. Pedido en producción e insumos descontados del almacén.`}${
          surcharge > 0 ? ` Cobra en terminal ${money(terminalCharge)} (incluye 4%: ${money(surcharge)}).` : ''}`);
      } else {
        const newPaid = round2(already + received);
        const fullyPaid = newPaid + 0.01 >= total;
        await patchOrder(order, {
          status: fullyPaid ? 'pagado' : order.status,
          amountPaid: fullyPaid ? total : newPaid,
          paidAt: fullyPaid ? new Date().toISOString() : (order.paidAt || null),
          deliveryStatus: order.deliveryStatus || 'pendiente',
          payments,
          terminalSurcharge
        });
        await loadOrders();
        notify(`${fullyPaid
          ? `Pago registrado por ${money(Math.max(0, total - already))}. Pedido liquidado y movido a Ventas del mes.`
          : `Abono de ${money(received)} registrado. Quedan ${money(Math.max(0, total - newPaid))} por cobrar.`}${
          surcharge > 0 ? ` Cobra en terminal ${money(terminalCharge)} (incluye 4%: ${money(surcharge)}).` : ''}`);
      }
      setPaymentModal(null);
    } catch (error) {
      console.error(error);
      notify(error.message, 'error');
    }
  };

  // ---------------- Ajuste de piezas ----------------

  const openQuantity = (order) => {
    setQtyModal(order);
    setQtyForm({
      quantity: Number(order.quantity) || 1,
      unitPrice: orderUnitPrice(order),
      adjustStock: true
    });
  };

  const saveQuantity = async () => {
    const order = qtyModal;
    if (!order) return;
    const quantity = Math.max(1, Math.round(Number(qtyForm.quantity) || 1));
    const unitPrice = Math.max(0, round2(qtyForm.unitPrice));
    const amount = round2(unitPrice * quantity);
    const oldQuantity = Math.max(1, Number(order.quantity) || 1);
    const cost = order.costBreakdown || {};
    const perUnitMaterials = (Number(cost.materialsCost) || 0) / oldQuantity;
    const hasCostData = Number(cost.materialsCost) > 0 || Number(cost.laborCost) > 0 || Number(cost.equipmentCost) > 0;
    const costPatch = hasCostData
      ? { costBreakdown: { ...cost, materialsCost: round2(perUnitMaterials * quantity) } }
      : {};
    const paidSoFar = amountReceived(order);
    const statusPatch = order.status === 'pagado' && amount > round2(paidSoFar) + 0.01
      ? { status: 'confirmado', paidAt: null }
      : (order.status === 'pagado' && amount < round2(paidSoFar) - 0.01
        ? { amountPaid: amount }
        : {});

    try {
      if (order.materialsDeducted && qtyForm.adjustStock && quantity !== oldQuantity) {
        await patchOrder(order, { revertStock: true });
        await patchOrder(order, { quantity, unitPrice, amount, consumeStock: true, ...costPatch, ...statusPatch });
      } else {
        await patchOrder(order, { quantity, unitPrice, amount, ...costPatch, ...statusPatch });
      }
      setQtyModal(null);
      await loadOrders();
      const difference = round2(amount - paidSoFar);
      notify(`Pedido ${order.orderNumber}: ${quantity} pieza(s) · total ${money(amount)} · anticipo 50% ${money(round2(amount * 0.5))}${
        difference > 0 ? ` · faltan ${money(difference)} por cobrar` : difference < 0 ? ` · ${money(Math.abs(difference))} a favor del cliente` : ''
      }.`);
    } catch (error) {
      console.error(error);
      notify(error.message, 'error');
    }
  };

  // ---------------- Entrega y cancelación ----------------

  const markDelivered = (order) => {
    updateOrder(order, { deliveryStatus: 'entregado', deliveredAt: new Date().toISOString() }, 'Pedido marcado como entregado.');
  };

  const confirmCancel = async () => {
    const order = cancelModal;
    if (!order) return;
    try {
      await patchOrder(order, { status: 'cancelado', cancelledAt: new Date().toISOString() });
      setCancelModal(null);
      await loadOrders();
      notify(order.materialsDeducted
        ? 'Pedido cancelado. Los insumos descontados regresaron al almacén.'
        : 'Pedido cancelado.');
    } catch (error) {
      console.error(error);
      notify(error.message, 'error');
    }
  };

  // ---------------- Listas y totales ----------------

  const sortedByUrgency = (list) => [...list].sort((a, b) => daysToDeliver(a) - daysToDeliver(b));

  const incomingOrders = useMemo(
    () => sortedByUrgency(orders.filter(order => ['consulta', 'cotizado'].includes(order.status))),
    [orders]
  );

  const workingAll = useMemo(() => orders.filter(order => (
    ['confirmado', 'fabricando', 'en_produccion'].includes(order.status)
    || (order.status === 'pagado' && order.deliveryStatus !== 'entregado')
  )), [orders]);

  const workingOrders = useMemo(() => sortedByUrgency(workingAll), [workingAll]);

  const paidOrders = useMemo(() => orders.filter(order => order.status === 'pagado'), [orders]);

  const filteredIncoming = useMemo(() => {
    const query = search.trim().toLowerCase();
    return incomingOrders.filter(order => {
      const statusOk = statusFilter === 'all' || order.status === statusFilter;
      const queryOk = !query || `${order.orderNumber} ${order.productName} ${order.customerCode} ${order.notes}`.toLowerCase().includes(query);
      return statusOk && queryOk;
    });
  }, [incomingOrders, statusFilter, search]);

  const filteredWorking = useMemo(() => {
    const query = search.trim().toLowerCase();
    return workingOrders.filter(order => !query || `${order.orderNumber} ${order.productName} ${order.customerCode}`.toLowerCase().includes(query));
  }, [workingOrders, search]);

  const monthOptions = useMemo(() => {
    const keys = new Set(paidOrders.map(order => monthKey(order.paidAt || order.date || order.createdAt)));
    keys.add(currentMonth());
    return [...keys].sort().reverse();
  }, [paidOrders]);

  const monthOrders = useMemo(() => paidOrders
    .filter(order => monthKey(order.paidAt || order.date || order.createdAt) === monthFilter)
    .sort((a, b) => new Date(b.paidAt || b.date) - new Date(a.paidAt || a.date)), [paidOrders, monthFilter]);

  const monthSummary = useMemo(() => {
    const revenue = monthOrders.reduce((sum, order) => sum + orderTotal(order), 0);
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

  const balanceToCollect = useMemo(
    () => round2(workingOrders.reduce((sum, order) => sum + balanceDue(order), 0)),
    [workingOrders]
  );

  const signalCounts = useMemo(() => {
    const base = { verde: 0, amarillo: 0, naranja: 0, urgente: 0, vencido: 0 };
    workingOrders.forEach(order => {
      const signal = deliverySignal(order);
      if (base[signal.key] !== undefined) base[signal.key] += 1;
    });
    return base;
  }, [workingOrders]);

  const exportMonth = () => {
    const rows = [
      ['Pedido', 'Fecha pago', 'Cliente', 'Producto', 'Cantidad', 'Precio unitario', 'Venta', 'Pagado', 'Efectivo', 'Tarjeta', 'Recargo terminal', 'Costo', 'Ganancia', 'Margen %', 'Entrega'],
      ...monthOrders.map(order => {
        const profit = orderProfit(order);
        const payments = Array.isArray(order.payments) ? order.payments : [];
        const cash = round2(payments.reduce((sum, p) => sum + (Number(p.cash) || 0), 0));
        const card = round2(payments.reduce((sum, p) => sum + (Number(p.card) || 0), 0));
        return [
          order.orderNumber,
          dateKey(order.paidAt || order.date),
          order.customerCode || 'Anónimo',
          order.productName,
          order.quantity,
          orderUnitPrice(order),
          orderTotal(order),
          amountReceived(order),
          cash,
          card,
          round2(order.terminalSurcharge),
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
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-black ${meta.tone}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
        {meta.label}
      </span>
    );
  };

  // ---------------- Tarjeta de pedido ----------------

  const orderCard = (order, mode = 'pedidos') => {
    const product = productForOrder(order);
    const signal = deliverySignal(order);
    const total = orderTotal(order);
    const received = amountReceived(order);
    const balance = balanceDue(order);
    const advance = advanceExpected(order);
    const depositPaid = isDepositPaid(order);
    const terminalSurcharge = round2(order.terminalSurcharge);
    const paidPercent = total > 0 ? Math.min(100, Math.round((Math.min(received, total) / total) * 100)) : 0;
    const delivered = order.deliveryStatus === 'entregado';
    const inProduction = ['confirmado', 'fabricando', 'en_produccion', 'pagado'].includes(order.status);
    const borderTone = signal.level === 4 ? 'border-rose-300' : signal.level === 3 ? 'border-orange-300' : signal.level === 2 ? 'border-amber-200' : 'border-[#E8E4DA]';

    return (
      <div key={order.id} className={`rounded-2xl border bg-white shadow-xs overflow-hidden ${borderTone}`}>
        <div className="p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono font-black text-[11px] text-[#2D4F3E]">{order.orderNumber}</span>
                {statusPill(order.status)}
                {order.materialsDeducted && (
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700">Insumos descontados</span>
                )}
              </div>
              <div className="text-[10px] text-gray-700 font-bold mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span>{order.customerName || order.customerCode || 'Anónimo'}</span>
                {order.customerCode && <span className="text-[9px] font-normal text-gray-400">({order.customerCode})</span>}
                {order.taxData?.rfc && (
                  <span className="text-[7.5px] font-black px-1.5 py-0.2 rounded bg-blue-50 border border-blue-200 text-blue-700" title={`RFC: ${order.taxData.rfc} · ${order.taxData.razonSocial || ''}`}>
                    CFDI 4.0
                  </span>
                )}
                {order.customerPhone && (
                  <a
                    href={`https://wa.me/${order.customerPhone.replace(/\D/g, '').startsWith('52') ? order.customerPhone.replace(/\D/g, '') : '52' + order.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${order.customerName || ''}, te contacto de Artesano Digital sobre tu pedido ${order.orderNumber}:`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[8.5px] font-bold hover:bg-emerald-200 transition-colors"
                    title={`Abrir WhatsApp con ${order.customerPhone}`}
                  >
                    <MessageCircle className="w-2.5 h-2.5" /> WhatsApp
                  </a>
                )}
              </div>
              {order.shippingCity && (
                <div className="text-[9px] text-stone-600 flex items-center gap-1 mt-0.5 truncate" title={order.shippingCity}>
                  <MapPin className="w-2.5 h-2.5 text-stone-400 shrink-0" />
                  <span className="truncate">{order.shippingCity}</span>
                </div>
              )}
              <div className="text-[9.5px] text-gray-500 mt-0.5">
                Alta {dateKey(order.date || order.createdAt)} · Entrega: <strong className="text-gray-700">{orderDeliveryDate(order)}</strong>
              </div>
            </div>
            <SignalBadge signal={signal} />
          </div>

          {/* Desglose de Artículos de la Orden */}
          {Array.isArray(order.items) && order.items.length > 0 ? (
            <div className="rounded-xl bg-stone-50 border border-stone-200 p-2 space-y-1.5 text-xs">
              <div className="text-[9px] font-bold uppercase tracking-wider text-stone-500 flex items-center justify-between">
                <span>Artículos ({order.items.reduce((s, it) => s + (Number(it.quantity) || 1), 0)} pzas)</span>
                <span className="text-[8.5px] text-stone-400">{order.items.length} producto{order.items.length > 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-1 max-h-36 overflow-y-auto pr-0.5">
                {order.items.map((it, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-1.5 border border-stone-100 text-[10px]">
                    <div className="flex items-start justify-between gap-1 font-bold text-gray-800">
                      <span>{it.quantity}× {it.name || it.productName || 'Producto'}</span>
                      <span className="text-emerald-700 shrink-0">${Number(it.price || 0) * (Number(it.quantity) || 1)}</span>
                    </div>
                    {it.selectedVariants && Object.keys(it.selectedVariants).length > 0 && (
                      <div className="text-[8.5px] text-stone-500 mt-0.5 leading-tight">
                        {Object.entries(it.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                      </div>
                    )}
                    {it.customText && (
                      <div className="text-[8.5px] text-amber-700 italic mt-0.5">
                        Personalizado: &quot;{it.customText}&quot;
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {product?.primaryImage ? (
                <img src={product.primaryImage} alt="" className="w-10 h-10 rounded-xl object-cover border border-stone-200 shrink-0" />
              ) : (
                <span className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4 text-stone-500" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold text-gray-900 truncate" title={order.productName}>{order.productName || 'Pedido general'}</div>
                <div className="text-[9px] text-gray-500">
                  {order.quantity} pza × {money(orderUnitPrice(order))} · {product?.sku || product?.code || order.productId || 'Sin SKU'}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <div className="rounded-lg bg-[#FAF9F5] border border-[#E8E4DA] px-2 py-1">
              <span className="text-[7.5px] uppercase text-gray-400 font-bold block">Total</span>
              <span className="text-[10.5px] font-black text-[#2D4F3E]">{money(total)}</span>
            </div>
            <div className={`rounded-lg border px-2 py-1 ${depositPaid ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
              <span className={`text-[7.5px] uppercase font-bold block ${depositPaid ? 'text-emerald-700' : 'text-amber-700'}`}>Anticipo 50%</span>
              <span className={`text-[10.5px] font-black ${depositPaid ? 'text-emerald-800' : 'text-amber-800'}`}>{money(advance)}</span>
              <span className={`text-[7px] block ${depositPaid ? 'text-emerald-600' : 'text-amber-600'}`}>{depositPaid ? 'Recibido' : 'Pendiente'}</span>
            </div>
            <div className="rounded-lg bg-[#FAF9F5] border border-[#E8E4DA] px-2 py-1">
              <span className="text-[7.5px] uppercase text-gray-400 font-bold block">Pagado</span>
              <span className="text-[10.5px] font-black text-gray-700">{money(received)}</span>
            </div>
            <div className={`rounded-lg border px-2 py-1 ${balance > 0 ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
              <span className={`text-[7.5px] uppercase font-bold block ${balance > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>Saldo</span>
              <span className={`text-[10.5px] font-black ${balance > 0 ? 'text-rose-800' : 'text-emerald-800'}`}>{money(balance)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="h-1.5 flex-1 rounded-full bg-stone-200 overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${paidPercent}%` }} />
            </div>
            <span className="text-[8px] font-bold text-gray-500">{paidPercent}% cobrado</span>
          </div>

          {terminalSurcharge > 0 && (
            <div className="flex items-center justify-between text-[8.5px] text-orange-800 bg-orange-50 border border-orange-200 rounded-lg px-2 py-1">
              <span className="font-bold">Recargo terminal 4%</span>
              <strong>{money(terminalSurcharge)}</strong>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {mode === 'pedidos' && (
              <button
                type="button"
                onClick={() => openPayment(order, 'advance')}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#2D4F3E] text-white text-[9.5px] font-black hover:bg-[#20392C] cursor-pointer active:scale-95"
              >
                <CircleDollarSign className="w-3 h-3" /> Iniciar con anticipo 50%
              </button>
            )}

            {mode === 'trabajando' && (
              <>
                {balance > 0 && (
                  <button
                    type="button"
                    onClick={() => openPayment(order, 'final')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-[9.5px] font-black hover:bg-emerald-700 cursor-pointer active:scale-95"
                  >
                    <CreditCard className="w-3 h-3" /> Cobrar {money(balance)}
                  </button>
                )}
                {!delivered && (
                  <button
                    type="button"
                    onClick={() => markDelivered(order)}
                    className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 text-[9.5px] font-bold hover:bg-sky-100 cursor-pointer"
                  >
                    <Truck className="w-3 h-3" /> Entregar
                  </button>
                )}
                {delivered && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-stone-100 border border-stone-200 text-[9px] font-bold text-stone-600">
                    <CheckCircle2 className="w-3 h-3" /> Entregado
                  </span>
                )}
              </>
            )}

            {!delivered && inProduction && (
              <button
                type="button"
                onClick={() => openQuantity(order)}
                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white border border-stone-200 text-[9px] font-bold text-stone-700 hover:bg-stone-50 cursor-pointer"
              >
                <Minus className="w-3 h-3" /> Ajustar piezas
              </button>
            )}
            {mode === 'pedidos' && (
              <button
                type="button"
                onClick={() => openQuantity(order)}
                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white border border-stone-200 text-[9px] font-bold text-stone-700 hover:bg-stone-50 cursor-pointer"
              >
                <Minus className="w-3 h-3" /> Ajustar piezas
              </button>
            )}

            <button
              type="button"
              onClick={() => openEditOrder(order)}
              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white border border-stone-200 text-[9px] font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
            >
              <Edit className="w-3 h-3" /> Editar
            </button>

            {!delivered && (
              <button
                type="button"
                onClick={() => setCancelModal(order)}
                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-[9px] font-bold text-rose-700 hover:bg-rose-100 cursor-pointer"
              >
                <Ban className="w-3 h-3" /> Cancelar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const tabList = [
    { id: 'pedidos', step: '1', label: 'Pedidos', hint: 'Nuevos y cotizados', icon: ShoppingCart, count: incomingOrders.length },
    { id: 'trabajando', step: '2', label: 'Trabajando', hint: 'En producción', icon: Hammer, count: workingOrders.length },
    { id: 'ventas', step: '3', label: 'Ventas del mes', hint: 'Cobrados', icon: Wallet, count: monthOrders.length }
  ];

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
                Primero el pedido, después el taller y al final la venta. Solo pasa a producción con el 50% de anticipo.
              </p>
            </div>
            <button
              type="button"
              onClick={openNewOrder}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-[#20392C] hover:bg-amber-50 text-[11px] font-black shadow-sm shrink-0 cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" /> Nuevo pedido
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-4">
            {[
              ['Por atender', String(incomingOrders.length), 'Consulta + cotizado'],
              ['En producción', String(workingOrders.filter(order => order.status !== 'pagado').length), 'Trabajando ahora'],
              ['Por cobrar', money(balanceToCollect), 'Saldos pendientes'],
              ['Ventas del mes', money(monthSummary.revenue), monthLabel(monthFilter)]
            ].map(([label, value, sub]) => (
              <div key={label} className="rounded-xl bg-white/10 border border-white/15 px-3 py-2">
                <span className="text-[8px] uppercase tracking-wider text-white/60 font-bold">{label}</span>
                <div className="text-lg font-black font-mono leading-tight">{value}</div>
                <span className="text-[8.5px] text-white/55">{sub}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3 text-[8.5px] text-white/70">
            <span className="font-black uppercase tracking-wider text-white/50">Semáforo de entrega:</span>
            {[
              ['bg-emerald-400', 'A tiempo'],
              ['bg-amber-300', 'Ajustado'],
              ['bg-orange-400', 'Con presión'],
              ['bg-rose-500', 'Urgente / vencido']
            ].map(([tone, label]) => (
              <span key={label} className="inline-flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${tone}`} /> {label}
              </span>
            ))}
            {signalCounts.urgente + signalCounts.vencido > 0 && (
              <span className="ml-auto px-2 py-0.5 rounded-full bg-rose-500/90 text-white font-black">
                {signalCounts.urgente + signalCounts.vencido} urgente(s)
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="bg-white border border-[#E8E4DA] rounded-2xl p-1.5 shadow-xs">
        <div className="flex flex-wrap items-stretch gap-1">
          {tabList.map((tab, index) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <React.Fragment key={tab.id}>
                {index > 0 && <ArrowRight className="w-3.5 h-3.5 text-stone-300 self-center hidden sm:block" />}
                <button
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[120px] flex items-center gap-2 px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer ${
                    active ? 'bg-[#2D4F3E] text-white shadow-sm' : 'text-gray-600 hover:bg-stone-100'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                    active ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
                  }`}>{tab.step}</span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1 text-[10.5px] font-black leading-tight">
                      <Icon className="w-3 h-3" /> {tab.label}
                      <span className={`px-1.5 rounded-full text-[8.5px] font-mono ${active ? 'bg-white/20' : 'bg-stone-100 border border-stone-200'}`}>{tab.count}</span>
                    </span>
                    <span className={`block text-[8.5px] ${active ? 'text-white/60' : 'text-gray-400'}`}>{tab.hint}</span>
                  </span>
                </button>
              </React.Fragment>
            );
          })}
          <button
            type="button"
            onClick={loadOrders}
            className="self-center ml-auto inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-[10px] font-bold text-gray-500 hover:bg-stone-100 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Actualizar
          </button>
        </div>
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
          <div className="bg-white border border-[#E8E4DA] rounded-2xl p-3 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Buscar pedido, cliente o producto…"
                className="w-full pl-8 pr-2 py-2 rounded-xl border border-stone-300 bg-white text-[11px] focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>
            <select
              value={statusFilter}
              onChange={event => setStatusFilter(event.target.value)}
              className="px-2.5 py-2 rounded-xl border border-stone-300 bg-white text-[10.5px] font-bold"
            >
              <option value="all">Todos los nuevos</option>
              <option value="consulta">Consulta</option>
              <option value="cotizado">Cotizado</option>
            </select>
            <span className="text-[9px] text-gray-500 font-bold">{filteredIncoming.length} por atender</span>
          </div>

          <div className="rounded-xl bg-sky-50 border border-sky-200 p-2.5 text-[10px] text-sky-900 flex items-start gap-2">
            <CircleDollarSign className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>
              Un pedido solo avanza a <strong>Trabajando</strong> cuando registras el <strong>anticipo del 50%</strong>. Al confirmarlo, se descuentan los insumos de la receta.
            </span>
          </div>

          {filteredIncoming.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-[#D8D2C4] p-8 text-center">
              <ShoppingCart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-700">No hay pedidos por atender.</p>
              <p className="text-[11px] text-gray-500 mt-1">Registra un pedido nuevo o revisa la pestaña Trabajando.</p>
              <button type="button" onClick={openNewOrder} className="mt-3 inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#2D4F3E] text-white text-[10px] font-black cursor-pointer">
                <Plus className="w-3.5 h-3.5" /> Registrar pedido
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-2.5">
              {filteredIncoming.map(order => orderCard(order, 'pedidos'))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'trabajando' && (
        <div className="space-y-3">
          <div className="bg-white border border-[#E8E4DA] rounded-2xl p-3 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Buscar producto, pedido o cliente…"
                className="w-full pl-8 pr-2 py-2 rounded-xl border border-stone-300 bg-white text-[11px] focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>
            <div className="inline-flex rounded-xl border border-stone-200 p-0.5 bg-stone-50">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1.5 rounded-lg text-[9.5px] font-bold inline-flex items-center gap-1 cursor-pointer ${viewMode === 'cards' ? 'bg-white text-[#2D4F3E] shadow-xs' : 'text-gray-500'}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Fichas
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-1.5 rounded-lg text-[9.5px] font-bold inline-flex items-center gap-1 cursor-pointer ${viewMode === 'list' ? 'bg-white text-[#2D4F3E] shadow-xs' : 'text-gray-500'}`}
              >
                <List className="w-3.5 h-3.5" /> Lista
              </button>
            </div>
            <span className="text-[9px] text-gray-500 font-bold">{filteredWorking.length} en trabajo</span>
          </div>

          {filteredWorking.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-[#D8D2C4] p-8 text-center">
              <Hammer className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-700">No hay productos trabajando.</p>
              <p className="text-[11px] text-gray-500 mt-1">Registra el anticipo del 50% en Pedidos para enviarlo a producción.</p>
            </div>
          ) : viewMode === 'cards' ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-2.5">
              {filteredWorking.map(order => orderCard(order, 'trabajando'))}
            </div>
          ) : (
            <div className="bg-white border border-[#E8E4DA] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[10.5px]">
                  <thead className="bg-stone-50 text-gray-500 uppercase text-[8px] font-black">
                    <tr>
                      <th className="px-3 py-2">Pedido</th>
                      <th className="px-3 py-2">Prioridad</th>
                      <th className="px-3 py-2">Producto</th>
                      <th className="px-3 py-2">Cliente</th>
                      <th className="px-3 py-2 text-center">Pzas</th>
                      <th className="px-3 py-2 text-right">Total</th>
                      <th className="px-3 py-2 text-right">Pagado</th>
                      <th className="px-3 py-2 text-right">Saldo</th>
                      <th className="px-3 py-2">Entrega</th>
                      <th className="px-3 py-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredWorking.map(order => {
                      const signal = deliverySignal(order);
                      const balance = balanceDue(order);
                      return (
                        <tr key={order.id} className="hover:bg-stone-50/60">
                          <td className="px-3 py-2 font-mono font-bold text-[#2D4F3E]">{order.orderNumber}</td>
                          <td className="px-3 py-2">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[8.5px] font-black ${signal.tone}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${signal.bar}`} /> {signal.label}
                            </span>
                          </td>
                          <td className="px-3 py-2 font-semibold text-gray-900 max-w-[200px] truncate" title={order.productName}>{order.productName}</td>
                          <td className="px-3 py-2 text-gray-600">{order.customerCode || 'Anónimo'}</td>
                          <td className="px-3 py-2 text-center font-bold">{order.quantity}</td>
                          <td className="px-3 py-2 text-right font-black text-emerald-800">{money(orderTotal(order))}</td>
                          <td className="px-3 py-2 text-right text-gray-600">{money(amountReceived(order))}</td>
                          <td className={`px-3 py-2 text-right font-bold ${balance > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>{money(balance)}</td>
                          <td className="px-3 py-2 text-gray-500">{order.deliveryStatus === 'entregado' ? 'Entregado' : orderDeliveryDate(order)}</td>
                          <td className="px-3 py-2">
                            <div className="flex flex-wrap gap-1">
                              {balance > 0 && <button type="button" onClick={() => openPayment(order, 'final')} className="px-1.5 py-0.5 rounded border border-emerald-200 bg-emerald-50 text-emerald-800 text-[8.5px] font-bold cursor-pointer">Cobrar</button>}
                              {order.deliveryStatus !== 'entregado' && <button type="button" onClick={() => markDelivered(order)} className="px-1.5 py-0.5 rounded border border-sky-200 bg-sky-50 text-sky-800 text-[8.5px] font-bold cursor-pointer">Entregar</button>}
                              <button type="button" onClick={() => openQuantity(order)} className="px-1.5 py-0.5 rounded border border-stone-200 bg-white text-stone-600 text-[8.5px] font-bold cursor-pointer">Piezas</button>
                              <button type="button" onClick={() => setCancelModal(order)} className="px-1.5 py-0.5 rounded border border-rose-200 bg-rose-50 text-rose-700 text-[8.5px] font-bold cursor-pointer">Cancelar</button>
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

      {activeTab === 'ventas' && (
        <div className="space-y-3">
          <div className="bg-white border border-[#E8E4DA] rounded-2xl p-3 flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[9px] uppercase tracking-wider font-black text-gray-500 mr-1">Mes:</span>
              {monthOptions.map(key => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMonthFilter(key)}
                  className={`px-2 py-1 rounded-lg border text-[9.5px] font-bold cursor-pointer ${monthFilter === key ? 'bg-[#2D4F3E] border-[#2D4F3E] text-white' : 'bg-white border-stone-200 text-gray-600 hover:border-emerald-300'}`}
                >
                  {monthLabel(key)}
                </button>
              ))}
            </div>
            <button type="button" onClick={exportMonth} className="ml-auto inline-flex items-center gap-1 px-2.5 py-2 rounded-xl border border-stone-200 bg-stone-50 text-[10px] font-bold text-gray-600 hover:bg-stone-100 cursor-pointer">
              <FileText className="w-3.5 h-3.5" /> Exportar mes
            </button>
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
                <p className="text-[11px] text-gray-500 mt-1">Cobra un pedido en la pestaña Trabajando.</p>
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
                      <th className="px-3 py-2 text-center">Pzas</th>
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
                          <td className="px-3 py-2 text-center font-bold">{order.quantity}</td>
                          <td className="px-3 py-2 text-right font-black text-emerald-800">{money(orderTotal(order))}</td>
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

      {/* MODAL: NUEVO / EDITAR PEDIDO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[92vh] bg-[#FBF9F5] rounded-3xl shadow-2xl border border-[#E8E4DA] flex flex-col overflow-hidden" onClick={event => event.stopPropagation()}>
            <div className="px-4 sm:px-5 py-3 bg-[#1F2421] text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm font-black font-heading">{editingOrder ? 'Editar pedido' : 'Registrar nuevo pedido'}</h3>
                <p className="text-[10px] text-gray-400">Entra como consulta o cotizado; el anticipo del 50% lo manda a producción.</p>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-gray-500 uppercase block mb-0.5">Piezas</label>
                  <input type="number" min="1" value={form.quantity} onChange={event => setFormQuantity(event.target.value)} className="w-full px-2.5 py-2 rounded-xl border border-stone-300 bg-white font-bold" />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-gray-500 uppercase block mb-0.5">Precio por pieza</label>
                  <input type="number" min="0" step="0.01" value={form.unitPrice} onChange={event => setFormUnitPrice(event.target.value)} className="w-full px-2.5 py-2 rounded-xl border border-stone-300 bg-white font-bold" />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-gray-500 uppercase block mb-0.5">Total (auto)</label>
                  <input value={money(form.amount)} readOnly className="w-full px-2.5 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 font-black" />
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
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-[10px] text-emerald-900 grid grid-cols-3 gap-2">
                <div><strong className="block">Total</strong>{money(form.amount)}</div>
                <div><strong className="block">Anticipo 50%</strong>{money(round2(form.amount * 0.5))}</div>
                <div><strong className="block">Margen</strong>{form.amount > 0 ? `${Math.round(((form.amount - Number(form.costBreakdown.materialsCost)) / form.amount) * 1000) / 10}%` : '—'}</div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-stone-700 text-[10.5px] font-bold cursor-pointer">Cancelar</button>
                <button type="submit" className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-[#2D4F3E] text-white text-[10.5px] font-black hover:bg-[#20392C] cursor-pointer"><Save className="w-3.5 h-3.5" /> Guardar pedido</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ANTICIPO / COBRO */}
      {paymentModal && (() => {
        const order = paymentModal.order;
        const total = orderTotal(order);
        const already = amountReceived(order);
        const required = advanceExpected(order);
        const isAdvance = paymentModal.mode === 'advance';
        const cash = Math.max(0, round2(paymentForm.cash));
        const card = Math.max(0, round2(paymentForm.card));
        const applied = round2(cash + card);
        const surcharge = terminalFee(card);
        const terminalCharge = round2(card + surcharge);
        const totalToCollect = round2(cash + terminalCharge);
        const newBalance = Math.max(0, round2(total - already - applied));
        const target = isAdvance ? required : Math.max(0, round2(total - already));
        const missing = Math.max(0, round2(target - applied));
        const canConfirm = isAdvance ? applied + 0.001 >= required : applied > 0;
        const setSplit = (kind) => {
          if (kind === 'cash') setPaymentForm({ cash: target, card: 0 });
          else if (kind === 'card') setPaymentForm({ cash: 0, card: target });
          else setPaymentForm({ cash: round2(target / 2), card: round2(target - round2(target / 2)) });
        };
        return (
          <div className="fixed inset-0 z-[85] flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-md max-h-[94vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
              <div className="px-4 py-3 bg-[#1F2421] text-white flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-sm font-black">{isAdvance ? 'Iniciar producción' : 'Registrar pago'}</h3>
                  <p className="text-[10px] text-gray-400">{order.orderNumber} · {order.productName}</p>
                </div>
                <button type="button" onClick={() => setPaymentModal(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-4 space-y-3 text-xs overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-[#FAF9F5] border border-[#E8E4DA] p-2.5">
                    <span className="text-[8px] uppercase font-bold text-gray-400 block">Total del pedido</span>
                    <span className="text-base font-black text-[#2D4F3E]">{money(total)}</span>
                    <span className="text-[8.5px] text-gray-500 block">{order.quantity} pza × {money(orderUnitPrice(order))}</span>
                  </div>
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-2.5">
                    <span className="text-[8px] uppercase font-bold text-amber-700 block">Anticipo 50%</span>
                    <span className="text-base font-black text-amber-900">{money(required)}</span>
                    <span className="text-[8.5px] text-amber-700 block">{isDepositPaid(order) ? `Recibido ${money(already)}` : 'Requerido para iniciar'}</span>
                  </div>
                </div>

                {isAdvance && (
                  <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-[10px] text-rose-800">
                    Sin el 50% de anticipo el pedido no pasa a producción. Puedes cobrarlo en efectivo, con terminal o mitad y mitad.
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[9px] uppercase font-black text-gray-400 mr-0.5">Forma de pago:</span>
                  <button type="button" onClick={() => setSplit('cash')} className="px-2 py-1 rounded-lg border border-stone-200 bg-white text-[9.5px] font-bold text-stone-700 hover:border-emerald-300 cursor-pointer">Todo efectivo</button>
                  <button type="button" onClick={() => setSplit('half')} className="px-2 py-1 rounded-lg border border-stone-200 bg-white text-[9.5px] font-bold text-stone-700 hover:border-emerald-300 cursor-pointer">Mitad y mitad</button>
                  <button type="button" onClick={() => setSplit('card')} className="px-2 py-1 rounded-lg border border-stone-200 bg-white text-[9.5px] font-bold text-stone-700 hover:border-emerald-300 cursor-pointer">Todo tarjeta</button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-bold text-gray-500 uppercase block mb-0.5">Efectivo</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={paymentForm.cash}
                      onChange={event => setPaymentForm(prev => ({ ...prev, cash: event.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-base font-black"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-gray-500 uppercase block mb-0.5">Tarjeta (terminal)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={paymentForm.card}
                      onChange={event => setPaymentForm(prev => ({ ...prev, card: event.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-base font-black"
                    />
                    <span className="text-[8.5px] text-gray-500 block mt-0.5">
                      {card > 0 ? `Se cobra ${money(terminalCharge)} (incluye 4%)` : 'Sin recargo'}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl bg-[#FAF9F5] border border-[#E8E4DA] p-2.5 space-y-1 text-[10.5px]">
                  <div className="flex justify-between"><span className="text-gray-500">Ya pagado</span><strong>{money(already)}</strong></div>
                  <div className="flex justify-between"><span className="text-gray-500">Efectivo</span><strong>{money(cash)}</strong></div>
                  <div className="flex justify-between"><span className="text-gray-500">Tarjeta (sin recargo)</span><strong>{money(card)}</strong></div>
                  <div className="flex justify-between"><span className="text-gray-500">Recargo terminal 4%</span><strong className={surcharge > 0 ? 'text-orange-700' : ''}>{money(surcharge)}</strong></div>
                  <div className="flex justify-between border-t border-[#E8E4DA] pt-1"><span className="text-gray-500">Cobrar en terminal</span><strong>{money(terminalCharge)}</strong></div>
                  <div className="flex justify-between text-[11px] border-t border-[#E8E4DA] pt-1"><span className="font-bold text-gray-700">Total a recibir ahora</span><strong className="text-[#2D4F3E]">{money(totalToCollect)}</strong></div>
                  <div className="flex justify-between"><span className="text-gray-500">Aplicado al pedido</span><strong>{money(applied)}</strong></div>
                  <div className="flex justify-between border-t border-[#E8E4DA] pt-1"><span className="text-gray-500">Saldo después del pago</span><strong className={newBalance > 0 ? 'text-rose-700' : 'text-emerald-700'}>{money(newBalance)}</strong></div>
                </div>

                {missing > 0 && (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-2 text-[10px] text-amber-900">
                    {isAdvance ? `Faltan ${money(missing)} para completar el anticipo del 50%.` : `Faltan ${money(missing)} para liquidar el pedido.`}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2">
                  <button type="button" onClick={() => setPaymentModal(null)} className="px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-stone-700 text-[10.5px] font-bold cursor-pointer">Cancelar</button>
                  <button
                    type="button"
                    disabled={!canConfirm}
                    onClick={confirmPayment}
                    className={`inline-flex items-center gap-1 px-4 py-2 rounded-xl text-white text-[10.5px] font-black ${canConfirm ? 'bg-[#2D4F3E] hover:bg-[#20392C] cursor-pointer' : 'bg-stone-300 cursor-not-allowed'}`}
                  >
                    {isAdvance ? <Hammer className="w-3.5 h-3.5" /> : <CreditCard className="w-3.5 h-3.5" />}
                    {isAdvance ? 'Confirmar anticipo y producir' : 'Confirmar pago'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL: AJUSTAR PIEZAS */}
      {qtyModal && (() => {
        const order = qtyModal;
        const quantity = Math.max(1, Math.round(Number(qtyForm.quantity) || 1));
        const unitPrice = Math.max(0, Number(qtyForm.unitPrice) || 0);
        const newTotal = round2(unitPrice * quantity);
        const newAdvance = round2(newTotal * 0.5);
        const paid = amountReceived(order);
        const newBalance = Math.max(0, round2(newTotal - paid));
        const product = productForOrder(order);
        const unitCost = Number(product?.costPrice) || 0;
        const estimatedCost = unitCost > 0 ? round2(unitCost * quantity) : null;
        const estimatedMargin = newTotal > 0 && estimatedCost !== null
          ? Math.round(((newTotal - estimatedCost) / newTotal) * 1000) / 10
          : null;
        return (
          <div className="fixed inset-0 z-[85] flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="px-4 py-3 bg-[#1F2421] text-white flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black">Ajustar piezas del pedido</h3>
                  <p className="text-[10px] text-gray-400">{order.orderNumber} · {order.productName}</p>
                </div>
                <button type="button" onClick={() => setQtyModal(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-4 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-bold text-gray-500 uppercase block mb-0.5">Piezas</label>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => setQtyForm(prev => ({ ...prev, quantity: Math.max(1, Number(prev.quantity) - 1) }))} className="w-8 h-9 rounded-lg border border-stone-300 bg-white flex items-center justify-center cursor-pointer"><Minus className="w-3.5 h-3.5" /></button>
                      <input type="number" min="1" value={qtyForm.quantity} onChange={event => setQtyForm({ ...qtyForm, quantity: event.target.value })} className="flex-1 min-w-0 h-9 px-2 rounded-lg border border-stone-300 bg-white text-center font-black" />
                      <button type="button" onClick={() => setQtyForm(prev => ({ ...prev, quantity: Number(prev.quantity) + 1 }))} className="w-8 h-9 rounded-lg border border-stone-300 bg-white flex items-center justify-center cursor-pointer"><Plus className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-gray-500 uppercase block mb-0.5">Precio por pieza</label>
                    <input type="number" min="0" step="0.01" value={qtyForm.unitPrice} onChange={event => setQtyForm({ ...qtyForm, unitPrice: event.target.value })} className="w-full h-9 px-2 rounded-lg border border-stone-300 bg-white font-black" />
                  </div>
                </div>

                <div className="rounded-xl bg-[#FAF9F5] border border-[#E8E4DA] p-2.5 space-y-1 text-[10.5px]">
                  <div className="flex justify-between"><span className="text-gray-500">{quantity} pza × {money(unitPrice)}</span><strong>Total {money(newTotal)}</strong></div>
                  <div className="flex justify-between"><span className="text-gray-500">Anticipo 50% para producción</span><strong>{money(newAdvance)}</strong></div>
                  <div className="flex justify-between"><span className="text-gray-500">Ya pagado</span><strong>{money(paid)}</strong></div>
                  <div className="flex justify-between border-t border-[#E8E4DA] pt-1"><span className="text-gray-500">Saldo por cobrar</span><strong className={newBalance > 0 ? 'text-rose-700' : 'text-emerald-700'}>{money(newBalance)}</strong></div>
                </div>

                {estimatedCost !== null && (
                  <div className="rounded-xl bg-sky-50 border border-sky-200 p-2.5 text-[10px] text-sky-900 flex items-center justify-between">
                    <span>Costo estimado: <strong>{money(estimatedCost)}</strong></span>
                    <span>Margen: <strong>{estimatedMargin}%</strong></span>
                  </div>
                )}

                {order.materialsDeducted && (
                  <label className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-2.5 text-[10px] text-amber-900 cursor-pointer">
                    <input type="checkbox" checked={qtyForm.adjustStock} onChange={event => setQtyForm({ ...qtyForm, adjustStock: event.target.checked })} className="mt-0.5" />
                    <span>Ajustar también los insumos del almacén a la nueva cantidad (devuelve y vuelve a descontar la receta).</span>
                  </label>
                )}

                <div className="flex items-center justify-end gap-2">
                  <button type="button" onClick={() => setQtyModal(null)} className="px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-stone-700 text-[10.5px] font-bold cursor-pointer">Cancelar</button>
                  <button type="button" onClick={saveQuantity} className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-[#2D4F3E] text-white text-[10.5px] font-black hover:bg-[#20392C] cursor-pointer"><Save className="w-3.5 h-3.5" /> Guardar cambios</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL: CANCELAR PEDIDO */}
      {cancelModal && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-4 py-3 bg-rose-600 text-white">
              <h3 className="text-sm font-black">Cancelar pedido</h3>
              <p className="text-[10px] text-rose-100">{cancelModal.orderNumber} · {cancelModal.productName}</p>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <p className="text-[11px] text-gray-700">
                ¿Seguro que quieres cancelar este pedido? Puedes cancelarlo incluso si ya está en producción.
              </p>
              {cancelModal.materialsDeducted && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-2.5 text-[10px] text-amber-900">
                  Los insumos ya descontados de la receta se devolverán al almacén.
                </div>
              )}
              {amountReceived(cancelModal) > 0 && (
                <div className="rounded-xl bg-sky-50 border border-sky-200 p-2.5 text-[10px] text-sky-900">
                  Se registraron {money(amountReceived(cancelModal))} de pago. El reembolso se acuerda con el cliente.
                </div>
              )}
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={() => setCancelModal(null)} className="px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-stone-700 text-[10.5px] font-bold cursor-pointer">Volver</button>
                <button type="button" onClick={confirmCancel} className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-rose-600 text-white text-[10.5px] font-black hover:bg-rose-700 cursor-pointer"><Ban className="w-3.5 h-3.5" /> Sí, cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
