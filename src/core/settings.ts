const MEDIAN_PRICE_KEY = 'tcdb-enhanced:median-price-enabled';
const MEDIAN_PRICE_CHANGE_EVENT = 'tcdb-enhanced:median-price-change';
const COLLECTION_GALLERY_KEY = 'tcdb-enhanced:collection-gallery-enabled';
const COLLECTION_GALLERY_CHANGE_EVENT = 'tcdb-enhanced:collection-gallery-change';

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
