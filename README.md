# GolfGive — Golf Charity Subscription Platform

A subscription-based web application combining golf performance tracking, charity fundraising, and a monthly draw-based reward engine.

---

## Tech Stack

- **Frontend/Backend**: Next.js 14 (App Router) + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Auth**: Custom JWT + bcrypt (no NextAuth dependency)
- **Payments**: Stripe (subscriptions + webhooks)
- **Styling**: Tailwind CSS + custom design system
- **Deployment**: Vercel

---

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo>
cd golf-charity-platform
npm install
```

### 2. Set up Supabase (NEW account required)

1. Go to [supabase.com](https://supabase.com) and create a **new account + new project**
2. Open the SQL Editor and paste the contents of `supabase-schema.sql`
3. Run the schema — this creates all tables, RLS policies, functions, and seed charities

### 3. Set up Stripe (NEW account recommended)

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. In the Stripe Dashboard, create two products:
   - **Monthly plan** — £9.99/month recurring
   - **Annual plan** — £99.99/year recurring
3. Copy both Price IDs

### 4. Configure environment variables

Create `.env.local` in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxx

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxx
STRIPE_SECRET_KEY=sk_test_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx
STRIPE_MONTHLY_PRICE_ID=price_xxxx
STRIPE_YEARLY_PRICE_ID=price_xxxx

# App
NEXTAUTH_SECRET=your-random-secret-min-32-chars
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Seed test data

```bash
node scripts/seed.js
```

This creates:
- `admin@golfcharity.com` / `Admin@123` — Admin user
- `user@golfcharity.com` / `User@123` — Active subscriber with 5 scores
- `player2@golfcharity.com` / `Player@123` — Active subscriber
- A sample published draw with winning numbers [19, 21, 28, 30, 34]

### 6. Run locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Deployment to Vercel (NEW account required)

1. Push your code to a **new GitHub repository**
2. Create a **new Vercel account** at [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add all environment variables from `.env.local` in the Vercel dashboard
5. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your production URL
6. Deploy

### Stripe Webhook Setup

After deployment:
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-app.vercel.app/api/subscriptions/webhook`
3. Select events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
4. Copy the webhook secret and update `STRIPE_WEBHOOK_SECRET` in Vercel

---

## Platform Features

### User Flow
- ✅ Signup (3-step: account → charity → plan)
- ✅ Login / Logout with JWT session cookies
- ✅ Subscription via Stripe Checkout
- ✅ Score entry (Stableford 1–45, 5-score rolling window)
- ✅ Score deletion with ownership validation
- ✅ User dashboard (status, scores, draw results, winnings)
- ✅ Winner proof submission
- ✅ Charity selection and contribution % control

### Admin Flow
- ✅ Admin dashboard with live stats
- ✅ User management (view, activate, cancel subscriptions)
- ✅ Draw management (create, simulate, publish)
- ✅ Charity management (add, edit, deactivate, feature)
- ✅ Winner verification (approve/reject/mark paid)

### Draw Engine
- ✅ Random draw (lottery-style)
- ✅ Algorithmic draw (weighted by score frequency)
- ✅ Simulation mode with preview before publish
- ✅ Jackpot rollover when no 5-match winner
- ✅ Prize pool split: 40% / 35% / 25%
- ✅ Multiple winners split equally per tier

### Charity System
- ✅ Charity directory with search/browse
- ✅ Individual charity profiles with upcoming events
- ✅ Contribution percentage slider (10–100%)
- ✅ Featured charities on homepage
- ✅ Total raised tracking

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Homepage
│   ├── how-it-works/         # Explainer page
│   ├── charities/            # Charity listing + detail pages
│   ├── draws/                # Draw results history
│   ├── dashboard/            # User dashboard
│   ├── admin/                # Admin panel (users, draws, charities, winners)
│   └── api/                  # All API routes
│       ├── auth/             # register, login, logout
│       ├── scores/           # CRUD for golf scores
│       ├── draws/            # Draw management
│       ├── charities/        # Charity CRUD
│       ├── subscriptions/    # Stripe checkout + webhook
│       ├── winners/          # Prize verification
│       └── admin/            # Admin analytics + user management
├── components/
│   ├── layout/               # Navbar, Footer
│   ├── dashboard/            # ScoreEntry, WinningsSummary
│   └── admin/                # AdminDrawManager, AdminWinnerVerify, etc.
├── lib/
│   ├── supabase.ts           # Supabase client (public + admin)
│   ├── auth.ts               # JWT, bcrypt, session management
│   └── draw-engine.ts        # Draw logic (random, algorithmic, match checking)
└── types/
    └── index.ts              # All TypeScript interfaces
```

---

## Test Checklist

- [x] User signup & login
- [x] Subscription flow (monthly and yearly via Stripe)
- [x] Score entry — 5-score rolling logic
- [x] Draw system logic and simulation
- [x] Charity selection and contribution calculation
- [x] Winner verification flow and payout tracking
- [x] User Dashboard — all modules functional
- [x] Admin Panel — full control and usability
- [x] Data accuracy across all modules
- [x] Responsive design on mobile and desktop
- [x] Error handling and edge cases

---

Built with ❤️ for Digital Heroes selection process · GolfGive Platform
