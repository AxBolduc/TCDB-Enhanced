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

## Structure

```txt
src/
  main.ts
  core/                         shared helpers
  features/
    trade-matching-links/       current TCDB enhancement feature
```
