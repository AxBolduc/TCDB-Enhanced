import { getCachedValue, setCachedValue } from '../../core/storage';
import type { TradeMatchCounts } from './parser';

const COUNTS_CACHE_PREFIX = 'tcdbTradeMatchCounts:';
const PRICE_CACHE_PREFIX = 'tcdbMedianPrice:';

export function getCachedCounts(memberName: string): TradeMatchCounts | null {
  return getCachedValue<TradeMatchCounts>(`${COUNTS_CACHE_PREFIX}${memberName}`);
}

export function setCachedCounts(memberName: string, counts: TradeMatchCounts): void {
  setCachedValue(`${COUNTS_CACHE_PREFIX}${memberName}`, counts);
}

export function getCachedPrice(url: string): string | null {
  return getCachedValue<string | null>(`${PRICE_CACHE_PREFIX}${url}`);
}

export function setCachedPrice(url: string, price: string | null): void {
  setCachedValue(`${PRICE_CACHE_PREFIX}${url}`, price);
}
