import React, { useState } from 'react';
import { ExternalLink, ShoppingBag, Star, ShieldCheck } from 'lucide-react';
import type { Product } from '../types/index.js';
import { useCart } from '../context/CartContext.js';
import { api } from '../services/api.js';

interface ProductCardProps {
  product: Product;
  onOpenDetail: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetail }) => {
  const { addToCart } = useCart();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const currentPrice = product.salePrice ?? product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100) 
    : 0;

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRedirecting(true);
    try {
      const res = await api.trackAffiliateClick(product.id, 'card_buy_now');
      window.open(res.affiliateUrl || product.affiliateUrl, '_blank', 'noopener,noreferrer');
    } catch {
      window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setIsRedirecting(false);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <div
      onClick={() => onOpenDetail(product)}
      className="group relative flex flex-col bg-white rounded-xl border border-neutral-200/90 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer text-left"
    >
      {/* Product Image Stage (65-75% visual dominance) */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100 flex items-center justify-center">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            // Styled CSS fallback container
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Fallback pattern if image is missing */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center bg-gradient-to-tr from-neutral-200 to-neutral-100 text-neutral-400 text-xs font-medium">
          {product.brand}
        </div>

        {/* Quiet Discount or Sale Marker (single discrete tag) */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-neutral-900 text-white text-[11px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">
            {discountPercent}% OFF
          </div>
        )}

        {/* Verified Stock Status */}
        {product.inStock && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-neutral-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-neutral-200/60 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Verified Stock</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Unboxed Metadata Line with typographic separators */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1.5 font-medium">
            <span className="uppercase tracking-wider text-[11px] text-neutral-600 font-semibold">{product.brand}</span>
            <span aria-hidden="true">·</span>
            <span>{product.category}</span>
          </div>

          {/* Product Title */}
          <h3 className="text-[15px] font-bold text-neutral-900 group-hover:text-neutral-700 line-clamp-2 leading-snug mb-2">
            {product.name}
          </h3>

          {/* Product Rating & Merchant Source */}
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-neutral-800 tabular-nums">{product.rating.toFixed(1)}</span>
              <span className="text-neutral-400 tabular-nums">({product.reviewCount})</span>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-neutral-500" title={`Merchant: ${product.affiliateNetwork}`}>
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
              <span className="truncate max-w-[100px]">{product.affiliateNetwork}</span>
            </div>
          </div>
        </div>

        {/* Price & Action Button Area */}
        <div className="pt-3 border-t border-neutral-100 mt-auto">
          {/* Tabular Price */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-bold text-neutral-900 tabular-nums">
              ${currentPrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-neutral-400 line-through tabular-nums">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Two-Action Bar: Add to Cart + Outbound Buy Now */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleAddToCart}
              className="py-2 px-2 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200/90 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="Add to local cart"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={isRedirecting}
              className="py-2 px-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-950 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap shadow-sm"
              title={`Visit ${product.affiliateNetwork} to complete purchase`}
            >
              <span>Buy Now</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
