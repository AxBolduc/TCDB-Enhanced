export const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

export function getCachedValue<T>(key: string, ttlMs = CACHE_TTL_MS): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const cached = JSON.parse(raw) as { time?: number; value?: T };
    if (!cached || !cached.time || Date.now() - cached.time > ttlMs) return null;
    return cached.value ?? null;
  } catch {
    return null;
  }
}

export function setCachedValue<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify({ time: Date.now(), value }));
  } catch {
    // Ignore storage quota/private mode failures.
  }
}
