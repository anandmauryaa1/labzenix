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
  revalidateTag('products', "default");
  revalidateTag('blogs', "default");
  revalidateTag('categories', "default");
  revalidateTag('seo', "default");
}

export async function invalidateProductCaches(slug?: string) {
  revalidatePath('/admin/products');
  revalidatePath('/products');
  if (slug) revalidatePath(`/products/${slug}`);
  revalidateTag('products', "default");
  revalidateTag('categories', "default");
}

export async function invalidateBlogCaches(slug?: string) {
  revalidatePath('/admin/blogs');
  revalidatePath('/blogs');
  if (slug) revalidatePath(`/blogs/${slug}`);
  revalidateTag('blogs', "default");
}

export async function invalidateCategoryCaches() {
  revalidatePath('/admin/products/categories');
  revalidatePath('/products');
  revalidateTag('categories', "default");
}

export async function invalidateSEOCaches(pageKey?: string) {
  revalidatePath('/admin/seo');
  if (pageKey) {
    revalidatePath(`/${pageKey}`);
    revalidateTag(pageKey, "default");
  }
  revalidateTag('seo', "default");
}
