import { mount } from 'svelte';
import {
  isChecklistGalleryEnabled,
  isInfiniteGalleryEnabled,
  onChecklistGallerySettingChange,
  onInfiniteGallerySettingChange,
} from '../../core/settings';
import ChecklistGallery, { type ChecklistCard } from './ChecklistGallery.svelte';
import { findChecklistTable, findNextPageUrl, parseChecklist } from './parser';

const GALLERY_ATTRIBUTE = 'data-tcdb-checklist-gallery';
const ORIGINAL_ATTRIBUTE = 'data-tcdb-original-checklist';

type ChecklistGalleryComponent = { appendCards: (cards: ChecklistCard[]) => void };

export function initChecklistGallery(): void {
  if (isChecklistGalleryEnabled()) enhanceChecklistGallery();
  onChecklistGallerySettingChange((enabled) => {
    if (enabled) enhanceChecklistGallery();
    else restoreOriginalChecklist();
  });
}

export function enhanceChecklistGallery(): void {
  const existing = document.querySelector<HTMLElement>(`[${GALLERY_ATTRIBUTE}]`);
  if (existing) {
    existing.hidden = false;
    const sentinel = document.querySelector<HTMLElement>('[data-tcdb-checklist-sentinel]');
    if (sentinel) sentinel.hidden = !isInfiniteGalleryEnabled();
    document.querySelector<HTMLElement>(`[${ORIGINAL_ATTRIBUTE}]`)?.setAttribute('hidden', '');
    return;
  }

  const table = findChecklistTable(document);
  if (!table) return;
  const cards = parseChecklist(table);
  if (!cards.length) return;

  const gallery = document.createElement('div');
  gallery.setAttribute(GALLERY_ATTRIBUTE, 'true');
  table.before(gallery);
  table.setAttribute(ORIGINAL_ATTRIBUTE, 'true');
  table.hidden = true;
  const component = mount(ChecklistGallery, {
    target: gallery,
    props: { initialCards: cards },
  }) as ChecklistGalleryComponent;
  setupInfiniteScroll(gallery, component, findNextPageUrl(document));
}

export function restoreOriginalChecklist(): void {
  document.querySelector<HTMLElement>(`[${GALLERY_ATTRIBUTE}]`)?.setAttribute('hidden', '');
  document.querySelector<HTMLElement>('[data-tcdb-checklist-sentinel]')?.setAttribute('hidden', '');
  const table = document.querySelector<HTMLElement>(`[${ORIGINAL_ATTRIBUTE}]`);
  if (table) table.hidden = false;
}

function setupInfiniteScroll(
  gallery: HTMLElement,
  component: ChecklistGalleryComponent,
  initialNextUrl: string | null,
): void {
  if (!initialNextUrl) return;

  const sentinel = document.createElement('div');
  sentinel.dataset.tcdbChecklistSentinel = 'true';
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
      if (!response.ok) throw new Error(`Checklist request failed with ${response.status}`);

      const page = new DOMParser().parseFromString(await response.text(), 'text/html');
      const table = findChecklistTable(page);
      if (table) component.appendCards(parseChecklist(table));
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
