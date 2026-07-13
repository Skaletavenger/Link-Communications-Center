# Link Communications Center

E-commerce and admin platform for **Link Communications Center (LCC)** — a technology retail and services business in Kampala, Uganda (surveillance systems, access control, networking, communications equipment).

**Live:** [linkcommunicationscenter.com](https://linkcommunicationscenter.com) &nbsp;|&nbsp; Admin: [admin.linkcommunicationscenter.com](https://admin.linkcommunicationscenter.com) (login required)

## Repository layout

This is a monorepo containing two independent Next.js 14 apps, each deployed as its own Vercel project:

| Directory | App | Deployment |
|---|---|---|
| `user/` | Public storefront — catalog, product pages, checkout | linkcommunicationscenter.com |
| `admin/` | Internal dashboard — products, loans, home display, contact messages | admin.linkcommunicationscenter.com |
| `supabase/` | SQL: schema snapshots, RLS policies, auth setup | run manually in Supabase SQL Editor |
| `.github/workflows/` | CI — builds both apps on every push and PR | GitHub Actions |

## Tech stack

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS + Framer Motion
- **Supabase** — Postgres, Auth, Storage, with row-level security throughout
- **Vercel** — hosting, auto-deploy on push to `main`, Speed Insights
- **Pesapal API 3.0** — payments (MTN MoMo & Airtel Money, UGX)

## Key features

- Server-rendered, ISR-cached product listing and per-product SEO pages (`/products/[id]`) with Product JSON-LD and a dynamic sitemap generated from the database
- Live mobile-money checkout through Pesapal's hosted payment page, with transactions recorded in Supabase
- Admin authentication via Supabase Auth; admin rights are granted through the `admin_users` table and enforced by database RLS policies (public read, admin-only writes) — see `supabase/admin_auth.sql`
- Supabase Storage writes restricted to admins; public read for product/brand images
- Admin app is excluded from search engines (robots.txt + noindex)

## Environment variables (names only)

**Both apps:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**User app:** `PESAPAL_CONSUMER_KEY`, `PESAPAL_CONSUMER_SECRET`, `PESAPAL_BASE_URL` (production: `https://pay.pesapal.com/v3`; defaults to sandbox when unset), optional `PESAPAL_IPN_ID`, `ANTHROPIC_API_KEY`

**Admin app:** `UNSPLASH_ACCESS_KEY` (product image search)

Values live in each Vercel project's settings — never commit them.

## Local development

```bash
cd user   # or admin
npm install
npm run dev
```

Create `.env.local` in the app directory with the variables above.

## Database

Tables: `products`, `user_profiles`, `loans`, `site_content`, `contact_messages`, `transactions`, `rate_limits`, `admin_users`. Schema and policies are tracked in `supabase/*.sql`. To grant admin access, insert the user's Supabase Auth ID into `admin_users` (see comments in `supabase/admin_auth.sql`).

## Deployment

Push to `main` → CI builds both apps → Vercel auto-deploys both projects. A failed Vercel build keeps the previous deployment live.
