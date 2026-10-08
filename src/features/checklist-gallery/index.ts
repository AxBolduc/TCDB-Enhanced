import { mount } from 'svelte';
import {
  isChecklistGalleryEnabled,
  isInfiniteGalleryEnabled,
  onChecklistGallerySettingChange,
  onInfiniteGallerySettingChange,
} from '../../core/settings';
import ChecklistGallery, { type ChecklistCard } from './ChecklistGallery.svelte';
import {
  fetchChecklistPage,
  findChecklistTable,
  findNextPageUrl,
  parseChecklist,
} from './parser';

const GALLERY_ATTRIBUTE = 'data-tcdb-checklist-gallery';
const ORIGINAL_ATTRIBUTE = 'data-tcdb-original-checklist';

type ChecklistGalleryComponent = {
  appendCards: (cards: ChecklistCard[]) => void;
  prependCards: (cards: ChecklistCard[]) => void;
};

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
  let component: ChecklistGalleryComponent;
  const loader = createPageLoader(findNextPageUrl(document), {
    append: loaded => component.appendCards(loaded),
    prepend: loaded => component.prependCards(loaded),
  });
  component = mount(ChecklistGallery, {
    target: gallery,
    props: { initialCards: cards, loadAllCards: loader.loadAll },
  }) as ChecklistGalleryComponent;
  setupInfiniteScroll(gallery, loader);
}

export function restoreOriginalChecklist(): void {
  document.querySelector<HTMLElement>(`[${GALLERY_ATTRIBUTE}]`)?.setAttribute('hidden', '');
  document.querySelector<HTMLElement>('[data-tcdb-checklist-sentinel]')?.setAttribute('hidden', '');
  const table = document.querySelector<HTMLElement>(`[${ORIGINAL_ATTRIBUTE}]`);
  if (table) table.hidden = false;
}

type PageLoader = {
  hasNextPage: () => boolean;
  hasFailed: () => boolean;
  loadNextPage: () => Promise<void>;
  loadAll: () => Promise<boolean>;
  onChange: (listener: (loading: boolean) => void) => void;
};

function createPageLoader(
  initialNextUrl: string | null,
  sink: { append: (cards: ChecklistCard[]) => void; prepend: (cards: ChecklistCard[]) => void },
): PageLoader {
  let nextUrl = initialNextUrl;
  let failed = false;
  let pending: Promise<void> | null = null;
  let earlierPagesLoaded = false;
  const listeners: ((loading: boolean) => void)[] = [];
  const notify = (loading: boolean) => listeners.forEach(listener => listener(loading));

  const loadNextPage = (): Promise<void> => {
    if (pending) return pending;
    if (!nextUrl) return Promise.resolve();
    const url = nextUrl;
    notify(true);
    pending = (async () => {
      try {
        const page = await fetchChecklistPage(url);
        const table = findChecklistTable(page);
        if (table) sink.append(parseChecklist(table));
        nextUrl = findNextPageUrl(page);
      } catch {
        failed = true;
        nextUrl = null;
      } finally {
        pending = null;
        notify(false);
      }
    })();
    return pending;
  };

  // Infinite scrolling only moves forward, so a checklist opened on a later page
  // still needs its earlier pages before every card in the set is shown.
  const loadEarlierPages = async (): Promise<void> => {
    if (earlierPagesLoaded) return;
    const url = new URL(location.href);
    const startIndex = Number(url.searchParams.get('PageIndex') ?? '1');
    const earlier: ChecklistCard[] = [];
    for (let index = 1; index < startIndex; index += 1) {
      url.searchParams.set('PageIndex', String(index));
      const table = findChecklistTable(await fetchChecklistPage(url.href));
      if (table) earlier.push(...parseChecklist(table));
    }
    if (earlier.length) sink.prepend(earlier);
    earlierPagesLoaded = true;
  };

  return {
    hasNextPage: () => nextUrl !== null,
    hasFailed: () => failed,
    loadNextPage,
    loadAll: async () => {
      try {
        await loadEarlierPages();
      } catch {
        return false;
      }
      while (nextUrl || pending) await loadNextPage();
      return !failed;
    },
    onChange: listener => listeners.push(listener),
  };
}

function setupInfiniteScroll(gallery: HTMLElement, loader: PageLoader): void {
  if (!loader.hasNextPage()) return;

  const sentinel = document.createElement('div');
  sentinel.dataset.tcdbChecklistSentinel = 'true';
  sentinel.setAttribute('aria-live', 'polite');
  sentinel.hidden = !isInfiniteGalleryEnabled();
  gallery.after(sentinel);

  loader.onChange((loading) => {
    if (loading) sentinel.textContent = 'Loading more cards…';
    else if (loader.hasFailed()) sentinel.textContent = 'Could not load more cards.';
    else sentinel.textContent = loader.hasNextPage() ? '' : 'All cards loaded.';
  });

  const loadNextPage = async (): Promise<void> => {
    if (!loader.hasNextPage() || gallery.hidden || !isInfiniteGalleryEnabled()) return;
    await loader.loadNextPage();

    if (loader.hasNextPage() && document.documentElement.scrollHeight <= window.innerHeight + 200) {
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
