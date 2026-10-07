import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it } from 'vitest';
import { setCachedCounts } from '../src/features/trade-matching-links/cache';
import { enhanceCollectionCheckPage, removeTradeMatchingLinks } from '../src/features/trade-matching-links/collection-check';

const fixture = readFileSync('test/fixtures/collection_page.html', 'utf-8');

describe('trade matching columns', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.innerHTML = fixture;
  });

  function firstTable(): HTMLTableElement {
    return document.querySelector<HTMLTableElement>('#collapse1 table')!;
  }

  it('adds two header columns and two count cells per member row', () => {
    enhanceCollectionCheckPage();
    enhanceCollectionCheckPage();

    const table = firstTable();
    const headers = Array.from(table.rows[0].cells).map(cell => cell.textContent?.trim());
    expect(headers).toEqual(['', 'Quantity', 'Member', 'My Wants They Have', 'Their Wants I Have']);

    const memberRow = table.rows[1];
    expect(memberRow.cells).toHaveLength(5);
    expect(table.rows[2].cells[0].colSpan).toBe(5);
  });

  it('renders cached counts into the matching columns', () => {
    setCachedCounts('11lizzie', { saleTrade: 4, wantlist: 2 });
    const section = document.querySelector('#collapse1')!;
    section.classList.add('show');

    enhanceCollectionCheckPage();

    const row = Array.from(firstTable().rows).find(r => r.textContent?.includes('11lizzie'))!;
    expect(row.cells[3].textContent).toBe('4');
    expect(row.cells[4].textContent).toBe('2');
  });

  it('restores the original table when removed', () => {
    enhanceCollectionCheckPage();
    removeTradeMatchingLinks();

    const table = firstTable();
    expect(table.rows[0].cells).toHaveLength(3);
    expect(table.rows[1].cells).toHaveLength(3);
    expect(table.rows[2].cells[0].colSpan).toBe(3);
  });
});
