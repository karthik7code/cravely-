import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  MapPin,
  ShoppingBag,
  Bell,
  User,
  Sparkles,
  ChevronDown,
  CookingPot,
  Flame,
  Check,
} from 'lucide-react';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenNotifications: () => void;
  onNavigateTab: (tab: string) => void;
  currentTab: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCart,
  onOpenNotifications,
  onNavigateTab,
  currentTab,
  searchQuery,
  setSearchQuery,
}) => {
  const {
    cartItemCount,
    cartTotal,
    notifications,
    currentUser,
    addresses,
    selectedAddress,
    setSelectedAddress,
    role,
  } = useApp();

  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead && (n.targetRole === 'all' || n.targetRole === role)).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-950/5 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigateTab('home')}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
            >
              <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#08B968] to-[#087F46] text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
                <CookingPot className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400">
                  <Flame className="h-2.5 w-2.5 text-amber-950" />
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#172033] flex items-center gap-1">
                  Cravely
                  <span className="h-1.5 w-1.5 rounded-full bg-[#08B968]" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#087F46] -mt-1 hidden sm:inline">
                  Reels to Meals
                </span>
              </div>
            </button>

            {/* Deliver-to Location Selector */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowAddressDropdown(!showAddressDropdown)}
                className="flex items-center gap-2 rounded-xl bg-slate-50 hover:bg-emerald-50/60 px-3.5 py-2 text-left border border-slate-200/80 transition cursor-pointer"
              >
                <MapPin className="h-4 w-4 text-[#08B968] shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Deliver in 10 mins
                  </span>
                  <span className="text-xs font-semibold text-slate-900 truncate max-w-[170px]">
                    {selectedAddress.label} • {selectedAddress.street.split(',')[0]}
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {/* Address dropdown */}
              {showAddressDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setShowAddressDropdown(false)}
                  />
                  <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white p-2 shadow-xl border border-slate-100 z-30 animate-in fade-in zoom-in-95">
                    <div className="p-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-700">Select Delivery Location</span>
                    </div>
                    <div className="space-y-1 mt-1">
                      {addresses.map((addr) => {
                        const isSelected = addr.id === selectedAddress.id;
                        return (
                          <button
                            key={addr.id}
                            onClick={() => {
                              setSelectedAddress(addr);
                              setShowAddressDropdown(false);
                            }}
                            className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition cursor-pointer ${
                              isSelected ? 'bg-emerald-50 text-emerald-900' : 'hover:bg-slate-50'
                            }`}
                          >
                            <MapPin className={`h-4 w-4 mt-0.5 shrink-0 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-800">{addr.label}</span>
                                {isSelected && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                              </div>
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">{addr.street}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Search bar for groceries & recipes */}
          <div className="flex-1 max-w-md mx-2 sm:mx-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search 'Paneer Butter Masala', 'Tomatoes', 'Biryani'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white pl-10 pr-4 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 border border-transparent focus:border-[#08B968] focus:ring-2 focus:ring-[#08B968]/20 transition outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Actions & Navigation */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Nav tabs for Customer view */}
            <div className="hidden lg:flex items-center gap-1 bg-slate-100/70 p-1 rounded-xl">
              <button
                onClick={() => onNavigateTab('home')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  currentTab === 'home' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => onNavigateTab('recipes')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  currentTab === 'recipes' ? 'bg-[#08B968] text-white shadow-xs' : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <Sparkles className="h-3 w-3" />
                Watch & Cook
              </button>
              <button
                onClick={() => onNavigateTab('products')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  currentTab === 'products' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Groceries
              </button>
              <button
                onClick={() => onNavigateTab('orders')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  currentTab === 'orders' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                My Orders
              </button>
            </div>

            {/* Notification button */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Cart Button with Item Count & Live Total */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-2 sm:gap-2.5 rounded-xl bg-[#08B968] hover:bg-[#087F46] text-white px-3 sm:px-4 py-2 sm:py-2.5 font-bold shadow-md shadow-emerald-600/20 transition active:scale-95 cursor-pointer"
            >
              <div className="relative">
                <ShoppingBag className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-black text-[#087F46] shadow-xs">
                    {cartItemCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left text-xs leading-tight">
                <span>{cartItemCount === 0 ? 'My Cart' : `${cartItemCount} item${cartItemCount > 1 ? 's' : ''}`}</span>
                {cartTotal > 0 && <span className="text-[11px] font-extrabold text-emerald-100">₹{cartTotal}</span>}
              </div>
            </button>

            {/* Profile Avatar */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-emerald-500/30"
                />
              </button>

              {/* User dropdown */}
              {showUserDropdown && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowUserDropdown(false)} />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-3 shadow-xl border border-slate-100 z-30 animate-in fade-in zoom-in-95">
                    <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="h-9 w-9 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      </div>
                    </div>
                    <div className="pt-2 space-y-1">
                      <button
                        onClick={() => {
                          onNavigateTab('orders');
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition"
                      >
                        Order History
                      </button>
                      <button
                        onClick={() => {
                          onNavigateTab('profile');
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition"
                      >
                        Account & Addresses
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile quick tabs bar */}
        <div className="flex lg:hidden items-center justify-around py-2 border-t border-slate-100 text-xs font-bold">
          <button
            onClick={() => onNavigateTab('home')}
            className={`py-1 px-2 rounded-md ${currentTab === 'home' ? 'text-[#08B968]' : 'text-slate-600'}`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigateTab('recipes')}
            className={`flex items-center gap-1 py-1 px-2 rounded-md ${currentTab === 'recipes' ? 'text-[#08B968]' : 'text-slate-600'}`}
          >
            <Sparkles className="h-3 w-3" />
            Watch & Cook
          </button>
          <button
            onClick={() => onNavigateTab('products')}
            className={`py-1 px-2 rounded-md ${currentTab === 'products' ? 'text-[#08B968]' : 'text-slate-600'}`}
          >
            Groceries
          </button>
          <button
            onClick={() => onNavigateTab('orders')}
            className={`py-1 px-2 rounded-md ${currentTab === 'orders' ? 'text-[#08B968]' : 'text-slate-600'}`}
          >
            Orders
          </button>
        </div>
      </div>
    </header>
  );
};
