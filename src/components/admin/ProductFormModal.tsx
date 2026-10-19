import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  AlertCircle, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  Sparkles, 
  Link, 
  Star,
  RefreshCw
} from 'lucide-react';
import type { Product, Category } from '../../types/index.js';
import { adminApi } from '../../services/api.js';

interface ProductFormModalProps {
  product: Product | null;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Partial<Product>) => Promise<void>;
}

const PRESET_ASSETS = [
  {
    name: 'A9 Studio Headphones',
    url: '/src/assets/images/product_matte_headphones_1792332921020.jpg'
  },
  {
    name: 'CNC Mechanical Keyboard',
    url: '/src/assets/images/product_craft_keyboard_1792332922449.jpg'
  },
  {
    name: 'Stoneware Pour-Over Set',
    url: '/src/assets/images/product_ceramic_pourover_1792332922270.jpg'
  },
  {
    name: 'Minimalist Workspace Desk',
    url: '/src/assets/images/hero_curated_lifestyle_1792332920466.jpg'
  },
  {
    name: 'GADZONIC Logo Emblem',
    url: '/src/assets/images/gadzonic_logo_1792334338384.jpg'
  }
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  categories,
  isOpen,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | string>('');
  const [salePrice, setSalePrice] = useState<number | string>('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [tags, setTags] = useState('');
  
  // Image states
  const [image, setImage] = useState('');
  const [galleryList, setGalleryList] = useState<string[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const [affiliateNetwork, setAffiliateNetwork] = useState('Amazon Associates');
  const [affiliateUrl, setAffiliateUrl] = useState('');
  const [rating, setRating] = useState<number>(5.0);
  const [reviewCount, setReviewCount] = useState<number>(10);
  const [inStock, setInStock] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [status, setStatus] = useState<'published' | 'draft' | 'archived'>('published');
  const [specifications, setSpecifications] = useState<Array<{ key: string; value: string }>>([]);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setSku(product.sku || '');
      setSlug(product.slug || '');
      setDescription(product.description || '');
      setPrice(product.price ?? '');
      setSalePrice(product.salePrice ?? '');
      setCategory(product.category || (categories[0]?.name ?? 'General'));
      setBrand(product.brand || '');
      setTags((product.tags || []).join(', '));
      setImage(product.image || '');
      setGalleryList(product.gallery && product.gallery.length > 0 ? product.gallery : [product.image]);
      setAffiliateNetwork(product.affiliateNetwork || 'Amazon Associates');
      setAffiliateUrl(product.affiliateUrl || '');
      setRating(product.rating ?? 5.0);
      setReviewCount(product.reviewCount ?? 1);
      setInStock(product.inStock !== false);
      setIsFeatured(Boolean(product.isFeatured));
      setIsBestSeller(Boolean(product.isBestSeller));
      setIsNewArrival(Boolean(product.isNewArrival));
      setStatus(product.status || 'published');
      setSpecifications(product.specifications || []);
      setSeoTitle(product.seoTitle || '');
      setSeoDescription(product.seoDescription || '');
    } else {
      setName('');
      setSku(`GDZ-${Math.floor(100 + Math.random() * 900)}`);
      setSlug('');
      setDescription('');
      setPrice('');
      setSalePrice('');
      setCategory(categories[0]?.name || 'Audio & Acoustics');
      setBrand('');
      setTags('Tech, Gaming, Gadget');
      setImage('/src/assets/images/hero_curated_lifestyle_1792332920466.jpg');
      setGalleryList(['/src/assets/images/hero_curated_lifestyle_1792332920466.jpg']);
      setAffiliateNetwork('Amazon Associates');
      setAffiliateUrl('https://www.amazon.com/dp/B0EXAMPLE?tag=gadzonic-20');
      setRating(4.9);
      setReviewCount(36);
      setInStock(true);
      setIsFeatured(true);
      setIsBestSeller(false);
      setIsNewArrival(true);
      setStatus('published');
      setSpecifications([
        { key: 'Chassis Material', value: 'CNC Anodized Aluminum' },
        { key: 'Connectivity', value: 'Ultra-low Latency 2.4GHz & Bluetooth 5.3' },
        { key: 'Warranty', value: '2-Year Official Manufacturer Warranty' }
      ]);
      setSeoTitle('');
      setSeoDescription('');
    }
    setError('');
    setUploadError('');
    setShowPresets(false);
  }, [product, categories, isOpen]);

  if (!isOpen) return null;

  // File Upload Handlers
  const processAndUploadFile = async (file: File, isGallery = false) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WEBP, GIF).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setUploadError('Image size exceeds 8MB. Please choose a smaller file.');
      return;
    }

    setUploadingImage(true);
    setUploadError('');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        try {
          const res = await adminApi.uploadImage(dataUrl, file.name);
          const finalUrl = res.url;
          if (isGallery) {
            setGalleryList(prev => [...prev, finalUrl]);
          } else {
            setImage(finalUrl);
            setGalleryList(prev => {
              if (!prev.includes(finalUrl)) return [finalUrl, ...prev];
              return prev;
            });
          }
        } catch (err: any) {
          // If server upload had an issue, fallback to dataUrl directly so user is never blocked
          if (isGallery) {
            setGalleryList(prev => [...prev, dataUrl]);
          } else {
            setImage(dataUrl);
            setGalleryList(prev => [dataUrl, ...prev]);
          }
        } finally {
          setUploadingImage(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to read image file');
      setUploadingImage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isGallery = false) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndUploadFile(file, isGallery);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAndUploadFile(file, false);
    }
  };

  const handleAddGalleryUrl = () => {
    if (!newGalleryUrl.trim()) return;
    const url = newGalleryUrl.trim();
    if (!galleryList.includes(url)) {
      setGalleryList([...galleryList, url]);
    }
    setNewGalleryUrl('');
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    const removedUrl = galleryList[indexToRemove];
    const updated = galleryList.filter((_, i) => i !== indexToRemove);
    setGalleryList(updated);
    if (image === removedUrl && updated.length > 0) {
      setImage(updated[0]);
    }
  };

  const handleSetAsMainImage = (url: string) => {
    setImage(url);
    const without = galleryList.filter(u => u !== url);
    setGalleryList([url, ...without]);
  };

  const handleAddSpec = () => {
    setSpecifications([...specifications, { key: '', value: '' }]);
  };

  const handleUpdateSpec = (idx: number, field: 'key' | 'value', val: string) => {
    const copy = [...specifications];
    copy[idx][field] = val;
    setSpecifications(copy);
  };

  const handleRemoveSpec = (idx: number) => {
    setSpecifications(specifications.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Product name is required');
      return;
    }
    const numPrice = parseFloat(price.toString());
    if (isNaN(numPrice) || numPrice <= 0) {
      setError('A valid regular price is required');
      return;
    }
    if (!image.trim()) {
      setError('Please add at least one product image');
      return;
    }
    if (!affiliateUrl.trim().startsWith('http://') && !affiliateUrl.trim().startsWith('https://')) {
      setError('Affiliate URL must start with http:// or https://');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
      const cleanGallery = Array.from(new Set([image, ...galleryList])).filter(Boolean);

      await onSave({
        ...(product?.id ? { id: product.id } : {}),
        name: name.trim(),
        sku: sku.trim(),
        slug: slug.trim() || undefined,
        description: description.trim(),
        price: numPrice,
        salePrice: salePrice ? parseFloat(salePrice.toString()) : undefined,
        category,
        brand: brand.trim(),
        tags: parsedTags,
        image: image.trim(),
        gallery: cleanGallery,
        affiliateNetwork: affiliateNetwork.trim(),
        affiliateUrl: affiliateUrl.trim(),
        rating: Number(rating),
        reviewCount: Number(reviewCount),
        inStock,
        isFeatured,
        isBestSeller,
        isNewArrival,
        status,
        specifications: specifications.filter(s => s.key.trim() && s.value.trim()),
        seoTitle: seoTitle.trim(),
        seoDescription: seoDescription.trim()
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-950/70 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-8 max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/80">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              {product ? 'Edit Affiliate Product' : 'Add New Affiliate Product'}
            </h2>
            <p className="text-xs text-neutral-500">
              Upload photos, configure verified prices, affiliate tracking link, and specs
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ============================================================ */}
          {/* SECTION 1: PRODUCT IMAGE UPLOAD & GALLERY MANAGEMENT        */}
          {/* ============================================================ */}
          <div className="p-5 bg-neutral-900 text-white rounded-2xl border border-neutral-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Product Image & Gallery Management
                </h3>
              </div>

              {/* Quick Preset Selector Toggle */}
              <button
                type="button"
                onClick={() => setShowPresets(!showPresets)}
                className="px-2.5 py-1 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-cyan-300 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{showPresets ? 'Hide Presets' : 'Choose from Presets'}</span>
              </button>
            </div>

            {uploadError && (
              <div className="p-2.5 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Optional Preset Library Quick-Bar */}
            {showPresets && (
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                  Click a verified tech asset to apply instantly:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {PRESET_ASSETS.map((preset, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => {
                        setImage(preset.url);
                        if (!galleryList.includes(preset.url)) {
                          setGalleryList([preset.url, ...galleryList]);
                        }
                      }}
                      className="group p-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-cyan-500 rounded-lg transition-all text-left flex flex-col items-center gap-1.5 cursor-pointer"
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-14 object-cover rounded bg-neutral-950" />
                      <span className="text-[10px] text-neutral-300 group-hover:text-cyan-300 truncate w-full text-center font-medium">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Main Image Stage & Upload Drag-Drop Box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Preview Card */}
              <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 flex items-center justify-center">
                {image ? (
                  <>
                    <img
                      src={image}
                      alt="Primary product preview"
                      className="w-full h-full object-cover"
                      onError={() => setUploadError('Image preview failed to load. Please check the URL.')}
                    />
                    <div className="absolute top-2 left-2 bg-neutral-900/90 backdrop-blur-sm text-cyan-400 text-[10px] font-bold px-2 py-0.5 rounded border border-neutral-700">
                      Primary Display
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4 text-neutral-500">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                    <span className="text-xs">No image selected</span>
                  </div>
                )}
              </div>

              {/* Upload Drop Zone & Actions */}
              <div className="md:col-span-2 flex flex-col justify-between space-y-3">
                
                {/* Drag & Drop Upload Zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[110px] ${
                    isDragOver 
                      ? 'border-cyan-400 bg-cyan-950/20' 
                      : 'border-neutral-700 hover:border-neutral-500 bg-neutral-950/40 hover:bg-neutral-950/60'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, false)}
                    className="hidden"
                  />
                  {uploadingImage ? (
                    <div className="flex items-center gap-2 text-cyan-400 text-xs font-medium">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Uploading image...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-cyan-400 mb-1" />
                      <p className="text-xs font-semibold text-white">
                        Click to browse or drag & drop image here
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Supports JPG, PNG, WEBP, GIF (up to 8MB)
                      </p>
                    </>
                  )}
                </div>

                {/* Direct Image URL input */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Link className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="Or paste external image URL / path..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-950 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                  {image && (
                    <button
                      type="button"
                      onClick={() => setImage('')}
                      className="px-2.5 py-1.5 text-xs text-neutral-400 hover:text-white bg-neutral-800 rounded-lg"
                    >
                      Clear
                    </button>
                  )}
                </div>

              </div>
            </div>

            {/* Gallery Thumbnails Strip */}
            <div className="pt-3 border-t border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-300">
                  Product Gallery Images ({galleryList.length})
                </span>
                
                {/* Add to Gallery file button */}
                <div className="flex items-center gap-2">
                  <input
                    ref={galleryFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, true)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => galleryFileInputRef.current?.click()}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-neutral-800 hover:bg-neutral-700 text-cyan-300 rounded flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Image File
                  </button>
                </div>
              </div>

              {/* Gallery Image Thumbnails */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {galleryList.map((url, idx) => (
                  <div 
                    key={idx}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden bg-neutral-950 border shrink-0 group ${
                      image === url ? 'border-cyan-400 ring-2 ring-cyan-500/30' : 'border-neutral-700'
                    }`}
                  >
                    <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                    
                    {/* Hover Overlay Actions */}
                    <div className="absolute inset-0 bg-neutral-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                      {image !== url && (
                        <button
                          type="button"
                          onClick={() => handleSetAsMainImage(url)}
                          title="Set as Main Image"
                          className="p-1 text-neutral-300 hover:text-amber-400 rounded"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(idx)}
                        title="Remove from gallery"
                        className="p-1 text-neutral-300 hover:text-rose-400 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {image === url && (
                      <div className="absolute bottom-0 inset-x-0 bg-cyan-600 text-white text-[8px] font-bold text-center py-0.2">
                        MAIN
                      </div>
                    )}
                  </div>
                ))}

                {/* Add by URL input */}
                <div className="flex items-center gap-1 min-w-[200px]">
                  <input
                    type="text"
                    value={newGalleryUrl}
                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                    placeholder="Add image URL..."
                    className="flex-1 px-2.5 py-1.5 text-xs bg-neutral-950 border border-neutral-700 rounded text-white text-[11px] focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddGalleryUrl}
                    className="px-2 py-1.5 text-xs bg-neutral-800 hover:bg-neutral-700 text-white rounded font-bold"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* ============================================================ */}
          {/* SECTION 2: BASIC PRODUCT INFORMATION                        */}
          {/* ============================================================ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Product Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Lumina Pro Wireless Mechanical Keyboard"
                className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:bg-white focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Brand / Manufacturer <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder="e.g. GADZONIC Tech / AuraSound"
                className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:bg-white focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                SKU / Unique Identifier
              </label>
              <input
                type="text"
                value={sku}
                onChange={e => setSku(e.target.value)}
                placeholder="e.g. GDZ-TEC-099"
                className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:bg-white focus:border-neutral-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:bg-white focus:border-neutral-900 cursor-pointer"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Publication Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:bg-white focus:border-neutral-900 cursor-pointer"
              >
                <option value="published">Published (Visible in Storefront)</option>
                <option value="draft">Draft (Admin Only)</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* ============================================================ */}
          {/* SECTION 3: PRICING & AFFILIATE DESTINATION                   */}
          {/* ============================================================ */}
          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/70 space-y-4">
            <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Affiliate Merchant & Pricing Configuration</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Regular Price ($ USD) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="199.00"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Sale / Discounted Price ($ USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={salePrice}
                  onChange={e => setSalePrice(e.target.value)}
                  placeholder="Optional (e.g. 169.00)"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Affiliate Network / Partner
                </label>
                <input
                  type="text"
                  value={affiliateNetwork}
                  onChange={e => setAffiliateNetwork(e.target.value)}
                  placeholder="e.g. Amazon Associates, ShareASale, Best Buy"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Affiliate Redirect Destination URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={affiliateUrl}
                  onChange={e => setAffiliateUrl(e.target.value)}
                  placeholder="https://www.amazon.com/dp/B000000?tag=gadzonic-20"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 font-mono"
                />
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* SECTION 4: PRODUCT DESCRIPTION & SPECS                      */}
          {/* ============================================================ */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Editorial Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Comprehensive description of product performance, verified acoustic or technical benchmarks, and design materials..."
              className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:bg-white focus:border-neutral-900"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Technical Specifications Table
              </label>
              <button
                type="button"
                onClick={handleAddSpec}
                className="px-2.5 py-1 text-[11px] font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Add Spec Row
              </button>
            </div>

            <div className="space-y-2">
              {specifications.map((spec, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={spec.key}
                    onChange={e => handleUpdateSpec(i, 'key', e.target.value)}
                    placeholder="Feature (e.g. Battery Life)"
                    className="flex-1 px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-300 rounded-md"
                  />
                  <input
                    type="text"
                    value={spec.value}
                    onChange={e => handleUpdateSpec(i, 'value', e.target.value)}
                    placeholder="Spec Value (e.g. 40 Hours Continuous)"
                    className="flex-1 px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-300 rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(i)}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tags & Badges */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Product Search Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="Wireless, Bluetooth, Gaming, Studio, Ergonomic"
                className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:bg-white focus:border-neutral-900"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <label className="flex items-center gap-2 p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={e => setInStock(e.target.checked)}
                  className="rounded text-neutral-900"
                />
                <span>In Stock</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={e => setIsFeatured(e.target.checked)}
                  className="rounded text-neutral-900"
                />
                <span>Featured Deal</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBestSeller}
                  onChange={e => setIsBestSeller(e.target.checked)}
                  className="rounded text-neutral-900"
                />
                <span>Best Seller</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNewArrival}
                  onChange={e => setIsNewArrival(e.target.checked)}
                  className="rounded text-neutral-900"
                />
                <span>New Arrival</span>
              </label>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
