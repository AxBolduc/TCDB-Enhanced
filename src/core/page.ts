export function isChecklistPage(pathname = location.pathname): boolean {
  return pathname.includes('/Checklist.cfm');
}

export function isCollectionGalleryPage(pathname = location.pathname): boolean {
  return pathname.includes('/CollectionModeGallery.cfm');
}

export function isCollectionCheckPage(pathname = location.pathname): boolean {
  return pathname.includes('/CollectionCheck.cfm');
}

export function isTradeMatchingPage(pathname = location.pathname): boolean {
  return pathname.includes('/TradeMatching.cfm');
}

export function isTransactionsPage(pathname = location.pathname): boolean {
  return pathname.includes('/YourTransactions.cfm');
}

export function isViewCardPage(pathname = location.pathname): boolean {
  return pathname.includes('/ViewCard.cfm');
}
