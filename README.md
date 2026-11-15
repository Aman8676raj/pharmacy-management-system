# PharmaCore - Pharmacy Management System (PMS)
## Phase 1: Project Foundation & Authentication

A modern, full-stack Pharmacy Management System built with **React.js (Vite)**, **Node.js**, **Express.js**, and **MongoDB (Mongoose)**. 

PharmaCore delivers a clean, professional SaaS dashboard designed specifically for pharmacy administration. Phase 1 provides a robust architectural foundation with JWT HttpOnly cookie authentication, role-based access control (RBAC), protected routing, and an interactive analytics dashboard.

---

## 1. Technology Stack

### Frontend
- **Framework & Tooling**: [React 18](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Language**: JavaScript (JSX)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/)
- **Routing**: [React Router DOM v6](https://reactrouter.com/)
- **HTTP Client**: [Axios](https://axios-http.com/) (configured with `withCredentials: true` for HttpOnly cookies)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Visualization**: [Recharts v2](https://recharts.org/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (v22+)
- **Server Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose ODM](https://mongoosejs.com/)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) stored in secure `HttpOnly` cookies
- **Password Hashing**: `bcryptjs` / `bcrypt` with salt rounds
- **Input Validation**: `express-validator`
- **Security & Utilities**: `cors`, `cookie-parser`, `dotenv`, `morgan`
- **Development Tooling**: `nodemon`

*Note: No TypeScript, Next.js, Prisma, PostgreSQL, Redis, or microservices are used in accordance with project specifications.*

---

## 2. Project Directory Structure

```
PMS/
├── .gitignore
├── package.json               # Root convenience scripts
├── README.md
├── backend/
│   ├── .env                   # Environment variables (excluded from git)
│   ├── .env.example           # Example environment template
│   ├── package.json           # Backend dependencies and scripts
│   ├── app.js                 # Express application & middleware setup
│   ├── server.js              # Server entry point & DB connection
│   ├── config/
│   │   └── db.js              # Mongoose MongoDB connection handler
│   ├── controllers/
│   │   └── authController.js  # Controller for login, register, me, logout
│   ├── middleware/
│   │   ├── authMiddleware.js  # protect & authorize (RBAC) middlewares
│   │   ├── errorMiddleware.js # Centralized 404 & global error handlers
│   │   └── validateMiddleware.js # express-validator error formatter
│   ├── models/
│   │   └── User.js            # Mongoose User model with safe serialization
│   ├── routes/
│   │   ├── authRoutes.js      # Auth endpoint definitions & validations
│   │   └── index.js           # API route root & health check
│   ├── services/
│   │   └── authService.js     # Business logic & user management
│   ├── uploads/
│   │   └── .gitkeep           # Uploads directory
│   └── utils/
│       ├── apiResponse.js     # Standardized JSON response helper
│       ├── generateToken.js   # JWT signing & HttpOnly cookie utility
│       ├── logger.js          # Application request logger
│       └── seed.js            # Database seeder for demo accounts
└── frontend/
    ├── .env                   # Frontend environment configuration
    ├── .env.example           # Example frontend environment template
    ├── index.html             # Vite HTML entry point
    ├── package.json           # Frontend dependencies & build scripts
    ├── postcss.config.js      # PostCSS configuration
    ├── tailwind.config.js     # Tailwind CSS theme & typography configuration
    ├── vite.config.js         # Vite configuration with proxy / host settings
    └── src/
        ├── App.jsx            # Routing and application root
        ├── main.jsx           # React DOM root entry
        ├── index.css          # Tailwind base & custom scrollbar directives
        ├── assets/            # Static assets
        ├── components/
        │   ├── common/
        │   │   ├── Alert.jsx         # Status alert messages
        │   │   ├── Badge.jsx         # Semantic status & role badges
        │   │   ├── Button.jsx        # Buttons with variants and spinners
        │   │   ├── Card.jsx          # Styled SaaS containers
        │   │   ├── Input.jsx         # Inputs with icons and password toggle
        │   │   ├── Modal.jsx         # Accessible modal dialog
        │   │   ├── ProtectedRoute.jsx# Auth guard & redirect wrapper
        │   │   └── Spinner.jsx       # Loading indicator
        │   ├── dashboard/
        │   │   ├── ExpiringMedicinesPreview.jsx # Batch expiry preview
        │   │   ├── LowStockPreview.jsx          # Stock threshold alerts
        │   │   ├── RecentTransactionsTable.jsx  # POS transactions table
        │   │   ├── SalesOverviewChart.jsx       # Recharts revenue area chart
        │   │   └── StatCard.jsx                 # Summary metric card
        │   └── layout/
        │       ├── Sidebar.jsx       # Responsive navigation drawer
        │       └── TopNav.jsx        # Breadcrumb, search, notifs, profile
        ├── context/
        │   └── AuthContext.jsx       # React context for auth state & user session
        ├── hooks/
        │   └── useAuth.js            # Custom auth hook
        ├── layouts/
        │   ├── AuthLayout.jsx        # Clean layout for sign-in
        │   └── MainLayout.jsx        # Admin dashboard shell with navigation
        ├── pages/
        │   ├── auth/
        │   │   └── LoginPage.jsx     # Login page with demo role quick-fill
        │   └── dashboard/
        │       └── DashboardPage.jsx # Pharmacy analytics & operational view
        ├── services/
        │   ├── api.js                # Axios client with credentials & interceptors
        │   └── authService.js        # Auth API client functions
        └── utils/
            ├── constants.js          # Navigation list, roles, sample mock data
            └── formatters.js         # Currency, date, and name helpers
```

---

## 3. Installation and Execution

### Prerequisites
- **Node.js**: v18.0.0 or higher (v22+ tested)
- **npm**: v9.0.0 or higher
- **MongoDB**: Community Server running locally on `mongodb://127.0.0.1:27017`

### Step 1: Clone or Open Project
```bash
cd PMS
```

### Step 2: Configure Environment Variables

**Backend (`backend/.env`):**
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/pharmacy_management
JWT_SECRET=pharmacy_super_secure_jwt_secret_phase1_2026
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
```

*(Note: `.env.example` templates are provided in both directories. `.env` files are git-ignored).*

### Step 3: Install Dependencies

```bash
# Install backend packages
cd backend
npm install

# Install frontend packages
cd ../frontend
npm install
```

### Step 4: Seed Demo Staff Accounts

Run the database seed script to populate demo accounts covering all 4 system roles:
```bash
cd backend
npm run seed
```
Output:
```
[Seed] Connected to MongoDB
[Seed] Seeding demo accounts...
  -> Created ADMIN: admin@pharmacy.com
  -> Created PHARMACIST: pharmacist@pharmacy.com
  -> Created CASHIER: cashier@pharmacy.com
  -> Created INVENTORY_MANAGER: inventory@pharmacy.com
[Seed] Seeding completed successfully!
```

**Demo Credentials (for all accounts):**
- Password: `Password@123`
- Pre-configured accounts:
  1. **Administrator**: `admin@pharmacy.com`
  2. **Pharmacist**: `pharmacist@pharmacy.com`
  3. **Cashier**: `cashier@pharmacy.com`
  4. **Inventory Manager**: `inventory@pharmacy.com`

*(A quick-fill button is also built directly into the login screen for one-click testing).*

### Step 5: Start the Applications

**Run Backend (Terminal 1):**
```bash
cd backend
npm run dev
# Starts server with nodemon on http://localhost:5000
```

**Run Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
# Starts Vite development server on http://localhost:5173
```

**Production Build:**
```bash
cd frontend
npm run build
```

---

## 4. Authentication & Security Architecture

### Authentication Mechanism
- **JWT Storage**: Tokens are stored strictly in `HttpOnly`, `SameSite` cookies with `secure` flag enabled in production. This eliminates client-side XSS token theft vulnerabilities.
- **Header Fallback**: The backend also supports `Authorization: Bearer <token>` for API test runners (Postman, curl).
- **Password Security**: Passwords are salted and hashed using `bcrypt` / `bcryptjs` (cost factor 10) prior to storage.
- **Data Protection**: Password hashes are set with `{ select: false }` on the Mongoose schema and stripped via `.toSafeObject()` and `.toJSON()` transforms. No password or hash is ever leaked in API responses.
- **Session Hydration**: On application mount, `AuthContext` calls `GET /api/auth/me` to safely verify the session cookie.
- **Remember-Me**: The "Remember my email" feature only remembers the user's email string in local storage—never passwords or tokens.

### Role-Based Access Control (RBAC)
Four primary pharmacy roles are established:
| Role | Access Scope |
| :--- | :--- |
| `admin` | Full system access across all operational, financial, and configuration modules |
| `pharmacist` | Operational access to medicine dispensing, inventory status, and prescriptions |
| `cashier` | Billing-related access, POS checkouts, customer invoices, and daily registers |
| `inventory_manager` | Warehouse stock control, purchase orders, supplier coordination, and batch tracking |

### Registration Restriction
- `POST /api/auth/register` prevents public self-registration.
- If the database contains **zero users**, the initial setup of the first administrator account is permitted.
- Once users exist, registration is strictly restricted to authenticated users holding the `admin` role.

---

## 5. API Reference

All responses use a standardized JSON envelope:
```json
{
  "success": true,
  "message": "Human readable status",
  "data": { ... }
}
```

### Endpoints Implemented

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System and API health check |
| `POST` | `/api/auth/login` | Public | Authenticates credentials and sets HttpOnly JWT cookie |
| `POST` | `/api/auth/logout` | Public / Private | Clears HttpOnly cookie |
| `GET` | `/api/auth/me` | Protected | Returns authenticated user profile |
| `POST` | `/api/auth/register` | Restricted | Admin or initial setup only; creates new staff account |
| `GET` | `/api/auth/setup-status` | Public | Checks if system requires initial admin setup |

---

## 6. Frontend Features & Design System

- **Clean SaaS Aesthetic**: Light-gray (`bg-slate-50`) background, deep navy typography (`text-slate-900`), and subtle teal/blue accent colors.
- **Sidebar Navigation**:
  - `Dashboard`: Fully functional.
  - `Medicines`, `Inventory`, `Suppliers`, `Purchases`, `Sales & Billing`, `Customers`, `Prescriptions`, `Reports`, `Settings`: Visually present with clear "Coming Soon" badges and non-functional states for Phase 1.
  - `Sign Out`: Clears session and redirects to `/login`.
- **Top Navigation Bar**:
  - Breadcrumbs & Page title.
  - Search field (visual preview for Phase 2).
  - Notification icon with sample alert items dropdown.
  - User profile dropdown showing avatar, name, email, role badge, and role access modal trigger.
- **Interactive Dashboard**:
  - **4 Stat Cards**: Total Medicines, Today's Sales, Low Stock Medicines, Total Suppliers.
  - **Sales Overview Chart**: Rendered with Recharts AreaChart with smooth gradient fills and Weekly/Monthly toggles.
  - **Recent Transactions Table**: Professional responsive table with status pills.
  - **Low Stock Preview**: Visual progress indicators and urgency badges.
  - **Expiring Medicines Preview**: Batch-level expiration tracking with warning badges.
  - **Explicit Sample Data Notice**: Clear visual banner informing the reviewer that dashboard metrics are mock samples for Phase 1 visual validation.
