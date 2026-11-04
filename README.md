# Vaidotas Petraitis Portfolio

My personal portfolio, featuring my engineering experience, certifications, and projects.
It uses React, TypeScript, and Vite. The build bundles the JSON content from `src/data/`
and serves project routes such as `/#/projects/rutuliukai` from a single HTML entry.

## Run locally

Use Node.js 24 and run these commands from the repository root.

```sh
npm ci
npm run dev
```

Run `npm run check` and `npm test` to validate changes. Run `npm run build` and
`npm run preview` to test the production build locally.

## Publish

This build targets `https://vaidotaspetraitis.github.io/`. Rename the existing public
GitHub repository to `VaidotasPetraitis.github.io` and update the local `origin` URL and
the Portfolio Website source link in `src/data/projects.json`. In the repository's
**Settings → Pages**, choose **GitHub Actions** as the publishing source. The workflow
builds and publishes `dist/` on pushes to `main` or when run manually.
