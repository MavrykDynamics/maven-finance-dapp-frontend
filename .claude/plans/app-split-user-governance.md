# App Split: User App + Governance App

## Branch
`feat/app-split` (to be created from `feat/vite-migration-and-router-v7`)

## Status
**PLANNING** — Architecture decided, implementation not started.

### Prerequisites (completed)
- [x] Vite migration (commit `48283d259`)
- [x] React Router v7 migration (commit `c73d374db`)
- [x] TanStack Query migration (earlier optimization work)
- [x] Route-based code splitting with React.lazy

## Overview

Split the Maven Finance dApp into two separately deployed websites from a single codebase:

1. **Maven Finance (User App)** — DeFi product for regular users: lending, borrowing, staking, farming
2. **Maven Governance (Governance App)** — Governance, satellite management, treasury, council operations

Both sites deploy from the same repo via two Cloudflare Pages projects with different build commands.

## Key Design Decisions

- **Single repo, two Vite entry points** — shared code, no duplication, two build outputs
- **Cloudflare Pages: two projects, same repo** — each project has its own build command, output dir, and env vars. Both trigger on the same push. No need to leave the GitHub integration.
- **Staking on User App** — it's a user action even though satellites also do it
- **Emergency Governance on both** — any sMVN holder votes directly (not through satellites)
- **Shared providers stay shared** — the code lives in the same `providers/` dir. Each entry point just imports a different subset.
- **No runtime feature flags** — the split is at build time via separate route trees and provider trees

## Page Assignment

### Site A: Maven Finance (User App)

| Page | Route | Notes |
|------|-------|-------|
| Dashboard | `/` | Tailored for user features |
| Personal Dashboard | `/dashboard-personal/...` | Portfolio, delegation, vesting tabs (not satellite tab) |
| Staking (Doorman) | `/staking` | Core user action |
| Loans Dashboard | `/loans/dashboard` | |
| Loans Earn | `/loans/earn` | |
| Loans Borrow | `/loans/borrow` | |
| Loans Markets | `/loans` | |
| Market Detail | `/loans/:assetAddress/:tabId` | |
| Vaults | `/vaults/:tabId` | Tightly coupled with lending/borrowing |
| Yield Farms | `/yield-farms` | |
| Satellites List | `/satellites` | Users pick delegation targets |
| Satellite Details | `/satellites/satellite-details/:id` | Delegation decision info |
| Data Feeds | `/data-feeds` | Users consume prices |
| Feed Details | `/satellites/feed-details/:feedId` | |
| Emergency Governance | `/emergency-governance` | Direct sMVN holder vote |
| Contract Status | `/contract-status` | Break-glass transparency |

**Providers needed:** DappConfig, Tokens, User, DataFeeds, Doorman, Loans, Vaults, Farms, Satellites, EGov, ContractStatuses

### Site B: Maven Governance (Governance App)

| Page | Route | Notes |
|------|-------|-------|
| Dashboard | `/` | Tailored for governance features |
| Personal Dashboard | `/dashboard-personal/...` | Satellite tab, delegation tab |
| Satellites List | `/satellites` | Peer visibility |
| Satellite Details | `/satellites/satellite-details/:id` | |
| Satellite Nodes | `/satellite-nodes` | Operator-focused |
| Become Satellite | `/become-satellite/:tabId` | Registration flow |
| Data Feeds | `/data-feeds` | Oracle management |
| Feed Details | `/satellites/feed-details/:feedId` | |
| Governance (Proposals) | `/governance` | Satellite proposal/voting |
| Proposal History | `/proposal-history` | |
| Submit Proposal | `/submit-proposal` | Satellite-only (ProtectedRoute) |
| Satellite Governance | `/satellite-governance/:tabId` | Satellite voting actions |
| Council | `/maven-council/:tabId` | Council members |
| Break Glass Council | `/break-glass-council/:tabId` | |
| Financial Requests | `/financial-requests` | Satellite voting on treasury |
| Treasury | `/treasury` | Council-managed |
| Emergency Governance | `/emergency-governance` | Direct sMVN holder vote |
| Contract Status | `/contract-status` | Break-glass transparency |

**Providers needed:** DappConfig, Tokens, User, DataFeeds, Satellites, Doorman, Proposals, Council, SatelliteGovernance, FinancialRequests, Treasury, EGov, ContractStatuses, Vesting

### Shared Pages (on both sites)

1. Satellites List & Satellite Details — delegation (user) + peer view (operator)
2. Data Feeds & Feed Details — price consumption (user) + oracle management (operator)
3. Emergency Governance — direct sMVN holder vote
4. Contract Status — break-glass transparency

## Cloudflare Pages Deployment

### Setup

Create **two** Cloudflare Pages projects, both connected to the same GitHub repo:

