import React from 'react';
import { useApp } from '../../context/AppContext';
import { User, MapPin, Phone, Mail, ShieldCheck, Heart, Award, Sparkles } from 'lucide-react';

export const CustomerProfile: React.FC = () => {
  const { currentUser, addresses, selectedAddress, setSelectedAddress } = useApp();

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Account & Delivery Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage your saved kitchen delivery addresses and quick checkout preferences
        </p>
      </div>

      {/* User Info Card */}
      <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center gap-5">
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="h-20 w-20 rounded-2xl object-cover ring-4 ring-emerald-500/20 shadow-md"
        />
        <div className="text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-black text-slate-900">{currentUser.name}</h2>
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 text-[#087F46] px-2.5 py-0.5 text-xs font-bold border border-emerald-100">
              <Sparkles className="h-3 w-3" />
              CYPHER 4.0 Demo User
            </span>
          </div>
          <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              {currentUser.email}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              {currentUser.phone}
            </span>
          </div>
        </div>
      </div>

      {/* Saved Delivery Addresses */}
      <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#08B968]" />
            <span>Saved Delivery Addresses</span>
          </h3>
          <span className="text-xs font-semibold text-slate-500">{addresses.length} saved</span>
        </div>

        <div className="space-y-3">
          {addresses.map((addr) => {
            const isSelected = addr.id === selectedAddress.id;
            return (
              <div
                key={addr.id}
                onClick={() => setSelectedAddress(addr)}
                className={`p-4 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-4 ${
                  isSelected
                    ? 'border-[#08B968] bg-emerald-50/40 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50/60'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {addr.label}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Active Delivery Location
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-800 mt-2">{addr.street}</p>
                  {addr.landmark && (
                    <p className="text-[11px] text-slate-500 mt-0.5">Landmark: {addr.landmark}</p>
                  )}
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {addr.city}, {addr.state} — {addr.pincode}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
