<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    id: string;
    name: string;
    description: string;
    checked: boolean;
    inputClass?: string;
    onchange: (checked: boolean) => void;
    children?: Snippet;
  };

  let {
    id,
    name,
    description,
    checked,
    inputClass = '',
    onchange,
    children,
  }: Props = $props();

  function handleChange(event: Event): void {
    onchange((event.currentTarget as HTMLInputElement).checked);
  }
</script>

<div class="setting">
  <div class="setting-copy">
    <p class="setting-name" {id}>{name}</p>
    <p class="setting-description">{description}</p>
    {#if children}
      {@render children()}
    {/if}
  </div>
  <label class="toggle" aria-labelledby={id}>
    <input class={inputClass} type="checkbox" {checked} onchange={handleChange} />
    <span class="track" aria-hidden="true"></span>
  </label>
</div>

