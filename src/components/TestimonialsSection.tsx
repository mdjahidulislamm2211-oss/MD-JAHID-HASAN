import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';
import type { Testimonial } from '../types/index.js';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials }) => {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="py-16 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-wider font-semibold text-neutral-500">
            Reader Community & Verification
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mt-1">
            Endorsed by Designers & Engineers
          </h2>
          <p className="text-sm text-neutral-600 mt-2">
            Verified feedback from industry professionals who rely on our curated specifications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map(item => (
            <div
              key={item.id}
              className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200/90 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 mb-4 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < item.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`}
                    />
                  ))}
                </div>

                <p className="text-sm text-neutral-700 leading-relaxed italic mb-6">
                  "{item.content}"
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-200/60 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">{item.author}</h4>
                  <p className="text-xs text-neutral-500">
                    {item.role}{item.company ? ` · ${item.company}` : ''}
                  </p>
                </div>

                {item.verified && (
                  <span className="text-[11px] text-emerald-700 font-medium inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
