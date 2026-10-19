export interface Product {
  id: string;
  sku: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  currency: string;
  category: string;
  subcategory?: string;
  brand: string;
  tags: string[];
  image: string;
  gallery: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  affiliateNetwork: string;
  affiliateUrl: string;
  specifications: Array<{ key: string; value: string }>;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  status: 'published' | 'draft' | 'archived';
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  order: number;
}

export interface SiteSettings {
  storeName: string;
  tagline: string;
  logo?: string;
  announcement: {
    enabled: boolean;
    text: string;
    link?: string;
  };
  hero: {
    title: string;
    subtitle: string;
    badge: string;
    ctaText: string;
    ctaLink: string;
    secondaryCtaText: string;
    secondaryCtaLink: string;
    bannerImage: string;
  };
  contact: {
    email: string;
    supportHours: string;
    address: string;
  };
  socialLinks: {
    twitter?: string;
    instagram?: string;
    github?: string;
    youtube?: string;
  };
  colors: {
    primary: string;
    accent: string;
  };
  footer: {
    aboutText: string;
    copyright: string;
    affiliateNoticeShort: string;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
  addedAt: string;
}

export interface AffiliateClickEvent {
  id: string;
  productId: string;
  productName: string;
  price: number;
  affiliateNetwork: string;
  affiliateUrl: string;
  destinationHost: string;
  source: 'pdp_buy_now' | 'card_buy_now' | 'cart_checkout_item' | 'featured_deal';
  sessionId: string;
  timestamp: string;
}

export interface CartEvent {
  id: string;
  eventType: 'add_to_cart' | 'remove_from_cart' | 'update_quantity' | 'clear_cart';
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  sessionId: string;
  timestamp: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
}

export interface PageContent {
  slug: string;
  title: string;
  subtitle: string;
  content: string;
  updatedAt: string;
}

export interface EmailSettings {
  recipientEmail: string;
  notifyOnAddToCart: boolean;
  notifyOnBuyNow: boolean;
  notifyOnCartMerchantClick: boolean;
  notifyOnContactMessage: boolean;
  provider: 'resend' | 'sendgrid' | 'smtp' | 'system_queue';
  apiKeyConfigured: boolean;
}

export interface NotificationLog {
  id: string;
  type: 'add_to_cart' | 'buy_now' | 'cart_merchant_click' | 'contact_form' | 'admin_alert';
  subject: string;
  recipient: string;
  status: 'sent' | 'queued' | 'mock_logged' | 'failed';
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'editor';
  lastLogin?: string;
}

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  company?: string;
  avatar?: string;
  content: string;
  rating: number;
  verified: boolean;
}

export interface DashboardStats {
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  totalAffiliateClicks: number;
  recentClicks: AffiliateClickEvent[];
  clicksByProduct: Array<{ productId: string; productName: string; clicks: number }>;
  clicksByMerchant: Array<{ merchant: string; clicks: number }>;
  cartEventsCount: number;
  recentCartEvents: CartEvent[];
  unreadContactMessages: number;
  totalNotificationLogs: number;
}
