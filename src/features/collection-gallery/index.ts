import { mount } from 'svelte';
import {
  getGalleryColumns,
  isCollectionGalleryEnabled,
  isInfiniteGalleryEnabled,
  onCollectionGallerySettingChange,
  onGalleryColumnsSettingChange,
  setCollectionGalleryEnabled,
  onInfiniteGallerySettingChange,
} from '../../core/settings';
import CollectionGallery from './CollectionGallery.svelte';
import type { GalleryCardModel } from './types';

const GALLERY_ATTRIBUTE = 'data-tcdb-enhanced-gallery';
const ORIGINAL_ATTRIBUTE = 'data-tcdb-original-gallery-card';

type GalleryEntry = { image: HTMLImageElement; table: HTMLTableElement };
type BrowseEntry = { row: HTMLTableRowElement };
type GalleryComponent = { appendCards: (cards: GalleryCardModel[]) => void };

export function initCollectionGallery(): void {
  if (getBrowseEntries(document).length) installBrowseToggle();
  if (isCollectionGalleryEnabled()) enhanceCollectionGallery();

  onCollectionGallerySettingChange((enabled) => {
    if (enabled) enhanceCollectionGallery();
    else restoreOriginalCollectionGallery();
  });

  onGalleryColumnsSettingChange(applyGalleryColumns);
}

export function enhanceCollectionGallery(): void {
  const existingGallery = document.querySelector<HTMLElement>(`[${GALLERY_ATTRIBUTE}]`);
  if (existingGallery) {
    existingGallery.hidden = false;
    applyGalleryColumns(getGalleryColumns());
    const sentinel = document.querySelector<HTMLElement>('[data-tcdb-gallery-sentinel]');
    if (sentinel) sentinel.hidden = !isInfiniteGalleryEnabled();
    document.querySelectorAll<HTMLElement>(`[${ORIGINAL_ATTRIBUTE}]`).forEach(element => {
      element.hidden = true;
    });
    return;
  }

  const entries = getGalleryEntries(document);
  if (entries.length) {
    renderGallery(entries.map(toGalleryCard), getTableWrapper(entries[0].table), entries.map(({ table }) => getTableWrapper(table)));
    return;
  }

  const browse = getBrowseEntries(document);
  if (!browse.length) return;
  const browseTable = browse[0].row.closest('table');
  if (!browseTable) return;
  renderGallery(browse.map(toBrowseGalleryCard), browseTable, [browseTable]);
  installBrowseToggle();
}

export function restoreOriginalCollectionGallery(): void {
  document.querySelector<HTMLElement>(`[${GALLERY_ATTRIBUTE}]`)?.setAttribute('hidden', '');
  document.querySelector<HTMLElement>('[data-tcdb-gallery-sentinel]')?.setAttribute('hidden', '');
  document.querySelectorAll<HTMLElement>(`[${ORIGINAL_ATTRIBUTE}]`).forEach(element => {
    element.hidden = false;
  });
}

function renderGallery(cards: GalleryCardModel[], before: Element, originals: HTMLElement[]): void {
  const gallery = document.createElement('div');
  gallery.setAttribute(GALLERY_ATTRIBUTE, 'true');
  gallery.style.setProperty('--tcdb-gallery-columns', String(getGalleryColumns()));

  const component = mount(CollectionGallery, {
    target: gallery,
    props: { initialCards: cards },
  }) as GalleryComponent;

  before.before(gallery);

  for (const original of originals) {
    original.setAttribute(ORIGINAL_ATTRIBUTE, 'true');
    original.hidden = true;
  }

  setupInfiniteScroll(gallery, component, findNextPageUrl(document));
}

function getGalleryEntries(root: ParentNode): GalleryEntry[] {
  return Array.from(root.querySelectorAll<HTMLImageElement>('table.table img'))
    .filter(isFrontImage)
    .map(image => ({ image, table: image.closest<HTMLTableElement>('table.table') }))
    .filter((entry): entry is GalleryEntry => Boolean(entry.table));
}

function toGalleryCard({ image: sourceImage, table }: GalleryEntry): GalleryCardModel {
  const sourceLink = sourceImage.closest<HTMLAnchorElement>('a[href*="ViewCard.cfm"]');
  const backImage = Array.from(table.querySelectorAll<HTMLImageElement>('img'))
    .find(candidate => !isFrontImage(candidate));

  return {
    href: sourceLink?.href ?? '#',
    front: { src: sourceImage.src, alt: sourceImage.alt },
    back: backImage ? { src: backImage.src, alt: backImage.alt } : undefined,
    title: normalizeText(table.querySelector('h3.site')?.textContent)
      || sourceImage.alt.replace(/\s+Front\s*$/i, ''),
    price: normalizeText(table.querySelector('h3.site + div strong')?.textContent)
      || 'Price unavailable',
  };
}

function getBrowseEntries(root: ParentNode): BrowseEntry[] {
  return Array.from(root.querySelectorAll<HTMLTableRowElement>('tr.collection_row'))
    .filter(row => Boolean(row.querySelector('a[href*="ViewCard.cfm"]')))
    .map(row => ({ row }));
}

