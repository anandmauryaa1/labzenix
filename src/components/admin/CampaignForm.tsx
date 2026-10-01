'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, ArrowLeft, Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Eye, EyeOff, Upload, ImageIcon, X, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import Link from 'next/link';
import HeroSection from '@/components/campaigns/HeroSection';
import VideoSection from '@/components/campaigns/VideoSection';
import { 
  FeaturesSection, SpecificationsSection, ComparisonSection, FeedbackSection, 
  ApplicationsSection, FAQSection, TabbedContentSection, ProductTabsSection, DownloadsSection, ContactSection, RelatedProductsSection 
} from '@/components/campaigns/Sections';
import toast from 'react-hot-toast';
import Image from 'next/image';

// ─── Image Upload Criteria & Helpers ─────────────────────────────────────────
const MAX_IMAGE_SIZE_MB = 2;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_IMAGE_LABEL = 'JPG, PNG, WEBP, GIF';

async function uploadImage(file: File): Promise<string> {
  // Client-side pre-validation: Format
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(`Invalid format (${file.type || 'unknown'}). Allowed formats: ${ALLOWED_IMAGE_LABEL}.`);
  }

  // Client-side pre-validation: Size
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(`Image file size should be below ${MAX_IMAGE_SIZE_MB}MB (Selected file is ${sizeInMB}MB).`);
  }

  const formData = new FormData();
  formData.append('file', file);

  let res: Response;
  try {
    res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
  } catch (err: any) {
    throw new Error('Network error during upload. Please check your connection and try again.');
  }

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Unauthorized: Your session has expired. Please refresh and log in again to upload.');
    }
    if (res.status === 413) {
      throw new Error(`Image file size should be below ${MAX_IMAGE_SIZE_MB}MB (Request payload too large).`);
    }
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Upload failed');
  }

  const data = await res.json();
  return data.url as string;
}

