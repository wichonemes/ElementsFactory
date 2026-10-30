import React, { useState, useEffect, useMemo } from 'react';
import {
  Megaphone, TrendingUp, DollarSign, Copy, ExternalLink, Plus, Edit, Trash2,
  Filter, Calendar, Download, CheckCircle2, Clock, AlertCircle, Users,
  ShoppingBag, ArrowUpRight, BarChart2, FileSpreadsheet, Layers, Tag,
  HelpCircle, Check, X, RefreshCw, AlertTriangle, ArrowRight, Shield
} from 'lucide-react';

export default function SalesMarketingSection({ token, products = [], settings = null }) {
  // Navigation sub-tab state: 'report' | 'publications' | 'orders'
  const [subTab, setSubTab] = useState('report');

  // Data states
  const [publications, setPublications] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });

  // Report Filter states
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterNetwork, setFilterNetwork] = useState('all');
  const [filterProduct, setFilterProduct] = useState('all');

  // Publication Modal / Form state
  const [isPubModalOpen, setIsPubModalOpen] = useState(false);
  const [editingPub, setEditingPub] = useState(null);
  const [pubForm, setPubForm] = useState({
    code: '',
    name: '',
    date: new Date().toISOString().split('T')[0],
    socialNetwork: 'instagram',
    postUrl: '',
    productId: 'general',
    productName: 'General / Catálogo de la tienda',
    adSpend: 0,
    utmMedium: 'social',
    notes: ''
  });
  const [copiedLink, setCopiedLink] = useState(false);

  // Order Modal / Form state
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [orderForm, setOrderForm] = useState({
    orderNumber: '',
    date: new Date().toISOString().split('T')[0],
    pubCode: 'desconocido',
    productId: 'general',
    productName: '',
    quantity: 1,
    amount: 0,
    status: 'consulta',
    customerCode: '',
    couponCode: '',
    couponCategory: 'store',
    couponDiscount: 0,
    hasCosts: true,
    costBreakdown: {
      materialsCost: 0,
      laborCost: 0,
      equipmentCost: 0,
      packagingCost: 0,
      commissionsCost: 0,
      absorbedShippingCost: 0,
      costStatus: 'estimado'
    },
    notes: ''
  });

  // Orders Table Filter State
  const [orderFilterStatus, setOrderFilterStatus] = useState('all');
  const [orderFilterPub, setOrderFilterPub] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');

  // Auto-clear notification messages
  useEffect(() => {
    if (actionMessage.text) {
      const timer = setTimeout(() => setActionMessage({ text: '', type: '' }), 4000);
      return () => clearTimeout(timer);
    }
  }, [actionMessage]);

  // Load all initial data
  useEffect(() => {
    if (token) {
      loadAllSalesData();
    }
  }, [token, filterStartDate, filterEndDate, filterNetwork, filterProduct]);

  const loadAllSalesData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Build query string for report
      const queryParams = new URLSearchParams();
      if (filterStartDate) queryParams.set('startDate', filterStartDate);
      if (filterEndDate) queryParams.set('endDate', filterEndDate);
      if (filterNetwork !== 'all') queryParams.set('socialNetwork', filterNetwork);
      if (filterProduct !== 'all') queryParams.set('productId', filterProduct);

      const [resPubs, resOrders, resReport] = await Promise.all([
        fetch('/api/admin/publications', { headers }),
        fetch('/api/admin/orders', { headers }),
        fetch(`/api/admin/sales-report?${queryParams.toString()}`, { headers })
      ]);

      const [dataPubs, dataOrders, dataReport] = await Promise.all([
        resPubs.json(),
        resOrders.json(),
        resReport.json()
      ]);

      setPublications(Array.isArray(dataPubs) ? dataPubs : []);
      setOrders(Array.isArray(dataOrders) ? dataOrders : []);
      setReportData(dataReport || null);
    } catch (err) {
      console.error('Error fetching sales & publications data:', err);
      setActionMessage({ text: 'Error al conectar con el servidor', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // PUBLICATION HANDLERS
  // -------------------------------------------------------------
  const handleOpenNewPubModal = () => {
    const nextSeq = String(publications.length + 1).padStart(3, '0');
    setEditingPub(null);
    setPubForm({
      code: `PUB-IG-${nextSeq}`,
      name: '',
      date: new Date().toISOString().split('T')[0],
      socialNetwork: 'instagram',
      postUrl: '',
      productId: 'general',
      productName: 'General / Catálogo de la tienda',
      adSpend: 0,
      utmMedium: 'social',
      notes: ''
    });
    setCopiedLink(false);
    setIsPubModalOpen(true);
  };

  const handleOpenEditPubModal = (pub) => {
    setEditingPub(pub);
    setPubForm({
      code: pub.code,
      name: pub.name,
      date: pub.date,
      socialNetwork: pub.socialNetwork || 'instagram',
      postUrl: pub.postUrl || '',
      productId: pub.productId || 'general',
      productName: pub.productName || 'General / Catálogo de la tienda',
      adSpend: pub.adSpend || 0,
      utmMedium: pub.utmMedium || 'social',
      notes: pub.notes || ''
    });
    setCopiedLink(false);
    setIsPubModalOpen(true);
  };

  // Generate UTM Tracking URL
  const generateUtmLink = (form) => {
    const origin = window.location.origin;
    const cleanPath = window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
    const cleanCode = (form.code || '').trim().toUpperCase();
    const source = (form.socialNetwork || 'instagram').toLowerCase();
    const medium = form.utmMedium || 'social';
    const campaign = `pub_${cleanCode.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    let url = `${origin}${cleanPath}/?pub=${encodeURIComponent(cleanCode)}&utm_source=${encodeURIComponent(source)}&utm_medium=${encodeURIComponent(medium)}&utm_campaign=${encodeURIComponent(campaign)}&utm_content=${encodeURIComponent(cleanCode)}`;

    if (form.productId && form.productId !== 'general' && form.productId !== 'paquetes') {
      url += `&prod=${encodeURIComponent(form.productId)}`;
    }
    return url;
  };

  const handleCopyLink = (linkToCopy) => {
    navigator.clipboard?.writeText(linkToCopy);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSavePublication = async (e) => {
    e.preventDefault();
    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      };

      const payload = {
        ...pubForm,
        code: pubForm.code.trim().toUpperCase(),
        adSpend: Number(pubForm.adSpend) || 0
      };

      let res;
      if (editingPub) {
        res = await fetch(`/api/admin/publications/${editingPub.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/admin/publications', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setActionMessage({ text: data.error || 'Error al guardar publicación', type: 'error' });
        return;
      }

      setActionMessage({
        text: editingPub ? 'Publicación actualizada con éxito.' : 'Publicación creada con enlace de seguimiento.',
        type: 'success'
      });
      setIsPubModalOpen(false);
      loadAllSalesData();
    } catch (err) {
      console.error(err);
      setActionMessage({ text: 'Error de conexión', type: 'error' });
    }
  };

  const handleDeletePublication = async (id, name) => {
    if (!window.confirm(`¿Seguro que deseas eliminar la publicación "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/publications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setActionMessage({ text: 'Publicación eliminada.', type: 'success' });
        loadAllSalesData();
      } else {
        const data = await res.json();
        setActionMessage({ text: data.error || 'No se pudo eliminar.', type: 'error' });
      }
    } catch (err) {
      setActionMessage({ text: 'Error de conexión', type: 'error' });
    }
  };

  // -------------------------------------------------------------
  // ORDER HANDLERS
  // -------------------------------------------------------------
  const handleOpenNewOrderModal = () => {
    const nextSeq = String(orders.length + 1).padStart(3, '0');
    const year = new Date().getFullYear();
    setEditingOrder(null);
    setOrderForm({
      orderNumber: `PED-${year}-${nextSeq}`,
      date: new Date().toISOString().split('T')[0],
      pubCode: publications.length > 0 ? publications[0].code : 'desconocido',
      productId: 'general',
      productName: '',
      quantity: 1,
      amount: 0,
      status: 'consulta',
      customerCode: '',
      couponCode: '',
      couponCategory: 'store',
      couponDiscount: 0,
      hasCosts: true,
      costBreakdown: {
        materialsCost: 0,
        laborCost: 0,
        equipmentCost: 0,
        packagingCost: 0,
        commissionsCost: 0,
        absorbedShippingCost: 0,
        costStatus: 'estimado'
      },
      notes: ''
    });
    setIsOrderModalOpen(true);
  };

  const handleOpenEditOrderModal = (ord) => {
    setEditingOrder(ord);
    const cb = ord.costBreakdown || {};
    setOrderForm({
      orderNumber: ord.orderNumber,
      date: ord.date || ord.createdAt?.split('T')[0],
      pubCode: ord.pubCode || 'desconocido',
      productId: ord.productId || 'general',
      productName: ord.productName || '',
      quantity: ord.quantity || 1,
      amount: ord.amount || 0,
      status: ord.status || 'consulta',
      customerCode: ord.customerCode || '',
      couponCode: ord.couponCode || '',
      couponCategory: ord.couponCategory || 'store',
      couponDiscount: ord.couponDiscount || 0,
      hasCosts: ord.hasCosts ?? true,
      costBreakdown: {
        materialsCost: cb.materialsCost || 0,
        laborCost: cb.laborCost || 0,
        equipmentCost: cb.equipmentCost || 0,
        packagingCost: cb.packagingCost || 0,
        commissionsCost: cb.commissionsCost || 0,
        absorbedShippingCost: cb.absorbedShippingCost || 0,
        costStatus: cb.costStatus || 'estimado'
      },
      notes: ord.notes || ''
    });
    setIsOrderModalOpen(true);
  };

  const handleSaveOrder = async (e) => {
    e.preventDefault();
    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      };

      const payload = {
        ...orderForm,
        quantity: Math.max(1, Number(orderForm.quantity) || 1),
        amount: Math.max(0, Number(orderForm.amount) || 0),
        couponCode: orderForm.couponCode ? orderForm.couponCode.trim().toUpperCase() : null,
        couponCategory: orderForm.couponCategory || 'store',
        couponDiscount: Math.max(0, Number(orderForm.couponDiscount) || 0),
        costBreakdown: {
          materialsCost: Number(orderForm.costBreakdown.materialsCost) || 0,
          laborCost: Number(orderForm.costBreakdown.laborCost) || 0,
          equipmentCost: Number(orderForm.costBreakdown.equipmentCost) || 0,
          packagingCost: Number(orderForm.costBreakdown.packagingCost) || 0,
          commissionsCost: Number(orderForm.costBreakdown.commissionsCost) || 0,
          absorbedShippingCost: Number(orderForm.costBreakdown.absorbedShippingCost) || 0,
          costStatus: orderForm.costBreakdown.costStatus
        }
      };

      let res;
      if (editingOrder) {
        res = await fetch(`/api/admin/orders/${editingOrder.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/admin/orders', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setActionMessage({ text: data.error || 'Error al guardar pedido', type: 'error' });
        return;
      }

      setActionMessage({
        text: editingOrder ? 'Pedido actualizado e historial conservado.' : 'Pedido registrado en el taller.',
        type: 'success'
      });
      setIsOrderModalOpen(false);
      loadAllSalesData();
    } catch (err) {
      console.error(err);
      setActionMessage({ text: 'Error de conexión', type: 'error' });
    }
  };

  const handleDeleteOrder = async (id, num) => {
    if (!window.confirm(`¿Seguro que deseas eliminar el pedido "${num}"?`)) return;

    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setActionMessage({ text: 'Pedido eliminado.', type: 'success' });
        loadAllSalesData();
      } else {
        const data = await res.json();
        setActionMessage({ text: data.error || 'No se pudo eliminar.', type: 'error' });
      }
    } catch (err) {
      setActionMessage({ text: 'Error de conexión', type: 'error' });
    }
  };

  // Quick order status changer
  const handleQuickStatusChange = async (order, newStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        loadAllSalesData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Descontar insumos de taller para un pedido
  const handleDeductOrderMaterials = async (order) => {
    if (!window.confirm(`¿Confirmas que deseas descontar del almacén de taller los insumos para fabricar el pedido #${order.orderNumber}?`)) return;
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ consumeStock: true })
      });
      if (res.ok) {
        setActionMessage({ text: `✓ Insumos de taller descontados para pedido #${order.orderNumber}`, type: 'success' });
        loadAllSalesData();
        setTimeout(() => setActionMessage({ text: '', type: '' }), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Revertir insumos de taller para un pedido
  const handleRevertOrderMaterials = async (order) => {
    if (!window.confirm(`¿Revertir y devolver al almacén de taller los insumos del pedido #${order.orderNumber}?`)) return;
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ revertStock: true })
      });
      if (res.ok) {
        setActionMessage({ text: `✓ Insumos devueltos al almacén de taller para pedido #${order.orderNumber}`, type: 'success' });
        loadAllSalesData();
        setTimeout(() => setActionMessage({ text: '', type: '' }), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------------------------------------------
  // CSV / EXCEL EXPORT
  // -------------------------------------------------------------
  const handleExportCsv = () => {
    if (!reportData || !reportData.rows) return;

    const headers = [
      'Código',
      'Nombre Publicación',
      'Fecha',
      'Red Social',
      'Producto Anunciado',
      'Visitas',
      'Clics WhatsApp',
      'Consultas',
      'Cotizaciones',
      'Pedidos Pagados',
      'Ventas Cobradas (MXN)',
      'Gasto Publicidad (MXN)',
      'CPA Costo x Pedido',
      'Ganancia Neta (MXN)',
      'Tasa Conversión (%)',
      'Clientes Recurrentes',
      'Clientes Nuevos'
    ];

    const escapeCsv = (str) => {
      const val = str === null || str === undefined ? '' : String(str);
      return `"${val.replace(/"/g, '""')}"`;
    };

    const rows = reportData.rows.map(r => [
      escapeCsv(r.code),
      escapeCsv(r.name),
      escapeCsv(r.date),
      escapeCsv(r.socialNetwork),
      escapeCsv(r.productName),
      escapeCsv(r.visits),
      escapeCsv(r.whatsappClicks),
      escapeCsv(r.inquiries),
      escapeCsv(r.quotes),
      escapeCsv(r.paidOrders),
      escapeCsv(r.revenue),
      escapeCsv(r.adSpend),
      escapeCsv(r.cpaLabel),
      escapeCsv(r.hasMissingCosts ? 'Ganancia pendiente de completar' : (r.netProfit !== null ? r.netProfit : 0)),
      escapeCsv(`${r.conversionRate}%`),
      escapeCsv(r.recurringOrders),
      escapeCsv(r.newCustomerOrders)
    ]);

    // Add unassigned row if exists
    if (reportData.unassignedRow && reportData.unassignedRow.totalOrders > 0) {
      const u = reportData.unassignedRow;
      rows.push([
        escapeCsv(u.code),
        escapeCsv(u.name),
        escapeCsv('-'),
        escapeCsv('Directo / Taller'),
        escapeCsv(u.productName),
        escapeCsv(u.visits),
        escapeCsv(u.whatsappClicks),
        escapeCsv(u.inquiries),
        escapeCsv(u.quotes),
        escapeCsv(u.paidOrders),
        escapeCsv(u.revenue),
        escapeCsv(u.adSpend),
        escapeCsv(u.cpaLabel),
        escapeCsv(u.hasMissingCosts ? 'Ganancia pendiente de completar' : (u.netProfit !== null ? u.netProfit : 0)),
        escapeCsv(`${u.conversionRate}%`),
        escapeCsv(u.recurringOrders),
        escapeCsv(u.newCustomerOrders)
      ]);
    }

    // Add Total summary row
    const s = reportData.summary;
    rows.push([
      escapeCsv('TOTALES'),
      escapeCsv('Resumen Global'),
      escapeCsv('-'),
      escapeCsv('-'),
      escapeCsv('-'),
      escapeCsv(s.totalVisits),
      escapeCsv(s.totalWhatsAppClicks),
      escapeCsv(s.totalInquiries),
      escapeCsv(s.totalQuotes),
      escapeCsv(s.totalPaidOrders),
      escapeCsv(s.totalRevenue),
      escapeCsv(s.totalAdSpend),
      escapeCsv(s.globalCpa ? `$${s.globalCpa}` : 'No disponible'),
      escapeCsv(s.anyMissingCost ? 'Ganancia pendiente de completar' : (s.totalNetProfit !== null ? s.totalNetProfit : 0)),
      escapeCsv(`${s.globalConversionRate}%`),
      escapeCsv(s.totalRecurringOrders),
      escapeCsv(s.totalNewCustomerOrders)
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_ventas_publicaciones_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered orders list for Orders sub-tab
  const filteredOrdersList = useMemo(() => {
    return orders.filter(o => {
      if (orderFilterStatus !== 'all' && o.status !== orderFilterStatus) return false;
      if (orderFilterPub !== 'all' && o.pubCode !== orderFilterPub) return false;
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase().trim();
        const matchNum = o.orderNumber?.toLowerCase().includes(q);
        const matchProd = o.productName?.toLowerCase().includes(q);
        const matchPub = o.pubCode?.toLowerCase().includes(q);
        const matchCli = o.customerCode?.toLowerCase().includes(q);
        return matchNum || matchProd || matchPub || matchCli;
      }
      return true;
    });
  }, [orders, orderFilterStatus, orderFilterPub, orderSearch]);

  // Social network badge color helper
  const getNetworkBadge = (net) => {
    const n = (net || '').toLowerCase();
    if (n.includes('insta')) return { label: 'Instagram', bg: 'bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 text-pink-700 border-pink-200' };
    if (n.includes('tik')) return { label: 'TikTok', bg: 'bg-zinc-100 text-zinc-900 border-zinc-300' };
    if (n.includes('face')) return { label: 'Facebook', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (n.includes('what')) return { label: 'WhatsApp', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (n.includes('goog')) return { label: 'Google Ads', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { label: net || 'Red Social', bg: 'bg-gray-100 text-gray-700 border-gray-200' };
  };

  // Order status badge helper
  const getStatusBadge = (st) => {
    switch (st) {
      case 'consulta':
        return { label: 'Consulta', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'cotizado':
        return { label: 'Cotizado', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'confirmado':
        return { label: 'Confirmado', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'pagado':
        return { label: 'Pagado', color: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold' };
      case 'cancelado':
        return { label: 'Cancelado', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      default:
        return { label: st, color: 'bg-gray-50 text-gray-700 border-gray-200' };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#1F2421]">
      
      {/* SECTION HEADER & SUB-TABS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E8E4DA]">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#2D4F3E] text-white">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold font-heading text-[#1F2421] flex items-center gap-2">
                <span>Ventas y Publicaciones</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                  Medición de Campañas & Taller
                </span>
              </h2>
              <p className="text-xs text-gray-500">
                Atribución directa desde publicaciones en redes hasta pedidos pagados y ganancia neta en taller.
              </p>
            </div>
          </div>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-2xl border border-gray-200/80 text-xs font-semibold">
          <button
            onClick={() => setSubTab('report')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
              subTab === 'report' ? 'bg-white text-[#2D4F3E] shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Reporte por Publicación</span>
          </button>

          <button
            onClick={() => setSubTab('publications')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
              subTab === 'publications' ? 'bg-white text-[#2D4F3E] shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Registro de Publicaciones ({publications.length})</span>
          </button>

        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMessage.text && (
        <div className={`p-3.5 rounded-2xl flex items-center justify-between text-xs font-medium border ${
          actionMessage.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-700'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2">
            {actionMessage.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage({ text: '', type: '' })} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. REPORTE POR PUBLICACIÓN                                   */}
      {/* ============================================================ */}
      {subTab === 'report' && (
        <div className="space-y-6">
          
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-[#E8E4DA] shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <Filter className="w-3.5 h-3.5" />
                <span>Filtros:</span>
              </div>

              {/* Date Start */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-gray-500">Desde:</span>
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={e => setFilterStartDate(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-gray-300 bg-white text-xs text-gray-700 focus:outline-none focus:border-[#2D4F3E]"
                />
              </div>

              {/* Date End */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-gray-500">Hasta:</span>
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={e => setFilterEndDate(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-gray-300 bg-white text-xs text-gray-700 focus:outline-none focus:border-[#2D4F3E]"
                />
              </div>

              {/* Social Network Filter */}
              <select
                value={filterNetwork}
                onChange={e => setFilterNetwork(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-gray-300 bg-white text-xs text-gray-700 focus:outline-none focus:border-[#2D4F3E]"
              >
                <option value="all">Todas las redes</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="tiktok">TikTok</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="google">Google Ads</option>
                <option value="otra">Otra red</option>
              </select>

              {/* Product Filter */}
              <select
                value={filterProduct}
                onChange={e => setFilterProduct(e.target.value)}
                className="max-w-[180px] truncate px-2.5 py-1.5 rounded-xl border border-gray-300 bg-white text-xs text-gray-700 focus:outline-none focus:border-[#2D4F3E]"
              >
                <option value="all">Todos los productos</option>
                <option value="general">Catálogo general</option>
                <option value="paquetes">Paquetes & Servicios</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    [{p.code}] {p.name}
                  </option>
                ))}
              </select>

              {(filterStartDate || filterEndDate || filterNetwork !== 'all' || filterProduct !== 'all') && (
                <button
                  onClick={() => {
                    setFilterStartDate('');
                    setFilterEndDate('');
                    setFilterNetwork('all');
                    setFilterProduct('all');
                  }}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1"
                >
                  Limpiar filtros
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCsv}
                disabled={!reportData || reportData.rows?.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#2D4F3E]/30 text-[#2D4F3E] text-xs font-bold hover:bg-[#2D4F3E]/5 transition-colors shadow-xs disabled:opacity-40"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Exportar a Excel (CSV)</span>
              </button>
              <button
                onClick={loadAllSalesData}
                disabled={loading}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                title="Actualizar reporte"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Strict Separation Principle Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-bold text-amber-950">
                Regla de Embudo Estricta:
              </div>
              <p className="text-amber-800 leading-relaxed">
                Un <strong>clic en WhatsApp</strong> registra el interés directo en el catálogo, pero <strong>no se cuenta como conversación recibida ni como venta</strong>. Las consultas, cotizaciones y pedidos pagados se registran y comprueban directamente en el libro de pedidos del taller.
              </p>
            </div>
          </div>

          {/* Top KPI Summary Cards */}
          {reportData && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              
              {/* Visitas */}
              <div className="bg-white p-4 rounded-2xl border border-[#E8E4DA] shadow-xs">
                <div className="text-[11px] font-bold text-gray-500 uppercase">Visitas UTM</div>
                <div className="text-2xl font-black font-heading text-[#1F2421] mt-1">
                  {reportData.summary.totalVisits}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">Llegadas desde enlaces</div>
              </div>

              {/* Clics WA */}
              <div className="bg-white p-4 rounded-2xl border border-[#E8E4DA] shadow-xs">
                <div className="text-[11px] font-bold text-emerald-700 uppercase">Clics WhatsApp</div>
                <div className="text-2xl font-black font-heading text-emerald-800 mt-1">
                  {reportData.summary.totalWhatsAppClicks}
                </div>
                <div className="text-[10px] text-emerald-600/80 mt-0.5">Intención de cotizar</div>
              </div>

              {/* Consultas / Cotizaciones */}
              <div className="bg-white p-4 rounded-2xl border border-[#E8E4DA] shadow-xs">
                <div className="text-[11px] font-bold text-amber-700 uppercase">Consultas & Cotiz.</div>
                <div className="text-2xl font-black font-heading text-amber-800 mt-1">
                  {reportData.summary.totalInquiries} <span className="text-xs text-gray-400 font-normal">/ {reportData.summary.totalQuotes} cotiz.</span>
                </div>
                <div className="text-[10px] text-amber-600 mt-0.5">Recibidas en taller</div>
              </div>

              {/* Pedidos Pagados */}
              <div className="bg-white p-4 rounded-2xl border border-[#E8E4DA] shadow-xs">
                <div className="text-[11px] font-bold text-purple-700 uppercase">Pedidos Pagados</div>
                <div className="text-2xl font-black font-heading text-purple-900 mt-1">
                  {reportData.summary.totalPaidOrders}
                </div>
                <div className="text-[10px] text-purple-600 mt-0.5">
                  Conv: {reportData.summary.globalConversionRate}%
                </div>
              </div>

              {/* Ventas Cobradas */}
              <div className="bg-white p-4 rounded-2xl border border-[#E8E4DA] shadow-xs">
                <div className="text-[11px] font-bold text-[#2D4F3E] uppercase">Ventas Cobradas</div>
                <div className="text-2xl font-black font-heading text-[#2D4F3E] mt-1">
                  ${reportData.summary.totalRevenue.toLocaleString('es-MX')}
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  Gasto pub: ${reportData.summary.totalAdSpend.toLocaleString('es-MX')}
                </div>
              </div>

              {/* Ganancia Neta */}
              <div className={`p-4 rounded-2xl border shadow-xs ${
                reportData.summary.anyMissingCost
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-emerald-50 border-emerald-200'
              }`}>
                <div className="text-[11px] font-bold text-gray-600 uppercase">Ganancia Neta</div>
                <div className="text-lg font-black font-heading mt-1">
                  {reportData.summary.anyMissingCost ? (
                    <span className="text-xs font-bold text-amber-800">
                      Ganancia pendiente de completar
                    </span>
                  ) : (
                    <span className="text-2xl text-emerald-900">
                      ${(reportData.summary.totalNetProfit || 0).toLocaleString('es-MX')}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  {reportData.summary.anyMissingCost ? 'Faltan costos de pedidos' : 'Tras costos y publicidad'}
                </div>
              </div>

            </div>
          )}

          {/* Customer Recurrence Insight (Without PII) */}
          {reportData && (
            <div className="bg-white p-4 rounded-2xl border border-[#E8E4DA] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1F2421]">
                    Identificación de Clientes Recurrentes (Sin datos personales en reporte general)
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Se detectan pedidos de clientes anteriores mediante identificadores anonimizados (CLI-XXXX) respetando su privacidad.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-900 border border-purple-200">
                  <span className="font-extrabold text-sm mr-1">{reportData.summary.totalRecurringOrders}</span>
                  <span>Pedidos Recurrentes</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-900 border border-blue-200">
                  <span className="font-extrabold text-sm mr-1">{reportData.summary.totalNewCustomerOrders}</span>
                  <span>Clientes Nuevos</span>
                </div>
              </div>
            </div>
          )}

          {/* Simple Visual Distribution Chart (Bar comparison of Performance) */}
          {reportData && reportData.rows?.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-[#E8E4DA] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#2D4F3E]" />
                  <h3 className="text-sm font-extrabold font-heading text-[#1F2421]">
                    Comparativa de Rendimiento por Publicación
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-gray-500 font-semibold">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#2D4F3E]"></span> Ventas
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span> Gasto Pub
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> Ganancia Neta
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {reportData.rows.map(row => {
                  const maxVal = Math.max(1, ...reportData.rows.map(r => Math.max(r.revenue, r.adSpend, r.netProfit || 0)));
                  const revWidth = Math.min(100, Math.round((row.revenue / maxVal) * 100));
                  const spendWidth = Math.min(100, Math.round((row.adSpend / maxVal) * 100));
                  const profitWidth = Math.min(100, Math.round((Math.max(0, row.netProfit || 0) / maxVal) * 100));

                  return (
                    <div key={row.id} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="truncate max-w-[280px] font-mono text-[#2D4F3E]">
                          [{row.code}] {row.name}
                        </span>
                        <div className="flex items-center gap-3 text-[11px]">
                          <span>Ventas: <strong>${row.revenue.toLocaleString('es-MX')}</strong></span>
                          <span>Gasto: <strong>${row.adSpend.toLocaleString('es-MX')}</strong></span>
                          <span>
                            Ganancia:{' '}
                            {row.hasMissingCosts ? (
                              <strong className="text-amber-700">Pendiente</strong>
                            ) : (
                              <strong className="text-emerald-700">${(row.netProfit || 0).toLocaleString('es-MX')}</strong>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Bars */}
                      <div className="space-y-1 bg-gray-50 p-2 rounded-xl border border-gray-100">
                        {/* Revenue bar */}
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="w-12 text-gray-500 shrink-0">Venta</span>
                          <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-[#2D4F3E] h-full rounded-full transition-all duration-500" style={{ width: `${revWidth}%` }}></div>
                          </div>
                        </div>
                        {/* Ad spend bar */}
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="w-12 text-gray-500 shrink-0">Gasto</span>
                          <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${spendWidth}%` }}></div>
                          </div>
                        </div>
                        {/* Profit bar */}
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="w-12 text-gray-500 shrink-0">Ganancia</span>
                          <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${profitWidth}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Comparative Performance Table */}
          <div className="bg-white rounded-2xl border border-[#E8E4DA] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#E8E4DA] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold font-heading text-[#1F2421]">
                  Tabla Comparativa por Publicación
                </h3>
                <p className="text-[11px] text-gray-500">
                  Desglose completo de embudo, ingresos, costos atribuidos y retorno publicitario.
                </p>
              </div>
              <button
                onClick={handleOpenNewPubModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2D4F3E] text-white text-xs font-bold hover:bg-[#20392C] transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nueva Publicación</span>
              </button>
            </div>

            {reportData && reportData.rows?.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 mx-auto flex items-center justify-center">
                  <Megaphone className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-gray-700 font-heading">
                  No hay publicaciones registradas aún
                </h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Para medir cuáles publicaciones generan ventas y pedidos en tu taller, crea tu primera publicación con enlace de seguimiento.
                </p>
                <button
                  onClick={handleOpenNewPubModal}
                  className="px-4 py-2 rounded-xl bg-[#2D4F3E] text-white text-xs font-bold hover:bg-[#20392C] transition-all shadow-md inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear Primera Publicación</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3">Publicación</th>
                      <th className="py-3 px-3">Red</th>
                      <th className="py-3 px-3">Producto</th>
                      <th className="py-3 px-2 text-center">Visitas</th>
                      <th className="py-3 px-2 text-center">WA Clics</th>
                      <th className="py-3 px-2 text-center">Consultas</th>
                      <th className="py-3 px-2 text-center">Cotiz.</th>
                      <th className="py-3 px-2 text-center">Pedidos</th>
                      <th className="py-3 px-3 text-right">Ventas</th>
                      <th className="py-3 px-3 text-right">Gasto</th>
                      <th className="py-3 px-3 text-right">CPA x Pedido</th>
                      <th className="py-3 px-3 text-right">Ganancia Neta</th>
                      <th className="py-3 px-2 text-center">Conv. %</th>
                      <th className="py-3 px-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reportData?.rows.map(row => {
                      const netBadge = getNetworkBadge(row.socialNetwork);
                      const utmLink = generateUtmLink(row);

                      return (
                        <tr key={row.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-3 px-3 font-semibold">
                            <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#2D4F3E]">
                              <span>{row.code}</span>
                            </div>
                            <div className="text-gray-900 font-medium truncate max-w-[170px]" title={row.name}>
                              {row.name}
                            </div>
                            <div className="text-[10px] text-gray-400">{row.date}</div>
                          </td>

                          <td className="py-3 px-3">
                            <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold border ${netBadge.bg}`}>
                              {netBadge.label}
                            </span>
                          </td>

                          <td className="py-3 px-3 max-w-[140px] truncate text-gray-700" title={row.productName}>
                            {row.productName}
                          </td>

                          <td className="py-3 px-2 text-center font-bold text-gray-700">
                            {row.visits}
                          </td>

                          <td className="py-3 px-2 text-center font-bold text-emerald-700">
                            {row.whatsappClicks}
                          </td>

                          <td className="py-3 px-2 text-center text-gray-600">
                            {row.inquiries}
                          </td>

                          <td className="py-3 px-2 text-center text-gray-600">
                            {row.quotes}
                          </td>

                          <td className="py-3 px-2 text-center">
                            <div className="font-extrabold text-purple-900">{row.paidOrders}</div>
                            {row.paidOrders > 0 && (
                              <div className="text-[9px] text-gray-400">
                                {row.recurringOrders} recurr.
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-3 text-right font-extrabold text-[#2D4F3E]">
                            ${row.revenue.toLocaleString('es-MX')}
                          </td>

                          <td className="py-3 px-3 text-right font-semibold text-gray-700">
                            ${row.adSpend.toLocaleString('es-MX')}
                          </td>

                          <td className="py-3 px-3 text-right">
                            {row.cpaLabel === 'No disponible' ? (
                              <span className="text-[10px] text-gray-400 italic">No disponible</span>
                            ) : (
                              <span className="font-semibold text-gray-800">{row.cpaLabel}</span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-right">
                            {row.hasMissingCosts ? (
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                Ganancia pendiente de completar
                              </span>
                            ) : (
                              <span className={`font-black ${row.netProfit >= 0 ? 'text-emerald-800' : 'text-rose-700'}`}>
                                ${(row.netProfit || 0).toLocaleString('es-MX')}
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-2 text-center">
                            <span className="font-bold text-gray-700">{row.conversionRate}%</span>
                          </td>

                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleCopyLink(utmLink)}
                                className="p-1.5 rounded-lg text-gray-500 hover:text-[#2D4F3E] hover:bg-emerald-50 transition-colors"
                                title="Copiar enlace con UTMs"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              {row.postUrl && (
                                <a
                                  href={row.postUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                  title="Ver publicación original en red social"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <button
                                onClick={() => handleOpenEditPubModal(row)}
                                className="p-1.5 rounded-lg text-gray-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                                title="Editar publicación"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Unassigned / Direct Taller Row */}
                    {reportData?.unassignedRow && reportData.unassignedRow.totalOrders > 0 && (
                      <tr className="bg-amber-50/30 border-t border-amber-100">
                        <td className="py-3 px-3 font-semibold">
                          <span className="font-mono text-[11px] text-amber-900 bg-amber-100/60 px-1.5 py-0.5 rounded">
                            {reportData.unassignedRow.code}
                          </span>
                          <div className="text-gray-900 font-medium text-xs">
                            {reportData.unassignedRow.name}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[10px] text-gray-500 italic">Directo</span>
                        </td>
                        <td className="py-3 px-3 text-gray-500 text-[11px]">Varios</td>
                        <td className="py-3 px-2 text-center text-gray-600">{reportData.unassignedRow.visits}</td>
                        <td className="py-3 px-2 text-center text-emerald-700">{reportData.unassignedRow.whatsappClicks}</td>
                        <td className="py-3 px-2 text-center">{reportData.unassignedRow.inquiries}</td>
                        <td className="py-3 px-2 text-center">{reportData.unassignedRow.quotes}</td>
                        <td className="py-3 px-2 text-center font-bold text-purple-900">{reportData.unassignedRow.paidOrders}</td>
                        <td className="py-3 px-3 text-right font-bold text-[#2D4F3E]">
                          ${reportData.unassignedRow.revenue.toLocaleString('es-MX')}
                        </td>
                        <td className="py-3 px-3 text-right text-gray-500">$0</td>
                        <td className="py-3 px-3 text-right text-[10px] text-gray-400 italic">No disponible</td>
                        <td className="py-3 px-3 text-right">
                          {reportData.unassignedRow.hasMissingCosts ? (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              Ganancia pendiente de completar
                            </span>
                          ) : (
                            <span className="font-bold text-emerald-800">
                              ${(reportData.unassignedRow.netProfit || 0).toLocaleString('es-MX')}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-center font-semibold">{reportData.unassignedRow.conversionRate}%</td>
                        <td className="py-3 px-3 text-center text-[10px] text-gray-400 italic">Atrib. Taller</td>
                      </tr>
                    )}
                  </tbody>

                  {/* Summary Totals Footer */}
                  {reportData?.summary && (
                    <tfoot>
                      <tr className="bg-gray-100/80 font-black text-gray-900 border-t-2 border-gray-300">
                        <td className="py-3.5 px-3 uppercase text-[11px] tracking-wider" colSpan={3}>
                          TOTALES FILTRADOS
                        </td>
                        <td className="py-3.5 px-2 text-center">{reportData.summary.totalVisits}</td>
                        <td className="py-3.5 px-2 text-center text-emerald-800">{reportData.summary.totalWhatsAppClicks}</td>
                        <td className="py-3.5 px-2 text-center">{reportData.summary.totalInquiries}</td>
                        <td className="py-3.5 px-2 text-center">{reportData.summary.totalQuotes}</td>
                        <td className="py-3.5 px-2 text-center text-purple-900">{reportData.summary.totalPaidOrders}</td>
                        <td className="py-3.5 px-3 text-right text-[#2D4F3E] text-sm">
                          ${reportData.summary.totalRevenue.toLocaleString('es-MX')}
                        </td>
                        <td className="py-3.5 px-3 text-right text-sm">
                          ${reportData.summary.totalAdSpend.toLocaleString('es-MX')}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          {reportData.summary.globalCpa ? `$${reportData.summary.globalCpa}` : 'No disponible'}
                        </td>
                        <td className="py-3.5 px-3 text-right text-sm">
                          {reportData.summary.anyMissingCost ? (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100/60 px-2 py-0.5 rounded-md border border-amber-300">
                              Ganancia pendiente de completar
                            </span>
                          ) : (
                            <span className="text-emerald-900">
                              ${(reportData.summary.totalNetProfit || 0).toLocaleString('es-MX')}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-2 text-center">{reportData.summary.globalConversionRate}%</td>
                        <td className="py-3.5 px-3"></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* 2. REGISTRO DE PUBLICACIONES                                 */}
      {/* ============================================================ */}
      {subTab === 'publications' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E8E4DA] shadow-xs">
            <div>
              <h3 className="text-sm font-extrabold font-heading text-[#1F2421]">
                Catálogo de Publicaciones & Enlaces con UTM
              </h3>
              <p className="text-xs text-gray-500">
                Crea publicaciones con código único y genera el enlace con parámetros UTM para rastrear el origen exacto de cada venta.
              </p>
            </div>
            <button
              onClick={handleOpenNewPubModal}
              className="px-4 py-2 rounded-xl bg-[#2D4F3E] text-white text-xs font-bold hover:bg-[#20392C] transition-all shadow-md inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Publicación</span>
            </button>
          </div>

          {publications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E8E4DA] p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 mx-auto flex items-center justify-center">
                <Tag className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-gray-700 font-heading">
                Sin publicaciones registradas
              </h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                No hay publicaciones registradas todavía. Crea la primera para generar su código único y enlace de seguimiento con UTM.
              </p>
              <button
                onClick={handleOpenNewPubModal}
                className="px-4 py-2 rounded-xl bg-[#2D4F3E] text-white text-xs font-bold hover:bg-[#20392C] transition-all shadow-md inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Publicación</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {publications.map(pub => {
                const netBadge = getNetworkBadge(pub.socialNetwork);
                const utmLink = generateUtmLink(pub);

                return (
                  <div key={pub.id} className="bg-white rounded-2xl border border-[#E8E4DA] p-4.5 shadow-xs flex flex-col justify-between space-y-3 hover:border-[#2D4F3E]/40 transition-all">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-extrabold text-[#2D4F3E] bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                          {pub.code}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${netBadge.bg}`}>
                          {netBadge.label}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-gray-900 leading-snug">
                          {pub.name}
                        </h4>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          Fecha: {pub.date} · Gasto: <strong>${(pub.adSpend || 0).toLocaleString('es-MX')} MXN</strong>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-[11px] space-y-1">
                        <div className="text-gray-500">
                          <strong>Producto:</strong> {pub.productName}
                        </div>
                        {pub.notes && (
                          <div className="text-gray-500 truncate" title={pub.notes}>
                            <strong>Notas:</strong> {pub.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* UTM Link Box */}
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-gray-600">Enlace de Seguimiento (UTM):</span>
                        <button
                          onClick={() => handleCopyLink(utmLink)}
                          className="text-[#2D4F3E] hover:text-[#20392C] font-bold flex items-center gap-1 text-[11px]"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copiar</span>
                        </button>
                      </div>

                      <div className="p-2 rounded-xl bg-gray-100/70 border border-gray-200 text-[10px] font-mono text-gray-600 truncate select-all">
                        {utmLink}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        {pub.postUrl ? (
                          <a
                            href={pub.postUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Ver post original</span>
                          </a>
                        ) : (
                          <span className="text-[11px] text-gray-400">Sin URL externa</span>
                        )}

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditPubModal(pub)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-amber-700 hover:bg-amber-50"
                            title="Editar"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePublication(pub.id, pub.name)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-rose-700 hover:bg-rose-50"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. LIBRO DE PEDIDOS Y TALLER                                 */}
      {/* ============================================================ */}
      {subTab === 'orders' && (
        <div className="space-y-5">
          <div className="bg-white p-4 rounded-2xl border border-[#E8E4DA] shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase">
                <Filter className="w-3.5 h-3.5" />
                <span>Filtrar pedidos:</span>
              </div>

              {/* Status filter */}
              <select
                value={orderFilterStatus}
                onChange={e => setOrderFilterStatus(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-gray-300 bg-white text-xs text-gray-700 focus:outline-none focus:border-[#2D4F3E]"
              >
                <option value="all">Todos los estados</option>
                <option value="consulta">Consulta</option>
                <option value="cotizado">Cotizado</option>
                <option value="confirmado">Confirmado</option>
                <option value="pagado">Pagado</option>
                <option value="cancelado">Cancelado</option>
              </select>

              {/* Publication origin filter */}
              <select
                value={orderFilterPub}
                onChange={e => setOrderFilterPub(e.target.value)}
                className="max-w-[200px] truncate px-2.5 py-1.5 rounded-xl border border-gray-300 bg-white text-xs text-gray-700 focus:outline-none focus:border-[#2D4F3E]"
              >
                <option value="all">Cualquier origen</option>
                <option value="desconocido">Desconocido / Taller directo</option>
                {publications.map(p => (
                  <option key={p.id} value={p.code}>
                    [{p.code}] {p.name}
                  </option>
                ))}
              </select>

              {/* Search */}
              <input
                type="text"
                placeholder="Buscar por folio, cliente, notas..."
                value={orderSearch}
                onChange={e => setOrderSearch(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-gray-300 bg-white text-xs text-gray-700 focus:outline-none focus:border-[#2D4F3E] w-56"
              />
            </div>

            <button
              onClick={handleOpenNewOrderModal}
              className="px-4 py-2 rounded-xl bg-[#2D4F3E] text-white text-xs font-bold hover:bg-[#20392C] transition-all shadow-md inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Pedido</span>
            </button>
          </div>

          {/* Resumen rápido del libro de pedidos */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-[#E8E4DA] shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Pedidos registrados</span>
                <ShoppingBag className="w-4 h-4 text-[#2D4F3E]" />
              </div>
              <div className="text-2xl font-black font-heading text-[#1F2421] mt-1">{orders.length}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">
                {orders.filter(o => !['pagado', 'cancelado'].includes(o.status)).length} por atender
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E8E4DA] shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Cobrado</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black font-heading text-emerald-800 mt-1">
                ${orders.filter(o => o.status === 'pagado').reduce((sum, o) => sum + (Number(o.amount) || 0), 0).toLocaleString('es-MX')}
              </div>
              <div className="text-[10px] text-emerald-600/80 mt-0.5">
                {orders.filter(o => o.status === 'pagado').length} pedido(s) pagado(s)
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E8E4DA] shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Por cobrar</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black font-heading text-amber-800 mt-1">
                ${orders.filter(o => ['cotizado', 'confirmado'].includes(o.status)).reduce((sum, o) => sum + (Number(o.amount) || 0), 0).toLocaleString('es-MX')}
              </div>
              <div className="text-[10px] text-amber-600/80 mt-0.5">
                Cotizaciones y pedidos confirmados
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E8E4DA] shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D4F3E]">Margen estimado</span>
                <TrendingUp className="w-4 h-4 text-[#2D4F3E]" />
              </div>
              <div className="text-2xl font-black font-heading text-[#2D4F3E] mt-1">
                ${orders.reduce((sum, o) => {
                  if (!o.hasCosts || o.totalCost === null || o.totalCost === undefined) return sum;
                  return sum + Math.max(0, (Number(o.amount) || 0) - (Number(o.totalCost) || 0));
                }, 0).toLocaleString('es-MX')}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">
                Solo pedidos con costos de taller
              </div>
            </div>
          </div>

          {filteredOrdersList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E8E4DA] p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 mx-auto flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-gray-700 font-heading">
                No hay pedidos en esta vista
              </h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Registra manualmente pedidos recibidos por WhatsApp o en el taller para llevar el control de producción, costos e historial inmutable.
              </p>
              <button
                onClick={handleOpenNewOrderModal}
                className="px-4 py-2 rounded-xl bg-[#2D4F3E] text-white text-xs font-bold hover:bg-[#20392C] transition-all shadow-md inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Nuevo Pedido</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E8E4DA] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3">Folio & Fecha</th>
                      <th className="py-3 px-3">Origen (Publicación)</th>
                      <th className="py-3 px-3">Cliente</th>
                      <th className="py-3 px-3">Producto / Cantidad</th>
                      <th className="py-3 px-3 text-right">Importe</th>
                      <th className="py-3 px-3 text-center">Estado</th>
                      <th className="py-3 px-3 text-right">Costos Taller</th>
                      <th className="py-3 px-3 text-right">Margen</th>
                      <th className="py-3 px-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredOrdersList.map(ord => {
                      const stBadge = getStatusBadge(ord.status);
                      const hasCost = ord.hasCosts && ord.totalCost !== null;
                      const profit = hasCost ? (ord.amount - ord.totalCost) : null;
                      const marginPct = (hasCost && ord.amount > 0) ? Math.round((profit / ord.amount) * 100) : null;

                      return (
                        <tr key={ord.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-mono font-bold text-gray-900">{ord.orderNumber}</div>
                            <div className="text-[10px] text-gray-400">{ord.date}</div>
                          </td>

                          <td className="py-3 px-3">
                            {ord.pubCode === 'desconocido' ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-semibold border border-gray-200">
                                Desconocido / Taller
                              </span>
                            ) : (
                              <span className="font-mono text-[11px] font-bold text-[#2D4F3E] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                {ord.pubCode}
                              </span>
                            )}
                            {ord.firstTouchPubCode && ord.firstTouchPubCode !== ord.pubCode && (
                              <div className="text-[9px] text-gray-400 mt-0.5" title="Primer origen conocido">
                                1er contacto: {ord.firstTouchPubCode}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5 font-mono text-[11px] text-gray-700">
                              <span>{ord.customerCode || 'Anónimo'}</span>
                              {ord.isRecurringCustomer && (
                                <span className="text-[9px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded-full font-bold">
                                  Recurrente
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <div className="font-semibold text-gray-900 truncate max-w-[200px]" title={ord.productName}>
                              {ord.productName}
                            </div>
                            <div className="text-[10px] text-gray-400">
                              Cant: {ord.quantity} pza(s)
                            </div>
                          </td>

                          <td className="py-3 px-3 text-right">
                            <div className="font-black text-[#2D4F3E]">
                              ${(ord.amount || 0).toLocaleString('es-MX')}
                            </div>
                            {ord.couponCode && (
                              <div className="mt-1 flex items-center justify-end">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border inline-flex items-center gap-1 ${
                                  ord.couponCategory === 'arcade'
                                    ? 'bg-purple-50 text-purple-800 border-purple-200'
                                    : 'bg-blue-50 text-blue-800 border-blue-200'
                                }`} title={`Cupón ${ord.couponCode} (${ord.couponCategory === 'arcade' ? 'Monedas Arcade' : 'Código Tienda'})`}>
                                  <span>{ord.couponCategory === 'arcade' ? '🎮' : '🏷️'}</span>
                                  <span className="font-mono">{ord.couponCode}</span>
                                  {ord.couponDiscount > 0 && <span>(-${ord.couponDiscount})</span>}
                                </span>
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-3 text-center">
                            <select
                              value={ord.status}
                              onChange={e => handleQuickStatusChange(ord, e.target.value)}
                              className={`text-[10px] font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${stBadge.color}`}
                            >
                              <option value="consulta">Consulta</option>
                              <option value="cotizado">Cotizado</option>
                              <option value="confirmado">Confirmado</option>
                              <option value="pagado">Pagado</option>
                              <option value="cancelado">Cancelado</option>
                            </select>

                            {ord.materialsDeducted ? (
                              <div className="mt-1 flex flex-col items-center gap-0.5">
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[8.5px] font-bold border border-emerald-300">
                                  <span>✓</span>
                                  <span>Insumos Taller Descontados</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRevertOrderMaterials(ord)}
                                  className="text-[8px] text-gray-400 hover:text-amber-700 underline cursor-pointer"
                                  title="Revertir y devolver stock a taller"
                                >
                                  Revertir insumos
                                </button>
                              </div>
                            ) : (
                              ord.status !== 'cancelado' && (
                                <div className="mt-1 flex justify-center">
                                  <button
                                    type="button"
                                    onClick={() => handleDeductOrderMaterials(ord)}
                                    className="px-1.5 py-0.5 rounded-md bg-stone-100 hover:bg-emerald-50 text-gray-600 hover:text-emerald-800 border border-stone-200 hover:border-emerald-300 text-[8.5px] font-bold flex items-center gap-0.5 cursor-pointer transition-colors"
                                    title="Descontar insumos exactos del stock de taller para este pedido"
                                  >
                                    <span>🔨</span>
                                    <span>Descontar Stock</span>
                                  </button>
                                </div>
                              )
                            )}
                          </td>

                          <td className="py-3 px-3 text-right">
                            {hasCost ? (
                              <div>
                                <span className="font-semibold text-gray-800">
                                  ${ord.totalCost.toLocaleString('es-MX')}
                                </span>
                                <div className="text-[9px] text-gray-400">
                                  {ord.costBreakdown?.costStatus === 'comprobado' ? 'Comprobado' : 'Estimado'}
                                </div>
                              </div>
                            ) : (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                Sin costos
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-right">
                            {profit !== null ? (
                              <div>
                                <span className={`font-bold ${profit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                  ${profit.toLocaleString('es-MX')}
                                </span>
                                <div className="text-[10px] text-gray-400">{marginPct}%</div>
                              </div>
                            ) : (
                              <span className="text-[10px] text-gray-400">-</span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleOpenEditOrderModal(ord)}
                                className="p-1.5 rounded-lg text-gray-500 hover:text-amber-700 hover:bg-amber-50"
                                title="Editar pedido & costos"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteOrder(ord.id, ord.orderNumber)}
                                className="p-1.5 rounded-lg text-gray-500 hover:text-rose-700 hover:bg-rose-50"
                                title="Eliminar pedido"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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

      {/* ============================================================ */}
      {/* MODAL: CREAR / EDITAR PUBLICACIÓN                            */}
      {/* ============================================================ */}
      {isPubModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-[#E8E4DA] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-5 py-4 bg-[#1F2421] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold font-heading">
                  {editingPub ? 'Editar Publicación' : 'Registrar Nueva Publicación'}
                </h3>
              </div>
              <button onClick={() => setIsPubModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePublication} className="p-5 overflow-y-auto space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                {/* Unique Code */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Código Único *
                  </label>
                  <input
                    type="text"
                    required
                    value={pubForm.code}
                    onChange={e => setPubForm({ ...pubForm, code: e.target.value.toUpperCase() })}
                    placeholder="PUB-IG-001"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono font-bold uppercase focus:border-[#2D4F3E] focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-400">Identificador en WhatsApp y UTM</span>
                </div>

                {/* Date */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    required
                    value={pubForm.date}
                    onChange={e => setPubForm({ ...pubForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[#2D4F3E] focus:outline-none"
                  />
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Nombre o Título de la Publicación *
                </label>
                <input
                  type="text"
                  required
                  value={pubForm.name}
                  onChange={e => setPubForm({ ...pubForm, name: e.target.value })}
                  placeholder="ej. Reel Llaveros Polaroid Día de las Madres"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[#2D4F3E] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Social Network */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Red Social *
                  </label>
                  <select
                    value={pubForm.socialNetwork}
                    onChange={e => setPubForm({ ...pubForm, socialNetwork: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[#2D4F3E] focus:outline-none"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="tiktok">TikTok</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="google">Google Ads</option>
                    <option value="youtube">YouTube</option>
                    <option value="otra">Otra red</option>
                  </select>
                </div>

                {/* Ad Spend */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Gasto en Publicidad ($ MXN)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 font-bold">$</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={pubForm.adSpend}
                      onChange={e => setPubForm({ ...pubForm, adSpend: e.target.value })}
                      placeholder="0"
                      className="w-full pl-7 pr-3 py-2 rounded-xl border border-gray-300 font-bold focus:border-[#2D4F3E] focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-gray-400">Permite $0 para orgánico</span>
                </div>
              </div>

              {/* Product Announced */}
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Producto o Servicio Anunciado
                </label>
                <select
                  value={pubForm.productId}
                  onChange={e => {
                    const selectedId = e.target.value;
                    let pName = 'General / Catálogo de la tienda';
                    if (selectedId === 'paquetes') {
                      pName = 'Paquetes & Servicios para Eventos';
                    } else if (selectedId !== 'general') {
                      const found = products.find(p => p.id === selectedId);
                      if (found) pName = found.name;
                    }
                    setPubForm({ ...pubForm, productId: selectedId, productName: pName });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[#2D4F3E] focus:outline-none"
                >
                  <option value="general">General / Catálogo de la tienda</option>
                  <option value="paquetes">Paquetes & Servicios para Eventos</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.code}] {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* External Post URL */}
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Enlace a la Publicación Original (URL en la red social)
                </label>
                <input
                  type="url"
                  value={pubForm.postUrl}
                  onChange={e => setPubForm({ ...pubForm, postUrl: e.target.value })}
                  placeholder="https://instagram.com/reel/..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[#2D4F3E] focus:outline-none"
                />
              </div>

              {/* Generated UTM Link Preview */}
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-950 flex items-center gap-1">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Enlace con Parámetros UTM Generado:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(generateUtmLink(pubForm))}
                    className="text-xs text-[#2D4F3E] hover:text-[#20392C] font-extrabold flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-emerald-300 shadow-2xs"
                  >
                    {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedLink ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
                <div className="p-2 rounded-xl bg-white text-[10px] font-mono text-emerald-900 border border-emerald-100 break-all select-all">
                  {generateUtmLink(pubForm)}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Notas de Campaña / Audiencia
                </label>
                <textarea
                  rows="2"
                  value={pubForm.notes}
                  onChange={e => setPubForm({ ...pubForm, notes: e.target.value })}
                  placeholder="Audiencia, presupuesto diario, copy utilizado..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[#2D4F3E] focus:outline-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#2D4F3E] text-white text-xs font-bold hover:bg-[#20392C] active:scale-98 transition-all shadow-md"
                >
                  {editingPub ? 'Guardar Cambios' : 'Crear Publicación y Generar UTM'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: REGISTRAR / EDITAR PEDIDO                             */}
      {/* ============================================================ */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-3xl border border-[#E8E4DA] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            <div className="px-5 py-4 bg-[#1F2421] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold font-heading">
                  {editingOrder ? 'Editar Pedido y Costos Inmutables' : 'Registrar Pedido en Taller'}
                </h3>
              </div>
              <button onClick={() => setIsOrderModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveOrder} className="p-5 overflow-y-auto space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                {/* Order Number */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Número de Pedido *
                  </label>
                  <input
                    type="text"
                    required
                    value={orderForm.orderNumber}
                    onChange={e => setOrderForm({ ...orderForm, orderNumber: e.target.value.toUpperCase() })}
                    placeholder="PED-2026-001"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono font-bold uppercase focus:border-[#2D4F3E] focus:outline-none"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    required
                    value={orderForm.date}
                    onChange={e => setOrderForm({ ...orderForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[#2D4F3E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Publication Source */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Publicación de Origen *
                  </label>
                  <select
                    value={orderForm.pubCode}
                    onChange={e => setOrderForm({ ...orderForm, pubCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono text-xs focus:border-[#2D4F3E] focus:outline-none"
                  >
                    <option value="desconocido">Desconocido / Taller directo</option>
                    {publications.map(p => (
                      <option key={p.id} value={p.code}>
                        [{p.code}] {p.name}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-gray-400">Atribución de la venta (unívoca)</span>
                </div>

                {/* Status */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Estado del Pedido *
                  </label>
                  <select
                    value={orderForm.status}
                    onChange={e => setOrderForm({ ...orderForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-bold focus:border-[#2D4F3E] focus:outline-none"
                  >
                    <option value="consulta">Consulta (sin cotización formal)</option>
                    <option value="cotizado">Cotizado (presupuesto enviado)</option>
                    <option value="confirmado">Confirmado (anticipo/diseño)</option>
                    <option value="pagado">Pagado (liquidado al 100%)</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              {/* Product and Customer */}
              <div className="grid grid-cols-2 gap-3">
                {/* Product Name */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Producto o Servicio *
                  </label>
                  <input
                    type="text"
                    required
                    value={orderForm.productName}
                    onChange={e => setOrderForm({ ...orderForm, productName: e.target.value })}
                    placeholder="Llavero Polaroid / Letrero..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[#2D4F3E] focus:outline-none"
                  />
                </div>

                {/* Customer Code / Phone */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Código o Teléfono de Cliente
                  </label>
                  <input
                    type="text"
                    value={orderForm.customerCode}
                    onChange={e => setOrderForm({ ...orderForm, customerCode: e.target.value })}
                    placeholder="CLI-8795 o últimos dígitos"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono focus:border-[#2D4F3E] focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-400">Se anonimiza para detectar recurrencia</span>
                </div>
              </div>

              {/* Quantity & Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Cantidad (piezas) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={orderForm.quantity}
                    onChange={e => setOrderForm({ ...orderForm, quantity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-bold focus:border-[#2D4F3E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Importe Cobrado ($ MXN) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 font-bold">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      required
                      value={orderForm.amount}
                      onChange={e => setOrderForm({ ...orderForm, amount: e.target.value })}
                      placeholder="0"
                      className="w-full pl-7 pr-3 py-2 rounded-xl border border-gray-300 font-bold text-base focus:border-[#2D4F3E] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Cupón de Descuento Aplicado */}
              <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <span>🎟️</span>
                    <span>Cupón o Código Utilizado (Monitoreo)</span>
                  </label>
                  {orderForm.couponCode && (
                    <span className="text-[10px] font-bold text-[#2D4F3E] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Cupón Vinculado
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Código:</label>
                    <input
                      type="text"
                      placeholder="Ej. ARCADE5 o BUENFIN"
                      value={orderForm.couponCode}
                      onChange={e => setOrderForm({ ...orderForm, couponCode: e.target.value.toUpperCase().replace(/\s+/g, '') })}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-gray-300 font-mono text-xs font-bold bg-white focus:outline-none focus:border-[#2D4F3E]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Tipo de Cupón:</label>
                    <select
                      value={orderForm.couponCategory}
                      onChange={e => setOrderForm({ ...orderForm, couponCategory: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-xl border border-gray-300 text-xs bg-white focus:outline-none focus:border-[#2D4F3E]"
                    >
                      <option value="store">🏷️ Código Tienda</option>
                      <option value="arcade">🎮 Monedas Arcade</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Descuento ($ MXN):</label>
                    <input
                      type="number"
                      min="0"
                      value={orderForm.couponDiscount}
                      onChange={e => setOrderForm({ ...orderForm, couponDiscount: e.target.value })}
                      placeholder="0"
                      className="w-full px-2.5 py-1.5 rounded-xl border border-gray-300 text-xs font-bold bg-white focus:outline-none focus:border-[#2D4F3E]"
                    />
                  </div>
                </div>
              </div>

              {/* Cost Breakdown Section (Immutable snapshot for historical integrity) */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-xs text-gray-800">
                      Desglose de Costos de Taller (Inmutable)
                    </span>
                    <p className="text-[10px] text-gray-500">
                      Se conserva en el pedido para que cambios de tarifas no alteren su historial.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-gray-700">
                      <input
                        type="checkbox"
                        checked={orderForm.hasCosts}
                        onChange={e => setOrderForm({ ...orderForm, hasCosts: e.target.checked })}
                        className="rounded text-[#2D4F3E]"
                      />
                      <span>Costos capturados</span>
                    </label>
                  </div>
                </div>

                {orderForm.hasCosts ? (
                  <div className="space-y-3 pt-2">
                    {/* Cost Status: Estimado vs Comprobado */}
                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-bold text-gray-600">Tipo de costo:</span>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="costStatus"
                          value="estimado"
                          checked={orderForm.costBreakdown.costStatus === 'estimado'}
                          onChange={() => setOrderForm({
                            ...orderForm,
                            costBreakdown: { ...orderForm.costBreakdown, costStatus: 'estimado' }
                          })}
                        />
                        <span>Estimado</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="costStatus"
                          value="comprobado"
                          checked={orderForm.costBreakdown.costStatus === 'comprobado'}
                          onChange={() => setOrderForm({
                            ...orderForm,
                            costBreakdown: { ...orderForm.costBreakdown, costStatus: 'comprobado' }
                          })}
                        />
                        <span>Comprobado (Real)</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {/* Materiales */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">
                          Materiales
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={orderForm.costBreakdown.materialsCost}
                          onChange={e => setOrderForm({
                            ...orderForm,
                            costBreakdown: { ...orderForm.costBreakdown, materialsCost: e.target.value }
                          })}
                          className="w-full px-2 py-1.5 rounded-lg border border-gray-300 bg-white"
                        />
                      </div>

                      {/* Mano de obra */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">
                          Mano de obra
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={orderForm.costBreakdown.laborCost}
                          onChange={e => setOrderForm({
                            ...orderForm,
                            costBreakdown: { ...orderForm.costBreakdown, laborCost: e.target.value }
                          })}
                          className="w-full px-2 py-1.5 rounded-lg border border-gray-300 bg-white"
                        />
                      </div>

                      {/* Equipo / Desgaste */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">
                          Equipo / Desgaste
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={orderForm.costBreakdown.equipmentCost}
                          onChange={e => setOrderForm({
                            ...orderForm,
                            costBreakdown: { ...orderForm.costBreakdown, equipmentCost: e.target.value }
                          })}
                          className="w-full px-2 py-1.5 rounded-lg border border-gray-300 bg-white"
                        />
                      </div>

                      {/* Empaque */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">
                          Empaque
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={orderForm.costBreakdown.packagingCost}
                          onChange={e => setOrderForm({
                            ...orderForm,
                            costBreakdown: { ...orderForm.costBreakdown, packagingCost: e.target.value }
                          })}
                          className="w-full px-2 py-1.5 rounded-lg border border-gray-300 bg-white"
                        />
                      </div>

                      {/* Comisiones */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">
                          Comisiones
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={orderForm.costBreakdown.commissionsCost}
                          onChange={e => setOrderForm({
                            ...orderForm,
                            costBreakdown: { ...orderForm.costBreakdown, commissionsCost: e.target.value }
                          })}
                          className="w-full px-2 py-1.5 rounded-lg border border-gray-300 bg-white"
                        />
                      </div>

                      {/* Envío Absorbido */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">
                          Envío Absorbido
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={orderForm.costBreakdown.absorbedShippingCost}
                          onChange={e => setOrderForm({
                            ...orderForm,
                            costBreakdown: { ...orderForm.costBreakdown, absorbedShippingCost: e.target.value }
                          })}
                          className="w-full px-2 py-1.5 rounded-lg border border-gray-300 bg-white"
                        />
                      </div>
                    </div>

                    {/* Calculated Production Cost & Margin Preview */}
                    {(() => {
                      const cb = orderForm.costBreakdown;
                      const totalC = (Number(cb.materialsCost) || 0) +
                        (Number(cb.laborCost) || 0) +
                        (Number(cb.equipmentCost) || 0) +
                        (Number(cb.packagingCost) || 0) +
                        (Number(cb.commissionsCost) || 0) +
                        (Number(cb.absorbedShippingCost) || 0);
                      const amt = Number(orderForm.amount) || 0;
                      const prof = amt - totalC;
                      const marg = amt > 0 ? Math.round((prof / amt) * 100) : 0;

                      return (
                        <div className="p-2.5 rounded-xl bg-white border border-gray-200 flex items-center justify-between font-semibold text-xs">
                          <div>
                            <span className="text-gray-500">Costo Total:</span>{' '}
                            <strong className="text-gray-900">${totalC.toFixed(2)} MXN</strong>
                          </div>
                          <div>
                            <span className="text-gray-500">Ganancia:</span>{' '}
                            <strong className={prof >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                              ${prof.toFixed(2)} MXN ({marg}%)
                            </strong>
                          </div>
                        </div>
                      );
                    })()}

                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-50 text-amber-800 text-[11px]">
                    ⚠️ Al guardar sin costos, el pedido pagado se reflejará como <em>"Ganancia pendiente de completar"</em> en los reportes hasta que captures sus gastos.
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Notas del Pedido
                </label>
                <textarea
                  rows="2"
                  value={orderForm.notes}
                  onChange={e => setOrderForm({ ...orderForm, notes: e.target.value })}
                  placeholder="Detalles de entrega, especificaciones o anticipo..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[#2D4F3E] focus:outline-none"
                />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#2D4F3E] text-white text-xs font-bold hover:bg-[#20392C] active:scale-98 transition-all shadow-md"
                >
                  {editingOrder ? 'Actualizar Pedido' : 'Guardar Pedido en Taller'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
