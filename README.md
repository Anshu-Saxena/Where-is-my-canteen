# Where is my Canteen 🎓🍲

> A centralized multi-university campus food discovery and pre-ordering platform built for colleges across India.
> **Tagline:** *"Find. Order. Collect. Enjoy."*

---

## 🌟 Overview & Key Capabilities

- **Zero Queue Pre-Ordering:** Students, college faculty, and campus guests can discover campus canteens, browse rich categorization, and pre-book meals with 15-minute pickup slots.
- **Digital Counter Tokens & QR:** No paper slips or lost receipts. Instant digital token numbers (`T-48`) and QR codes for quick counter pickup.
- **Single Canteen Tray Guarantee:** Built-in safeguards that prevent mixing orders across different campus canteens with friendly replacement dialogs.
- **Multi-University Architecture:** Seamless switching between universities across India (Delhi Technological University, IIT Bombay, BITS Pilani, Anna University, Manipal MAHE) and their distinct campuses.
- **Live Kitchen Operations Board:** Dedicated Canteen Owner dashboard for order intake, cooking timers, and token verification scanning.
- **Institutional Governance:** University Admin and Platform Admin portals to manage campus locations, vendor onboarding approvals, hygiene ratings, and platform health.
- **Modern Indigo + Violet Theme:** Fully responsive, beginner-friendly UI with light/dark theme support and Inter typography.

---

## 🎨 Design Philosophy & Color Palette

- **Primary Color:** `#4F46E5` (Indigo 600)
- **Secondary Color:** `#7C3AED` (Violet 600)
- **Accent Color:** `#60A5FA` (Soft Blue 400)
- **Background:** `#F8FAFC` (Light) / `#0F172A` (Dark)
- **Card Background:** `#FFFFFF` (Light) / `#1E293B` (Dark)
- **Typography:** Inter sans-serif with accessible contrast ratios and touch-friendly mobile targets.

---

## 👥 Supported Roles & Access Portals

| Role | Default Demo Identity | Accessible Portals & Features |
|---|---|---|
| **Student** | Aarav Sharma (`aarav.sharma@dtu.ac.in`) | Student Dashboard, Explore Canteens, Customization Tray, 15-min Slot Booking, Order Tracking, Reviews, Profile |
| **Faculty / Staff** | Dr. Meenakshi Sundaram (`meenakshi.s@dtu.ac.in`) | Express Faculty Pre-Orders, Staff Campus Dining |
| **Guest Visitor** | Campus Guest Visitor | Instant guest discovery and checkout without mandatory account sign-up |
| **Canteen Owner** | Ramesh Sharma (`ramesh.nescafe@campus.in`) | Kitchen Order Board, Live Token Scanner, Menu Management, Slot Capacity Limits, Sales Analytics |
| **University Admin** | Prof. Alok Gupta (`campus.admin@dtu.ac.in`) | University Profile, Campuses, Canteen Licences, Compliance Approvals, Student Feedback |
| **Platform Admin** | Aditi Deshmukh (`superadmin@whereismycanteen.in`) | National Platform Metrics, University Verification, System Health |

*Note: You can easily switch between roles using the user menu dropdown in the top navigation bar at any time.*

---

## 📁 Project Architecture

```
Where is my Canteen/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── canteen/        # CanteenCard, FoodCard
│   │   ├── common/         # ThemeToggle, StatusBadge, EmptyState, LoadingSkeleton
│   │   ├── layout/         # Navbar, Sidebar, BottomNavigation
│   │   ├── modal/          # FoodDetailModal, CartConflictModal
│   │   └── order/          # OrderCard
│   ├── contexts/
│   │   ├── AuthContext.jsx       # Multi-role authentication & user session
│   │   ├── CartContext.jsx       # Single-canteen cart management & calculations
│   │   ├── OrderContext.jsx      # Order lifecycle & live status transitions
│   │   ├── ThemeContext.jsx      # Light / dark theme persistence
│   │   └── UniversityContext.jsx # Universities & campuses selection
│   ├── data/
│   │   └── mockData.js           # Realistic Indian universities, canteens, items, slots
│   ├── layouts/
│   │   └── AppLayout.jsx         # Responsive desktop/mobile shell
│   ├── pages/
│   │   ├── admin/          # University & Platform admin portals
│   │   ├── owner/          # Canteen kitchen dashboard, menu & slot management
│   │   ├── public/         # Landing, Auth, University Selection, About, FAQs
│   │   └── student/        # Discovery, Menu, Tray, Checkout, Tracking, Reviews, Profile
│   ├── routes/
│   │   ├── AppRoutes.jsx         # Protected routing definitions
│   │   └── ProtectedRoute.jsx    # Role guard
│   ├── services/
│   │   └── api.js                # Frontend API service layer
│   ├── utils/
│   │   └── formatters.js         # Indian Rupees (₹) & date-time formatters
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── server/
│   ├── prisma/                   # PostgreSQL schema, migrations and seed data
│   └── src/                      # Express API, authentication and feature routes
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── run-dev.bat
```

---

## 🚀 Running the Project

### Development Server
Run `run-dev.bat` or run:
```bash
pnpm dev
```
The frontend starts at `http://localhost:5173`. Its `/api` requests are proxied to the API on port `3000`.

### Backend API

The Express API is in `server/`. Copy `server/.env.example` to `server/.env`, set a strong `JWT_SECRET`, and provide the PostgreSQL connection string in `DATABASE_URL`. Then run:

```bash
pnpm install
pnpm --filter canteen-api db:validate
pnpm --filter canteen-api db:migrate
pnpm --filter canteen-api db:seed
pnpm dev:api
```

In another terminal, run `pnpm dev` for the frontend. The seed contains the existing university, campus, canteen, menu, slot, and review fixtures. Demo accounts are optional: set `SEED_DEMO_USERS=true` and a `SEED_DEMO_PASSWORD` of at least 12 characters before seeding. The demo sign-in endpoint is disabled in production.

Configure Razorpay only in `server/.env` using `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`. Do not put secret keys in a `VITE_` variable. The payment sandbox is separately controlled by `ENABLE_PAYMENT_SANDBOX`.

Run backend tests with `pnpm test:api`; `pnpm --filter canteen-api check` checks the API entry points. `GET /api/v1/health` is available for a basic server health check.

#### Migration status

Authentication and the student, staff, guest, owner, university-admin, platform-admin, and kiosk workflows are connected to the API. University and campus selection, canteen/menu discovery, favourites, orders, payments, pickup slots and assignments, queue data, combos, express settings, reviews, and admin/owner dashboards use the backend. Browser storage is limited to theme preference, a temporary cart cache, and selected/recent campus IDs. These values are not proof of identity, payment, or order status. Existing browser data is not automatically imported into PostgreSQL; use the approved seed for demo/reference data.

The API tests and frontend production build pass. **The Prisma migration and seed have not yet been run against a live database** because working PostgreSQL credentials are unavailable and Docker Desktop's engine could not be started in this environment. See [README_BACKEND.md](./README_BACKEND.md) for setup and the verified integration status.

### Production Build
```bash
pnpm build
```
Built output is generated in `./dist`.
