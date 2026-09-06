import { isCollectionGalleryPage } from './core/page';
import { initCollectionGallery } from './features/collection-gallery';
import { initControlPanel } from './features/control-panel';
import { initTradeMatchingLinks } from './features/trade-matching-links';
import { initMedianPrices } from './features/median-prices';

initControlPanel();
initTradeMatchingLinks();
initMedianPrices();
if (isCollectionGalleryPage()) initCollectionGallery();
