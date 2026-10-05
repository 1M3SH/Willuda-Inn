# Willuda Inn - Luxury Hotel & Resort Management System

A full-stack web application designed for Willuda Inn, featuring a guest booking experience, an administrative back-office management portal, and a RESTful backend API.

---

## Project Structure

```text
Willuda-Inn/
│
├── frontend/
│   │
│   ├── user/                     # Guest-facing web application
│   │   ├── index.html            # Main home page
│   │   ├── confirmation.html     # Booking confirmation view
│   │   ├── about.html            # Hotel story and history
│   │   ├── booking.html          # Reservation workflow
│   │   ├── facilities.html       # Suites, dining, and hall listings
│   │   ├── events.html           # Event halls and packages
│   │   ├── contact.html          # Contact details & inquiries
│   │   ├── login.html            # Guest & staff authentication
│   │   ├── my-bookings.html      # Guest reservation history
│   │   │
│   │   ├── css/                  # Styling & design system
│   │   │   ├── variables.css     # Design tokens and themes
│   │   │   ├── layout.css        # Responsive layouts & grids
│   │   │   ├── components.css    # Reusable UI components
│   │   │   ├── home.css          # Homepage styles
│   │   │   └── style.css         # Core global styles
│   │   │
│   │   ├── js/                   # User application logic
│   │   │   ├── app.js            # App bootstrapper
│   │   │   ├── products.js       # Facility and room loader
│   │   │   ├── cart.js           # Reservation selection state
│   │   │   ├── checkout.js       # Reservation submission
│   │   │   └── main.js           # UI interactions
│   │   │
│   │   └── assets/
│   │       ├── images/           # Hotel imagery and banners
│   │       └── icons/            # SVG / icon assets
│   │
│   └── admin/                    # Administrative management portal
│       ├── index.html            # Admin portal gateway
│       ├── dashboard.html        # Management overview & statistics
│       ├── orders.html           # Bookings management (alias of bookings)
│       ├── products.html         # Facilities & room management
│       ├── users.html            # Guest & customer directory
│       ├── payments.html         # Billing and transactions
│       ├── reports.html          # Revenue and occupancy reports
│       ├── settings.html         # Hotel configurations
│       │
│       ├── css/
│       │   ├── admin.css         # Base admin dashboard styles
│       │   └── components.css    # Admin table & card styles
│       │
│       ├── js/
│       │   ├── admin.js          # Admin runtime initialization
│       │   ├── dashboard.js      # Dashboard charts and metrics
│       │   ├── orders.js         # Booking records operations
│       │   ├── products.js       # Inventory updates
│       │   ├── users.js          # Customer operations
│       │   └── admin-auth.js     # Admin session guard
│       │
│       └── assets/
│           ├── images/           # Admin graphical assets
│           └── icons/            # Admin icons
│
├── backend/                      # Node.js & Express REST API
│   ├── server.js                 # API server entry point
│   ├── package.json              # Node dependencies
│   ├── config/
│   │   └── db.js                 # Database connection pool
│   ├── middleware/
│   │   └── auth.js               # JWT authorization middleware
│   ├── routes/
│   │   ├── auth.js               # Authentication endpoints
│   │   ├── products.js           # Facilities endpoints
│   │   ├── orders.js             # Bookings endpoints
│   │   ├── users.js              # Customers endpoints
│   │   ├── eventRoutes.js        # Events endpoints
│   │   └── paymentRoutes.js      # Payment processing endpoints
│   ├── controllers/              # Business logic controllers
│   └── models/                   # SQL data access layers
│
├── database/
│   └── database.sql              # MySQL database schema & initial data
│
├── .gitignore                    # Git ignored files & directories
└── README.md                     # Documentation
```

---

---

## Getting Started

### 1. Database Setup

#### Option A: Supabase PostgreSQL (Cloud - Recommended)
1. Create a free project at [supabase.com](https://supabase.com).
2. Open the Supabase **SQL Editor** and run [database/postgresql/init_supabase.sql](database/postgresql/init_supabase.sql).
3. Copy your project Transaction pooler `DATABASE_URL` string into `backend/.env`.

#### Option B: Local PostgreSQL
```bash
psql -U postgres -d willuda_inn -f database/postgresql/services/init_all.sql
```

#### Option C: Legacy MySQL
```bash
mysql -u root -p < database/database.sql
```

---

### 2. Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and set your credentials:
   ```bash
   cp .env.example .env
   ```
4. Run tests:
   ```bash
   npm test
   ```
5. Start the server:
   ```bash
   npm run dev
   ```

---

### 3. Frontend Portals
- **Guest Portal:** Open `frontend/user/index.html` in your browser (or use Live Server / Vercel).
- **Admin Portal:** Open `frontend/admin/index.html` or `dashboard.html`.
- Opening root `index.html` automatically forwards to the guest portal.

---

## Cloud Deployment

For step-by-step instructions on deploying the full stack to production:
- **User Frontend:** Vercel
- **Admin Frontend:** Vercel
- **Backend API:** Railway
- **Database:** Supabase PostgreSQL

Please refer to the comprehensive [DEPLOYMENT.md](DEPLOYMENT.md) guide.
