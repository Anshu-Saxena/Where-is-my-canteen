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
│   │   └── api.js                # Async service layer ready for real REST/GraphQL backend
│   ├── utils/
│   │   └── formatters.js         # Indian Rupees (₹) & date-time formatters
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
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
node ./node_modules/vite/bin/vite.js
```
The server will start at `http://localhost:5173`.

### Production Build
```bash
node ./node_modules/vite/bin/vite.js build
```
Built output is generated in `./dist`.
