import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  enhanceChecklistGallery,
  restoreOriginalChecklist,
} from '../src/features/checklist-gallery';

const fixture = readFileSync('test/fixtures/checklist.html', 'utf-8');
const notesFixture = readFileSync('test/fixtures/checklist_with_notes.html', 'utf-8');

describe('checklist gallery', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = fixture;
    localStorage.clear();
  });

  it('turns checklist rows into an image-led gallery', () => {
    enhanceChecklistGallery();

    const gallery = document.querySelector('[data-tcdb-checklist-gallery]');
    const cards = gallery?.querySelectorAll('[data-tcdb-checklist-card]');
    const first = cards?.[0];

    expect(cards).toHaveLength(25);
    expect(first?.querySelector<HTMLImageElement>('img')?.src)
      .toContain('/Images/Cards/Baseball/661316/661316-38488054Fr.jpg');
    expect(first?.querySelector('[data-card-number]')?.textContent).toBe('BTP-1');
    expect(first?.querySelector<HTMLAnchorElement>('[data-card-name]')?.href).toContain('/Person.cfm/pid/37543/');
    expect(first?.querySelector<HTMLAnchorElement>('[data-card-team]')?.href).toContain('/Team.cfm/tid/14/');
  });

  it('keeps checklist flags and variation notes', () => {
    document.documentElement.innerHTML = fixture.replace(
      'Los Angeles Angels</a></td>',
      'Los Angeles Angels</a></td><td>SP, VAR</td><td>VAR: Image variation</td>',
    );

    enhanceChecklistGallery();

    const card = document.querySelector('[data-tcdb-checklist-card]');
    const flags = card?.querySelector('[data-card-flags]');
    const context = card?.querySelector('[data-card-context]');
    expect(flags?.textContent).toBe('SP, VAR');
    expect(flags?.previousElementSibling?.getAttribute('data-card-name')).not.toBeNull();
    expect(context?.textContent).toBe('VAR: Image variation');
  });

  it('separates every flag and context format in the notes fixture', () => {
    document.documentElement.innerHTML = notesFixture;
    enhanceChecklistGallery();

    const card = (number: string) => Array.from(document.querySelectorAll('[data-tcdb-checklist-card]'))
      .find(item => item.querySelector('[data-card-number]')?.textContent === number);

    expect(card('1b')?.querySelector('[data-card-flags]')?.textContent).toBe('SP, VAR');
    expect(card('1b')?.querySelector('[data-card-context]')?.textContent).toBe('VAR: Image variation');
    expect(card('1c')?.querySelector('[data-card-flags]')?.textContent).toBe('SSP, VAR');
    expect(card('1d')?.querySelector('[data-card-context]')?.textContent).toBe('VAR: Award winners');
    expect(card('6')?.querySelector('[data-card-flags]')?.textContent).toBe('RC');
    expect(card('52')?.querySelector('[data-card-flags]')?.textContent).toBe('ASR');
  });

  it('shows a neutral placeholder when TCDB has no card image', () => {
    document.documentElement.innerHTML = fixture.replace(
      '/Images/Thumbs/Baseball/661316/661316_38488054Thumb.jpg',
      '/Images/AddImage.gif',
    );

    enhanceChecklistGallery();

    const first = document.querySelector('[data-tcdb-checklist-card]');
    expect(first?.querySelector('[data-no-image]')?.textContent).toBe('No Image');
    expect(first?.querySelector('img')).toBeNull();
  });

  it('restores the checklist table when disabled', () => {
    enhanceChecklistGallery();
    restoreOriginalChecklist();

    expect(document.querySelector<HTMLElement>('[data-tcdb-checklist-gallery]')?.hidden).toBe(true);
    expect(document.querySelector<HTMLElement>('[data-tcdb-original-checklist]')?.hidden).toBe(false);
  });

  it('does not render twice', () => {
    enhanceChecklistGallery();
    enhanceChecklistGallery();

    expect(document.querySelectorAll('[data-tcdb-checklist-gallery]')).toHaveLength(1);
  });
});
