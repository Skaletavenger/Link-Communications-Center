# Link Communications Center

Next.js 14 + Tailwind + TypeScript demo app with animations and a simple inventory dashboard.

Quick start:

```bash
npm install
npm run dev
```

Deploy to Vercel: connect this repo and deploy; `vercel.json` is included.

Database (optional local SQLite)

1. Copy `.env.local.example` to `.env.local` and ensure `DATABASE_URL="file:./dev.db"` is set.
2. Install dependencies: `npm install`.
3. Run Prisma migrate and seed locally:

```bash
npm run prisma:generate
npm run prisma:migrate
node prisma/seed.js
```

For production use with Planetscale or another hosted database, set `DATABASE_URL` in Vercel and run migrations there.
