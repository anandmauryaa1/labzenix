'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
const RichTextEditor = dynamic(() => import('@/components/blog/RichTextEditor'), { ssr: false });

export default function BlogForm({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '', slug: '', content: '', image: '', category: '', tags: '', metaTitle: '', metaDescription: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.id !== 'new') {
      fetch(`/api/blogs/${params.id}`).then(res => res.json()).then(data => setForm({ ...data, tags: data.tags?.join(', ') }));
    }
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()) };
    const method = params.id === 'new' ? 'POST' : 'PUT';
    const url = params.id === 'new' ? '/api/blogs' : `/api/blogs/${params.id}`;
    const res = await fetch(url, { method, body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
    if (res.ok) { toast.success('Saved'); router.push('/admin/blogs'); } else toast.error('Error');
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{params.id === 'new' ? 'New Blog' : 'Edit Blog'}</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input label="Title" value={form.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s/g, '-') })} required />
        <Input label="Slug" value={form.slug} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, slug: e.target.value })} required />
        <Input label="Category" value={form.category} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, category: e.target.value })} required />
        <Input label="Tags (comma separated)" value={form.tags} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, tags: e.target.value })} />
        <Input label="Featured Image URL" value={form.image} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, image: e.target.value })} />
        <Input label="Meta Title" value={form.metaTitle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, metaTitle: e.target.value })} />
        <Input label="Meta Description" value={form.metaDescription} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, metaDescription: e.target.value })} />
        <RichTextEditor value={form.content} onChange={(val: string) => setForm({ ...form, content: val })} />
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Blog'}</Button>
      </form>
    </div>
  );
}