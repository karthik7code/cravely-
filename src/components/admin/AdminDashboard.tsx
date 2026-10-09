import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { Order, Product, Rider, DarkStore, OrderStatus, ProductCategory } from '../../types';
import { LiveMap } from '../maps/LiveMap';
import {
  LayoutDashboard,
  ShoppingBag,
  Bike,
  Package,
  Store,
  BarChart3,
  Search,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Minus,
  Edit2,
  RefreshCw,
  Zap,
  Activity,
  Layers,
  Sparkles,
  MapPin,
  Flame,
  Radio,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Check,
  Percent,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const {
    orders,
    products,
    riders,
    stores,
    updateProductStock,
    updateProductPrice,
    toggleProductAvailability,
    riderUpdateOrderStatus,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'orders' | 'inventory' | 'riders' | 'analytics' | 'stores'
  >('overview');

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState<string>('all');

  // Stock edit state modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockInput, setStockInput] = useState<number>(0);
  const [priceInput, setPriceInput] = useState<number>(0);

  // Timeframe filter for analytics
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<'7d' | '30d' | 'today'>('7d');

  // Real-time ticking indicator for dashboard ops
  const [tick, setTick] = useState<number>(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // KPI calculations
  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, o) => (o.status !== 'cancelled' ? sum + o.total : sum), 0);
  }, [orders]);

  const activeOrdersCount = useMemo(() => {
    return orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length;
  }, [orders]);

  const availableRidersCount = useMemo(() => {
    return riders.filter((r) => r.isOnline && !r.activeOrderId).length;
  }, [riders]);

  const stockoutProductsCount = useMemo(() => {
    return products.filter((p) => !p.isAvailable || p.stock === 0).length;
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.isAvailable && p.stock > 0 && p.stock <= 5).length;
  }, [products]);

  // Chart data
  const revenueChartData = useMemo(() => {
    if (analyticsTimeframe === 'today') {
      return [
        { label: '08:00', revenue: 1400, orders: 8 },
        { label: '10:00', revenue: 2900, orders: 15 },
        { label: '12:00', revenue: 4800, orders: 24 },
        { label: '14:00', revenue: 3600, orders: 19 },
        { label: '16:00', revenue: 5200, orders: 28 },
        { label: '18:00', revenue: 8400, orders: 42 },
        { label: '20:00', revenue: 11200, orders: 55 },
      ];
    }
    return [
      { label: 'Mon', revenue: 4200, orders: 18, SLA: 98.4 },
      { label: 'Tue', revenue: 5800, orders: 24, SLA: 97.9 },
      { label: 'Wed', revenue: 6100, orders: 28, SLA: 98.8 },
      { label: 'Thu', revenue: 7400, orders: 32, SLA: 99.1 },
      { label: 'Fri', revenue: 9200, orders: 45, SLA: 98.2 },
      { label: 'Sat', revenue: 11800, orders: 58, SLA: 97.5 },
      { label: 'Sun', revenue: 14200, orders: 66, SLA: 98.9 },
    ];
  }, [analyticsTimeframe]);

  const categoryDistributionData = [
    { name: 'Vegetables & Fruits', value: 38, color: '#10B981' },
    { name: 'Dairy & Bread', value: 24, color: '#3b82f6' },
    { name: 'Masalas & Spices', value: 16, color: '#f59e0b' },
    { name: 'Atta & Rice', value: 14, color: '#8b5cf6' },
    { name: 'Oils & Ghee', value: 8, color: '#ec4899' },
  ];

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerName.toLowerCase().includes(orderSearch.toLowerCase());
      if (!matchSearch) return false;
      if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
      return true;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        p.category.toLowerCase().includes(inventorySearch.toLowerCase());
      if (!matchSearch) return false;
      if (inventoryCategoryFilter !== 'all' && p.category !== inventoryCategoryFilter) return false;
      return true;
    });
  }, [products, inventorySearch, inventoryCategoryFilter]);

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setStockInput(prod.stock);
    setPriceInput(prod.price);
  };

  const handleSaveProductEdit = () => {
    if (!editingProduct) return;
    updateProductStock(editingProduct.id, stockInput);
    updateProductPrice(editingProduct.id, priceInput);
    addToast('Product Updated', `Updated stock & price for ${editingProduct.name}`, 'success');
    setEditingProduct(null);
  };

  const handleQuickStockAdjust = (prodId: string, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta);
    updateProductStock(prodId, newStock);
    addToast('Quick Stock Adjust', `Stock adjusted to ${newStock} units`, 'info');
  };

  // Simulate advancing the first active order
  const handleAdvanceNextOrder = () => {
    const targetOrder = orders.find(
      (o) => o.status !== 'delivered' && o.status !== 'cancelled'
    );
    if (!targetOrder) {
      addToast('No Pending Orders', 'All orders are already delivered!', 'info');
      return;
    }

    let nextStatus: OrderStatus = 'delivered';
    if (targetOrder.status === 'placed') nextStatus = 'confirmed';
    else if (targetOrder.status === 'confirmed') nextStatus = 'preparing';
    else if (targetOrder.status === 'preparing') nextStatus = 'ready_for_pickup';
    else if (targetOrder.status === 'ready_for_pickup') nextStatus = 'out_for_delivery';
    else if (targetOrder.status === 'out_for_delivery') nextStatus = 'delivered';

    riderUpdateOrderStatus(targetOrder.id, nextStatus);

    if (nextStatus === 'delivered') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
      addToast('Delivery Complete 🎉', `Order #${targetOrder.orderNumber} successfully delivered!`, 'success');
    } else {
      addToast('Order Advanced 🚀', `Order #${targetOrder.orderNumber} advanced to ${nextStatus.replace(/_/g, ' ')}`, 'info');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-8">
      {/* OPERATIONS COCKPIT HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-slate-950 text-white text-[11px] font-black px-3 py-0.5 uppercase tracking-wide">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              CYPHER 4.0 Command Ops
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Dark Store Hub: <strong className="text-slate-800">Bengaluru Metro Cluster</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              ⚡ SLA Health: 98.4%
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Central Fulfillment & Inventory Control
          </h1>
        </div>

        {/* Action Controls & Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Simulation Trigger Button */}
          <button
            onClick={handleAdvanceNextOrder}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-3.5 py-2 text-xs font-black shadow-md shadow-emerald-600/20 transition-all transform active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Advance Next Order</span>
          </button>

          {/* Navigation Pill Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl overflow-x-auto text-xs font-black">
            {[
              { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
              { id: 'orders', label: `Orders (${orders.length})`, icon: <ShoppingBag className="h-3.5 w-3.5" /> },
              { id: 'inventory', label: `Inventory (${products.length})`, icon: <Package className="h-3.5 w-3.5" /> },
              { id: 'riders', label: `Fleet (${riders.length})`, icon: <Bike className="h-3.5 w-3.5" /> },
              { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-3.5 w-3.5" /> },
              { id: 'stores', label: 'Dark Stores', icon: <Store className="h-3.5 w-3.5" /> },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {/* HIGH-IMPACT KPI CARDS WITH GLOW BORDERS */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <motion.div
              whileHover={{ y: -3 }}
              className="relative p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-400" />
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1">
                <span>Total Revenue</span>
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-slate-900 block">
                ₹{totalRevenue.toLocaleString()}
              </span>
              <span className="text-[10px] font-extrabold text-emerald-600 mt-1 inline-flex items-center gap-0.5">
                +18.4% velocity
              </span>
            </motion.div>

            <motion.div
              whileHover={{ y: -3 }}
              className="relative p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1">
                <span>Active Orders</span>
                <Activity className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-blue-600 block">
                {activeOrdersCount}
              </span>
              <span className="text-[10px] font-bold text-slate-500 mt-1 block">
                in transit / bagging
              </span>
            </motion.div>

            <motion.div
              whileHover={{ y: -3 }}
              className="relative p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1">
                <span>Available Fleet</span>
                <Bike className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-emerald-600 block">
                {availableRidersCount} / {riders.length}
              </span>
              <span className="text-[10px] font-bold text-slate-500 mt-1 block">
                GPS synced online
              </span>
            </motion.div>

            <motion.div
              whileHover={{ y: -3 }}
              className="relative p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-400" />
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1">
                <span>Avg SLA Delivery</span>
                <Clock className="h-3.5 w-3.5 text-amber-500" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-slate-900 block">
                8.9 mins
              </span>
              <span className="text-[10px] font-bold text-emerald-600 mt-1 block">
                Target: 10 mins
              </span>
            </motion.div>

            <motion.div
              whileHover={{ y: -3 }}
              className="relative p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1">
                <span>Reels Conversion</span>
                <Sparkles className="h-3.5 w-3.5 text-violet-500" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-violet-600 block">
                34.8%
              </span>
              <span className="text-[10px] font-bold text-slate-500 mt-1 block">
                scaled kit conversions
              </span>
            </motion.div>

            <motion.div
              whileHover={{ y: -3 }}
              className="relative p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-pink-500" />
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1">
                <span>Stock Alert</span>
                <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-rose-600 block">
                {stockoutProductsCount}
              </span>
              <span className="text-[10px] font-bold text-slate-500 mt-1 block">
                {lowStockCount} low stock
              </span>
            </motion.div>
          </div>

          {/* MOTION GRAPHIC DISPATCH PIPELINE & CONVEYOR */}
          <div className="rounded-3xl bg-slate-950 text-white p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Live Order Conveyor Belt & Dispatch Stream
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  Real-time pipeline monitoring orders across dark store bagging, packaging, and rider transit
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400">
                  Auto-sync active: <strong className="text-emerald-400 font-mono">200ms</strong>
                </span>
                <button
                  onClick={handleAdvanceNextOrder}
                  className="rounded-xl bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 text-xs font-bold border border-slate-700 transition cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="h-3 w-3 text-emerald-400" />
                  <span>Step Forward</span>
                </button>
              </div>
            </div>

            {/* Conveyor 4-Stage Motion Pipeline */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {[
                {
                  id: 'placed',
                  title: '1. Placed & Verified',
                  orders: orders.filter((o) => o.status === 'placed' || o.status === 'confirmed'),
                  color: 'border-blue-500/40 bg-blue-950/20 text-blue-400',
                  badge: 'Dark Store Queued',
                },
                {
                  id: 'preparing',
                  title: '2. Bagging & Gram Weighing',
                  orders: orders.filter((o) => o.status === 'preparing'),
                  color: 'border-amber-500/40 bg-amber-950/20 text-amber-400',
                  badge: 'Avg 2.5 mins',
                },
                {
                  id: 'out_for_delivery',
                  title: '3. Rider In Transit',
                  orders: orders.filter((o) => o.status === 'ready_for_pickup' || o.status === 'out_for_delivery'),
                  color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400',
                  badge: 'GPS Tracking',
                },
                {
                  id: 'delivered',
                  title: '4. Delivered Fresh',
                  orders: orders.filter((o) => o.status === 'delivered'),
                  color: 'border-slate-700 bg-slate-900/60 text-slate-400',
                  badge: 'Completed',
                },
              ].map((stage, idx) => (
                <div
                  key={stage.id}
                  className={`rounded-2xl p-4 border ${stage.color} flex flex-col justify-between space-y-3 min-h-[190px]`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-white">{stage.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {stage.orders.length} orders
                    </span>
                  </div>

                  <div className="space-y-2 flex-1 max-h-40 overflow-y-auto scrollbar-none">
                    {stage.orders.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-xs text-slate-600 font-medium italic py-6">
                        No orders in this phase
                      </div>
                    ) : (
                      stage.orders.slice(0, 3).map((ord) => (
                        <div
                          key={ord.id}
                          className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1 hover:border-slate-700 transition"
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-white">#{ord.orderNumber}</span>
                            <span className="text-amber-400 font-mono">₹{ord.total}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center justify-between">
                            <span>{ord.customerName}</span>
                            <span className="text-[10px] text-slate-500">{ord.items.length} items</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{stage.badge}</span>
                    {idx < 3 && <ChevronRight className="h-3.5 w-3.5 text-slate-500" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GPS FLEET MAP & REAL-TIME QUEUE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 rounded-3xl bg-white p-5 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    <span>Real-Time Fleet & Dark Store Network</span>
                  </h3>
                  <p className="text-xs text-slate-500">Live GPS tracking of active dispatch riders across Bengaluru</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Koramangala 4th Block Hub
                  </span>
                </div>
              </div>

              <LiveMap
                storePos={{ lat: stores[0].lat, lng: stores[0].lng }}
                storeName={stores[0].name}
                customerPos={{ lat: 12.9328, lng: 77.6295 }}
                customerAddress="Sony Signal, Koramangala 4th Block"
                orderStatus="out_for_delivery"
                className="h-80 w-full rounded-2xl overflow-hidden border border-slate-200"
              />
            </div>

            {/* Quick Live Orders List */}
            <div className="lg:col-span-5 rounded-3xl bg-white p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-emerald-600" />
                    <h3 className="text-base font-black text-slate-900">Active Order Stream</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-black text-[#064e29] hover:underline cursor-pointer"
                  >
                    View All ({orders.length}) →
                  </button>
                </div>

                <div className="divide-y divide-slate-100 mt-2 max-h-[310px] overflow-y-auto">
                  {orders.slice(0, 6).map((ord) => (
                    <div key={ord.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900">#{ord.orderNumber}</span>
                          <span className="text-[11px] text-slate-500 font-medium">• {ord.customerName}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {ord.items.length} items • ₹{ord.total} • {ord.deliveryAddress.street.substring(0, 24)}...
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          ord.status === 'delivered'
                            ? 'bg-slate-100 text-slate-700'
                            : ord.status === 'out_for_delivery'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Rider Dispatch SLA</span>
                <span className="font-black text-emerald-700">98.4% Fulfilled on Time</span>
              </div>
            </div>
          </div>

          {/* REVENUE VELOCITY CHART & TIMEFRAME SWITCHER */}
          <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Revenue & Order Velocity Dynamics
                </h3>
                <p className="text-xs text-slate-500">Hourly throughput vs dark store capacity</p>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setAnalyticsTimeframe('today')}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    analyticsTimeframe === 'today' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Today (Live)
                </button>
                <button
                  onClick={() => setAnalyticsTimeframe('7d')}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    analyticsTimeframe === '7d' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Past 7 Days
                </button>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10B981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      {/* ORDERS MANAGEMENT TAB */}
      {activeTab === 'orders' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by order # or customer..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full rounded-xl bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 border border-slate-200 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Status:</span>
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700"
              >
                <option value="all">All Statuses</option>
                <option value="placed">Placed</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="ready_for_pickup">Ready for Pickup</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="rounded-3xl bg-white border border-slate-200/80 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-3.5">Order</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Items</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Rider</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Quick Transition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3.5 font-black text-slate-900">#{ord.orderNumber}</td>
                    <td className="p-3.5 font-medium text-slate-700">{ord.customerName}</td>
                    <td className="p-3.5 text-slate-600">{ord.items.length} items</td>
                    <td className="p-3.5 font-extrabold text-slate-900">₹{ord.total}</td>
                    <td className="p-3.5 text-slate-600">
                      {ord.assignedRider ? ord.assignedRider.name : <span className="text-amber-600 font-bold">Unassigned</span>}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {ord.status !== 'delivered' && ord.status !== 'cancelled' ? (
                        <select
                          value={ord.status}
                          onChange={(e) => riderUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                          className="rounded-lg bg-emerald-50 border border-emerald-200 text-[#064e29] font-black px-2 py-1 text-[11px] cursor-pointer"
                        >
                          <option value="placed">Placed</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready_for_pickup">Ready for Pickup</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-bold">Archived</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* INVENTORY MANAGEMENT TAB WITH QUICK MICRO CONTROLS */}
      {activeTab === 'inventory' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search dark store catalogue..."
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                className="w-full rounded-xl bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 border border-slate-200 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-semibold">
                Showing {filteredProducts.length} catalogue items
              </span>
            </div>
          </div>

          <div className="rounded-3xl bg-white border border-slate-200/80 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-3.5">Product</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Unit</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Stock Controls</th>
                  <th className="p-3.5">Availability</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3.5 flex items-center gap-2.5">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-8 w-8 rounded-lg object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (p.name.toLowerCase().includes('coriander') || p.id.includes('coriander')) {
                            target.src = '/images/coriander-bunch.jpg';
                          } else {
                            target.src = '/images/prod-tomato-hybrid.jpg';
                          }
                        }}
                      />
                      <span className="font-bold text-slate-900 truncate max-w-[180px]">{p.name}</span>
                    </td>
                    <td className="p-3.5 text-slate-600">{p.category}</td>
                    <td className="p-3.5 text-slate-500">{p.unit}</td>
                    <td className="p-3.5 font-black text-slate-900">₹{p.price}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuickStockAdjust(p.id, p.stock, -1)}
                          className="h-6 w-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className={`font-black min-w-[36px] text-center ${p.stock <= 5 ? 'text-rose-600' : 'text-slate-900'}`}>
                          {p.stock}
                        </span>
                        <button
                          onClick={() => handleQuickStockAdjust(p.id, p.stock, 1)}
                          className="h-6 w-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => toggleProductAvailability(p.id)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black cursor-pointer uppercase ${
                          p.isAvailable && p.stock > 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {p.isAvailable && p.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </button>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleOpenEditProduct(p)}
                        className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1 text-xs font-black transition cursor-pointer"
                      >
                        Edit Price/Stock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Edit Product Modal */}
          {editingProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" onClick={() => setEditingProduct(null)} />
              <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-4">
                <h3 className="text-base font-black text-slate-900">
                  Update {editingProduct.name}
                </h3>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={stockInput}
                    onChange={(e) => setStockInput(parseInt(e.target.value, 10) || 0)}
                    className="w-full rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-900 border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    value={priceInput}
                    onChange={(e) => setPriceInput(parseInt(e.target.value, 10) || 0)}
                    className="w-full rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-900 border border-slate-200 font-bold"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setEditingProduct(null)}
                    className="px-3 py-1.5 text-xs text-slate-500 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProductEdit}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* FLEET MANAGEMENT TAB */}
      {activeTab === 'riders' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          {riders.map((r) => (
            <div key={r.id} className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <img src={r.avatar} alt={r.name} className="h-12 w-12 rounded-2xl object-cover" />
                <div>
                  <h4 className="text-sm font-black text-slate-900">{r.name}</h4>
                  <span className="text-xs text-slate-500">{r.phone}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl">
                <div>
                  <span className="text-slate-400 block text-[10px]">Vehicle</span>
                  <span className="font-bold text-slate-800">{r.vehicleType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Deliveries Today</span>
                  <span className="font-bold text-slate-800">{r.completedDeliveriesToday}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500">Today's Payout: <strong>₹{r.todayEarnings}</strong></span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  r.isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {r.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-base font-black text-slate-900 mb-4">
              Category Revenue Share
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistributionData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {categoryDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900">
              Quick Commerce Performance KPIs
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-3 rounded-xl bg-slate-50">
                <span className="text-slate-600">Reels to Meals Conversion Rate</span>
                <span className="font-black text-emerald-700">34.8%</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-50">
                <span className="text-slate-600">Average Cart Size</span>
                <span className="font-black text-slate-900">₹320</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-50">
                <span className="text-slate-600">Average Dispatch Packing Time</span>
                <span className="font-black text-slate-900">2.5 minutes</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-50">
                <span className="text-slate-600">Rider On-Time SLA Fulfillment</span>
                <span className="font-black text-emerald-700">98.4%</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* DARK STORES TAB */}
      {activeTab === 'stores' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          {stores.map((s) => (
            <div key={s.id} className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-emerald-600" />
                <h4 className="text-sm font-black text-slate-900 truncate">{s.name}</h4>
              </div>
              <p className="text-xs text-slate-500">{s.address}</p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>Radius: {s.operatingRadiusKm} km</span>
                <span className="text-emerald-700 font-black">Active Hub</span>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};
