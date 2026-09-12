import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it } from 'vitest';
import { enhanceEbaySoldListings, removeEbaySoldListings } from '../src/features/ebay-sold-listings';

const fixture = readFileSync('test/fixtures/view_card.html', 'utf-8');

describe('eBay sold listings', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = fixture;
    localStorage.clear();
  });

  it('adds a sold-listings search link using the existing card eBay query', () => {
    enhanceEbaySoldListings();

    const soldLink = document.querySelector<HTMLAnchorElement>('[data-tcdb-ebay-sold-listings]');
    const url = new URL(soldLink?.href ?? '');

    expect(soldLink?.textContent).toBe('Search sold eBay listings');
    expect(url.searchParams.get('_nkw')).toBe('2026 Topps Chrome - Big Ticket Players BTP-4 Gunnar Henderson');
    expect(url.searchParams.get('LH_Sold')).toBe('1');
    expect(url.searchParams.get('LH_Complete')).toBe('1');
  });

  it('does not add duplicate links and can remove the enhancement', () => {
    enhanceEbaySoldListings();
    enhanceEbaySoldListings();

    expect(document.querySelectorAll('[data-tcdb-ebay-sold-listings]')).toHaveLength(1);

    removeEbaySoldListings();

    expect(document.querySelector('[data-tcdb-ebay-sold-listings]')).toBeNull();
  });
});
