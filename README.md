# RoamJS Extension Base

Stock base for [RoamJS](https://roamjs.com) Roam Research extensions. Choose **Use this template** to create a standalone repository, then clone the new repository. See the [RoamJS extension creation guide](https://github.com/mdroidian/RoamJS/blob/main/docs/creating-roamjs-extensions.md) for setup and the clone-and-push fallback.

## What's included

- **roamjs-components** — shared utilities, DOM helpers, queries, writes, and UI components
- **Samepage build** — `samepage build` produces the Roam Depot–ready bundle
- **Settings panel** — example `extensionAPI.settings.panel.create` with an Enable switch
- **TypeScript** — tsconfig extending `@samepage/scripts`
- **CI** — GitHub Actions to build on push/PR (uses RoamJS secrets for publish)

## After creating the repository

1. **Set the package metadata** in `package.json`:
   - `name`: your extension slug (e.g. `my-extension`)
   - `description`: one line describing the extension

2. **Implement in `src/index.ts`**:
   - Keep or replace the settings panel
   - Add your logic using `roamjs-components` (e.g. `createHTMLObserver`, `createBlock`, `renderToast`)
   - Return `{ unload }` to clean up on unload

3. **Update all instances of `{Extension Name}` to the name of the extension.**

### Write the extension README

Replace this starter README with a user-facing README based on [README-TEMPLATE.md](README-TEMPLATE.md). Fill in the actual repository links and describe the extension’s features. Keep build instructions with the extension's developer documentation.

3. **Prefer**: Add React components under `src/components/` (see [autocomplete](https://github.com/RoamJS/autocomplete), [giphy](https://github.com/RoamJS/giphy) for examples).

4. **Secrets (for publish)** — in the new repository, configure:
   - `ROAMJS_RELEASE_TOKEN`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`, `ROAMJS_PROXY` (vars)

## Scripts

- `npm start` — samepage dev (local development)
- `npm run build:roam` — build for Roam (dry run; CI runs `npx samepage build`)

## License

MIT
