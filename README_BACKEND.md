# Backend and API Guide

## Architecture

The browser application is a React/Vite client. It calls the Express API under `/api/v1`; local Vite development proxies these requests to `http://localhost:3000`. The API uses Prisma to read and write PostgreSQL. Razorpay credentials and payment verification remain server-side.

```text
React/Vite
  └── src/services/apiClient.js
        └── Express 5 (/api/v1)
              ├── Authentication and role authorization
              ├── Discovery, canteens, menus and favourites
              ├── Orders, slots, queue and pickup operations
              ├── Reviews, combos, express and admin operations
              └── Razorpay checkout, verification and webhooks
                    └── Prisma Client
                          └── PostgreSQL
```

Prisma models cover universities, campuses, canteens, users and canteen staff, favourites, menu items, pickup slots, combos and their items, express configuration and eligible items, pickup configuration and shelves, orders and order items, payment transactions and events, reviews, and canteen applications. Relations enforce university/campus/canteen ownership and preserve order/payment history.

## Prerequisites

- Node.js 20 or newer
- pnpm
- PostgreSQL 16 or newer, locally or managed
- Optional: Docker Desktop with its engine running
- Optional for real payment checkout: Razorpay test credentials and a publicly reachable webhook URL

## Install and configure

From the project root:

```powershell
pnpm install
Copy-Item server\.env.example server\.env
```

Edit `server/.env` and set `DATABASE_URL` and a randomly generated `JWT_SECRET` of at least 32 characters. Keep this file local; never use `VITE_` variables for secrets.

The API reads:

| Variable | Purpose |
|---|---|
| `PORT` | API port; defaults to `3000`. |
| `NODE_ENV` | Set to `production` for deployment. |
| `WEB_ORIGIN` | Comma-separated allowed browser origins. |
| `DATABASE_URL` | PostgreSQL connection URL, including `?schema=public`. |
| `JWT_SECRET` | Secret used to sign 12-hour sessions; minimum 32 characters. |
| `ENABLE_DEMO_AUTH` | Enables seeded role-based demo sign-in outside production. |
| `SEED_DEMO_USERS` | Opts into adding demo accounts during seeding. |
| `SEED_DEMO_PASSWORD` | Password for seeded demo accounts; minimum 12 characters. |
| `ENABLE_PAYMENT_SANDBOX` | Enables simulated outcomes only outside production. |
| `RAZORPAY_KEY_ID` | Razorpay public key ID, exposed to the client by the config endpoint. |
| `RAZORPAY_KEY_SECRET` | Server-only Razorpay API secret. |
| `RAZORPAY_WEBHOOK_SECRET` | Server-only secret used to verify webhook signatures. |

### PostgreSQL

For an existing PostgreSQL server, create a database and set a URL such as:

```text
postgresql://wmc_user:YOUR_PASSWORD@localhost:5432/where_is_my_canteen?schema=public
```

If local PostgreSQL is unavailable and Docker Desktop is running, a disposable development database can be started on port 5433 (port 5432 may already be occupied):

```powershell
docker run --name wmc-postgres `
  -e POSTGRES_USER=wmc `
  -e POSTGRES_PASSWORD=dev-only-change-this `
  -e POSTGRES_DB=where_is_my_canteen `
  -p 5433:5432 `
  -v wmc-postgres-data:/var/lib/postgresql/data `
  -d postgres:16-alpine
```

Use the matching local URL:

```text
postgresql://wmc:dev-only-change-this@localhost:5433/where_is_my_canteen?schema=public
```

Replace the example password with a private local value. These commands create a persistent named volume; remove the container/volume only when you intentionally want to discard its development data.

## Migrations and seed data

Run from the project root:

```powershell
pnpm --dir server db:validate
pnpm --dir server db:generate
pnpm --dir server db:migrate
pnpm --dir server db:seed
```

`db:migrate` uses Prisma's development migration workflow and requires a reachable database. Use `pnpm --dir server exec prisma migrate deploy` in production after deploying reviewed migration files; do not use `migrate dev` against production.

