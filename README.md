# PharmaCore - Pharmacy Management System (PMS)
## Phase 1: Project Foundation & Authentication
## Phase 2: Medicine Management
## Phase 3: Inventory Management (Batch Tracking, FEFO & Audit Movements)

A modern, full-stack Pharmacy Management System built with **React.js (Vite)**, **Node.js**, **Express.js**, and **MongoDB (Mongoose)**. 

PharmaCore delivers a clean, professional SaaS dashboard designed specifically for single-pharmacy administration.
- **Phase 1** established the architectural foundation with JWT `HttpOnly` cookie authentication and role-based access control.
- **Phase 2** implemented an enterprise-grade **Medicine Management** module with full CRUD operations, live MongoDB data integration, pagination, multi-field search, category and manufacturer filtering, soft deactivation, and real-time dashboard analytics.
- **Phase 3** implements complete **Inventory Management** featuring batch-wise stock intake, audit movement history, FEFO (First Expiry, First Out) dispatch preview, low-stock threshold alerts, automated expiry status transitions, and quarantine/release workflows.

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
│   │   ├── medicineController.js        # Controller for medicine CRUD, search & stats
│   │   └── inventoryController.js       # Controller for stock-in, adjust, quarantine, FEFO
│   ├── middleware/
│   │   ├── authMiddleware.js            # protect & authorize (RBAC) middlewares
│   │   ├── errorMiddleware.js           # Centralized 404 & global error handlers
│   │   └── validateMiddleware.js        # express-validator result formatter
│   ├── models/
│   │   ├── Medicine.js                  # Mongoose Medicine formulary model
│   │   ├── MedicineBatch.js             # Mongoose MedicineBatch model (lots, FEFO, pricing)
│   │   ├── InventoryTransaction.js      # Mongoose InventoryTransaction model (immutable audit log)
│   │   └── User.js                      # Mongoose User model with safe serialization
│   ├── routes/
│   │   ├── authRoutes.js                # Auth endpoint definitions & validations
│   │   ├── medicineRoutes.js            # Medicine endpoint definitions & validations
│   │   ├── inventoryRoutes.js           # Inventory stock endpoints & validations
│   │   └── index.js                     # Root API router & health check
│   ├── services/
│   │   ├── authService.js               # User & authentication business logic
│   │   ├── medicineService.js           # Medicine catalog & search business logic
│   │   └── inventoryService.js          # Batch, stock movement, FEFO & alert logic
│   ├── uploads/
│   │   └── .gitkeep                     # Directory for file uploads
│   └── utils/
│       ├── apiResponse.js               # Standardized JSON response helpers
│       ├── generateToken.js             # JWT signing & HttpOnly cookie utility
│       ├── logger.js                    # Request/event logger
│       ├── seed.js                      # Database seeder for demo accounts, meds & batches
│       ├── testMedicines.js             # Automated 16-scenario Medicine test runner
│       ├── testInventory.js             # Automated 23-scenario Inventory test runner
│       └── testAll.js                   # Master test runner (39 scenarios)
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
        │   │   ├── ExpiringMedicinesPreview.jsx # Live/Sample batch expiry preview
        │   │   ├── LowStockPreview.jsx          # Live/Sample stock threshold alerts
        │   │   ├── RecentTransactionsTable.jsx  # Recent sales POS table (Phase 4 preview)
        │   │   ├── SalesOverviewChart.jsx       # Recharts revenue area chart (Phase 4 preview)
        │   │   └── StatCard.jsx                 # Summary metric card
        │   ├── inventory/
        │   │   ├── BatchStatusBadge.jsx     # Active, Depleted, Expired, Quarantined badges
        │   │   ├── ExpiryAlerts.jsx         # Days-remaining urgency watch (<30d, <90d, expired)
        │   │   ├── LowStockTable.jsx        # Formulary low-stock deficit monitoring
        │   │   ├── StockAdjustmentModal.jsx # Manual stock adjustment dialog with reason
        │   │   ├── StockFilters.jsx         # Search, status, expiry, and sort filters
        │   │   ├── StockInForm.jsx          # Multi-section stock intake form
        │   │   ├── StockSummaryCards.jsx    # Valuation, lots count, units, and alerts
        │   │   ├── StockTable.jsx           # Master batches table with actions
        │   │   └── TransactionTable.jsx     # Audit movement history table
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
        │   │   └── DashboardPage.jsx    # Real-time analytics, formulary & inventory metrics
        │   ├── inventory/
        │   │   ├── AddStockPage.jsx         # Dedicated stock intake page
        │   │   ├── BatchDetailsPage.jsx     # Batch KPI cards, pricing, and audit log
        │   │   ├── InventoryDashboardPage.jsx # Inventory overview with KPI cards & alerts
        │   │   ├── StockListPage.jsx        # Master stock directory with adjustment modals
        │   │   └── StockTransactionsPage.jsx # Full stock movement audit log page
        │   └── medicines/
        │       ├── AddMedicinePage.jsx      # Medicine registration form
        │       ├── EditMedicinePage.jsx     # Medicine update form
        │       ├── MedicineDetailsPage.jsx  # Structured clinical profile view
        │       └── MedicineListPage.jsx     # Master catalog table with filters
        ├── services/
        │   ├── api.js                # Axios client with credentials & interceptors
        │   ├── authService.js        # Auth API client
        │   ├── inventoryService.js   # Inventory API client
        │   └── medicineService.js    # Medicine API client
        └── utils/
            ├── constants.js          # Navigation list, roles, sample mock data, dosage forms
            └── formatters.js         # Currency, date, and name helpers
