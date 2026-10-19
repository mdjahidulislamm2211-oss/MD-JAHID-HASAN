import React, { useState } from 'react';
import { Mail, Check, ArrowRight } from 'lucide-react';

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubscribed(true);
  };

  return (
    <section className="py-16 bg-neutral-100/70 border-b border-neutral-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center mx-auto mb-4">
          <Mail className="w-5 h-5" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
          Curated Deal Briefings in Your Inbox
        </h2>
        <p className="text-sm text-neutral-600 mt-2 max-w-lg mx-auto">
          No spam, no affiliate clickbait. Just one weekly digest of price drops, rare batch releases, and verified merchant discount codes.
        </p>

        {subscribed ? (
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Thank you for subscribing! We'll keep you updated with honest picks.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email address..."
              required
              className="w-full sm:flex-1 px-4 py-2.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 text-neutral-900 placeholder-neutral-400"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm"
            >
              <span>Subscribe</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        <p className="text-[11px] text-neutral-400 mt-3">
          Unsubscribe anytime. We respect your inbox and never sell your contact information.
        </p>
      </div>
    </section>
  );
};
