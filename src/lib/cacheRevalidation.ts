import { revalidatePath, revalidateTag } from 'next/cache';
import { delCacheByPrefix } from './cache';

/**
 * Centralized cache invalidation logic
 * Call this whenever admin updates products, blogs, categories, or SEO
 */
export async function invalidateAdminCaches() {
  await delCacheByPrefix('api:products');
  await delCacheByPrefix('api:blogs');
  // Admin pages
  revalidatePath('/admin/products');
  revalidatePath('/admin/blogs');
  revalidatePath('/admin/seo');
  revalidatePath('/admin/settings');
  
  // Public pages
  revalidatePath('/products');
  revalidatePath('/blogs');
  revalidatePath('/');
  
  // Cache tags
  revalidateTag('products', 'max');
  revalidateTag('blogs', 'max');
  revalidateTag('categories', 'max');
  revalidateTag('seo', 'max');
}

export async function invalidateProductCaches(slug?: string) {
  await delCacheByPrefix('api:products');
  revalidatePath('/admin/products');
  revalidatePath('/products');
  if (slug) revalidatePath(`/products/${slug}`);
  revalidateTag('products', 'max');
  revalidateTag('categories', 'max');
}

export async function invalidateBlogCaches(slug?: string) {
  revalidatePath('/admin/blogs');
  revalidatePath('/blogs');
  if (slug) revalidatePath(`/blogs/${slug}`);
  revalidateTag('blogs', 'max');
}

export async function invalidateCategoryCaches() {
  revalidatePath('/admin/products/categories');
  revalidatePath('/products');
  revalidateTag('categories', 'max');
}

export async function invalidateSEOCaches(pageKey?: string) {
  revalidatePath('/admin/seo');
  if (pageKey) {
    revalidatePath(`/${pageKey === 'home' ? '' : pageKey}`);
    revalidateTag(pageKey, 'max');
  }
  revalidateTag('seo', 'max');
}
