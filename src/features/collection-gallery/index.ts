import {
  isCollectionGalleryEnabled,
  isInfiniteGalleryEnabled,
  onCollectionGallerySettingChange,
  onInfiniteGallerySettingChange,
} from '../../core/settings';

const GALLERY_ATTRIBUTE = 'data-tcdb-enhanced-gallery';
const ORIGINAL_ATTRIBUTE = 'data-tcdb-original-gallery-card';

export function initCollectionGallery(): void {
  if (isCollectionGalleryEnabled()) enhanceCollectionGallery();

  onCollectionGallerySettingChange((enabled) => {
    if (enabled) enhanceCollectionGallery();
    else restoreOriginalCollectionGallery();
  });
}

export function enhanceCollectionGallery(): void {
  const existingGallery = document.querySelector<HTMLElement>(`[${GALLERY_ATTRIBUTE}]`);
  if (existingGallery) {
    existingGallery.hidden = false;
    const sentinel = document.querySelector<HTMLElement>('[data-tcdb-gallery-sentinel]');
    if (sentinel) sentinel.hidden = !isInfiniteGalleryEnabled();
    document.querySelectorAll<HTMLElement>(`[${ORIGINAL_ATTRIBUTE}]`).forEach(element => {
      element.hidden = true;
    });
    return;
  }

  const entries = getGalleryEntries(document);

  if (!entries.length) return;

  addGalleryStyles();

  const gallery = document.createElement('div');
  gallery.setAttribute(GALLERY_ATTRIBUTE, 'true');

  for (const { image, table } of entries) {
    gallery.append(createCard(table, image));
  }

  const firstTable = entries[0].table;
  const firstWrapper = getTableWrapper(firstTable);
  firstWrapper.before(gallery);

  for (const { table } of entries) {
    const wrapper = getTableWrapper(table);
    wrapper.setAttribute(ORIGINAL_ATTRIBUTE, 'true');
    wrapper.hidden = true;
  }

  setupInfiniteScroll(gallery, findNextPageUrl(document));
}

export function restoreOriginalCollectionGallery(): void {
  document.querySelector<HTMLElement>(`[${GALLERY_ATTRIBUTE}]`)?.setAttribute('hidden', '');
  document.querySelector<HTMLElement>('[data-tcdb-gallery-sentinel]')?.setAttribute('hidden', '');
  document.querySelectorAll<HTMLElement>(`[${ORIGINAL_ATTRIBUTE}]`).forEach(element => {
    element.hidden = false;
  });
}

type GalleryEntry = { image: HTMLImageElement; table: HTMLTableElement };

function getGalleryEntries(root: ParentNode): GalleryEntry[] {
  return Array.from(root.querySelectorAll<HTMLImageElement>('table.table img'))
    .filter(isFrontImage)
    .map(image => ({ image, table: image.closest<HTMLTableElement>('table.table') }))
    .filter((entry): entry is GalleryEntry => Boolean(entry.table));
}

function findNextPageUrl(root: ParentNode): string | null {
  const nextLink = Array.from(root.querySelectorAll<HTMLAnchorElement>('.pagination a[href]'))
    .find(link => link.textContent?.trim() === '›');
  return nextLink ? new URL(nextLink.getAttribute('href')!, location.href).href : null;
}

