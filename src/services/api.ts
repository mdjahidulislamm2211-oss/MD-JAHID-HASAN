import type { 
  Product, 
  Category, 
  SiteSettings, 
  PageContent, 
  Testimonial, 
  DashboardStats, 
  AffiliateClickEvent, 
  CartEvent, 
  ContactMessage, 
  EmailSettings, 
  NotificationLog 
} from '../types/index.js';

// Get or generate an anonymous session ID for tracking
export function getSessionId(): string {
  let sid = localStorage.getItem('vm_session_id');
  if (!sid) {
    sid = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('vm_session_id', sid);
  }
  return sid;
}

// Public API
export const api = {
  async getProducts(params?: { category?: string; search?: string; sort?: string; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    
    const res = await fetch(`/api/products?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json() as Promise<{ products: Product[]; total: number }>;
  },

  async getProduct(slugOrId: string) {
    const res = await fetch(`/api/products/${slugOrId}`);
    if (!res.ok) throw new Error('Failed to fetch product');
    return res.json() as Promise<{ product: Product }>;
  },

  async getCategories() {
    const res = await fetch('/api/categories');
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json() as Promise<{ categories: Category[] }>;
  },

  async getSiteSettings() {
    const res = await fetch('/api/site-settings');
    if (!res.ok) throw new Error('Failed to fetch site settings');
    return res.json() as Promise<{ settings: SiteSettings }>;
  },

  async getPage(slug: string) {
    const res = await fetch(`/api/pages/${slug}`);
    if (!res.ok) throw new Error('Failed to fetch page content');
    return res.json() as Promise<{ page: PageContent }>;
  },

  async getTestimonials() {
    const res = await fetch('/api/testimonials');
    if (!res.ok) throw new Error('Failed to fetch testimonials');
    return res.json() as Promise<{ testimonials: Testimonial[] }>;
  },

  async sendContactMessage(data: { name: string; email: string; subject: string; message: string }) {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit contact message');
    }
    return res.json() as Promise<{ success: boolean; message: string }>;
  },

  async trackAffiliateClick(productId: string, source: 'pdp_buy_now' | 'card_buy_now' | 'cart_checkout_item' | 'featured_deal') {
    const res = await fetch('/api/affiliate/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        source,
        sessionId: getSessionId()
      })
    });
    if (!res.ok) throw new Error('Failed to track click');
    return res.json() as Promise<{ success: boolean; eventId: string; affiliateUrl: string }>;
  },

  async trackCartEvent(eventType: 'add_to_cart' | 'remove_from_cart' | 'update_quantity', productId: string, quantity: number) {
    try {
      await fetch('/api/cart/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          productId,
          quantity,
          sessionId: getSessionId()
        })
      });
    } catch (e) {
      console.warn('Cart tracking silent failure', e);
    }
  }
};

// Admin API
function getAdminHeaders() {
  const token = localStorage.getItem('vm_admin_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

export const adminApi = {
  async login(email: string, password: string, securityCode: string) {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, securityCode })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Authentication failed');
    }
    return res.json() as Promise<{ success: boolean; token: string; user: any }>;
  },

  async checkAuth() {
    const res = await fetch('/api/admin/me', { headers: getAdminHeaders() });
    if (!res.ok) throw new Error('Not authenticated');
    return res.json() as Promise<{ user: any }>;
  },

  async getSecurityCode() {
    const res = await fetch('/api/admin/security-code', { headers: getAdminHeaders() });
    if (!res.ok) throw new Error('Failed to retrieve security code');
    return res.json() as Promise<{ securityCode: string }>;
  },

  async updateSecurityCode(newSecurityCode: string) {
    const res = await fetch('/api/admin/security-code', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify({ newSecurityCode })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update security code');
    }
    return res.json() as Promise<{ success: boolean; securityCode: string; message: string }>;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const res = await fetch('/api/admin/change-password', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Password update failed');
    }
    return res.json();
  },

  async getStats() {
    const res = await fetch('/api/admin/stats', { headers: getAdminHeaders() });
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json() as Promise<DashboardStats>;
  },

  async uploadImage(dataUrl: string, filename?: string) {
    const res = await fetch('/api/admin/upload-image', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify({ dataUrl, filename })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to upload image');
    }
    return res.json() as Promise<{ success: boolean; url: string }>;
  },

  // Products
  async getAllProducts(params?: { category?: string; search?: string; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.status) searchParams.set('status', params.status);

    const res = await fetch(`/api/admin/products?${searchParams.toString()}`, { headers: getAdminHeaders() });
    if (!res.ok) throw new Error('Failed to fetch admin products');
    return res.json() as Promise<{ products: Product[] }>;
  },

  async createProduct(product: Partial<Product>) {
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(product)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create product');
    }
    return res.json() as Promise<{ success: boolean; product: Product }>;
  },

  async updateProduct(id: string, product: Partial<Product>) {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(product)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update product');
    }
    return res.json() as Promise<{ success: boolean; product: Product }>;
  },

  async deleteProduct(id: string) {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete product');
    return res.json() as Promise<{ success: boolean }>;
  },

  // Categories
  async getCategories() {
    const res = await fetch('/api/admin/categories', { headers: getAdminHeaders() });
    return res.json() as Promise<{ categories: Category[] }>;
  },

  async saveCategory(cat: Partial<Category>) {
    const method = cat.id ? 'PUT' : 'POST';
    const url = cat.id ? `/api/admin/categories/${cat.id}` : '/api/admin/categories';
    const res = await fetch(url, {
      method,
      headers: getAdminHeaders(),
      body: JSON.stringify(cat)
    });
    if (!res.ok) throw new Error('Failed to save category');
    return res.json();
  },

  async deleteCategory(id: string) {
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    return res.json();
  },

  // Settings
  async getSettings() {
    const res = await fetch('/api/admin/settings', { headers: getAdminHeaders() });
    return res.json() as Promise<{ settings: SiteSettings }>;
  },

  async updateSettings(settings: Partial<SiteSettings>) {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(settings)
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json() as Promise<{ success: boolean; settings: SiteSettings }>;
  },

  // Pages
  async getPages() {
    const res = await fetch('/api/admin/pages', { headers: getAdminHeaders() });
    return res.json() as Promise<{ pages: PageContent[] }>;
  },

  async updatePage(slug: string, data: Partial<PageContent>) {
    const res = await fetch(`/api/admin/pages/${slug}`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update page');
    return res.json() as Promise<{ success: boolean; page: PageContent }>;
  },

  // Testimonials
  async getTestimonials() {
    const res = await fetch('/api/admin/testimonials', { headers: getAdminHeaders() });
    return res.json() as Promise<{ testimonials: Testimonial[] }>;
  },

  async saveTestimonial(item: Partial<Testimonial>) {
    const method = item.id ? 'PUT' : 'POST';
    const url = item.id ? `/api/admin/testimonials/${item.id}` : '/api/admin/testimonials';
    const res = await fetch(url, {
      method,
      headers: getAdminHeaders(),
      body: JSON.stringify(item)
    });
    return res.json();
  },

  async deleteTestimonial(id: string) {
    const res = await fetch(`/api/admin/testimonials/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    return res.json();
  },

  // Affiliate Clicks
  async getAffiliateClicks(limit = 200) {
    const res = await fetch(`/api/admin/affiliate-clicks?limit=${limit}`, { headers: getAdminHeaders() });
    return res.json() as Promise<{ clicks: AffiliateClickEvent[] }>;
  },

  // Cart Events
  async getCartEvents(limit = 100) {
    const res = await fetch(`/api/admin/cart-events?limit=${limit}`, { headers: getAdminHeaders() });
    return res.json() as Promise<{ events: CartEvent[] }>;
  },

  // Contact Messages
  async getContactMessages() {
    const res = await fetch('/api/admin/contact-messages', { headers: getAdminHeaders() });
    return res.json() as Promise<{ messages: ContactMessage[] }>;
  },

  async updateContactMessageStatus(id: string, status: 'unread' | 'read' | 'replied') {
    const res = await fetch(`/api/admin/contact-messages/${id}/status`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  // Email Settings
  async getEmailSettings() {
    const res = await fetch('/api/admin/email-settings', { headers: getAdminHeaders() });
    return res.json() as Promise<{ settings: EmailSettings }>;
  },

  async updateEmailSettings(settings: Partial<EmailSettings>) {
    const res = await fetch('/api/admin/email-settings', {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(settings)
    });
    return res.json();
  },

  async testEmail() {
    const res = await fetch('/api/admin/email-settings/test', {
      method: 'POST',
      headers: getAdminHeaders()
    });
    return res.json();
  },

  async getNotificationLogs(limit = 100) {
    const res = await fetch(`/api/admin/notification-logs?limit=${limit}`, { headers: getAdminHeaders() });
    return res.json() as Promise<{ logs: NotificationLog[] }>;
  }
};
