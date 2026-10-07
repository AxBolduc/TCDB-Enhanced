import { isChecklistPage, isCollectionBrowsePage, isCollectionGalleryPage } from './core/page';
import { initChecklistGallery } from './features/checklist-gallery';
import { initChecklistImageUrls } from './features/checklist-image-urls';
import { initCollectionGallery } from './features/collection-gallery';
import { initControlPanel } from './features/control-panel';
import { initTradeMatchingLinks } from './features/trade-matching-links';
import { initMedianPrices } from './features/median-prices';
import { initEbaySoldListings } from './features/ebay-sold-listings';

initControlPanel();
initTradeMatchingLinks();
initMedianPrices();
initEbaySoldListings();
if (isChecklistPage()) {
  initChecklistGallery();
  initChecklistImageUrls();
}
if (isCollectionGalleryPage() || isCollectionBrowsePage()) initCollectionGallery();
