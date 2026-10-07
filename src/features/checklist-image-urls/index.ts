import {
  isChecklistImageUrlsEnabled,
  onChecklistImageUrlsSettingChange,
} from '../../core/settings';
import { findChecklistTable, findNextPageUrl, parseChecklist } from '../checklist-gallery/parser';

const BUTTON_SELECTOR = '[data-tcdb-copy-image-urls]';
const DEFAULT_LABEL = 'Copy image URLs';

export function initChecklistImageUrls(): void {
  if (isChecklistImageUrlsEnabled()) enhanceChecklistImageUrls();
  onChecklistImageUrlsSettingChange((enabled) => {
    if (enabled) enhanceChecklistImageUrls();
    else removeChecklistImageUrls();
  });
}

export function removeChecklistImageUrls(): void {
  document.querySelectorAll(BUTTON_SELECTOR).forEach(element => element.remove());
}

export function enhanceChecklistImageUrls(): void {
  if (document.querySelector(BUTTON_SELECTOR)) return;

  const table = findChecklistTable(document);
  if (!table) return;

  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.tcdbCopyImageUrls = 'true';
  button.className = 'btn btn-sm btn-outline-primary me-2';
  button.textContent = DEFAULT_LABEL;

  // When the clipboard rejects a write made long after the click (e.g. many pages to fetch),
  // the collected URLs are kept so the next click can copy them immediately.
  let pending: string[] | null = null;

  button.addEventListener('click', async () => {
    if (button.disabled) return;
    button.disabled = true;

    try {
      const urls = pending ?? await collectChecklistImageUrls((loaded) => {
        button.textContent = `Collecting… (${loaded})`;
      });
      if (!urls.length) {
        flash(button, 'No images found');
        return;
      }

      try {
        await navigator.clipboard.writeText(urls.join('\n'));
        pending = null;
        flash(button, `Copied ${urls.length} URLs`);
      } catch {
        pending = urls;
        button.textContent = `Click to copy ${urls.length} URLs`;
      }
    } catch {
      flash(button, 'Could not collect URLs');
    } finally {
      button.disabled = false;
    }
  });

  const optionsMenu = document.querySelector('.dropdown-menu a[href*="ChecklistByAge.cfm"]')?.closest('.btn-group');
  if (optionsMenu) optionsMenu.before(button);
  else table.before(button);
}

export async function collectChecklistImageUrls(
  onProgress: (loaded: number) => void = () => {},
): Promise<string[]> {
  const urls = new Set<string>();
  let page: ParentNode | null = await loadFirstPage();

  while (page) {
    const table = findChecklistTable(page);
    if (table) {
      for (const card of parseChecklist(table)) {
        if (card.imageSrc) urls.add(card.imageSrc);
      }
    }
    onProgress(urls.size);

    const nextUrl = findNextPageUrl(page);
    page = nextUrl ? await fetchPage(nextUrl) : null;
  }

  return [...urls];
}

async function loadFirstPage(): Promise<ParentNode> {
  const url = new URL(location.href);
  const pageIndex = url.searchParams.get('PageIndex');
  if (!pageIndex || pageIndex === '1') return document;

  url.searchParams.set('PageIndex', '1');
  return fetchPage(url.href);
}

async function fetchPage(url: string): Promise<Document> {
  const response = await fetch(url, { credentials: 'same-origin' });
  if (!response.ok) throw new Error(`Checklist request failed with ${response.status}`);
  return new DOMParser().parseFromString(await response.text(), 'text/html');
}

function flash(button: HTMLButtonElement, message: string): void {
  button.textContent = message;
  window.setTimeout(() => {
    if (button.textContent === message) button.textContent = DEFAULT_LABEL;
  }, 2500);
}
