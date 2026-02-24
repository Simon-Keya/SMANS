// lib/cache.ts
// Simple in-memory cache (for dev / small apps)
// In production replace with Redis / Upstash

const cache = new Map<string, { value: any; expiry: number }>();

interface CacheOptions {
  ttlSeconds?: number; // default 5 minutes
}

export function getCache<T>(key: string): T | null {
  const item = cache.get(key);
  if (!item) return null;

  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }

  return item.value;
}

export function setCache<T>(key: string, value: T, options: CacheOptions = {}) {
  const ttl = options.ttlSeconds ?? 300; // 5 minutes default
  cache.set(key, {
    value,
    expiry: Date.now() + ttl * 1000,
  });
}

export function invalidateCache(key: string | string[]) {
  if (Array.isArray(key)) {
    key.forEach(k => cache.delete(k));
  } else {
    cache.delete(key);
  }
}

export function clearCache() {
  cache.clear();
}

// Example usage:
// setCache("dashboard-stats", stats, { ttlSeconds: 60 });
// const stats = getCache("dashboard-stats");