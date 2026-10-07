import { COLORS } from '../../core/colors';
import type { TradeMatchCounts } from './parser';

export const ADDED_CLASS = 'tcdb-trade-matching-link-added';
export const CELL_CLASS = 'tcdb-trade-matching-cell-added';
export const WANT_LINK_CLASS = 'tcdb-trade-matching-want-link';

// The ADDED_CLASS link sits in the "they have my wants" cell and holds the row's state;
// the WANT_LINK_CLASS link sits in the "they want my haves" cell of the same row.
function wantLinkFor(link: HTMLAnchorElement): HTMLAnchorElement | null {
  return link.closest('tr')?.querySelector<HTMLAnchorElement>(`.${WANT_LINK_CLASS}`) ?? null;
}

function setCell(link: HTMLAnchorElement | null, text: string, title: string, color: string, bold = false): void {
  if (!link) return;
  link.textContent = text;
  link.title = title;
  link.style.color = color;
  link.style.fontWeight = bold ? 'bold' : 'normal';
}

export function renderCounts(link: HTMLAnchorElement, counts: TradeMatchCounts): void {
  link.dataset.saleTradeCount = String(counts.saleTrade);
  link.dataset.wantlistCount = String(counts.wantlist);

  setCell(
    link,
    String(counts.saleTrade),
    `${counts.saleTrade} item(s) on your wantlist that they have for sale/trade`,
    counts.saleTrade > 0 ? COLORS.success : COLORS.muted,
    counts.saleTrade > 0,
  );
  setCell(
    wantLinkFor(link),
    String(counts.wantlist),
    `${counts.wantlist} item(s) on their wantlist that you have for sale/trade`,
    counts.wantlist > 0 ? COLORS.success : COLORS.muted,
    counts.wantlist > 0,
  );
}

export function renderChecking(link: HTMLAnchorElement): void {
  for (const target of [link, wantLinkFor(link)]) {
    setCell(target, '…', 'Checking trade matching counts...', COLORS.warning);
  }
}

export function renderError(link: HTMLAnchorElement): void {
  for (const target of [link, wantLinkFor(link)]) {
    setCell(target, '!', 'Could not check trade matching counts', COLORS.danger);
  }
}
