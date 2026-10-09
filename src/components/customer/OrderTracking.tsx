import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { LiveMap } from '../maps/LiveMap';
import {
  CheckCircle2,
  Clock,
  Bike,
  Store,
  MapPin,
  Phone,
  ShieldCheck,
  ChevronRight,
  RotateCcw,
  FastForward,
  CookingPot,
  Sparkles,
  HelpCircle,
  XCircle,
} from 'lucide-react';

interface OrderTrackingProps {
  order: Order;
  onBack: () => void;
}

export const OrderTracking: React.FC<OrderTrackingProps> = ({ order, onBack }) => {
  const { stores, simulateOrderProgression, cancelOrder, addToast } = useApp();
  const [showSupportModal, setShowSupportModal] = useState(false);

  // Find store coordinates
  const store = stores.find((s) => s.id === order.storeId) || stores[0];

  const statusSteps: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'placed', label: 'Order Placed', desc: 'Received at dark store' },
    { key: 'confirmed', label: 'Confirmed', desc: 'Inventory reserved' },
    { key: 'preparing', label: 'Packing Items', desc: 'Picker gathering ingredients' },
    { key: 'ready_for_pickup', label: 'Ready for Pickup', desc: 'Rider arriving at hub' },
    { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Rider on electric scooter' },
    { key: 'delivered', label: 'Delivered', desc: 'Arrived at your doorstep' },
  ];

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-emerald-700 transition cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Back to All Orders</span>
        </button>

        {/* Demo Fast Forward Stepper Button */}
        {order.status !== 'delivered' && order.status !== 'cancelled' && (
          <button
            onClick={() => simulateOrderProgression(order.id)}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-300 px-3 py-1.5 text-xs font-bold transition cursor-pointer"
            title="Fast forward delivery state for CYPHER 4.0 demonstration"
          >
            <FastForward className="h-4 w-4 text-amber-600" />
            <span>Demo: Advance to Next Step</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Live Interactive Map & Assigned Rider */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Map Visualizer */}
          <div className="rounded-3xl bg-white p-4 sm:p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-[#087F46]">
                  <Bike className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Live Delivery Route</h3>
                  <span className="text-[11px] text-slate-500">
                    {order.status === 'delivered' ? 'Delivery Completed' : 'Estimated arrival: 8-10 mins'}
                  </span>
                </div>
              </div>

              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
                Order #{order.orderNumber}
              </span>
            </div>

            {/* Interactive Vector Map with GPS simulation */}
            <LiveMap
              storePos={{ lat: store.lat, lng: store.lng }}
              storeName={store.name}
              customerPos={{ lat: order.deliveryAddress.lat, lng: order.deliveryAddress.lng }}
              customerAddress={order.deliveryAddress.street}
              riderPos={
                order.assignedRider
                  ? { lat: order.assignedRider.currentLat, lng: order.assignedRider.currentLng }
                  : undefined
              }
              orderStatus={order.status}
              showRider={order.status === 'out_for_delivery' || !!order.assignedRiderId}
              className="h-80 w-full"
            />
          </div>

          {/* Assigned Rider Info Card */}
          {order.assignedRider ? (
            <div className="rounded-3xl bg-white p-5 border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <img
                  src={order.assignedRider.avatar}
                  alt={order.assignedRider.name}
                  className="h-12 w-12 rounded-2xl object-cover ring-2 ring-emerald-500/20"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-slate-900">{order.assignedRider.name}</h4>
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
                      ★ {order.assignedRider.rating}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {order.assignedRider.vehicleType} • {order.assignedRider.vehiclePlate}
                  </p>
                  <span className="text-[11px] text-[#087F46] font-semibold">
                    Vaccinated & Temperature Checked
                  </span>
                </div>
              </div>

              <button
                onClick={() => addToast('Calling Rider...', `Connecting to ${order.assignedRider?.phone} (simulated call)`, 'info')}
                className="flex items-center gap-1.5 rounded-2xl bg-emerald-50 hover:bg-[#08B968] text-[#087F46] hover:text-white px-3.5 py-2.5 text-xs font-bold border border-emerald-200 transition cursor-pointer active:scale-95"
              >
                <Phone className="h-4 w-4" />
                <span className="hidden sm:inline">Call Rider</span>
              </button>
            </div>
          ) : (
            <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200 text-center text-xs text-slate-600">
              <Clock className="h-5 w-5 mx-auto text-amber-500 mb-1" />
              <span>Matching nearest delivery rider in Koramangala hub...</span>
            </div>
          )}

          {/* Order items snapshot */}
          <div className="rounded-3xl bg-white p-5 border border-slate-100 shadow-sm">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
              Order Items ({order.items.length})
            </h4>
            <div className="divide-y divide-slate-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="h-10 w-10 rounded-xl object-cover shrink-0"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (item.productName.toLowerCase().includes('coriander') || item.productId.includes('coriander')) {
                          target.src = '/images/coriander-bunch.jpg';
                        } else {
                          target.src = '/images/prod-tomato-hybrid.jpg';
                        }
                      }}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{item.productName}</p>
                      <p className="text-[11px] text-slate-500">
                        {item.quantity} x {item.unit}
                      </p>
                      {item.recipeSourceTitle && (
                        <span className="text-[10px] text-[#087F46] font-semibold block truncate">
                          Reel: {item.recipeSourceTitle}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900 shrink-0">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 flex justify-between text-xs text-slate-600">
              <span>Paid via {order.paymentMethod}</span>
              <span className="font-black text-slate-900 text-sm">₹{order.total}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Status Progression Stepper Timeline */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl bg-white p-5 sm:p-6 border border-slate-100 shadow-sm">
            <h3 className="text-base font-black text-slate-900 mb-4">Delivery Timeline</h3>

            {order.status === 'cancelled' ? (
              <div className="rounded-2xl bg-rose-50 p-4 border border-rose-200 text-center">
                <XCircle className="h-8 w-8 text-rose-500 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-rose-900">Order Was Cancelled</h4>
                <p className="text-xs text-rose-600 mt-1">Refund has been initiated to your original payment method.</p>
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {statusSteps.map((step, idx) => {
                  const isDone = currentStepIndex >= idx;
                  const isCurrent = currentStepIndex === idx;

                  return (
                    <div key={step.key} className="relative">
                      {/* Step Circle Indicator */}
                      <div
                        className={`absolute -left-6 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold transition-all ${
                          isDone
                            ? 'bg-[#08B968] text-white shadow-xs'
                            : 'bg-white border-2 border-slate-300 text-slate-400'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="h-3 w-3" /> : idx + 1}
                      </div>

                      <div className="pl-2">
                        <div className="flex items-center justify-between">
                          <h4
                            className={`text-xs font-black ${
                              isCurrent
                                ? 'text-[#087F46] text-sm'
                                : isDone
                                ? 'text-slate-900'
                                : 'text-slate-400'
                            }`}
                          >
                            {step.label}
                          </h4>
                          {isCurrent && (
                            <span className="flex items-center gap-1 rounded-full bg-emerald-100 text-[#087F46] px-2 py-0.5 text-[9px] font-black animate-pulse">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Cancel order button if still in early stage */}
            {order.status === 'placed' && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => cancelOrder(order.id)}
                  className="w-full text-center text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 py-2 rounded-xl transition cursor-pointer"
                >
                  Cancel Order
                </button>
              </div>
            )}
          </div>

          {/* Need help support banner */}
          <div className="rounded-3xl bg-emerald-50/60 p-4 border border-emerald-100 flex items-center justify-between text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#08B968]" />
              <div>
                <span className="font-bold text-slate-900 block">Cravely Guarantee</span>
                <span className="text-[11px] text-slate-500">Missing or broken item? Instant replacement.</span>
              </div>
            </div>
            <button
              onClick={() => setShowSupportModal(true)}
              className="text-xs font-bold text-[#087F46] hover:underline cursor-pointer"
            >
              Get Help
            </button>
          </div>
        </div>
      </div>

      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowSupportModal(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-center">
            <HelpCircle className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-900">24/7 Cravely Support</h3>
            <p className="text-xs text-slate-500 mt-1">
              For any queries regarding Order #{order.orderNumber}, reach our dark store hotline at:
            </p>
            <div className="mt-4 p-3 rounded-xl bg-slate-50 font-bold text-slate-800 text-sm">
              +91 80 4910 8899
            </div>
            <button
              onClick={() => setShowSupportModal(false)}
              className="mt-4 w-full rounded-xl bg-slate-900 text-white py-2.5 text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
