import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Sparkles,
  Tag,
  ArrowRight,
  ShieldCheck,
  CookingPot,
  Check,
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
}) => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    cartItemCount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useApp();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Pricing calculations
  const subtotal = cartTotal;
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.flatDiscount) {
      discount = appliedCoupon.flatDiscount;
    } else if (appliedCoupon.discountPercent) {
      discount = Math.round((subtotal * appliedCoupon.discountPercent) / 100);
    }
  }

  const deliveryFee = subtotal > 199 || subtotal === 0 ? 0 : 25;
  const platformFee = subtotal > 0 ? 5 : 0;
  const taxes = Math.round(subtotal * 0.05);
  const finalTotal = Math.max(0, subtotal - discount + deliveryFee + platformFee + taxes);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponError(null);
    const res = applyCoupon(couponInput);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Drawer */}
      <div className="relative z-10 w-full max-w-md bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#087F46]">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Your Cravely Cart</h2>
              <span className="text-xs text-slate-500 font-medium">
                {cartItemCount} item{cartItemCount !== 1 ? 's' : ''} • 10-Min Fast Delivery
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition"
                title="Clear Cart"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Cart items list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {cart.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-800">Your cart is empty</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto">
                Explore our Reels to Meals recipe videos and add fresh ingredients with a single tap!
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="flex items-start gap-3 rounded-2xl bg-white p-3 border border-slate-100 shadow-xs hover:border-emerald-100 transition"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="h-14 w-14 rounded-xl object-cover border border-slate-100 shrink-0"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (item.product.name.toLowerCase().includes('coriander') || item.product.id.includes('coriander')) {
                      target.src = '/images/coriander-bunch.jpg';
                    } else {
                      target.src = '/images/prod-tomato-hybrid.jpg';
                    }
                  }}
                />

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{item.product.name}</h4>
                  <span className="text-[11px] text-slate-500">{item.product.unit}</span>

                  {/* Recipe origin tag */}
                  {item.recipeSource && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-[#087F46] bg-emerald-50 px-2 py-0.5 rounded-md truncate">
                      <CookingPot className="h-3 w-3 shrink-0" />
                      <span className="truncate">For: {item.recipeSource.recipeTitle}</span>
                    </div>
                  )}

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900">
                      ₹{item.product.price * item.quantity}
                    </span>

                    {/* Quantity Stepper */}
                    <div className="flex items-center rounded-lg bg-emerald-50 border border-emerald-200">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 text-[#087F46] hover:bg-emerald-100 rounded-l-lg transition"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-2 text-xs font-black text-emerald-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 text-[#087F46] hover:bg-emerald-100 rounded-r-lg transition"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Coupon Code Section */}
          {cart.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-emerald-600" />
                    Coupons & Offers
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold">Try FIRST50</span>
                </div>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-xl bg-emerald-100/60 p-2.5 border border-emerald-200">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-700" />
                      <div>
                        <span className="text-xs font-black text-emerald-900">{appliedCoupon.code}</span>
                        <p className="text-[10px] text-emerald-700">₹{discount} savings applied</p>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs font-bold text-rose-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Enter promo code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 rounded-xl bg-white px-3 py-1.5 text-xs text-slate-900 uppercase border border-slate-200 focus:border-[#08B968] focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-slate-900 text-white px-3 py-1.5 text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="mt-1 text-[11px] text-rose-600 font-medium">{couponError}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bill Summary & Checkout CTA */}
        {cart.length > 0 && (
          <div className="border-t border-slate-100 p-4 sm:p-5 bg-white space-y-3">
            {/* Bill Details */}
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900">₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Fee (10-min priority)</span>
                <span>{deliveryFee === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : `₹${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee</span>
                <span>₹{platformFee}</span>
              </div>
              <div className="flex justify-between">
                <span>GST & Govt Taxes (5%)</span>
                <span>₹{taxes}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-black text-slate-900">
                <span>Total Payable</span>
                <span>₹{finalTotal}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full flex items-center justify-between rounded-2xl bg-[#08B968] hover:bg-[#087F46] text-white p-3.5 font-black text-sm shadow-lg shadow-emerald-600/25 transition active:scale-98 cursor-pointer"
            >
              <div className="text-left">
                <span className="text-xs font-bold block text-emerald-100 leading-none">
                  {cartItemCount} item{cartItemCount !== 1 ? 's' : ''}
                </span>
                <span className="text-base font-black">₹{finalTotal}</span>
              </div>
              <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wider">
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