function setupInfiniteScroll(gallery: HTMLElement, initialNextUrl: string | null): void {
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
      const entries = getGalleryEntries(page);
      for (const { image, table } of entries) gallery.append(createCard(table, image));
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

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
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

function createCard(table: HTMLTableElement, sourceImage: HTMLImageElement): HTMLElement {
  const card = document.createElement('article');
  card.dataset.tcdbGalleryCard = 'true';

  const sourceLink = sourceImage.closest<HTMLAnchorElement>('a[href*="ViewCard.cfm"]');
  const imageLink = document.createElement('a');
  imageLink.href = sourceLink?.href ?? '#';
  imageLink.className = 'tcdb-gallery-image-link';

  const image = sourceImage.cloneNode(true) as HTMLImageElement;
  image.removeAttribute('class');
  image.removeAttribute('border');
  imageLink.append(image);

  const backImage = Array.from(table.querySelectorAll<HTMLImageElement>('img')).find(candidate => !isFrontImage(candidate));

  const details = document.createElement('div');
  details.className = 'tcdb-gallery-details';

  const title = document.createElement('a');
  title.dataset.tcdbCardTitle = 'true';
  title.href = imageLink.href;
  title.textContent = normalizeText(table.querySelector('h3.site')?.textContent) || sourceImage.alt.replace(/\s+Front\s*$/i, '');

  const price = document.createElement('div');
  price.dataset.tcdbCardPrice = 'true';
  price.textContent = normalizeText(table.querySelector('h3.site + div strong')?.textContent) || 'Price unavailable';

  const footer = document.createElement('div');
  footer.className = 'tcdb-gallery-footer';
  footer.append(price);

  if (backImage) {
    const flipButton = document.createElement('button');
    flipButton.type = 'button';
    flipButton.className = 'tcdb-gallery-flip';
    flipButton.textContent = '↻';
    flipButton.title = 'Show back';
    flipButton.setAttribute('aria-label', 'Show back');
    flipButton.setAttribute('aria-pressed', 'false');

    const front = { src: sourceImage.src, alt: sourceImage.alt };
    const back = { src: backImage.src, alt: backImage.alt };
    flipButton.addEventListener('click', () => {
      const showingBack = flipButton.getAttribute('aria-pressed') === 'true';
      const nextImage = showingBack ? front : back;
      const nextLabel = showingBack ? 'Show back' : 'Show front';
      image.src = nextImage.src;
      image.alt = nextImage.alt;
      flipButton.title = nextLabel;
      flipButton.setAttribute('aria-label', nextLabel);
      flipButton.setAttribute('aria-pressed', String(!showingBack));
    });

    footer.append(flipButton);
  }

  details.append(title, footer);
  card.append(imageLink, details);
  return card;
}

function getTableWrapper(table: HTMLTableElement): HTMLElement {
  return table.parentElement?.tagName === 'P' ? table.parentElement : table;
}

function normalizeText(value: string | null | undefined): string {
  return value?.replace(/\s+/g, ' ').trim() ?? '';
}

function addGalleryStyles(): void {
  if (document.querySelector('[data-tcdb-gallery-styles]')) return;

  const style = document.createElement('style');
  style.dataset.tcdbGalleryStyles = 'true';
  style.textContent = `
    [${GALLERY_ATTRIBUTE}] {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(145px, 180px));
      justify-content: center;
      gap: 1rem;
      margin: 1rem 0 1.5rem;
    }
    [data-tcdb-gallery-card] {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-width: 0;
      background: #fff;
      border: 1px solid #d2d2d2;
      border-radius: 0.5rem;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
    }
    .tcdb-gallery-image-link {
      display: flex;
      align-items: center;
      justify-content: center;
      aspect-ratio: 2.5 / 3.5;
      padding: 0.35rem;
      background: #f4f4f4;
    }
    .tcdb-gallery-image-link img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .tcdb-gallery-details {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 0.4rem;
      padding: 0.55rem 0.65rem 0.65rem;
    }
    [data-tcdb-card-title] {
      color: inherit;
      font-size: 0.8rem;
      font-weight: 600;
      line-height: 1.25;
      text-decoration: none;
    }
    [data-tcdb-card-title]:hover { text-decoration: underline; }
    .tcdb-gallery-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 28px;
      margin-top: auto;
    }
    [data-tcdb-card-price] {
      color: #555;
      font-size: 0.8rem;
      font-weight: 700;
    }
    .tcdb-gallery-flip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      padding: 0;
      color: #2563eb;
      font-size: 1rem;
      font-weight: 700;
      line-height: 1;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 0.3rem;
      cursor: pointer;
    }
    .tcdb-gallery-flip:hover { background: #dbeafe; }
    .tcdb-gallery-flip:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; }
    [data-tcdb-gallery-sentinel] {
      min-height: 1px;
      padding: 0.75rem;
      color: #64748b;
      font-size: 0.8rem;
      text-align: center;
    }
    @media (max-width: 400px) {
      [${GALLERY_ATTRIBUTE}] {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.65rem;
      }
    }
  `;
  document.head.append(style);
}
