import { mount } from 'svelte';
import {
  getGalleryColumns,
  isCollectionGalleryEnabled,
  isInfiniteGalleryEnabled,
  onCollectionGallerySettingChange,
  onGalleryColumnsSettingChange,
  onInfiniteGallerySettingChange,
} from '../../core/settings';
import CollectionGallery from './CollectionGallery.svelte';
import type { GalleryCardModel } from './types';

const GALLERY_ATTRIBUTE = 'data-tcdb-enhanced-gallery';
const ORIGINAL_ATTRIBUTE = 'data-tcdb-original-gallery-card';

type GalleryEntry = { image: HTMLImageElement; table: HTMLTableElement };
type GalleryComponent = { appendCards: (cards: GalleryCardModel[]) => void };

export function initCollectionGallery(): void {
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
  if (!entries.length) return;

  const gallery = document.createElement('div');
  gallery.setAttribute(GALLERY_ATTRIBUTE, 'true');
  gallery.style.setProperty('--tcdb-gallery-columns', String(getGalleryColumns()));

  const component = mount(CollectionGallery, {
    target: gallery,
    props: { initialCards: entries.map(toGalleryCard) },
  }) as GalleryComponent;

  const firstWrapper = getTableWrapper(entries[0].table);
  firstWrapper.before(gallery);

  for (const { table } of entries) {
    const wrapper = getTableWrapper(table);
    wrapper.setAttribute(ORIGINAL_ATTRIBUTE, 'true');
    wrapper.hidden = true;
  }

  setupInfiniteScroll(gallery, component, findNextPageUrl(document));
}

export function restoreOriginalCollectionGallery(): void {
  document.querySelector<HTMLElement>(`[${GALLERY_ATTRIBUTE}]`)?.setAttribute('hidden', '');
  document.querySelector<HTMLElement>('[data-tcdb-gallery-sentinel]')?.setAttribute('hidden', '');
  document.querySelectorAll<HTMLElement>(`[${ORIGINAL_ATTRIBUTE}]`).forEach(element => {
    element.hidden = false;
  });
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
