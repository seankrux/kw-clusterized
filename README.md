<div align="center">
  <h1>KW Clusterized</h1>
  <p><strong>Client-side keyword clustering tool using semantic similarity</strong></p>

  <p>
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js" alt="Next.js" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /></a>
  </p>

  <br />
  <a href="https://kw-clusterized.vercel.app"><strong>Live Demo →</strong></a>
</div>

---

## Overview

KW Clusterized is a frontend-first keyword clustering application built to turn raw keyword lists into clean topical groups in seconds. It uses Jaccard similarity, word overlap analysis, and greedy agglomerative clustering to help SEOs, content strategists, and growth teams organize search intent without sending data to a server.

## Preview

> [View the live application →](https://kw-clusterized.vercel.app)

## Features

▸ **Flexible Input** — Paste comma-separated, newline-delimited, or upload CSV, TXT, and TSV files

▸ **Batch Processing** — Handles large keyword sets in a single pass, deduplicates entries, and groups them into reviewable clusters

▸ **Semantic Clustering** — Groups keywords by word overlap and Jaccard similarity scoring instead of relying on exact-match rules

▸ **Agglomerative Grouping Logic** — Uses greedy single-linkage clustering to merge related phrases into the most relevant existing cluster

▸ **Similarity Threshold Tuning** — The core clustering engine supports configurable similarity thresholds, making it easy to adjust grouping strictness in code

▸ **Color-Coded Clusters** — Visual cluster cards and auto-generated labels make cluster review fast and intuitive

▸ **Structured Export Format** — Download cluster assignments as CSV with cluster ID, label, and keyword columns for spreadsheets and planning workflows

▸ **Client-Side Only** — All analysis runs in the browser with zero server round-trips

▸ **Instant Results** — No API calls, no loading spinners, immediate output

## Algorithm

KW Clusterized uses a lightweight, explainable clustering approach designed for practical keyword grouping rather than opaque black-box scoring.

1. **Normalize and tokenize keywords**  
   Each keyword is lowercased, punctuation is removed, and low-signal stop words are filtered out so the algorithm focuses on meaningful terms.

2. **Calculate Jaccard similarity**  
   For every comparison, the app converts each keyword into a set of significant words and scores overlap with the Jaccard similarity coefficient:

   `J(A, B) = |A ∩ B| / |A ∪ B|`

   A score closer to `1` means two keywords share more meaningful vocabulary; a score closer to `0` means they are topically farther apart.

3. **Apply semantic overlap bias**  
   When two keywords share a more meaningful term of four or more characters, the score receives a small boost. This improves practical grouping for phrases like `content marketing strategy` and `content creation tips`, where topical overlap matters more than raw token count alone.

4. **Cluster with greedy agglomerative logic**  
   Keywords are processed from longer phrases to shorter phrases. For each keyword, the algorithm measures similarity against existing clusters using **single-linkage** logic, meaning it compares against the most similar keyword already inside that cluster.

5. **Respect a similarity threshold**  
   If the best matching cluster meets the similarity threshold, the keyword joins that cluster. Otherwise, it seeds a new cluster. The result is a fast, deterministic form of agglomerative clustering that works well for SEO and content-planning workflows.

## Why KW Clusterized?

Most keyword clustering workflows still revolve around Python notebooks, scripts, or backend-heavy pipelines. KW Clusterized takes a different approach: it is a browser-native implementation built with **Next.js** and **TypeScript**, making it a strong portfolio piece as well as a practical tool.

- **Frontend-native architecture** — No Python runtime, notebook workflow, or server queue required
- **Private by design** — Keywords stay in the browser, which is useful for sensitive client datasets
- **Modern web deployment** — Easy to run locally, share as a live demo, and deploy on Vercel
- **Accessible to frontend teams** — Easier to extend for developers already working in React, Next.js, and TypeScript
- **Differentiated positioning** — In a category dominated by Python implementations, KW Clusterized shows how keyword clustering can feel like a polished product instead of a script

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| UI | React 18 |
| Styling | Tailwind CSS 3 |
| Clustering Engine | Custom Jaccard-based keyword clustering |
| File Handling | Browser FileReader API |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm 9 or later

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/seankrux/kw-clusterized.git
   cd kw-clusterized
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Start the development server

   ```bash
   npm run dev
   ```

Open `http://localhost:3000` in your browser.

### Production Build

```bash
npm run build
npm run start
```

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

The live application is available at [kw-clusterized.vercel.app](https://kw-clusterized.vercel.app).

## Contributing

Contributions are welcome if they improve clustering quality, usability, documentation, or developer experience.

1. Fork the repository
2. Create a feature branch
3. Make focused, well-documented changes
4. Run a local sanity check with `npm run build`
5. Open a pull request with a clear summary of the improvement

High-value contribution areas include:

- exposing similarity threshold controls in the UI
- adding more export targets or data views
- improving cluster labeling heuristics
- expanding test coverage around clustering edge cases

---

<p align="center">Made with 💛 by <a href="https://www.seanguillermo.com"><strong>Sean G</strong></a></p>
