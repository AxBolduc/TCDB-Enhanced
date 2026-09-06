export function isCollectionCheckPage(pathname = location.pathname): boolean {
  return pathname.includes('/CollectionCheck.cfm');
}

export function isTradeMatchingPage(pathname = location.pathname): boolean {
  return pathname.includes('/TradeMatching.cfm');
}

export function isTransactionsPage(pathname = location.pathname): boolean {
  return pathname.includes('/YourTransactions.cfm');
}
