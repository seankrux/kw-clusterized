# :mag: Keyword Clustering Tool

**Group keywords into topic clusters automatically using semantic similarity.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

Keyword Clustering Tool helps SEO professionals organize keyword lists into meaningful topic clusters. Paste or upload your keywords, get color-coded clusters grouped by semantic similarity, and export the results to CSV for content planning.

## Features

- **Paste or Upload Keywords** - Supports comma-separated, newline-separated, CSV, and TXT formats
- **Semantic Clustering** - Groups keywords by word overlap and Jaccard similarity, not just exact matches
- **Visual Cluster View** - Color-coded cluster cards for quick scanning
- **CSV Export** - Download cluster assignments for use in spreadsheets and content plans
- **Client-Side Processing** - All analysis runs in the browser; your data never leaves your device
- **Instant Results** - No server round-trips needed for clustering

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| CSV Parsing | PapaParse |
| UI Components | Radix UI, Lucide Icons, Sonner |
| Notifications | Sonner (toast) |

## Environment Variables

Create a `.env.local` file in the project root. These are **optional** and only needed if you enable Stripe billing:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...
```

## Deployment

```bash
vercel deploy
```

## License

MIT

---

Made with 💛 by Sean G
