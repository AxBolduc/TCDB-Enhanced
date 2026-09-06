import { sleep } from '../../core/queue';
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
    priceSpan.textContent = ' Med: …';
    priceSpan.title = 'Checking median price...';
    priceSpan.style.marginLeft = '0.35em';
    priceSpan.style.fontSize = '0.85em';
    priceSpan.style.whiteSpace = 'nowrap';
    priceSpan.style.color = '#fd7e14';
    cardLink.insertAdjacentElement('afterend', priceSpan);

    const url = absoluteUrl(cardLink.getAttribute('href') ?? '');
    const cached = getCachedPrice(url);
    if (cached) {
      renderMedianPrice(priceSpan, cached);
      continue;
    }

    chain = chain.then(() => fetchMedianPrice(url, priceSpan)).then(() => sleep(REQUEST_DELAY_MS));
  }
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
    priceSpan.style.color = '#dc3545';
  }
}
