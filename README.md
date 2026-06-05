# Maven Finance — DApp Frontend

Monorepo containing two separately deployed web apps built from a single codebase:

| App | Description | Default port |
|---|---|---|
| **Maven Finance** (User App) | Lending, borrowing, staking, farming, vaults | `3000` |
| **Maven Governance** (Gov App) | Governance proposals, satellite management, treasury, council | `3001` |

**Stack:** TypeScript · React 18 · Vite 6 · React Router v7 (SPA mode) · TanStack Query v5 · Styled Components · WebMavryk · Mavlet wallet

---

## Prerequisites

- Node.js ≥ 18
- Yarn 1.x (`npm install -g yarn`)
- A `.env.local` file in `src/frontend/` (copy from `src/frontend/.env.example`)

---

## Quick Start

```bash
# 1. Install dependencies
cd src/frontend
yarn install

# 2. Copy env file and fill in values
cp .env.example .env.local
# Edit .env.local — minimum required: VITE_GRAPHQL_API, VITE_TZKT_API

# 3. Start the User App
yarn start          # http://localhost:3000

# Or start the Gov App
yarn start:gov      # http://localhost:3001
```

---

## Running Both Apps Simultaneously

The two apps use **separate Vite dep caches** (`.vite/` and `.vite-gov/`) so they can run side by side without cache conflicts.

```bash
# Terminal 1 — User App on port 3000
cd src/frontend && yarn start:user

# Terminal 2 — Gov App on port 3001
cd src/frontend && yarn start:gov
```

> **First-run tip:** Let both servers fully start before opening the browser. Vite pre-bundles dependencies on the first load; navigating before that finishes causes a stale-chunk error that requires a hard refresh. Wait for `VITE vX.X.X  ready in Xms` in both terminals.

### Running the Gov App on port 3000 (standalone)

```bash
cd src/frontend && yarn start:gov --port 3000
```

The GraphQL proxy in `vite.gov.config.mts` uses `window.location.origin` so it adapts automatically to any port.

---

## All Dev Scripts

Run from `src/frontend/`:

```bash
yarn start            # User App on :3000 (alias for start:user)
yarn start:user       # User App on :3000
yarn start:gov        # Gov App on :3001

yarn build            # Build User App  → build-user/
yarn build:user       # Build User App  → build-user/
yarn build:gov        # Build Gov App   → build-gov/
yarn build:all        # Build both apps sequentially

yarn test             # Unit tests (Jest + React Testing Library)
yarn cypress:open     # E2E tests (interactive)
yarn cypress:run      # E2E tests (headless)

yarn codegen          # Regenerate GraphQL TypeScript types
yarn import-contracts # Sync contract addresses from ../contracts/
```

---

## Environment Variables

Copy `src/frontend/.env.example` → `src/frontend/.env.local` and set:

| Variable | Description | Example |
|---|---|---|
| `VITE_NETWORK` | Mavryk network | `atlasnet` or `mainnet` |
| `VITE_ENV` | Working environment | `dev` or `prod` |
| `VITE_DATA_ENV` | Data loading environment | `dev` or `prod` |
| `VITE_GRAPHQL_API` | Hasura GraphQL endpoint | `https://api.mavenfinance.io/v1/graphql` |
| `VITE_TZKT_API` | Mavryk network API base URL | `https://atlasnet.api.mavryk.network/v1/` |
| `VITE_TZKT_LINK` | Block explorer link base URL | `https://atlasnet.tzkt.io` |
| `VITE_NAME` | Project name | `MAVEN` |
| `VITE_RECAPTCHA_SITE_KEY` | Google reCAPTCHA v3 key | — |
| `VITE_MAINTANCE_MODE` | Maintenance mode toggle | `off` |
| `VITE_IPFS_API_KEY` | IPFS API key (encrypted, skip locally) | — |
| `VITE_IPFS_PROJECT_ID` | IPFS project ID (encrypted, skip locally) | — |

