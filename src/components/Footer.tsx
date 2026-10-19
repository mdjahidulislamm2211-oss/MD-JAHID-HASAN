import React from 'react';
import { ShieldCheck, Mail, MapPin, ExternalLink } from 'lucide-react';
import type { SiteSettings, Category } from '../types/index.js';
import { GadzonicLogo } from './GadzonicLogo.js';

interface FooterProps {
  settings: SiteSettings;
  categories: Category[];
  onNavigateCategory: (cat: string) => void;
  onOpenPage: (slug: string) => void;
  onOpenContact: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  categories,
  onNavigateCategory,
  onOpenPage,
  onOpenContact,
  onOpenAdmin
}) => {
  return (
    <footer className="bg-neutral-950 text-neutral-300 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand & Editorial Mission (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <GadzonicLogo size="md" imageSrc={settings.logo || '/src/assets/images/gadzonic_logo_1792334338384.jpg'} className="[&_span]:text-white" />
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              {settings.footer?.aboutText || 'Veritas Market is an independent editorial affiliate platform. We review and curate high-grade tech, audio, and home goods, directing shoppers to verified partner merchants without retail markup.'}
            </p>

            <div className="space-y-1.5 text-xs text-neutral-400 pt-2">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-neutral-500" />
                <span>{settings.contact?.email || 'editorial@veritasmarket.com'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                <span>{settings.contact?.address || 'New York, NY'}</span>
              </div>
            </div>
          </div>

          {/* Catalog Categories */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Curated Collections
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigateCategory('all')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  All Products
                </button>
              </li>
              {categories.map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => onNavigateCategory(cat.name)}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Consumer Transparency */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Transparency & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onOpenPage('affiliate-disclosure')}
                  className="hover:text-white transition-colors cursor-pointer text-amber-400 font-medium inline-flex items-center gap-1"
                >
                  <ShieldCheck className="w-3 h-3" />
                  Affiliate Disclosure
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPage('returns')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Returns & Refunds (Merchant)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPage('privacy')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPage('terms')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Terms and Conditions
                </button>
              </li>
            </ul>
          </div>

          {/* Information & Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Editorial & Help
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onOpenPage('about')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  About GADZONIC
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPage('faq')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenContact}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Contact Editorial Team
                </button>
              </li>
              <li className="pt-2 border-t border-neutral-800">
                <button
                  onClick={onOpenAdmin}
                  className="text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer font-mono text-[11px]"
                >
                  Admin Portal Login
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* FTC Affiliate Disclaimer Box in Footer */}
        <div className="mt-12 pt-8 border-t border-neutral-800/80">
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 leading-relaxed mb-6">
            <span className="font-semibold text-neutral-200">FTC Compliance Disclosure: </span>
            {settings.footer?.affiliateNoticeShort || 'Veritas Market is a participant in affiliate advertising programs. When you click links to various merchants on this site and make a purchase, this can result in this site earning a commission at no additional cost to you. Affiliate programs and affiliations include, but are not limited to, Amazon Associates, ShareASale, and merchant partner networks.'}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
            <p>{settings.footer?.copyright || '© 2026 Veritas Market Inc. All rights reserved.'}</p>
            <div className="flex items-center gap-4 text-neutral-400">
              <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                XML Sitemap
              </a>
              <span>·</span>
              <a href="/robots.txt" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                Robots.txt
              </a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
