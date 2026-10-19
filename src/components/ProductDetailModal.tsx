import React, { useState } from 'react';
import { X, ExternalLink, ShoppingBag, Star, ShieldCheck, Check, Truck, RefreshCw, AlertCircle } from 'lucide-react';
import type { Product } from '../types/index.js';
import { useCart } from '../context/CartContext.js';
import { api } from '../services/api.js';

interface ProductDetailModalProps {
  product: Product | null;
  allProducts: Product[];
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onOpenDisclosure: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  allProducts,
  onClose,
  onSelectProduct,
  onOpenDisclosure
}) => {
  if (!product) return null;

  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(product.image);
  const [quantity, setQuantity] = useState(1);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const images = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const currentPrice = product.salePrice ?? product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100) 
    : 0;

  const handleBuyNow = async () => {
    setIsRedirecting(true);
    try {
      const res = await api.trackAffiliateClick(product.id, 'pdp_buy_now');
      window.open(res.affiliateUrl || product.affiliateUrl, '_blank', 'noopener,noreferrer');
    } catch {
      window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setIsRedirecting(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  const related = allProducts
    .filter(p => p.id !== product.id && (p.category === product.category || p.brand === product.brand))
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-950/70 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-neutral-400 hover:text-neutral-800 bg-white/80 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer border border-neutral-200"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8">
          
          {/* Left Column: Visual Gallery */}
          <div className="flex flex-col space-y-4">
            {/* Main Stage Image */}
            <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 flex items-center justify-center">
              <img
                src={selectedImage}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
              {hasDiscount && (
                <div className="absolute top-3 left-3 bg-neutral-900 text-white text-xs font-bold px-2.5 py-1 rounded">
                  {discountPercent}% SAVINGS
                </div>
              )}
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImage === img ? 'border-neutral-900 ring-2 ring-neutral-900/10' : 'border-neutral-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Editorial Guarantee & Trust Strip */}
            <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200/80 text-xs text-neutral-600 space-y-2 mt-auto">
              <div className="flex items-center gap-2 font-medium text-neutral-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified Third-Party Retail Partner</span>
              </div>
              <p className="text-[11px] leading-relaxed text-neutral-500">
                This item is fulfilled directly by <strong>{product.affiliateNetwork}</strong>. You enjoy official manufacturer warranties and merchant customer protection.
              </p>
            </div>
          </div>

          {/* Right Column: Contiguous Purchase Module */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Brand and SKU */}
              <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                <span className="font-bold uppercase tracking-wider text-neutral-900">{product.brand}</span>
                <span className="font-mono text-neutral-400">SKU: {product.sku}</span>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 leading-snug mb-3">
                {product.name}
              </h2>

              {/* Rating and Reviews */}
              <div className="flex items-center gap-3 mb-4 text-sm">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-neutral-900 tabular-nums">{product.rating.toFixed(1)}</span>
                </div>
                <span className="text-neutral-300">·</span>
                <span className="text-neutral-500 tabular-nums">{product.reviewCount} verified editorial ratings</span>
                <span className="text-neutral-300">·</span>
                <span className="text-emerald-700 font-medium text-xs flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> In Stock
                </span>
              </div>

              {/* Price Display */}
              <div className="flex items-baseline gap-3 mb-6 p-3 bg-neutral-50 rounded-lg border border-neutral-200/70">
                <span className="text-2xl font-extrabold text-neutral-900 tabular-nums">
                  ${currentPrice.toFixed(2)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-sm text-neutral-400 line-through tabular-nums">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Save ${(product.price - product.salePrice!).toFixed(2)}
                    </span>
                  </>
                )}
                <span className="ml-auto text-xs text-neutral-500 font-medium">
                  via {product.affiliateNetwork}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Verified Specifications Table */}
              {product.specifications && product.specifications.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-2">
                    Verified Specifications
                  </h4>
                  <div className="border border-neutral-200 rounded-lg overflow-hidden text-xs">
                    {product.specifications.map((spec, i) => (
                      <div
                        key={i}
                        className={`flex justify-between py-2 px-3 ${i % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}`}
                      >
                        <span className="font-medium text-neutral-500">{spec.key}</span>
                        <span className="font-semibold text-neutral-800 text-right">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Purchase & Action Module */}
            <div className="pt-4 border-t border-neutral-200 space-y-4">
              
              {/* Quantity Stepper & Buttons */}
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden h-11 bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 text-neutral-600 hover:bg-neutral-100 font-bold transition-colors"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-sm font-semibold text-neutral-900 tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 text-neutral-600 hover:bg-neutral-100 font-bold transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Add to Local Cart */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 h-11 px-4 text-sm font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200/90 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {addedSuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <ShoppingBag className="w-4 h-4" />}
                  <span>{addedSuccess ? 'Added to Cart' : 'Add to Cart'}</span>
                </button>

                {/* Direct Buy Now on External Merchant */}
                <button
                  onClick={handleBuyNow}
                  disabled={isRedirecting}
                  className="flex-1 h-11 px-4 text-sm font-bold text-white bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-950 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Buy on {product.affiliateNetwork.split(' ')[0]}</span>
                  <ExternalLink className="w-4 h-4 opacity-80" />
                </button>
              </div>

              {/* FTC Affiliate Disclosure Callout */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Affiliate Notice:</strong> Clicking <em>Buy Now</em> safely redirects you to {product.affiliateNetwork} to finalize your purchase. We earn an affiliate commission at no extra cost to you.
                  <button onClick={onOpenDisclosure} className="underline font-semibold ml-1 cursor-pointer">
                    Read our full disclosure
                  </button>
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {related.length > 0 && (
          <div className="bg-neutral-50 border-t border-neutral-200 p-6 sm:p-8">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-4">
              Related Curated Picks
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map(rel => (
                <div
                  key={rel.id}
                  onClick={() => {
                    onSelectProduct(rel);
                    setSelectedImage(rel.image);
                  }}
                  className="bg-white p-3 rounded-xl border border-neutral-200 hover:border-neutral-300 transition-all cursor-pointer flex items-center gap-3"
                >
                  <img src={rel.image} alt={rel.name} className="w-14 h-14 object-cover rounded-lg bg-neutral-100" />
                  <div className="min-w-0">
                    <p className="text-xs text-neutral-500 font-semibold uppercase">{rel.brand}</p>
                    <p className="text-xs font-bold text-neutral-900 truncate">{rel.name}</p>
                    <p className="text-xs font-semibold text-neutral-700 mt-1 tabular-nums">
                      ${(rel.salePrice ?? rel.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
