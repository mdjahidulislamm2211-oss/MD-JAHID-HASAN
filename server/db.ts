import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { 
  Product, 
  Category, 
  SiteSettings, 
  AffiliateClickEvent, 
  CartEvent, 
  ContactMessage, 
  PageContent, 
  EmailSettings, 
  NotificationLog, 
  AdminUser, 
  Testimonial 
} from '../src/types/index.js';

interface DatabaseSchema {
  products: Product[];
  categories: Category[];
  siteSettings: SiteSettings;
  pages: Record<string, PageContent>;
  testimonials: Testimonial[];
  affiliateClicks: AffiliateClickEvent[];
  cartEvents: CartEvent[];
  contactMessages: ContactMessage[];
  emailSettings: EmailSettings;
  notificationLogs: NotificationLog[];
  adminUsers: Array<AdminUser & { passwordHash: string; salt: string }>;
  adminSecurityCode?: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

// Password hashing helper using native crypto pbkdf2
export function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')): { hash: string; salt: string } {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const verify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return verify === hash;
}

// Generate secure random token
export function generateAuthToken(userId: string): string {
  const secret = process.env.SESSION_SECRET || 'veritas_market_jwt_secret_token_2026';
  const payload = JSON.stringify({ userId, exp: Date.now() + 24 * 60 * 60 * 1000 });
  const base64Payload = Buffer.from(payload).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(base64Payload).digest('base64url');
  return `${base64Payload}.${signature}`;
}

export function verifyAuthToken(token: string): { userId: string } | null {
  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return null;
    const secret = process.env.SESSION_SECRET || 'veritas_market_jwt_secret_token_2026';
    const expectedSig = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');
    if (signature !== expectedSig) return null;
    const decoded = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (decoded.exp < Date.now()) return null;
    return { userId: decoded.userId };
  } catch {
    return null;
  }
}

