# NutriSafety

NutriSafety is a full-stack Next.js 14 food compliance and personalized nutrition intelligence app. It scans barcodes, searches Open Food Facts, checks sample FDA/FSSAI/EFSA compliance signals, stores health profiles and scan history in SQLite, and uses Groq for AI ingredient and risk explanations.

## Stack

* Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn-style components
* Framer Motion, Lucide React, Recharts, html5-qrcode
* NextAuth email-only demo credentials login
* SQLite with Prisma ORM
* Groq API for AI summaries and explanations
* Open Food Facts and OpenFDA API routes

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment variables:

```bash
cp .env.example .env
```

Set `NEXTAUTH_SECRET` to a long random value. Add `GROQ_API_KEY` for live AI responses. Without it, the app uses cautious local fallback logic.

3. Initialize SQLite:

```bash
npm run db:push
```

4. Run the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Main Routes

* `/` landing page
* `/scanner` barcode scanner, manual barcode entry, product search, autocomplete-style recent searches
* `/products/[barcode]` product details, AI analysis, ingredients, compliance, charts
* `/profile` health profile settings
* `/dashboard` scan analytics
* `/admin` regulation dataset viewer and upload validator

## Environment

```bash
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"
GROQ_API_KEY=""
GROQ_MODEL="llama-3.1-70b-versatile"
```

## Notes

* FSSAI and EFSA datasets in `data/` are compact demo datasets. Replace them with official curated JSON for production.
* AI output is educational and cautious. It does not provide medical diagnosis.
* The app is Vercel-compatible. For persistent production data, use a hosted database instead of local SQLite.
