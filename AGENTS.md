# App Agent Guide

## Sources of Truth

- Verify versions, scripts, and tooling in the relevant `package.json` before changing them.
- This repo is a Lerna-style workspace. The actual app package lives in `src/frontend`.
- Root `package.json` only exposes `npm run prettier`; app scripts live in `src/frontend/package.json`.
- Current app stack in `src/frontend/package.json`: React `18.2.0`, React Router `6.23.0`, TypeScript `5.1.6`, Apollo Client `3.10.1`, styled-components `6.1.8`, Webpack `5`, custom CRA-derived scripts.
- Do not use Remix/Vite assumptions in this repo.

## Project Structure

- `src/frontend/src/index.tsx`: React root, router, provider composition, global styles, wallet/mobile bootstrap.
- `src/frontend/src/app/`: app shell, app-level styles, analytics, hooks, and shared app components.
- `src/frontend/src/app/App.components/AppRoutes/AppRoutes.controller.tsx`: route table for React Router and sitemap generation.
- `src/frontend/src/pages/`: route/page implementations. Keep page-specific UI, helpers, styles, schemas, and modals here.
- `src/frontend/src/providers/`: cross-page state/data providers. Most domains have `*.provider.tsx`, `queries/`, `actions/`, `helpers/`, and sometimes `hooks/` or `schemas/`.
- `src/frontend/src/providers/ApolloProvider/`: Apollo HTTP/WS client setup and shared GraphQL error handling.
- `src/frontend/src/providers/UserProvider/wallet/WalletCore.ts`: Mavryk/Mavlet wallet client singleton.
- `src/frontend/src/app/App.hooks/useContractAction/`: shared contract action lifecycle wrapper for toasts, confirmations, and forced refetches.
- `src/frontend/src/utils/`: shared utilities, API wrapper, parsing/formatting/math helpers, storage helpers, generated GraphQL types.
- `src/frontend/src/errors/`: typed error classes, wallet error helpers, and operation estimation helpers.
- `src/frontend/src/styles/`: global CSS, styled-components theme/global styles, shared styled layout primitives, colors, constants, fonts, animations.
- `src/frontend/src/texts/`: shared tooltip/banner copy.
- `src/frontend/public/`: static assets, sprite icons, manifest, robots, generated sitemap, contract metadata.
- `src/frontend/config/` and `src/frontend/scripts/`: custom CRA/Webpack/Jest/start/build/sitemap tooling.

## State and Data Flow

- State management is React Context providers, not Redux. Add domain state to an existing provider when it belongs to that domain.
- Initial provider order in `src/frontend/src/index.tsx` matters: app config, tokens, user, data feeds, then section providers.
- GraphQL queries live near the provider or page that owns the data. Prefer existing provider `queries/` folders before adding page-local queries.
- Use Apollo `useQuery` for one-off loads and `providers/common/hooks/useQueryWithRefetch` for data that must refresh on interval or after contract actions.
- Validate and normalize external/indexer data with existing Zod schemas and normalizers in provider `helpers/` or `schemas/`.
- Contract writes belong in provider `actions/` and should return `ActionSuccessReturnType` or `ActionErrorReturnType`.
- Wrap UI-triggered contract writes with `useContractAction` so toasts, confirmation waiting, shared errors, and forced refetch behavior stay consistent.
- `forcedUpdateProxy` and `currentIndexerLevelProxy` are global coordination utilities. Reuse them only for existing refetch/indexer-level patterns.

## Routing

- Add routes in `src/frontend/src/app/App.components/AppRoutes/AppRoutes.controller.tsx`.
- Use React Router v6 route patterns already present in that file, including nested routes and `ProtectedRoute`.
- If a route should appear in sitemap output, ensure `scripts/generate-sitemap.js` can resolve its path.
- Route additions/removals usually require regenerating `src/frontend/public/sitemap.xml` with `yarn generate-sitemap`.

## Styling

- Styling is primarily `styled-components` with `*.style.tsx` or `*.styles.tsx` files plus shared global CSS.
- Reuse theme values from `src/frontend/src/styles/colors.ts` through `ThemeProvider`; avoid hard-coded colors when a theme token exists.
- Reuse shared primitives from `src/frontend/src/styles/components.ts` and constants from `src/frontend/src/styles/constants.ts`.
- Global CSS is in `src/frontend/src/styles/index.css`, `fonts.css`, and `animations.css`; keep new global rules rare.
- CSS Modules are not an established app pattern here. Do not introduce `*.module.css` unless explicitly requested.
- Tailwind is installed, but there is no Tailwind config in the app. Do not use Tailwind utility strings as the default styling approach.
- Use existing app components (`Button`, `NewButton`, `Input`, `NewInput`, `DropDown`, `NewDropdown`, `Tooltip`, `Table`, `Pagination`, `PageHeader`, `Icon`, etc.) before creating variants.
- Use `/public/icons/sprites.svg` through `App.components/Icon/Icon.view.tsx` for sprite icons.

## Naming and File Patterns

