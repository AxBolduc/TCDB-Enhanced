import { isCollectionCheckPage } from '../../core/page';
import { isTradeMatchingLinksEnabled, onTradeMatchingLinksSettingChange } from '../../core/settings';
import { enhanceCollectionCheckPage, removeTradeMatchingLinks } from './collection-check';

export function initTradeMatchingLinks(): void {
  if (!isCollectionCheckPage()) return;

  if (isTradeMatchingLinksEnabled()) enhanceCollectionCheckPage();

  onTradeMatchingLinksSettingChange((enabled) => {
    if (enabled) enhanceCollectionCheckPage();
    else removeTradeMatchingLinks();
  });
}
