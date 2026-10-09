import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import { LiveMap } from '../maps/LiveMap';
import {
  Bike,
  Power,
  Navigation,
  CheckCircle2,
  Clock,
  MapPin,
  Store,
  DollarSign,
  Phone,
  ShieldCheck,
  Package,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  History,
  QrCode,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const RiderApp: React.FC = () => {
  const {
    currentRider,
    toggleRiderOnline,
    orders,
    stores,
    riderAcceptOrder,
    riderUpdateOrderStatus,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'console' | 'earnings' | 'history'>('console');
  const [earningsFilter, setEarningsFilter] = useState<'today' | 'week'>('today');

  // Find order assigned to this rider that is in progress
  const activeAssignment = orders.find(
    (o) =>
      o.assignedRiderId === currentRider.id &&
      o.status !== 'delivered' &&
      o.status !== 'cancelled'
  );

  // Available pending requests waiting for a rider
  const pendingRequests = orders.filter(
    (o) => !o.assignedRiderId && o.status === 'placed'
  );

  // Completed orders by this rider
  const completedOrders = orders.filter(
    (o) => o.assignedRiderId === currentRider.id && o.status === 'delivered'
  );

  // Sequential workflow steps strictly validated
  const handleWorkflowAdvance = (order: Order) => {
    switch (order.status) {
      case 'confirmed':
        riderUpdateOrderStatus(order.id, 'preparing');
        addToast('Arrived at Store', 'Dark store team is assembling grocery package', 'info');
        break;
      case 'preparing':
        riderUpdateOrderStatus(order.id, 'ready_for_pickup');
        addToast('Order Ready', 'Bag packed and verified. Scan & pickup.', 'info');
        break;
      case 'ready_for_pickup':
        riderUpdateOrderStatus(order.id, 'out_for_delivery');
        addToast('Picked Up! 🛵', 'On your way to customer location', 'success');
        break;
      case 'out_for_delivery':
        riderUpdateOrderStatus(order.id, 'delivered');
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
        addToast('Delivery Complete! 🎉', '₹45 credited to your Cravely wallet', 'success');
        break;
      default:
        break;
    }
  };

  const storeForActive = activeAssignment
    ? stores.find((s) => s.id === activeAssignment.storeId) || stores[0]
    : stores[0];

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-900 text-white pb-24 shadow-2xl border-x border-slate-800">
      {/* Top Rider Bar & Online Switch */}
      <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md p-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={currentRider.avatar}
                alt={currentRider.name}
                className="h-11 w-11 rounded-2xl object-cover ring-2 ring-emerald-500/40"
              />
              <span
                className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full ring-2 ring-slate-900 ${
                  currentRider.isOnline ? 'bg-emerald-500' : 'bg-slate-500'
                }`}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-black text-white">{currentRider.name}</h2>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1 rounded">
                  ★ {currentRider.rating}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {currentRider.vehicleType} • {currentRider.vehiclePlate}
              </p>
            </div>
          </div>

          {/* Online/Offline Toggle */}
          <button
            onClick={() => toggleRiderOnline(currentRider.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              currentRider.isOnline
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Power className="h-3.5 w-3.5" />
            <span>{currentRider.isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </button>
        </div>

        {/* Quick Shift KPI metrics */}
        <div className="mt-3 grid grid-cols-3 gap-2 bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700/60 text-center">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Deliveries</span>
            <span className="text-sm font-black text-white">{currentRider.completedDeliveriesToday}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Today's Earnings</span>
            <span className="text-sm font-black text-emerald-400">₹{currentRider.todayEarnings}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Hub</span>
            <span className="text-sm font-bold text-slate-200 truncate">Koramangala</span>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="mt-3 flex items-center bg-slate-800 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('console')}
            className={`flex-1 py-1.5 rounded-lg transition ${
              activeTab === 'console' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Console
          </button>
          <button
            onClick={() => setActiveTab('earnings')}
            className={`flex-1 py-1.5 rounded-lg transition ${
              activeTab === 'earnings' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Earnings
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-1.5 rounded-lg transition ${
              activeTab === 'history' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            History
          </button>
        </div>
      </div>

      {/* Main Console Tab */}
      {activeTab === 'console' && (
        <div className="p-4 space-y-5">
          {!currentRider.isOnline ? (
            <div className="py-20 text-center bg-slate-800/40 rounded-3xl border border-slate-800 p-6">
              <Power className="h-12 w-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-300">You are currently offline</h3>
              <p className="text-xs text-slate-500 mt-1">
                Toggle the switch above to go ONLINE and receive quick delivery requests in your zone.
              </p>
              <button
                onClick={() => toggleRiderOnline(currentRider.id)}
                className="mt-4 rounded-xl bg-emerald-500 text-slate-950 px-5 py-2.5 text-xs font-black"
              >
                Go Online Now
              </button>
            </div>
          ) : activeAssignment ? (
            /* ACTIVE WORKFLOW CONSOLE (State-validated sequence) */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  Active Trip in Progress
                </span>
                <span className="text-xs font-black bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Payout: ₹45
                </span>
              </div>

              {/* Map representation */}
              <div className="rounded-3xl overflow-hidden border border-slate-700 shadow-lg">
                <LiveMap
                  storePos={{ lat: storeForActive.lat, lng: storeForActive.lng }}
                  storeName={storeForActive.name}
                  customerPos={{
                    lat: activeAssignment.deliveryAddress.lat,
                    lng: activeAssignment.deliveryAddress.lng,
                  }}
                  customerAddress={activeAssignment.deliveryAddress.street}
                  riderPos={{ lat: currentRider.currentLat, lng: currentRider.currentLng }}
                  orderStatus={activeAssignment.status}
                  className="h-60 w-full"
                />
              </div>

              {/* Customer & Store Details Card */}
              <div className="rounded-2xl bg-slate-800 p-4 border border-slate-700/80 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Customer</span>
                    <h4 className="text-sm font-black text-white">{activeAssignment.customerName}</h4>
                    <p className="text-xs text-slate-300 mt-0.5">{activeAssignment.deliveryAddress.street}</p>
                    {activeAssignment.deliveryNotes && (
                      <p className="mt-1 text-[11px] text-amber-300 bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20">
                        Note: {activeAssignment.deliveryNotes}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => addToast('Calling Customer...', `Dialling ${activeAssignment.customerPhone} (demo call)`, 'info')}
                    className="p-2.5 rounded-xl bg-slate-700 text-white hover:bg-slate-600 transition"
                  >
                    <Phone className="h-4 w-4" />
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                  <span>Store: {storeForActive.name.split('—')[1] || storeForActive.name}</span>
                  <span className="text-white font-bold">{activeAssignment.items.length} items to pick</span>
                </div>
              </div>

              {/* Step Execution Action Button (Sequential State Machine) */}
              <div className="rounded-2xl bg-emerald-950/40 border border-emerald-500/30 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold">Current State:</span>
                  <span className="font-black text-emerald-400 uppercase tracking-wide">
                    {activeAssignment.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {activeAssignment.status === 'confirmed' && (
                  <button
                    onClick={() => handleWorkflowAdvance(activeAssignment)}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white py-3.5 text-sm font-black shadow-lg shadow-blue-600/30 transition cursor-pointer"
                  >
                    <Store className="h-4 w-4" />
                    <span>Step 1: Arrived at Dark Store</span>
                  </button>
                )}

                {activeAssignment.status === 'preparing' && (
                  <button
                    onClick={() => handleWorkflowAdvance(activeAssignment)}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white py-3.5 text-sm font-black shadow-lg shadow-amber-600/30 transition cursor-pointer"
                  >
                    <Package className="h-4 w-4" />
                    <span>Step 2: Collect & Pack Verification</span>
                  </button>
                )}

                {activeAssignment.status === 'ready_for_pickup' && (
                  <button
                    onClick={() => handleWorkflowAdvance(activeAssignment)}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 text-sm font-black shadow-lg shadow-emerald-600/30 transition cursor-pointer"
                  >
                    <Bike className="h-4 w-4" />
                    <span>Step 3: Picked Up & Start GPS Navigation</span>
                  </button>
                )}

                {activeAssignment.status === 'out_for_delivery' && (
                  <button
                    onClick={() => handleWorkflowAdvance(activeAssignment)}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3.5 text-sm font-black shadow-lg shadow-emerald-500/40 transition cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Step 4: Mark Delivered & Collect ₹45</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* INCOMING DELIVERY REQUESTS DRAWER */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Available Requests Nearby ({pendingRequests.length})
                </h3>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="py-16 text-center bg-slate-800/40 rounded-2xl border border-slate-800 p-6">
                  <Bike className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-300">Searching for orders in your zone...</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Stay online! Orders placed by customers in Koramangala or Indiranagar will flash here instantly.
                  </p>
                </div>
              ) : (
                pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-slate-800 border border-slate-700 shadow-md space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white">Order #{req.orderNumber}</span>
                      <span className="text-xs font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        ₹45 Payout
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <Store className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{req.storeName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                        <span className="truncate">{req.deliveryAddress.street}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-medium">
                        {req.items.length} items • ~2.4 km distance
                      </span>
                      <button
                        onClick={() => riderAcceptOrder(req.id, currentRider.id)}
                        className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2 text-xs shadow-md transition cursor-pointer"
                      >
                        Accept Order
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Rider Earnings Tab */}
      {activeTab === 'earnings' && (
        <div className="p-4 space-y-5">
          <div className="flex items-center justify-between bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setEarningsFilter('today')}
              className={`flex-1 py-1.5 rounded-lg transition ${
                earningsFilter === 'today' ? 'bg-slate-700 text-white' : 'text-slate-400'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setEarningsFilter('week')}
              className={`flex-1 py-1.5 rounded-lg transition ${
                earningsFilter === 'week' ? 'bg-slate-700 text-white' : 'text-slate-400'
              }`}
            >
              This Week
            </button>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-emerald-950 to-slate-900 p-5 border border-emerald-500/30 text-center">
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
              Total Payout
            </span>
            <h2 className="text-3xl font-black text-white mt-1">
              ₹{earningsFilter === 'today' ? currentRider.todayEarnings : currentRider.todayEarnings + 2450}
            </h2>
            <span className="text-[11px] text-slate-400 block mt-1">
              {earningsFilter === 'today' ? `${currentRider.completedDeliveriesToday} orders` : '38 orders this week'}
            </span>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Trip History Breakdown
            </h4>
            {completedOrders.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No completed trips yet today.</p>
            ) : (
              completedOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-800 border border-slate-700/70 text-xs"
                >
                  <div>
                    <span className="font-bold text-white">Order #{ord.orderNumber}</span>
                    <span className="text-[11px] text-slate-400 block">{ord.deliveryAddress.city}</span>
                  </div>
                  <span className="font-black text-emerald-400">+₹45</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="p-4 space-y-3">
          <h3 className="text-sm font-black text-white">Recent Completed Orders</h3>
          {completedOrders.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-10">No completed orders yet.</p>
          ) : (
            completedOrders.map((ord) => (
              <div
                key={ord.id}
                className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700/80 text-xs space-y-2"
              >
                <div className="flex justify-between font-bold">
                  <span>Order #{ord.orderNumber}</span>
                  <span className="text-emerald-400">Delivered</span>
                </div>
                <p className="text-slate-400">{ord.deliveryAddress.street}</p>
                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-700/40 flex justify-between">
                  <span>{ord.items.length} items</span>
                  <span>{new Date(ord.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
