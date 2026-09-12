import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initControlPanel } from '../src/features/control-panel';

describe('control panel', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
  });

  it('mounts once and opens from the launcher', async () => {
    initControlPanel();
    initControlPanel();

    const hosts = document.querySelectorAll('#tcdb-enhanced-control-panel');
    expect(hosts).toHaveLength(1);

    const shadow = hosts[0].shadowRoot;
    const launcher = shadow?.querySelector<HTMLButtonElement>('.launcher');
    const drawer = shadow?.querySelector<HTMLElement>('.drawer');

    launcher?.click();

    await vi.waitFor(() => {
      expect(launcher?.getAttribute('aria-expanded')).toBe('true');
      expect(drawer?.getAttribute('aria-hidden')).toBe('false');
    });
  });

  it('saves the trade matching links setting', () => {
    initControlPanel();

    const shadow = document.querySelector('#tcdb-enhanced-control-panel')?.shadowRoot;
    const toggle = shadow?.querySelector<HTMLInputElement>('.trade-matching-links-toggle');

    expect(toggle?.checked).toBe(true);
    toggle?.click();

    expect(localStorage.getItem('tcdb-enhanced:trade-matching-links-enabled')).toBe('false');
  });

  it('saves the median price setting', () => {
    initControlPanel();

    const shadow = document.querySelector('#tcdb-enhanced-control-panel')?.shadowRoot;
    const toggle = shadow?.querySelector<HTMLInputElement>('.median-price-toggle');

    expect(toggle?.checked).toBe(true);
    toggle?.click();

    expect(localStorage.getItem('tcdb-enhanced:median-price-enabled')).toBe('false');
  });

  it('saves the checklist gallery setting', () => {
    initControlPanel();

    const shadow = document.querySelector('#tcdb-enhanced-control-panel')?.shadowRoot;
    const toggle = shadow?.querySelector<HTMLInputElement>('.checklist-gallery-toggle');

    expect(toggle?.checked).toBe(true);
    toggle?.click();

    expect(localStorage.getItem('tcdb-enhanced:checklist-gallery-enabled')).toBe('false');
  });

  it('saves the compact gallery setting', () => {
    initControlPanel();

    const shadow = document.querySelector('#tcdb-enhanced-control-panel')?.shadowRoot;
    const toggle = shadow?.querySelector<HTMLInputElement>('.collection-gallery-toggle');

    expect(toggle?.checked).toBe(true);
    toggle?.click();

    expect(localStorage.getItem('tcdb-enhanced:collection-gallery-enabled')).toBe('false');
  });

  it('saves the gallery column count', () => {
    initControlPanel();

    const shadow = document.querySelector('#tcdb-enhanced-control-panel')?.shadowRoot;
    const input = shadow?.querySelector<HTMLInputElement>('.gallery-columns-input');

    expect(input?.value).toBe('5');
    if (input) {
      input.value = '7';
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    expect(localStorage.getItem('tcdb-enhanced:gallery-columns')).toBe('7');
  });

  it('saves the infinite gallery setting', () => {
    initControlPanel();

    const shadow = document.querySelector('#tcdb-enhanced-control-panel')?.shadowRoot;
    const toggle = shadow?.querySelector<HTMLInputElement>('.infinite-gallery-toggle');

    expect(toggle?.checked).toBe(true);
    toggle?.click();

    expect(localStorage.getItem('tcdb-enhanced:infinite-gallery-enabled')).toBe('false');
  });

  it('saves the eBay sold listings setting', () => {
    initControlPanel();

    const shadow = document.querySelector('#tcdb-enhanced-control-panel')?.shadowRoot;
    const toggle = shadow?.querySelector<HTMLInputElement>('.ebay-sold-listings-toggle');

    expect(toggle?.checked).toBe(true);
    toggle?.click();

    expect(localStorage.getItem('tcdb-enhanced:ebay-sold-listings-enabled')).toBe('false');
  });

  it('closes with Escape', async () => {
    initControlPanel();

    const shadow = document.querySelector('#tcdb-enhanced-control-panel')?.shadowRoot;
    const launcher = shadow?.querySelector<HTMLButtonElement>('.launcher');
    const drawer = shadow?.querySelector<HTMLElement>('.drawer');

    launcher?.click();
    await vi.waitFor(() => expect(launcher?.getAttribute('aria-expanded')).toBe('true'));
    shadow?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    await vi.waitFor(() => {
      expect(launcher?.getAttribute('aria-expanded')).toBe('false');
      expect(drawer?.getAttribute('aria-hidden')).toBe('true');
    });
  });
});
