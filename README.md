# 🔗 Link Communications Center

> **Uganda's Trusted Tech Partner** — Enterprise surveillance, access control, and communications equipment. Designed, installed, and supported across Uganda.

[![Production](https://img.shields.io/badge/User%20Site-Live-brightgreen)](https://link-communications-center.vercel.app)
[![Admin](https://img.shields.io/badge/Admin%20Panel-Live-blue)](https://link-communications-center-2j9s.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com)

---

## 📁 Monorepo Structure

```
Link-Communications-Center/
├── admin/          # Admin dashboard (inventory, products, orders)
├── user/           # Public-facing website & checkout
└── supabase/       # Database migrations & schema
```

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animations | Framer Motion, anime.js |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Magic Links |
| Storage | Supabase Storage |
| 3D / Globe | Three.js |
| Payments | MTN MoMo API, Airtel Money API |
| Deployment | Vercel |

---

## ✨ Features

### User Site (`/user`)
- Cinematic hero section with interactive Three.js globe
- Product catalogue with categories grid
- Scroll-driven timeline & animations
- MTN MoMo & Airtel Money checkout
- Auto-detects payment provider from phone number prefix
- Dark / light mode with CSS variables
- Fully responsive

### Admin Dashboard (`/admin`)
- Password-protected dashboard
- Supabase-backed product inventory
- Multi-image upload per product
- Product carousels
- Contact form management
- Dual logo upload (light/dark mode)
- Transaction history

---

## 💳 Payment Integration

LCC supports both major Ugandan mobile money providers:

| Provider | Prefix | Status |
|----------|--------|--------|
| MTN MoMo | 077x / 078x | ✅ Sandbox Active |
| Airtel Money | 070x / 075x | ⏳ Awaiting Approval |

Phone number prefix is auto-detected at checkout — no manual selection needed.

---

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- MTN MoMo developer account

### Setup

```bash
# Clone the repo
git clone https://github.com/Skaletavenger/Link-Communications-Center.git
cd Link-Communications-Center

# Install dependencies for user site
cd user && npm install

# Install dependencies for admin site
cd ../admin && npm install
```

### Environment Variables

Create `user/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
MTN_COLLECTION_SUBSCRIPTION_KEY=your_mtn_subscription_key
MTN_COLLECTION_USER_ID=your_mtn_user_id
MTN_COLLECTION_API_KEY=your_mtn_api_key
AIRTEL_CLIENT_ID=your_airtel_client_id
AIRTEL_CLIENT_SECRET=your_airtel_client_secret
```

Create `admin/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run Locally

```bash
# User site → http://localhost:3000
cd user && npm run dev

# Admin site → http://localhost:3001
cd admin && npm run dev
```

---

## 🗄️ Database

Migrations are in `/supabase/migrations`. Run them via the Supabase dashboard or CLI:

```bash
supabase db push
```

Key tables:
- `products` — product catalogue with images
- `transactions` — payment records (MTN & Airtel)
- `contacts` — contact form submissions

---

## 🎨 Brand Colors

| Color | Hex |
|-------|-----|
| Primary Blue | `#1574B5` |
| Red | `#ED2124` |
| Orange | `#F47821` |

---

## 📦 Deployment

Both apps deploy automatically to Vercel on push to `main`.

| App | URL |
|-----|-----|
| User Site | [link-communications-center.vercel.app](https://link-communications-center.vercel.app) |
| Admin Panel | [link-communications-center-2j9s.vercel.app](https://link-communications-center-2j9s.vercel.app) |

---

## 👨‍💻 Developer

**Maurice Gabriel** — IT Student @ Uganda Christian University & Founder of Link Communications Center.

- 🌐 [linkcommunicationcentre.com](https://linkcommunicationcentre.com)
- 💼 [LinkedIn](https://linkedin.com/in/mauricegabrile)
- 🐙 [GitHub](https://github.com/Skaletavenger)

---

## 📄 License

Private repository — © 2026 Link Communications Center. All rights reserved.
