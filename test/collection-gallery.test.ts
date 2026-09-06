import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  enhanceCollectionGallery,
  restoreOriginalCollectionGallery,
} from '../src/features/collection-gallery';

const fixture = readFileSync('test/fixtures/view_collection_gallery.html', 'utf-8');

describe('collection gallery', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = fixture;
  });

  it('replaces the two-sided tables with compact cards', () => {
    enhanceCollectionGallery();

    const gallery = document.querySelector('[data-tcdb-enhanced-gallery]');
    const cards = gallery?.querySelectorAll('[data-tcdb-gallery-card]');

    expect(cards).toHaveLength(10);
    expect(cards?.[0].querySelector('img')?.getAttribute('alt')).toContain('Front');
    expect(gallery?.querySelector('img[alt$="Back"]')).toBeNull();
    expect(cards?.[0].querySelector('[data-tcdb-card-title]')?.textContent)
      .toContain('2024 Topps #90 Oneil Cruz');
    expect(cards?.[0].querySelector('[data-tcdb-card-price]')?.textContent.trim())
      .toBe('$0.20');
  });

  it('switches between the front and back image', () => {
    enhanceCollectionGallery();

    const card = document.querySelector<HTMLElement>('[data-tcdb-gallery-card]');
    const image = card?.querySelector<HTMLImageElement>('img');
    const button = card?.querySelector<HTMLButtonElement>('.tcdb-gallery-flip');

    button?.click();
    expect(image?.alt).toContain('Back');
    expect(button?.getAttribute('aria-label')).toBe('Show front');
    expect(button?.getAttribute('aria-pressed')).toBe('true');

    button?.click();
    expect(image?.alt).toContain('Front');
    expect(button?.getAttribute('aria-label')).toBe('Show back');
    expect(button?.getAttribute('aria-pressed')).toBe('false');
  });

  it('restores the original gallery when disabled', () => {
    enhanceCollectionGallery();
    restoreOriginalCollectionGallery();

    expect(document.querySelector<HTMLElement>('[data-tcdb-enhanced-gallery]')?.hidden).toBe(true);
    expect(document.querySelector<HTMLElement>('[data-tcdb-original-gallery-card]')?.hidden).toBe(false);
  });

  it('does not render the gallery twice', () => {
    enhanceCollectionGallery();
    enhanceCollectionGallery();

    expect(document.querySelectorAll('[data-tcdb-enhanced-gallery]')).toHaveLength(1);
  });
});
