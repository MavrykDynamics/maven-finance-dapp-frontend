import { resolve } from 'path'
import { defineConfig, loadEnv, mergeConfig, type Plugin } from 'vite'
import { baseConfig } from './vite.base.config.mts'

// In dev, redirect the GraphQL client to the local proxy. Hasura's CORS
// allowlist only includes localhost:3000, so a direct fetch from the gov dev
// server (port 3001) hits "Failed to fetch" and QueryProvider escalates to a
// FatalError ("spaceship has encountered a bug"). The proxy below handles the
// outbound request server-side, sidestepping browser CORS.
//
// Implementation notes:
// - `import.meta.env.X` is processed by Vite's env-injection layer *before*
//   `define`, so `define` can't override it — a `transform` hook is required.
// - graphql-request validates the endpoint via `new URL(endpoint)`, which
//   rejects relative paths. The expression injected below resolves to an
//   absolute URL at runtime using the current page origin, which keeps the
//   port whatever the dev server is bound to.
const govDevEndpointPlugin = (graphqlPath: string): Plugin => ({
  name: 'gov-dev-graphql-endpoint',
  apply: 'serve',
  enforce: 'pre',
  transform(code, id) {
    if (!id.includes('/providers/QueryProvider/graphqlClient.')) return null
    if (!code.includes('import.meta.env.VITE_GRAPHQL_API')) return null
    const replacement = `(window.location.origin + ${JSON.stringify(graphqlPath)})`
    return {
      code: code.replace(/import\.meta\.env\.VITE_GRAPHQL_API/g, replacement),
      map: null,
    }
  },
})

export default defineConfig(({ command }) => {
  const env = loadEnv('', process.cwd(), '')
  const upstream = env.VITE_GRAPHQL_API || 'https://api.mavenfinance.io/v1/graphql'
  const upstreamUrl = new URL(upstream)
  const upstreamOrigin = `${upstreamUrl.protocol}//${upstreamUrl.host}`

  // The proxy preserves Hasura's path shape (`/v1/graphql`) so the upstream
  // sees exactly the same request as a direct call.
  const proxyPath = upstreamUrl.pathname || '/v1/graphql'

  return mergeConfig(
    baseConfig,
    defineConfig({
      define: {
        __APP_MODE__: JSON.stringify('gov'),
      },
      plugins: command === 'serve' ? [govDevEndpointPlugin(proxyPath)] : [],
      // Separate dep cache so gov and user servers don't race each other
      // when both are running simultaneously.
      cacheDir: 'node_modules/.vite-gov',
      server: {
        port: 3001,
        proxy: {
          [proxyPath]: {
            target: upstreamOrigin,
            changeOrigin: true,
            secure: true,
          },
        },
      },
      build: {
        outDir: 'build-gov',
        rollupOptions: {
          input: resolve(__dirname, 'index.gov.html'),
        },
      },
    }),
  )
})
