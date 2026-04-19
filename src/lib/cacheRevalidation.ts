import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Centralized cache invalidation logic
 * Call this whenever admin updates products, blogs, categories, or SEO
 */
export async function invalidateAdminCaches() {
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
  revalidateTag('products');
  revalidateTag('blogs');
  revalidateTag('categories');
  revalidateTag('seo');
}

export async function invalidateProductCaches(slug?: string) {
  revalidatePath('/admin/products');
  revalidatePath('/products');
  if (slug) revalidatePath(`/products/${slug}`);
  revalidateTag('products');
  revalidateTag('categories');
}

export async function invalidateBlogCaches(slug?: string) {
  revalidatePath('/admin/blogs');
  revalidatePath('/blogs');
  if (slug) revalidatePath(`/blogs/${slug}`);
  revalidateTag('blogs');
}

export async function invalidateCategoryCaches() {
  revalidatePath('/admin/products/categories');
  revalidatePath('/products');
  revalidateTag('categories');
}

export async function invalidateSEOCaches(pageKey?: string) {
  revalidatePath('/admin/seo');
  if (pageKey) {
    revalidatePath(`/${pageKey}`);
    revalidateTag(pageKey);
  }
  revalidateTag('seo');
}
