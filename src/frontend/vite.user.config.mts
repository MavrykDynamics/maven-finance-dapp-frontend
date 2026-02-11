import { resolve } from 'path'
import { defineConfig, mergeConfig } from 'vite'
import { baseConfig } from './vite.base.config.mts'

export default mergeConfig(
  baseConfig,
  defineConfig({
    define: {
      __APP_MODE__: JSON.stringify('user'),
    },
    server: {
      port: 3000,
    },
    build: {
      outDir: 'build-user',
      rollupOptions: {
        input: resolve(__dirname, 'index.user.html'),
      },
    },
  }),
)
