import {
  getGalleryColumns,
  isCollectionGalleryEnabled,
  isInfiniteGalleryEnabled,
  isMedianPriceEnabled,
  isTradeMatchingLinksEnabled,
  setCollectionGalleryEnabled,
  setGalleryColumns,
  setInfiniteGalleryEnabled,
  setMedianPriceEnabled,
  setTradeMatchingLinksEnabled,
} from '../../core/settings';

const HOST_ID = 'tcdb-enhanced-control-panel';

const panelMarkup = `
  <style>
    :host {
      --tcdb-panel-accent: #2563eb;
      --tcdb-panel-bg: #ffffff;
      --tcdb-panel-border: #e2e8f0;
      --tcdb-panel-text: #172033;
      --tcdb-panel-muted: #64748b;
      color: var(--tcdb-panel-text);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    *, *::before, *::after { box-sizing: border-box; }

    .launcher {
      align-items: center;
      background: var(--tcdb-panel-accent);
      border: 0;
      border-radius: 999px;
      bottom: 20px;
      box-shadow: 0 8px 24px rgb(15 23 42 / 28%);
      color: white;
      cursor: pointer;
      display: flex;
      height: 52px;
      justify-content: center;
      padding: 0;
      position: fixed;
      right: 20px;
      transition: box-shadow 160ms ease, transform 160ms ease;
      width: 52px;
      z-index: 2147483645;
    }

    .launcher:hover { box-shadow: 0 10px 28px rgb(15 23 42 / 36%); transform: translateY(-2px); }
    .launcher:focus-visible, .close:focus-visible, .toggle input:focus-visible + .track { outline: 3px solid #93c5fd; outline-offset: 3px; }
    .launcher[aria-expanded="true"] { visibility: hidden; }

    .backdrop {
      background: rgb(15 23 42 / 32%);
      border: 0;
      inset: 0;
      opacity: 0;
      padding: 0;
      pointer-events: none;
      position: fixed;
      transition: opacity 180ms ease;
      z-index: 2147483646;
    }

    .drawer {
      background: var(--tcdb-panel-bg);
      border-left: 1px solid var(--tcdb-panel-border);
      box-shadow: -12px 0 32px rgb(15 23 42 / 18%);
      display: flex;
      flex-direction: column;
      height: 100dvh;
      max-width: 100%;
      position: fixed;
      right: 0;
      top: 0;
      transform: translateX(105%);
      transition: transform 220ms ease;
      width: 380px;
      z-index: 2147483647;
    }

    .open .backdrop { opacity: 1; pointer-events: auto; }
    .open .drawer { transform: translateX(0); }

    .header {
      align-items: center;
      border-bottom: 1px solid var(--tcdb-panel-border);
      display: flex;
      justify-content: space-between;
      padding: 20px 20px 16px;
    }

    .eyebrow {
      color: var(--tcdb-panel-accent);
      font-size: 11px;
      font-weight: 750;
      letter-spacing: .12em;
      margin: 0 0 4px;
      text-transform: uppercase;
    }

    h2 { font-size: 20px; line-height: 1.25; margin: 0; }

    .close {
      align-items: center;
      background: transparent;
      border: 0;
      border-radius: 8px;
      color: var(--tcdb-panel-muted);
      cursor: pointer;
      display: flex;
      height: 36px;
      justify-content: center;
      padding: 0;
      width: 36px;
    }

    .close:hover { background: #f1f5f9; color: var(--tcdb-panel-text); }
    .content { flex: 1; overflow-y: auto; padding: 20px; }
    .section-title { font-size: 13px; font-weight: 700; margin: 0 0 10px; }

    .setting {
      align-items: center;
      background: #f8fafc;
      border: 1px solid var(--tcdb-panel-border);
      border-radius: 12px;
      display: flex;
      gap: 16px;
      justify-content: space-between;
      padding: 16px;
    }

    .setting + .setting { margin-top: 10px; }
    .setting-copy { min-width: 0; }
    .setting-name { font-size: 14px; font-weight: 700; margin: 0 0 4px; }
    .setting-description { color: var(--tcdb-panel-muted); font-size: 12px; line-height: 1.4; margin: 0; }
    .number-setting { align-items: center; display: flex; gap: 8px; margin-top: 10px; }
    .number-setting label { color: var(--tcdb-panel-muted); font-size: 12px; }
    .number-setting input {
      background: white;
      border: 1px solid var(--tcdb-panel-border);
      border-radius: 6px;
      color: var(--tcdb-panel-text);
      font: inherit;
      padding: 5px 7px;
      width: 64px;
    }
    .number-setting input:focus-visible { outline: 3px solid #93c5fd; outline-offset: 2px; }
    .number-setting input:disabled { background: #f1f5f9; color: var(--tcdb-panel-muted); }
    .toggle { cursor: pointer; flex: 0 0 auto; position: relative; }
    .toggle input { height: 1px; opacity: 0; position: absolute; width: 1px; }

    .track {
      background: #cbd5e1;
      border-radius: 999px;
      display: block;
      height: 24px;
      position: relative;
      transition: background 160ms ease;
      width: 42px;
    }

    .track::after {
      background: white;
      border-radius: 50%;
      box-shadow: 0 1px 3px rgb(15 23 42 / 35%);
      content: "";
      height: 18px;
      left: 3px;
      position: absolute;
      top: 3px;
      transition: transform 160ms ease;
      width: 18px;
    }

    .toggle input:checked + .track { background: var(--tcdb-panel-accent); }
    .toggle input:checked + .track::after { transform: translateX(18px); }

    .footer {
      border-top: 1px solid var(--tcdb-panel-border);
      color: var(--tcdb-panel-muted);
      font-size: 12px;
      padding: 12px 20px;
    }

    svg { display: block; }

    @media (max-width: 520px) {
      .drawer { width: 100%; }
      .launcher { bottom: 16px; right: 16px; }
    }

    @media (prefers-reduced-motion: reduce) {
      .launcher, .backdrop, .drawer { transition: none; }
    }
  </style>

  <div class="panel-root">
    <button class="launcher" type="button" aria-label="Open TCDB Enhanced settings" aria-expanded="false" aria-controls="tcdb-enhanced-drawer">
      <svg aria-hidden="true" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.5 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.5a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15.5 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.14.37.35.72.6 1 .3.28.68.42 1.1.4h.09a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.7.6Z"/>
      </svg>
    </button>

    <button class="backdrop" type="button" aria-label="Close TCDB Enhanced settings" tabindex="-1"></button>

    <aside class="drawer" id="tcdb-enhanced-drawer" role="dialog" aria-modal="true" aria-labelledby="tcdb-enhanced-title" aria-hidden="true">
      <header class="header">
        <div>
          <p class="eyebrow">TCDB Enhanced</p>
          <h2 id="tcdb-enhanced-title">Settings</h2>
        </div>
        <button class="close" type="button" aria-label="Close settings">
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </header>
      <main class="content">
        <h3 class="section-title">Enhancements</h3>
        <div class="setting">
          <div class="setting-copy">
            <p class="setting-name" id="trade-matching-links-label">Trade matching links</p>
            <p class="setting-description">Add trade matching links and match counts beside members on collection check pages.</p>
          </div>
          <label class="toggle" aria-labelledby="trade-matching-links-label">
            <input class="trade-matching-links-toggle" type="checkbox">
            <span class="track" aria-hidden="true"></span>
          </label>
        </div>
        <div class="setting">
          <div class="setting-copy">
            <p class="setting-name" id="median-price-label">Median prices</p>
            <p class="setting-description">Show card median prices on trade matching and transaction pages.</p>
          </div>
          <label class="toggle" aria-labelledby="median-price-label">
            <input class="median-price-toggle" type="checkbox">
            <span class="track" aria-hidden="true"></span>
          </label>
        </div>
        <div class="setting">
          <div class="setting-copy">
            <p class="setting-name" id="collection-gallery-label">Compact collection gallery</p>
            <p class="setting-description">Show card fronts in a compact grid with titles and prices.</p>
            <div class="number-setting">
              <label for="gallery-columns">Columns</label>
              <input id="gallery-columns" class="gallery-columns-input" type="number" min="1" step="1" inputmode="numeric">
            </div>
          </div>
          <label class="toggle" aria-labelledby="collection-gallery-label">
            <input class="collection-gallery-toggle" type="checkbox">
            <span class="track" aria-hidden="true"></span>
          </label>
        </div>
        <div class="setting">
          <div class="setting-copy">
            <p class="setting-name" id="infinite-gallery-label">Infinite gallery loading</p>
            <p class="setting-description">Load the next collection page as you scroll.</p>
          </div>
          <label class="toggle" aria-labelledby="infinite-gallery-label">
            <input class="infinite-gallery-toggle" type="checkbox">
            <span class="track" aria-hidden="true"></span>
          </label>
        </div>
      </main>
      <footer class="footer">TCDB Enhanced</footer>
    </aside>
  </div>
`;

