import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db, verifyPassword, generateAuthToken, verifyAuthToken } from './server/db.js';
import { dispatchEmailNotification } from './server/emailService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Authentication Middleware for Admin routes
function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.substring(7);
  const verified = verifyAuthToken(token);
  if (!verified) {
    return res.status(401).json({ error: 'Unauthorized: Session expired or invalid' });
  }

  const user = db.findAdminById(verified.userId);
  if (!user) {
    return res.status(403).json({ error: 'Forbidden: Admin user not found' });
  }

  (req as any).user = user;
  next();
}

// URL Validator helper for affiliate links to prevent malicious open redirects
function isValidAffiliateUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

// ==========================================
// PUBLIC API ROUTES
// ==========================================

// 1. Get products (public only published)
app.get('/api/products', (req: Request, res: Response) => {
  const { category, search, sort, tag, limit } = req.query;
  let products = db.getProducts({
    status: 'published',
    category: category as string,
    search: search as string
  });

  if (tag) {
    products = products.filter(p => p.tags.includes(tag as string));
  }

  // Sorting
  if (sort === 'price_asc') {
    products.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
  } else if (sort === 'price_desc') {
    products.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
  } else if (sort === 'rating') {
    products.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'discount') {
    products.sort((a, b) => {
      const discA = a.salePrice ? (a.price - a.salePrice) / a.price : 0;
      const discB = b.salePrice ? (b.price - b.salePrice) / b.price : 0;
      return discB - discA;
    });
  } else {
    // default: newest first
    products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  if (limit) {
    products = products.slice(0, parseInt(limit as string, 10));
  }

  res.json({ products, total: products.length });
});

// 2. Get single product by id or slug
app.get('/api/products/:slugOrId', (req: Request, res: Response) => {
  const item = db.getProductByIdOrSlug(req.params.slugOrId);
  if (!item || item.status !== 'published') {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ product: item });
});

// 3. Get categories
app.get('/api/categories', (_req: Request, res: Response) => {
  res.json({ categories: db.getCategories() });
});

// 4. Get site settings
app.get('/api/site-settings', (_req: Request, res: Response) => {
  res.json({ settings: db.getSiteSettings() });
});

// 5. Get informational & legal pages
app.get('/api/pages/:slug', (req: Request, res: Response) => {
  const page = db.getPage(req.params.slug);
  if (!page) {
    return res.status(404).json({ error: 'Page not found' });
  }
  res.json({ page });
});

// 6. Get verified customer testimonials
app.get('/api/testimonials', (_req: Request, res: Response) => {
  res.json({ testimonials: db.getTestimonials() });
});

// 7. Contact form submission
app.post('/api/contact', async (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const saved = db.recordContactMessage({ name, email, subject: subject || 'General Inquiry', message });

  // Trigger email notification to store owner
  dispatchEmailNotification({
    type: 'contact_form',
    subject: `New Contact Form Inquiry: ${subject || 'General'}`,
    customerName: name,
    customerEmail: email,
    messageText: message
  }).catch(err => console.error('Contact notification error:', err));

  res.json({ success: true, message: 'Your message has been received. Our editorial team will review it shortly.' });
});

