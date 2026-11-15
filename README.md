# PharmaCore - Pharmacy Management System (PMS)
## Phase 1: Project Foundation & Authentication
## Phase 2: Medicine Management
## Phase 3: Inventory Management (Batch Tracking, FEFO & Audit Movements)
## Phase 4: Supplier & Purchase Management (Procurement, Receiving & Inventory Integration)

A modern, full-stack Pharmacy Management System built with **React.js (Vite)**, **Node.js**, **Express.js**, and **MongoDB (Mongoose)**. 

PharmaCore delivers a clean, professional SaaS dashboard designed specifically for single-pharmacy administration:
- **Phase 1** established the architectural foundation with JWT `HttpOnly` cookie authentication and role-based access control.
- **Phase 2** implemented an enterprise-grade **Medicine Management** module with full CRUD operations, live MongoDB data integration, pagination, multi-field search, category and manufacturer filtering, soft deactivation, and real-time dashboard analytics.
- **Phase 3** implemented complete **Inventory Management** featuring batch-wise stock intake, audit movement history, FEFO (First Expiry, First Out) dispatch preview, low-stock threshold alerts, automated expiry status transitions, and quarantine/release workflows.
- **Phase 4** implements complete **Supplier & Purchase Order Management** featuring vendor registration, GST compliance tracking, multi-item purchase orders with automatic backend total calculation, partial/full delivery receiving, automatic inventory batch creation/replenishment via `inventoryService`, immutable `stock_in` transaction logging, and real-time procurement KPIs on the main dashboard.

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
│   │   ├── inventoryController.js       # Controller for stock-in, adjust, quarantine, FEFO
│   │   ├── supplierController.js        # Controller for supplier CRUD, stats & activation
│   │   └── purchaseController.js        # Controller for PO creation, orders, receiving & cancel
│   ├── middleware/
│   │   ├── authMiddleware.js            # protect & authorize (RBAC) middlewares
│   │   ├── errorMiddleware.js           # Centralized 404 & global error handlers
│   │   └── validateMiddleware.js        # express-validator result formatter
│   ├── models/
│   │   ├── Medicine.js                  # Mongoose Medicine formulary model
│   │   ├── MedicineBatch.js             # Mongoose MedicineBatch model (lots, FEFO, pricing)
│   │   ├── InventoryTransaction.js      # Mongoose InventoryTransaction model (immutable audit log)
│   │   ├── Supplier.js                  # Mongoose Supplier model (vendors, GSTIN, payment terms)
│   │   ├── PurchaseOrder.js             # Mongoose PurchaseOrder model (items, totals, receiving)
│   │   └── User.js                      # Mongoose User model with safe serialization
│   ├── routes/
│   │   ├── authRoutes.js                # Auth endpoint definitions & validations
│   │   ├── medicineRoutes.js            # Medicine endpoint definitions & validations
│   │   ├── inventoryRoutes.js           # Inventory stock endpoints & validations
│   │   ├── supplierRoutes.js            # Supplier endpoint definitions & validations
│   │   ├── purchaseRoutes.js            # Purchase order endpoints & validations
│   │   └── index.js                     # Root API router & health check
│   ├── services/
│   │   ├── authService.js               # User & authentication business logic
│   │   ├── medicineService.js           # Medicine catalog & search business logic
│   │   ├── inventoryService.js          # Batch, stock movement, FEFO & alert logic
│   │   ├── supplierService.js           # Supplier directory & vendor aggregation logic
│   │   └── purchaseService.js           # Purchase ordering, inventory receiving & calculations
│   ├── uploads/
│   │   └── .gitkeep                     # Directory for file uploads
│   └── utils/
│       ├── apiResponse.js               # Standardized JSON response helpers
│       ├── generateToken.js             # JWT signing & HttpOnly cookie utility
│       ├── logger.js                    # Request/event logger
│       ├── seed.js                      # Database seeder for demo accounts, meds, suppliers & POs
│       ├── testMedicines.js             # Automated 16-scenario Medicine test runner
│       ├── testInventory.js             # Automated 23-scenario Inventory test runner
│       ├── testPurchases.js             # Automated 32-scenario Supplier & Purchase test runner
│       └── testAll.js                   # Master test runner (71 scenarios across Phases 2, 3, 4)
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
        │   │   ├── RecentTransactionsTable.jsx  # Recent sales POS table (Phase 5 preview)
        │   │   ├── SalesOverviewChart.jsx       # Recharts revenue area chart (Phase 5 preview)
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
        │   ├── suppliers/
        │   │   ├── SupplierStats.jsx        # Vendor counts, active/inactive & hubs
        │   │   ├── SupplierFilters.jsx      # Search, active/inactive & city filters
        │   │   ├── SupplierTable.jsx        # Vendor directory table with actions
        │   │   └── SupplierForm.jsx         # Comprehensive vendor registration/edit form
        │   ├── purchases/
        │   │   ├── PurchaseStatusBadge.jsx  # Draft, Ordered, Partial, Received badges
        │   │   ├── PurchaseSummary.jsx      # Financial breakdown card
        │   │   ├── PurchaseItemRow.jsx      # Interactive medicine line item row
        │   │   ├── PurchaseForm.jsx         # Multi-item purchase order authoring form
        │   │   ├── PurchaseTable.jsx        # PO listing table with fulfillment progress
        │   │   ├── ReceiveStockModal.jsx    # Dedicated delivery intake dialog
        │   │   └── PurchaseReceivingTable.jsx # Audit receiving log table
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
        │   ├── suppliers/
        │   │   ├── SupplierListPage.jsx     # Master vendor directory with actions
        │   │   ├── AddSupplierPage.jsx      # Supplier registration page
        │   │   ├── EditSupplierPage.jsx     # Supplier profile editor
        │   │   └── SupplierDetailsPage.jsx  # Supplier profile & PO history
        │   ├── purchases/
        │   │   ├── PurchaseListPage.jsx     # Master PO list with intake modal
        │   │   ├── CreatePurchasePage.jsx   # Multi-item PO creation page
        │   │   ├── EditPurchasePage.jsx     # Draft PO editor
        │   │   └── PurchaseDetailsPage.jsx  # Order overview, lines & receiving log
        │   └── medicines/
        │       ├── AddMedicinePage.jsx      # Medicine registration form
        │       ├── EditMedicinePage.jsx     # Medicine update form
        │       ├── MedicineDetailsPage.jsx  # Structured clinical profile view
        │       └── MedicineListPage.jsx     # Master catalog table with filters
        ├── services/
        │   ├── api.js                # Axios client with credentials & interceptors
        │   ├── authService.js        # Auth API client
        │   ├── inventoryService.js   # Inventory API client
        │   ├── supplierService.js    # Supplier API client
        │   ├── purchaseService.js    # Purchase Order API client
        │   └── medicineService.js    # Medicine API client
        └── utils/
            ├── constants.js          # Navigation list, roles, sample mock data, dosage forms
            └── formatters.js         # Currency, date, and name helpers
