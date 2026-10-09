import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { ShoppingBag, Bike, LayoutDashboard, Sparkles, FastForward } from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
  const { role, setRole, activeOrder, simulateOrderProgression } = useApp();

  const roles: { id: UserRole; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'customer',
      label: 'Customer App',
      icon: <ShoppingBag className="h-4 w-4" />,
      desc: 'Reels to Meals Experience',
    },
    {
      id: 'rider',
      label: 'Rider App',
      icon: <Bike className="h-4 w-4" />,
      desc: '1-Hand Delivery Console',
    },
    {
      id: 'admin',
      label: 'Admin Hub',
      icon: <LayoutDashboard className="h-4 w-4" />,
      desc: 'Ops & Inventory Control',
    },
  ];

  return (
    <div className="bg-slate-900 text-white text-xs py-2 px-3 sm:px-6 border-b border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Hackathon banner */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 text-[11px] border border-emerald-500/30">
            <Sparkles className="h-3 w-3 text-emerald-400" />
            CYPHER 4.0
          </span>
          <span className="hidden sm:inline text-slate-300 font-medium">
            Cravely: <span className="text-emerald-400 font-bold">Reels to Meals</span> Quick-Commerce
          </span>
        </div>

        {/* Quick Demo Simulator trigger */}
        <div className="flex items-center gap-2">
          {activeOrder && activeOrder.status !== 'delivered' && activeOrder.status !== 'cancelled' && (
            <button
              onClick={() => simulateOrderProgression(activeOrder.id)}
              className="flex items-center gap-1.5 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-2.5 py-1 text-[11px] font-semibold border border-amber-500/30 transition cursor-pointer"
              title="Fast forward delivery order state for demo"
            >
              <FastForward className="h-3.5 w-3.5 text-amber-400" />
              <span>Simulate Next Step ({activeOrder.status})</span>
            </button>
          )}

          {/* Role selector buttons */}
          <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700">
            {roles.map((r) => {
              const active = role === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {r.icon}
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