The seed inserts the approved university, campus, canteen, menu, slot, combo/feature and review fixtures from the repository. Demo users are opt-in: set `SEED_DEMO_USERS=true` and a `SEED_DEMO_PASSWORD` of at least 12 characters before running the seed. Re-running the seed is designed to upsert the reference data. Do not copy arbitrary browser storage into the database or treat it as verified accounts, genuine orders, or successful payments.

## Start the application

Start the API in one terminal:

```powershell
pnpm dev:api
```

Start the frontend in another:

```powershell
pnpm dev
```

The frontend is served at `http://localhost:5173`, the API at `http://localhost:3000`, and `GET http://localhost:3000/api/v1/health` is a basic health check. Vite proxies `/api` requests to the local API. To use a different API origin, set the frontend build-time variable `VITE_API_BASE_URL`; browser requests include credentials, so configure `WEB_ORIGIN` to match.

Run checks:

```powershell
pnpm test:api
pnpm --dir server check
pnpm build
```

## API reference

All paths below are prefixed with `/api/v1`. Requests and responses use JSON unless noted. Authenticated browser calls use the `wmc_session` HttpOnly cookie. Role-restricted endpoints enforce permissions on the server.

| Area | Methods and paths | Access / purpose |
|---|---|---|
| Health | `GET /health` | API liveness. |
| Authentication | `POST /auth/register`, `POST /auth/login`, `POST /auth/demo`, `GET /auth/me`, `POST /auth/logout` | Register student/staff accounts, sign in/out, or use development demo accounts. |
| User | `GET /users/me/favourites`, `PUT /users/me/favourites/:canteenId` | Authenticated user's saved canteens. |
| Discovery | `GET /universities`, `GET /universities/:id`, `GET /campuses/:campusId/canteens`, `GET /canteens/:id`, `GET /canteens/:id/menu` | Database-backed university, campus, canteen and menu data. |
| Reviews | `GET /canteens/:canteenId/reviews`, `POST /canteens/:canteenId/reviews`, `PATCH /owner/reviews/:reviewId/response` | Read reviews; eligible signed-in diners review completed orders; the canteen owner replies. |
| Pickup slots | `GET /canteens/:canteenId/slots?date=YYYY-MM-DD`, `POST /owner/canteens/:canteenId/slots`, `PATCH /owner/canteens/:canteenId/slots/:slotId`, `DELETE /owner/canteens/:canteenId/slots/:slotId` | Public slot availability; assigned owner manages capacity and availability. |
| Express | `GET /canteens/:canteenId/express`, `PUT /owner/canteens/:canteenId/express` | Read and persist express counter settings and eligible menu items. |
| Combos | `GET /canteens/:canteenId/combos`, `POST /owner/canteens/:canteenId/combos`, `PATCH /owner/canteens/:canteenId/combos/:comboId`, `PATCH /owner/canteens/:canteenId/combos/:comboId/availability`, `DELETE /owner/canteens/:canteenId/combos/:comboId` | Read combos; assigned owner manages combo data. |
| Pickup configuration | `GET /canteens/:canteenId/pickup`, `PUT /owner/canteens/:canteenId/pickup` | Read and persist shelf and pickup instructions. |
| Menu management | `POST /owner/canteens/:canteenId/menu`, `PATCH /owner/canteens/:canteenId/menu/:itemId`, `DELETE /owner/canteens/:canteenId/menu/:itemId` | Assigned owner manages menu items. |
| Orders and queue | `POST /orders`, `POST /kiosk/orders`, `GET /orders`, `GET /orders/:orderId`, `POST /orders/:orderId/cancel`, `PATCH /owner/orders/:orderId/status`, `PATCH /owner/orders/:orderId/shelf`, `POST /owner/orders/:orderId/collect`, `GET /canteens/:canteenId/queue` | Student/staff/guest ordering; kiosk ordering; authenticated order history; owner lifecycle and shelf operations; live queue derived from persisted orders. |
| Payments | `GET /payments/config`, `POST /orders/:orderId/payments`, `POST /kiosk/orders/:orderId/payments`, `POST /payments/verify`, `POST /kiosk/payments/verify`, `POST /orders/:orderId/payments/sandbox`, `POST /kiosk/orders/:orderId/payments/sandbox`, `POST /payments/webhook`, `GET /orders/:orderId/payments`, `GET /owner/canteens/:canteenId/payments`, `POST /orders/:orderId/refund` | Initialize checkout, verify signatures, receive Razorpay events, inspect transactions, or use the non-production sandbox. |
| Owner analytics | `GET /owner/canteens/:canteenId/analytics` | Assigned canteen owner; persisted orders/payments inform metrics. |
| University admin | `GET /admin/university/dashboard`, `GET /admin/campuses`, `POST /admin/campuses`, `PATCH /admin/applications/:applicationId`, `GET /admin/users`, `GET /admin/analytics` | University-scoped dashboard and campus/application administration. |
| Platform admin | `GET /admin/platform/dashboard`, `GET /admin/universities`, `PATCH /admin/universities/:universityId/verification`, `GET /admin/users`, `GET /admin/analytics` | Platform metrics and university verification. |

