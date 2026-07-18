# Spritz Perfumes

E-commerce platform for full size and decants — Next.js, Supabase, and PayHere.

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Without Supabase credentials the storefront runs in **demo mode** (seeded catalog, cart, and checkout that skips live PayHere).

## Supabase setup

1. Project is already provisioned via MCP for this workspace.
2. Env vars in `.env.local` use the new **publishable** + **secret** keys (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`).
3. In Supabase Auth settings, add redirect URL `http://localhost:3000/auth/callback` (and your production URL). Sign up at `/signup`, then promote yourself:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

4. Schema lives in [`supabase/migrations`](supabase/migrations); seed in [`supabase/seed.sql`](supabase/seed.sql).

Local SQL files remain the source of truth if you recreate the project.

## PayHere setup

1. Create a sandbox merchant at [PayHere](https://www.payhere.lk/).
2. Set `PAYHERE_MERCHANT_ID`, `PAYHERE_MERCHANT_SECRET`, `PAYHERE_SANDBOX=true`.
3. Set `NEXT_PUBLIC_SITE_URL` to a publicly reachable URL for `notify_url` (e.g. ngrok in local dev).
4. Payment confirmation is driven by `/api/payhere/notify` (not the client callback). On success the order is marked `paid` and inventory is fulfilled via `fulfill_order_inventory`.

## Inventory model

- **Sealed lots** — wholesale bottles available as full-bottle sales.
- **Open lots** — bottles opened for decanting; `remaining_ml` decreases on decant sales.
- Admin can **Receive stock** and **Open for decant** under `/admin/inventory`.

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Development server       |
| `npm run build`| Production build         |
| `npm run start`| Start production server  |
| `npm run lint` | ESLint                   |
