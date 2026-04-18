'use client';

import { use, useState, useEffect } from 'react';
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
  XCircle
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
    metaTitle: '',
    metaDescription: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newSpec, setNewSpec] = useState({ key: '', value: '' });
  const [newFeature, setNewFeature] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(!isNew);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'performance' | 'media' | 'seo'>('details');
  const [categories, setCategories] = useState<any[]>([]);

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
            metaTitle: data.metaTitle || '',
            metaDescription: data.metaDescription || ''
          });
          setFetching(false);
        })
        .catch(() => {
          toast.error('Failed to retrieve instrument data');
          setFetching(false);
        });
    }
  }, [params.id, isNew]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Basic Details
    if (!form.title.trim()) {
      newErrors.title = 'Instrument Title is required';
    }
    if (!form.modelNumber?.trim()) {
      newErrors.modelNumber = 'Technical Model Number is required';
    }
    if (!form.category) {
      newErrors.category = 'Industrial Category must be selected';
    }
    if (!form.description.trim()) {
      newErrors.description = 'Marketing Description is required';
    }
    
    // Slug Validation (must not be empty)
    if (!form.slug || !form.slug.trim()) {
      newErrors.slug = 'Valid URL slug could not be generated from title. Please ensure title contains letters or numbers.';
    }

    // SEO Analysis
    if (!form.metaTitle.trim()) {
      newErrors.metaTitle = 'SEO Title is required for indexing';
    }
    if (!form.metaDescription.trim()) {
      newErrors.metaDescription = 'SEO Description is required for indexing';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const errorCount = Object.keys(newErrors).length;
      toast.error(`Protocols incomplete: ${errorCount} mandatory field(s) missing.`);
      
      // Auto-switch to the first tab with an error
      if (newErrors.title || newErrors.modelNumber || newErrors.description || newErrors.slug) setActiveTab('details' as any); 
      else if (newErrors.metaTitle || newErrors.metaDescription) setActiveTab('seo');
      
      return false;
    }

    return true;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setServerError(null);
    const method = isNew ? 'POST' : 'PUT';
    const url = isNew ? '/api/products' : `/api/products/${params.id}`;

    try {
      const res = await fetch(url, {
        method,
        body: JSON.stringify(form),
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        setSuccess(true);
        toast.success(isNew ? 'New instrument indexed successfully' : 'Configuration updated');
        
        // Brief delay for the user to see the success state
        setTimeout(() => {
          router.push('/admin/products');
          router.refresh();
        }, 1500);
      } else {
        const err = await res.json();
        setServerError(err.error || 'System Protocol Error: Synchronization Failed');
        toast.error('Submission rejected by server');
      }
    } catch (error) {
      setServerError('Network integrity compromised. Check server connectivity.');
      toast.error('Network Protocol Error');
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
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Initializing Secure Connection...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 relative">
      {/* Success Modal Overlay */}
      {success && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-secondary/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white p-12 text-center max-w-sm w-full mx-4 shadow-2xl border-t-4 border-primary animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-black text-secondary tracking-tighter uppercase mb-2">Protocol Success</h2>
            <p className="text-sm text-gray-500 font-medium">The instrument has been successfully synchronized with the global catalog.</p>
          </div>
        </div>
      )}

      {/* Error Message Display */}
      {serverError && (
        <div className="max-w-6xl mx-auto mt-8 animate-in slide-in-from-top-4 duration-300">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 flex items-start space-x-4 shadow-sm">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-black text-red-800 uppercase tracking-widest mb-1">Server Rejection</h3>
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
              {isNew ? 'New Catalog Entry' : 'Refining Configuration'}
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
                <span>{isNew ? 'Add Catalog' : 'Save Configuration'}</span>
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
                </button>
              ))}
            </div>

            <div className="p-10">
              {activeTab === 'details' && (
                <div className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <Input 
                      label="Instrument Model / Title"
                      value={form.title || ''} 
                      onChange={(e) => updateSlug(e.target.value)}
                      placeholder="e.g. Tensile Tester LZX-500"
                      error={errors.title}
                      info="The official commercial name of the instrument."
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
                      info="Unique manufacturing identifier (SKU/Model)."
                    />
                  </div>

                  <TextArea 
                    label="Marketing Description"
                    value={form.description || ''} 
                    onChange={(e) => setForm({...form, description: e.target.value})}
                    placeholder="High-level overview for general inquiries..."
                    rows={6}
                    error={errors.description}
                    info="A compelling summary for the product listing page."
                  />
                </div>
              )}

              {activeTab === 'performance' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                      <div>
                        <h3 className="text-secondary font-black uppercase tracking-tighter text-lg">Key Features</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Instrument Value Propositions</p>
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
                        Engineering Matrix
                        {errors.specs && <span className="ml-2">— Mandatory field</span>}
                      </h4>
                      <p className={`text-sm max-w-md ${errors.specs ? 'text-red-900/60' : 'text-white/50'}`}>Define specific technical parameters that will appear in the quick comparison table.</p>
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
              Categorization
            </h3>

             <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex justify-between">
                <span>Instrument Category</span>
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
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Application Layer</label>
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