> **Testnet vs mainnet:** The default `.env.example` targets atlasnet. For mainnet, change `VITE_NETWORK=mainnet` and point `VITE_GRAPHQL_API` / `VITE_TZKT_API` at the mainnet endpoints.

---

## Architecture

### Dual-App Structure

Both apps live in the same codebase. A Vite `define` global `__APP_MODE__` (`'user'` | `'gov'`) controls which provider trees and route sets are bundled at build time — unused code is tree-shaken entirely.

```
src/frontend/
  vite.base.config.mts       # Shared Vite config (plugins, chunks, dep pre-bundling)
  vite.user.config.mts       # User App: port 3000, build-user/, __APP_MODE__='user'
  vite.gov.config.mts        # Gov App: port 3001, build-gov/, __APP_MODE__='gov', GraphQL proxy

  index.html                 # Legacy entry (do not use for new dev)
  index.user.html            # User App entry point
  index.gov.html             # Gov App entry point

  src/
    index.tsx                # Root entry — early mobile bail-out, lazy-loads DesktopApp
    DesktopApp.tsx           # Provider tree switch (user vs gov), app shell
    app/App.components/AppRoutes/
      AppRoutes.user.tsx     # User App route tree
      AppRoutes.gov.tsx      # Gov App route tree
    providers/
      DappSectionsProviders.user.tsx   # User-only providers (Loans, Vaults, Farms, Doorman)
      DappSectionsProviders.gov.tsx    # Gov-only providers (Proposals, Council, Treasury, Vesting)
```

### Shared Pages (both apps)

Satellites, satellite details, data feeds, feed details, emergency governance, contract status, become-a-satellite — identical route definitions in both route trees.

### GraphQL / CORS in Dev

Hasura only allows `localhost:3000`. When the gov dev server runs on port 3001, direct GraphQL calls are blocked by CORS. `vite.gov.config.mts` solves this by:

1. Proxying `VITE_GRAPHQL_API` requests through the Vite dev server
2. Injecting a Vite transform plugin that rewrites the GraphQL endpoint URL in the `graphqlClient` module to `window.location.origin + '/v1/graphql'` (dev only)

**Production builds are unaffected** — the proxy plugin only applies during `serve`.

### Dep Cache Isolation

Running both dev servers simultaneously previously caused cache-invalidation races. Each server now uses its own cache:

- User App → `node_modules/.vite/`
- Gov App → `node_modules/.vite-gov/`

---

## Cloudflare Pages Deployment

The repo connects to **two separate Cloudflare Pages projects** — one per app — both pointing at the same GitHub repository.

### Setup (one-time per project)

1. In Cloudflare Pages → **Create a project** → Connect to Git → select this repo
2. Configure build settings:

**User App project:**
| Setting | Value |
|---|---|
| Build command | `cd src/frontend && yarn install && yarn build:user` |
| Build output directory | `src/frontend/build-user` |
| Root directory | `/` (repo root) |

**Gov App project:**
| Setting | Value |
|---|---|
| Build command | `cd src/frontend && yarn install && yarn build:gov` |
| Build output directory | `src/frontend/build-gov` |
| Root directory | `/` (repo root) |

3. Add all environment variables from `.env.example` in **Settings → Environment variables** for each project. Use different values per environment (Preview vs Production).

### Path-Based Build Triggers (skip unnecessary rebuilds)

To avoid rebuilding the user app when only gov files changed (and vice versa), add **Included paths** filters in each project's build settings:

**User App — only rebuild when these paths change:**
```
src/frontend/src/pages/Dashboard/**
src/frontend/src/pages/Loans/**
src/frontend/src/pages/Vaults/**
src/frontend/src/pages/Farms/**
src/frontend/src/pages/Staking/**
src/frontend/src/providers/LoansProvider/**
src/frontend/src/providers/VaultsProvider/**
src/frontend/src/providers/DoormanProvider/**
src/frontend/src/providers/FarmsProvider/**
src/frontend/src/app/**
src/frontend/src/styles/**
src/frontend/vite.user.config.mts
src/frontend/vite.base.config.mts
src/frontend/index.user.html
src/frontend/package.json
```