// ─── Reusable Image Upload Field ────────────────────────────────────────────
function ImageUploadField({
  value,
  onChange,
  label = 'Image',
  placeholder = 'https://...',
  recommendedNote,
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  recommendedNote?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setWarningMessage(null);

    const sizeInMB = file.size / (1024 * 1024);

    // Validate file size client-side immediately
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      const msg = `Image file size should be below ${MAX_IMAGE_SIZE_MB}MB (Selected file is ${sizeInMB.toFixed(1)}MB)`;
      setErrorMessage(msg);
      toast.error(msg);
      e.target.value = '';
      return;
    }

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      const msg = `Invalid format (${file.type || 'unknown'}). Allowed formats: ${ALLOWED_IMAGE_LABEL}.`;
      setErrorMessage(msg);
      toast.error(msg);
      e.target.value = '';
      return;
    }

    // Warning for large images approaching limit (> 1.5MB)
    if (sizeInMB > 1.5) {
      setWarningMessage(`Large image detected (${sizeInMB.toFixed(1)}MB). Uploading may take a few moments.`);
    }

    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
      setErrorMessage(null);
      setWarningMessage(null);
      toast.success('Image uploaded successfully');
    } catch (err: any) {
      setErrorMessage(err.message || 'Upload failed');
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-gray-700 uppercase">{label}</label>
        <span className="text-[11px] text-gray-400 font-medium">
          {ALLOWED_IMAGE_LABEL} &bull; Max {MAX_IMAGE_SIZE_MB}MB
        </span>
      </div>

      <div className="flex gap-2 items-start">
        {/* Thumbnail */}
        {value ? (
          <div className="relative w-16 h-16 shrink-0 border border-gray-200 bg-gray-50 overflow-hidden rounded-sm group">
            <Image src={value} alt="preview" fill className="object-cover" sizes="64px" />
            <button
              type="button"
              onClick={() => { onChange(''); setErrorMessage(null); setWarningMessage(null); }}
              className="absolute top-0 right-0 bg-black/70 hover:bg-red-600 text-white p-0.5 opacity-0 group-hover:opacity-100 transition-all"
              title="Remove image"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="w-16 h-16 shrink-0 border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-300 rounded-sm">
            <ImageIcon className="w-6 h-6" />
          </div>
        )}

        {/* URL input + Upload button */}
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 border border-gray-300 p-2 outline-none focus:border-primary text-sm rounded-sm"
              value={value}
              onChange={e => {
                onChange(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder={placeholder}
            />
            <label
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider border cursor-pointer transition-all rounded-sm ${
                uploading
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-primary/5 text-primary border-primary/20 hover:bg-primary hover:text-white'
              }`}
            >
              {uploading ? (
                <><div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" /> Uploading...</>
              ) : (
                <><Upload className="w-3 h-3" /> Upload</>
              )}
              <input
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={uploading}
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Criteria info line */}
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <Info className="w-3 h-3 text-primary/70 shrink-0" />
            <span>Criteria: {ALLOWED_IMAGE_LABEL} below {MAX_IMAGE_SIZE_MB}MB{recommendedNote ? ` &bull; ${recommendedNote}` : ''}</span>
          </div>

          {/* Inline Error Message */}
          {errorMessage && (
            <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 px-2.5 py-1.5 rounded">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Inline Warning Message */}
          {warningMessage && !errorMessage && (
            <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{warningMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Multi-Image Upload Field (for Hero section) ─────────────────────────────
function MultiImageUploadField({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setWarningMessage(null);

    const sizeInMB = file.size / (1024 * 1024);

    // Validate file size client-side immediately
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      const msg = `Image file size should be below ${MAX_IMAGE_SIZE_MB}MB (Selected file is ${sizeInMB.toFixed(1)}MB)`;
      setErrorMessage(msg);
      toast.error(msg);
      e.target.value = '';
      return;
    }

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      const msg = `Invalid format (${file.type || 'unknown'}). Allowed formats: ${ALLOWED_IMAGE_LABEL}.`;
      setErrorMessage(msg);
      toast.error(msg);
      e.target.value = '';
      return;
    }

    // Warning for large images approaching limit (> 1.5MB)
    if (sizeInMB > 1.5) {
      setWarningMessage(`Large image detected (${sizeInMB.toFixed(1)}MB). Uploading may take a few moments.`);
    }

    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange([...images, url]);
      setErrorMessage(null);
      setWarningMessage(null);
      toast.success('Image uploaded successfully');
    } catch (err: any) {
      setErrorMessage(err.message || 'Upload failed');
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const updateUrl = (index: number, url: string) => {
    const updated = [...images];
    updated[index] = url;
    onChange(updated);
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between pb-1 border-b border-gray-100">
        <div>
          <label className="text-xs font-bold text-gray-700 uppercase">Images / Gallery</label>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5">
            <Info className="w-3 h-3 text-primary/70 shrink-0" />
            <span>Criteria: {ALLOWED_IMAGE_LABEL} &bull; Max {MAX_IMAGE_SIZE_MB}MB per image</span>
          </div>
        </div>
        <label
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider border cursor-pointer transition-all rounded-sm ${
            uploading
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              : 'bg-primary/5 text-primary border-primary/20 hover:bg-primary hover:text-white'
          }`}
        >
          {uploading ? (
            <><div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" /> Uploading...</>
          ) : (
            <><Upload className="w-3 h-3" /> Upload Image</>
          )}
          <input
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={uploading}
            onChange={handleFileChange}
          />
        </label>
      </div>

      {/* Inline Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 px-2.5 py-1.5 rounded">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Inline Warning Message */}
      {warningMessage && !errorMessage && (
        <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{warningMessage}</span>
        </div>
      )}

      {images.length === 0 && (
        <p className="text-xs text-gray-400 italic border border-dashed border-gray-200 text-center py-4 bg-gray-50/50 rounded-sm">
          No images yet &mdash; click &quot;Upload Image&quot; (under {MAX_IMAGE_SIZE_MB}MB) or paste image URL below.
        </p>
      )}

      <div className="space-y-2">
        {images.map((img, i) => (
          <div key={i} className="flex gap-2 items-center">
            {/* Thumbnail */}
            {img ? (
              <div className="relative w-10 h-10 shrink-0 border border-gray-200 bg-gray-50 overflow-hidden">
                <Image src={img} alt={`img-${i}`} fill className="object-cover" sizes="40px" />
              </div>
            ) : (
              <div className="w-10 h-10 shrink-0 border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-300">
                <ImageIcon className="w-4 h-4" />
              </div>
            )}
            <input
              type="text"
              className="flex-1 border border-gray-300 p-2 outline-none focus:border-primary text-sm"
              value={img}
              onChange={e => updateUrl(i, e.target.value)}
              placeholder="https://..."
            />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add blank URL row */}
      <button
        type="button"
        onClick={() => onChange([...images, ''])}
        className="mt-2 text-xs text-primary font-bold flex items-center gap-1 hover:underline"
      >
        <Plus className="w-3 h-3" /> Add URL manually
      </button>
    </div>
  );
}


const SECTION_TYPES = [
  'Hero',
  'TextWithImage',
  'FeaturesWithImage',
  'Specifications',
  'ComparisonTable',
  'FAQs',
  'ApplicationExamples',
  'CustomerFeedback',
  'Downloads',
  'TabbedContent',
  'ProductTabs',
  'RelatedProducts',
  'Video'
];

export default function CampaignForm() {
  const router = useRouter();
  const params = useParams();
  const isEditing = !!params?.id;
  const campaignId = params?.id;

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<any>({
    title: '',
    slug: '',
    status: 'published',
    seo: { metaTitle: '', metaDescription: '' },
    sections: []
  });

  useEffect(() => {
    if (isEditing) {
      fetchCampaign();
    }
  }, [campaignId]);

  const fetchCampaign = async () => {
    try {
      const res = await fetch(`/api/admin/campaigns/${campaignId}`);
      if (res.ok) {
        const data = await res.json();
        setFormData(data);
      } else {
        toast.error('Campaign not found');
        router.push('/admin/campaigns');
      }
    } catch (error) {
      toast.error('Error fetching campaign');
    } finally {
      setIsLoading(false);
    }
  };

  // Split Screen Preview State
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug) {
      toast.error('Title and Slug are required');
      return;
    }

    setIsSaving(true);
    try {
      const url = isEditing ? `/api/admin/campaigns/${campaignId}` : '/api/admin/campaigns';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(isEditing ? 'Campaign updated' : 'Campaign created');
        router.push('/admin/campaigns');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Something went wrong');
      }
    } catch (error) {
      toast.error('Failed to save campaign');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: any, section?: string) => {
    if (section) {
      setFormData((prev: any) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, [field]: value }));
    }
  };

  const addSection = (type: string) => {
    const newSection = {
      id: Math.random().toString(36).substring(7),
      type,
      data: {} // Empty data payload to be filled by the specific section editor
    };
    setFormData((prev: any) => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  const removeSection = (index: number) => {
    if (!confirm('Are you sure you want to remove this section?')) return;
    setFormData((prev: any) => {
      const newSections = [...prev.sections];
      newSections.splice(index, 1);
      return { ...prev, sections: newSections };
    });
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    setFormData((prev: any) => {
      const newSections = [...prev.sections];
      if (direction === 'up' && index > 0) {
        [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
      } else if (direction === 'down' && index < newSections.length - 1) {
        [newSections[index + 1], newSections[index]] = [newSections[index], newSections[index + 1]];
      }
      return { ...prev, sections: newSections };
    });
  };

  const updateSectionData = (index: number, field: string, value: any) => {
    setFormData((prev: any) => {
      const newSections = [...prev.sections];
      if (!newSections[index].data) newSections[index].data = {};
      
      if (field === '') {
        newSections[index].data = value;
      } else {
        newSections[index].data = {
          ...newSections[index].data,
          [field]: value
        };
      }
      return { ...prev, sections: newSections };
    });
  };

  const renderSectionEditor = (section: any, index: number) => {
    const data = section.data || {};
    const setField = (field: string, value: any) => updateSectionData(index, field, value);

    switch(section.type) {
      case 'Hero':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Title Override</label>
              <input type="text" className="w-full border border-gray-300 p-2 outline-none focus:border-primary"
                value={data.title || ''} onChange={e => setField('title', e.target.value)} placeholder="Leave blank to use campaign title" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description (HTML)</label>
              <textarea rows={3} className="w-full border border-gray-300 p-2 outline-none focus:border-primary"
                value={data.description || ''} onChange={e => setField('description', e.target.value)} />
            </div>
            <MultiImageUploadField
              images={data.images || []}
              onChange={urls => setField('images', urls)}
            />
          </div>
        );

      case 'Video':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Video Title</label>
              <input type="text" className="w-full border border-gray-300 p-2 outline-none focus:border-primary"
                value={data.title || ''} onChange={e => setField('title', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description</label>
              <textarea rows={2} className="w-full border border-gray-300 p-2 outline-none focus:border-primary"
                value={data.description || ''} onChange={e => setField('description', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">YouTube/Embed URL</label>
              <input type="url" className="w-full border border-gray-300 p-2 outline-none focus:border-primary"
                value={data.videoUrl || ''} onChange={e => setField('videoUrl', e.target.value)} />
            </div>
          </div>
        );

      case 'TextWithImage':
      case 'FeaturesWithImage': {
        const rawFeatures = data.features;
        let features: any[] = [];
        if (Array.isArray(rawFeatures)) {
          features = rawFeatures;
        } else if (typeof rawFeatures === 'string') {
          try {
            const parsed = JSON.parse(rawFeatures);
            if (Array.isArray(parsed)) features = parsed;
          } catch (e) {}
        }
        const setFeatures = (updated: any[]) => setField('features', updated);

        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Title</label>
                <input type="text" className="w-full border border-gray-300 p-2 outline-none focus:border-primary text-sm"
                  value={data.title || ''} onChange={e => setField('title', e.target.value)} placeholder="e.g. Key Advantages" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Image Position</label>
                <select className="w-full border border-gray-300 p-2 outline-none focus:border-primary text-sm"
                  value={data.imagePosition || 'left'} onChange={e => setField('imagePosition', e.target.value)}>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>
            <ImageUploadField
              label="Image"
              value={data.image || ''}
              onChange={url => setField('image', url)}
              recommendedNote="Recommended: 1200x800px"
            />

            {/* Features Editor */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase">Features</label>
                  <p className="text-xs text-gray-400">Add individual features with title and description</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFeatures([...features, { title: '', description: '' }])}
                  className="text-xs bg-primary text-white px-3 py-1.5 font-bold hover:bg-primary/90 flex items-center shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Feature
                </button>
              </div>

              {features.length === 0 && (
                <div className="text-xs text-gray-400 text-center py-4 border border-dashed border-gray-200 bg-gray-50/50">
                  No features added yet. Click &quot;Add Feature&quot; to get started.
                </div>
              )}

              <div className="space-y-3">
                {features.map((feat: any, fi: number) => (
                  <div key={fi} className="border border-gray-200 p-4 space-y-3 bg-white relative shadow-sm">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 uppercase tracking-wide">
                        Feature #{fi + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => setFeatures(features.filter((_: any, idx: number) => idx !== fi))}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Delete feature"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Title</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 p-2 outline-none focus:border-primary text-sm"
                        value={feat.title || ''}
                        onChange={e => setFeatures(features.map((f: any, idx: number) => idx === fi ? { ...f, title: e.target.value } : f))}
                        placeholder="e.g. High-Precision Measurement"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Description</label>
                      <textarea
                        rows={2}
                        className="w-full border border-gray-300 p-2 outline-none focus:border-primary text-sm"
                        value={feat.description || ''}
                        onChange={e => setFeatures(features.map((f: any, idx: number) => idx === fi ? { ...f, description: e.target.value } : f))}
                        placeholder="e.g. Accurate pressure sensors for exact bursting point detection."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case 'Specifications': {
        const rawSpecs = data.specs;
        let specs: any[] = [];
        if (Array.isArray(rawSpecs)) specs = rawSpecs;
        else if (typeof rawSpecs === 'string') {
          try { const p = JSON.parse(rawSpecs); if (Array.isArray(p)) specs = p; } catch (e) {}
        }
        const setSpecs = (updated: any[]) => setField('specs', updated);

        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Section Title</label>
              <input
                type="text"
                className="w-full border border-gray-300 p-2 outline-none focus:border-primary text-sm"
                value={data.title || ''}
                onChange={e => setField('title', e.target.value)}
                placeholder="e.g. Technical Specifications"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Content / Intro (Optional HTML)</label>
              <textarea
                rows={2}
                className="w-full border border-gray-300 p-2 outline-none focus:border-primary text-sm"
                value={data.content || ''}
                onChange={e => setField('content', e.target.value)}
                placeholder="Leave blank to display the table directly..."
              />
            </div>

            {/* Specifications Items */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase">Specification Items</label>
                  <p className="text-xs text-gray-400">Add technical specification rows (Key &amp; Value)</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSpecs([...specs, { key: '', value: '' }])}
                  className="text-xs bg-primary text-white px-3 py-1.5 font-bold hover:bg-primary/90 flex items-center shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Specification
                </button>
              </div>

              {specs.length === 0 && (
                <div className="text-xs text-gray-400 text-center py-6 border border-dashed border-gray-200 bg-gray-50/50">
                  No specifications added yet. Click &quot;Add Specification&quot; to get started.
                </div>
              )}

              <div className="space-y-2">
                {specs.map((spec: any, si: number) => (
                  <div key={si} className="flex gap-2 items-center bg-white border border-gray-200 p-3 shadow-sm">
                    <input
                      type="text"
                      className="w-1/3 border border-gray-300 p-2 outline-none focus:border-primary text-sm font-semibold"
                      value={spec.key || ''}
                      onChange={e => setSpecs(specs.map((s: any, idx: number) => idx === si ? { ...s, key: e.target.value } : s))}
                      placeholder="e.g. Pressure Range"
                    />
                    <input
                      type="text"
                      className="flex-1 border border-gray-300 p-2 outline-none focus:border-primary text-sm"
                      value={spec.value || ''}
                      onChange={e => setSpecs(specs.map((s: any, idx: number) => idx === si ? { ...s, value: e.target.value } : s))}
                      placeholder="e.g. Up to 6000 kPa"
                    />
                    <button
                      type="button"
                      onClick={() => setSpecs(specs.filter((_: any, idx: number) => idx !== si))}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1.5 shrink-0"
                      title="Delete specification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case 'ComparisonTable': {
        const rawRows = data.rows;
        let rows: any[] = [];
        if (Array.isArray(rawRows)) rows = rawRows;
        else if (typeof rawRows === 'string') {
          try { const p = JSON.parse(rawRows); if (Array.isArray(p)) rows = p; } catch (e) {}
        }
        const setRows = (updated: any[]) => setField('rows', updated);

        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Our Product Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 p-2 outline-none focus:border-primary text-sm"
                  value={data.productName || ''}
                  onChange={e => setField('productName', e.target.value)}
                  placeholder="e.g. LabZenix Premium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Competitor Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 p-2 outline-none focus:border-primary text-sm"
                  value={data.competitorName || ''}
                  onChange={e => setField('competitorName', e.target.value)}
                  placeholder="e.g. Conventional Tester"
                />
              </div>
            </div>

            {/* Comparison Rows List */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase">Comparison Rows</label>
                  <p className="text-xs text-gray-400">Add side-by-side comparison features</p>
                </div>
                <button
                  type="button"
                  onClick={() => setRows([...rows, { feature: '', ourValue: '', competitorValue: '' }])}
                  className="text-xs bg-primary text-white px-3 py-1.5 font-bold hover:bg-primary/90 flex items-center shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Comparison Row
                </button>
              </div>

              {rows.length === 0 && (
                <div className="text-xs text-gray-400 text-center py-6 border border-dashed border-gray-200 bg-gray-50/50">
                  No comparison rows added yet. Click &quot;Add Comparison Row&quot; to get started.
                </div>
              )}

              <div className="space-y-3">
                {rows.map((row: any, ri: number) => (
                  <div key={ri} className="border border-gray-200 p-4 space-y-3 bg-white relative shadow-sm">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 uppercase tracking-wide">
                        Row #{ri + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => setRows(rows.filter((_: any, idx: number) => idx !== ri))}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Delete row"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Feature / Spec</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 p-2 outline-none focus:border-primary text-sm font-semibold"
                        value={row.feature || ''}
                        onChange={e => setRows(rows.map((r: any, idx: number) => idx === ri ? { ...r, feature: e.target.value } : r))}
                        placeholder="e.g. Clamping Mechanism"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-primary uppercase mb-1">Our Product Value</label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 p-2 outline-none focus:border-primary text-sm"
                          value={row.ourValue || ''}
                          onChange={e => setRows(rows.map((r: any, idx: number) => idx === ri ? { ...r, ourValue: e.target.value } : r))}
                          placeholder="e.g. Pneumatic Auto-Clamp"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Competitor Value</label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 p-2 outline-none focus:border-primary text-sm"
                          value={row.competitorValue || ''}
                          onChange={e => setRows(rows.map((r: any, idx: number) => idx === ri ? { ...r, competitorValue: e.target.value } : r))}
                          placeholder="e.g. Manual Handwheel"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }
        
      case 'FAQs': {
        const faqs: any[] = data.faqs || [];
        const setFaqs = (updated: any[]) => setField('faqs', updated);
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 uppercase">FAQ Items</label>
              <button
                type="button"
                onClick={() => setFaqs([...faqs, { question: '', answer: '' }])}
                className="text-xs bg-primary text-white px-3 py-1.5 font-bold hover:bg-primary/90 flex items-center"
              >
                <Plus className="w-3 h-3 mr-1" /> Add FAQ
              </button>
            </div>
            {faqs.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4 border border-dashed border-gray-200">No FAQs yet. Click "Add FAQ" to get started.</p>
            )}
            {faqs.map((faq: any, i: number) => (
              <div key={i} className="border border-gray-200 p-4 space-y-3 bg-white relative">
                <button
                  type="button"
                  onClick={() => setFaqs(faqs.filter((_: any, fi: number) => fi !== i))}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Question</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 p-2 outline-none focus:border-primary text-sm"
                    value={faq.question || ''}
                    onChange={e => setFaqs(faqs.map((f: any, fi: number) => fi === i ? { ...f, question: e.target.value } : f))}
                    placeholder="e.g. What is bursting strength?"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Answer</label>
                  <textarea
                    rows={2}
                    className="w-full border border-gray-300 p-2 outline-none focus:border-primary text-sm"
                    value={faq.answer || ''}
                    onChange={e => setFaqs(faqs.map((f: any, fi: number) => fi === i ? { ...f, answer: e.target.value } : f))}
                    placeholder="Write the answer here..."
                  />
                </div>
              </div>
            ))}
          </div>
        );
      }

      case 'CustomerFeedback': {
        const feedbacks: any[] = data.feedbacks || [];
        const setFeedbacks = (updated: any[]) => setField('feedbacks', updated);
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Section Title</label>
              <input type="text" className="w-full border border-gray-300 p-2 outline-none focus:border-primary" value={data.title || ''} onChange={e => setField('title', e.target.value)} placeholder="Customer Feedback" />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 uppercase">Testimonials</label>
              <button
                type="button"
                onClick={() => setFeedbacks([...feedbacks, { quote: '', author: '', company: '' }])}
                className="text-xs bg-primary text-white px-3 py-1.5 font-bold hover:bg-primary/90 flex items-center"
              >
                <Plus className="w-3 h-3 mr-1" /> Add Testimonial
              </button>
            </div>
            {feedbacks.map((fb: any, i: number) => (
              <div key={i} className="border border-gray-200 p-4 space-y-3 bg-white relative">
                <button type="button" onClick={() => setFeedbacks(feedbacks.filter((_: any, fi: number) => fi !== i))} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quote</label>
                  <textarea rows={2} className="w-full border border-gray-300 p-2 text-sm outline-none focus:border-primary" value={fb.quote || ''} onChange={e => setFeedbacks(feedbacks.map((f: any, fi: number) => fi === i ? { ...f, quote: e.target.value } : f))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Author Name</label>
                    <input type="text" className="w-full border border-gray-300 p-2 text-sm outline-none focus:border-primary" value={fb.author || ''} onChange={e => setFeedbacks(feedbacks.map((f: any, fi: number) => fi === i ? { ...f, author: e.target.value } : f))} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Company</label>
                    <input type="text" className="w-full border border-gray-300 p-2 text-sm outline-none focus:border-primary" value={fb.company || ''} onChange={e => setFeedbacks(feedbacks.map((f: any, fi: number) => fi === i ? { ...f, company: e.target.value } : f))} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      }

            case 'ProductTabs': {
        const keyFeatures = Array.isArray(data.keyFeatures) ? data.keyFeatures : [];
        const testStandards = Array.isArray(data.testStandards) ? data.testStandards : [];
        const applications = Array.isArray(data.applications) ? data.applications : [];

        const updateList = (field: string, list: string[]) => setField(field, list);

        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Section Title</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 p-2 outline-none focus:border-primary text-sm"
                  value={data.title || ''}
                  onChange={e => setField('title', e.target.value)}
                  placeholder="e.g. Comprehensive Specifications & Details"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Section Subtitle</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 p-2 outline-none focus:border-primary text-sm"
                  value={data.subtitle || ''}
                  onChange={e => setField('subtitle', e.target.value)}
                  placeholder="e.g. Explore key engineering features, compliant test standards..."
                />
              </div>
            </div>

            {/* TAB 1: Key Features */}
            <div className="border border-slate-200 p-4 bg-white space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-primary bg-primary/10 px-2 py-1">Tab 1</span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Key Features Points</h4>
                </div>
                <button
                  type="button"
                  onClick={() => updateList('keyFeatures', [...keyFeatures, ''])}
                  className="text-xs bg-primary text-white px-3 py-1 font-bold hover:bg-primary/90 flex items-center shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Feature Point
                </button>
              </div>

              {keyFeatures.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">No key features added yet. Click &quot;Add Feature Point&quot; above.</p>
              ) : (
                <div className="space-y-2">
                  {keyFeatures.map((feat: string, fi: number) => (
                    <div key={fi} className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-mono w-5 shrink-0">{fi + 1}.</span>
                      <input
                        type="text"
                        className="flex-1 border border-slate-300 p-2 text-sm outline-none focus:border-primary"
                        value={feat}
                        onChange={e => {
                          const updated = [...keyFeatures];
                          updated[fi] = e.target.value;
                          updateList('keyFeatures', updated);
                        }}
                        placeholder="e.g. High-precision servo hydraulic pressure control system"
                      />
                      <button
                        type="button"
                        onClick={() => updateList('keyFeatures', keyFeatures.filter((_: any, idx: number) => idx !== fi))}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Remove point"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* TAB 2: Applicable Test Standards */}
            <div className="border border-slate-200 p-4 bg-white space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-primary bg-primary/10 px-2 py-1">Tab 2</span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Applicable Test Standards</h4>
                </div>
                <button
                  type="button"
                  onClick={() => updateList('testStandards', [...testStandards, ''])}
                  className="text-xs bg-primary text-white px-3 py-1 font-bold hover:bg-primary/90 flex items-center shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Standard
                </button>
              </div>

              {testStandards.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">No test standards added yet. Click &quot;Add Standard&quot; above.</p>
              ) : (
                <div className="space-y-2">
                  {testStandards.map((std: string, si: number) => (
                    <div key={si} className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-mono w-5 shrink-0">{si + 1}.</span>
                      <input
                        type="text"
                        className="flex-1 border border-slate-300 p-2 text-sm outline-none focus:border-primary"
                        value={std}
                        onChange={e => {
                          const updated = [...testStandards];
                          updated[si] = e.target.value;
                          updateList('testStandards', updated);
                        }}
                        placeholder="e.g. ISO 13938-1 (Hydraulic bursting strength of fabrics)"
                      />
                      <button
                        type="button"
                        onClick={() => updateList('testStandards', testStandards.filter((_: any, idx: number) => idx !== si))}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Remove point"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* TAB 3: Applications */}
            <div className="border border-slate-200 p-4 bg-white space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-primary bg-primary/10 px-2 py-1">Tab 3</span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Applications</h4>
                </div>
                <button
                  type="button"
                  onClick={() => updateList('applications', [...applications, ''])}
                  className="text-xs bg-primary text-white px-3 py-1 font-bold hover:bg-primary/90 flex items-center shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Application
                </button>
              </div>

              {applications.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">No applications added yet. Click &quot;Add Application&quot; above.</p>
              ) : (
                <div className="space-y-2">
                  {applications.map((app: string, ai: number) => (
                    <div key={ai} className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-mono w-5 shrink-0">{ai + 1}.</span>
                      <input
                        type="text"
                        className="flex-1 border border-slate-300 p-2 text-sm outline-none focus:border-primary"
                        value={app}
                        onChange={e => {
                          const updated = [...applications];
                          updated[ai] = e.target.value;
                          updateList('applications', updated);
                        }}
                        placeholder="e.g. Corrugated packaging boxes, paper & board"
                      />
                      <button
                        type="button"
                        onClick={() => updateList('applications', applications.filter((_: any, idx: number) => idx !== ai))}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Remove point"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      }

      case 'TabbedContent': {
        const rawTabs = data.tabs;
        let tabs: any[] = [];
        if (Array.isArray(rawTabs)) tabs = rawTabs;
        else if (typeof rawTabs === 'string') {
          try { const p = JSON.parse(rawTabs); if (Array.isArray(p)) tabs = p; } catch (e) {}
        }
        const setTabs = (updated: any[]) => setField('tabs', updated);

        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Section Title</label>
              <input
                type="text"
                className="w-full border border-gray-300 p-2 outline-none focus:border-primary text-sm"
                value={data.title || ''}
                onChange={e => setField('title', e.target.value)}
                placeholder="e.g. Technical Details"
              />
            </div>

            {/* Tabs List */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase">Tabs</label>
                  <p className="text-xs text-gray-400">Add tabs with label and detailed content</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTabs([...tabs, { label: '', content: '' }])}
                  className="text-xs bg-primary text-white px-3 py-1.5 font-bold hover:bg-primary/90 flex items-center shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Tab
                </button>
              </div>

              {tabs.length === 0 && (
                <div className="text-xs text-gray-400 text-center py-6 border border-dashed border-gray-200 bg-gray-50/50">
                  No tabs added yet. Click &quot;Add Tab&quot; to get started.
                </div>
              )}

              <div className="space-y-3">
                {tabs.map((tab: any, ti: number) => (
                  <div key={ti} className="border border-gray-200 p-4 space-y-3 bg-white relative shadow-sm">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 uppercase tracking-wide">
                        Tab #{ti + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => setTabs(tabs.filter((_: any, idx: number) => idx !== ti))}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Delete tab"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Tab Label</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 p-2 outline-none focus:border-primary text-sm font-semibold"
                        value={tab.label || ''}
                        onChange={e => setTabs(tabs.map((t: any, idx: number) => idx === ti ? { ...t, label: e.target.value } : t))}
                        placeholder="e.g. Overview, Operation, Standards"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Tab Content</label>
                      <textarea
                        rows={3}
                        className="w-full border border-gray-300 p-2 outline-none focus:border-primary text-sm"
                        value={tab.content || ''}
                        onChange={e => setTabs(tabs.map((t: any, idx: number) => idx === ti ? { ...t, content: e.target.value } : t))}
                        placeholder="Write tab content here..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case 'Downloads': {
        const rawFiles = data.files;
        let files: any[] = [];
        if (Array.isArray(rawFiles)) files = rawFiles;
        else if (typeof rawFiles === 'string') {
          try { const p = JSON.parse(rawFiles); if (Array.isArray(p)) files = p; } catch (e) {}
        }
        const setFiles = (updated: any[]) => setField('files', updated);

        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Section Title</label>
              <input
                type="text"
                className="w-full border border-gray-300 p-2 outline-none focus:border-primary text-sm"
                value={data.title || ''}
                onChange={e => setField('title', e.target.value)}
                placeholder="e.g. Downloads"
              />
            </div>

            {/* Files List */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase">Downloadable Files</label>
                  <p className="text-xs text-gray-400">Add brochure or manual download links</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFiles([...files, { name: '', url: '' }])}
                  className="text-xs bg-primary text-white px-3 py-1.5 font-bold hover:bg-primary/90 flex items-center shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add File
                </button>
              </div>

              {files.length === 0 && (
                <div className="text-xs text-gray-400 text-center py-6 border border-dashed border-gray-200 bg-gray-50/50">
                  No files added yet. Click &quot;Add File&quot; to get started.
                </div>
              )}

              <div className="space-y-2">
                {files.map((file: any, fi: number) => (
                  <div key={fi} className="flex gap-2 items-center bg-white border border-gray-200 p-3 shadow-sm">
                    <input
                      type="text"
                      className="w-1/3 border border-gray-300 p-2 outline-none focus:border-primary text-sm font-semibold"
                      value={file.name || ''}
                      onChange={e => setFiles(files.map((f: any, idx: number) => idx === fi ? { ...f, name: e.target.value } : f))}
                      placeholder="e.g. Technical Brochure (PDF)"
                    />
                    <input
                      type="text"
                      className="flex-1 border border-gray-300 p-2 outline-none focus:border-primary text-sm"
                      value={file.url || ''}
                      onChange={e => setFiles(files.map((f: any, idx: number) => idx === fi ? { ...f, url: e.target.value } : f))}
                      placeholder="https://... or /files/..."
                    />
                    <button
                      type="button"
                      onClick={() => setFiles(files.filter((_: any, idx: number) => idx !== fi))}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1.5 shrink-0"
                      title="Delete file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case 'ApplicationExamples': {
        const rawExamples = data.examples;
        let examples: any[] = [];
        if (Array.isArray(rawExamples)) examples = rawExamples;
        else if (typeof rawExamples === 'string') {
          try { const p = JSON.parse(rawExamples); if (Array.isArray(p)) examples = p; } catch (e) {}
        }
        const setExamples = (updated: any[]) => setField('examples', updated);

        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Section Title</label>
              <input
                type="text"
                className="w-full border border-gray-300 p-2 outline-none focus:border-primary text-sm"
                value={data.title || ''}
                onChange={e => setField('title', e.target.value)}
                placeholder="e.g. Application Examples"
              />
            </div>

            {/* Examples List */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase">Use Cases / Examples</label>
                  <p className="text-xs text-gray-400">Add industry applications with title and photo</p>
                </div>
                <button
                  type="button"
                  onClick={() => setExamples([...examples, { title: '', image: '' }])}
                  className="text-xs bg-primary text-white px-3 py-1.5 font-bold hover:bg-primary/90 flex items-center shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Example
                </button>
              </div>

              {examples.length === 0 && (
                <div className="text-xs text-gray-400 text-center py-6 border border-dashed border-gray-200 bg-gray-50/50">
                  No examples added yet. Click &quot;Add Example&quot; to get started.
                </div>
              )}

              <div className="space-y-3">
                {examples.map((ex: any, ei: number) => (
                  <div key={ei} className="border border-gray-200 p-4 space-y-3 bg-white relative shadow-sm">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 uppercase tracking-wide">
                        Example #{ei + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => setExamples(examples.filter((_: any, idx: number) => idx !== ei))}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Delete example"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Title</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 p-2 outline-none focus:border-primary text-sm"
                        value={ex.title || ''}
                        onChange={e => setExamples(examples.map((item: any, idx: number) => idx === ei ? { ...item, title: e.target.value } : item))}
                        placeholder="e.g. Industrial & Medical Textiles"
                      />
                    </div>

                    <ImageUploadField
                      label="Photo"
                      value={ex.image || ''}
                      onChange={url => setExamples(examples.map((item: any, idx: number) => idx === ei ? { ...item, image: url } : item))}
                      recommendedNote="Recommended: 400x400px"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case 'RelatedProducts': {
        const rawProducts = data.products;
        let products: any[] = [];
        if (Array.isArray(rawProducts)) products = rawProducts;
        else if (typeof rawProducts === 'string') {
          try { const p = JSON.parse(rawProducts); if (Array.isArray(p)) products = p; } catch (e) {}
        }
        const setProducts = (updated: any[]) => setField('products', updated);

        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Section Title</label>
              <input
                type="text"
                className="w-full border border-gray-300 p-2 outline-none focus:border-primary text-sm"
                value={data.title || ''}
                onChange={e => setField('title', e.target.value)}
                placeholder="e.g. Related Equipment"
              />
            </div>

            {/* Products List */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase">Products</label>
                  <p className="text-xs text-gray-400">Add related equipment with image and link</p>
                </div>
                <button
                  type="button"
                  onClick={() => setProducts([...products, { title: '', image: '', link: '', description: '' }])}
                  className="text-xs bg-primary text-white px-3 py-1.5 font-bold hover:bg-primary/90 flex items-center shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Product
                </button>
              </div>

              {products.length === 0 && (
                <div className="text-xs text-gray-400 text-center py-6 border border-dashed border-gray-200 bg-gray-50/50">
                  No products added yet. Click &quot;Add Product&quot; to get started.
                </div>
              )}

              <div className="space-y-3">
                {products.map((prod: any, pi: number) => (
                  <div key={pi} className="border border-gray-200 p-4 space-y-3 bg-white relative shadow-sm">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 uppercase tracking-wide">
                        Product #{pi + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => setProducts(products.filter((_: any, idx: number) => idx !== pi))}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Product Title</label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 p-2 outline-none focus:border-primary text-sm"
                          value={prod.title || ''}
                          onChange={e => setProducts(products.map((p: any, idx: number) => idx === pi ? { ...p, title: e.target.value } : p))}
                          placeholder="e.g. Tensile Strength Tester"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Link URL</label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 p-2 outline-none focus:border-primary text-sm"
                          value={prod.link || ''}
                          onChange={e => setProducts(products.map((p: any, idx: number) => idx === pi ? { ...p, link: e.target.value } : p))}
                          placeholder="e.g. /campaign/tensile-tester or /products/..."
                        />
                      </div>
                    </div>

                    <ImageUploadField
                      label="Product Image"
                      value={prod.image || ''}
                      onChange={url => setProducts(products.map((p: any, idx: number) => idx === pi ? { ...p, image: url } : p))}
                      recommendedNote="Recommended: 600x600px"
                    />

                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Description (Optional)</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 p-2 outline-none focus:border-primary text-sm"
                        value={prod.description || ''}
                        onChange={e => setProducts(products.map((p: any, idx: number) => idx === pi ? { ...p, description: e.target.value } : p))}
                        placeholder="Brief summary..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case 'Contact':
        return (
          <div className="bg-amber-50 border border-amber-200 p-4 text-amber-900 flex items-center justify-between">
            <div>
              <p className="font-bold text-xs uppercase tracking-wider text-amber-800">Contact / Enquiry Section is Static</p>
              <p className="text-xs text-amber-700 mt-1">
                The global contact CTA and enquiry form is permanently integrated at the bottom of every campaign page. You can safely remove this section.
              </p>
            </div>
            <button
              type="button"
              onClick={() => removeSection(index)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase transition-colors shrink-0 ml-4"
            >
              Remove Section
            </button>
          </div>
        );

      default:
        // Generic JSON editor for everything else (FAQs, App Examples, etc)
        return (
          <div>
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-bold">Generic Data Editor ({section.type})</p>
            <textarea
              rows={6}
              className="w-full border border-gray-300 p-3 outline-none focus:border-primary font-mono text-sm bg-white"
              value={JSON.stringify(data, null, 2)}
              onChange={(e) => {
                try {
                  setField('', JSON.parse(e.target.value));
                } catch (err) {}
              }}
            />
          </div>
        );
    }
  };

  const renderPreviewSection = (section: any, index: number) => {
    switch (section.type) {
      case 'Hero': return <HeroSection key={section.id} data={section.data || {}} campaignTitle={formData.title || "Campaign Preview"} />;
      case 'Video': return <VideoSection key={section.id} data={section.data || {}} />;
      case 'TextWithImage':
      case 'FeaturesWithImage': return <FeaturesSection key={section.id} data={section.data || {}} index={index} />;
      case 'Specifications': return <SpecificationsSection key={section.id} data={section.data || {}} />;
      case 'ComparisonTable': return <ComparisonSection key={section.id} data={section.data || {}} />;
      case 'CustomerFeedback': return <FeedbackSection key={section.id} data={section.data || {}} />;
      case 'ApplicationExamples': return <ApplicationsSection key={section.id} data={section.data || {}} />;
      case 'FAQs': return <FAQSection key={section.id} data={section.data || {}} />;
      case 'TabbedContent': return <TabbedContentSection key={section.id} data={section.data || {}} />;
      case 'ProductTabs': return <ProductTabsSection key={section.id} data={section.data || {}} />;
      case 'Downloads': return <DownloadsSection key={section.id} data={section.data || {}} />;
      case 'Contact': return <ContactSection key={section.id} data={section.data || {}} />;
      case 'RelatedProducts': return <RelatedProductsSection key={section.id} data={section.data || {}} />;
      default: return null;
    }
  };

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex flex-col md:flex-row h-full min-h-screen bg-gray-50 pb-24 font-sans">
      
      {/* LEFT: FORM (Takes 1/2 if preview is open, else 100%) */}
      <div className={`transition-all duration-300 flex-1 ${showPreview ? 'md:w-1/2 border-r border-gray-300 max-h-screen overflow-y-auto overflow-x-hidden' : 'w-full'}`}>
        <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin/campaigns" className="p-2 border border-gray-200 hover:bg-gray-100 transition-colors bg-white rounded-none">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-black text-secondary tracking-tight uppercase">
                  {isEditing ? 'Edit Campaign' : 'Create Campaign'}
                </h1>
              </div>
            </div>
            <button 
              type="button" 
              onClick={() => setShowPreview(!showPreview)}
              className="hidden md:flex px-4 py-2 border-2 border-primary text-primary font-bold uppercase tracking-wide text-sm items-center hover:bg-primary hover:text-white transition-colors"
            >
              {showPreview ? <><EyeOff className="w-4 h-4 mr-2"/> Hide Preview</> : <><Eye className="w-4 h-4 mr-2"/> Show Preview</>}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 bg-white border border-gray-200 p-8 shadow-sm rounded-none">
        
        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-secondary border-b pb-2">Basic Details</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Campaign Title (Internal)</label>
              <input 
                type="text" 
                required
                className="w-full border border-gray-300 p-2 outline-none focus:border-primary"
                value={formData.title} 
                onChange={e => handleChange('title', e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">URL Slug</label>
              <input 
                type="text" 
                required
                placeholder="e.g. bursting-strength-tester"
                className="w-full border border-gray-300 p-2 outline-none focus:border-primary font-mono text-sm"
                value={formData.slug} 
                onChange={e => handleChange('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))} 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
            <select 
              className="w-full md:w-1/3 border border-gray-300 p-2 outline-none focus:border-primary"
              value={formData.status} 
              onChange={e => handleChange('status', e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        {/* Dynamic Sections Builder */}
        <div className="space-y-6 pt-8 border-t border-gray-100">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-lg font-bold text-secondary">Page Builder Sections</h2>
            
            <div className="relative group">
              <button type="button" className="bg-secondary text-white px-4 py-2 text-sm font-bold flex items-center hover:bg-secondary/90 transition-colors">
                <Plus className="w-4 h-4 mr-2" /> Add Section
              </button>
              <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 shadow-xl hidden group-hover:block z-10 max-h-96 overflow-y-auto">
                {SECTION_TYPES.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => addSection(type)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors border-b border-gray-100 last:border-0"
                  >
                    + {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {formData.sections.length === 0 && (
              <div className="text-center p-12 border-2 border-dashed border-gray-200 text-gray-400">
                No sections added yet. Click "Add Section" to start building your campaign page.
              </div>
            )}

            {formData.sections.map((section: any, index: number) => (
              <div key={section.id} className="border border-gray-200 shadow-sm bg-gray-50/30">
                {/* Section Header */}
                <div className="bg-gray-100 p-3 flex justify-between items-center border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                    <span className="font-black text-secondary uppercase tracking-widest text-xs">
                      {index + 1}. {section.type}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button type="button" onClick={() => moveSection(index, 'up')} disabled={index === 0} className="p-1 text-gray-500 hover:text-primary disabled:opacity-30">
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => moveSection(index, 'down')} disabled={index === formData.sections.length - 1} className="p-1 text-gray-500 hover:text-primary disabled:opacity-30">
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => removeSection(index)} className="p-1 text-gray-500 hover:text-red-500 ml-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Section Editor */}
                <div className="p-6">
                  {renderSectionEditor(section, index)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SEO */}
        <div className="space-y-4 pt-8 border-t border-gray-100">
          <h2 className="text-lg font-bold text-secondary border-b pb-2">SEO Meta Data</h2>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Meta Title</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 p-2 outline-none focus:border-primary"
              value={formData.seo?.metaTitle || ''} 
              onChange={e => handleChange('metaTitle', e.target.value, 'seo')} 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Meta Description</label>
            <textarea 
              rows={3}
              className="w-full border border-gray-300 p-2 outline-none focus:border-primary"
              value={formData.seo?.metaDescription || ''} 
              onChange={e => handleChange('metaDescription', e.target.value, 'seo')} 
            />
          </div>
        </div>

        <div className="pt-6 border-t mt-8 bg-white md:bg-transparent">
          <button 
            type="submit" 
            disabled={isSaving}
            className="w-full md:w-auto bg-primary text-white px-8 py-3 font-bold flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 uppercase tracking-wider"
          >
            <Save className="w-5 h-5 mr-2" />
            {isSaving ? 'Saving...' : 'Save Campaign Page'}
          </button>
        </div>
      </form>
        </div>
      </div>

      {/* RIGHT: PREVIEW (Only visible if showPreview is true) */}
      {showPreview && (
        <div className="hidden md:block w-1/2 max-h-screen overflow-y-auto bg-white border-l-4 border-gray-200">
          <div className="sticky top-0 bg-primary text-white p-2 text-center text-xs font-bold uppercase tracking-wider z-50 flex items-center justify-center space-x-2">
            <Eye className="w-4 h-4" />
            <span>Live Preview</span>
          </div>
          <div className="relative pointer-events-none pb-24">
            {/* Render all sections using the frontend components */}
            {formData.sections.map((section: any, index: number) => renderPreviewSection(section, index))}
            
            {formData.sections.length === 0 && (
              <div className="h-full flex items-center justify-center p-12 text-gray-400 font-bold uppercase text-xl">
                Add sections to see preview
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