```

---

## 3. Data Models

### A. Supplier Model (`backend/models/Supplier.js`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `supplierCode` | String | Unique supplier code (required, uppercase, unique indexed) |
| `name` | String | Commercial vendor / company name (required) |
| `contactPerson` | String | Key account manager / contact person |
| `email` | String | Official orders email address (validated) |
| `phone` | String | Primary phone number (required) |
| `alternatePhone` | String | Secondary / warehouse phone |
| `address` | String | Physical warehouse address |
| `city` | String | Operating city / logistics hub (indexed) |
| `state` | String | State / province |
| `postalCode` | String | Postal code |
| `country` | String | Country (default: 'India') |
| `gstNumber` | String | GSTIN tax identifier (sparse unique indexed) |
| `drugLicenseNumber` | String | Wholesale drug distribution license |
| `paymentTerms` | String | Enum: `immediate`, `net_7`, `net_15`, `net_30`, `net_45`, `net_60` |
| `notes` | String | Internal commercial notes |
| `isActive` | Boolean | Soft deactivation flag (default: true, indexed) |
| `createdBy` | ObjectId | Reference to `User` who registered the vendor |
| `timestamps` | Date | Automatic timestamps |

### B. PurchaseOrder Model (`backend/models/PurchaseOrder.js`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `purchaseOrderNumber` | String | Unique PO code (e.g. `PO-2026-0001`, unique indexed) |
| `supplier` | ObjectId | Reference to `Supplier` (required, indexed) |
| `orderDate` | Date | Order issue date (default: Date.now, indexed) |
| `expectedDeliveryDate` | Date | Expected delivery date |
| `status` | String | Enum: `draft`, `ordered`, `partially_received`, `received`, `cancelled` (indexed) |
| `items` | Array | Array of purchase item snapshots (orderedQuantity, receivedQuantity, unitCost, lineTotal) |
| `subtotal` | Number | Sum of item costs before order discount |
| `discount` | Number | Total discounts applied |
| `taxAmount` | Number | Total taxes calculated on backend |
| `shippingCharges` | Number | Logistics / shipping costs |
| `totalAmount` | Number | Final calculated payable total |
| `notes` | String | Delivery instructions or cancellation reason |
| `createdBy` | ObjectId | Reference to `User` who created the PO |
| `updatedBy` | ObjectId | Reference to `User` who modified or received the PO |
| `receivedAt` | Date | Timestamp of full order fulfillment |
| `receivingHistory` | Array | Delivery intake events (date, invoice #, receivedBy, items received with batch IDs) |
| `timestamps` | Date | Automatic timestamps |

---

## 4. Role-Based Access Control (RBAC)

Multi-role authorization matrix:

| Module / Operation | Administrator | Inventory Manager | Pharmacist | Cashier |
| :--- | :---: | :---: | :---: | :---: |
| **View Dashboard & Formulary** | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| **Add / Edit Medicine Details** | ✅ Allowed | ✅ Allowed | ✅ Allowed | ❌ Restricted (403) |
| **Deactivate Medicine** | ✅ Allowed | ❌ Restricted (403) | ❌ Restricted (403) | ❌ Restricted (403) |
| **Browse Stock & Inventory Batches** | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| **Manual Stock Intake & Adjustments** | ✅ Allowed | ✅ Allowed | ❌ Restricted (403) | ❌ Restricted (403) |
| **Browse Suppliers Directory** | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| **Add / Edit / Deactivate Suppliers** | ✅ Allowed | ✅ Allowed | ❌ Restricted (403) | ❌ Restricted (403) |
| **View Purchase Orders & Details** | ✅ Allowed | ✅ Allowed | ✅ Allowed | ❌ Restricted (403) |
| **Create / Edit / Place Purchase Orders** | ✅ Allowed | ✅ Allowed | ❌ Restricted (403) | ❌ Restricted (403) |
| **Receive Purchase Stock Deliveries** | ✅ Allowed | ✅ Allowed | ❌ Restricted (403) | ❌ Restricted (403) |
| **Cancel Eligible Purchase Orders** | ✅ Allowed | ✅ Allowed | ❌ Restricted (403) | ❌ Restricted (403) |

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

### Supplier Endpoints (`/api/suppliers`)

| Method | Endpoint | Authorization | Functionality |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/suppliers` | Admin, Inventory Mgr | Register a new supplier with unique code and GST checks |
| `GET` | `/api/suppliers` | All Authenticated Staff | Paginated supplier list with search, active/inactive, and city filters |
| `GET` | `/api/suppliers/stats` | All Authenticated Staff | Aggregate stats: total vendors, active count, and operating cities |
| `GET` | `/api/suppliers/:id` | All Authenticated Staff | Complete vendor profile, lifetime spend, and recent PO history |
| `PUT` | `/api/suppliers/:id` | Admin, Inventory Mgr | Update vendor contact info, terms, or license |
| `PATCH` | `/api/suppliers/:id/deactivate` | Admin, Inventory Mgr | Soft-deactivate vendor (prevents new POs) |
| `PATCH` | `/api/suppliers/:id/activate` | Admin, Inventory Mgr | Reactivate vendor for procurement |

