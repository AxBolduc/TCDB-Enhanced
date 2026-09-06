# TCDB Enhanced

A modular userscript project for TCDB enhancements.

## Development

Install dependencies:

```bash
npm install
```

Start the local userscript dev server:

```bash
npm run dev
```

Install the dev userscript URL shown by Vite in your userscript manager once. After that, edit files under `src/` and refresh the TCDB page instead of copying/pasting the script.

## Build

```bash
npm run build
```

The installable single-file userscript is emitted to:

```txt
dist/tcdb-enhanced.user.js
```

## Test

```bash
npm test
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
