import React, { useState } from 'react';
import { X, Trash2, ExternalLink, ShoppingBag, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { api } from '../services/api.js';

interface CartDrawerProps {
  onOpenDisclosure: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenDisclosure }) => {
  const { items, isCartOpen, closeCart, updateQuantity, removeFromCart, clearCart, subtotal, itemCount } = useCart();
  const [redirectingId, setRedirectingId] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const handleCheckoutItem = async (productId: string, affiliateUrl: string) => {
    setRedirectingId(productId);
    try {
      const res = await api.trackAffiliateClick(productId, 'cart_checkout_item');
      window.open(res.affiliateUrl || affiliateUrl, '_blank', 'noopener,noreferrer');
    } catch {
      window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setRedirectingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-neutral-950/60 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-0" onClick={closeCart} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-neutral-200">
          
          {/* Header */}
          <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-neutral-800" />
              <h2 className="text-base font-bold text-neutral-900">Your Saved Bag</h2>
              <span className="text-xs font-semibold text-neutral-500 bg-neutral-200/80 px-2 py-0.5 rounded-full tabular-nums">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-neutral-900">Your bag is currently empty</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                  Browse our curated catalog to discover verified tech, audio, and home essentials.
                </p>
                <button
                  onClick={closeCart}
                  className="mt-5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                >
                  Continue Browsing
                </button>
              </div>
            ) : (
              <>
                {/* Transparency Explainer Notice Banner */}
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed">
                    <strong>Affiliate Marketplace Checkout:</strong> Adding items here saves your wishlist. Because products are fulfilled by different authorized merchants (e.g. Amazon, Nordstrom), click <em>Checkout at Merchant</em> on each item to complete payment securely on their platform.
                  </div>
                </div>

                {/* List */}
                {items.map(item => {
                  const unitPrice = item.product.salePrice ?? item.product.price;
                  const itemTotal = unitPrice * item.quantity;
                  const isRedirecting = redirectingId === item.product.id;

                  return (
                    <div
                      key={item.product.id}
                      className="p-3.5 bg-neutral-50/80 rounded-xl border border-neutral-200 flex flex-col space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg bg-neutral-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-0.5">
                            <span className="font-semibold uppercase">{item.product.brand}</span>
                            <span className="text-neutral-400 font-medium">via {item.product.affiliateNetwork}</span>
                          </div>
                          <h4 className="text-xs font-bold text-neutral-900 line-clamp-1">
                            {item.product.name}
                          </h4>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-xs font-bold text-neutral-900 tabular-nums">
                              ${unitPrice.toFixed(2)}
                            </span>
                            {item.quantity > 1 && (
                              <span className="text-[11px] text-neutral-500 tabular-nums">
                                (Total: ${itemTotal.toFixed(2)})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Controls and Merchant Checkout Row */}
                      <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-neutral-300 rounded-md overflow-hidden bg-white text-xs">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="px-2 py-0.5 hover:bg-neutral-100 text-neutral-700 font-bold"
                          >
                            -
                          </button>
                          <span className="w-7 text-center font-semibold tabular-nums text-neutral-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="px-2 py-0.5 hover:bg-neutral-100 text-neutral-700 font-bold"
                          >
                            +
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-neutral-400 hover:text-rose-600 p-1 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Direct Merchant Checkout Link */}
                        <button
                          onClick={() => handleCheckoutItem(item.product.id, item.product.affiliateUrl)}
                          disabled={isRedirecting}
                          className="py-1 px-3 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
                        >
                          <span>Checkout at {item.product.affiliateNetwork.split(' ')[0]}</span>
                          <ExternalLink className="w-3 h-3 opacity-80" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Footer Area with Subtotal */}
          {items.length > 0 && (
            <div className="p-5 border-t border-neutral-200 bg-neutral-50/50 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600 font-medium">Estimated Subtotal:</span>
                <span className="text-lg font-extrabold text-neutral-900 tabular-nums">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <p className="text-[11px] text-neutral-500 leading-normal">
                Taxes, shipping costs, and final payment are processed by each partner merchant at their official checkout.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={clearCart}
                  className="py-2.5 px-3 text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 rounded-lg transition-colors cursor-pointer text-center"
                >
                  Clear Bag
                </button>
                <button
                  onClick={closeCart}
                  className="py-2.5 px-3 text-xs font-bold text-neutral-900 bg-neutral-200 hover:bg-neutral-300 rounded-lg transition-colors cursor-pointer text-center"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