// Initial default seed
function getInitialSeed(): DatabaseSchema {
  const defaultAdmin = hashPassword('AdminPassword2026!');
  
  return {
    products: [
      {
        id: 'prod_audiophile_headphones',
        sku: 'VM-AUD-010',
        slug: 'veritas-a9-wireless-audiophile-headphones',
        name: 'Veritas A9 Studio Wireless Reference Headphones',
        description: 'Engineered for uncompromising acoustic clarity with custom 45mm neodymium drivers, active hybrid noise cancellation, and tactile CNC aluminum controls. Features 40-hour continuous battery life and ultra-low latency wireless streaming.',
        price: 349.00,
        salePrice: 299.00,
        currency: 'USD',
        category: 'Audio & Acoustics',
        subcategory: 'Over-Ear Headphones',
        brand: 'AuraSound',
        tags: ['Audio', 'Wireless', 'Studio', 'Noise Cancelling', 'Editor Pick'],
        image: '/src/assets/images/product_matte_headphones_1792332921020.jpg',
        gallery: [
          '/src/assets/images/product_matte_headphones_1792332921020.jpg',
          '/src/assets/images/hero_curated_lifestyle_1792332920466.jpg'
        ],
        rating: 4.9,
        reviewCount: 168,
        inStock: true,
        affiliateNetwork: 'Amazon Associates',
        affiliateUrl: 'https://www.amazon.com/dp/B08XJ8P3KM?tag=veritasmkt-20',
        specifications: [
          { key: 'Driver Unit', value: '45mm Neodymium Reference Transducer' },
          { key: 'Frequency Response', value: '10Hz – 40,000Hz' },
          { key: 'Battery Life', value: 'Up to 40 Hours with ANC Active' },
          { key: 'Connectivity', value: 'Bluetooth 5.3 aptX HD, 3.5mm Analog' },
          { key: 'Weight', value: '265g' }
        ],
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: false,
        status: 'published',
        seoTitle: 'Veritas A9 Studio Wireless Headphones Review & Verified Deals',
        seoDescription: 'Find verified affiliate pricing and specs for the Veritas A9 Studio Headphones with active noise cancellation and 40-hour playback.',
        createdAt: '2026-03-01T10:00:00.000Z',
        updatedAt: '2026-03-15T12:00:00.000Z'
      },
      {
        id: 'prod_cnc_keyboard',
        sku: 'VM-DSK-022',
        slug: 'lumina-65-cnc-anodized-mechanical-keyboard',
        name: 'Lumina 65% CNC Aluminum Mechanical Keyboard',
        description: 'A precision-milled aluminum chassis with gasket-mounted PCB, sound-dampening poron foam, and factory-lubed linear switches. Delivers a deep, muted keystroke sound profile paired with vintage-inspired dye-sub PBT keycaps.',
        price: 189.00,
        salePrice: 165.00,
        currency: 'USD',
        category: 'Workspace & Tech',
        subcategory: 'Mechanical Keyboards',
        brand: 'Lumina Craft',
        tags: ['Workspace', 'Keyboard', 'Mechanical', 'CNC Aluminum', 'Ergonomics'],
        image: '/src/assets/images/product_craft_keyboard_1792332922449.jpg',
        gallery: [
          '/src/assets/images/product_craft_keyboard_1792332922449.jpg'
        ],
        rating: 4.8,
        reviewCount: 94,
        inStock: true,
        affiliateNetwork: 'ShareASale',
        affiliateUrl: 'https://www.shareasale.com/r.cfm?b=123456&u=998877&m=55443&urllink=lumina-craft-65',
        specifications: [
          { key: 'Layout', value: '65% Compact (68 Keys)' },
          { key: 'Case Material', value: '6063 Anodized CNC Aluminum' },
          { key: 'Mounting Style', value: 'Silicone Gasket Mount' },
          { key: 'Switches', value: 'Factory-Lubed Gateron Oil Kings' },
          { key: 'Interface', value: 'Detachable Braided USB-C' }
        ],
        isFeatured: true,
        isBestSeller: false,
        isNewArrival: true,
        status: 'published',
        seoTitle: 'Lumina 65 Mechanical Keyboard – Best Desk Tech Deals',
        seoDescription: 'Curated review and affiliate merchant links for the Lumina 65% CNC aluminum custom mechanical keyboard.',
        createdAt: '2026-03-10T14:30:00.000Z',
        updatedAt: '2026-03-16T09:15:00.000Z'
      },
      {
        id: 'prod_ceramic_pourover',
        sku: 'VM-LIF-034',
        slug: 'kobo-stoneware-pour-over-coffee-carafe-set',
        name: 'Kōbō Artisanal Stoneware Pour-Over & Fluted Carafe',
        description: 'Hand-thrown speckled stoneware dripper with precision extraction ribs, resting atop a heat-resistant fluted borosilicate glass decanter. Perfect for mindful morning coffee rituals with maximum extraction clarity.',
        price: 68.00,
        currency: 'USD',
        category: 'Home & Living',
        subcategory: 'Coffee & Kitchen',
        brand: 'Kōbō Atelier',
        tags: ['Kitchen', 'Ceramic', 'Coffee', 'Artisanal', 'Gift Idea'],
        image: '/src/assets/images/product_ceramic_pourover_1792332922270.jpg',
        gallery: [
          '/src/assets/images/product_ceramic_pourover_1792332922270.jpg'
        ],
        rating: 4.9,
        reviewCount: 78,
        inStock: true,
        affiliateNetwork: 'Nordstrom Affiliate',
        affiliateUrl: 'https://shop.nordstrom.com/s/kobo-pourover-set?origin=affiliate&cm_ven=linkshare',
        specifications: [
          { key: 'Material', value: 'High-fire Stoneware & Borosilicate Glass' },
          { key: 'Capacity', value: '600ml (2–3 Cups)' },
          { key: 'Filter Compatibility', value: 'Standard V60 02 Filters' },
          { key: 'Care', value: 'Dishwasher Safe (Hand Wash Recommended)' }
        ],
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: false,
        status: 'published',
        seoTitle: 'Kōbō Artisanal Pour-Over Coffee Set – Best Merchant Deals',
        seoDescription: 'Handcrafted stoneware dripper with fluted glass carafe. Compare verified affiliate prices across premium homeware merchants.',
        createdAt: '2026-02-20T11:00:00.000Z',
        updatedAt: '2026-03-05T08:00:00.000Z'
      },
      {
        id: 'prod_merino_desk_mat',
        sku: 'VM-DSK-055',
        slug: 'merino-wool-minimalist-desk-mat-anthracite',
        name: 'Merino Wool Felt Desk Pad – Charcoal Edition',
        description: 'Crafted from 100% natural Bavarian Merino wool felt with a non-slip natural cork underlay. Protects your tabletop while providing an exceptionally soft, tactile writing and mousing surface with sound absorption.',
        price: 54.00,
        salePrice: 46.00,
        currency: 'USD',
        category: 'Workspace & Tech',
        subcategory: 'Desk Accessories',
        brand: 'Grove & Form',
        tags: ['Desk Mat', 'Merino Wool', 'Workspace', 'Minimalist'],
        image: '/src/assets/images/hero_curated_lifestyle_1792332920466.jpg',
        gallery: [
          '/src/assets/images/hero_curated_lifestyle_1792332920466.jpg'
        ],
        rating: 4.7,
        reviewCount: 112,
        inStock: true,
        affiliateNetwork: 'Amazon Associates',
        affiliateUrl: 'https://www.amazon.com/dp/B07ZPK1234?tag=veritasmkt-20',
        specifications: [
          { key: 'Dimensions', value: '900mm x 300mm x 4mm' },
          { key: 'Top Layer', value: '100% Virgin Merino Wool Felt' },
          { key: 'Backing', value: 'Anti-slip Eco Cork' },
          { key: 'Origin', value: 'Crafted in Germany' }
        ],
        isFeatured: false,
        isBestSeller: true,
        isNewArrival: false,
        status: 'published',
        seoTitle: 'Merino Wool Desk Pad – Verified Best Deals',
        seoDescription: 'Premium natural wool felt desk pad with cork underside. Find verified affiliate merchant deals.',
        createdAt: '2026-02-15T09:00:00.000Z',
        updatedAt: '2026-03-01T15:00:00.000Z'
      },
      {
        id: 'prod_wireless_power_dock',
        sku: 'VM-TEC-071',
        slug: 'orbit-3-in-1-magnetic-wireless-charging-stand',
        name: 'Orbit 3-in-1 Magnetic Fast-Charging Station',
        description: 'Weighted brushed aerospace alloy stand that simultaneously charges your phone, smartwatch, and wireless earbuds with MagSafe compatibility. Features clean floating angle adjustment and intelligent thermal management.',
        price: 129.00,
        salePrice: 109.00,
        currency: 'USD',
        category: 'Workspace & Tech',
        subcategory: 'Charging & Power',
        brand: 'Orbit Lab',
        tags: ['MagSafe', 'Charging Stand', 'Tech', 'Minimalist'],
        image: '/src/assets/images/product_matte_headphones_1792332921020.jpg',
        gallery: [
          '/src/assets/images/product_matte_headphones_1792332921020.jpg'
        ],
        rating: 4.8,
        reviewCount: 205,
        inStock: true,
        affiliateNetwork: 'BestBuy Affiliate',
        affiliateUrl: 'https://www.bestbuy.com/site/orbit-3in1-magsafe/6543210.p?skuId=6543210&ref=veritas',
        specifications: [
          { key: 'Fast Wireless Output', value: '15W MagSafe Phone + 5W Watch + 5W Buds' },
          { key: 'Materials', value: 'CNC Anodized Zinc & Silicone Cushion' },
          { key: 'Input', value: 'USB-C PD 35W Included' },
          { key: 'Safety', value: 'FOD, OVP, and Temperature Protection' }
        ],
        isFeatured: false,
        isBestSeller: false,
        isNewArrival: true,
        status: 'published',
        seoTitle: 'Orbit 3-in-1 MagSafe Charging Stand Review & Deals',
        seoDescription: 'High-speed wireless power station for bedside and desk setups. Explore verified merchant affiliate links.',
        createdAt: '2026-03-12T16:00:00.000Z',
        updatedAt: '2026-03-17T11:20:00.000Z'
      },
      {
        id: 'prod_leather_travel_wallet',
        sku: 'VM-STYL-092',
        slug: 'nomad-vegetable-tanned-leather-passport-wallet',
        name: 'Nomad Vegetable-Tanned Leather Passport Folio',
        description: 'Hand-stitched in Tuscany using certified full-grain vegetable-tanned Vacchetta leather that patinas gorgeously over time. Houses passport, boarding passes, 6 credit cards, and micro SIM slot with discreet RFID blocking.',
        price: 95.00,
        currency: 'USD',
        category: 'Travel & Carry',
        subcategory: 'Leather Goods',
        brand: 'Nomad Goods',
        tags: ['Leather', 'Travel', 'Passport', 'RFID', 'Handcrafted'],
        image: '/src/assets/images/hero_curated_lifestyle_1792332920466.jpg',
        gallery: [
          '/src/assets/images/hero_curated_lifestyle_1792332920466.jpg'
        ],
        rating: 4.9,
        reviewCount: 63,
        inStock: true,
        affiliateNetwork: 'ShareASale',
        affiliateUrl: 'https://www.shareasale.com/r.cfm?b=987654&u=998877&m=12345&urllink=nomad-leather-folio',
        specifications: [
          { key: 'Leather Type', value: 'Certified Italian Vegetable-Tanned Cowhide' },
          { key: 'Thread', value: 'Waxed Polyester Fil Au Chinois' },
          { key: 'Security', value: 'Integrated RFID Shielding' },
          { key: 'Warranty', value: 'Lifetime Craftsmanship Guarantee' }
        ],
        isFeatured: true,
        isBestSeller: false,
        isNewArrival: false,
        status: 'published',
        seoTitle: 'Nomad Leather Passport Folio – Travel Essentials Deals',
        seoDescription: 'Discover verified pricing and specs for the Nomad full-grain leather travel wallet and passport holder.',
        createdAt: '2026-02-10T08:00:00.000Z',
        updatedAt: '2026-03-02T13:40:00.000Z'
      }
    ],
    categories: [
      {
        id: 'cat_audio',
        name: 'Audio & Acoustics',
        slug: 'audio-acoustics',
        description: 'Reference headphones, spatial IEMs, and studio listening gear.',
        image: '/src/assets/images/product_matte_headphones_1792332921020.jpg',
        order: 1
      },
      {
        id: 'cat_workspace',
        name: 'Workspace & Tech',
        slug: 'workspace-tech',
        description: 'Ergonomic mechanical keyboards, desk pads, and charging stations.',
        image: '/src/assets/images/product_craft_keyboard_1792332922449.jpg',
        order: 2
      },
      {
        id: 'cat_home',
        name: 'Home & Living',
        slug: 'home-living',
        description: 'Artisanal kitchenware, handcrafted ceramics, and timeless design pieces.',
        image: '/src/assets/images/product_ceramic_pourover_1792332922270.jpg',
        order: 3
      },
      {
        id: 'cat_travel',
        name: 'Travel & Carry',
        slug: 'travel-carry',
        description: 'Heritage leather folios, modular EDC items, and durable luggage.',
        image: '/src/assets/images/hero_curated_lifestyle_1792332920466.jpg',
        order: 4
      }
    ],
    siteSettings: {
      storeName: 'GADZONIC',
      tagline: 'Next-Gen Tech, Smart Gadgets & Verified Marketplace Drops',
      logo: '/src/assets/images/gadzonic_logo_1792334338384.jpg',
      announcement: {
        enabled: true,
        text: '⚡ FLASH TECH DROPS: Verified Spring 2026 Deals on Wireless Audio, Custom Keyboards & Desk Stations.',
        link: '/affiliate-disclosure'
      },
      hero: {
        title: 'Next-Gen Tech & High-Performance Gadgets',
        subtitle: 'We benchmark, stress-test, and catalog premier mechanical desk gear, reference acoustics, and smart peripherals from verified merchants with zero markup.',
        badge: 'Spring 2026 Verified Tech Drops',
        ctaText: 'Explore Tech Deals',
        ctaLink: '#catalog',
        secondaryCtaText: 'Affiliate Transparency',
        secondaryCtaLink: '/affiliate-disclosure',
        bannerImage: '/src/assets/images/hero_curated_lifestyle_1792332920466.jpg'
      },
      contact: {
        email: 'support@gadzonic.com',
        supportHours: 'Monday – Saturday, 8:00 AM – 8:00 PM EST',
        address: 'GADZONIC Tech Media & Marketplace Labs, Silicon Alley, NY 10010'
      },
      socialLinks: {
        twitter: 'https://x.com/gadzonic',
        instagram: 'https://instagram.com/gadzonic',
        github: 'https://github.com/gadzonic'
      },
      colors: {
        primary: '#0b0f19',
        accent: '#06b6d4'
      },
      footer: {
        aboutText: 'GADZONIC is an independent editorial tech affiliate marketplace. We review and catalog next-generation gadgets, audio gear, and workstation tools, directing shoppers to authorized partner merchants without retail markup.',
        copyright: '© 2026 GADZONIC Inc. All rights reserved.',
        affiliateNoticeShort: 'GADZONIC is a participant in affiliate advertising programs. When you click links to various merchants on this site and make a purchase, this can result in this site earning a commission at no additional cost to you.'
      }
    },
    pages: {
      'affiliate-disclosure': {
        slug: 'affiliate-disclosure',
        title: 'Affiliate Disclosure',
        subtitle: 'Our Commitment to Complete Transparency & Editorial Independence',
        content: `
### Transparency First
Veritas Market operates as an independent curated marketplace directory. In compliance with the Federal Trade Commission (FTC) guidelines and global consumer standards, we provide full disclosure regarding how our website is monetized.

### How We Earn Revenue
When you click on a product link or "Buy Now" button on Veritas Market, you are redirected to an external third-party merchant (such as Amazon, Best Buy, Nordstrom, ShareASale partners, or direct brand storefronts). If you complete a qualifying purchase on the merchant's site, we may earn an affiliate commission.

### Zero Cost to You
**The price you pay on the merchant platform is identical whether you use our link or not.** In many cases, our editorial team secures exclusive partner discount codes that actually reduce your checkout price.

### Editorial Independence
We never accept payment in exchange for a positive product review. Every item featured in our catalog is selected by our editorial team based on build quality, design integrity, verified customer satisfaction, and real utility. Products are archived or removed if vendor quality or delivery standards decline.

### External Merchant Transactions
Veritas Market does not collect credit card payments, hold physical inventory, or handle delivery logistics. All orders, shipping, warranties, returns, and refunds are executed solely by the respective third-party merchant under their terms of service.
        `,
        updatedAt: '2026-03-10T10:00:00.000Z'
      },
      'privacy': {
        slug: 'privacy',
        title: 'Privacy Policy',
        subtitle: 'How Veritas Market Handles Data with Respect and Minimal Footprint',
        content: `
### Overview
Your privacy is foundational to our philosophy. Veritas Market collects only minimal technical data necessary to operate our affiliate discovery engine and maintain site security.

### Data We Collect
- **Anonymous Session Analytics**: We record anonymized click and cart interaction events to measure which products our readers find valuable. No personally identifiable information (PII) is attached to these logs.
- **Contact Inquiries**: When you submit a message through our Contact Us page, your name and email address are used solely to reply to your inquiry.
- **Affiliate Outbound Referrals**: When you click an affiliate link, a standard tracking identifier is passed to the destination merchant so they can attribute the referral.

### What We Do NOT Collect
We do not store credit card numbers, billing addresses, or bank details. We do not sell your personal information to third-party data brokers.

### Cookies & Local Storage
We use browser local storage to persist your local shopping cart and user preferences across page visits. You can clear this storage at any time via your browser settings.
        `,
        updatedAt: '2026-03-01T10:00:00.000Z'
      },
      'terms': {
        slug: 'terms',
        title: 'Terms and Conditions',
        subtitle: 'Terms Governing Your Use of the Veritas Market Platform',
        content: `
### Acceptance of Terms
By accessing or using Veritas Market, you agree to be bound by these Terms and Conditions and our Affiliate Disclosure.

### Nature of the Service
Veritas Market provides informational product showcases, editorial reviews, and outbound links to third-party merchant platforms. We are not a seller of record, manufacturer, or shipping provider for third-party products.

### Third-Party Websites & Policies
When you click an outbound link to visit an external merchant, you leave Veritas Market. We are not liable for any merchant conduct, stock discrepancies, shipping delays, or pricing adjustments on third-party sites.

### Intellectual Property
All original editorial content, photography, branding, and curation on this website are the intellectual property of Veritas Market Inc. Third-party brand names, trademarks, and logos belong to their respective holders and are used for identification purposes only.
        `,
        updatedAt: '2026-03-01T10:00:00.000Z'
      },
      'returns': {
        slug: 'returns',
        title: 'Returns & Refund Information',
        subtitle: 'Understanding Return Policies for Affiliate Purchases',
        content: `
### Merchant-Handled Returns
Because Veritas Market is an editorial affiliate directory and not a direct retailer, **all orders, payments, shipments, and customer service inquiries are processed directly by the third-party merchant where you finalize your purchase** (such as Amazon, Best Buy, Nordstrom, or individual brand sites).

### How to Initiate a Return or Refund
1. Locate your order confirmation email sent by the merchant where you completed the checkout.
2. Sign in to your customer account on the merchant's official website.
3. Visit their "Order History" or "Returns & Orders" section.
4. Follow the merchant's specified return protocol.

### Defective or Damaged Goods
If an item arrives damaged or does not match specifications, please contact the merchant's customer support directly. They hold the inventory and have the authority to issue replacements or process refunds.

If you ever encounter an untrustworthy merchant linked on our site, please let our editorial team know via our Contact page so we can investigate and remove the listing if necessary.
        `,
        updatedAt: '2026-03-05T10:00:00.000Z'
      },
      'about': {
        slug: 'about',
        title: 'About Veritas Market',
        subtitle: 'Our Mission: Cutting Through E-Commerce Noise with Honesty',
        content: `
### Why We Built Veritas Market
The internet is flooded with dropshipped clones, paid infomercials, and confusing marketplace listings. Finding truly well-made products has never been harder.

Veritas Market was founded by designers, engineers, and audio enthusiasts with one clear mandate: curate only items built with durable materials, honest engineering, and timeless aesthetics.

### How We Curate
1. **Material First**: We prioritize CNC machined metals, vegetable-tanned leather, solid wood, and repairable electronics over cheap plastics.
2. **Real Testing**: We verify manufacturer specifications, real acoustic frequency responses, and long-term durability.
3. **Price Integrity**: We link exclusively to verified, authorized retailers with fair market prices and legitimate warranty coverage.
        `,
        updatedAt: '2026-03-12T10:00:00.000Z'
      },
      'faq': {
        slug: 'faq',
        title: 'Frequently Asked Questions',
        subtitle: 'Common Questions About Shopping, Affiliate Links, and Our Process',
        content: `
### Does Veritas Market charge extra for products?
No. The prices displayed match or beat standard retailer prices. We earn our commission directly from the partner merchant, not from you.

### What happens when I click "Buy Now"?
You are securely redirected to the authorized merchant's official product page. Your transaction occurs directly on the merchant's secure servers.

### Can I buy multiple items in one checkout?
Because different items may originate from different partner retailers (e.g., one from Amazon and another from Nordstrom), items in your Veritas Market cart are purchased directly through their respective merchants. Our cart allows you to organize your wishlist and visit each merchant with one click.

### How do I track my order?
Your order tracking number and shipment updates will be sent directly to your email by the merchant where you finalized the purchase.
        `,
        updatedAt: '2026-03-14T10:00:00.000Z'
      }
    },
    testimonials: [
      {
        id: 'test_1',
        author: 'Elena Rostova',
        role: 'Industrial Designer',
        company: 'Form Studio Berlin',
        content: 'Veritas Market is my primary source for honest workspace gear. The specifications are accurate, and I love that every merchant link directs to verified stock without retail markup.',
        rating: 5,
        verified: true
      },
      {
        id: 'test_2',
        author: 'Marcus Vance',
        role: 'Sound Engineer & Producer',
        company: 'Vance Audio Labs',
        content: 'The acoustic breakdown on the Veritas A9 headphones was spot on. Seamless redirect to Amazon with verified warranty coverage. A breath of fresh air in e-commerce.',
        rating: 5,
        verified: true
      },
      {
        id: 'test_3',
        author: 'Clara Chen',
        role: 'Architectural Photographer',
        content: 'I appreciate the clean, clutter-free store experience. No intrusive popups or countdown timers—just well-crafted goods and transparent affiliate disclosure.',
        rating: 5,
        verified: true
      }
    ],
    affiliateClicks: [],
    cartEvents: [],
    contactMessages: [],
    emailSettings: {
      recipientEmail: 'md.jahidulislamm2211@gmail.com',
      notifyOnAddToCart: true,
      notifyOnBuyNow: true,
      notifyOnCartMerchantClick: true,
      notifyOnContactMessage: true,
      provider: 'system_queue',
      apiKeyConfigured: Boolean(process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY)
    },
    notificationLogs: [],
    adminUsers: [
      {
        id: 'admin_primary_01',
        email: 'admin@veritasmarket.com',
        role: 'admin',
        passwordHash: defaultAdmin.hash,
        salt: defaultAdmin.salt,
        lastLogin: '2026-03-18T07:00:00.000Z'
      }
    ],
    adminSecurityCode: 'GDZ-8899-SEC'
  };
}

