# PDFKING

PDFKING is a self-contained static tools site. The published site is served from `public/` and the production build copies those files to `dist/`.

## Commands

```sh
npm install
npm run dev
npm run build
npm run preview
npm run test:e2e
```

## Local Preview

```sh
npm run dev -- --host 127.0.0.1 --port 4321
```

Open `http://127.0.0.1:4321/dashboard`.

## Deploy

Deploy `dist/` after running:

```sh
npm run build
```
