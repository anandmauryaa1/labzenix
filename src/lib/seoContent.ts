/**
 * Utility to sanitize HTML content for SEO:
 * 1. Strips `rel="nofollow"` from internal links (pointing to labzenix.com or relative paths).
 * 2. Unlinks self-referencing anchor tags (converts <a href="/same-url">Anchor</a> into <span>Anchor</span>).
 * 3. Strips raw HTML tags to produce clean plain text for Schema.org descriptions and meta tags.
 */

const SITE_DOMAINS = [
  'labzenix.com',
  'www.labzenix.com',
  'labzenix.in',
  'www.labzenix.in',
  'localhost:3000',
];

/**
 * Checks if a given URL is internal
 */
export function isInternalUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true;
  if (trimmed.startsWith('#')) return true;

  try {
    const parsed = new URL(trimmed);
    return SITE_DOMAINS.includes(parsed.host.toLowerCase());
  } catch {
    return false;
  }
}

/**
 * Strips HTML tags and normalizes whitespace
 */
export function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalizes URL path for self-reference comparison
 */
function normalizePath(url: string): string {
  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const parsed = new URL(url);
      return parsed.pathname.replace(/\/+$/, '').toLowerCase();
    }
    return url.split('?')[0].split('#')[0].replace(/\/+$/, '').toLowerCase();
  } catch {
    return url.replace(/\/+$/, '').toLowerCase();
  }
}

/**
 * Cleans HTML content for SEO before rendering:
 * - Removes `nofollow` from internal links
 * - Removes self-referencing links on the current page
 */
export function cleanSeoHtml(html: string, currentPath?: string): string {
  if (!html) return '';

  const normalizedCurrentPath = currentPath ? normalizePath(currentPath) : null;

  // Regex to match anchor tags
  const anchorRegex = /<a\b([^>]*?)>([\s\S]*?)<\/a>/gi;

  return html.replace(anchorRegex, (match, attributesStr, innerText) => {
    // Extract href
    const hrefMatch = attributesStr.match(/href=(["'])(.*?)\1/i);
    if (!hrefMatch) return match;

    const href = hrefMatch[2].trim();
    const isInternal = isInternalUrl(href);

    // If it's a self-referencing link (points to the exact current page)
    if (normalizedCurrentPath && isInternal) {
      const linkPath = normalizePath(href);
      if (linkPath === normalizedCurrentPath && linkPath !== '' && linkPath !== '/') {
        // Return text without the self-referencing hyperlink to prevent over-optimization
        return `<span class="self-reference-link">${innerText}</span>`;
      }
    }

    // If it is an internal link, remove 'nofollow' from rel attribute
    if (isInternal) {
      let updatedAttributes = attributesStr;

      // Match rel attribute
      const relMatch = updatedAttributes.match(/rel=(["'])(.*?)\1/i);
      if (relMatch) {
        const currentRel = relMatch[2];
        const cleanedRel = currentRel
          .split(/\s+/)
          .filter((token: string) => token.toLowerCase() !== 'nofollow')
          .join(' ')
          .trim();

        if (cleanedRel.length > 0) {
          updatedAttributes = updatedAttributes.replace(relMatch[0], `rel="${cleanedRel}"`);
        } else {
          // Remove rel attribute completely if only nofollow was in it
          updatedAttributes = updatedAttributes.replace(relMatch[0], '');
        }
      }

      return `<a${updatedAttributes}>${innerText}</a>`;
    }

    return match;
  });
}
