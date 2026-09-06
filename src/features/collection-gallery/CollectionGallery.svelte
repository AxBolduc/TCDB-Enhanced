<script lang="ts">
  import { untrack } from 'svelte';
  import GalleryCard from './GalleryCard.svelte';
  import type { GalleryCardModel } from './types';

  let { initialCards }: { initialCards: GalleryCardModel[] } = $props();
  let cards = $state(untrack(() => [...initialCards]));

  export function appendCards(nextCards: GalleryCardModel[]): void {
    cards.push(...nextCards);
  }
</script>

<div class="gallery">
  {#each cards as card}
    <GalleryCard {card} />
  {/each}
</div>

<style>
  .gallery {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(var(--tcdb-gallery-columns, 5), minmax(0, 1fr));
    margin: 1rem 0 1.5rem;
  }

  :global([data-tcdb-gallery-sentinel]) {
    color: #64748b;
    font-size: 0.8rem;
    min-height: 1px;
    padding: 0.75rem;
    text-align: center;
  }

  @media (max-width: 400px) {
    .gallery { gap: 0.65rem; }
  }
</style>