Validation failures and other API errors use a JSON `error` object with a stable `code` and human-readable `message`. Order totals and menu prices are resolved by the server; clients must not treat a submitted price or local state as authoritative.

## Razorpay test integration

1. Create Razorpay **test-mode** API keys and put them in `server/.env` as `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
2. Keep `ENABLE_PAYMENT_SANDBOX` only for local/test simulations; the sandbox is disabled when `NODE_ENV=production`.
3. Ensure the API and database are running. The frontend fetches public checkout configuration from `GET /payments/config`.
4. Complete checkout with Razorpay's test instruments. The client sends the returned payment ID, gateway order ID, and signature to `POST /payments/verify`; the backend validates the signature before marking the order paid.
5. Do not report real gateway processing as tested unless an actual configured Razorpay test transaction has completed successfully. Automated API tests use controlled test doubles and do not prove live gateway connectivity.

## Webhook configuration

Expose `POST https://YOUR_API_HOST/api/v1/payments/webhook` over HTTPS in the Razorpay dashboard. Configure the same webhook secret in `RAZORPAY_WEBHOOK_SECRET` and subscribe to payment capture/failure and refund events (`payment.captured`, `payment.failed`, `refund.created`, `refund.processed`). The API validates the raw request body against `x-razorpay-signature`, requires the Razorpay event ID, and handles duplicate event IDs idempotently. Keep webhook secrets server-only and verify delivery/retries in the Razorpay dashboard.

## Production deployment and security checklist

- Deploy the API behind HTTPS and set `NODE_ENV=production`, the exact allowed `WEB_ORIGIN`, and a strong random `JWT_SECRET` (32+ characters).
- Use a managed PostgreSQL database with TLS, least-privilege credentials, backups, and a private `DATABASE_URL` secret.
- Deploy reviewed Prisma migrations with `pnpm --dir server exec prisma migrate deploy`; do not run the development seed or enable demo accounts in production.
- Configure Razorpay live credentials and a production webhook secret through the deployment secret manager. Set `ENABLE_PAYMENT_SANDBOX=false`.
- Restrict network access to the database; never expose database or Razorpay secrets to the frontend.
- Keep authentication in the HttpOnly, SameSite cookie; serve over HTTPS so production cookies use `Secure`. The API checks roles and university/canteen ownership server-side.
- Add deployment-specific rate limiting, monitoring/alerting, log retention, backup/restore drills, and secret rotation before public launch. Confirm infrastructure sizing and payment/refund operations with the deployment owner.
- Verify `/api/v1/health`, migration status, webhook delivery, and end-to-end ordering in the target environment before launch.

## Verified status and remaining environment dependency

The latest automated check completed with **23 API tests passing** and a successful Vite production build. The build still reports an existing large JavaScript chunk warning. Prisma schema validation and client generation pass, and the initial SQL migration is generated.

**A live PostgreSQL connection, migration, seed, database-backed end-to-end workflow, and real Razorpay transaction have not been verified.** In this environment the local PostgreSQL service listens on port 5432, but no usable database credentials or `DATABASE_URL` are configured. Docker Desktop is installed, but its engine returned an internal-server error on startup. To finish those checks, start a working PostgreSQL/Docker service with credentials available to this project, then follow the migration and test commands above.
