import React from 'react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, Plus, Minus, Check, Clock, ShieldCheck, Tag } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { cart, addToCart, updateCartQuantity } = useApp();

  if (!product) return null;

  const cartItem = cart.find((item) => item.product.id === product.id);
  const qtyInCart = cartItem?.quantity || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-500 hover:text-slate-900 shadow-md transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Product image */}
        <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (product.name.toLowerCase().includes('coriander') || product.id.includes('coriander')) {
                target.src = '/images/coriander-bunch.jpg';
              } else {
                target.src = '/images/prod-tomato-hybrid.jpg';
              }
            }}
          />
          {product.discountPercent && product.discountPercent > 0 && (
            <span className="absolute top-4 left-4 rounded-lg bg-[#08B968] px-2.5 py-1 text-xs font-black text-white shadow-md">
              {product.discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#087F46] bg-emerald-50 px-2 py-0.5 rounded-md">
              {product.category}
            </span>
            <span className="text-xs font-medium text-slate-500">Unit: {product.unit}</span>
          </div>

          <h2 className="mt-2 text-xl font-extrabold text-slate-900">{product.name}</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">{product.description}</p>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full"
                >
                  <Tag className="h-3 w-3 text-emerald-600" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Quick Commerce Guarantees */}
          <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-emerald-50/50 p-3.5 border border-emerald-100/60 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#08B968]" />
              <span>Delivered in 10-12 mins</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#08B968]" />
              <span>100% Quality Inspected</span>
            </div>
          </div>

          {/* Pricing & Add to Cart action bar */}
          <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">₹{product.price}</span>
                {product.originalPrice && (
                  <span className="text-sm text-slate-400 line-through">₹{product.originalPrice}</span>
                )}
              </div>
              <span className="text-[11px] text-slate-500">Inclusive of all taxes</span>
            </div>

            {qtyInCart === 0 ? (
              <button
                onClick={() => addToCart(product, 1)}
                className="flex items-center gap-2 rounded-xl bg-[#08B968] hover:bg-[#087F46] text-white px-6 py-3 font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span>Add to Cart</span>
              </button>
            ) : (
              <div className="flex items-center rounded-xl bg-[#08B968] text-white p-1">
                <button
                  onClick={() => updateCartQuantity(product.id, qtyInCart - 1)}
                  className="p-2 hover:bg-[#087F46] rounded-lg transition"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 text-sm font-black">{qtyInCart}</span>
                <button
                  onClick={() => updateCartQuantity(product.id, qtyInCart + 1)}
                  className="p-2 hover:bg-[#087F46] rounded-lg transition"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
