export interface TradeMatchCounts {
  saleTrade: number;
  wantlist: number;
}

export function parseTradeMatchCounts(html: string): TradeMatchCounts {
  const saleTradeMatch = html.match(/For Sale\s*\/\s*Trade List Matches\s*\((\d+)\s*Items?\)/i);
  const wantlistMatch = html.match(/Wantlist Matches\s*\((\d+)\s*Items?\)/i);

  return {
    saleTrade: saleTradeMatch ? Number(saleTradeMatch[1]) : 0,
    wantlist: wantlistMatch ? Number(wantlistMatch[1]) : 0,
  };
}

export function parseMedianPrice(html: string): string | null {
  const match = html.match(/Med\.\s*Price:\s*<a\b[^>]*>\s*([^<]+?)\s*<\/a>/i)
    || html.match(/Med\.\s*Price:\s*([^<\n]+)/i);
  return match ? match[1].trim() : null;
}