- Match the folder you are touching. Common patterns include `Feature.controller.tsx`, `Feature.view.tsx`, `Feature.style.tsx`, `Feature.styles.tsx`, `Feature.const.ts`, `Feature.consts.ts`, `Feature.helpers.ts`, `Feature.types.ts`, and `*.provider.tsx`.
- Components and types use `PascalCase`; functions, variables, and hooks use `camelCase`.
- Hook files and hook functions should start with `use`.
- Boolean names should start with `is`, `has`, `can`, or `should`.
- Event handlers should start with `handle`.
- Prefer named exports where existing files use them. Do not mass-convert default/named exports.
- Imports can use `src` absolute paths because `tsconfig.json` sets `baseUrl: "src"`. Follow nearby import style.

## Commands

Run app commands from `src/frontend` unless noted otherwise.

- `yarn install`: install frontend dependencies.
- `yarn start`: generate sitemap, start the dev server on port `3000`, and open the app.
- `yarn start:evenlop`: dev start variant with `NODE_OPTIONS=--openssl-legacy-provider`.
- `yarn build`: run GraphQL codegen, generate sitemap, and build production assets with ESLint plugin disabled.
- `yarn build:evenlop`: build variant with `NODE_OPTIONS=--openssl-legacy-provider`.
- `yarn graphql-compile`: generate GraphQL client types into `src/utils/__generated__/`.
- `yarn graphql-compile-watch`: watch GraphQL codegen.
- `yarn generate-sitemap`: regenerate `public/sitemap.xml` from `AppRoutes`.
- `yarn test`: run Jest through the custom CRA test script.
- `yarn cypress:open`, `yarn cypress:run`, `yarn cypress:test`: Cypress commands, though no Cypress test tree is currently present.
- `yarn analyze`: build and run source-map-explorer.
- Root `npm run prettier`: check formatting for JS/TS/JSON/Markdown across the repo.

There is no app-level `lint` or `typecheck` script in `src/frontend/package.json`; do not document or rely on those commands unless they are added.

## Environment

- Local app env lives in `src/frontend/.env.local`; use `src/frontend/.env.example` as the template.
- Only `REACT_APP_*` variables are injected into the browser bundle by `config/env.js`, plus CRA public variables such as `PUBLIC_URL`.
- Important envs include `REACT_APP_GRAPHQL_API`, `REACT_APP_GRAPHQL_WSS_API`, `REACT_APP_NETWORK`, `REACT_APP_NAME`, `REACT_APP_DATA_ENV`, `REACT_APP_ENV`, `REACT_APP_TZKT_API`, `REACT_APP_TZKT_LINK`, `REACT_APP_WERT_API`, IPFS keys, `REACT_APP_MAINTANCE_MODE`, and `SITEMAP_SITE_URL`.
- Do not read, print, or commit secrets from `.env.local`.
- `graphql-compile` reads `.env.local` through dotenv and uses `REACT_APP_DATA_ENV` to prefix indexer table names for dev/prod.

## Generated and External Files

- Do not manually edit `src/frontend/src/utils/__generated__/`; regenerate it with `yarn graphql-compile`.
- Do not manually edit `src/frontend/public/sitemap.xml` unless the task is specifically about generated sitemap output; use `yarn generate-sitemap`.
- `src/frontend/src/deployments/` is populated by `yarn import-contracts` from `../contracts/deployments`; avoid hand edits unless explicitly requested.
- Build output in `src/frontend/build/` is generated.

## Testing

- Jest is configured in `src/frontend/package.json` and uses `src/frontend/src/setupTests.ts`.
- Test files are expected under `src/**/__tests__/**/*.{js,jsx,ts,tsx}` or `src/**/*.{spec,test}.{js,jsx,ts,tsx}`.
- Current repo has little/no real test coverage. For behavior changes, add focused tests when practical; otherwise at least run the closest available validation command.
- Cypress dependencies and scripts exist, but no Cypress test directory is currently present.

## Coding Rules

- Keep changes scoped to the requested behavior and the owning domain folder.
- Reuse existing components, hooks, providers, helpers, schemas, normalizers, and utilities before adding new abstractions.
- Do not create parallel versions of existing controls such as buttons, inputs, dropdowns, tables, tooltips, modals, or chart wrappers.
- Keep business logic out of render-heavy components when it can live in a provider helper, normalizer, hook, action, or utility.
- Handle errors explicitly with existing error helpers/classes and toaster patterns. Do not silently swallow errors.
- Preserve TypeScript strictness. Avoid `any`; prefer existing generated GraphQL types, provider types, and Zod schemas.
- Do not break provider context shapes, route paths, wallet action return contracts, or generated GraphQL documents unless asked.
- Never log secrets, wallet-sensitive data, or PII.

## Common Pitfalls

- The root package is not the app package; most work belongs under `src/frontend`.
- The app is not Remix and does not use Remix routes, loaders, actions, or entry files.
- The app is not Vite; build/dev behavior comes from custom CRA/Webpack scripts.
- Mobile currently renders the `Mobile` plug instead of the full app when `isMobile` is true.
- `body` has a large fixed minimum width in global styles; responsive changes need to account for that existing layout model.
- `yarn start` tries to open a browser. In headless/agent environments, prefer build/test/codegen validation unless a dev server is explicitly needed.
- The sitemap parser resolves route string literals and imported string constants; dynamic or complex route expressions may need script updates.

## AGENTS Maintenance Protocol

When scripts, dependency versions, folder conventions, routing, generated outputs, env requirements, or provider architecture change, update this file in the same PR.
