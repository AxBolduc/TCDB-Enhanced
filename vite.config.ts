import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: 'TCDB Enhanced',
        namespace: 'https://www.tcdb.com/',
        version: '0.1.0',
        description: 'Enhancements for TCDB collection, trade matching, and transaction pages.',
        author: 'You',
        match: [
          'https://www.tcdb.com/CollectionCheck.cfm*',
          'http://www.tcdb.com/CollectionCheck.cfm*',
          'https://www.tcdb.com/TradeMatching.cfm*',
          'http://www.tcdb.com/TradeMatching.cfm*',
          'https://www.tcdb.com/YourTransactions.cfm*',
          'http://www.tcdb.com/YourTransactions.cfm*',
        ],
        grant: 'none',
      },
      build: {
        fileName: 'tcdb-enhanced.user.js',
      },
    }),
  ],
  test: {
    environment: 'jsdom',
  },
});
