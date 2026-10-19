import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  MousePointerClick, 
  ShoppingCart, 
  FileText, 
  Settings, 
  Mail, 
  ShieldCheck, 
  LogOut, 
  ExternalLink, 
  Plus, 
  Edit3, 
  Trash2, 
  Download, 
  Check, 
  AlertCircle, 
  Search,
  Bell,
  RefreshCw,
  KeyRound,
  Eye,
  EyeOff,
  Upload,
  Lock,
  Sparkles,
  Store
} from 'lucide-react';
import { GadzonicLogo } from '../GadzonicLogo.js';
import { useAuth } from '../../context/AuthContext.js';
import { adminApi, api } from '../../services/api.js';
import type { 
  Product, 
  Category, 
  SiteSettings, 
  PageContent, 
  DashboardStats, 
  AffiliateClickEvent, 
  CartEvent, 
  ContactMessage, 
  EmailSettings, 
  NotificationLog 
} from '../../types/index.js';
import { ProductFormModal } from './ProductFormModal.js';

interface AdminDashboardProps {
  onBackToStore: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToStore }) => {
  const { adminUser, logout, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'categories' | 'clicks' | 'cart' | 'content' | 'pages' | 'messages' | 'email' | 'security'
  >('overview');

  // Dashboard Data State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [pages, setPages] = useState<PageContent[]>([]);
  const [clicks, setClicks] = useState<AffiliateClickEvent[]>([]);
  const [cartEvents, setCartEvents] = useState<CartEvent[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [emailSettings, setEmailSettings] = useState<EmailSettings | null>(null);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & UI States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Password Change
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passStatus, setPassStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [passError, setPassError] = useState('');

  // Secret Security Code State (Confidential)
  const [secretCode, setSecretCode] = useState<string>('');
  const [showSecretCode, setShowSecretCode] = useState(false);
  const [newSecretCode, setNewSecretCode] = useState('');
  const [secretStatus, setSecretStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [secretMsg, setSecretMsg] = useState('');

  // Logo upload state
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Selected Page for editing
  const [selectedPageSlug, setSelectedPageSlug] = useState('affiliate-disclosure');
  const [editingPageTitle, setEditingPageTitle] = useState('');
  const [editingPageContent, setEditingPageContent] = useState('');
  const [pageSaveSuccess, setPageSaveSuccess] = useState(false);

  // Email Test
  const [emailTesting, setEmailTesting] = useState(false);
  const [emailTestResult, setEmailTestResult] = useState<string | null>(null);

  // Load everything
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [
        statsRes,
        prodRes,
        catRes,
        settingsRes,
        pagesRes,
        clicksRes,
        cartRes,
        msgRes,
        emailRes,
        logsRes,
        secRes
      ] = await Promise.all([
        adminApi.getStats(),
        adminApi.getAllProducts(),
        adminApi.getCategories(),
        adminApi.getSettings(),
        adminApi.getPages(),
        adminApi.getAffiliateClicks(200),
        adminApi.getCartEvents(100),
        adminApi.getContactMessages(),
        adminApi.getEmailSettings(),
        adminApi.getNotificationLogs(100),
        adminApi.getSecurityCode().catch(() => ({ securityCode: 'GDZ-8899-SEC' }))
      ]);

      setStats(statsRes);
      setProducts(prodRes.products);
      setCategories(catRes.categories);
      setSettings(settingsRes.settings);
      setPages(pagesRes.pages);
      setClicks(clicksRes.clicks);
      setCartEvents(cartRes.events);
      setMessages(msgRes.messages);
      setEmailSettings(emailRes.settings);
      setNotificationLogs(logsRes.logs);
      if (secRes?.securityCode) {
        setSecretCode(secRes.securityCode);
      }

      // Preload selected page
      const defaultPage = pagesRes.pages.find(p => p.slug === 'affiliate-disclosure');
      if (defaultPage) {
        setSelectedPageSlug(defaultPage.slug);
        setEditingPageTitle(defaultPage.title);
        setEditingPageContent(defaultPage.content);
      }
    } catch (err) {
      console.error('Error loading admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Handle Save Product
  const handleSaveProduct = async (data: Partial<Product>) => {
    if (data.id) {
      await adminApi.updateProduct(data.id, data);
    } else {
      await adminApi.createProduct(data);
    }
    loadDashboardData();
  };

  // Handle Delete Product
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    await adminApi.deleteProduct(productToDelete.id);
    setProductToDelete(null);
    loadDashboardData();
  };

  // Handle Save Page
  const handleSavePage = async () => {
    if (!selectedPageSlug) return;
    await adminApi.updatePage(selectedPageSlug, {
      title: editingPageTitle,
      content: editingPageContent
    });
    setPageSaveSuccess(true);
    setTimeout(() => setPageSaveSuccess(false), 2500);
    loadDashboardData();
  };

  // Handle Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    await adminApi.updateSettings(settings);
    alert('Settings successfully updated.');
  };

  // Handle Save Email Settings
  const handleSaveEmailSettings = async () => {
    if (!emailSettings) return;
    await adminApi.updateEmailSettings(emailSettings);
    alert('Email notification preferences saved.');
  };

  // Trigger test email
  const handleTestEmail = async () => {
    setEmailTesting(true);
    setEmailTestResult(null);
    try {
      const res = await adminApi.testEmail();
      setEmailTestResult(`Status: ${res.status.toUpperCase()} – ${res.message}`);
      loadDashboardData();
    } catch (err: any) {
      setEmailTestResult(`Error: ${err.message}`);
    } finally {
      setEmailTesting(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassStatus('idle');
    setPassError('');
    try {
      await changePassword(currentPass, newPass);
      setPassStatus('success');
      setCurrentPass('');
      setNewPass('');
    } catch (err: any) {
      setPassStatus('error');
      setPassError(err.message || 'Failed to update password');
    }
  };

  // Update Secret Security Code
  const handleUpdateSecretCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSecretCode.trim() || newSecretCode.trim().length < 4) {
      setSecretStatus('error');
      setSecretMsg('Security code must be at least 4 characters long.');
      return;
    }
    setSecretStatus('idle');
    try {
      const res = await adminApi.updateSecurityCode(newSecretCode.trim());
      setSecretCode(res.securityCode);
      setNewSecretCode('');
      setSecretStatus('success');
      setSecretMsg('Secret security PIN updated successfully. Keep this code safe!');
    } catch (err: any) {
      setSecretStatus('error');
      setSecretMsg(err.message || 'Failed to update security code');
    }
  };

  // Upload Logo handler
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, SVG, WEBP)');
      return;
    }
    setUploadingLogo(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const dataUrl = evt.target?.result as string;
      try {
        const res = await adminApi.uploadImage(dataUrl, 'store_logo');
        if (settings) {
          const updated = { ...settings, logo: res.url };
          setSettings(updated);
          await adminApi.updateSettings(updated);
        }
      } catch (err: any) {
        if (settings) {
          const updated = { ...settings, logo: dataUrl };
          setSettings(updated);
          await adminApi.updateSettings(updated);
        }
      } finally {
        setUploadingLogo(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Filtered Products for admin table
  const adminFilteredProducts = products.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      
      {/* Top Navbar */}
      <header className="bg-neutral-900 text-white h-16 px-4 sm:px-6 flex items-center justify-between border-b border-neutral-800 shrink-0">
        <div className="flex items-center gap-3">
          <GadzonicLogo size="sm" showText={false} imageSrc="/src/assets/images/gadzonic_logo_1792334338384.jpg" />
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              <span>GADZONIC Console</span>
              <span className="text-[10px] bg-neutral-800 text-cyan-400 px-2 py-0.5 rounded font-mono">
                SECURE
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onBackToStore}
            className="px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </button>

          <span className="text-xs text-neutral-400 hidden sm:inline font-mono">
            {adminUser?.email}
          </span>

          <button
            onClick={logout}
            className="px-3 py-1.5 text-xs font-medium text-rose-300 hover:text-rose-100 bg-neutral-800 hover:bg-rose-950/60 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Layout: Sidebar + Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white border-r border-neutral-200/90 p-4 shrink-0 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-3 mb-2">
              Management
            </div>

            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-left ${
                activeTab === 'overview' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview & KPIs</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-left ${
                activeTab === 'products' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4" />
                <span>Products Catalog</span>
              </div>
              <span className="text-[11px] tabular-nums font-mono opacity-80">
                {products.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('clicks')}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-left ${
                activeTab === 'clicks' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MousePointerClick className="w-4 h-4" />
                <span>Affiliate Clicks</span>
              </div>
              <span className="text-[11px] tabular-nums font-mono opacity-80">
                {clicks.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('cart')}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-left ${
                activeTab === 'cart' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="w-4 h-4" />
                <span>Cart Activity</span>
              </div>
              <span className="text-[11px] tabular-nums font-mono opacity-80">
                {cartEvents.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-left ${
                activeTab === 'messages' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4" />
                <span>Customer Inquiries</span>
              </div>
              {messages.filter(m => m.status === 'unread').length > 0 && (
                <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {messages.filter(m => m.status === 'unread').length}
                </span>
              )}
            </button>

            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-3 mt-6 mb-2">
              Configuration
            </div>

            <button
              onClick={() => setActiveTab('content')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-left ${
                activeTab === 'content' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Site Branding & Hero</span>
            </button>

            <button
              onClick={() => setActiveTab('pages')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-left ${
                activeTab === 'pages' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Legal Pages & FAQ</span>
            </button>

            <button
              onClick={() => setActiveTab('email')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-left ${
                activeTab === 'email' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Email & Alerts</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-left ${
                activeTab === 'security' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Admin Security</span>
            </button>
          </div>

          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 text-[11px] text-neutral-500 mt-6">
            <span className="font-semibold text-neutral-900">GADZONIC Engine v2.4</span>
            <p className="mt-0.5">Database storage: <code className="text-neutral-700">data/store.json</code></p>
          </div>
        </aside>

        {/* Content Workspace Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          
          {loading ? (
            <div className="py-20 text-center text-xs text-neutral-500">
              Loading administration metrics...
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && stats && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">Marketplace Overview</h2>
                    <p className="text-xs text-neutral-500">Live operational stats and affiliate outbound performance</p>
                  </div>

                  {/* 4 Stat Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-white rounded-xl border border-neutral-200/90 shadow-sm">
                      <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Total Products</span>
                      <div className="text-2xl font-bold text-neutral-900 mt-1 tabular-nums">{stats.totalProducts}</div>
                      <span className="text-[11px] text-emerald-700 font-medium">{stats.publishedProducts} published · {stats.draftProducts} drafts</span>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-neutral-200/90 shadow-sm">
                      <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Affiliate Outbound Clicks</span>
                      <div className="text-2xl font-bold text-neutral-900 mt-1 tabular-nums text-amber-600">{stats.totalAffiliateClicks}</div>
                      <span className="text-[11px] text-neutral-500 font-medium">Recorded across PDP & Cart</span>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-neutral-200/90 shadow-sm">
                      <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Bag / Cart Additions</span>
                      <div className="text-2xl font-bold text-neutral-900 mt-1 tabular-nums text-blue-600">{stats.cartEventsCount}</div>
                      <span className="text-[11px] text-neutral-500 font-medium">Customer intent telemetry</span>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-neutral-200/90 shadow-sm">
                      <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Unread Inquiries</span>
                      <div className="text-2xl font-bold text-neutral-900 mt-1 tabular-nums">{stats.unreadContactMessages}</div>
                      <span className="text-[11px] text-neutral-500 font-medium">{stats.totalNotificationLogs} alerts in queue</span>
                    </div>
                  </div>

                  {/* Merchant & Product Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Clicks by Merchant */}
                    <div className="p-5 bg-white rounded-xl border border-neutral-200/90 shadow-sm">
                      <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-4">
                        Affiliate Clicks by Merchant Partner
                      </h3>
                      {stats.clicksByMerchant.length > 0 ? (
                        <div className="space-y-3">
                          {stats.clicksByMerchant.map(item => (
                            <div key={item.merchant} className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-neutral-800">{item.merchant}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono tabular-nums text-neutral-600 font-bold">{item.clicks} clicks</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-neutral-400 py-6 text-center">No outbound click events recorded yet.</p>
                      )}
                    </div>

                    {/* Top Clicked Products */}
                    <div className="p-5 bg-white rounded-xl border border-neutral-200/90 shadow-sm">
                      <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-4">
                        Top Performing Affiliate Products
                      </h3>
                      {stats.clicksByProduct.length > 0 ? (
                        <div className="space-y-3">
                          {stats.clicksByProduct.slice(0, 5).map(item => (
                            <div key={item.productId} className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-neutral-800 truncate max-w-[240px]">{item.productName}</span>
                              <span className="font-mono tabular-nums text-amber-700 font-bold">{item.clicks} clicks</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-neutral-400 py-6 text-center">No product clicks logged yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Recent Activity Feeds */}
                  <div className="p-5 bg-white rounded-xl border border-neutral-200/90 shadow-sm">
                    <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-4">
                      Recent Outbound Affiliate Referrals
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-neutral-200 text-neutral-400 font-medium">
                            <th className="pb-2">Timestamp</th>
                            <th className="pb-2">Product</th>
                            <th className="pb-2">Price</th>
                            <th className="pb-2">Merchant Partner</th>
                            <th className="pb-2">Trigger Source</th>
                            <th className="pb-2">Destination Host</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {stats.recentClicks.slice(0, 8).map(c => (
                            <tr key={c.id} className="text-neutral-700">
                              <td className="py-2.5 font-mono text-[11px] text-neutral-400">{new Date(c.timestamp).toLocaleTimeString()}</td>
                              <td className="py-2.5 font-semibold text-neutral-900 truncate max-w-[200px]">{c.productName}</td>
                              <td className="py-2.5 font-mono tabular-nums">${c.price.toFixed(2)}</td>
                              <td className="py-2.5">{c.affiliateNetwork}</td>
                              <td className="py-2.5 font-mono text-[10px] text-neutral-500">{c.source}</td>
                              <td className="py-2.5 text-neutral-500 font-mono text-[11px]">{c.destinationHost}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PRODUCTS */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-neutral-900">Products Catalog</h2>
                      <p className="text-xs text-neutral-500">Manage catalog products, verified prices, discounts, and affiliate links</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingProduct(null);
                        setIsProductModalOpen(true);
                      }}
                      className="px-4 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm w-fit"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Product</span>
                    </button>
                  </div>

                  {/* Search and Status Filters */}
                  <div className="p-4 bg-white rounded-xl border border-neutral-200/90 flex flex-wrap items-center justify-between gap-3">
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="text"
                        placeholder="Search product name, brand, SKU..."
                        value={productSearch}
                        onChange={e => setProductSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:bg-white focus:border-neutral-900"
                      />
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-neutral-500 font-medium">Status:</span>
                      <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="bg-neutral-50 border border-neutral-200 rounded-md px-2 py-1 text-xs font-medium cursor-pointer"
                      >
                        <option value="all">All ({products.length})</option>
                        <option value="published">Published</option>
                        <option value="draft">Drafts</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  {/* Products Table */}
                  <div className="bg-white rounded-xl border border-neutral-200/90 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="py-3 px-4">Item</th>
                            <th className="py-3 px-4">Brand / SKU</th>
                            <th className="py-3 px-4">Category</th>
                            <th className="py-3 px-4">Price</th>
                            <th className="py-3 px-4">Merchant Network</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {adminFilteredProducts.map(p => (
                            <tr key={p.id} className="hover:bg-neutral-50/60 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-md bg-neutral-100 shrink-0" />
                                  <span className="font-semibold text-neutral-900 line-clamp-1 max-w-[220px]">{p.name}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-bold text-neutral-800">{p.brand}</div>
                                <div className="font-mono text-[10px] text-neutral-400">{p.sku}</div>
                              </td>
                              <td className="py-3 px-4 text-neutral-600">{p.category}</td>
                              <td className="py-3 px-4">
                                <div className="font-mono font-bold text-neutral-900 tabular-nums">
                                  ${(p.salePrice ?? p.price).toFixed(2)}
                                </div>
                                {p.salePrice && (
                                  <div className="text-[10px] text-neutral-400 line-through tabular-nums">
                                    ${p.price.toFixed(2)}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-medium text-neutral-700">{p.affiliateNetwork}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                  p.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-700'
                                }`}>
                                  {p.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingProduct(p);
                                      setIsProductModalOpen(true);
                                    }}
                                    className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded cursor-pointer"
                                    title="Edit"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setProductToDelete(p)}
                                    className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: AFFILIATE CLICKS & EXPORT */}
              {activeTab === 'clicks' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-neutral-900">Affiliate Referral Logs</h2>
                      <p className="text-xs text-neutral-500">Every outbound click is validated and tracked without collecting sensitive customer PII</p>
                    </div>
                    <a
                      href="/api/admin/affiliate-clicks/export"
                      download
                      className="px-4 py-2 text-xs font-bold text-neutral-900 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm w-fit"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export CSV Report</span>
                    </a>
                  </div>

                  <div className="bg-white rounded-xl border border-neutral-200/90 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="py-3 px-4">Event ID</th>
                            <th className="py-3 px-4">Timestamp</th>
                            <th className="py-3 px-4">Product Name</th>
                            <th className="py-3 px-4">Price</th>
                            <th className="py-3 px-4">Partner Network</th>
                            <th className="py-3 px-4">Destination Host</th>
                            <th className="py-3 px-4">Source</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {clicks.map(c => (
                            <tr key={c.id} className="hover:bg-neutral-50">
                              <td className="py-3 px-4 font-mono text-[11px] text-neutral-400">{c.id}</td>
                              <td className="py-3 px-4 font-mono text-[11px] text-neutral-500">{new Date(c.timestamp).toLocaleString()}</td>
                              <td className="py-3 px-4 font-semibold text-neutral-900 truncate max-w-[200px]">{c.productName}</td>
                              <td className="py-3 px-4 font-mono tabular-nums">${c.price.toFixed(2)}</td>
                              <td className="py-3 px-4 font-medium text-neutral-700">{c.affiliateNetwork}</td>
                              <td className="py-3 px-4 font-mono text-neutral-500">{c.destinationHost}</td>
                              <td className="py-3 px-4 font-mono text-[10px] text-neutral-500">{c.source}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: CART ACTIVITY */}
              {activeTab === 'cart' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">Cart Interaction Activity</h2>
                    <p className="text-xs text-neutral-500">Live stream of customer bag additions and item changes</p>
                  </div>

                  <div className="bg-white rounded-xl border border-neutral-200/90 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="py-3 px-4">Timestamp</th>
                            <th className="py-3 px-4">Action</th>
                            <th className="py-3 px-4">Product</th>
                            <th className="py-3 px-4">Price</th>
                            <th className="py-3 px-4">Quantity</th>
                            <th className="py-3 px-4">Session Hash</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {cartEvents.map(evt => (
                            <tr key={evt.id} className="hover:bg-neutral-50">
                              <td className="py-3 px-4 font-mono text-[11px] text-neutral-400">{new Date(evt.timestamp).toLocaleString()}</td>
                              <td className="py-3 px-4 font-bold uppercase text-[10px] text-neutral-700">{evt.eventType}</td>
                              <td className="py-3 px-4 font-semibold text-neutral-900">{evt.productName}</td>
                              <td className="py-3 px-4 font-mono tabular-nums">${evt.price.toFixed(2)}</td>
                              <td className="py-3 px-4 font-mono">{evt.quantity}</td>
                              <td className="py-3 px-4 font-mono text-[11px] text-neutral-400">{evt.sessionId}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: WEBSITE CONTENT & BRANDING */}
              {activeTab === 'content' && settings && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">Website Content & Branding</h2>
                    <p className="text-xs text-neutral-500">Manage hero banners, announcement bar, contact info, and footer text</p>
                  </div>

                  <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-xl border border-neutral-200/90 shadow-sm space-y-6">
                    
                    {/* Brand Logo & Identity Section */}
                    <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 text-white space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-cyan-400" />
                          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                            Store Logo & Brand Emblem
                          </h3>
                        </div>
                        <span className="text-[10px] text-cyan-400 font-mono">Active Everywhere</span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-5 pt-1">
                        <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-center shrink-0">
                          <GadzonicLogo size="lg" imageSrc={settings.logo || '/src/assets/images/gadzonic_logo_1792334338384.jpg'} className="[&_span]:text-white" />
                        </div>

                        <div className="flex-1 w-full space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <label className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-cyan-300 text-xs font-semibold rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 border border-neutral-700">
                              <Upload className="w-3.5 h-3.5" />
                              <span>{uploadingLogo ? 'Uploading...' : 'Upload New Logo Image'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="hidden"
                              />
                            </label>

                            <button
                              type="button"
                              onClick={() => setSettings({ ...settings, logo: '/src/assets/images/gadzonic_logo_1792334338384.jpg' })}
                              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-lg transition-colors border border-neutral-700"
                            >
                              Reset to GADZONIC Official Logo
                            </button>
                          </div>

                          <div>
                            <input
                              type="text"
                              value={settings.logo || ''}
                              onChange={e => setSettings({ ...settings, logo: e.target.value })}
                              placeholder="Or paste external logo image URL..."
                              className="w-full px-3 py-1.5 text-xs bg-neutral-950 border border-neutral-700 rounded-lg text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-cyan-400"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                          Store Name
                        </label>
                        <input
                          type="text"
                          value={settings.storeName}
                          onChange={e => setSettings({ ...settings, storeName: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                          Tagline
                        </label>
                        <input
                          type="text"
                          value={settings.tagline}
                          onChange={e => setSettings({ ...settings, tagline: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                          Announcement Bar Text
                        </label>
                        <input
                          type="text"
                          value={settings.announcement?.text || ''}
                          onChange={e => setSettings({
                            ...settings,
                            announcement: { ...settings.announcement, text: e.target.value, enabled: true }
                          })}
                          className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                          Hero Title
                        </label>
                        <input
                          type="text"
                          value={settings.hero?.title || ''}
                          onChange={e => setSettings({
                            ...settings,
                            hero: { ...settings.hero, title: e.target.value }
                          })}
                          className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                          Hero Subtitle
                        </label>
                        <textarea
                          rows={2}
                          value={settings.hero?.subtitle || ''}
                          onChange={e => setSettings({
                            ...settings,
                            hero: { ...settings.hero, subtitle: e.target.value }
                          })}
                          className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                          Hero Banner Image URL
                        </label>
                        <input
                          type="text"
                          value={settings.hero?.bannerImage || ''}
                          onChange={e => setSettings({
                            ...settings,
                            hero: { ...settings.hero, bannerImage: e.target.value }
                          })}
                          className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                          Contact Email
                        </label>
                        <input
                          type="email"
                          value={settings.contact?.email || ''}
                          onChange={e => setSettings({
                            ...settings,
                            contact: { ...settings.contact, email: e.target.value }
                          })}
                          className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                          Support Hours
                        </label>
                        <input
                          type="text"
                          value={settings.contact?.supportHours || ''}
                          onChange={e => setSettings({
                            ...settings,
                            contact: { ...settings.contact, supportHours: e.target.value }
                          })}
                          placeholder="e.g. Mon–Fri, 9am–6pm EST"
                          className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                          Contact Address
                        </label>
                        <input
                          type="text"
                          value={settings.contact?.address || ''}
                          onChange={e => setSettings({
                            ...settings,
                            contact: { ...settings.contact, address: e.target.value }
                          })}
                          className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg"
                        />
                      </div>

                      {/* Social Links */}
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                          Twitter / X Handle or URL
                        </label>
                        <input
                          type="text"
                          value={settings.socialLinks?.twitter || ''}
                          onChange={e => setSettings({
                            ...settings,
                            socialLinks: { ...settings.socialLinks, twitter: e.target.value }
                          })}
                          placeholder="https://twitter.com/gadzonic"
                          className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg font-mono text-[11px]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                          Instagram URL
                        </label>
                        <input
                          type="text"
                          value={settings.socialLinks?.instagram || ''}
                          onChange={e => setSettings({
                            ...settings,
                            socialLinks: { ...settings.socialLinks, instagram: e.target.value }
                          })}
                          placeholder="https://instagram.com/gadzonic"
                          className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg font-mono text-[11px]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                          Footer Affiliate Disclaimer
                        </label>
                        <textarea
                          rows={3}
                          value={settings.footer?.affiliateNoticeShort || ''}
                          onChange={e => setSettings({
                            ...settings,
                            footer: { ...settings.footer, affiliateNoticeShort: e.target.value }
                          })}
                          className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-neutral-200">
                      <button
                        type="submit"
                        className="px-5 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                      >
                        Save Settings
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 6: PAGES & LEGAL */}
              {activeTab === 'pages' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">Legal Pages & FAQ</h2>
                    <p className="text-xs text-neutral-500">Edit affiliate disclosures, returns information, terms, privacy, and FAQs</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Page selector */}
                    <div className="bg-white p-3 rounded-xl border border-neutral-200/90 space-y-1">
                      {pages.map(p => (
                        <button
                          key={p.slug}
                          onClick={() => {
                            setSelectedPageSlug(p.slug);
                            setEditingPageTitle(p.title);
                            setEditingPageContent(p.content);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                            selectedPageSlug === p.slug ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-100'
                          }`}
                        >
                          {p.title}
                        </button>
                      ))}
                    </div>

                    {/* Page Editor */}
                    <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-neutral-200/90 shadow-sm space-y-4">
                      {pageSaveSuccess && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Page updated successfully!</span>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                          Page Title
                        </label>
                        <input
                          type="text"
                          value={editingPageTitle}
                          onChange={e => setEditingPageTitle(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                          Page Body (Markdown / Structured Text)
                        </label>
                        <textarea
                          rows={14}
                          value={editingPageContent}
                          onChange={e => setEditingPageContent(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg font-mono leading-relaxed"
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={handleSavePage}
                          className="px-5 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                        >
                          Update Page
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: CUSTOMER MESSAGES */}
              {activeTab === 'messages' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">Customer Support Inquiries</h2>
                    <p className="text-xs text-neutral-500">Inquiries submitted via the Contact form</p>
                  </div>

                  <div className="bg-white rounded-xl border border-neutral-200/90 shadow-sm overflow-hidden">
                    {messages.length === 0 ? (
                      <div className="p-8 text-center text-xs text-neutral-400">
                        No customer messages received yet.
                      </div>
                    ) : (
                      <div className="divide-y divide-neutral-200">
                        {messages.map(msg => (
                          <div key={msg.id} className="p-5 flex flex-col space-y-2 hover:bg-neutral-50/50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-neutral-900">{msg.name}</span>
                                <span className="text-xs text-neutral-500 font-mono">({msg.email})</span>
                              </div>
                              <span className="text-[11px] text-neutral-400 font-mono">
                                {new Date(msg.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <div className="text-xs font-semibold text-neutral-800">{msg.subject}</div>
                            <p className="text-xs text-neutral-600 leading-relaxed bg-neutral-50 p-3 rounded-lg border border-neutral-200/60">
                              {msg.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 8: EMAIL & ALERTS */}
              {activeTab === 'email' && emailSettings && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">Email & Notification Alerts</h2>
                    <p className="text-xs text-neutral-500">Configure administrator notification recipient and delivery parameters</p>
                  </div>

                  {/* API Key Status Notice */}
                  {!emailSettings.apiKeyConfigured ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-amber-950">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>External Email API Key Status: Not Set (Pending Configuration)</span>
                      </div>
                      <p className="leading-relaxed">
                        Neither <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">RESEND_API_KEY</code> nor <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">SENDGRID_API_KEY</code> is detected in server environment variables.
                      </p>
                      <p className="text-[11px] text-amber-800">
                        All cart and affiliate notifications are safely captured and visible in your local database log queue below so no customer activity is lost.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Live email delivery is configured and active with Resend / SendGrid provider.</span>
                    </div>
                  )}

                  {/* Settings form */}
                  <div className="bg-white p-6 rounded-xl border border-neutral-200/90 shadow-sm space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                        Notification Recipient Email
                      </label>
                      <input
                        type="email"
                        value={emailSettings.recipientEmail}
                        onChange={e => setEmailSettings({ ...emailSettings, recipientEmail: e.target.value })}
                        className="w-full max-w-md px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg"
                      />
                    </div>

                    <div className="space-y-2 pt-2">
                      <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                        Send Notification When:
                      </span>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-medium text-neutral-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={emailSettings.notifyOnAddToCart}
                            onChange={e => setEmailSettings({ ...emailSettings, notifyOnAddToCart: e.target.checked })}
                            className="rounded text-neutral-900"
                          />
                          <span>A customer adds a product to their bag</span>
                        </label>

                        <label className="flex items-center gap-2 text-xs font-medium text-neutral-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={emailSettings.notifyOnBuyNow}
                            onChange={e => setEmailSettings({ ...emailSettings, notifyOnBuyNow: e.target.checked })}
                            className="rounded text-neutral-900"
                          />
                          <span>A customer clicks "Buy Now" to visit external merchant</span>
                        </label>

                        <label className="flex items-center gap-2 text-xs font-medium text-neutral-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={emailSettings.notifyOnCartMerchantClick}
                            onChange={e => setEmailSettings({ ...emailSettings, notifyOnCartMerchantClick: e.target.checked })}
                            className="rounded text-neutral-900"
                          />
                          <span>A customer clicks a merchant link from within the cart drawer</span>
                        </label>

                        <label className="flex items-center gap-2 text-xs font-medium text-neutral-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={emailSettings.notifyOnContactMessage}
                            onChange={e => setEmailSettings({ ...emailSettings, notifyOnContactMessage: e.target.checked })}
                            className="rounded text-neutral-900"
                          />
                          <span>A customer submits the Contact Form</span>
                        </label>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-neutral-200 flex items-center gap-3">
                      <button
                        onClick={handleSaveEmailSettings}
                        className="px-4 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg cursor-pointer"
                      >
                        Save Preferences
                      </button>

                      <button
                        onClick={handleTestEmail}
                        disabled={emailTesting}
                        className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg cursor-pointer flex items-center gap-1.5"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${emailTesting ? 'animate-spin' : ''}`} />
                        <span>Trigger Test Alert</span>
                      </button>

                      {emailTestResult && (
                        <span className="text-xs text-neutral-600 font-mono">{emailTestResult}</span>
                      )}
                    </div>
                  </div>

                  {/* Notification Log Stream */}
                  <div className="bg-white rounded-xl border border-neutral-200/90 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-neutral-200 bg-neutral-50/70">
                      <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                        Recent Notification Logs ({notificationLogs.length})
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-neutral-50/50 text-neutral-500 font-bold uppercase text-[10px]">
                          <tr>
                            <th className="py-2.5 px-4">Timestamp</th>
                            <th className="py-2.5 px-4">Type</th>
                            <th className="py-2.5 px-4">Subject</th>
                            <th className="py-2.5 px-4">Recipient</th>
                            <th className="py-2.5 px-4">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {notificationLogs.slice(0, 15).map(log => (
                            <tr key={log.id}>
                              <td className="py-2.5 px-4 font-mono text-[11px] text-neutral-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                              <td className="py-2.5 px-4 font-bold text-[10px] uppercase text-neutral-700">{log.type}</td>
                              <td className="py-2.5 px-4 text-neutral-800">{log.subject}</td>
                              <td className="py-2.5 px-4 font-mono text-[11px] text-neutral-500">{log.recipient}</td>
                              <td className="py-2.5 px-4">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                  log.status === 'sent' ? 'bg-emerald-100 text-emerald-800' :
                                  log.status === 'mock_logged' ? 'bg-amber-100 text-amber-800' : 'bg-neutral-100 text-neutral-600'
                                }`}>
                                  {log.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 9: ADMIN SECURITY */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">Administrator Security & Secret Access Key</h2>
                    <p className="text-xs text-neutral-500">Manage your private master security code and update administrator password</p>
                  </div>

                  {/* 1. MASTER SECRET SECURITY CODE (CONFIDENTIAL) */}
                  <div className="bg-neutral-900 text-white p-6 rounded-2xl border border-neutral-800 shadow-xl max-w-2xl space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center">
                          <KeyRound className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                            Secret Security Code (গোপন নিরাপত্তা কোড)
                          </h3>
                          <p className="text-[11px] text-neutral-400">
                            Required on the login screen. Never shown to visitors or in public code.
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-cyan-950/80 border border-cyan-800 text-cyan-400 text-[10px] font-bold rounded-full uppercase tracking-wider font-mono">
                        Protected
                      </span>
                    </div>

                    {secretStatus === 'success' && (
                      <div className="p-3 bg-emerald-950/70 border border-emerald-800 text-emerald-300 rounded-lg text-xs flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{secretMsg}</span>
                      </div>
                    )}

                    {secretStatus === 'error' && (
                      <div className="p-3 bg-rose-950/70 border border-rose-800 text-rose-300 rounded-lg text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{secretMsg}</span>
                      </div>
                    )}

                    {/* Current Secret Code Display (Masked with Eye Toggle) */}
                    <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                          Active Secret Security Code
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowSecretCode(!showSecretCode)}
                          className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-medium"
                        >
                          {showSecretCode ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Hide Code</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>Reveal Secret Code</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-between font-mono">
                        <span className="text-sm font-bold text-cyan-300 tracking-widest">
                          {showSecretCode ? (secretCode || 'GDZ-8899-SEC') : '••••••••••••'}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(secretCode || 'GDZ-8899-SEC');
                              alert('Secret Security Code copied to clipboard!');
                            }}
                            className="px-2.5 py-1 text-[11px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded cursor-pointer"
                          >
                            Copy Code
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-neutral-400 leading-relaxed pt-1">
                        🔒 <strong>গোপনীয়তা তথ্য:</strong> এই কোডটি শুধুমাত্র আপনাকে দেওয়া হয়েছে। সাধারণ ভিজিটর বা কাস্টমাররা এটি কোথাও দেখতে পারবে না। এডমিন প্যানেলে লগইন করার সময় ইমেইল ও পাসওয়ার্ডের সাথে এই গোপন কোডটি লাগবে।
                      </p>
                    </div>

                    {/* Change Security Code Form */}
                    <form onSubmit={handleUpdateSecretCode} className="pt-2 border-t border-neutral-800 space-y-3">
                      <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
                        Set New Secret Security Code
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newSecretCode}
                          onChange={e => setNewSecretCode(e.target.value)}
                          placeholder="e.g. GDZ-9900-SEC or custom PIN"
                          className="flex-1 px-3.5 py-2 text-xs bg-neutral-950 border border-neutral-700 rounded-lg text-white font-mono placeholder-neutral-600 focus:outline-none focus:border-cyan-400"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 text-xs font-bold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer shrink-0"
                        >
                          Update Code
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* 2. UPDATE ADMINISTRATOR PASSWORD */}
                  <div className="bg-white p-6 rounded-2xl border border-neutral-200/90 shadow-sm max-w-2xl space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                      <Lock className="w-4 h-4 text-neutral-700" />
                      <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                        Update Administrator Password
                      </h3>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-4">
                      {passStatus === 'success' && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Administrator password updated successfully.</span>
                        </div>
                      )}

                      {passStatus === 'error' && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-600" />
                          <span>{passError}</span>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          required
                          value={currentPass}
                          onChange={e => setCurrentPass(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                          New Password (minimum 8 characters)
                        </label>
                        <input
                          type="password"
                          required
                          value={newPass}
                          onChange={e => setNewPass(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          className="px-5 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg cursor-pointer transition-colors"
                        >
                          Update Password
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </>
          )}

        </main>
      </div>

      {/* Product Create/Edit Modal */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        product={editingProduct}
        categories={categories}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
      />

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-neutral-200 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-neutral-900">Delete Product?</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Are you sure you want to permanently remove <strong>{productToDelete.name}</strong> from the catalog? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
