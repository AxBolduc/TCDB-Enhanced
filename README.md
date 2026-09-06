# TCDB Enhanced

A modular userscript project for TCDB enhancements.

## Install

[Click here to install the latest release](https://github.com/AxBolduc/TCDB-Enhanced/releases/latest/download/tcdb-enhanced.user.js)

## Development

Install dependencies with pnpm:

```bash
pnpm install
```

Start the local userscript dev server:

```bash
pnpm dev
```

Install the dev userscript URL shown by Vite in your userscript manager once. After that, edit files under `src/` and refresh the TCDB page instead of copying/pasting the script.

Run TypeScript and Svelte diagnostics before building:

```bash
pnpm check
```

## Build

```bash
pnpm build
```

The installable single-file userscript is emitted to:

```txt
dist/tcdb-enhanced.user.js
```

## Test

```bash
pnpm test
```

HTML page captures live in `test/fixtures/` and can be used for parser/DOM tests.

## UI architecture

Feature entry modules detect TCDB pages, parse the host DOM, and handle requests. Svelte components render the larger interfaces owned by this userscript, including the control panel and collection gallery. Small annotations inside TCDB markup remain plain TypeScript so they do not require a Svelte mount for every link or price.

The control panel mounts in a shadow root to prevent TCDB styles from leaking into it. Vite normally emits Svelte CSS into the page document, which cannot style a shadow root, so `control-panel.css` is imported with `?inline` and inserted into that root by `control-panel/index.ts`. Keep control-panel component styles in that file. Gallery components render in the page DOM and can use scoped `<style>` blocks normally.

`vite-plugin-monkey` bundles the Svelte runtime and generated CSS into `dist/tcdb-enhanced.user.js`. The built userscript has no CDN dependency, `@require`, or `@resource` entry.

## Structure

```txt
src/
  main.ts
  core/                         shared settings and page helpers
  ui/                           reusable Svelte controls
  features/
    collection-gallery/         TCDB parsing plus Svelte gallery components
    control-panel/              Svelte panel, shadow-root mount, and inline CSS
    median-prices/              lightweight TCDB DOM annotation
    trade-matching-links/       lightweight TCDB DOM annotation
```
