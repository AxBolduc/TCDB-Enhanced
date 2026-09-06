import { isCollectionCheckPage, isTradeMatchingPage, isTransactionsPage } from '../../core/page';
import { isMedianPriceEnabled, onMedianPriceSettingChange } from '../../core/settings';
import { enhanceCollectionCheckPage } from './collection-check';
import { addMedianPricesToCardLinks, removeMedianPrices } from './median-prices';

export function initTradeMatchingLinks(): void {
  if (isCollectionCheckPage()) enhanceCollectionCheckPage();

  if (isTradeMatchingPage() || isTransactionsPage()) {
    if (isMedianPriceEnabled()) addMedianPricesToCardLinks();

    onMedianPriceSettingChange((enabled) => {
      if (enabled) addMedianPricesToCardLinks();
      else removeMedianPrices();
    });
  }
}
