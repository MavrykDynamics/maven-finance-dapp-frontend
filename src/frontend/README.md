# Run project locally

- clone the repo
- cd src/frontend
- ensure you have correct envs and env file inside /frontend folder and named .env.local
- set `SITEMAP_SITE_URL` in the env file if the sitemap should point to a different canonical host
- run commands below

```
yarn install
yarn graphql-compile
yarn generate-sitemap
```

The sitemap is generated from `src/app/App.components/AppRoutes/AppRoutes.controller.tsx`, so route additions or removals are picked up automatically on `yarn generate-sitemap` and `yarn build`.

Macos/Linux/Windows

```
yarn start
```

If you are getting evenlope error run command with sufix ":evenlope"

```
yarn start:evenlop
```
