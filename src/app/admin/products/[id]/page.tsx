'use client';

import { use, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Package, 
  Info, 
  Layers, 
  ChevronRight,
  ShieldAlert,
  Settings,
  Zap,
  FileText,
  AlertCircle,
  Globe,
  CheckCircle2,
  XCircle,
  Star,
  HelpCircle,
  MessageSquare,
  X
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import SEOMetrics from '@/components/admin/SEOMetrics';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';

export default function ProductForm({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const isNew = params.id === 'new';

  const [form, setForm] = useState({
    title: '',
    modelNumber: '',
    slug: '',
    description: '',
    category: '',
    usage: 'Laboratory',
    images: [] as string[],
    features: [] as string[],
    specificationText: '',
    specs: {} as Record<string, string>,
    youtubeUrl: '',
    metaTitle: '',
    metaDescription: '',
    reviews: [] as { author: string; rating: number; comment: string; images?: string[] }[],
    faqs: [] as { question: string; answer: string }[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newSpec, setNewSpec] = useState({ key: '', value: '' });
  const [newFeature, setNewFeature] = useState('');
  const [newReview, setNewReview] = useState({ author: '', rating: 5, comment: '', images: [] as string[] });
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(!isNew);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'performance' | 'media' | 'seo' | 'reviews' | 'faq'>('details');
  const [categories, setCategories] = useState<any[]>([]);

  // Always-current ref so handleSubmit never reads stale closure state
  const formRef = useRef(form);
  useEffect(() => { formRef.current = form; }, [form]);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(() => toast.error('Failed to load categories'));
  }, []);

  useEffect(() => {
    if (!isNew) {
      setFetching(true);
      fetch(`/api/products/${params.id}`)
        .then(res => res.json())
        .then(data => {
          setForm({
            title: data.title || '',
            modelNumber: data.modelNumber || '',
            slug: data.slug || '',
            description: data.description || '',
            category: data.category || '',
            usage: data.usage || 'Laboratory',
            features: data.features || [],
            specificationText: data.specificationText || '',
            specs: data.specs || {},
            images: data.images || [],
            youtubeUrl: data.youtubeUrl || '',
            metaTitle: data.metaTitle || '',
            metaDescription: data.metaDescription || '',
            reviews: data.reviews || [],
            faqs: data.faqs || []
          });
          setFetching(false);
        })
        .catch(() => {
          toast.error('Failed to retrieve instrument data');
          setFetching(false);
        });
    }
  }, [params.id, isNew]);

  const validateForm = (snapshot: typeof form) => {
    const newErrors: Record<string, string> = {};

    // Basic Details
    if (!snapshot.title.trim()) {
      newErrors.title = 'Product title is required';
    }
    if (!snapshot.modelNumber?.trim()) {
      newErrors.modelNumber = 'Model number is required';
    }
    if (!snapshot.category) {
      newErrors.category = 'Category must be selected';
    }
    if (!snapshot.description.trim()) {
      newErrors.description = 'Product description is required';
    }
    
    // Slug Validation
    if (!snapshot.slug || !snapshot.slug.trim()) {
      newErrors.slug = 'Product URL slug could not be generated. Please ensure title contains letters or numbers.';
    }

    // SEO
    if (!snapshot.metaTitle.trim()) {
      newErrors.metaTitle = 'SEO title is required';
    }
    if (!snapshot.metaDescription.trim()) {
      newErrors.metaDescription = 'SEO description is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const errorCount = Object.keys(newErrors).length;
      toast.error(`${errorCount} required field(s) missing. Please fill in all required information.`);
      
      // Auto-switch to the first tab with an error
      if (newErrors.title || newErrors.modelNumber || newErrors.description || newErrors.slug) setActiveTab('details' as any); 
      else if (newErrors.metaTitle || newErrors.metaDescription) setActiveTab('seo');
      
      return false;
    }

    return true;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Always use the ref to get fully up-to-date form state,
    // bypassing any stale closure captured at click time.
    const snapshot = { ...formRef.current };
    
    if (!validateForm(snapshot)) return;
    
    setLoading(true);
    setServerError(null);
    const method = isNew ? 'POST' : 'PUT';
    const url = isNew ? '/api/products' : `/api/products/${params.id}`;

    console.log('[SAVE] reviews:', snapshot.reviews.length, '| faqs:', snapshot.faqs.length);

    try {
      const res = await fetch(url, {
        method,
        body: JSON.stringify(snapshot),
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        const saved = await res.json();
        // Sync form state with what was actually saved from DB
        const synced = {
          title: saved.title || '',
          modelNumber: saved.modelNumber || '',
          slug: saved.slug || '',
          description: saved.description || '',
          category: saved.category || '',
          usage: saved.usage || 'Laboratory',
          features: saved.features || [],
          specificationText: saved.specificationText || '',
          specs: saved.specs || {},
          images: saved.images || [],
          youtubeUrl: saved.youtubeUrl || '',
          metaTitle: saved.metaTitle || '',
          metaDescription: saved.metaDescription || '',
          reviews: saved.reviews || [],
          faqs: saved.faqs || []
        };
        setForm(synced);
        formRef.current = synced;
        setSuccess(true);
        toast.success(isNew ? 'Product created successfully' : 'Product updated successfully');
        
        if (isNew) {
          setTimeout(() => { router.push(`/admin/products/${saved._id}`); }, 1200);
        } else {
          setTimeout(() => setSuccess(false), 3000);
        }
      } else {
        const err = await res.json();
        setServerError(err.error || 'Failed to save product. Please try again.');
        toast.error('Failed to save product');
      }
    } catch (error) {
      setServerError('Network error. Please check your connection.');
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const addSpec = () => {
    if (!newSpec.key || !newSpec.value) return;
    setForm(prev => ({
      ...prev,
      specs: { ...prev.specs, [newSpec.key]: newSpec.value }
    }));
    setNewSpec({ key: '', value: '' });
  };

  const removeSpec = (key: string) => {
    const newSpecs = { ...form.specs };
    delete newSpecs[key];
    setForm(prev => ({ ...prev, specs: newSpecs }));
  };

  const addFeature = () => {
    if (!newFeature.trim()) return;
    setForm(prev => ({
      ...prev,
      features: [...prev.features, newFeature.trim()]
    }));
    setNewFeature('');
  };

  const removeFeature = (idx: number) => {
    setForm(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== idx)
    }));
  };

  const addReview = () => {
    if (!newReview.author.trim() || !newReview.comment.trim()) {
      toast.error('Author and comment required');
      return;
    }
    const updatedReviews = [...formRef.current.reviews, { ...newReview }];
    formRef.current = { ...formRef.current, reviews: updatedReviews };
    setForm(prev => ({ ...prev, reviews: updatedReviews }));
    setNewReview({ author: '', rating: 5, comment: '', images: [] });
    toast.success('Review added');
  };

  const removeReview = (idx: number) => {
    const updatedReviews = formRef.current.reviews.filter((_, i) => i !== idx);
    formRef.current = { ...formRef.current, reviews: updatedReviews };
    setForm(prev => ({ ...prev, reviews: updatedReviews }));
  };

  const addFaq = () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) return;
    const updatedFaqs = [...formRef.current.faqs, { ...newFaq }];
    formRef.current = { ...formRef.current, faqs: updatedFaqs };
    setForm(prev => ({ ...prev, faqs: updatedFaqs }));
    setNewFaq({ question: '', answer: '' });
  };

  const removeFaq = (idx: number) => {
    const updatedFaqs = formRef.current.faqs.filter((_, i) => i !== idx);
    formRef.current = { ...formRef.current, faqs: updatedFaqs };
    setForm(prev => ({ ...prev, faqs: updatedFaqs }));
  };

  const updateSlug = (title: string) => {
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // If slug is empty after sanitization but title is not, use a fallback
    const finalSlug = slug || title.replace(/\s+/g, '-').toLowerCase();
    
    setForm(prev => ({ ...prev, title, slug: finalSlug }));
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 relative">
      {/* Success Banner (non-blocking) */}
      {success && (
        <div className="fixed top-4 right-4 z-[100] flex items-center gap-3 bg-white border border-green-200 border-l-4 border-l-green-500 px-6 py-4 shadow-xl animate-in slide-in-from-right-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-black text-secondary uppercase tracking-widest">Saved</p>
            <p className="text-xs text-gray-400 font-medium">All changes persisted to database.</p>
          </div>
        </div>
      )}

      {/* Error Message Display */}
      {serverError && (
        <div className="max-w-6xl mx-auto mt-8 animate-in slide-in-from-top-4 duration-300">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 flex items-start space-x-4 shadow-sm">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-black text-red-800 uppercase tracking-widest mb-1">Error</h3>
              <p className="text-xs text-red-600 font-bold">{serverError}</p>
            </div>
            <button onClick={() => setServerError(null)} className="text-red-400 hover:text-red-600 transition-colors ml-auto">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto pt-10 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/admin/products">
            <button className="p-2 hover:bg-gray-100 transition-colors group">
              <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-secondary transition-colors" />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase">
              {isNew ? 'Add Product' : 'Edit Product'}
            </h1>
            <div className="flex items-center text-[10px] space-x-2 text-gray-400 font-bold uppercase tracking-widest mt-1">
              <span>Inventory</span>
              <ChevronRight className="w-3 h-3 text-primary" />
              <span className="text-secondary opacity-70">{isNew ? 'Pending ID' : form.slug}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            type="button"
            onClick={() => handleSubmit()}
            disabled={loading}
            className="flex items-center space-x-2 px-10 py-4 bg-secondary text-white text-xs font-black uppercase tracking-widest hover:bg-primary transition-all shadow-xl active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                <span>Securing Data...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isNew ? 'Create Product' : 'Save Changes'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Form Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-gray-100 overflow-hidden shadow-sm">
            <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide">
              {[
                { id: 'details', label: 'General Specs', icon: Info },
                { id: 'performance', label: 'Technical Narrative', icon: Zap },
                { id: 'specs', label: 'Engineering Array', icon: Settings },
                { id: 'media', label: 'Visual Assets', icon: Package },
                { id: 'reviews', label: 'Customer Reviews', icon: Star },
                { id: 'faq', label: 'FAQ', icon: HelpCircle },
                { id: 'seo', label: 'SEO Analysis', icon: Globe }
              ].map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-5 text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 transition-all whitespace-nowrap border-b-2 ${
                    activeTab === tab.id ? 'border-primary text-secondary bg-gray-50/50' : 'border-transparent text-gray-400 hover:text-secondary hover:bg-gray-50/30'
                  }`}
                >
                  <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary' : ''}`} />
                  <span>{tab.label}</span>
                  {(tab.id === 'reviews' && form.reviews.length > 0) && (
                    <span className="ml-1 px-1.5 py-0.5 bg-primary text-white text-[8px] font-black rounded-full">{form.reviews.length}</span>
                  )}
                  {(tab.id === 'faq' && form.faqs.length > 0) && (
                    <span className="ml-1 px-1.5 py-0.5 bg-primary text-white text-[8px] font-black rounded-full">{form.faqs.length}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-10">
              {activeTab === 'details' && (
                <div className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <Input 
                      label="Product Title"
                      value={form.title || ''} 
                      onChange={(e) => updateSlug(e.target.value)}
                      placeholder="e.g. Tensile Tester LZX-500"
                      error={errors.title}
                      info="The product name displayed to customers."
                    />
                    <Input 
                      label="Global URL Slug"
                      value={form.slug || ''} 
                      onChange={(e) => setForm({...form, slug: e.target.value})}
                      className="text-primary"
                      error={errors.slug}
                      info="The URL-friendly identifier. Auto-generated from title."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <Input 
                      label="Technical Model Number"
                      value={form.modelNumber || ''} 
                      onChange={(e) => setForm({...form, modelNumber: e.target.value})}
                      placeholder="e.g. LZX-500-REV2"
                      error={errors.modelNumber}
                      info="Unique manufacturing identifier or SKU."
                    />
                  </div>

                  <TextArea 
                    label="Product Description"
                    value={form.description || ''} 
                    onChange={(e) => setForm({...form, description: e.target.value})}
                    placeholder="Provide a detailed description of the product, its features, and applications..."
                    rows={6}
                    error={errors.description}
                    info="This description appears on product listing and detail pages."
                  />
                </div>
              )}

              {activeTab === 'performance' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                      <div>
                        <h3 className="text-secondary font-black uppercase tracking-tighter text-lg">Key Features</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Highlight main selling points</p>
                      </div>
                      <Zap className="w-6 h-6 text-primary" />
                    </div>
                    
                    <div className="flex space-x-2">
                      <input 
                        type="text" 
                        placeholder="e.g. Servo-driven high precision control"
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        className="flex-1 p-4 bg-gray-50 border border-gray-100 text-sm font-bold outline-none focus:border-primary transition-all"
                        onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                      />
                      <button 
                        type="button"
                        onClick={addFeature}
                        className="px-8 py-4 bg-secondary text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-md active:scale-95"
                      >
                        Add
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {form.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-white border border-gray-100 group hover:border-primary/20 transition-all">
                          <div className="flex items-center space-x-4">
                            <div className="w-2 h-2 bg-primary rounded-full" />
                            <span className="text-sm font-bold text-secondary">{feature}</span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => removeFeature(idx)}
                            className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6 pt-6 ">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                      <div>
                        <h3 className="text-secondary font-black uppercase tracking-tighter text-lg">Technical Specification</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Deep Narrative / Protocol Details</p>
                      </div>
                      <FileText className={`w-6 h-6 ${errors.specificationText ? 'text-red-500 animate-pulse' : 'text-primary'}`} />
                    </div>
                    <TextArea 
                      value={form.specificationText || ''} 
                      onChange={(e: any) => setForm({...form, specificationText: e.target.value})}
                      placeholder="Enter detailed technical narrative, material compatibility, and engineering standards..."
                      rows={10}
                      error={errors.specificationText}
                      info="Detailed engineering standards and material compatibility analysis."
                    />
                  </div>
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
                  <div className={`${errors.specs ? 'bg-red-50 border-red-200 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'bg-secondary border-transparent'} p-8 text-white relative transition-all duration-500 overflow-hidden group`}>
                    <div className="relative z-10">
                      <h4 className={`font-black text-xs uppercase tracking-widest mb-2 flex items-center ${errors.specs ? 'text-red-600' : 'text-white'}`}>
                        {errors.specs ? <AlertCircle className="w-4 h-4 mr-2" /> : <ShieldAlert className="w-4 h-4 mr-2 text-primary" />}
                        Technical Specifications
                        {errors.specs && <span className="ml-2">— Required</span>}
                      </h4>
                      <p className={`text-sm max-w-md ${errors.specs ? 'text-red-900/60' : 'text-white/50'}`}>Define specific technical parameters that will appear in product comparisons.</p>
                    </div>
                    <Settings className={`absolute -bottom-4 -right-4 w-32 h-32 transition-transform duration-1000 ${errors.specs ? 'text-red-600/10' : 'text-white/5'}`} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-6 border border-gray-100">
                    <input 
                      type="text" 
                      placeholder="Parameter (e.g. Load Range)"
                      value={newSpec.key || ''}
                      onChange={(e) => setNewSpec({...newSpec, key: e.target.value})}
                      className="p-4 bg-white border border-gray-200 text-xs font-black uppercase tracking-widest outline-none focus:border-primary"
                    />
                    <input 
                      type="text" 
                      placeholder="Value (e.g. 1 - 5000N)"
                      value={newSpec.value || ''}
                      onChange={(e) => setNewSpec({...newSpec, value: e.target.value})}
                      className="p-4 bg-white border border-gray-200 text-sm font-bold outline-none focus:border-primary"
                    />
                    <button 
                      type="button"
                      onClick={addSpec}
                      className="px-6 py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-secondary transition-all shadow-md active:scale-95"
                    >
                      Append Spec
                    </button>
                  </div>

                  <div className="space-y-2">
                    {Object.entries(form.specs).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-5 border border-gray-100 bg-white group hover:border-primary/20 transition-all">
                        <div className="flex items-center space-x-12">
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 w-32">{key}</span>
                          <span className="text-sm font-bold text-secondary">{value}</span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => removeSpec(key)}
                          className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'media' && (
                 <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
                    <div className="bg-blue-50/50 p-8 border-l-4 border-blue-500">
                      <div className="flex items-center space-x-3 mb-3">
                        <Info className="w-5 h-5 text-blue-500" />
                        <h4 className="font-black text-xs uppercase tracking-widest text-blue-500">Asset Management</h4>
                      </div>
                      <p className="text-sm text-secondary/60 leading-relaxed">Upload high-resolution instrument photography. The primary image will be used for the regional catalog thumbnail.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {form.images.map((img, idx) => (
                        <div key={idx} className="aspect-square relative group bg-gray-100 border border-gray-100 overflow-hidden shadow-sm">
                          <img src={img} className="w-full h-full object-cover" alt="" />
                          <div className="absolute inset-0 bg-secondary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                            <button 
                              type="button"
                              onClick={() => setForm({...form, images: form.images.filter((_, i) => i !== idx)})}
                              className="p-3 bg-red-600 text-white shadow-xl hover:scale-110 transition-transform"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                          {idx === 0 && (
                            <div className="absolute top-2 left-2 px-3 py-1 bg-primary text-white text-[8px] font-black uppercase tracking-widest">
                              Featured View
                            </div>
                          )}
                        </div>
                      ))}
                      
                      <label 
                        className={`aspect-square border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all group ${
                          loading ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-200 hover:border-primary hover:bg-primary/5'
                        }`}
                      >
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          disabled={loading}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            
                            setLoading(true);
                            const formData = new FormData();
                            formData.append('file', file);
                            
                            try {
                              const res = await fetch('/api/admin/upload', {
                                method: 'POST',
                                body: formData
                              });
                              if (res.ok) {
                                const data = await res.json();
                                setForm(prev => ({ ...prev, images: [...prev.images, data.url] }));
                                toast.success('Visual asset synced');
                              } else {
                                toast.error('Asset upload rejected');
                              }
                            } catch (err) {
                              toast.error('Network sync failure');
                            } finally {
                              setLoading(false);
                            }
                          }}
                        />
                        <div className="text-center p-6">
                          <Plus className={`w-10 h-10 mx-auto mb-3 transition-transform ${loading ? 'animate-spin text-gray-300' : 'text-gray-200 group-hover:text-primary group-hover:scale-110'}`} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-primary">
                            {loading ? 'Processing...' : 'Sync New Asset'}
                          </span>
                        </div>
                      </label>
                    </div>

                    <div className="pt-8 border-t border-gray-100">
                      <div className="space-y-4">
                        <h3 className="text-secondary font-black uppercase tracking-tighter text-lg">Product Video</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">YouTube video URL displayed after features</p>
                        <Input 
                          label="YouTube URL"
                          value={form.youtubeUrl || ''} 
                          onChange={(e: any) => setForm({...form, youtubeUrl: e.target.value})}
                          placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                          info="Paste a full YouTube URL. It will be embedded as a video player on the product page."
                        />
                      </div>
                    </div>
                 </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div>
                      <h3 className="text-secondary font-black uppercase tracking-tighter text-lg">Customer Reviews</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Add verified customer testimonials</p>
                    </div>
                    <Star className="w-6 h-6 text-primary" />
                  </div>

                  {/* Add Review Form */}
                  <div className="bg-gray-50 border border-gray-100 p-6 space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Add New Review</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Reviewer Name"
                        value={newReview.author}
                        onChange={(e) => setNewReview({ ...newReview, author: e.target.value })}
                        className="p-4 bg-white border border-gray-200 text-sm font-bold outline-none focus:border-primary transition-all"
                      />
                      <div className="flex items-center gap-2 bg-white border border-gray-200 px-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 whitespace-nowrap">Rating:</span>
                        {[1,2,3,4,5].map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setNewReview({ ...newReview, rating: r })}
                            className="transition-transform hover:scale-110"
                          >
                            <Star className={`w-5 h-5 ${r <= newReview.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      placeholder="Review comment..."
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      rows={3}
                      className="w-full p-4 bg-white border border-gray-200 text-sm font-medium outline-none focus:border-primary transition-all resize-none"
                    />

                    {/* Review Image Upload section */}
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Attach Customer Photos (Optional)</label>
                       <div className="flex flex-wrap gap-4">
                         {newReview.images.map((img, idx) => (
                           <div key={idx} className="relative w-16 h-16 border border-gray-200 bg-white p-1">
                             <img src={img} alt="Review attachment" className="w-full h-full object-cover" />
                             <button
                               type="button"
                               onClick={() => setNewReview(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                               className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:scale-110 transition-transform"
                             >
                               <X className="w-3 h-3" />
                             </button>
                           </div>
                         ))}
                         <label className="w-16 h-16 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                           <input 
                             type="file" 
                             accept="image/*" 
                             className="hidden" 
                             onChange={async (e) => {
                               const file = e.target.files?.[0];
                               if (!file) return;
                               const formData = new FormData();
                               formData.append('file', file);
                               try {
                                 const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
                                 if (res.ok) {
                                   const data = await res.json();
                                   setNewReview(prev => ({ ...prev, images: [...prev.images, data.url] }));
                                 } else {
                                   toast.error('Upload failed');
                                 }
                               } catch (err) {
                                 toast.error('Network error');
                               }
                             }}
                           />
                           <Plus className="w-4 h-4 text-gray-400" />
                         </label>
                       </div>
                    </div>

                    <button
                      type="button"
                      onClick={addReview}
                      className="flex items-center gap-2 px-8 py-4 bg-secondary text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-md active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      Add Review
                    </button>
                  </div>

                  {/* Review List */}
                  <div className="space-y-3">
                    {form.reviews.length === 0 && (
                      <div className="text-center py-10 text-gray-300 border border-dashed border-gray-200">
                        <Star className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No reviews yet</p>
                      </div>
                    )}
                    {form.reviews.map((review, idx) => (
                      <div key={idx} className="p-5 border border-gray-100 bg-white group hover:border-primary/20 transition-all">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-sm font-black text-secondary">{review.author}</span>
                              <div className="flex">
                                {[1,2,3,4,5].map((r) => (
                                  <Star key={r} className={`w-3 h-3 ${r <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 font-medium mb-3">{review.comment}</p>
                            {review.images && review.images.length > 0 && (
                              <div className="flex gap-2">
                                {review.images.map((img, i) => (
                                  <div key={i} className="w-12 h-12 border border-gray-200 p-0.5 bg-gray-50">
                                    <img src={img} className="w-full h-full object-cover" alt="attachment" />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeReview(idx)}
                            className="p-2 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'faq' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div>
                      <h3 className="text-secondary font-black uppercase tracking-tighter text-lg">Frequently Asked Questions</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Answer common customer queries</p>
                    </div>
                    <HelpCircle className="w-6 h-6 text-primary" />
                  </div>

                  {/* Add FAQ Form */}
                  <div className="bg-gray-50 border border-gray-100 p-6 space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Add New FAQ</h4>
                    <input
                      type="text"
                      placeholder="Question..."
                      value={newFaq.question}
                      onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                      className="w-full p-4 bg-white border border-gray-200 text-sm font-bold outline-none focus:border-primary transition-all"
                    />
                    <textarea
                      placeholder="Answer..."
                      value={newFaq.answer}
                      onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                      rows={4}
                      className="w-full p-4 bg-white border border-gray-200 text-sm font-medium outline-none focus:border-primary transition-all resize-none"
                    />
                    <button
                      type="button"
                      onClick={addFaq}
                      className="flex items-center gap-2 px-8 py-4 bg-secondary text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-md active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      Add FAQ
                    </button>
                  </div>

                  {/* FAQ List */}
                  <div className="space-y-3">
                    {form.faqs.length === 0 && (
                      <div className="text-center py-10 text-gray-300 border border-dashed border-gray-200">
                        <HelpCircle className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No FAQs yet</p>
                      </div>
                    )}
                    {form.faqs.map((faq, idx) => (
                      <div key={idx} className="p-5 border border-gray-100 bg-white group hover:border-primary/20 transition-all">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-sm font-black text-secondary mb-2 flex items-start gap-2">
                              <span className="text-primary text-xs mt-0.5 flex-shrink-0">Q.</span>
                              {faq.question}
                            </p>
                            <p className="text-sm text-gray-600 font-medium ml-4 pl-1 border-l-2 border-primary/20">{faq.answer}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFaq(idx)}
                            className="p-2 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-right-4">
                  <div className="bg-primary/5 p-8 border-l-4 border-primary">
                    <div className="flex items-center space-x-3 mb-3">
                      <Globe className="w-5 h-5 text-primary" />
                      <h4 className="font-black text-xs uppercase tracking-widest text-primary">Search Engine Optimization</h4>
                    </div>
                    <p className="text-sm text-secondary/60 leading-relaxed font-medium">Fine-tune how this instrument appears in global search indices to maximize organic visibility.</p>
                  </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <SEOMetrics label="Meta Title Strength" text={form.metaTitle || ''} min={40} max={60} />
                      <Input 
                        label="SEO Title Tag"
                        value={form.metaTitle || ''} 
                        onChange={(e) => setForm({...form, metaTitle: e.target.value})}
                        placeholder="Search result heading..."
                        error={errors.metaTitle}
                        info="This title appears in browser tabs and search engine results. Best between 40-60 characters."
                      />
                    </div>

                    <div className="space-y-6">
                      <SEOMetrics label="Description Strength" text={form.metaDescription || ''} min={120} max={160} />
                      <TextArea 
                        label="Meta Description"
                        value={form.metaDescription || ''} 
                        onChange={(e) => setForm({...form, metaDescription: e.target.value})}
                        placeholder="Concise technical summary..."
                        rows={4}
                        error={errors.metaDescription}
                        info="A brief summary (120-160 chars) that appears beneath your link in search results."
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-8">
          <div className="bg-white border border-gray-100 p-8 space-y-8 shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-secondary flex items-center border-b border-gray-100 pb-5">
              <Layers className="w-4 h-4 mr-2 text-primary" />
              Product Settings
            </h3>

             <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex justify-between">
                <span>Product Category</span>
                {errors.category && <AlertCircle className="w-3 h-3 text-red-500 animate-pulse" />}
              </label>
              <select 
                value={form.category || ''} 
                onChange={(e) => setForm({...form, category: e.target.value})}
                className={`w-full p-4 bg-gray-50 border ${errors.category ? 'border-red-500 bg-red-50/20' : 'border-gray-100 focus:border-primary'} outline-none text-xs font-black uppercase tracking-widest text-secondary transition-all`}
                required
              >
                <option value="">Select Domain</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              {errors.category && <p className="text-[9px] font-black uppercase text-red-500 tracking-widest pt-1">{errors.category}</p>}
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Application Type</label>
              <div className="flex flex-col space-y-2">
                {['Laboratory', 'Production', 'R&D'].map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setForm({...form, usage: u})}
                    className={`p-4 text-left text-[10px] font-black uppercase tracking-widest transition-all ${
                      form.usage === u ? 'bg-secondary text-white border-secondary' : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100'
                    } border`}
                  >
                    {u} Access
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}