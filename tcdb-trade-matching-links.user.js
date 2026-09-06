// ==UserScript==
// @name         TCDB Collection Check Trade Matching Links
// @namespace    https://www.tcdb.com/
// @version      0.2.0
// @description  Add Trade Matching links next to member names on TCDB Collection Check pages, and lazily check match counts for expanded sections.
// @author       You
// @match        https://www.tcdb.com/CollectionCheck.cfm*
// @match        http://www.tcdb.com/CollectionCheck.cfm*
// @match        https://www.tcdb.com/TradeMatching.cfm*
// @match        http://www.tcdb.com/TradeMatching.cfm*
// @match        https://www.tcdb.com/YourTransactions.cfm*
// @match        http://www.tcdb.com/YourTransactions.cfm*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const ADDED_CLASS = 'tcdb-trade-matching-link-added';
  const CHECKED_ATTR = 'data-tcdb-tm-check-queued';
  const CACHE_PREFIX = 'tcdbTradeMatchCounts:';
  const CACHE_TTL_MS = 12 * 60 * 60 * 1000;
  const REQUEST_DELAY_MS = 1500;

  const queue = [];
  let queueRunning = false;

  function tradeMatchingUrl(memberName) {
    return `https://www.tcdb.com/TradeMatching.cfm?MODE=ViewDetails&Member=${encodeURIComponent(memberName)}`;
  }

  function cacheKey(memberName) {
    return `${CACHE_PREFIX}${memberName}`;
  }

  function getCachedCounts(memberName) {
    try {
      const raw = localStorage.getItem(cacheKey(memberName));
      if (!raw) return null;
      const cached = JSON.parse(raw);
      if (!cached || Date.now() - cached.time > CACHE_TTL_MS) return null;
      return cached.counts;
    } catch {
      return null;
    }
  }

  function setCachedCounts(memberName, counts) {
    try {
      localStorage.setItem(cacheKey(memberName), JSON.stringify({ time: Date.now(), counts }));
    } catch {
      // Ignore storage quota/private mode failures.
    }
  }

  function parseTradeMatchCounts(html) {
    const saleTradeMatch = html.match(/For Sale\s*\/\s*Trade List Matches\s*\((\d+)\s*Items?\)/i);
    const wantlistMatch = html.match(/Wantlist Matches\s*\((\d+)\s*Items?\)/i);

    return {
      saleTrade: saleTradeMatch ? Number(saleTradeMatch[1]) : 0,
      wantlist: wantlistMatch ? Number(wantlistMatch[1]) : 0,
    };
  }

  function renderCounts(link, counts) {
    const total = counts.saleTrade + counts.wantlist;
    link.dataset.saleTradeCount = String(counts.saleTrade);
    link.dataset.wantlistCount = String(counts.wantlist);

    if (total > 0) {
      link.textContent = `TM ${counts.saleTrade}/${counts.wantlist}`;
      link.title = `Trade matching: For Sale/Trade ${counts.saleTrade}, Wantlist ${counts.wantlist}`;
      link.style.color = '#198754';
      link.style.fontWeight = 'bold';
    } else {
      link.textContent = 'TM 0/0';
      link.title = 'Trade matching: no matches found';
      link.style.color = '#6c757d';
      link.style.fontWeight = 'normal';
    }

    sortSectionForLink(link);
  }

  function sortSectionForLink(link) {
    const section = link.closest('.collapse');
    const table = link.closest('table');
    if (!section || !table || !section.classList.contains('show')) return;

    const tbody = table.tBodies[0] || table;
    const rows = Array.from(tbody.rows);
    const headerRows = [];
    const groups = [];

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      const tradeLink = row.querySelector(`.${ADDED_CLASS}`);

      if (!tradeLink) {
        // Detail rows are consumed with their member row below. Anything else is a header.
        if (!row.querySelector('td[colspan]')) headerRows.push(row);
        continue;
      }

      const detailRow = rows[i + 1]?.querySelector('td[colspan]') ? rows[i + 1] : null;
      if (detailRow) i += 1;

      groups.push({
        row,
        detailRow,
        originalIndex: groups.length,
        saleTrade: Number(tradeLink.dataset.saleTradeCount ?? -1),
      });
    }

    groups.sort((a, b) => {
      if (b.saleTrade !== a.saleTrade) return b.saleTrade - a.saleTrade;
      return a.originalIndex - b.originalIndex;
    });

    for (const row of headerRows) tbody.appendChild(row);
    groups.forEach((group, index) => {
      const numberCell = group.row.cells[0];
      if (numberCell) numberCell.textContent = `${index + 1}.`;
      tbody.appendChild(group.row);
      if (group.detailRow) tbody.appendChild(group.detailRow);
    });
  }

  function renderChecking(link) {
    link.textContent = 'TM …';
    link.title = 'Checking trade matching counts...';
    link.style.color = '#fd7e14';
  }

  function renderError(link) {
    link.textContent = 'TM !';
    link.title = 'Could not check trade matching counts';
    link.style.color = '#dc3545';
  }

  async function checkMember(link, memberName) {
    renderChecking(link);

    const response = await fetch(tradeMatchingUrl(memberName), {
      credentials: 'include',
      cache: 'force-cache',
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const html = await response.text();
    const counts = parseTradeMatchCounts(html);
    setCachedCounts(memberName, counts);
    renderCounts(link, counts);
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function runQueue() {
    if (queueRunning) return;
    queueRunning = true;

    while (queue.length) {
      const { link, memberName } = queue.shift();
      if (!document.contains(link)) continue;

      try {
        await checkMember(link, memberName);
      } catch {
        renderError(link);
      }

      await sleep(REQUEST_DELAY_MS);
    }

    queueRunning = false;
  }

  function queueCheck(link) {
    if (link.getAttribute(CHECKED_ATTR) === 'true') return;
    link.setAttribute(CHECKED_ATTR, 'true');

    const memberName = link.dataset.memberName;
    const cached = getCachedCounts(memberName);
    if (cached) {
      renderCounts(link, cached);
      return;
    }

    queue.push({ link, memberName });
    runQueue();
  }

  function addTradeMatchingLinks() {
    const buttons = document.querySelectorAll('button[onclick*="CollectionCheckExp.cfm"][onclick*="Member="]');

    for (const button of buttons) {
      const row = button.closest('tr');
      if (!row) continue;

      const memberLink = row.querySelector('a[href^="/Profile.cfm/"], a[href^="https://www.tcdb.com/Profile.cfm/"]');
      if (!memberLink || memberLink.classList.contains(ADDED_CLASS)) continue;

      const memberName = memberLink.textContent.trim();
      if (!memberName) continue;

      const tradeLink = document.createElement('a');
      tradeLink.href = tradeMatchingUrl(memberName);
      tradeLink.textContent = 'TM';
      tradeLink.title = `Trade matching for ${memberName}`;
      tradeLink.className = ADDED_CLASS;
      tradeLink.dataset.memberName = memberName;
      tradeLink.style.marginLeft = '0.4em';
      tradeLink.style.fontSize = '0.85em';
      tradeLink.style.fontWeight = 'normal';
      tradeLink.style.whiteSpace = 'nowrap';

      memberLink.insertAdjacentText('afterend', ' ');
      memberLink.insertAdjacentElement('afterend', tradeLink);
    }
  }

  function queueChecksForExpandedSections() {
    for (const section of document.querySelectorAll('.collapse.show')) {
      for (const link of section.querySelectorAll(`.${ADDED_CLASS}`)) {
        queueCheck(link);
      }
    }
  }

  function watchSectionExpansion() {
    document.addEventListener('shown.bs.collapse', event => {
      const section = event.target;
      for (const link of section.querySelectorAll(`.${ADDED_CLASS}`)) {
        queueCheck(link);
      }
    });

    // Fallback in case Bootstrap's custom event is not available/does not fire.
    const observer = new MutationObserver(() => queueChecksForExpandedSections());
    for (const section of document.querySelectorAll('.collapse')) {
      observer.observe(section, { attributes: true, attributeFilter: ['class'] });
    }
  }

  function parseMedianPrice(html) {
    const match = html.match(/Med\.\s*Price:\s*<a\b[^>]*>\s*([^<]+?)\s*<\/a>/i)
      || html.match(/Med\.\s*Price:\s*([^<\n]+)/i);
    return match ? match[1].trim() : null;
  }

  function addMedianPricesToTradeMatchingPage() {
    const cardLinks = Array.from(document.querySelectorAll('a[href*="/ViewCard.cfm/"]'))
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

      const url = new URL(cardLink.getAttribute('href'), location.origin).href;
      const priceCacheKey = `tcdbMedianPrice:${url}`;
      const cached = getCachedPrice(priceCacheKey);
      if (cached) {
        renderMedianPrice(priceSpan, cached);
        continue;
      }

      chain = chain
        .then(() => fetchMedianPrice(url, priceCacheKey, priceSpan))
        .then(() => sleep(REQUEST_DELAY_MS));
    }
  }

  function getCachedPrice(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const cached = JSON.parse(raw);
      if (!cached || Date.now() - cached.time > CACHE_TTL_MS) return null;
      return cached.price;
    } catch {
      return null;
    }
  }

  function setCachedPrice(key, price) {
    try {
      localStorage.setItem(key, JSON.stringify({ time: Date.now(), price }));
    } catch {
      // Ignore storage failures.
    }
  }

  function renderMedianPrice(span, price) {
    span.textContent = ` Med: ${price || 'n/a'}`;
    span.title = price ? `Median price: ${price}` : 'Median price not found';
    span.style.color = price ? '#198754' : '#6c757d';
    span.style.fontWeight = price ? 'bold' : 'normal';
  }

  async function fetchMedianPrice(url, priceCacheKey, priceSpan) {
    try {
      const response = await fetch(url, { credentials: 'include', cache: 'force-cache' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const html = await response.text();
      const price = parseMedianPrice(html);
      setCachedPrice(priceCacheKey, price);
      renderMedianPrice(priceSpan, price);
    } catch {
      priceSpan.textContent = ' Med: !';
      priceSpan.title = 'Could not check median price';
      priceSpan.style.color = '#dc3545';
    }
  }

  if (location.pathname.includes('/CollectionCheck.cfm')) {
    addTradeMatchingLinks();
    watchSectionExpansion();
    queueChecksForExpandedSections();
  }

  if (location.pathname.includes('/TradeMatching.cfm') || location.pathname.includes('/YourTransactions.cfm')) {
    addMedianPricesToTradeMatchingPage();
  }
})();
