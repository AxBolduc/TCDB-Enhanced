import { isChecklistPage, isCollectionGalleryPage } from './core/page';
import { initChecklistGallery } from './features/checklist-gallery';
import { initCollectionGallery } from './features/collection-gallery';
import { initControlPanel } from './features/control-panel';
import { initTradeMatchingLinks } from './features/trade-matching-links';
import { initMedianPrices } from './features/median-prices';
import { initEbaySoldListings } from './features/ebay-sold-listings';

initControlPanel();
initTradeMatchingLinks();
initMedianPrices();
initEbaySoldListings();
if (isChecklistPage()) initChecklistGallery();
if (isCollectionGalleryPage()) initCollectionGallery();
