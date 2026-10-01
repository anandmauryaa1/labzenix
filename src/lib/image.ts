/**
 * Image optimization utility for Cloudinary and web image URLs.
 * Automatically injects `f_auto,q_auto` transformation flags for Cloudinary assets.
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | 'auto:good' | 'auto:best' | 'auto:eco';
  crop?: 'fill' | 'scale' | 'fit' | 'thumb';
}

export function getOptimizedImageUrl(
  url?: string,
  options: ImageOptimizationOptions = {}
): string {
  if (!url || typeof url !== 'string') {
    return '/api/placeholder/600/450';
  }

  const { width, height, quality = 'auto', crop } = options;

  // Cloudinary image optimization injection
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    const transformParts: string[] = ['f_auto', `q_${quality}`];

    if (width) transformParts.push(`w_${width}`);
    if (height) transformParts.push(`h_${height}`);
    if (crop) transformParts.push(`c_${crop}`);

    const transformString = transformParts.join(',');

    // Avoid double transformation injection
    if (url.includes('/f_auto,q_auto') || url.includes('/q_auto')) {
      return url;
    }

    return url.replace('/upload/', `/upload/${transformString}/`);
  }

  // Unsplash image optimization parameters injection
  if (url.includes('images.unsplash.com')) {
    try {
      const parsedUrl = new URL(url);
      parsedUrl.searchParams.set('auto', 'format');
      parsedUrl.searchParams.set('q', '80');
      if (width) parsedUrl.searchParams.set('w', width.toString());
      if (height) parsedUrl.searchParams.set('h', height.toString());
      if (crop === 'fill') parsedUrl.searchParams.set('fit', 'crop');
      return parsedUrl.toString();
    } catch (_) {
      return url;
    }
  }

  return url;
}
