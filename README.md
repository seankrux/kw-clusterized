# Keyword Clustering Tool

A micro-SaaS tool for SEO professionals to group keywords into topic clusters using semantic similarity.

## Features

- Paste or upload keyword lists (CSV/TXT)
- Automatic semantic clustering using text similarity
- Visual cluster view with color coding
- Export results as CSV
- Free: 100 keywords max
- Pro: Unlimited keywords ($9/month)

## Tech Stack

- Next.js 14 App Router + TypeScript
- Tailwind CSS
- Client-side clustering (no backend needed for MVP)
- Stripe for payments
- Deploy-ready to Vercel

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...
```

## Deployment

```bash
vercel
```

## License

MIT