### Purchase Order Endpoints (`/api/purchases`)

| Method | Endpoint | Authorization | Functionality |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/purchases` | Admin, Inventory Mgr | Create new purchase order (draft or ordered) with backend total calculation |
| `GET` | `/api/purchases` | Admin, Inventory Mgr, Pharmacist | Paginated PO list with search, supplier, status, and date range filters |
| `GET` | `/api/purchases/stats` | Admin, Inventory Mgr, Pharmacist | Aggregate statistics (total orders, pending deliveries, lifetime spend) |
| `GET` | `/api/purchases/:id` | Admin, Inventory Mgr, Pharmacist | Complete PO details, line items, and delivery intake log |
| `PUT` | `/api/purchases/:id` | Admin, Inventory Mgr | Modify draft PO (locked once ordered) |
| `PATCH` | `/api/purchases/:id/order` | Admin, Inventory Mgr | Transition draft PO to ordered |
| `POST` | `/api/purchases/:id/receive` | Admin, Inventory Mgr | Receive partial or complete delivery into active inventory |
| `PATCH` | `/api/purchases/:id/cancel` | Admin, Inventory Mgr | Cancel draft or unfulfilled ordered PO |

---

## 6. Purchase and Inventory Integration

The delivery intake workflow seamlessly connects purchase orders with Phase 3 inventory:
1. When stock arrives, authorized staff submit delivery details via `POST /api/purchases/:id/receive`.
2. Validates batch number, positive quantity received, and verifies that the expiry date is strictly in the future.
3. Automatically delegates to `inventoryService.stockIn()`.
4. Creates or replenishes the `MedicineBatch` in active inventory.
5. Records an immutable `InventoryTransaction` of type `stock_in` referencing the supplier invoice and PO number.
6. Increments the PO item's `receivedQuantity`.
7. If all line items are fulfilled, transitions PO status to `received` with timestamp; otherwise marks as `partially_received`.
8. Records an entry in `receivingHistory` showing which batches and quantities were received and by whom.

---

## 7. Automated Testing

Run the full system verification suite covering all **71 scenarios**:
```bash
cd backend
npm test
```

### Test Suite Summary:
- **Phase 2: Medicine Management (16 Scenarios)**:
  - CRUD operations, search, filters, pagination, duplicate prevention, soft deletion, and RBAC guards.
- **Phase 3: Inventory Management (23 Scenarios)**:
  - Stock intake, existing batch replenishment, manual adjustments, negative quantity rejection, FEFO allocation algorithm, expiry status transitions, quarantine/release workflow, and low-stock threshold calculations.
- **Phase 4: Supplier & Purchase Management (32 Scenarios)**:
  - Supplier registration, duplicate code/GST rejection, active/inactive filtering, soft deactivation, blocking inactive suppliers from receiving POs.
  - Multi-item PO creation, backend financial calculations, draft vs ordered state transitions, preventing modification of ordered POs.
  - Full vs partial stock deliveries, status updates (`partially_received` -> `received`), automatic inventory batch creation, immutable `stock_in` transaction logging.
  - Over-receiving rejection, expired batch rejection, cancellation rules (draft and unfulfilled orders allowed; partially and fully received orders blocked).
  - Multi-role permission checks (Cashier 403 on purchases, Pharmacist 403 on intake, unauthenticated 401).

**Test Execution Result:**
```
====================================================
   PHARMACORE FULL SYSTEM VERIFICATION SUITE
