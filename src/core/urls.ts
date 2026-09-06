export function tradeMatchingUrl(memberName: string): string {
  return `https://www.tcdb.com/TradeMatching.cfm?MODE=ViewDetails&Member=${encodeURIComponent(memberName)}`;
}

export function absoluteUrl(href: string): string {
  return new URL(href, location.origin).href;
}
