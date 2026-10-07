import { SerialQueue } from '../../core/queue';
import { tradeMatchingUrl } from '../../core/urls';
import { getCachedCounts, setCachedCounts } from './cache';
import { parseTradeMatchCounts } from './parser';
import { ADDED_CLASS, CELL_CLASS, renderChecking, renderCounts, renderError, WANT_LINK_CLASS } from './render';

const CHECKED_ATTR = 'data-tcdb-tm-check-queued';
const COLSPAN_ATTR = 'data-tcdb-tm-original-colspan';
const ADDED_COLUMNS = 2;
const REQUEST_DELAY_MS = 1500;
let watchingSectionExpansion = false;

const queue = new SerialQueue<{ link: HTMLAnchorElement; memberName: string }>(async ({ link, memberName }) => {
  if (!document.contains(link)) return;

  try {
    renderChecking(link);
    const response = await fetch(tradeMatchingUrl(memberName), { credentials: 'include', cache: 'force-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const counts = parseTradeMatchCounts(await response.text());
    setCachedCounts(memberName, counts);
    renderCounts(link, counts);
    sortSectionForLink(link);
  } catch {
    renderError(link);
  }
}, REQUEST_DELAY_MS);

export function enhanceCollectionCheckPage(): void {
  addTradeMatchingLinks();
  if (!watchingSectionExpansion) {
    watchSectionExpansion();
    watchingSectionExpansion = true;
  }
  queueChecksForExpandedSections();
}

export function removeTradeMatchingLinks(): void {
  document.querySelectorAll(`.${CELL_CLASS}`).forEach(cell => cell.remove());
  document.querySelectorAll<HTMLTableCellElement>(`td[${COLSPAN_ATTR}]`).forEach(cell => {
    cell.colSpan = Number(cell.getAttribute(COLSPAN_ATTR));
    cell.removeAttribute(COLSPAN_ATTR);
  });
}

function queueCheck(link: HTMLAnchorElement): void {
  if (link.getAttribute(CHECKED_ATTR) === 'true') return;
  link.setAttribute(CHECKED_ATTR, 'true');

  const memberName = link.dataset.memberName;
  if (!memberName) return;

  const cached = getCachedCounts(memberName);
  if (cached) {
    renderCounts(link, cached);
    sortSectionForLink(link);
    return;
  }

  queue.push({ link, memberName });
}

function addTradeMatchingLinks(): void {
  const buttons = document.querySelectorAll('button[onclick*="CollectionCheckExp.cfm"][onclick*="Member="]');

  for (const button of buttons) {
    const row = button.closest('tr');
    if (!row || row.querySelector(`.${CELL_CLASS}`)) continue;

    const memberLink = row.querySelector<HTMLAnchorElement>('a[href^="/Profile.cfm/"], a[href^="https://www.tcdb.com/Profile.cfm/"]');
    const memberName = memberLink?.textContent?.trim();
    if (!memberName) continue;

    const table = row.closest('table');
    if (table) addHeaderCells(table);

    const haveLink = createCountLink(memberName, ADDED_CLASS);
    haveLink.dataset.memberName = memberName;
    row.appendChild(createCountCell(haveLink));
    row.appendChild(createCountCell(createCountLink(memberName, WANT_LINK_CLASS)));

    const detailCell = row.nextElementSibling?.querySelector<HTMLTableCellElement>(':scope > td[colspan]');
    if (detailCell && !detailCell.hasAttribute(COLSPAN_ATTR)) {
      detailCell.setAttribute(COLSPAN_ATTR, String(detailCell.colSpan));
      detailCell.colSpan += ADDED_COLUMNS;
    }
  }
}

function addHeaderCells(table: HTMLTableElement): void {
  const headerRow = table.rows[0];
  if (!headerRow || headerRow.querySelector(`.${CELL_CLASS}`)) return;

  for (const label of ['My Wants They Have', 'Their Wants I Have']) {
    const cell = document.createElement('td');
    cell.className = CELL_CLASS;
    const strong = document.createElement('strong');
    strong.textContent = label;
    cell.appendChild(strong);
    headerRow.appendChild(cell);
  }
}

function createCountLink(memberName: string, className: string): HTMLAnchorElement {
  const link = document.createElement('a');
  link.href = tradeMatchingUrl(memberName);
  link.textContent = '–';
  link.title = `Trade matching for ${memberName}`;
  link.className = className;
  return link;
}

function createCountCell(link: HTMLAnchorElement): HTMLTableCellElement {
  const cell = document.createElement('td');
  cell.className = CELL_CLASS;
  cell.style.textAlign = 'center';
  cell.style.whiteSpace = 'nowrap';
  cell.appendChild(link);
  return cell;
}

function queueChecksForExpandedSections(): void {
  for (const section of document.querySelectorAll('.collapse.show')) {
    for (const link of section.querySelectorAll<HTMLAnchorElement>(`.${ADDED_CLASS}`)) queueCheck(link);
  }
}

function watchSectionExpansion(): void {
  document.addEventListener('shown.bs.collapse', event => {
    const section = event.target as Element;
    for (const link of section.querySelectorAll<HTMLAnchorElement>(`.${ADDED_CLASS}`)) queueCheck(link);
  });

  const observer = new MutationObserver(() => queueChecksForExpandedSections());
  for (const section of document.querySelectorAll('.collapse')) {
    observer.observe(section, { attributes: true, attributeFilter: ['class'] });
  }
}

function sortSectionForLink(link: HTMLAnchorElement): void {
  const section = link.closest('.collapse');
  const table = link.closest('table');
  if (!section || !table || !section.classList.contains('show')) return;

  const tbody = table.tBodies[0] || table;
  const rows = Array.from(tbody.rows);
  const headerRows: HTMLTableRowElement[] = [];
  const groups: Array<{ row: HTMLTableRowElement; detailRow: HTMLTableRowElement | null; originalIndex: number; saleTrade: number }> = [];

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const tradeLink = row.querySelector<HTMLAnchorElement>(`.${ADDED_CLASS}`);

    if (!tradeLink) {
      if (!row.querySelector('td[colspan]')) headerRows.push(row);
      continue;
    }

    const detailRow = rows[i + 1]?.querySelector('td[colspan]') ? rows[i + 1] : null;
    if (detailRow) i += 1;

    groups.push({ row, detailRow, originalIndex: groups.length, saleTrade: Number(tradeLink.dataset.saleTradeCount ?? -1) });
  }

  groups.sort((a, b) => b.saleTrade !== a.saleTrade ? b.saleTrade - a.saleTrade : a.originalIndex - b.originalIndex);

  for (const row of headerRows) tbody.appendChild(row);
  groups.forEach((group, index) => {
    const numberCell = group.row.cells[0];
    if (numberCell) numberCell.textContent = `${index + 1}.`;
    tbody.appendChild(group.row);
    if (group.detailRow) tbody.appendChild(group.detailRow);
  });
}