====================================================
>>> Running Phase 2: Medicine Management Suite...
    TEST RESULTS: 16 PASSED, 0 FAILED
>>> Running Phase 3: Inventory Management Suite...
    TEST RESULTS: 23 PASSED, 0 FAILED
>>> Running Phase 4: Supplier & Purchase Management Suite...
    TEST RESULTS: 32 PASSED, 0 FAILED
====================================================
  TOTAL TEST RESULTS: 71 PASSED, 0 FAILED (100% Pass Rate)
====================================================
```

---

## 8. Dashboard Live Data Integration

The PharmaCore **Dashboard** connects directly to live MongoDB metrics across Phases 1, 2, 3, and 4:
- **Total Active Medicines Card**: Live database count of active formulary items.
- **Low Stock Medicines Card**: Live count of medicines whose sellable stock is below the minimum threshold.
- **Active Suppliers Card**: Live count of active registered pharmaceutical vendors and operating hubs.
- **Purchase Orders Card**: Live count of total purchase orders, pending deliveries, and lifetime procurement spend.
- **Low Stock Alert Preview**: Live list of deficit medications with real-time stock-to-threshold progress bars and quick restock actions.
- **Expiring Batches Preview**: Live list of batches expiring within the 90-day window with days-remaining urgency indicators.
- **Recently Added Medicines**: Live formulary table linking to full medication profiles.
- **Future Previews**: Point-of-Sale billing and Customer directories remain clearly designated as Phase 5 previews.
