import { isCollectionCheckPage, isTradeMatchingPage, isTransactionsPage } from '../../core/page';
import { enhanceCollectionCheckPage } from './collection-check';
import { addMedianPricesToCardLinks } from './median-prices';

export function initTradeMatchingLinks(): void {
  if (isCollectionCheckPage()) enhanceCollectionCheckPage();

  if (isTradeMatchingPage() || isTransactionsPage()) {
    addMedianPricesToCardLinks();
  }
}
