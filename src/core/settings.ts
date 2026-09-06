const MEDIAN_PRICE_KEY = 'tcdb-enhanced:median-price-enabled';
const MEDIAN_PRICE_CHANGE_EVENT = 'tcdb-enhanced:median-price-change';

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
