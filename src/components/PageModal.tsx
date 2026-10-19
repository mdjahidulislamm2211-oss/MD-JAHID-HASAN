import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, ChevronDown, Search } from 'lucide-react';
import { api } from '../services/api.js';
import type { PageContent } from '../types/index.js';

interface PageModalProps {
  slug: string | null;
  onClose: () => void;
  onOpenContact: () => void;
}

export const PageModal: React.FC<PageModalProps> = ({ slug, onClose, onOpenContact }) => {
  const [page, setPage] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [faqSearch, setFaqSearch] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.getPage(slug)
      .then(res => setPage(res.page))
      .catch(err => console.error('Failed to load page', err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (!slug) return null;

  // Format simple markdown into sections
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let currentKey = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={currentKey++} className="text-base font-bold text-neutral-900 mt-6 mb-2">
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('- ')) {
        elements.push(
          <li key={currentKey++} className="text-sm text-neutral-600 ml-4 list-disc mb-1 leading-relaxed">
            {line.replace('- ', '')}
          </li>
        );
      } else if (/^\d+\.\s/.test(line)) {
        elements.push(
          <li key={currentKey++} className="text-sm text-neutral-600 ml-4 list-decimal mb-1 leading-relaxed">
            {line.replace(/^\d+\.\s/, '')}
          </li>
        );
      } else {
        elements.push(
          <p key={currentKey++} className="text-sm text-neutral-600 leading-relaxed mb-3">
            {line}
          </p>
        );
      }
    }
    return elements;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-950/70 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-8 max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 flex items-start justify-between bg-neutral-50/70">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>GADZONIC Editorial Documentation</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">
              {page?.title || 'Informational Page'}
            </h2>
            {page?.subtitle && (
              <p className="text-xs text-neutral-500 mt-1">{page.subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-800 bg-white hover:bg-neutral-100 rounded-full border border-neutral-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          {loading ? (
            <div className="py-12 text-center text-xs text-neutral-400">Loading page details...</div>
          ) : page ? (
            <div className="prose prose-neutral max-w-none">
              {renderContent(page.content)}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-neutral-400">Content could not be loaded.</div>
          )}

          {/* Quick Help Footer */}
          <div className="mt-8 pt-6 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-3">
            <span>Have questions or found an outdated merchant listing?</span>
            <button
              onClick={() => {
                onClose();
                onOpenContact();
              }}
              className="px-3 py-1.5 font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors cursor-pointer"
            >
              Contact Our Editorial Team
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
