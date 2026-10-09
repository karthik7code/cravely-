import React from 'react';
import { Order } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Package,
  Clock,
  CheckCircle2,
  ChevronRight,
  Bike,
  XCircle,
  RotateCcw,
  ShoppingBag,
} from 'lucide-react';

interface CustomerOrdersProps {
  onSelectOrder: (order: Order) => void;
  onExploreRecipes: () => void;
}

export const CustomerOrders: React.FC<CustomerOrdersProps> = ({
  onSelectOrder,
  onExploreRecipes,
}) => {
  const { orders } = useApp();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          My Order History
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Track real-time delivery status or reorder your favorite recipe ingredients
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-white border border-slate-100 p-8 shadow-xs">
          <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No orders placed yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Watch a cooking reel, calculate ingredients for your party size, and enjoy 10-minute delivery!
          </p>
          <button
            onClick={onExploreRecipes}
            className="mt-5 rounded-2xl bg-[#08B968] text-white px-5 py-2.5 text-xs font-bold shadow-md hover:bg-[#087F46] transition cursor-pointer"
          >
            Explore Recipe Reels
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isLive = order.status !== 'delivered' && order.status !== 'cancelled';

            let statusBadge = (
              <span className="flex items-center gap-1 rounded-full bg-emerald-100 text-[#087F46] px-2.5 py-1 text-xs font-bold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Delivered
              </span>
            );

            if (isLive) {
              statusBadge = (
                <span className="flex items-center gap-1 rounded-full bg-blue-100 text-blue-700 px-2.5 py-1 text-xs font-black animate-pulse">
                  <Bike className="h-3.5 w-3.5" />
                  In Progress: {order.status.replace(/_/g, ' ')}
                </span>
              );
            } else if (order.status === 'cancelled') {
              statusBadge = (
                <span className="flex items-center gap-1 rounded-full bg-rose-100 text-rose-700 px-2.5 py-1 text-xs font-bold">
                  <XCircle className="h-3.5 w-3.5" />
                  Cancelled
                </span>
              );
            }

            return (
              <div
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className={`p-5 rounded-3xl bg-white border transition-all cursor-pointer hover:shadow-md ${
                  isLive ? 'border-blue-200 ring-2 ring-blue-50' : 'border-slate-100'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900">
                      Order #{order.orderNumber}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {statusBadge}
                </div>

                {/* Items preview */}
                <div className="mt-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex -space-x-3 overflow-hidden shrink-0">
                      {order.items.slice(0, 4).map((item, idx) => (
                        <img
                          key={idx}
                          src={item.image}
                          alt={item.productName}
                          className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover shadow-xs"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (item.productName.toLowerCase().includes('coriander') || item.productId.includes('coriander')) {
                              target.src = '/images/coriander-bunch.jpg';
                            } else {
                              target.src = '/images/prod-tomato-hybrid.jpg';
                            }
                          }}
                        />
                      ))}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {order.items.map((i) => i.productName).join(', ')}
                      </p>
                      <span className="text-[11px] text-slate-500">
                        {order.items.length} items from {order.storeName.split('—')[1] || order.storeName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-base font-black text-slate-900">₹{order.total}</span>
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </div>
                </div>

                {/* Live tracking CTA if order is active */}
                {isLive && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-700 font-bold bg-blue-50/50 p-2.5 rounded-xl">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Live tracking active (~{order.estimatedDeliveryMinutes}m ETA)
                    </span>
                    <span>Track Map →</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
