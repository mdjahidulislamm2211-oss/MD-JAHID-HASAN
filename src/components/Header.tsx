import React, { useState } from 'react';
import { ShoppingBag, Search, ShieldCheck, Menu, X, ArrowUpRight } from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import type { SiteSettings } from '../types/index.js';
import { GadzonicLogo } from './GadzonicLogo.js';

interface HeaderProps {
  settings: SiteSettings;
  onNavigateCategory: (catSlug: string) => void;
  onOpenPage: (pageSlug: string) => void;
  onOpenContact: () => void;
  onOpenAdmin: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onNavigateCategory,
  onOpenPage,
  onOpenContact,
  onOpenAdmin,
  searchQuery,
  onSearchChange
}) => {
  const { itemCount, openCart } = useCart();
  const [showAnnouncement, setShowAnnouncement] = useState(settings.announcement?.enabled ?? true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80">
      {/* 1. Optional Slim Announcement Bar */}
      {showAnnouncement && settings.announcement?.text && (
        <div className="bg-neutral-900 text-neutral-200 text-xs py-2 px-4 flex items-center justify-between border-b border-neutral-800">
          <div className="max-w-7xl mx-auto flex items-center justify-center text-center gap-2 flex-1">
            <span className="font-normal tracking-wide">{settings.announcement.text}</span>
            {settings.announcement.link && (
              <button
                onClick={() => onOpenPage('affiliate-disclosure')}
                className="underline hover:text-white transition-colors cursor-pointer font-medium inline-flex items-center gap-0.5 ml-1"
              >
                Learn more <ArrowUpRight className="w-3 h-3 inline" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowAnnouncement(false)}
            className="text-neutral-400 hover:text-white p-1 text-xs transition-colors shrink-0"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Top Bar Contract: 3 distinct zones separated by gap-8 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          
          {/* Zone 1: Single text element wordmark with GADZONIC logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateCategory('all')}
              className="group whitespace-nowrap shrink-0 flex items-center text-left cursor-pointer"
            >
              <GadzonicLogo size="md" imageSrc={settings.logo || '/src/assets/images/gadzonic_logo_1792334338384.jpg'} />
            </button>
          </div>

          {/* Zone 2: 4-5 single-line clean text navigation links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-neutral-600">
            <button
              onClick={() => onNavigateCategory('all')}
              className="hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              All Products
            </button>
            <button
              onClick={() => onNavigateCategory('Audio & Acoustics')}
              className="hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Audio & Acoustics
            </button>
            <button
              onClick={() => onNavigateCategory('Workspace & Tech')}
              className="hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Workspace Tech
            </button>
            <button
              onClick={() => onNavigateCategory('Home & Living')}
              className="hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Home & Living
            </button>
            <button
              onClick={() => onOpenPage('affiliate-disclosure')}
              className="hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1 text-neutral-500"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Affiliate Disclosure
            </button>
          </nav>

          {/* Zone 3: Interactive Affordances (Search, Cart, Admin shortcut) */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Search Input on Desktop */}
            <div className="relative hidden md:block w-48 lg:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search verified deals..."
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-100 hover:bg-neutral-100/80 focus:bg-white rounded-md border border-transparent focus:border-neutral-300 focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2 text-neutral-600 hover:text-neutral-900 rounded-md hover:bg-neutral-100"
              aria-label="Toggle search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Shopping Bag Button with count */}
            <button
              onClick={openCart}
              className="relative p-2 text-neutral-700 hover:text-neutral-900 rounded-md hover:bg-neutral-100 transition-colors flex items-center cursor-pointer"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-neutral-900 text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center tabular-nums shadow-sm">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Admin Portal Gateway */}
            <button
              onClick={onOpenAdmin}
              className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200/80 rounded-md transition-colors whitespace-nowrap shrink-0 hidden sm:inline-flex items-center gap-1.5"
            >
              <span>Admin Portal</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-neutral-600 hover:text-neutral-900 rounded-md hover:bg-neutral-100"
              aria-label="Open navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Search Bar Expand */}
        {isSearchOpen && (
          <div className="py-2 pb-3 md:hidden border-t border-neutral-100">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search products, brands, specs..."
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-100 rounded-md border border-neutral-200 focus:outline-none focus:bg-white"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-neutral-200 px-4 pt-2 pb-6 space-y-3">
          <div className="flex flex-col space-y-2 text-sm font-medium text-neutral-700">
            <button
              onClick={() => { onNavigateCategory('all'); setMobileMenuOpen(false); }}
              className="text-left py-2 px-3 rounded hover:bg-neutral-100 transition-colors"
            >
              All Products
            </button>
            <button
              onClick={() => { onNavigateCategory('Audio & Acoustics'); setMobileMenuOpen(false); }}
              className="text-left py-2 px-3 rounded hover:bg-neutral-100 transition-colors"
            >
              Audio & Acoustics
            </button>
            <button
              onClick={() => { onNavigateCategory('Workspace & Tech'); setMobileMenuOpen(false); }}
              className="text-left py-2 px-3 rounded hover:bg-neutral-100 transition-colors"
            >
              Workspace Tech
            </button>
            <button
              onClick={() => { onNavigateCategory('Home & Living'); setMobileMenuOpen(false); }}
              className="text-left py-2 px-3 rounded hover:bg-neutral-100 transition-colors"
            >
              Home & Living
            </button>
            <button
              onClick={() => { onOpenPage('affiliate-disclosure'); setMobileMenuOpen(false); }}
              className="text-left py-2 px-3 rounded hover:bg-neutral-100 transition-colors flex items-center gap-2 text-emerald-700"
            >
              <ShieldCheck className="w-4 h-4" />
              Affiliate Disclosure
            </button>
            <button
              onClick={() => { onOpenContact(); setMobileMenuOpen(false); }}
              className="text-left py-2 px-3 rounded hover:bg-neutral-100 transition-colors"
            >
              Customer Support
            </button>
            <button
              onClick={() => { onOpenAdmin(); setMobileMenuOpen(false); }}
              className="text-left py-2 px-3 rounded bg-neutral-100 text-neutral-900 font-semibold"
            >
              Admin Portal
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
