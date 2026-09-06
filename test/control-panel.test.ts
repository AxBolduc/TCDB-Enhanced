import { beforeEach, describe, expect, it } from 'vitest';
import { initControlPanel } from '../src/features/control-panel';

describe('control panel', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
  });

  it('mounts once and opens from the launcher', () => {
    initControlPanel();
    initControlPanel();

    const hosts = document.querySelectorAll('#tcdb-enhanced-control-panel');
    expect(hosts).toHaveLength(1);

    const shadow = hosts[0].shadowRoot;
    const launcher = shadow?.querySelector<HTMLButtonElement>('.launcher');
    const drawer = shadow?.querySelector<HTMLElement>('.drawer');

    launcher?.click();

    expect(launcher?.getAttribute('aria-expanded')).toBe('true');
    expect(drawer?.getAttribute('aria-hidden')).toBe('false');
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

  it('saves the compact gallery setting', () => {
    initControlPanel();

    const shadow = document.querySelector('#tcdb-enhanced-control-panel')?.shadowRoot;
    const toggle = shadow?.querySelector<HTMLInputElement>('.collection-gallery-toggle');

    expect(toggle?.checked).toBe(true);
    toggle?.click();

    expect(localStorage.getItem('tcdb-enhanced:collection-gallery-enabled')).toBe('false');
  });

  it('saves the infinite gallery setting', () => {
    initControlPanel();

    const shadow = document.querySelector('#tcdb-enhanced-control-panel')?.shadowRoot;
    const toggle = shadow?.querySelector<HTMLInputElement>('.infinite-gallery-toggle');

    expect(toggle?.checked).toBe(true);
    toggle?.click();

    expect(localStorage.getItem('tcdb-enhanced:infinite-gallery-enabled')).toBe('false');
  });

  it('closes with Escape', () => {
    initControlPanel();

    const shadow = document.querySelector('#tcdb-enhanced-control-panel')?.shadowRoot;
    const launcher = shadow?.querySelector<HTMLButtonElement>('.launcher');
    const drawer = shadow?.querySelector<HTMLElement>('.drawer');

    launcher?.click();
    shadow?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(launcher?.getAttribute('aria-expanded')).toBe('false');
    expect(drawer?.getAttribute('aria-hidden')).toBe('true');
  });
});
