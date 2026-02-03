import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-styled-components'],
        compact: false,
      },
    }),
    tsconfigPaths(),
    nodePolyfills({
      include: ['buffer', 'process', 'stream'],
    }),
  ],
  define: {
    global: 'globalThis',
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'build',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router'],
          blockchain: [
            '@mavrykdynamics/webmavryk',
            '@mavrykdynamics/webmavryk-rpc',
            '@mavrykdynamics/webmavryk-utils',
            '@mavrykdynamics/webmavryk-michel-codec',
          ],
          query: ['@tanstack/react-query', 'graphql-request', 'graphql'],
        },
      },
    },
  },
})