// 8. Affiliate Outbound Click Tracking & Safe Redirect Endpoint
app.post('/api/affiliate/click', async (req: Request, res: Response) => {
  const { productId, source, sessionId } = req.body;
  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  const product = db.getProductByIdOrSlug(productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (!isValidAffiliateUrl(product.affiliateUrl)) {
    return res.status(400).json({ error: 'Configured destination URL is invalid or unsafe' });
  }

  let destHost = 'external-merchant';
  try {
    destHost = new URL(product.affiliateUrl).hostname;
  } catch {}

  // Record click event
  const recorded = db.recordAffiliateClick({
    productId: product.id,
    productName: product.name,
    price: product.salePrice ?? product.price,
    affiliateNetwork: product.affiliateNetwork,
    affiliateUrl: product.affiliateUrl,
    destinationHost: destHost,
    source: source || 'card_buy_now',
    sessionId: sessionId || 'anon'
  });

  // Trigger email notification
  const eventType = source === 'cart_checkout_item' ? 'cart_merchant_click' : 'buy_now';
  dispatchEmailNotification({
    type: eventType,
    subject: `Outbound Affiliate Click: ${product.name}`,
    productName: product.name,
    productId: product.sku || product.id,
    price: product.salePrice ?? product.price,
    affiliateNetwork: product.affiliateNetwork,
    destinationHost: destHost,
    sessionId: sessionId || 'anon',
    productUrl: `${process.env.APP_URL || ''}/product/${product.slug}`
  }).catch(err => console.error('Affiliate click email error:', err));

  res.json({
    success: true,
    eventId: recorded.id,
    affiliateUrl: product.affiliateUrl
  });
});

// Outbound direct link handler: /api/affiliate/redirect/:productId
app.get('/api/affiliate/redirect/:productId', async (req: Request, res: Response) => {
  const product = db.getProductByIdOrSlug(req.params.productId);
  if (!product || !isValidAffiliateUrl(product.affiliateUrl)) {
    return res.status(404).send('Invalid affiliate destination');
  }

  let destHost = 'merchant';
  try {
    destHost = new URL(product.affiliateUrl).hostname;
  } catch {}

  db.recordAffiliateClick({
    productId: product.id,
    productName: product.name,
    price: product.salePrice ?? product.price,
    affiliateNetwork: product.affiliateNetwork,
    affiliateUrl: product.affiliateUrl,
    destinationHost: destHost,
    source: 'pdp_buy_now',
    sessionId: (req.query.session as string) || 'anon'
  });

  dispatchEmailNotification({
    type: 'buy_now',
    subject: `Outbound Affiliate Click: ${product.name}`,
    productName: product.name,
    productId: product.sku || product.id,
    price: product.salePrice ?? product.price,
    affiliateNetwork: product.affiliateNetwork,
    destinationHost: destHost,
    sessionId: (req.query.session as string) || 'anon'
  }).catch(err => console.error('Affiliate redirect email error:', err));

  res.redirect(302, product.affiliateUrl);
});

// 9. Cart Event Tracking & Notification
app.post('/api/cart/event', (req: Request, res: Response) => {
  const { eventType, productId, quantity, sessionId } = req.body;
  if (!productId || !eventType) {
    return res.status(400).json({ error: 'Missing event details' });
  }

  const product = db.getProductByIdOrSlug(productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const recorded = db.recordCartEvent({
    eventType,
    productId: product.id,
    productName: product.name,
    price: product.salePrice ?? product.price,
    quantity: quantity || 1,
    sessionId: sessionId || 'anon'
  });

  if (eventType === 'add_to_cart') {
    dispatchEmailNotification({
      type: 'add_to_cart',
      subject: `Cart Activity: Added ${product.name}`,
      productName: product.name,
      productId: product.sku || product.id,
      price: product.salePrice ?? product.price,
      quantity: quantity || 1,
      affiliateNetwork: product.affiliateNetwork,
      sessionId: sessionId || 'anon',
      productUrl: `${process.env.APP_URL || ''}/product/${product.slug}`
    }).catch(err => console.error('Cart add email error:', err));
  }

  res.json({ success: true, eventId: recorded.id });
});

// ==========================================
// ADMIN AUTHENTICATION
// ==========================================

app.post('/api/admin/login', (req: Request, res: Response) => {
  const { email, password, securityCode } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (!securityCode || !db.verifySecurityCode(securityCode)) {
    return res.status(401).json({ error: 'Access denied: Invalid secret security code.' });
  }

  const user = db.findAdminByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid administrator credentials.' });
  }

  const isValid = verifyPassword(password, user.passwordHash, user.salt);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid administrator credentials.' });
  }

  db.updateAdminLogin(user.id);
  const token = generateAuthToken(user.id);

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      lastLogin: new Date().toISOString()
    }
  });
});

app.get('/api/admin/me', requireAdminAuth, (req: Request, res: Response) => {
  res.json({ user: (req as any).user });
});

app.get('/api/admin/security-code', requireAdminAuth, (_req: Request, res: Response) => {
  res.json({ securityCode: db.getSecurityCode() });
});

app.post('/api/admin/security-code', requireAdminAuth, (req: Request, res: Response) => {
  const { newSecurityCode } = req.body;
  if (!newSecurityCode || newSecurityCode.trim().length < 4) {
    return res.status(400).json({ error: 'Security code must be at least 4 characters long' });
  }
  const ok = db.updateSecurityCode(newSecurityCode);
  res.json({ success: ok, securityCode: db.getSecurityCode(), message: 'Secret security code updated successfully' });
});

app.post('/api/admin/change-password', requireAdminAuth, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const user = (req as any).user;
  const dbUser = db.findAdminByEmail(user.email);
  if (!dbUser || !verifyPassword(currentPassword, dbUser.passwordHash, dbUser.salt)) {
    return res.status(400).json({ error: 'Current password incorrect' });
  }

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' });
  }

  db.updateAdminPassword(user.id, newPassword);
  res.json({ success: true, message: 'Password updated successfully' });
});

// ==========================================
// PROTECTED ADMIN CRUD & MANAGEMENT
// ==========================================