function toBrowseGalleryCard({ row }: BrowseEntry): GalleryCardModel {
  const cardLink = Array.from(row.querySelectorAll<HTMLAnchorElement>('a[href*="ViewCard.cfm"]'))
    .find(link => normalizeText(link.textContent));
  const nameLink = Array.from(row.querySelectorAll<HTMLAnchorElement>('a[href*="ViewCard.cfm"]'))
    .find(link => link !== cardLink && normalizeText(link.textContent));
  const infoLink = row.querySelector<HTMLAnchorElement>('a[href*="CollectionCard.cfm"]');
  const ebayLink = row.querySelector<HTMLAnchorElement>('a[href*="ebay.com"]');
  const href = nameLink?.href ?? cardLink?.href ?? '#';
  const number = normalizeText(cardLink?.textContent);
  const nameCell = nameLink?.closest('td');
  const name = normalizeText(nameCell?.textContent) || normalizeText(nameLink?.textContent);
  const title = [number, name].filter(Boolean).join(' ');
  const quantity = normalizeText(row.querySelector('.badge')?.textContent);

  return {
    href,
    front: { src: cardImageUrl(href, 'Fr'), alt: `${title} Front` },
    back: { src: cardImageUrl(href, 'Bk'), alt: `${title} Back` },
    title: title || href,
    price: quantity ? `Qty ${quantity}` : (infoLink ? 'Details available' : (ebayLink ? 'Search eBay' : '')),
  };
}

function cardImageUrl(href: string, side: 'Fr' | 'Bk'): string {
  const url = new URL(href, location.href);
  const match = url.pathname.match(/\/sid\/(\d+)\/cid\/(\d+)\//i);
  if (!match) return href;
  const [, sid, cid] = match;
  return new URL(`/Images/Cards/${detectCardCategory()}/${sid}/${sid}-${cid}${side}.jpg`, location.href).href;
}

function detectCardCategory(): string {
  const title = document.title;
  const categories = ['Baseball', 'Basketball', 'Football', 'Hockey', 'Racing', 'Soccer', 'Wrestling', 'Gaming', 'Multi-Sport', 'Non-Sport'];
  return categories.find(category => title.includes(category)) ?? 'Baseball';
}

function installBrowseToggle(): void {
  const options = document.querySelector<HTMLElement>('.btn-group');
  if (!options || document.querySelector('[data-tcdb-browse-gallery-toggle]')) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn btn-sm btn-outline-primary ms-2';
  button.dataset.tcdbBrowseGalleryToggle = 'true';
  const update = () => {
    button.textContent = isCollectionGalleryEnabled() ? 'Original view' : 'Gallery view';
    button.setAttribute('aria-pressed', String(isCollectionGalleryEnabled()));
  };
  button.addEventListener('click', () => {
    setCollectionGalleryEnabled(!isCollectionGalleryEnabled());
    update();
  });
  onCollectionGallerySettingChange(update);
  update();
  options.after(button);
}

function findNextPageUrl(root: ParentNode): string | null {
  const nextLink = Array.from(root.querySelectorAll<HTMLAnchorElement>('.pagination a[href]'))
    .find(link => link.textContent?.trim() === '›');
  return nextLink ? new URL(nextLink.getAttribute('href')!, location.href).href : null;
}

function setupInfiniteScroll(
  gallery: HTMLElement,
  component: GalleryComponent,
  initialNextUrl: string | null,
): void {
  if (!initialNextUrl) return;

  const sentinel = document.createElement('div');
  sentinel.dataset.tcdbGallerySentinel = 'true';
  sentinel.setAttribute('aria-live', 'polite');
  sentinel.hidden = !isInfiniteGalleryEnabled();
  gallery.after(sentinel);

  let nextUrl: string | null = initialNextUrl;
  let loading = false;

  const loadNextPage = async (): Promise<void> => {
    if (!nextUrl || loading || gallery.hidden || !isInfiniteGalleryEnabled()) return;
    loading = true;
    sentinel.textContent = 'Loading more cards…';

    try {
      const response = await fetch(nextUrl, { credentials: 'same-origin' });
      if (!response.ok) throw new Error(`Gallery request failed with ${response.status}`);

      const page = new DOMParser().parseFromString(await response.text(), 'text/html');
      component.appendCards(getGalleryEntries(page).map(toGalleryCard));
      nextUrl = findNextPageUrl(page);
      sentinel.textContent = nextUrl ? '' : 'All cards loaded.';
    } catch {
      sentinel.textContent = 'Could not load more cards.';
      nextUrl = null;
    } finally {
      loading = false;
    }

    if (nextUrl && document.documentElement.scrollHeight <= window.innerHeight + 200) {
      await loadNextPage();
    }
  };

  const Observer = (window as Window & {
    IntersectionObserver?: typeof IntersectionObserver;
  }).IntersectionObserver;

  if (Observer) {
    const observer = new Observer((entries) => {
      if (entries.some(entry => entry.isIntersecting)) void loadNextPage();
    }, { rootMargin: '600px 0px' });
    observer.observe(sentinel);
  } else {
    window.addEventListener('scroll', () => {
      const nearBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 600;
      if (nearBottom) void loadNextPage();
    }, { passive: true });
  }

  onInfiniteGallerySettingChange((enabled) => {
    sentinel.hidden = !enabled || gallery.hidden;
    if (enabled) void loadNextPage();
  });

  if (isInfiniteGalleryEnabled() && document.documentElement.scrollHeight <= window.innerHeight + 200) {
    void loadNextPage();
  }
}

function isFrontImage(image: HTMLImageElement): boolean {
  return /front\s*$/i.test(image.alt) || /Fr\.[a-z]+(?:\?|$)/i.test(image.src);
}

function getTableWrapper(table: HTMLTableElement): HTMLElement {
  return table.parentElement?.tagName === 'P' ? table.parentElement : table;
}

function normalizeText(value: string | null | undefined): string {
  return value?.replace(/\s+/g, ' ').trim() ?? '';
}

function applyGalleryColumns(columns: number): void {
  document.querySelector<HTMLElement>(`[${GALLERY_ATTRIBUTE}]`)
    ?.style.setProperty('--tcdb-gallery-columns', String(columns));
}
