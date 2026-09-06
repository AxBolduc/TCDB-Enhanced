import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseTradeMatchCounts } from '../src/features/trade-matching-links/parser';
import { parseMedianPrice } from '../src/features/median-prices/parser';

describe('trade matching parsers', () => {
  it('parses trade match counts from fixture html', () => {
    const html = readFileSync('test/fixtures/trade_matching.html', 'utf8');
    const counts = parseTradeMatchCounts(html);

    expect(counts.saleTrade).toEqual(expect.any(Number));
    expect(counts.wantlist).toEqual(expect.any(Number));
  });

  it('parses median price from card fixture html', () => {
    const html = readFileSync('test/fixtures/view_card.html', 'utf8');
    expect(parseMedianPrice(html)).toEqual(expect.any(String));
  });
});
