import { getCachedValue, setCachedValue } from '../../core/storage';
import type { TradeMatchCounts } from './parser';

const COUNTS_CACHE_PREFIX = 'tcdbTradeMatchCounts:';

export function getCachedCounts(memberName: string): TradeMatchCounts | null {
  return getCachedValue<TradeMatchCounts>(`${COUNTS_CACHE_PREFIX}${memberName}`);
}

export function setCachedCounts(memberName: string, counts: TradeMatchCounts): void {
  setCachedValue(`${COUNTS_CACHE_PREFIX}${memberName}`, counts);
}
