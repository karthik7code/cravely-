import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  MapPin,
  Clock,
  ShieldCheck,
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { checkServiceability } from '../../services/mapsService';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (orderId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const {
    cart,
    cartTotal,
    appliedCoupon,
    addresses,
    selectedAddress,
    setSelectedAddress,
    addAddress,
    selectedStore,
    stores,
    placeOrder,
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Cash on Delivery'>('UPI');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New Address form toggler
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [newLabel, setNewLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [newStreet, setNewStreet] = useState('');
  const [newLandmark, setNewLandmark] = useState('');

  if (!isOpen) return null;

  // Calculation
  const subtotal = cartTotal;
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.flatDiscount) {
      discount = appliedCoupon.flatDiscount;
    } else if (appliedCoupon.discountPercent) {
      discount = Math.round((subtotal * appliedCoupon.discountPercent) / 100);
    }
  }

  const deliveryFee = subtotal > 199 ? 0 : 25;
  const platformFee = 5;
  const taxes = Math.round(subtotal * 0.05);
  const finalTotal = Math.max(0, subtotal - discount + deliveryFee + platformFee + taxes);

  // Check address serviceability
  const serviceCheck = checkServiceability(
    { lat: selectedAddress.lat, lng: selectedAddress.lng },
    stores
  );

  const handleCreateNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet.trim()) return;

    addAddress({
      label: newLabel,
      street: newStreet,
      landmark: newLandmark || 'Near Main Gate',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560034',
      lat: 12.9340 + (Math.random() - 0.5) * 0.01,
      lng: 77.6250 + (Math.random() - 0.5) * 0.01,
      isDefault: false,
    });
    setIsAddingNewAddress(false);
    setNewStreet('');
    setNewLandmark('');
  };

  const handleConfirmOrder = async () => {
    if (isSubmitting) return; // Idempotency check to prevent duplicate orders
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const createdOrder = await placeOrder({
        paymentMethod,
        deliveryNotes,
      });

      // Fire celebratory confetti!
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      onClose();
      onOrderSuccess(createdOrder.id);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-5 sm:p-7 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#087F46]">
              Instant Checkout
            </span>
            <h2 className="text-xl font-black text-slate-900">Review & Place Order</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-50 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="mt-5 space-y-6">
          {/* Address Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[#08B968]" />
                Delivery Address
              </label>
              {!isAddingNewAddress && (
                <button
                  type="button"
                  onClick={() => setIsAddingNewAddress(true)}
                  className="text-xs font-bold text-[#087F46] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3 w-3" /> Add New Address
                </button>
              )}
            </div>

            {/* Address cards */}
            {!isAddingNewAddress ? (
              <div className="space-y-2">
                {addresses.map((addr) => {
                  const isSelected = addr.id === selectedAddress.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddress(addr)}
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border transition cursor-pointer ${
                        isSelected
                          ? 'border-[#08B968] bg-emerald-50/40 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50/60'
                      }`}
                    >
                      <input
                        type="radio"
                        checked={isSelected}
                        onChange={() => setSelectedAddress(addr)}
                        className="mt-1 text-[#08B968] focus:ring-[#08B968]"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900">{addr.label}</span>
                          <span className="text-[10px] text-slate-500">{addr.city}</span>
                        </div>
                        <p className="text-xs text-slate-600 truncate mt-0.5">{addr.street}</p>
                        {addr.landmark && (
                          <span className="text-[11px] text-slate-400 block">Landmark: {addr.landmark}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Add New Address Form */
              <form onSubmit={handleCreateNewAddress} className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  {(['Home', 'Work', 'Other'] as const).map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setNewLabel(lbl)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        newLabel === lbl ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Street / Flat / Apartment No."
                  value={newStreet}
                  onChange={(e) => setNewStreet(e.target.value)}
                  className="w-full rounded-xl bg-white px-3 py-2 text-xs text-slate-900 border border-slate-200 focus:outline-none focus:border-[#08B968]"
                  required
                />
                <input
                  type="text"
                  placeholder="Nearby Landmark (Optional)"
                  value={newLandmark}
                  onChange={(e) => setNewLandmark(e.target.value)}
                  className="w-full rounded-xl bg-white px-3 py-2 text-xs text-slate-900 border border-slate-200 focus:outline-none focus:border-[#08B968]"
                />
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingNewAddress(false)}
                    className="px-3 py-1.5 text-xs text-slate-500 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-[#08B968] text-white text-xs font-bold"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}

            {/* Serviceability indicator */}
            <div className="mt-2 flex items-center justify-between rounded-xl bg-emerald-50/70 p-2 text-[11px] text-[#087F46] border border-emerald-100">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Serviceable from: <strong>{selectedStore.name.split('—')[1] || selectedStore.name}</strong>
              </span>
              <span className="font-bold">~{serviceCheck.distanceKm} km</span>
            </div>
          </div>

          {/* Payment Method Selection (Clearly Labelled Sandbox Mode) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-[#08B968]" />
                Payment Method
              </label>
              <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-bold">
                Sandbox Simulator
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'UPI', label: 'UPI / QR', icon: <QrCode className="h-4 w-4" /> },
                { id: 'Card', label: 'Card (Credit/Debit)', icon: <CreditCard className="h-4 w-4" /> },
                { id: 'Cash on Delivery', label: 'Cash on Delivery', icon: <Banknote className="h-4 w-4" /> },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition cursor-pointer ${
                    paymentMethod === m.id
                      ? 'border-[#08B968] bg-emerald-50 text-[#087F46] shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="mb-1">{m.icon}</span>
                  <span className="text-center">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Delivery Instructions note */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Delivery Notes for Rider (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Leave with security guard, don't ring the bell"
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              className="w-full rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-900 border border-slate-200 focus:outline-none focus:border-[#08B968]"
            />
          </div>

          {/* Itemized Bill summary */}
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Items Total ({cart.length} items)</span>
              <span className="font-semibold text-slate-900">₹{subtotal}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Voucher Savings ({appliedCoupon?.code})</span>
                <span>-₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Delivery Partner Fee</span>
              <span>{deliveryFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${deliveryFee}`}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Platform Fee</span>
              <span>₹{platformFee}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Taxes (5% GST)</span>
              <span>₹{taxes}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
              <span>Grand Total</span>
              <span className="text-base font-black text-[#087F46]">₹{finalTotal}</span>
            </div>
          </div>
        </div>

        {/* Place Order CTA Button */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Safe & Contactless Delivery</span>
          </div>

          <button
            onClick={handleConfirmOrder}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-2xl bg-[#08B968] hover:bg-[#087F46] disabled:opacity-50 text-white px-6 py-3.5 text-xs sm:text-sm font-black shadow-lg shadow-emerald-600/25 transition active:scale-95 cursor-pointer"
          >
            {isSubmitting ? (
              <span>Placing Order...</span>
            ) : (
              <>
                <span>Pay ₹{finalTotal} & Confirm</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
