import type { TradeMatchCounts } from './parser';

export const ADDED_CLASS = 'tcdb-trade-matching-link-added';

export function renderCounts(link: HTMLAnchorElement, counts: TradeMatchCounts): void {
  const total = counts.saleTrade + counts.wantlist;
  link.dataset.saleTradeCount = String(counts.saleTrade);
  link.dataset.wantlistCount = String(counts.wantlist);

  if (total > 0) {
    link.textContent = `TM ${counts.saleTrade}/${counts.wantlist}`;
    link.title = `Trade matching: For Sale/Trade ${counts.saleTrade}, Wantlist ${counts.wantlist}`;
    link.style.color = '#198754';
    link.style.fontWeight = 'bold';
  } else {
    link.textContent = 'TM 0/0';
    link.title = 'Trade matching: no matches found';
    link.style.color = '#6c757d';
    link.style.fontWeight = 'normal';
  }
}

export function renderChecking(link: HTMLAnchorElement): void {
  link.textContent = 'TM …';
  link.title = 'Checking trade matching counts...';
  link.style.color = '#fd7e14';
}

export function renderError(link: HTMLAnchorElement): void {
  link.textContent = 'TM !';
  link.title = 'Could not check trade matching counts';
  link.style.color = '#dc3545';
}

export function renderMedianPrice(span: HTMLSpanElement, price: string | null): void {
  span.textContent = ` Med: ${price || 'n/a'}`;
  span.title = price ? `Median price: ${price}` : 'Median price not found';
  span.style.color = price ? '#198754' : '#6c757d';
  span.style.fontWeight = price ? 'bold' : 'normal';
}
