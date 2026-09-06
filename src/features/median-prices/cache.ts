import { getCachedValue, setCachedValue } from '../../core/storage';

const PRICE_CACHE_PREFIX = 'tcdbMedianPrice:';

export function getCachedPrice(url: string): string | null {
  return getCachedValue<string | null>(`${PRICE_CACHE_PREFIX}${url}`);
}

export function setCachedPrice(url: string, price: string | null): void {
  setCachedValue(`${PRICE_CACHE_PREFIX}${url}`, price);
}
