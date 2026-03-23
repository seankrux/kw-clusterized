<h1 align="center">🔍 Keyword Clustering Tool</h1>
<p align="center"><strong>Group keywords into topic clusters automatically using semantic similarity.</strong></p>

<p align="center">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js" alt="Next.js" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /></a>
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="License" />
</p>

---

## Preview

> No deployed URL yet — run locally to see the clustering in action.

---

## Key Features

- 📋 **Paste or Upload** — Supports comma-separated, newline, CSV, and TXT input
- 🧠 **Semantic Clustering** — Groups by word overlap and Jaccard similarity
- 🎨 **Color-Coded Clusters** — Visual cluster cards for quick scanning
- 📥 **CSV Export** — Download cluster assignments for content planning
- 🔒 **Client-Side Only** — All analysis runs in the browser; data never leaves your device
- ⚡ **Instant Results** — No server round-trips needed

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| CSV Parsing | PapaParse |
| UI Components | Radix UI, Lucide Icons |
| Notifications | Sonner |

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

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

---

## Deployment

```bash
vercel deploy
```

---

## License

[MIT](LICENSE)

---

<div align="center">
  <p>Made with 💛 by Sean G</p>
</div>
