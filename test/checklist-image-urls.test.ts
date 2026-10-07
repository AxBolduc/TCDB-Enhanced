import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  collectChecklistImageUrls,
  enhanceChecklistImageUrls,
  removeChecklistImageUrls,
} from '../src/features/checklist-image-urls';

const fixture = readFileSync('test/fixtures/checklist.html', 'utf-8');
const withNextPage = fixture.replace(
  '</body>',
  '<ul class="pagination"><li><a href="?PageIndex=2">&rsaquo;</a></li></ul></body>',
);
const secondPage = fixture.replaceAll('Thumbs/Baseball/661316/661316_', 'Thumbs/Baseball/661316/661316_9');

describe('checklist image URLs', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = fixture;
    history.replaceState(null, '', '/Checklist.cfm/sid/661316/2026-Topps-Chrome-Big-Ticket-Players');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('adds one copy button beside the checklist options', () => {
    enhanceChecklistImageUrls();
    enhanceChecklistImageUrls();

    const buttons = document.querySelectorAll('[data-tcdb-copy-image-urls]');
    expect(buttons).toHaveLength(1);
    expect(buttons[0].nextElementSibling?.classList.contains('btn-group')).toBe(true);
  });

  it('can remove the button', () => {
    enhanceChecklistImageUrls();
    removeChecklistImageUrls();

    expect(document.querySelector('[data-tcdb-copy-image-urls]')).toBeNull();
  });

  it('collects the full-size image URLs used by the gallery', async () => {
    const urls = await collectChecklistImageUrls();

    expect(urls).toHaveLength(25);
    expect(urls[0]).toContain('/Images/Cards/Baseball/661316/661316-38488054Fr.jpg');
  });

  it('skips cards without images', async () => {
    document.documentElement.innerHTML = fixture.replace(
      '/Images/Thumbs/Baseball/661316/661316_38488054Thumb.jpg',
      '/Images/AddImage.gif',
    );

    expect(await collectChecklistImageUrls()).toHaveLength(24);
  });

  it('follows pagination to collect every page', async () => {
    document.documentElement.innerHTML = withNextPage;
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => secondPage });
    vi.stubGlobal('fetch', fetchMock);

    const urls = await collectChecklistImageUrls();

    expect(urls).toHaveLength(50);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('PageIndex=2'), { credentials: 'same-origin' });
  });

  it('starts from the first page when viewing a later page', async () => {
    history.replaceState(null, '', '/Checklist.cfm/sid/661316/2026-Topps-Chrome-Big-Ticket-Players?PageIndex=3');
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => fixture });
    vi.stubGlobal('fetch', fetchMock);

    await collectChecklistImageUrls();

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('PageIndex=1'), { credentials: 'same-origin' });
  });

  it('copies newline-separated URLs to the clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    enhanceChecklistImageUrls();

    document.querySelector<HTMLButtonElement>('[data-tcdb-copy-image-urls]')?.click();

    await vi.waitFor(() => expect(writeText).toHaveBeenCalled());
    const copied = writeText.mock.calls[0][0] as string;
    expect(copied.split('\n')).toHaveLength(25);
    expect(document.querySelector('[data-tcdb-copy-image-urls]')?.textContent).toBe('Copied 25 URLs');
  });
});
