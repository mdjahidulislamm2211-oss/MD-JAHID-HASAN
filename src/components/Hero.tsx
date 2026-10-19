import React from 'react';
import { ArrowDown, ExternalLink, ShieldCheck, CheckCircle2, Zap } from 'lucide-react';
import type { SiteSettings } from '../types/index.js';

interface HeroProps {
  settings: SiteSettings;
  onExplore: () => void;
  onOpenDisclosure: () => void;
}

export const Hero: React.FC<HeroProps> = ({ settings, onExplore, onOpenDisclosure }) => {
  const heroImage = settings.hero?.bannerImage || '/src/assets/images/hero_curated_lifestyle_1792332920466.jpg';

  return (
    <section className="relative overflow-hidden bg-neutral-950 text-white">
      {/* Background Hero Image with Measured Gradient Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Curated workspace and premium lifestyle gear"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-40 scale-105 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-neutral-950/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div className="max-w-3xl">
          {/* Subtle Editorial Kicker */}
          <div className="inline-flex items-center gap-2 text-xs font-medium text-neutral-300 uppercase tracking-wider mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>{settings.hero?.badge || 'Spring 2026 Curated Selection'}</span>
            <span aria-hidden="true">·</span>
            <span>Verified Marketplace Deals</span>
          </div>

          {/* Headline with balanced wrap */}
          <h1 
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15] mb-6"
            style={{ textWrap: 'balance' }}
          >
            {settings.hero?.title || 'Curated Goods for Intentional Living'}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-2xl mb-8 font-normal">
            {settings.hero?.subtitle || 'We test and catalog exceptional workspace tools, acoustic gear, and artisanal lifestyle essentials from authorized global merchants with 100% transparent pricing.'}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onExplore}
              className="px-6 py-3 text-sm font-semibold text-neutral-950 bg-white hover:bg-neutral-100 rounded-lg transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2 cursor-pointer"
            >
              <span>{settings.hero?.ctaText || 'Explore Catalog'}</span>
              <ArrowDown className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenDisclosure}
              className="px-5 py-3 text-sm font-medium text-neutral-200 hover:text-white bg-neutral-900/80 hover:bg-neutral-800/80 border border-neutral-700/80 rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer backdrop-blur-sm"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{settings.hero?.secondaryCtaText || 'Affiliate Transparency'}</span>
            </button>
          </div>
        </div>

        {/* 3-Column Trust Bar strip pinned below the hero text */}
        <div className="mt-16 pt-8 border-t border-neutral-800/80 grid grid-cols-1 md:grid-cols-3 gap-6 text-neutral-300">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-white">Zero Retail Markup</h3>
              <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                You always pay the official merchant checkout price or discounted partner rate.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ExternalLink className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-white">Direct Merchant Links</h3>
              <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                Orders are fulfilled directly by verified authorized sellers with official manufacturer warranties.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-white">Verified Durability & Specs</h3>
              <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                Every spec, acoustic profile, and material is checked against genuine production hardware.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
