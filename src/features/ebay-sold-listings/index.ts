import { isViewCardPage } from '../../core/page';
import {
  isEbaySoldListingsEnabled,
  onEbaySoldListingsSettingChange,
} from '../../core/settings';

const SOLD_LINK_SELECTOR = '[data-tcdb-ebay-sold-listings]';

export function initEbaySoldListings(): void {
  if (!isViewCardPage()) return;

  if (isEbaySoldListingsEnabled()) enhanceEbaySoldListings();

  onEbaySoldListingsSettingChange((enabled) => {
    if (enabled) {
      enhanceEbaySoldListings();
    } else {
      removeEbaySoldListings();
    }
  });
}

export function enhanceEbaySoldListings(): void {
  if (document.querySelector(SOLD_LINK_SELECTOR)) return;

  const searchLink = findCardEbaySearchLink();
  if (!searchLink) return;

  const soldLink = document.createElement('a');
  soldLink.dataset.tcdbEbaySoldListings = 'true';
  soldLink.className = 'btn btn-success btn-sm mt-2 text-white';
  soldLink.style.color = '#fff';
  soldLink.href = buildSoldListingsUrl(searchLink.href);
  soldLink.target = searchLink.target || '_blank';
  soldLink.rel = 'noopener noreferrer';
  soldLink.textContent = 'Search sold eBay listings';

  const insertionPoint = searchLink.closest('h3') ?? searchLink;
  insertionPoint.insertAdjacentElement('afterend', soldLink);
}

export function removeEbaySoldListings(): void {
  document.querySelectorAll(SOLD_LINK_SELECTOR).forEach(element => element.remove());
}

function findCardEbaySearchLink(): HTMLAnchorElement | null {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href*="ebay.com/sch/i.html"]'));
  return links.find(link => link.textContent?.trim().toLowerCase().startsWith('search ebay'))
    ?? links.find(link => new URL(link.href).searchParams.has('_nkw'))
    ?? null;
}

function buildSoldListingsUrl(href: string): string {
  const url = new URL(href, location.href);
  url.searchParams.set('LH_Sold', '1');
  url.searchParams.set('LH_Complete', '1');
  return url.toString();
}