```

---

## 3. Data Models

### A. Medicine Model (`backend/models/Medicine.js`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | String | Trade / Medicine name (required, max 120 chars) |
| `genericName` | String | Active pharmaceutical entity / international nonproprietary name |
| `brandName` | String | Commercial brand name |
| `category` | String | Therapeutic category (required, e.g. Antibiotics, Analgesics) |
| `manufacturer` | String | Manufacturing laboratory / pharmaceutical supplier |
| `description` | String | Clinical indications and precautions (max 1000 chars) |
| `composition` | String | Detailed chemical composition |
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

### B. MedicineBatch Model (`backend/models/MedicineBatch.js`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `medicine` | ObjectId | Reference to `Medicine` model (required, indexed) |
| `batchNumber` | String | Lot/batch number unique per medicine (required, compound indexed) |
| `manufacturingDate`| Date | Date of manufacture (optional, validated earlier than expiry) |
| `expiryDate` | Date | Expiry date (required, indexed) |
| `purchasePrice` | Number | Purchase cost per unit (required, min: 0) |
| `sellingPrice` | Number | Selling price per unit (required, min: 0) |
| `quantityReceived` | Number | Initial quantity received (required, min: 0) |
| `availableQuantity`| Number | Currently available units (required, min: 0, indexed) |
| `receivedDate` | Date | Date stock arrived (default: `Date.now`) |
| `supplierName` | String | Commercial supplier / distributor name (optional) |
| `status` | String | Enum: `active`, `depleted`, `expired`, `quarantined` |
| `createdBy` | ObjectId | Reference to `User` model who registered the batch |
| `timestamps` | Date | Automatic timestamps |

### C. InventoryTransaction Model (`backend/models/InventoryTransaction.js`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `medicine` | ObjectId | Reference to `Medicine` model (required, indexed) |
| `batch` | ObjectId | Reference to `MedicineBatch` model (required, indexed) |
| `transactionType` | String | Enum: `stock_in`, `stock_out`, `adjustment_in`, `adjustment_out`, `return_in`, `quarantine`, `release` |
| `quantity` | Number | Quantity change (required, strictly positive) |
| `previousQuantity`| Number | Stock quantity prior to movement |
| `newQuantity` | Number | Stock quantity resulting from movement |
| `reason` | String | Mandatory description/notes for adjustments or holds |
| `reference` | String | External invoice or PO reference code (optional) |
| `performedBy` | ObjectId | Reference to `User` model who performed the action |
| `timestamps` | Date | Creation date (indexed) |

---

## 4. Role-Based Access Control (RBAC)

The application enforces strict multi-role authorization:

| Module / Operation | Administrator | Inventory Manager | Pharmacist | Cashier |
| :--- | :---: | :---: | :---: | :---: |
| **View Dashboard & Formulary** | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| **Add / Edit Medicine Details** | ✅ Allowed | ✅ Allowed | ✅ Allowed | ❌ Restricted (403) |
| **Deactivate Medicine** | ✅ Allowed | ❌ Restricted (403) | ❌ Restricted (403) | ❌ Restricted (403) |
| **Browse Stock & Audit History** | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| **Record Stock Intake (Stock-in)** | ✅ Allowed | ✅ Allowed | ❌ Restricted (403) | ❌ Restricted (403) |
| **Adjust Stock Quantity (+/-)** | ✅ Allowed | ✅ Allowed | ❌ Restricted (403) | ❌ Restricted (403) |
| **Quarantine / Release Batches** | ✅ Allowed | ✅ Allowed | ❌ Restricted (403) | ❌ Restricted (403) |

---

## 5. API Reference

All responses conform to the standard JSON envelope:
```json
{
  "success": true,
  "message": "Human readable status",
  "data": { ... }
}
```

### Inventory Endpoints (`/api/inventory`)

| Method | Endpoint | Authorization | Functionality |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/inventory/stock-in` | Admin, Inventory Mgr | Receive new batch or replenish existing batch quantity |
| `GET` | `/api/inventory` | All Authenticated Staff | Paginated batch directory with search, status, and expiry filters |
| `GET` | `/api/inventory/summary` | All Authenticated Staff | Real-time counts, units in stock, valuation, and alerts |
| `GET` | `/api/inventory/batches/:id` | All Authenticated Staff | Batch details and complete batch audit transaction trail |
| `GET` | `/api/inventory/medicines/:id/batches` | All Authenticated Staff | All batches associated with a specific medicine |
| `PATCH` | `/api/inventory/batches/:id/adjust` | Admin, Inventory Mgr | Increase or decrease batch quantity with mandatory audit reason |
| `PATCH` | `/api/inventory/batches/:id/quarantine` | Admin, Inventory Mgr | Quarantine a batch (excludes stock from sellable inventory) |
| `PATCH` | `/api/inventory/batches/:id/release` | Admin, Inventory Mgr | Release quarantined batch back to active stock |
| `GET` | `/api/inventory/low-stock` | All Authenticated Staff | Medicines where sellable stock is below `minimumStock` threshold |
| `GET` | `/api/inventory/expiring` | All Authenticated Staff | Batches expiring within specified days threshold (default: 90 days) |
| `GET` | `/api/inventory/expired` | All Authenticated Staff | Batches past their expiry date |
| `GET` | `/api/inventory/transactions` | All Authenticated Staff | Paginated stock movement audit log with type filters |
| `POST` | `/api/inventory/fefo-preview` | All Authenticated Staff | FEFO dispatch simulation showing which batches will be drawn |

