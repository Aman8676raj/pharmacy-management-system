# PharmaCore - Pharmacy Management System (PMS)
## Phase 1: Project Foundation & Authentication
## Phase 2: Medicine Management
## Phase 3: Inventory Management (Batch Tracking, FEFO & Audit Movements)
## Phase 4: Supplier & Purchase Management (Procurement, Receiving & Inventory Integration)
## Phase 5: Sales, Point of Sale (POS), Billing & Invoice Generation (FEFO Stock Deduction, PDFKit Invoices & Audit Logs)

A modern, full-stack Pharmacy Management System built with **React.js (Vite)**, **Node.js**, **Express.js**, and **MongoDB (Mongoose)**. 

PharmaCore delivers a clean, professional SaaS dashboard designed specifically for single-pharmacy administration:
- **Phase 1** established the architectural foundation with JWT `HttpOnly` cookie authentication and role-based access control.
- **Phase 2** implemented an enterprise-grade **Medicine Management** module with full CRUD operations, live MongoDB data integration, pagination, multi-field search, category and manufacturer filtering, soft deactivation, and real-time dashboard analytics.
- **Phase 3** implemented complete **Inventory Management** featuring batch-wise stock intake, audit movement history, FEFO (First Expiry, First Out) dispatch preview, low-stock threshold alerts, automated expiry status transitions, and quarantine/release workflows.
- **Phase 4** implemented complete **Supplier & Purchase Order Management** featuring vendor registration, GST compliance tracking, multi-item purchase orders with automatic backend total calculation, partial/full delivery receiving, automatic inventory batch creation/replenishment via `inventoryService`, immutable `stock_in` transaction logging, and real-time procurement KPIs on the main dashboard.
- **Phase 5** implements a comprehensive **Sales, Point of Sale (POS), Billing & Tax Invoice Generation** module featuring high-speed product catalog browsing, cart operations with line/order discounts and GST, automated First Expiry First Out (FEFO) stock deduction with immutable `stock_out` audit transactions, multi-payment support (Cash, Card, UPI, Bank Transfer), partial payment tracking, Admin-only sale cancellation with automatic batch stock restoration via `return_in` transactions, professional server-side PDF tax invoice generation via **PDFKit**, Cashier isolation, and live dashboard integration for Today's Sales, sales trends, and recent transactions.

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

### Sales, POS & Billing Endpoints (`/api/sales`)

