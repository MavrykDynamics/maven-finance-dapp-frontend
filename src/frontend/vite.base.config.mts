import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

/**
 * Shared Vite configuration for both user and governance apps.
 * App-specific configs (vite.user.config.mts, vite.gov.config.mts) extend this.
 */
export const baseConfig = defineConfig({
  // Pre-declare polyfill shims so Vite bundles them in the initial dep
  // optimization pass rather than discovering them mid-load and triggering
  // a re-optimization that invalidates in-flight chunk requests.
  optimizeDeps: {
    include: [
      'vite-plugin-node-polyfills/shims/buffer',
      'vite-plugin-node-polyfills/shims/global',
      'vite-plugin-node-polyfills/shims/process',
    ],
  },
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
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router'],
          blockchain: [
            '@mavrykdynamics/webmavryk',
            '@mavrykdynamics/webmavryk-rpc',
            '@mavrykdynamics/webmavryk-utils',
            '@mavrykdynamics/webmavryk-michel-codec',
            '@mavrykdynamics/webmavryk-http-utils',
            '@mavrykdynamics/webmavryk-mavlet-wallet',
            '@mavrykdynamics/mavlet-dapp',
          ],
          query: ['@tanstack/react-query', 'graphql-request', 'graphql'],
          styling: ['styled-components', 'stylis'],
          charts: ['lightweight-charts', 'react-minimal-pie-chart'],
          ui: ['react-select', '@floating-ui/react', 'react-collapsed', 'embla-carousel-react'],
          ipfs: ['ipfs-http-client', 'is-ipfs'],
          realtime: ['@microsoft/signalr'],
        },
      },
    },
  },
})