app.get('/api/admin/stats', requireAdminAuth, (_req: Request, res: Response) => {
  res.json(db.getDashboardStats());
});

// Image Upload endpoint for Product creation and editing
app.post('/api/admin/upload-image', requireAdminAuth, (req: Request, res: Response) => {
  const { dataUrl, filename } = req.body;
  if (!dataUrl) {
    return res.status(400).json({ error: 'Missing image data' });
  }

  try {
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      // If already a direct URL or path, return as is
      return res.json({ success: true, url: dataUrl });
    }

    const ext = matches[1].includes('png') ? 'png' : matches[1].includes('webp') ? 'webp' : 'jpg';
    const buffer = Buffer.from(matches[2], 'base64');

    if (buffer.length > 8 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image exceeds 8MB limit' });
    }

    const imagesDir = path.resolve(process.cwd(), 'src/assets/images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    const cleanName = (filename || 'product')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .substring(0, 30);
    const savedFilename = `upload_${cleanName}_${Date.now()}.${ext}`;
    const filePath = path.join(imagesDir, savedFilename);

    fs.writeFileSync(filePath, buffer);
    const publicUrl = `/src/assets/images/${savedFilename}`;

    res.json({ success: true, url: publicUrl });
  } catch (err: any) {
    console.error('Image upload failed:', err);
    res.status(500).json({ error: err.message || 'Image processing failed' });
  }
});

// Product Management
app.get('/api/admin/products', requireAdminAuth, (req: Request, res: Response) => {
  const { category, search, status } = req.query;
  const list = db.getProducts({
    status: status as string,
    category: category as string,
    search: search as string
  });
  res.json({ products: list });
});

app.post('/api/admin/products', requireAdminAuth, (req: Request, res: Response) => {
  const body = req.body;
  if (!body.name || body.price === undefined) {
    return res.status(400).json({ error: 'Product name and price are required' });
  }
  if (body.affiliateUrl && !isValidAffiliateUrl(body.affiliateUrl)) {
    return res.status(400).json({ error: 'Invalid affiliate destination URL (must start with http:// or https://)' });
  }
  const saved = db.saveProduct(body);
  res.json({ success: true, product: saved });
});

app.put('/api/admin/products/:id', requireAdminAuth, (req: Request, res: Response) => {
  const body = req.body;
  if (body.affiliateUrl && !isValidAffiliateUrl(body.affiliateUrl)) {
    return res.status(400).json({ error: 'Invalid affiliate destination URL' });
  }
  const updated = db.saveProduct({ ...body, id: req.params.id });
  res.json({ success: true, product: updated });
});

