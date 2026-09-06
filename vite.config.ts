import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import monkey from 'vite-plugin-monkey';

const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf-8'),
) as { version: string };

export default defineConfig({
  plugins: [
    svelte(),
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: 'TCDB Enhanced',
        namespace: 'https://www.tcdb.com/',
        version: packageJson.version,
        description: 'Enhancements for TCDB collection, trade matching, and transaction pages.',
        author: 'You',
        updateURL: 'https://github.com/AxBolduc/TCDB-Enhanced/releases/latest/download/tcdb-enhanced.user.js',
        downloadURL: 'https://github.com/AxBolduc/TCDB-Enhanced/releases/latest/download/tcdb-enhanced.user.js',
        match: [
          '*://tcdb.com/*',
          '*://*.tcdb.com/*',
        ],
        grant: 'none',
      },
      build: {
        fileName: 'tcdb-enhanced.user.js',
      },
    }),
  ],
  resolve: {
    conditions: ['browser'],
  },
  test: {
    environment: 'jsdom',
  },
});
