const TRADE_MATCHING_LINKS_KEY = 'tcdb-enhanced:trade-matching-links-enabled';
const TRADE_MATCHING_LINKS_CHANGE_EVENT = 'tcdb-enhanced:trade-matching-links-change';
const MEDIAN_PRICE_KEY = 'tcdb-enhanced:median-price-enabled';
const MEDIAN_PRICE_CHANGE_EVENT = 'tcdb-enhanced:median-price-change';
const COLLECTION_GALLERY_KEY = 'tcdb-enhanced:collection-gallery-enabled';
const COLLECTION_GALLERY_CHANGE_EVENT = 'tcdb-enhanced:collection-gallery-change';
const GALLERY_COLUMNS_KEY = 'tcdb-enhanced:gallery-columns';
const GALLERY_COLUMNS_CHANGE_EVENT = 'tcdb-enhanced:gallery-columns-change';
const INFINITE_GALLERY_KEY = 'tcdb-enhanced:infinite-gallery-enabled';
const INFINITE_GALLERY_CHANGE_EVENT = 'tcdb-enhanced:infinite-gallery-change';
const CHECKLIST_GALLERY_KEY = 'tcdb-enhanced:checklist-gallery-enabled';
const CHECKLIST_GALLERY_CHANGE_EVENT = 'tcdb-enhanced:checklist-gallery-change';

export function isTradeMatchingLinksEnabled(): boolean {
  try {
    return localStorage.getItem(TRADE_MATCHING_LINKS_KEY) !== 'false';
  } catch {
    return true;
  }
}

export function setTradeMatchingLinksEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(TRADE_MATCHING_LINKS_KEY, String(enabled));
  } catch {
    // The setting still applies for this page when storage is unavailable.
  }

  window.dispatchEvent(new CustomEvent<boolean>(TRADE_MATCHING_LINKS_CHANGE_EVENT, { detail: enabled }));
}

export function onTradeMatchingLinksSettingChange(listener: (enabled: boolean) => void): void {
  window.addEventListener(TRADE_MATCHING_LINKS_CHANGE_EVENT, (event) => {
    listener((event as CustomEvent<boolean>).detail);
  });
}

export function isMedianPriceEnabled(): boolean {
  try {
    return localStorage.getItem(MEDIAN_PRICE_KEY) !== 'false';
  } catch {
    return true;
  }
}

export function setMedianPriceEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(MEDIAN_PRICE_KEY, String(enabled));
  } catch {
    // The setting still applies for this page when storage is unavailable.
  }

  window.dispatchEvent(new CustomEvent<boolean>(MEDIAN_PRICE_CHANGE_EVENT, { detail: enabled }));
}

export function onMedianPriceSettingChange(listener: (enabled: boolean) => void): void {
  window.addEventListener(MEDIAN_PRICE_CHANGE_EVENT, (event) => {
    listener((event as CustomEvent<boolean>).detail);
  });
}

export function isCollectionGalleryEnabled(): boolean {
  try {
    return localStorage.getItem(COLLECTION_GALLERY_KEY) !== 'false';
  } catch {
    return true;
  }
}

export function setCollectionGalleryEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(COLLECTION_GALLERY_KEY, String(enabled));
  } catch {
    // The setting still applies for this page when storage is unavailable.
  }

  window.dispatchEvent(new CustomEvent<boolean>(COLLECTION_GALLERY_CHANGE_EVENT, { detail: enabled }));
}

export function onCollectionGallerySettingChange(listener: (enabled: boolean) => void): void {
  window.addEventListener(COLLECTION_GALLERY_CHANGE_EVENT, (event) => {
    listener((event as CustomEvent<boolean>).detail);
  });
}

export function getGalleryColumns(): number {
  try {
    const columns = Number(localStorage.getItem(GALLERY_COLUMNS_KEY));
    return Number.isInteger(columns) && columns > 0 ? columns : 5;
  } catch {
    return 5;
  }
}

export function setGalleryColumns(columns: number): void {
  const validColumns = Number.isInteger(columns) && columns > 0 ? columns : 5;
  try {
    localStorage.setItem(GALLERY_COLUMNS_KEY, String(validColumns));
  } catch {
    // The setting still applies for this page when storage is unavailable.
  }

  window.dispatchEvent(new CustomEvent<number>(GALLERY_COLUMNS_CHANGE_EVENT, { detail: validColumns }));
}

export function onGalleryColumnsSettingChange(listener: (columns: number) => void): void {
  window.addEventListener(GALLERY_COLUMNS_CHANGE_EVENT, (event) => {
    listener((event as CustomEvent<number>).detail);
  });
}

export function isChecklistGalleryEnabled(): boolean {
  try {
    return localStorage.getItem(CHECKLIST_GALLERY_KEY) !== 'false';
  } catch {
    return true;
  }
}

export function setChecklistGalleryEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(CHECKLIST_GALLERY_KEY, String(enabled));
  } catch {
    // The setting still applies for this page when storage is unavailable.
  }

  window.dispatchEvent(new CustomEvent<boolean>(CHECKLIST_GALLERY_CHANGE_EVENT, { detail: enabled }));
}

export function onChecklistGallerySettingChange(listener: (enabled: boolean) => void): void {
  window.addEventListener(CHECKLIST_GALLERY_CHANGE_EVENT, (event) => {
    listener((event as CustomEvent<boolean>).detail);
  });
}

export function isInfiniteGalleryEnabled(): boolean {
  try {
    return localStorage.getItem(INFINITE_GALLERY_KEY) !== 'false';
  } catch {
    return true;
  }
}

export function setInfiniteGalleryEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(INFINITE_GALLERY_KEY, String(enabled));
  } catch {
    // The setting still applies for this page when storage is unavailable.
  }

  window.dispatchEvent(new CustomEvent<boolean>(INFINITE_GALLERY_CHANGE_EVENT, { detail: enabled }));
}

export function onInfiniteGallerySettingChange(listener: (enabled: boolean) => void): void {
  window.addEventListener(INFINITE_GALLERY_CHANGE_EVENT, (event) => {
    listener((event as CustomEvent<boolean>).detail);
  });
}
