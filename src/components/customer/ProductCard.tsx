import React from 'react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { Plus, Minus, Check, Clock } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOpenDetail?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetail }) => {
  const { cart, addToCart, updateCartQuantity } = useApp();

  const cartItem = cart.find((item) => item.product.id === product.id);
  const quantityInCart = cartItem?.quantity || 0;

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl bg-white p-3 sm:p-4 border border-slate-100 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all duration-200">
      <div>
        {/* Image Container with Badges */}
        <div
          onClick={() => onOpenDetail && onOpenDetail(product)}
          className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-50 cursor-pointer"
        >
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (product.name.toLowerCase().includes('coriander') || product.id.includes('coriander')) {
                target.src = '/images/coriander-bunch.jpg';
              } else {
                target.src = '/images/prod-tomato-hybrid.jpg';
              }
            }}
          />

          {/* Discount Pill */}
          {product.discountPercent && product.discountPercent > 0 && (
            <span className="absolute top-2 left-2 rounded-md bg-[#08B968] px-1.5 py-0.5 text-[10px] font-black text-white shadow-xs">
              {product.discountPercent}% OFF
            </span>
          )}

          {/* Stock status indicator */}
          {!product.isAvailable || product.stock === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs rounded-xl">
              <span className="rounded-md bg-rose-600 px-2 py-1 text-xs font-bold text-white shadow-sm">
                Out of Stock
              </span>
            </div>
          ) : product.stock <= 5 ? (
            <span className="absolute bottom-2 left-2 rounded-md bg-amber-500/90 backdrop-blur-xs px-1.5 py-0.5 text-[10px] font-bold text-white">
              Only {product.stock} left
            </span>
          ) : null}

          {/* 10-min delivery badge */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-white/90 backdrop-blur-xs px-1.5 py-0.5 text-[9px] font-bold text-emerald-800 shadow-xs">
            <Clock className="h-2.5 w-2.5 text-emerald-600" />
            <span>10m</span>
          </div>
        </div>

        {/* Product Details */}
        <div className="mt-3">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wide">
            {product.category}
          </span>
          <h3
            onClick={() => onOpenDetail && onOpenDetail(product)}
            className="mt-0.5 text-sm font-bold text-slate-900 line-clamp-2 hover:text-[#08B968] transition cursor-pointer min-h-[40px]"
          >
            {product.name}
          </h3>
          <span className="mt-1 inline-block text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
            {product.unit}
          </span>
        </div>
      </div>

      {/* Pricing & Add Controls */}
      <div className="mt-4 flex items-center justify-between gap-2 pt-2 border-t border-slate-50">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-extrabold text-[#172033]">
              ₹{product.price}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-slate-400 line-through">
                ₹{product.originalPrice}
              </span>
            )}
          </div>
        </div>

        {/* Add button or Quantity stepper */}
        {!product.isAvailable || product.stock === 0 ? (
          <button
            disabled
            className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-400 cursor-not-allowed"
          >
            Unavailable
          </button>
        ) : quantityInCart === 0 ? (
          <button
            onClick={() => addToCart(product, 1)}
            className="flex items-center gap-1 rounded-xl bg-emerald-50 hover:bg-[#08B968] text-[#087F46] hover:text-white px-3.5 py-2 text-xs font-bold border border-emerald-200 hover:border-transparent transition-all cursor-pointer active:scale-95 shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>ADD</span>
          </button>
        ) : (
          <div className="flex items-center rounded-xl bg-[#08B968] text-white shadow-xs">
            <button
              onClick={() => updateCartQuantity(product.id, quantityInCart - 1)}
              className="p-1.5 hover:bg-[#087F46] rounded-l-xl transition cursor-pointer active:scale-95"
              title="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="px-2.5 text-xs font-black min-w-[20px] text-center">
              {quantityInCart}
            </span>
            <button
              onClick={() => updateCartQuantity(product.id, quantityInCart + 1)}
              className="p-1.5 hover:bg-[#087F46] rounded-r-xl transition cursor-pointer active:scale-95"
              title="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
