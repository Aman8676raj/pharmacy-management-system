# PharmaCore - Pharmacy Management System (PMS)
## Phase 1: Project Foundation & Authentication
## Phase 2: Medicine Management

A modern, full-stack Pharmacy Management System built with **React.js (Vite)**, **Node.js**, **Express.js**, and **MongoDB (Mongoose)**. 

PharmaCore delivers a clean, professional SaaS dashboard designed specifically for single-pharmacy administration. Phase 1 provides the architectural foundation with JWT `HttpOnly` cookie authentication and role-based access control. Phase 2 implements a complete, enterprise-grade **Medicine Management** module with full CRUD operations, live MongoDB data integration, pagination, multi-field search, category and manufacturer filtering, soft deactivation, and real-time dashboard analytics.

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
├── package.json                         # Root convenience scripts
├── README.md                            # Comprehensive project documentation
├── backend/
│   ├── .env                             # Environment configuration (git-ignored)
│   ├── .env.example                     # Environment template
│   ├── package.json                     # Backend dependencies, dev & test scripts
│   ├── server.js                        # Server entry point & DB startup
│   ├── app.js                           # Express application & middleware setup
│   ├── config/
│   │   └── db.js                        # Mongoose MongoDB connection handler
│   ├── controllers/
│   │   ├── authController.js            # Controller for login, register, me, logout
│   │   └── medicineController.js        # Controller for medicine CRUD, search & stats
│   ├── middleware/
│   │   ├── authMiddleware.js            # protect & authorize (RBAC) middlewares
│   │   ├── errorMiddleware.js           # Centralized 404 & global error handlers
│   │   └── validateMiddleware.js        # express-validator result formatter
│   ├── models/
│   │   ├── Medicine.js                  # Mongoose Medicine model with indexes
│   │   └── User.js                      # Mongoose User model with safe serialization
│   ├── routes/
│   │   ├── authRoutes.js                # Auth endpoint definitions & validations
│   │   ├── medicineRoutes.js            # Medicine endpoint definitions & validations
│   │   └── index.js                     # Root API router & health check
│   ├── services/
│   │   ├── authService.js               # User & authentication business logic
│   │   └── medicineService.js           # Medicine catalog & search business logic
│   ├── uploads/
│   │   └── .gitkeep                     # Directory for file uploads
│   └── utils/
│       ├── apiResponse.js               # Standardized JSON response helpers
│       ├── generateToken.js             # JWT signing & HttpOnly cookie utility
│       ├── logger.js                    # Request/event logger
│       ├── seed.js                      # Database seeder for demo accounts & medicines
│       └── testMedicines.js             # Automated 16-scenario test runner
└── frontend/
    ├── .env                             # Frontend environment configuration
    ├── .env.example                     # Frontend environment template
    ├── index.html                       # Vite HTML entry point
    ├── package.json                     # Frontend dependencies & build scripts
    ├── postcss.config.js                # PostCSS configuration
    ├── tailwind.config.js               # Tailwind theme & color configurations
    ├── vite.config.js                   # Vite configuration
    └── src/
        ├── App.jsx                      # Router & ProtectedRoute hierarchy
        ├── main.jsx                     # React DOM entry point
        ├── index.css                    # Tailwind directives & custom scrollbars
        ├── assets/                      # Static assets
        ├── components/
        │   ├── common/
        │   │   ├── Alert.jsx            # Alert banner component
        │   │   ├── Badge.jsx            # Semantic role & status badges
        │   │   ├── Button.jsx           # Button with spinner & variants
        │   │   ├── Card.jsx             # Card container
        │   │   ├── Input.jsx            # Form input with icons & password toggle
        │   │   ├── Modal.jsx            # Accessible modal dialog
        │   │   ├── ProtectedRoute.jsx   # Route guard & public route wrapper
        │   │   └── Spinner.jsx          # Circular loading spinner
        │   ├── dashboard/
        │   │   ├── ExpiringMedicinesPreview.jsx # Batch expiry preview
        │   │   ├── LowStockPreview.jsx          # Stock threshold alerts
        │   │   ├── RecentTransactionsTable.jsx  # Recent sales POS table
        │   │   ├── SalesOverviewChart.jsx       # Recharts revenue area chart
        │   │   └── StatCard.jsx                 # Summary metric card
        │   ├── layout/
        │   │   ├── Sidebar.jsx          # Responsive navigation sidebar
        │   │   └── TopNav.jsx           # Top navbar with breadcrumb & profile
        │   └── medicines/
        │       ├── MedicineDetailsModal.jsx # Quick view preview modal
        │       ├── MedicineFilters.jsx  # Search, category, manufacturer & status filters
        │       ├── MedicineForm.jsx     # Multi-section medicine creation/edit form
        │       ├── MedicineStats.jsx    # Metric cards for active/inactive/Rx counts
        │       └── MedicineTable.jsx    # Responsive data table with pagination & actions
        ├── context/
        │   └── AuthContext.jsx          # React context for auth session state
        ├── hooks/
        │   └── useAuth.js            # Custom auth hook
        ├── layouts/
        │   ├── AuthLayout.jsx        # Clean authentication page layout
        │   └── MainLayout.jsx        # Admin dashboard shell with navigation
        ├── pages/
        │   ├── auth/
        │   │   └── LoginPage.jsx        # Login page with demo role quick-fill
        │   ├── dashboard/
        │   │   └── DashboardPage.jsx    # Real-time analytics & recently added medicines
        │   └── medicines/
        │       ├── AddMedicinePage.jsx      # Medicine registration form
        │       ├── EditMedicinePage.jsx     # Medicine update form
        │       ├── MedicineDetailsPage.jsx  # Structured clinical profile view
        │       └── MedicineListPage.jsx     # Master catalog table with filters
        ├── services/
        │   ├── api.js                # Axios client with credentials & interceptors
        │   ├── authService.js        # Auth API client
        │   └── medicineService.js    # Medicine API client
        └── utils/
            ├── constants.js          # Navigation list, roles, sample mock data, dosage forms
            └── formatters.js         # Currency, date, and name helpers
