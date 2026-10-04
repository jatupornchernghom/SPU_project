# SPU SkipQ

Pre-order food & live queue management for Sripatum University canteens. Students and staff browse canteen menus, pre-order, pay (mock), and track their order live from "Order Received" to "Ready for Pickup" with a QR code / pickup code — no physical queueing.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, MongoDB (Mongoose), Auth.js v5, and Server-Sent Events for real-time updates.

## 1. Installation

```bash
npm install
```

## 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Description |
| --- | --- |
| `MONGODB_URI` | MongoDB Atlas (or local MongoDB) connection string, including a database name, e.g. `mongodb+srv://user:pass@cluster.mongodb.net/spu-skipq` |
| `AUTH_SECRET` | Secret used by Auth.js to sign session JWTs. Generate one with `npx auth secret` |
| `NEXTAUTH_URL` | Base URL of the app, `http://localhost:3000` in development |

## 3. MongoDB Setup

Use a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster, or run MongoDB locally. Either way, put the connection string (with a database name, e.g. `/spu-skipq`) in `MONGODB_URI`.

## 4. Seed the Database

```bash
npm run seed
```

This clears and repopulates the database with:
- **3 restaurants**: ร้านกะเพรา SPU, ร้านข้าวมันไก่, ร้านอาหารตามสั่ง (5–7 menu items each)
- **4 demo users** (see [Demo Accounts](#6-demo-accounts) below)

## 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 6. Demo Accounts

All demo accounts use the password **`password123`**.

| Email | Role | Notes |
| --- | --- | --- |
| `student@spu.ac.th` | STUDENT | Browse, order, track queue |
| `staff@spu.ac.th` | STAFF | Same customer-facing access as a student |
| `admin@spu.ac.th` | ADMIN | `/admin` — restaurants, menu, orders, stats |
| `restaurant@spu.ac.th` | RESTAURANT_STAFF | `/restaurant/dashboard` — scoped to "ร้านกะเพรา SPU" |

## 7. Project Structure

```text
src/
├── app/                      # Next.js App Router routes
│   ├── (auth)/                 login, register, forgot-password (no header/nav)
│   ├── (customer)/              home, restaurants/[id], cart, checkout, orders, profile, random, notifications
│   ├── restaurant/dashboard/    restaurant staff queue board
│   ├── admin/                   admin dashboard (overview, restaurants, menu, orders)
│   └── api/                     REST route handlers + SSE streams
├── components/
│   ├── ui/                     shadcn/ui primitives
│   ├── restaurant/ menu/ order/ queue/   domain components
│   ├── admin/                  admin CRUD dialogs & tables
│   └── layout/                 header, bottom nav, sidebar, floating cart
├── lib/                        mongodb, auth, eventBus (SSE), validations, cart store, status helpers
├── models/                     Mongoose schemas (User, Restaurant, Menu, Order, Queue, Notification)
├── services/                   business logic (order, queue, restaurant, notification, payment, admin)
└── types/                      shared TypeScript types
scripts/seed.ts                 database seed script
```

## 8. Main API Surface

| Method & Path | Description |
| --- | --- |
| `GET /api/restaurants` | List restaurants (with live active-order counts) |
| `POST /api/restaurants` | Create restaurant (admin) |
| `GET/PATCH/DELETE /api/restaurants/:id` | Restaurant detail / update / delete (admin) |
| `GET /api/restaurants/:id/menu` | Menu for a restaurant |
| `GET /api/restaurants/:id/queue` | Active queue for a restaurant (staff/admin) |
| `GET /api/restaurants/:id/stream` | **SSE** — live order updates for the staff dashboard |
| `POST /api/restaurants/:id/pickup` | Complete an order by pickup code (staff/admin) |
| `POST /api/menu` · `PATCH/DELETE /api/menu/:id` | Menu CRUD (admin) |
| `GET /api/menu/random` | Random menu item from an open restaurant |
| `POST /api/orders` | Create an order (validates stock, runs mock payment, generates queue number + pickup code) |
| `GET /api/orders` | List the current user's orders (or `?restaurantId=` for staff/admin) |
| `GET /api/orders/:id` | Order detail (owner, assigned restaurant staff, or admin only) |
| `PATCH /api/orders/:id/status` | Advance order status (staff/admin) |
| `GET /api/orders/:id/stream` | **SSE** — live status updates for the customer's tracker |
| `GET/PATCH /api/notifications`, `/api/profile` | Notifications & profile settings |
| `POST /api/auth/register` | Create an account |
| `GET/POST /api/auth/[...nextauth]` | Auth.js session endpoints |

Business logic lives in `src/services/*` and is shared between these route handlers — nothing is duplicated between the API layer and the pages that call the services directly.

## 9. Testing the Live Queue

1. Sign in as `student@spu.ac.th` in one browser tab, order from any restaurant, and land on `/orders/[id]`.
2. In a second tab (or incognito window), sign in as `restaurant@spu.ac.th` (orders from "ร้านกะเพรา SPU") and open `/restaurant/dashboard`.
3. Click through **เริ่มปรุง → พร้อมรับ** on the order's row.
4. Watch the first tab — the status timeline, queue badge, and estimated wait update **instantly with no refresh** (pushed over Server-Sent Events). When the order reaches "พร้อมรับ" a QR code and 6-digit pickup code appear.
5. Back on the dashboard, enter the pickup code into "ยืนยันรับอาหารด้วยรหัส" (or use `POST /api/restaurants/:id/pickup`) to complete the order — the customer tab updates to "รับอาหารเรียบร้อยแล้ว" live.

Real-time updates are powered by an in-memory event bus (`src/lib/eventBus.ts`) feeding two SSE route handlers. This is intentionally simple for a single-instance MVP/demo; for a multi-instance production deployment, swap the event bus for MongoDB change streams or a Redis pub/sub channel without changing any calling code.

## 10. Testing the PromptPay QR

The checkout page renders a real, scannable Thai QR Payment (PromptPay) code using **each restaurant's own PromptPay ID** (set per-restaurant in `/admin/restaurants`) for the exact order amount — see **[docs/promptpay-qr.md](docs/promptpay-qr.md)** for setup and how to test it, including with a real banking app and the restaurant-side "ยืนยันรับยอด" payment confirmation step.

## 11. Deploying (demo)

See **[docs/deploy-render.md](docs/deploy-render.md)** for deploying a demo instance to [Render](https://render.com) — chosen specifically because it runs a persistent Node process, which the SSE-based live queue needs (serverless hosts like Vercel would need a different real-time transport).

## Notes

- **Mock payment**: `src/services/payment.service.ts` simulates a gateway (with a small random failure rate) behind a single function, so a real provider can be dropped in later without touching callers. The PromptPay QR (above) is generated independently and doesn't change this.
- **Design system**: colors, type scale, and component patterns are ported from `design-reference/spu_skipq_pulse/DESIGN.md` (a Google Stitch export) into `src/app/globals.css` and Tailwind's `@theme` tokens.
- `npm run lint` and `npm run build` are the fastest way to verify changes compile cleanly.
