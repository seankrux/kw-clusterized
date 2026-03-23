<div align="center">
  <h1>KW Clusterized</h1>
  <p><strong>Client-side keyword clustering tool using semantic similarity</strong></p>

  <p>
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js" alt="Next.js" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /></a>
    <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="License" />
  </p>

  <br />
  <a href="https://kw-clusterized.vercel.app"><strong>Live Demo →</strong></a>
</div>

---

## Overview

Groups keywords into topic clusters automatically using Jaccard similarity and word overlap analysis. All processing runs entirely in the browser — no data ever leaves your device.

## Preview

> [View the live application →](https://kw-clusterized.vercel.app)

## Features

▸ **Flexible Input** — Paste comma-separated, newline-delimited, or upload CSV/TXT files

▸ **Semantic Clustering** — Groups keywords by word overlap and Jaccard similarity scoring

▸ **Color-Coded Clusters** — Visual cluster cards for rapid scanning and review

▸ **CSV Export** — Download cluster assignments for content planning workflows

▸ **Client-Side Only** — All analysis runs in the browser with zero server round-trips

▸ **Instant Results** — No API calls, no loading spinners, immediate output

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| CSV Parsing | PapaParse |
| UI Components | Radix UI, Lucide Icons |
| Notifications | Sonner |

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Project Structure

```
src/
  app/
    page.tsx                  # Main page
  components/
    KeywordClusterer.tsx      # Core clustering UI
  lib/
    clustering.ts             # Clustering algorithm
```

## Deployment

```bash
vercel deploy
```

## License

[MIT](LICENSE)

---

<p align="center">Made with 💛 by Sean G</p>
