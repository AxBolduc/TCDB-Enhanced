<script lang="ts">
  import type { GalleryCardModel } from './types';

  let { card }: { card: GalleryCardModel } = $props();
  let showingBack = $state(false);
  let image = $derived(showingBack && card.back ? card.back : card.front);

  function flip(): void {
    if (!card.back) return;
    showingBack = !showingBack;
  }
</script>

<article data-tcdb-gallery-card="true">
  <a href={card.href} class="image-link">
    <img src={image.src} alt={image.alt} />
  </a>
  <div class="details">
    <a data-tcdb-card-title="true" href={card.href}>{card.title}</a>
    <div class="footer">
      <div data-tcdb-card-price="true">{card.price}</div>
      {#if card.back}
        <button
          type="button"
          class="tcdb-gallery-flip"
          title={showingBack ? 'Show front' : 'Show back'}
          aria-label={showingBack ? 'Show front' : 'Show back'}
          aria-pressed={showingBack}
          onclick={flip}
        >↻</button>
      {/if}
    </div>
  </div>
</article>

<style>
  article {
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;
    background: #fff;
    border: 1px solid #d2d2d2;
    border-radius: 0.5rem;
    box-shadow: 0 2px 6px rgb(0 0 0 / 12%);
  }

  .image-link {
    align-items: center;
    aspect-ratio: 2.5 / 3.5;
    background: #f4f4f4;
    display: flex;
    justify-content: center;
    padding: 0.35rem;
  }

  .image-link img {
    display: block;
    height: 100%;
    object-fit: contain;
    width: 100%;
  }

  .details {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 0.4rem;
    padding: 0.55rem 0.65rem 0.65rem;
  }

  [data-tcdb-card-title] {
    color: inherit;
    font-size: 0.8rem;
    font-weight: 600;
    line-height: 1.25;
    text-decoration: none;
  }

  [data-tcdb-card-title]:hover { text-decoration: underline; }

  .footer {
    align-items: center;
    display: flex;
    justify-content: space-between;
    min-height: 28px;
    margin-top: auto;
  }

  [data-tcdb-card-price] {
    color: #555;
    font-size: 0.8rem;
    font-weight: 700;
  }

  .tcdb-gallery-flip {
    align-items: center;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 0.3rem;
    color: #2563eb;
    cursor: pointer;
    display: inline-flex;
    font-size: 1rem;
    font-weight: 700;
    height: 28px;
    justify-content: center;
    line-height: 1;
    padding: 0;
    width: 28px;
  }

  .tcdb-gallery-flip:hover { background: #dbeafe; }
  .tcdb-gallery-flip:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; }
</style>