app.delete('/api/admin/products/:id', requireAdminAuth, (req: Request, res: Response) => {
  const deleted = db.deleteProduct(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Product not found' });
  res.json({ success: true });
});

// Category Management
app.get('/api/admin/categories', requireAdminAuth, (_req: Request, res: Response) => {
  res.json({ categories: db.getCategories() });
});

app.post('/api/admin/categories', requireAdminAuth, (req: Request, res: Response) => {
  if (!req.body.name) return res.status(400).json({ error: 'Category name is required' });
  const saved = db.saveCategory(req.body);
  res.json({ success: true, category: saved });
});

app.put('/api/admin/categories/:id', requireAdminAuth, (req: Request, res: Response) => {
  const updated = db.saveCategory({ ...req.body, id: req.params.id });
  res.json({ success: true, category: updated });
});

app.delete('/api/admin/categories/:id', requireAdminAuth, (req: Request, res: Response) => {
  const deleted = db.deleteCategory(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Category not found' });
  res.json({ success: true });
});

// Settings Management
app.get('/api/admin/settings', requireAdminAuth, (_req: Request, res: Response) => {
  res.json({ settings: db.getSiteSettings() });
});

app.put('/api/admin/settings', requireAdminAuth, (req: Request, res: Response) => {
  const updated = db.updateSiteSettings(req.body);
  res.json({ success: true, settings: updated });
});

// Pages Management
app.get('/api/admin/pages', requireAdminAuth, (_req: Request, res: Response) => {
  res.json({ pages: db.getAllPages() });
});

app.put('/api/admin/pages/:slug', requireAdminAuth, (req: Request, res: Response) => {
  const updated = db.updatePage(req.params.slug, req.body);
  res.json({ success: true, page: updated });
});

// Testimonials Management
app.get('/api/admin/testimonials', requireAdminAuth, (_req: Request, res: Response) => {
  res.json({ testimonials: db.getTestimonials() });
});

app.post('/api/admin/testimonials', requireAdminAuth, (req: Request, res: Response) => {
  if (!req.body.author || !req.body.content) {
    return res.status(400).json({ error: 'Author and content are required' });
  }
  const saved = db.saveTestimonial(req.body);
  res.json({ success: true, testimonial: saved });
});

app.put('/api/admin/testimonials/:id', requireAdminAuth, (req: Request, res: Response) => {
  const updated = db.saveTestimonial({ ...req.body, id: req.params.id });
  res.json({ success: true, testimonial: updated });
});

app.delete('/api/admin/testimonials/:id', requireAdminAuth, (req: Request, res: Response) => {
  const deleted = db.deleteTestimonial(req.params.id);
  res.json({ success: deleted });
});

// Affiliate Reports & CSV Export
app.get('/api/admin/affiliate-clicks', requireAdminAuth, (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 200;
  res.json({ clicks: db.getAffiliateClicks(limit) });
});

app.get('/api/admin/affiliate-clicks/export', requireAdminAuth, (_req: Request, res: Response) => {
  const clicks = db.getAffiliateClicks(5000);
  const headers = ['Event ID', 'Product SKU/ID', 'Product Name', 'Price', 'Merchant Network', 'Destination Host', 'Source', 'Session ID', 'Timestamp'];
  const rows = clicks.map(c => [
    `"${c.id}"`,
    `"${c.productId}"`,
    `"${(c.productName || '').replace(/"/g, '""')}"`,
    c.price,
    `"${(c.affiliateNetwork || '').replace(/"/g, '""')}"`,
    `"${c.destinationHost}"`,
    `"${c.source}"`,
    `"${c.sessionId}"`,
    `"${c.timestamp}"`
  ]);
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="veritas_affiliate_clicks_${Date.now()}.csv"`);
  res.send(csvContent);
});

// Cart Events Log
app.get('/api/admin/cart-events', requireAdminAuth, (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
  res.json({ events: db.getCartEvents(limit) });
});

// Contact Inquiries
app.get('/api/admin/contact-messages', requireAdminAuth, (_req: Request, res: Response) => {
  res.json({ messages: db.getContactMessages() });
});

app.put('/api/admin/contact-messages/:id/status', requireAdminAuth, (req: Request, res: Response) => {
  const { status } = req.body;
  if (!['unread', 'read', 'replied'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const ok = db.updateContactMessageStatus(req.params.id, status);
  res.json({ success: ok });
});

// Email Settings & Test Email
app.get('/api/admin/email-settings', requireAdminAuth, (_req: Request, res: Response) => {
  res.json({ settings: db.getEmailSettings() });
});

app.put('/api/admin/email-settings', requireAdminAuth, (req: Request, res: Response) => {
  const updated = db.updateEmailSettings(req.body);
  res.json({ success: true, settings: updated });
});

app.post('/api/admin/email-settings/test', requireAdminAuth, async (_req: Request, res: Response) => {
  const result = await dispatchEmailNotification({
    type: 'admin_alert',
    subject: 'Veritas Market Test Notification Alert',
    productName: 'Test Event - Verification Suite',
    productId: 'TEST-SKU-001',
    price: 99.00,
    affiliateNetwork: 'Veritas Partner Network',
    sessionId: 'test_admin_session'
  });
  res.json(result);
});

app.get('/api/admin/notification-logs', requireAdminAuth, (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
  res.json({ logs: db.getNotificationLogs(limit) });
});

// ==========================================
// SEO: SITEMAP & ROBOTS.TXT
// ==========================================

app.get('/sitemap.xml', (_req: Request, res: Response) => {
  const baseUrl = process.env.APP_URL || 'https://veritasmarket.com';
  const products = db.getProducts({ status: 'published' });
  const staticPages = ['', 'catalog', 'affiliate-disclosure', 'about', 'contact', 'faq', 'privacy', 'terms', 'returns'];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
  .map(
    page => `  <url>
    <loc>${baseUrl}/${page}</loc>
    <changefreq>daily</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`
  )
  .join('\n')}
${products
  .map(
    p => `  <url>
    <loc>${baseUrl}/product/${p.slug}</loc>
    <lastmod>${new Date(p.updatedAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.send(xml);
});

app.get('/robots.txt', (_req: Request, res: Response) => {
  const baseUrl = process.env.APP_URL || 'https://veritasmarket.com';
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/admin/

Sitemap: ${baseUrl}/sitemap.xml`;
  res.setHeader('Content-Type', 'text/plain');
  res.send(robots);
});

// ==========================================
// VITE / STATIC SERVING
// ==========================================

async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Veritas Market server running on port ${PORT} (Prod: ${isProd})`);
  });
}

startServer();