---

## 6. FEFO (First Expiry, First Out) Algorithm

PharmaCore implements an enterprise-grade FEFO allocation algorithm:
1. Queries all batches for the requested medicine.
2. Filters out depleted batches (`availableQuantity <= 0`), expired batches (`expiryDate < now`), and quarantined batches (`status === 'quarantined'`).
3. Sorts candidate batches in ascending order by `expiryDate` (`{ expiryDate: 1 }`).
4. Iteratively allocates quantities from the earliest-expiring batch first until the requested quantity is satisfied.
5. If total sellable units across all valid batches are insufficient, the algorithm returns a structured response indicating the available shortfall without partial dispatch corruption.

---

## 7. Installation, Seeding & Execution

### Step 1: Install Dependencies
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### Step 2: Seed Database with Demo Accounts, Medicines, and Batches
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
  -> Seeded Medicine: [MED-PARA-500] Paracetamol 500mg
  -> Seeded Medicine: [MED-AMOX-500] Amoxicillin 500mg
  ...
[Seed] Seeding inventory batches & transaction logs...
  -> Seeded Batch: [BT-PARA-001] for Paracetamol 500mg (Status: active, Available: 100)
  -> Seeded Batch: [BT-PARA-002] for Paracetamol 500mg (Status: active, Available: 50)
  -> Seeded Batch: [BT-AMOX-101] for Amoxicillin 500mg (Status: active, Available: 80)
  -> Seeded Batch: [BT-SALB-501] for Salbutamol Inhaler 100mcg (Status: quarantined, Available: 30)
  -> Seeded Batch: [BT-IBUP-601] for Ibuprofen 400mg (Status: expired, Available: 40)
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

## 8. Automated Testing

Run the full system verification suite covering all **39 scenarios**:
```bash
cd backend
npm test
```

### Phase 2 Medicine Tests (16 Scenarios)
- Admin and Pharmacist medicine registration (201)
- Cashier access restriction (403)
- Duplicate SKU and barcode rejection (400)
- Multi-field search, category & manufacturer filtering
- Pagination and single-medicine profile retrieval
- Medicine updates and soft-deletion (`isActive: false`)
- Unauthenticated rejection (401) and invalid ID handling (400/404)

### Phase 3 Inventory Tests (23 Scenarios)
- Admin and Inventory Manager stock intake (201)
- Cashier stock intake rejection (403)
- Pharmacist stock adjustment rejection (403)
- Duplicate batch handling (replenishment of existing lot)
- Stock-in available quantity increments
- Stock adjustment addition (`adjustment_in`) and reduction (`adjustment_out`)
- Negative stock rejection and mandatory adjustment reason validation
- Automatic classification of expired and expiring-soon batches
- Quarantine stock exclusion from sellable inventory
- Released batch restoration to active sellable stock
- Low-stock calculation against `Medicine.minimumStock`
- Inventory summary KPI verification
- Single batch lookup and medicine batch listing
- FEFO selection of earliest-expiring eligible batches
- FEFO insufficient stock error reporting
- Transaction history audit recording
- Unauthenticated access rejection (401) and invalid ID handling

**Test Run Result:**
```
====================================================
  PHARMACORE FULL SYSTEM VERIFICATION SUITE
====================================================
  Phase 2 Medicine Management: 16 PASSED, 0 FAILED
  Phase 3 Inventory Management: 23 PASSED, 0 FAILED
====================================================
  TOTAL TEST RESULTS: 39 PASSED, 0 FAILED
====================================================
```

---

## 9. Dashboard Live Data Integration

The PharmaCore **Dashboard** connects directly to live MongoDB metrics across Phases 1, 2, and 3:
- **Total Active Medicines Card**: Live database count of active medicines.
- **Low Stock Medicines Card**: Live count of medicines whose sellable stock is below the minimum threshold.
- **Low Stock Alert Preview**: Live list of deficit medications with real-time stock-to-threshold progress bars and quick restock actions.
- **Expiring Batches Preview**: Live list of batches expiring within the 90-day window with days-remaining urgency indicators.
- **Recently Added Medicines**: Live formulary table linking to full medication profiles.
- **Future Previews**: Sales Overview charts and Supplier Directory are explicitly identified as Phase 4/5 previews.
