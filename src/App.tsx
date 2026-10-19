import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext.js';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { api } from './services/api.js';
import type { Product, Category, SiteSettings, Testimonial } from './types/index.js';

import { Header } from './components/Header.js';
import { Hero } from './components/Hero.js';
import { CatalogSection } from './components/CatalogSection.js';
import { TrustSection } from './components/TrustSection.js';
import { TestimonialsSection } from './components/TestimonialsSection.js';
import { NewsletterSection } from './components/NewsletterSection.js';
import { Footer } from './components/Footer.js';
import { CartDrawer } from './components/CartDrawer.js';
import { ProductDetailModal } from './components/ProductDetailModal.js';
import { ContactModal } from './components/ContactModal.js';
import { PageModal } from './components/PageModal.js';
import { Toast } from './components/Toast.js';

import { AdminLogin } from './components/admin/AdminLogin.js';
import { AdminDashboard } from './components/admin/AdminDashboard.js';

function Storefront() {
  const { isAuthenticated } = useAuth();

  // App Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Navigation & Filtering States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Views
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activePageSlug, setActivePageSlug] = useState<string | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);

  // Initial Data Fetch
  const fetchData = async () => {
    try {
      const [prodRes, catRes, setRes, testRes] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getSiteSettings(),
        api.getTestimonials()
      ]);
      setProducts(prodRes.products);
      setCategories(catRes.categories);
      setSettings(setRes.settings);
      setTestimonials(testRes.testimonials);
    } catch (err) {
      console.error('Failed to load initial marketplace data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Check URL path or hash for direct navigation (e.g. /admin)
    if (window.location.pathname.startsWith('/admin') || window.location.hash === '#/admin') {
      setIsAdminView(true);
    }
  }, []);

  const handleNavigateCategory = (cat: string) => {
    setSelectedCategory(cat);
    const catalogElem = document.getElementById('catalog');
    if (catalogElem) {
      catalogElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExplore = () => {
    const catalogElem = document.getElementById('catalog');
    if (catalogElem) {
      catalogElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // If Admin mode is toggled
  if (isAdminView) {
    if (!isAuthenticated) {
      return <AdminLogin onBackToStore={() => setIsAdminView(false)} />;
    }
    return (
      <AdminDashboard
        onBackToStore={() => {
          setIsAdminView(false);
          fetchData(); // Reload latest products and settings
        }}
      />
    );
  }

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-neutral-500 font-medium">Loading GADZONIC...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      
      {/* 1. Header with Top Bar Contract & Announcement */}
      <Header
        settings={settings}
        onNavigateCategory={handleNavigateCategory}
        onOpenPage={(slug) => setActivePageSlug(slug)}
        onOpenContact={() => setIsContactOpen(true)}
        onOpenAdmin={() => setIsAdminView(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* 2. Hero Section */}
      <Hero
        settings={settings}
        onExplore={handleExplore}
        onOpenDisclosure={() => setActivePageSlug('affiliate-disclosure')}
      />

      {/* 3. Catalog Section (Products, Filters, Search, Dual Actions) */}
      <CatalogSection
        products={products}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenProductDetail={setSelectedProduct}
      />

      {/* 4. Trust & Editorial Standards Section */}
      <TrustSection
        onOpenDisclosure={() => setActivePageSlug('affiliate-disclosure')}
        onOpenAbout={() => setActivePageSlug('about')}
      />

      {/* 5. Verified Reader Testimonials */}
      <TestimonialsSection testimonials={testimonials} />

      {/* 6. Newsletter Subscription */}
      <NewsletterSection />

      {/* 7. Footer with FTC Compliance & Links */}
      <Footer
        settings={settings}
        categories={categories}
        onNavigateCategory={handleNavigateCategory}
        onOpenPage={(slug) => setActivePageSlug(slug)}
        onOpenContact={() => setIsContactOpen(true)}
        onOpenAdmin={() => setIsAdminView(true)}
      />

      {/* 8. Slide-Over Cart Drawer */}
      <CartDrawer
        onOpenDisclosure={() => setActivePageSlug('affiliate-disclosure')}
      />

      {/* 9. Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        allProducts={products}
        onClose={() => setSelectedProduct(null)}
        onSelectProduct={setSelectedProduct}
        onOpenDisclosure={() => setActivePageSlug('affiliate-disclosure')}
      />

      {/* 10. Legal & Informational Page Modal */}
      <PageModal
        slug={activePageSlug}
        onClose={() => setActivePageSlug(null)}
        onOpenContact={() => {
          setActivePageSlug(null);
          setIsContactOpen(true);
        }}
      />

      {/* 11. Customer Contact Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      {/* 12. Floating Add-to-Cart Toast */}
      <Toast />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Storefront />
      </CartProvider>
    </AuthProvider>
  );
}
