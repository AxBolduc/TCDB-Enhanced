<script lang="ts">
  import { tick } from 'svelte';
  import ToggleSetting from '../../ui/ToggleSetting.svelte';
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

  let opened = $state(false);
  let tradeMatchingLinksEnabled = $state(isTradeMatchingLinksEnabled());
  let medianPriceEnabled = $state(isMedianPriceEnabled());
  let collectionGalleryEnabled = $state(isCollectionGalleryEnabled());
  let galleryColumns = $state(getGalleryColumns());
  let infiniteGalleryEnabled = $state(isInfiniteGalleryEnabled());
  let launcher: HTMLButtonElement;
  let closeButton: HTMLButtonElement;

  function open(): void {
    opened = true;
    void tick().then(() => closeButton.focus());
  }

  export function close(): void {
    if (!opened) return;
    opened = false;
    void tick().then(() => launcher.focus());
  }

  function updateTradeMatchingLinks(enabled: boolean): void {
    tradeMatchingLinksEnabled = enabled;
    setTradeMatchingLinksEnabled(enabled);
  }

  function updateMedianPrice(enabled: boolean): void {
    medianPriceEnabled = enabled;
    setMedianPriceEnabled(enabled);
  }

  function updateCollectionGallery(enabled: boolean): void {
    collectionGalleryEnabled = enabled;
    setCollectionGalleryEnabled(enabled);
  }

  function updateGalleryColumns(event: Event): void {
    setGalleryColumns(Number((event.currentTarget as HTMLInputElement).value));
    galleryColumns = getGalleryColumns();
  }

  function updateInfiniteGallery(enabled: boolean): void {
    infiniteGalleryEnabled = enabled;
    setInfiniteGalleryEnabled(enabled);
  }
</script>

<div class:open={opened} class="panel-root">
  <button
    bind:this={launcher}
    class="launcher"
    type="button"
    aria-label="Open TCDB Enhanced settings"
    aria-expanded={opened}
    aria-controls="tcdb-enhanced-drawer"
    onclick={open}
  >
    <svg aria-hidden="true" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"></path><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.5 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.5a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15.5 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.14.37.35.72.6 1 .3.28.68.42 1.1.4h.09a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.7.6Z"></path>
    </svg>
  </button>

  <button class="backdrop" type="button" aria-label="Close TCDB Enhanced settings" tabindex="-1" onclick={close}></button>

  <div
    class="drawer"
    id="tcdb-enhanced-drawer"
    role="dialog"
    aria-modal="true"
    aria-labelledby="tcdb-enhanced-title"
    aria-hidden={!opened}
  >
    <header class="header">
      <div>
        <p class="eyebrow">TCDB Enhanced</p>
        <h2 id="tcdb-enhanced-title">Settings</h2>
      </div>
      <button bind:this={closeButton} class="close" type="button" aria-label="Close settings" onclick={close}>
        <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M18 6 6 18M6 6l12 12"></path>
        </svg>
      </button>
    </header>
    <main class="content">
      <h3 class="section-title">Enhancements</h3>
      <div class="settings">
        <ToggleSetting
          id="trade-matching-links-label"
          name="Trade matching links"
          description="Add trade matching links and match counts beside members on collection check pages."
          checked={tradeMatchingLinksEnabled}
          inputClass="trade-matching-links-toggle"
          onchange={updateTradeMatchingLinks}
        />
        <ToggleSetting
          id="median-price-label"
          name="Median prices"
          description="Show card median prices on trade matching and transaction pages."
          checked={medianPriceEnabled}
          inputClass="median-price-toggle"
          onchange={updateMedianPrice}
        />
        <ToggleSetting
          id="collection-gallery-label"
          name="Compact collection gallery"
          description="Show card fronts in a compact grid with titles and prices."
          checked={collectionGalleryEnabled}
          inputClass="collection-gallery-toggle"
          onchange={updateCollectionGallery}
        >
          <div class="number-setting">
            <label for="gallery-columns">Columns</label>
            <input
              id="gallery-columns"
              class="gallery-columns-input"
              type="number"
              min="1"
              step="1"
              inputmode="numeric"
              value={galleryColumns}
              disabled={!collectionGalleryEnabled}
              onchange={updateGalleryColumns}
            />
          </div>
        </ToggleSetting>
        <ToggleSetting
          id="infinite-gallery-label"
          name="Infinite gallery loading"
          description="Load the next collection page as you scroll."
          checked={infiniteGalleryEnabled}
          inputClass="infinite-gallery-toggle"
          onchange={updateInfiniteGallery}
        />
      </div>
    </main>
    <footer class="footer">TCDB Enhanced</footer>
  </div>
</div>

