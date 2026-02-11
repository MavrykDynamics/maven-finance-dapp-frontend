import { resolve } from 'path'
import { defineConfig, mergeConfig } from 'vite'
import { baseConfig } from './vite.base.config.mts'

export default mergeConfig(
  baseConfig,
  defineConfig({
    define: {
      __APP_MODE__: JSON.stringify('gov'),
    },
    server: {
      port: 3001,
    },
    build: {
      outDir: 'build-gov',
      rollupOptions: {
        input: resolve(__dirname, 'index.gov.html'),
      },
    },
  }),
)
