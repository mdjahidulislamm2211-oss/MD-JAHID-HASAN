import React, { useEffect } from 'react';
import { ShoppingBag, ArrowRight, X } from 'lucide-react';
import { useCart } from '../context/CartContext.js';

export const Toast: React.FC = () => {
  const { showToast, lastAddedProduct, dismissToast, openCart } = useCart();

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        dismissToast();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showToast, dismissToast]);

  if (!showToast || !lastAddedProduct) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-neutral-900 text-white rounded-xl shadow-2xl p-4 border border-neutral-800 animate-slide-up flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <img
          src={lastAddedProduct.image}
          alt={lastAddedProduct.name}
          className="w-10 h-10 object-cover rounded-md bg-neutral-800 shrink-0"
        />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
            Added to Bag
          </p>
          <p className="text-xs font-bold text-white truncate">
            {lastAddedProduct.name}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => {
            dismissToast();
            openCart();
          }}
          className="px-2.5 py-1 text-xs font-bold text-neutral-950 bg-white hover:bg-neutral-100 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>View</span>
          <ArrowRight className="w-3 h-3" />
        </button>
        <button
          onClick={dismissToast}
          className="text-neutral-400 hover:text-white p-1"
          aria-label="Dismiss toast"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
