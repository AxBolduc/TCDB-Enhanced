<script lang="ts">
  export type ChecklistCard = {
    cardHref: string;
    imageSrc: string;
    number: string;
    name: string;
    nameHref: string;
    team: string;
    teamHref: string;
    flags: string;
    context: string;
  };

  import { untrack } from 'svelte';

  let { initialCards }: { initialCards: ChecklistCard[] } = $props();
  let cards = $state(untrack(() => [...initialCards]));

  export function appendCards(nextCards: ChecklistCard[]): void {
    cards.push(...nextCards);
  }
</script>

<div class="gallery">
  {#each cards as card}
    <article data-tcdb-checklist-card="true">
      <a class="art" href={card.cardHref} aria-label={`View ${card.number} ${card.name}`}>
        {#if card.imageSrc}
          <img loading="lazy" src={card.imageSrc} alt={`${card.number} ${card.name}`} />
        {:else}
          <span class="no-image" data-no-image>No Image</span>
        {/if}
      </a>
      <div class="details">
        <a class="number" data-card-number href={card.cardHref}>{card.number}</a>
        <span class="name-line">
          <a class="name" data-card-name href={card.nameHref}>{card.name}</a>
          {#if card.flags}<span class="flags" data-card-flags>{card.flags}</span>{/if}
        </span>
        <a class="team" data-card-team href={card.teamHref}>{card.team}</a>
        {#if card.context}
          <p class="context" data-card-context>{card.context}</p>
        {/if}
      </div>
    </article>
  {/each}
</div>

<style>
  .gallery {
    display: grid;
    gap: 1.25rem 1rem;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    margin: 1rem 0 1.5rem;
  }

  :global([data-tcdb-checklist-sentinel]) {
    color: #64748b;
    font-size: 0.8rem;
    min-height: 1px;
    padding: 0.75rem;
    text-align: center;
  }

  article { min-width: 0; }

  .art {
    align-items: center;
    aspect-ratio: 2.5 / 3.5;
    background: #eef1f1;
    border-radius: 0.35rem;
    box-shadow: 0 2px 7px rgb(0 0 0 / 20%);
    display: flex;
    justify-content: center;
    overflow: hidden;
  }

  .art img {
    display: block;
    height: 100%;
    object-fit: contain;
    transition: transform 150ms ease;
    width: 100%;
  }

  .art:hover img { transform: scale(1.025); }
  .art:focus-visible { outline: 3px solid #2563eb; outline-offset: 3px; }
  .no-image { color: #667; font-size: 0.85rem; font-weight: 600; }

  .details {
    display: grid;
    gap: 0.1rem 0.45rem;
    grid-template-columns: auto minmax(0, 1fr);
    line-height: 1.25;
    padding: 0.5rem 0.15rem 0;
  }

  .details a { text-decoration: none; }
  .details a:hover { text-decoration: underline; }
  .number { font-size: 0.75rem; font-weight: 700; grid-row: 1 / 3; }
  .name-line { align-items: baseline; display: flex; gap: 0.35rem; min-width: 0; }
  .name { font-size: 0.82rem; font-weight: 600; overflow: hidden; text-overflow: ellipsis; }
  .flags { color: #8a4b13; flex: none; font-size: 0.68rem; font-weight: 700; }
  .team { color: #667; font-size: 0.72rem; overflow: hidden; text-overflow: ellipsis; }
  .context {
    color: #555;
    font-size: 0.7rem;
    grid-column: 1 / -1;
    margin: 0.25rem 0 0;
    white-space: normal;
  }

  @media (max-width: 500px) {
    .gallery { gap: 1rem 0.65rem; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
</style>
