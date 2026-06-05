# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mavryk Finance is a decentralized finance (DeFi) dApp frontend built on the Mavryk blockchain. It provides governance, farming, lending/borrowing, treasury, oracle data feeds, and satellite node management.

**Documentation:** https://docs.mavenfinance.io/

## Monorepo Structure

This is a Lerna monorepo with the main application at `src/frontend/`. All development happens in that directory.

## Common Commands

All commands below run from `src/frontend/`:

```bash
# Install dependencies
yarn install

# Start development server (port 3000)
yarn start

# Production build
yarn build

# Run unit tests (Jest + React Testing Library)
yarn test

# Run a single test file
yarn test -- --testPathPattern=<pattern>

# E2E tests (Cypress)
yarn cypress:open    # Interactive
yarn cypress:run     # Headless

# Regenerate GraphQL types
yarn codegen

# Import contract addresses from contracts package
yarn import-contracts

# Root-level formatting check
yarn prettier   # (from repo root)
```

## Architecture

### Component Pattern
Pages follow a controller-view-style pattern:
- `*.controller.tsx` — Container with business logic, consumes Context providers
- `*.view.tsx` / `*.component.tsx` — Presentational component
- `*.style.tsx` — Styled Components definitions

### State Management
React Context providers + TanStack Query. Each domain (wallet, tokens, farms, loans, vaults, etc.) has a Context provider in `src/providers/` that manages its own state and exposes it via hooks (e.g., `useFarmsContext()`, `useLoansContext()`). Redux has been fully removed.

### Key Directories (under `src/frontend/src/`)
- `app/App.components/` — Shared UI components (43+): buttons, modals, tables, menus, wallet connection
- `pages/` — Feature pages (25+), each with controller/view/style files
- `providers/` — Domain-specific React Context providers (DappConfig, Tokens, User, Farms, Loans, Vaults, etc.)
- `gql/queries/` — GraphQL query definitions; types auto-generated via codegen to `utils/generated/`
- `utils/` — Helpers (API, calculations, validators, time, parsing)
- `utils/TypesAndInterfaces/` — Shared TypeScript interfaces
- `deployments/` — JSON files mapping contract names to on-chain addresses
- `styles/` — Centralized theme: colors, global styles, constants

### Blockchain Integration
- **WebMavryk** (`@mavrykdynamics/webmavryk`) for Mavryk smart contract interactions
- **Mavlet** (`@mavrykdynamics/mavlet-dapp`) for wallet connections
- Contract addresses loaded from `src/deployments/*.json`
- Network configured via `VITE_NETWORK` env var (default: atlasnet)

### Mavryk Network API
- **Mainnet:** `https://api.mavryk.network/v1/` (Swagger: `https://api.mavryk.network/v1/swagger.json`)
- **Atlasnet (testnet):** `https://atlasnet.api.mavryk.network/v1/`
- Use the Mavryk API for all blockchain data (delegates, balances, accounts, etc.)
- **Do NOT use TzKT** (`api.tzkt.io`) — that is for Tezos, not Mavryk
- **Terminology:** On Mavryk, block producers are called "validators" in the public-facing UI (the API/docs may still call them "bakers" or "delegates")

### Build Tooling
- **Vite** (`vite.config.mts`) with `@vitejs/plugin-react`, `vite-tsconfig-paths`, `vite-plugin-node-polyfills`
- Dev server starts in ~166ms on port 3000; production builds in ~11s
- Manual chunk splitting: vendor (react/react-dom/react-router), blockchain (webmavryk), query (tanstack/graphql)
- Node polyfills for `buffer`, `process`, `stream` (blockchain libs need these)

### Routing
React Router v7 (SPA mode) in `app/App.components/AppRoutes/`. Some routes use `<ProtectedRoute>` requiring wallet connection or satellite status.