```

---

## 3. Medicine Data Model

The Mongoose Medicine model (`backend/models/Medicine.js`) contains:

| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | String | Trade / Medicine name (required, max 120 chars) |
| `genericName` | String | Active pharmaceutical entity / international nonproprietary name |
| `brandName` | String | Commercial brand name |
| `category` | String | Therapeutic category (required, e.g. Antibiotics, Analgesics) |
| `manufacturer` | String | Manufacturing laboratory / pharmaceutical supplier |
| `description` | String | Clinical indications and precautions (max 1000 chars) |
| `composition` | String | Detailed chemical composition (e.g. Paracetamol 500mg, Caffeine 30mg) |
| `dosageForm` | String | Dosage form (Tablet, Capsule, Syrup, Injection, Cream, Drops, Inhaler, etc.) |
| `strength` | String | Formulation strength (e.g. 500mg, 250mg/5ml, 1%) |
| `packSize` | String | Packaging presentation (e.g. 10x10 Tablets, 100ml Bottle) |
| `unit` | String | Dispensing unit (Strip, Bottle, Box, Piece, Tube, Vial, Ampoule, etc.) |
| `barcode` | String | Unique barcode (EAN / UPC / Code 128) - sparse indexed |
| `sku` | String | Unique SKU identifier (required, uppercase, indexed) |
| `requiresPrescription` | Boolean | Doctor prescription requirement flag (Rx vs OTC) |
| `minimumStock` | Number | Low-stock alert threshold (min: 0, default: 10) |
| `isActive` | Boolean | Soft-deletion flag (default: true) |
| `createdBy` | ObjectId | Reference to `User` model who created the record |
| `timestamps` | Date | `createdAt` and `updatedAt` managed automatically by Mongoose |

---

## 4. Role-Based Access Control (RBAC)

The Medicine Management module enforces strict role-based permissions:

| Role | View & Search | Add Medicine | Edit Medicine | Deactivate (Soft Delete) |
| :--- | :---: | :---: | :---: | :---: |
| **Administrator** | ✅ Full Access | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| **Pharmacist** | ✅ Full Access | ✅ Allowed | ✅ Allowed | ❌ Restricted |
| **Inventory Manager**| ✅ Full Access | ✅ Allowed | ✅ Allowed | ❌ Restricted |
| **Cashier** | ✅ View & Search | ❌ Restricted | ❌ Restricted | ❌ Restricted |

*Note: Cashier accounts can browse, search, and view complete details of medications, but creation, editing, and deactivation buttons are hidden on the UI and strictly rejected with `403 Forbidden` on the backend APIs.*

---

## 5. API Reference

All responses use the standard JSON response format:
```json
{
  "success": true,
  "message": "Human readable status",
  "data": { ... }
}
```

### Medicine Endpoints

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/medicines` | Admin, Pharmacist, Inventory Mgr | Register a new medicine with SKU and barcode validation |
| `GET` | `/api/medicines` | All Authenticated Staff | Paginated list with search, category, manufacturer, and status filters |
| `GET` | `/api/medicines/search` | All Authenticated Staff | Fast autocomplete search across name, generic, brand, and SKU |
| `GET` | `/api/medicines/filter-options` | All Authenticated Staff | Distinct categories, manufacturers, and dosage forms for filters |
| `GET` | `/api/medicines/stats` | All Authenticated Staff | Real-time counts of active/inactive medicines, categories, and recent records |
| `GET` | `/api/medicines/:id` | All Authenticated Staff | Complete medicine profile and creator details |
| `PUT` | `/api/medicines/:id` | Admin, Pharmacist, Inventory Mgr | Update medicine fields with SKU/barcode collision checks |
| `DELETE` | `/api/medicines/:id` | Admin Only | Soft-delete medicine (`isActive = false`) |

