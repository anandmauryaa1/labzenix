/**
 * High-performance Cache Module for LabZenix (Redis + In-Memory Fallback).
 * Provides sub-millisecond caching for campaigns, product catalogs, and settings.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

// In-Memory Fallback Store (Map with TTL)
const memoryCache = new Map<string, CacheEntry<any>>();

// Cache cleanup interval every 60 seconds
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memoryCache.entries()) {
      if (entry.expiresAt <= now) {
        memoryCache.delete(key);
      }
    }
  }, 60000);
}

/**
 * Get item from Cache
 */
export async function getCache<T>(key: string): Promise<T | null> {
  // 1. Check Redis if environment URL is configured
  if (process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL) {
    try {
      if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        const res = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/${encodeURIComponent(key)}`, {
          headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
          next: { revalidate: 0 }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.result) return JSON.parse(json.result) as T;
        }
      }
    } catch (_) {
      // Silently fall back to in-memory store
    }
  }

  // 2. In-Memory Cache Lookup
  const entry = memoryCache.get(key);
  if (entry) {
    if (entry.expiresAt > Date.now()) {
      return entry.data as T;
    }
    memoryCache.delete(key);
  }

  return null;
}

/**
 * Set item in Cache with TTL
 */
export async function setCache<T>(key: string, data: T, ttlSeconds = 300): Promise<void> {
  const expiresAt = Date.now() + ttlSeconds * 1000;

  // 1. Set in Memory
  memoryCache.set(key, { data, expiresAt });

  // 2. Set in Redis if configured
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const valueStr = JSON.stringify(data);
      await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/set/${encodeURIComponent(key)}/${encodeURIComponent(valueStr)}/EX/${ttlSeconds}`, {
        headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
      });
    } catch (_) {
      // Silently ignore Redis network errors
    }
  }
}

/**
 * Invalidate cache key
 */
export async function delCache(key: string): Promise<void> {
  memoryCache.delete(key);
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/del/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
      });
    } catch (_) {}
  }
}

/**
 * Invalidate all cache keys matching a prefix
 */
export async function delCacheByPrefix(prefix: string): Promise<void> {
  for (const key of Array.from(memoryCache.keys())) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }
}

/**
 * Higher-order function to wrap DB queries with Redis/In-Memory Cache
 */
export async function cachedFetch<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 300
): Promise<T> {
  const cached = await getCache<T>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  const freshData = await fetcher();
  if (freshData !== null && freshData !== undefined) {
    await setCache<T>(cacheKey, freshData, ttlSeconds);
  }
  return freshData;
}