| Setting | maven-finance (User) | maven-governance (Gov) |
|---------|---------------------|----------------------|
| GitHub repo | `maven-finance-dapp-frontend` | `maven-finance-dapp-frontend` |
| Production branch | `main` | `main` |
| Root directory | `src/frontend` | `src/frontend` |
| Build command | `yarn install && yarn build:user` | `yarn install && yarn build:gov` |
| Build output directory | `build-user` | `build-gov` |
| Custom domain | `app.mavenfinance.io` | `gov.mavenfinance.io` |
| Env vars | All `VITE_*` vars + `VITE_APP_MODE=user` | All `VITE_*` vars + `VITE_APP_MODE=gov` |

Both projects trigger independently on the same push. Cloudflare runs two parallel builds.

Each build output needs a `_redirects` file for SPA routing:
```
/*    /index.html   200
```

## Implementation Plan

### Phase 1: Shared Vite base config + two build targets

**Files to create/modify:**
- `vite.base.config.mts` — extract shared config (plugins, define, server)
- `vite.user.config.mts` — extends base, sets `outDir: 'build-user'`, defines `VITE_APP_MODE: 'user'`
- `vite.gov.config.mts` — extends base, sets `outDir: 'build-gov'`, defines `VITE_APP_MODE: 'gov'`
- `package.json` — add scripts:
  ```json
  "start:user": "vite --config vite.user.config.mts",
  "start:gov": "vite --config vite.gov.config.mts",
  "build:user": "yarn graphql-compile && vite build --config vite.user.config.mts",
  "build:gov": "yarn graphql-compile && vite build --config vite.gov.config.mts"
  ```
- Keep `start` / `build` as aliases for `start:user` / `build:user` (default)

### Phase 2: Split route trees

**Files to create/modify:**
- `AppRoutes/AppRoutes.user.tsx` — routes for user app only
- `AppRoutes/AppRoutes.gov.tsx` — routes for governance app only
- `AppRoutes/AppRoutes.controller.tsx` — conditionally imports based on `VITE_APP_MODE`
- Each route tree imports only the pages it needs (React.lazy already in place)

### Phase 3: Split provider trees

**Files to create/modify:**
- `index.tsx` (or new `AppProviders.user.tsx` / `AppProviders.gov.tsx`)
- User app mounts: Doorman, Loans, Vaults, Farms, Satellites, EGov, ContractStatuses
- Gov app mounts: Satellites, Doorman, Proposals, Council, SatelliteGovernance, FinancialRequests, Treasury, EGov, ContractStatuses, Vesting
- Shared initial providers stay the same: DappConfig, Tokens, User, DataFeeds

### Phase 4: Split dashboards

**Files to create/modify:**
- Dashboard controller to render different tab sets per app mode
- Personal Dashboard to show/hide tabs per app mode
- Navigation links split per app mode

### Phase 5: Cross-site navigation

**Files to create/modify:**
- Shared header/topbar component gets a "Switch to Governance" / "Switch to Finance" link
- Links point to the other site's domain (configured via env var `VITE_OTHER_SITE_URL`)

### Phase 6: SPA routing + build verification

**Files to create:**
- `public/_redirects` with `/*    /index.html   200`
- Verify both builds succeed: `yarn build:user && yarn build:gov`
- Verify both dev servers work: `yarn start:user` and `yarn start:gov`
- Smoke test: each site only loads its own route chunks

## Risks

| Risk | Mitigation |
|------|------------|
| Provider imports leak across builds | Tree-shaking via separate route trees + React.lazy ensures unused providers don't bundle |
| Shared pages diverge between sites | Keep shared pages as-is; conditional rendering only in Dashboard/PersonalDashboard/Nav |
| Cloudflare build timeout (two builds) | Each build is independent; Vite builds in ~11s so no timeout risk |
| Users bookmark the wrong site | Cross-site links + clear branding differentiation |
| Emergency governance needs both user and satellite context | EGov provider is lightweight and included in both |

## Verification

1. `yarn build:user` — succeeds, output in `build-user/`
2. `yarn build:gov` — succeeds, output in `build-gov/`
3. `npx tsc --noEmit` — no type errors
4. User app: no governance pages reachable, no governance providers loaded
5. Gov app: no lending/farming pages reachable, no loans/vaults/farms providers loaded
6. Both apps: emergency governance, contract status, satellites, data feeds work
7. Bundle analysis: each build only contains its own page chunks

## Commit Strategy

1. `chore: add dual vite configs and build scripts for app split`
2. `refactor: split route trees into user and governance apps`
3. `refactor: split provider trees per app mode`
4. `feat: split dashboards and navigation per app mode`
5. `feat: add cross-site navigation links`
6. `chore: add SPA redirects and verify both builds`