| Method | Endpoint | Authorization | Functionality |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/sales` | Admin, Pharmacist, Cashier | Create POS sale with automatic FEFO stock deduction and optional payment |
| `GET` | `/api/sales` | Admin, Pharmacist, Cashier, Inventory Mgr | Paginated sales listing (Cashier isolated to own sales; Admin/Pharmacist view all) |
| `GET` | `/api/sales/stats` | Admin, Pharmacist, Cashier, Inventory Mgr | Real-time sales statistics (today's revenue, overall revenue, AOV, daily trend) |
| `GET` | `/api/sales/:id` | Admin, Pharmacist, Cashier, Inventory Mgr | Complete invoice details, line items, batch allocations, and payment log |
| `GET` | `/api/sales/invoice/:invoiceNumber` | Admin, Pharmacist, Cashier, Inventory Mgr | Lookup sale by sequential invoice number |
| `GET` | `/api/sales/:id/invoice` | Admin, Pharmacist, Cashier, Inventory Mgr | Stream & download official PDF tax invoice generated with PDFKit |
| `POST` | `/api/sales/:id/payments` | Admin, Pharmacist, Cashier | Record subsequent balance payments for partially paid or unpaid invoices |
| `PATCH` | `/api/sales/:id/cancel` | Admin Only | Cancel completed sale, restore stock to original batches with `return_in` logs |
| `GET` | `/api/sales/:id/profit` | Admin, Pharmacist | Gross profit and margin analysis based on batch purchase cost |

---

## 6. Inventory Integration: Procurement & FEFO Sales Dispatch

The inventory system seamlessly connects supply intake with Point-of-Sale dispensing:
1. **Stock Intake & Receiving**: When purchase deliveries arrive, `POST /api/purchases/:id/receive` validates batches and calls `inventoryService.stockIn()`, recording immutable `stock_in` transaction records.
2. **FEFO Stock Deduction**: When checkout occurs in the POS terminal, `salesService.createSale()` invokes `inventoryService.deductFEFO()`:
   - Identifies active, non-expired, non-quarantined batches with `availableQuantity > 0`, ordered by `expiryDate: 1`.
   - Decrements stock from earliest-expiring lots first.
   - Automatically marks batches as `depleted` when available stock reaches 0.
   - Creates an immutable `stock_out` `InventoryTransaction` per batch allocation with previous and new quantities.
   - Safeguarded against midway failures: automatically rolls back any deducted stock if an item fails validation.
3. **Admin Cancellation & Stock Restoration**: When an invoice is cancelled via `PATCH /api/sales/:id/cancel`:
   - Admin-only privilege requiring a mandatory reason.
   - Loops through each allocated batch and restores the exact quantities via `inventoryService.restoreBatchStock()`.
   - Reactivates batches if they were previously depleted.
   - Records immutable `return_in` `InventoryTransaction` records with audit references.

---

## 7. Automated Testing

Run the full system verification suite covering all **90 scenarios**:
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
  - Over-receiving rejection, expired batch rejection, cancellation rules.
- **Phase 5: Sales, POS & Billing Management (19 Scenarios)**:
  - Health check verification of version 5.0.0 and Phase 5 status.
  - Initial batch stock-in and second batch stock-in with earlier expiry date to test FEFO lot selection.
  - Pharmacist POS checkout verifying sequential invoice number generation and earliest-expiring batch prioritization.
  - Verification of immutable `stock_out` inventory audit transactions created upon checkout.
  - Cashier checkout with item-level discounts, order-level discount, GST calculations, and partial payment handling.
  - Cashier privacy isolation: cashiers can only view their own sales records.
  - Admin visibility across all staff sales transactions.
  - Subsequent payment recording to settle outstanding balances with automatic status update to `paid`.
  - Inventory Manager restricted from POS sales checkout (403 Forbidden).
  - Unauthenticated request rejection (401).
  - Protection against selling more than available stock (400) without inventory corruption.
  - Cashier restricted from cancelling sales (403 Forbidden).
  - Admin-only sale cancellation with mandatory reason, restoring stock to batches via `return_in` transactions.
  - Prevention of duplicate cancellations and payment recording on cancelled invoices.
  - Single sale retrieval by ID and by invoice number with payments history.
  - Aggregate sales statistics endpoint (`/api/sales/stats`) with 7-day daily trend.
  - Profit analytics endpoint (`/api/sales/:id/profit`) reporting COGS and gross margins.
  - PDFKit binary stream verification (`%PDF-` magic header) for tax invoice downloads.

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
>>> Running Phase 5: Sales, POS & Billing Suite...
    TEST RESULTS: 19 PASSED, 0 FAILED
====================================================
  TOTAL TEST RESULTS: 90 PASSED, 0 FAILED (100% Pass Rate)
====================================================
```

---

## 8. Dashboard Live Data Integration

The PharmaCore **Dashboard** connects directly to live MongoDB metrics across Phases 1 through 5:
- **Total Active Medicines Card**: Live database count of active formulary items.
- **Low Stock Medicines Card**: Live count of medicines whose sellable stock is below the minimum threshold.
- **Today's Sales Revenue Card**: Real-time revenue and completed bill count processed today.
- **Total Sales Revenue Card**: Lifetime gross revenue and completed sales invoices in MongoDB.
- **Low Stock Alert Preview**: Live list of deficit medications with real-time stock-to-threshold progress bars and quick restock actions.
- **Expiring Batches Preview**: Live list of batches expiring within the 90-day window with days-remaining urgency indicators.
- **Sales Overview Chart**: Area chart wired directly to MongoDB daily sales revenue and transaction volumes.
- **Recent Transactions Table**: Live billing transactions feed with clickable invoice details links and payment status indicators.