**Gov App — only rebuild when these paths change:**
```
src/frontend/src/pages/Governance/**
src/frontend/src/pages/Council/**
src/frontend/src/pages/Treasury/**
src/frontend/src/pages/EmergencyGovernance/**
src/frontend/src/providers/ProposalsProvider/**
src/frontend/src/providers/CouncilProvider/**
src/frontend/src/providers/TreasuryProvider/**
src/frontend/src/providers/VestingProvider/**
src/frontend/src/app/**
src/frontend/src/styles/**
src/frontend/vite.gov.config.mts
src/frontend/vite.base.config.mts
src/frontend/index.gov.html
src/frontend/package.json
```

> Shared files (`src/app/**`, `src/styles/**`, `package.json`, `vite.base.config.mts`) are listed in both so changes to shared code trigger both builds.

### SPA Routing

Both apps are SPAs with client-side routing. Add a `_redirects` file to handle page refreshes and direct URL access:

Create `src/frontend/public/_redirects`:
```
/* /index.html 200
```

Cloudflare Pages serves `_redirects` from the build output directory automatically.

---

## Key Decisions

| Decision | Rationale |
|---|---|
| Two Vite configs, one repo | Shared pages and components stay DRY; no npm-package release cycle friction |
| `__APP_MODE__` define global | Tree-shaking at build time — gov providers don't ship to user app and vice versa |
| TanStack Query (not Apollo) | Apollo's cache was fully bypassed (`network-only`); custom 182-line hook reimplemented TanStack's built-ins; ~20KB bundle savings |
| React Router v7 SPA mode | Non-breaking upgrade from v6; better types and lazy loading; NOT framework mode (no SSR — wallet SDK is browser-only) |
| Early mobile bail-out | `index.html` inline script sets `window.__IS_MOBILE`; entry chunk is ~3KB; desktop providers don't ship to mobile |
| Gov proxy for CORS | Hasura only allows `localhost:3000`; dev proxy sidesteps CORS without changing Hasura config |
| Separate Vite dep caches | Prevents cache-invalidation race when both apps run simultaneously |

---

## Project Structure

```
maven-finance-dapp-frontend/
  src/
    frontend/               # All app code lives here
      src/
        app/
          App.components/   # 43+ shared UI components
          App.hooks/        # Shared hooks
        pages/              # Feature pages (25+) — controller/view/style pattern
        providers/          # Domain Context providers (data fetching, state)
        gql/queries/        # GraphQL query definitions
        utils/              # Helpers, calculators, validators
        styles/             # Theme, global styles, constants
        deployments/        # Contract address JSON files
      public/               # Static assets, _redirects
      vite.*.config.mts     # Vite configs
      index.*.html          # App entry HTML files
  README.md
  CLAUDE.md                 # AI assistant context
```

---

## Troubleshooting

**White screen on first load after starting dev server**

Vite pre-bundles dependencies on the first page load. If you navigate before it finishes, you get a stale-chunk error. Wait for both `ready in Xms` messages, then hard-refresh (`Cmd+Shift+R`).

**Gov App CORS error in the browser console**

The proxy only activates via `vite.gov.config.mts`. Make sure you started the gov server with `yarn start:gov` (not `yarn start`). Also confirm `VITE_GRAPHQL_API` is set in `.env.local`.

**GraphQL codegen fails**

The codegen requires a running Hasura instance to introspect the schema. It's optional for local dev — the build proceeds without it. Run `yarn codegen` only when you need to regenerate types after a schema change.

**`useVaultsContext export is incompatible` in Vite HMR**

Occasional HMR warning when editing vault-related files. The app still works; Vite falls back to a full module reload. Hard-refresh the page to clear any stale state.