---

## 6. Installation, Seeding & Execution

### Step 1: Install Dependencies
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### Step 2: Seed Database with Demo Accounts and Initial Medicines
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
[Seed] Seeding initial medicines...
  -> Seeded Medicine: [MED-PARA-500] Paracetamol 500mg (Analgesics)
  -> Seeded Medicine: [MED-AMOX-500] Amoxicillin 500mg (Antibiotics)
  -> Seeded Medicine: [MED-CETI-010] Cetirizine 10mg (Antihistamines)
  -> Seeded Medicine: [MED-METF-500] Metformin 500mg (Antidiabetic)
  ...
[Seed] Seeding completed successfully!
```

### Step 3: Run the Application
**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
# Server running at http://localhost:5000/api
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
# Vite client running at http://localhost:5173
```

---

## 7. Automated Testing

Run the automated test runner to verify all 16 Phase 2 scenarios:
```bash
cd backend
npm test
```

### Test Scenarios Verified

| # | Scenario | Verification | Result |
|---|:---|:---|:---:|
| 1 | Admin adds a medicine successfully | Status 201, medicine object returned | **PASS** |
| 2 | Pharmacist adds a medicine successfully | Status 201, medicine created | **PASS** |
| 3 | Cashier cannot add medicines | Status 403 Forbidden | **PASS** |
| 4 | Duplicate SKU is rejected | Status 400 Bad Request, conflict error | **PASS** |
| 5 | Duplicate barcode is rejected | Status 400 Bad Request, barcode error | **PASS** |
| 6 | Medicine listing works | Status 200, array of medicines and pagination | **PASS** |
| 7 | Search works with partial names | Status 200, query 'para' finds Paracetamol | **PASS** |
| 8 | Category filtering works | Status 200, category 'Antibiotics' matches | **PASS** |
| 9 | Manufacturer filtering works | Status 200, manufacturer 'Pfizer' matches | **PASS** |
| 10 | Pagination works | Status 200, page=1&limit=2 returns 2 items | **PASS** |
| 11 | Medicine details load correctly | Status 200, populated creator details | **PASS** |
| 12 | Medicine updates work | Status 200, updated fields reflected | **PASS** |
| 13 | Medicine deactivation works | Status 200, sets `isActive = false` | **PASS** |
| 14 | Inactive medicines excluded by default | Status 200, normal listing omits deactivated | **PASS** |
| 15 | Unauthenticated requests are rejected | Status 401 Unauthorized | **PASS** |
| 16 | Invalid medicine IDs return errors | Status 400 for bad ID, 404 for non-existent | **PASS** |

---

## 8. Dashboard Live Data Integration

In Phase 2, the **Dashboard** is directly connected to MongoDB:
- **Total Medicines Card**: Connects to the real database count of active medicines.
- **Formulary Metrics**: Displays total categories and number of deactivated records.
- **Recently Added Medicines**: Live table displaying the latest medications registered in MongoDB with direct links to full details.
- **Phase Separation**: Sales & Billing and Supplier Orders remain clearly identified as Phase 3 / Phase 4 sample previews.
