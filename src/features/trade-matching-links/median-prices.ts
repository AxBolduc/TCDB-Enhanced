import { COLORS } from '../../core/colors';
import { sleep } from '../../core/queue';
import { isMedianPriceEnabled } from '../../core/settings';
import { absoluteUrl } from '../../core/urls';
import { getCachedPrice, setCachedPrice } from './cache';
import { parseMedianPrice } from './parser';
import { renderMedianPrice } from './render';

const REQUEST_DELAY_MS = 1500;

export function addMedianPricesToCardLinks(): void {
  const cardLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href*="/ViewCard.cfm/"]'))
    .filter(link => !link.dataset.tcdbMedianQueued);

  let chain = Promise.resolve();

  for (const cardLink of cardLinks) {
    cardLink.dataset.tcdbMedianQueued = 'true';

    const priceSpan = document.createElement('span');
    priceSpan.dataset.tcdbMedianPrice = 'true';
    priceSpan.textContent = ' Med: …';
    priceSpan.title = 'Checking median price...';
    priceSpan.style.marginLeft = '0.35em';
    priceSpan.style.fontSize = '0.85em';
    priceSpan.style.whiteSpace = 'nowrap';
    priceSpan.style.color = COLORS.warning;
    cardLink.insertAdjacentElement('afterend', priceSpan);

    const url = absoluteUrl(cardLink.getAttribute('href') ?? '');
    const cached = getCachedPrice(url);
    if (cached) {
      renderMedianPrice(priceSpan, cached);
      continue;
    }

    chain = chain.then(async () => {
      if (!isMedianPriceEnabled() || !priceSpan.isConnected) return;
      await fetchMedianPrice(url, priceSpan);
      await sleep(REQUEST_DELAY_MS);
    });
  }
}

export function removeMedianPrices(): void {
  document.querySelectorAll<HTMLElement>('[data-tcdb-median-price]').forEach(element => element.remove());
  document.querySelectorAll<HTMLAnchorElement>('a[data-tcdb-median-queued]').forEach(link => {
    delete link.dataset.tcdbMedianQueued;
  });
}

async function fetchMedianPrice(url: string, priceSpan: HTMLSpanElement): Promise<void> {
  try {
    const response = await fetch(url, { credentials: 'include', cache: 'force-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const price = parseMedianPrice(await response.text());
    setCachedPrice(url, price);
    renderMedianPrice(priceSpan, price);
  } catch {
    priceSpan.textContent = ' Med: !';
    priceSpan.title = 'Could not check median price';
    priceSpan.style.color = COLORS.danger;
  }
}
