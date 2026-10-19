import React from 'react';
import { ShieldCheck, CheckCircle2, DollarSign, Layers, ArrowRight } from 'lucide-react';

interface TrustSectionProps {
  onOpenDisclosure: () => void;
  onOpenAbout: () => void;
}

export const TrustSection: React.FC<TrustSectionProps> = ({ onOpenDisclosure, onOpenAbout }) => {
  return (
    <section className="bg-neutral-900 text-white py-16 sm:py-20 border-y border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-semibold tracking-wider uppercase text-amber-400">
            Our Editorial Standards
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
            Why Trust GADZONIC?
          </h2>
          <p className="text-sm text-neutral-300 mt-2 leading-relaxed">
            Unlike conventional stores, we do not warehouse inventory or inflate prices. Here is how our curated affiliate marketplace works for you.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div className="p-5 rounded-xl bg-neutral-950/60 border border-neutral-800 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Zero Retail Markup</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                You never pay a penny more. You pay the exact official price listed on Amazon, Nordstrom, Best Buy, or the brand’s site.
              </p>
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold mt-4">100% Price Equality</span>
          </div>

          <div className="p-5 rounded-xl bg-neutral-950/60 border border-neutral-800 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Verified Specs Only</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                We dissect materials, frequency responses, and tolerances. No dropshipped novelties or unverified claims.
              </p>
            </div>
            <span className="text-[11px] text-blue-400 font-semibold mt-4">Hardware Validated</span>
          </div>

          <div className="p-5 rounded-xl bg-neutral-950/60 border border-neutral-800 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">FTC Compliant Disclosure</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                We clearly disclose when a link is affiliated. Partner commissions fund our independent research team.
              </p>
            </div>
            <button
              onClick={onOpenDisclosure}
              className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold mt-4 inline-flex items-center gap-1 cursor-pointer text-left"
            >
              <span>Read Full Disclosure</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="p-5 rounded-xl bg-neutral-950/60 border border-neutral-800 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Authorized Fulfillment</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                All purchases are shipped, covered by warranty, and supported by established, authorized merchants.
              </p>
            </div>
            <button
              onClick={onOpenAbout}
              className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold mt-4 inline-flex items-center gap-1 cursor-pointer text-left"
            >
              <span>Our Editorial Mission</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
