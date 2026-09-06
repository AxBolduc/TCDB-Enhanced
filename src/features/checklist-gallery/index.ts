import { mount } from 'svelte';
import {
  isChecklistGalleryEnabled,
  isInfiniteGalleryEnabled,
  onChecklistGallerySettingChange,
  onInfiniteGallerySettingChange,
} from '../../core/settings';
import ChecklistGallery, { type ChecklistCard } from './ChecklistGallery.svelte';

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

function findNextPageUrl(root: ParentNode): string | null {
  const nextLink = Array.from(root.querySelectorAll<HTMLAnchorElement>('.pagination a[href]'))
    .find(link => link.textContent?.trim() === '›');
  return nextLink ? new URL(nextLink.getAttribute('href')!, location.href).href : null;
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

function findChecklistTable(root: ParentNode): HTMLTableElement | null {
  return Array.from(root.querySelectorAll<HTMLTableElement>('table')).find(table =>
    table.querySelector('a[href*="ViewCard.cfm"] img')
    && table.querySelector('a[href*="Person.cfm"]')
    && table.querySelector('a[href*="Team.cfm"]'),
  ) ?? null;
}

function parseChecklist(table: HTMLTableElement): ChecklistCard[] {
  return Array.from(table.querySelectorAll('tr')).map(row => {
    const image = row.querySelector<HTMLImageElement>('a[href*="ViewCard.cfm"] img');
    const cardLink = image?.closest<HTMLAnchorElement>('a');
    const numberLink = Array.from(row.querySelectorAll<HTMLAnchorElement>('a[href*="ViewCard.cfm"]'))
      .find(link => !link.querySelector('img') && normalize(link.textContent));
    const nameLink = row.querySelector<HTMLAnchorElement>('a[href*="Person.cfm"]');
    const teamLink = row.querySelector<HTMLAnchorElement>('a[href*="Team.cfm"]');
    if (!image || !cardLink || !numberLink || !nameLink || !teamLink) return null;

    const notes = extractNotes(row);
    return {
      cardHref: cardLink.href,
      imageSrc: isMissingImage(image.src) ? '' : fullSizeImage(image.src),
      number: normalize(numberLink.textContent),
      name: normalize(nameLink.textContent),
      nameHref: nameLink.href,
      team: normalize(teamLink.textContent),
      teamHref: teamLink.href,
      flags: notes.flags,
      context: notes.context,
    };
  }).filter((card): card is ChecklistCard => card !== null);
}

function extractNotes(row: HTMLTableRowElement): { flags: string; context: string } {
  const flags: string[] = [];
  const context: string[] = [];

  for (const sourceCell of Array.from(row.cells)) {
    const cell = sourceCell.cloneNode(true) as HTMLTableCellElement;
    cell.querySelectorAll('figcaption').forEach(caption => {
      const text = normalize(caption.textContent);
      if (text) context.push(text);
      caption.remove();
    });
    cell.querySelectorAll([
      'a[href*="ViewCard.cfm"]',
      'a[href*="Person.cfm"]',
      'a[href*="Team.cfm"]',
      'a:empty',
      'img',
    ].join(',')).forEach(element => element.remove());

    const text = normalize(cell.textContent).replaceAll('\u00a0', '');
    if (!text) continue;
    if (text.includes(':')) context.push(text);
    else flags.push(text);
  }

  return { flags: flags.join(' '), context: context.join(' ') };
}

function isMissingImage(src: string): boolean {
  return /\/Images\/AddImage\.gif(?:\?|$)/i.test(src);
}

function fullSizeImage(src: string): string {
  const url = new URL(src, location.href);
  const match = url.pathname.match(/^\/Images\/Thumbs\/([^/]+)\/(\d+)\/(\d+)[_-](\d+).*Thumb(?:3)?\.jpg$/i);
  if (!match) return url.href;
  url.pathname = `/Images/Cards/${match[1]}/${match[2]}/${match[3]}-${match[4]}Fr.jpg`;
  url.search = '';
  return url.href;
}

function normalize(value: string | null): string {
  return value?.replace(/\s+/g, ' ').trim() ?? '';
}