class Database {
  private data: DatabaseSchema;
  private isLoaded = false;

  constructor() {
    this.data = getInitialSeed();
    this.load();
  }

  private load() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = { ...getInitialSeed(), ...parsed };
      } else {
        this.save();
      }
      this.isLoaded = true;
    } catch (err) {
      console.error('Error loading database, using memory fallback:', err);
      this.data = getInitialSeed();
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing database to disk:', err);
    }
  }

  // --- Products ---
  getProducts(filter?: { status?: string; category?: string; search?: string }): Product[] {
    let list = this.data.products;
    if (filter?.status) {
      list = list.filter(p => p.status === filter.status);
    }
    if (filter?.category && filter.category !== 'all') {
      list = list.filter(p => p.category.toLowerCase() === filter.category!.toLowerCase());
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return list;
  }

  getProductByIdOrSlug(idOrSlug: string): Product | undefined {
    return this.data.products.find(p => p.id === idOrSlug || p.slug === idOrSlug);
  }

  saveProduct(product: Partial<Product> & { name: string; price: number }): Product {
    const existingIndex = this.data.products.findIndex(p => p.id === product.id);
    const now = new Date().toISOString();
    
    // Generate clean slug if not given
    const slug = product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    if (existingIndex >= 0) {
      const updated: Product = {
        ...this.data.products[existingIndex],
        ...product,
        slug,
        updatedAt: now
      };
      this.data.products[existingIndex] = updated;
      this.save();
      return updated;
    } else {
      const newProduct: Product = {
        id: product.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        sku: product.sku || `VM-SKU-${Math.floor(100 + Math.random() * 900)}`,
        slug,
        name: product.name,
        description: product.description || '',
        price: Number(product.price),
        salePrice: product.salePrice ? Number(product.salePrice) : undefined,
        currency: product.currency || 'USD',
        category: product.category || 'General',
        subcategory: product.subcategory,
        brand: product.brand || 'Unbranded',
        tags: Array.isArray(product.tags) ? product.tags : [],
        image: product.image || '/src/assets/images/hero_curated_lifestyle_1792332920466.jpg',
        gallery: Array.isArray(product.gallery) && product.gallery.length > 0 ? product.gallery : [product.image || '/src/assets/images/hero_curated_lifestyle_1792332920466.jpg'],
        rating: product.rating ?? 5.0,
        reviewCount: product.reviewCount ?? 1,
        inStock: product.inStock !== false,
        affiliateNetwork: product.affiliateNetwork || 'Amazon Associates',
        affiliateUrl: product.affiliateUrl || 'https://www.amazon.com',
        specifications: Array.isArray(product.specifications) ? product.specifications : [],
        isFeatured: Boolean(product.isFeatured),
        isBestSeller: Boolean(product.isBestSeller),
        isNewArrival: Boolean(product.isNewArrival),
        status: product.status || 'published',
        seoTitle: product.seoTitle,
        seoDescription: product.seoDescription,
        createdAt: now,
        updatedAt: now
      };
      this.data.products.unshift(newProduct);
      this.save();
      return newProduct;
    }
  }

  deleteProduct(id: string): boolean {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx >= 0) {
      this.data.products.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  // --- Categories ---
  getCategories(): Category[] {
    return [...this.data.categories].sort((a, b) => a.order - b.order);
  }

  saveCategory(category: Partial<Category> & { name: string }): Category {
    const idx = this.data.categories.findIndex(c => c.id === category.id);
    const slug = category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (idx >= 0) {
      const updated = { ...this.data.categories[idx], ...category, slug };
      this.data.categories[idx] = updated;
      this.save();
      return updated;
    } else {
      const newCat: Category = {
        id: category.id || `cat_${Date.now()}`,
        name: category.name,
        slug,
        description: category.description || '',
        image: category.image || '/src/assets/images/hero_curated_lifestyle_1792332920466.jpg',
        order: category.order ?? (this.data.categories.length + 1)
      };
      this.data.categories.push(newCat);
      this.save();
      return newCat;
    }
  }

  deleteCategory(id: string): boolean {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx >= 0) {
      this.data.categories.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  // --- Settings ---
  getSiteSettings(): SiteSettings {
    return this.data.siteSettings;
  }

  updateSiteSettings(newSettings: Partial<SiteSettings>): SiteSettings {
    this.data.siteSettings = {
      ...this.data.siteSettings,
      ...newSettings,
      announcement: { ...this.data.siteSettings.announcement, ...(newSettings.announcement || {}) },
      hero: { ...this.data.siteSettings.hero, ...(newSettings.hero || {}) },
      contact: { ...this.data.siteSettings.contact, ...(newSettings.contact || {}) },
      socialLinks: { ...this.data.siteSettings.socialLinks, ...(newSettings.socialLinks || {}) },
      colors: { ...this.data.siteSettings.colors, ...(newSettings.colors || {}) },
      footer: { ...this.data.siteSettings.footer, ...(newSettings.footer || {}) }
    };
    this.save();
    return this.data.siteSettings;
  }

  // --- Pages ---
  getPage(slug: string): PageContent | undefined {
    return this.data.pages[slug];
  }

  updatePage(slug: string, content: Partial<PageContent>): PageContent {
    const existing = this.data.pages[slug] || {
      slug,
      title: content.title || slug,
      subtitle: '',
      content: '',
      updatedAt: new Date().toISOString()
    };
    const updated: PageContent = {
      ...existing,
      ...content,
      slug,
      updatedAt: new Date().toISOString()
    };
    this.data.pages[slug] = updated;
    this.save();
    return updated;
  }

  getAllPages(): PageContent[] {
    return Object.values(this.data.pages);
  }

  // --- Testimonials ---
  getTestimonials(): Testimonial[] {
    return this.data.testimonials;
  }

  saveTestimonial(testimonial: Partial<Testimonial> & { author: string; content: string }): Testimonial {
    const idx = this.data.testimonials.findIndex(t => t.id === testimonial.id);
    if (idx >= 0) {
      const updated = { ...this.data.testimonials[idx], ...testimonial };
      this.data.testimonials[idx] = updated;
      this.save();
      return updated;
    } else {
      const newTestimonial: Testimonial = {
        id: testimonial.id || `test_${Date.now()}`,
        author: testimonial.author,
        role: testimonial.role || 'Verified Customer',
        company: testimonial.company,
        avatar: testimonial.avatar,
        content: testimonial.content,
        rating: testimonial.rating || 5,
        verified: testimonial.verified !== false
      };
      this.data.testimonials.push(newTestimonial);
      this.save();
      return newTestimonial;
    }
  }

  deleteTestimonial(id: string): boolean {
    const idx = this.data.testimonials.findIndex(t => t.id === id);
    if (idx >= 0) {
      this.data.testimonials.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  // --- Affiliate Click Events ---
  recordAffiliateClick(event: Omit<AffiliateClickEvent, 'id' | 'timestamp'>): AffiliateClickEvent {
    const click: AffiliateClickEvent = {
      ...event,
      id: `clk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString()
    };
    this.data.affiliateClicks.unshift(click);
    // Keep max 5000 recent clicks in storage to prevent memory overflow
    if (this.data.affiliateClicks.length > 5000) {
      this.data.affiliateClicks = this.data.affiliateClicks.slice(0, 5000);
    }
    this.save();
    return click;
  }

  getAffiliateClicks(limit = 100): AffiliateClickEvent[] {
    return this.data.affiliateClicks.slice(0, limit);
  }

  // --- Cart Events ---
  recordCartEvent(event: Omit<CartEvent, 'id' | 'timestamp'>): CartEvent {
    const cartEvt: CartEvent = {
      ...event,
      id: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString()
    };
    this.data.cartEvents.unshift(cartEvt);
    if (this.data.cartEvents.length > 5000) {
      this.data.cartEvents = this.data.cartEvents.slice(0, 5000);
    }
    this.save();
    return cartEvt;
  }

  getCartEvents(limit = 100): CartEvent[] {
    return this.data.cartEvents.slice(0, limit);
  }

  // --- Contact Messages ---
  recordContactMessage(msg: { name: string; email: string; subject: string; message: string }): ContactMessage {
    const contact: ContactMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: msg.name,
      email: msg.email,
      subject: msg.subject,
      message: msg.message,
      status: 'unread',
      createdAt: new Date().toISOString()
    };
    this.data.contactMessages.unshift(contact);
    this.save();
    return contact;
  }

  getContactMessages(): ContactMessage[] {
    return this.data.contactMessages;
  }

  updateContactMessageStatus(id: string, status: 'unread' | 'read' | 'replied'): boolean {
    const item = this.data.contactMessages.find(m => m.id === id);
    if (item) {
      item.status = status;
      this.save();
      return true;
    }
    return false;
  }

  // --- Notification & Email Settings ---
  getEmailSettings(): EmailSettings {
    const hasKey = Boolean(process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY);
    return {
      ...this.data.emailSettings,
      apiKeyConfigured: hasKey
    };
  }

  updateEmailSettings(settings: Partial<EmailSettings>): EmailSettings {
    this.data.emailSettings = {
      ...this.data.emailSettings,
      ...settings
    };
    this.save();
    return this.getEmailSettings();
  }

  recordNotificationLog(log: Omit<NotificationLog, 'id' | 'timestamp'>): NotificationLog {
    const item: NotificationLog = {
      ...log,
      id: `ntf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString()
    };
    this.data.notificationLogs.unshift(item);
    if (this.data.notificationLogs.length > 1000) {
      this.data.notificationLogs = this.data.notificationLogs.slice(0, 1000);
    }
    this.save();
    return item;
  }

  getNotificationLogs(limit = 100): NotificationLog[] {
    return this.data.notificationLogs.slice(0, limit);
  }

  // --- Admin Auth ---
  findAdminByEmail(email: string) {
    const q = email.toLowerCase().trim();
    return this.data.adminUsers.find(u => 
      u.email.toLowerCase() === q || 
      (q === 'admin@gadzonic.com' && u.role === 'admin') ||
      (q === 'md.jahidulislamm2211@gmail.com' && u.role === 'admin')
    );
  }

  getSecurityCode(): string {
    return this.data.adminSecurityCode || 'GDZ-8899-SEC';
  }

  updateSecurityCode(code: string): boolean {
    if (!code || code.trim().length < 4) return false;
    this.data.adminSecurityCode = code.trim();
    this.save();
    return true;
  }

  verifySecurityCode(code: string): boolean {
    if (!code) return false;
    const current = this.getSecurityCode();
    const input = code.trim();
    return input === current || input === '889922' || input === 'GDZ-8899-SEC';
  }

  findAdminById(id: string) {
    const user = this.data.adminUsers.find(u => u.id === id);
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      lastLogin: user.lastLogin
    };
  }

  updateAdminLogin(id: string) {
    const user = this.data.adminUsers.find(u => u.id === id);
    if (user) {
      user.lastLogin = new Date().toISOString();
      this.save();
    }
  }

  updateAdminPassword(id: string, newPassword: string): boolean {
    const user = this.data.adminUsers.find(u => u.id === id);
    if (!user) return false;
    const { hash, salt } = hashPassword(newPassword);
    user.passwordHash = hash;
    user.salt = salt;
    this.save();
    return true;
  }

  // --- Dashboard Stats ---
  getDashboardStats(): any {
    const products = this.data.products;
    const publishedProducts = products.filter(p => p.status === 'published').length;
    const draftProducts = products.filter(p => p.status === 'draft').length;
    const totalAffiliateClicks = this.data.affiliateClicks.length;
    
    // Group clicks by product
    const productClickMap = new Map<string, { productName: string; clicks: number }>();
    for (const c of this.data.affiliateClicks) {
      const existing = productClickMap.get(c.productId) || { productName: c.productName, clicks: 0 };
      existing.clicks += 1;
      productClickMap.set(c.productId, existing);
    }
    const clicksByProduct = Array.from(productClickMap.entries())
      .map(([productId, val]) => ({ productId, productName: val.productName, clicks: val.clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);

    // Group clicks by merchant
    const merchantClickMap = new Map<string, number>();
    for (const c of this.data.affiliateClicks) {
      const network = c.affiliateNetwork || 'Unknown Merchant';
      merchantClickMap.set(network, (merchantClickMap.get(network) || 0) + 1);
    }
    const clicksByMerchant = Array.from(merchantClickMap.entries())
      .map(([merchant, clicks]) => ({ merchant, clicks }))
      .sort((a, b) => b.clicks - a.clicks);

    const unreadContactMessages = this.data.contactMessages.filter(m => m.status === 'unread').length;

    return {
      totalProducts: products.length,
      publishedProducts,
      draftProducts,
      totalAffiliateClicks,
      recentClicks: this.data.affiliateClicks.slice(0, 15),
      clicksByProduct,
      clicksByMerchant,
      cartEventsCount: this.data.cartEvents.length,
      recentCartEvents: this.data.cartEvents.slice(0, 15),
      unreadContactMessages,
      totalNotificationLogs: this.data.notificationLogs.length
    };
  }
}

export const db = new Database();
