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
    expect(headers).toEqual(['', 'Quantity', 'Member', 'My Wants They Have ▼', 'Their Wants I Have']);

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

  function memberOrder(table: HTMLTableElement): string[] {
    return Array.from(table.querySelectorAll<HTMLAnchorElement>('a[href^="/Profile.cfm/"]')).map(a => a.textContent!.trim());
  }

  it('sorts by either column when its header is clicked', () => {
    setCachedCounts('11lizzie', { saleTrade: 1, wantlist: 5 });
    setCachedCounts('158cf946-8d68-483a', { saleTrade: 3, wantlist: 0 });
    setCachedCounts('1898', { saleTrade: 2, wantlist: 2 });
    document.querySelector('#collapse1')!.classList.add('show');

    // Keep the first four members (plus detail rows) so re-sorting stays fast under jsdom.
    const table = firstTable();
    while (table.rows.length > 9) table.rows[table.rows.length - 1].remove();
    document.querySelectorAll('.collapse:not(#collapse1)').forEach(section => section.remove());

    enhanceCollectionCheckPage();
    const [haveHeader, wantHeader] = Array.from(table.rows[0].cells).slice(3);

    // Loaded rows come first, ordered by the default column; unloaded rows follow in page order.
    expect(memberOrder(table).slice(0, 4)).toEqual(['158cf946-8d68-483a', '1898', '11lizzie', '1Chicago']);

    wantHeader.click();
    expect(memberOrder(table).slice(0, 4)).toEqual(['11lizzie', '1898', '158cf946-8d68-483a', '1Chicago']);
    expect(wantHeader.textContent).toBe('Their Wants I Have ▼');
    expect(haveHeader.textContent).toBe('My Wants They Have');

    wantHeader.click();
    expect(memberOrder(table).slice(0, 4)).toEqual(['158cf946-8d68-483a', '1898', '11lizzie', '1Chicago']);
    expect(wantHeader.textContent).toBe('Their Wants I Have ▲');

    // Detail rows stay attached to their member row and numbering follows the new order.
    const firstMemberRow = table.rows[1];
    expect(firstMemberRow.cells[0].textContent).toBe('1.');
    expect(table.rows[2].querySelector('td[colspan]')).not.toBeNull();
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