export function initControlPanel(): void {
  if (document.getElementById(HOST_ID)) return;

  const host = document.createElement('div');
  host.id = HOST_ID;
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = panelMarkup;
  (document.body ?? document.documentElement).append(host);

  const root = shadow.querySelector<HTMLElement>('.panel-root');
  const launcher = shadow.querySelector<HTMLButtonElement>('.launcher');
  const backdrop = shadow.querySelector<HTMLButtonElement>('.backdrop');
  const drawer = shadow.querySelector<HTMLElement>('.drawer');
  const closeButton = shadow.querySelector<HTMLButtonElement>('.close');
  const tradeMatchingLinksToggle = shadow.querySelector<HTMLInputElement>('.trade-matching-links-toggle');
  const medianPriceToggle = shadow.querySelector<HTMLInputElement>('.median-price-toggle');
  const collectionGalleryToggle = shadow.querySelector<HTMLInputElement>('.collection-gallery-toggle');
  const galleryColumnsInput = shadow.querySelector<HTMLInputElement>('.gallery-columns-input');
  const infiniteGalleryToggle = shadow.querySelector<HTMLInputElement>('.infinite-gallery-toggle');

  if (!root || !launcher || !backdrop || !drawer || !closeButton || !tradeMatchingLinksToggle || !medianPriceToggle || !collectionGalleryToggle || !galleryColumnsInput || !infiniteGalleryToggle) return;

  tradeMatchingLinksToggle.checked = isTradeMatchingLinksEnabled();
  tradeMatchingLinksToggle.addEventListener('change', () => {
    setTradeMatchingLinksEnabled(tradeMatchingLinksToggle.checked);
  });

  medianPriceToggle.checked = isMedianPriceEnabled();
  medianPriceToggle.addEventListener('change', () => {
    setMedianPriceEnabled(medianPriceToggle.checked);
  });

  collectionGalleryToggle.checked = isCollectionGalleryEnabled();
  galleryColumnsInput.value = String(getGalleryColumns());
  galleryColumnsInput.disabled = !collectionGalleryToggle.checked;
  collectionGalleryToggle.addEventListener('change', () => {
    setCollectionGalleryEnabled(collectionGalleryToggle.checked);
    galleryColumnsInput.disabled = !collectionGalleryToggle.checked;
  });
  galleryColumnsInput.addEventListener('change', () => {
    const columns = Number(galleryColumnsInput.value);
    setGalleryColumns(columns);
    galleryColumnsInput.value = String(getGalleryColumns());
  });

  infiniteGalleryToggle.checked = isInfiniteGalleryEnabled();
  infiniteGalleryToggle.addEventListener('change', () => {
    setInfiniteGalleryEnabled(infiniteGalleryToggle.checked);
  });

  const close = (): void => {
    root.classList.remove('open');
    launcher.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    launcher.focus();
  };

  const open = (): void => {
    root.classList.add('open');
    launcher.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    closeButton.focus();
  };

  launcher.addEventListener('click', open);
  closeButton.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  shadow.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && root.classList.contains('open')) close();
  });
}