### Data Fetching
- **TanStack Query v5** (`@tanstack/react-query`) for all data fetching with automatic caching, refetching, and devtools
- **graphql-request** for GraphQL HTTP requests to Hasura endpoint (`VITE_GRAPHQL_API`)
- **graphql-tag** for dynamic GraphQL query strings (used alongside codegen's typed `gql`)
- Types auto-generated via `graphql-codegen` to `utils/__generated__/`
- Key files:
  - `src/providers/QueryProvider/queryClient.ts` — QueryClient config (60s default refetch, 30s staleTime)
  - `src/providers/QueryProvider/graphqlClient.ts` — graphql-request client
  - `src/providers/QueryProvider/useGraphQLQuery.ts` — hooks: `useGraphQLQuery` (60s poll), `useGraphQLQueryOnce` (no poll, 5min cache), `fetchGraphQLData`, `useInvalidateAllQueries`; cache presets: `CACHE_STATIC` (5min), `CACHE_SEMI_STATIC` (60s), `CACHE_DYNAMIC` (30s), `CACHE_NONE`
  - `src/providers/QueryProvider/query.provider.tsx` — QueryProvider with error handling

## Completed Work

### Frontend Optimization (`feat/frontend-optimization`)
Phases 1-7 completed: route-based code splitting, provider memoization, Apollo→TanStack Query migration, dead code removal, React.memo on view components, shared token approval utilities, package cleanup.

### Vite Migration & Router v7 (`feat/vite-migration-and-router-v7`)
CRA→Vite migration (commit `48283d259`) and React Router v6→v7 upgrade (commit `c73d374db`). All `REACT_APP_*` env vars migrated to `VITE_*`. Build tooling is Vite 6.x.

### App Split — User App + Governance App (`feat/app-split`) ✅ IN PROGRESS
**Plan:** `.claude/plans/app-split-user-governance.md`

**Completed on this branch:**
- Dual Vite configs (`vite.user.config.mts`, `vite.gov.config.mts`) — User App port 3000, Gov App port 3001
- Separate dep caches (`.vite/` vs `.vite-gov/`) so both dev servers run simultaneously without cache conflicts
- GraphQL CORS proxy in gov dev server (Hasura only allows localhost:3000)
- Dual route trees (`AppRoutes.user.tsx`, `AppRoutes.gov.tsx`), dual provider trees (`DappSectionsProviders.user.tsx`, `.gov.tsx`)
- `__APP_MODE__` Vite define global for tree-shaking
- Dashboard renamed to **Explore** (sidebar, page header, route `/explore-personal/...`, 404 copy)
- Header reduced 80→70px, nav font 20→16px, page banners 160→120px, sidebar 232→210px
- 6 bug fixes (vault $NaN, council gating, eGov fee, Staking CTA, VestingTab redirect, DOM nesting)
- Vault badge grid fix (status inline in single row)
- GraphQL poll traffic reduced ~50%: REFRESH_INTERVAL 30→60s, config queries → CACHE_STATIC, member queries → once, satellite ID memoization, listener fix
- Comprehensive README with dual-app setup, Cloudflare Pages deployment guide
- Feature documentation with full route map, button inventory, contract call names, test checklist
- Loading performance analysis plan (`.claude/plans/loading-performance-analysis.md`)

**Still in progress on this branch:**
- DOMPurify/XSS on proposal free-text fields
- Satellite provider 4-hook → 1 dynamic query structural refactor
- Council provider 6-hook → 2 dynamic query structural refactor
- Typography & Style Consistency (see below)

### Typography & Style Consistency (`feat/typography-consistency`)
**Plan:** `.claude/plans/typography-and-style-consistency.md` — **NOT YET STARTED** (will be done on `feat/app-split`)

**Problem:** 66% of all font-weight declarations use SemiBold (600), 16+ ad-hoc font sizes, no typography scale, inconsistent heading hierarchy, hardcoded colors bypassing themes, dead font loaded.

**Approach:** Design tokens (`typography.ts`) with formal scale for sizes/weights/line-heights. Default body weight to 400 (Regular) per industry standard. Theme-aware PageHeader gradient. Fix all 82+ style files.

**Phases:**
1. Create typography design tokens
2. Fix global heading styles
3. Fix base component defaults (Card, TableCell, Button, Input, etc.)
4. Apply tokens to all page-level style files (~82 files)
5. Theme-aware gradient + hardcoded color fixes
6. Cleanup (dead font, redundant declarations, typed theme interface)

## Code Style

- **Prettier**: single quotes, 120 char width, no semicolons, trailing commas
- **ESLint**: TypeScript strict, React, jsx-a11y, security plugin, import ordering
- **No default exports** rule enforced by ESLint
- **TypeScript strict mode** with strict null checks
- **Imports** use absolute paths from `src/` (configured via `baseUrl` in tsconfig)
- **Styled Components** for CSS-in-JS; StyleLint configured for styled-components syntax
- Pre-commit hooks via Husky run lint-staged (ESLint + Prettier checks)

## Environment Variables

All env vars use the `VITE_` prefix (accessed via `import.meta.env.VITE_*`). Copy `src/frontend/.env.example` to `.env.local`.

Key variables:
- `VITE_NETWORK` — Mavryk network (`atlasnet` | `mainnet`)
- `VITE_ENV` — Working environment (`dev` | `prod`)
- `VITE_DATA_ENV` — Data loading environment (`dev` | `prod`)
- `VITE_GRAPHQL_API` — Hasura GraphQL endpoint
- `VITE_TZKT_API` — Mavryk network API base URL
- `VITE_TZKT_LINK` — Block explorer link base URL
- `VITE_NAME` — Project name (MAVEN)
- `VITE_IPFS_API_KEY` / `VITE_IPFS_PROJECT_ID` — IPFS credentials (encrypted, not set locally)
- `VITE_RECAPTCHA_SITE_KEY` — Google reCAPTCHA v3
- `VITE_MAINTANCE_MODE` — Maintenance mode toggle (`on` | `off`)
