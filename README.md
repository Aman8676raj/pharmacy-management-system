# PharmaCore — Complete Pharmacy Management System (PMS)

PharmaCore is a production-ready, full-stack single-pharmacy management and clinical administration system built with **React.js (Vite)**, **Node.js**, **Express.js**, and **MongoDB (Mongoose)**.

The application delivers an enterprise-grade modular monolith covering the entire operational lifecycle of a modern pharmacy: formulary management, FEFO batch inventory, procurement, point-of-sale (POS) billing with tax invoices, patient profiles, doctor prescriptions with clinical verification workflows, and business intelligence analytics with CSV and PDF export.

---

## 1. System Architecture & Complete Roadmap Status

PharmaCore is structured across 8 completed phases:

| Phase | Module | Status | Verification |
|---|---|---|---|
| **Phase 1** | Foundation, Authentication & Role-Based Access Control | **Complete** | JWT HttpOnly cookies, 4 user roles, responsive layout |
| **Phase 2** | Medicine Formulary & Catalog Management | **Complete** | 16 automated tests passed, multi-field search & filters |
| **Phase 3** | Batch Inventory, FEFO Allocation & Movement Auditing | **Complete** | 23 automated tests passed, expiry transitions & quarantine |
| **Phase 4** | Supplier Directory & Purchase Order Procurement | **Complete** | 32 automated tests passed, receiving & batch replenishment |
| **Phase 5** | Sales, Point of Sale (POS), Billing & Tax Invoices | **Complete** | 19 automated tests passed, FEFO deduction & PDFKit invoices |
| **Phase 6** | Customer & Doctor Prescription Management | **Complete** | 21 automated tests passed, secure Rx scans & clinical verification |
| **Phase 7** | Reports, Financial Ledger & Business Intelligence | **Complete** | 16 automated tests passed, CSV/PDF reports & Recharts visualizations |
| **Phase 8** | Complete System Testing, Security Hardening & Production Build | **Complete** | 16 integration tests passed, **143/143 automated tests green**, 0 build errors |

---

## 2. Technology Stack

### Frontend
- **Framework & Tooling**: [React 18](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Language**: JavaScript (JSX)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/)
- **Routing**: [React Router DOM v6](https://reactrouter.com/) (Public, Protected, and Role-Gated Routes)
- **HTTP Client**: [Axios](https://axios-http.com/) (`withCredentials: true` for HttpOnly cookie sessions)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Visualization**: [Recharts v2](https://recharts.org/) (Area, Bar, and Line charts)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (v20+)
- **Server Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose ODM](https://mongoosejs.com/)
- **Authentication**: JWT (`jsonwebtoken`) in secure HttpOnly cookies + Bearer token fallback
- **Password Hashing**: `bcryptjs` with salt factor 10
- **Input Validation**: `express-validator` with unified error middleware
- **File Uploads**: `multer` with strict MIME and extension validation (stored locally in `backend/uploads/prescriptions/`)
- **Document Generation**: `pdfkit` for high-resolution vector PDF invoices and multi-page reports
- **Security & Headers**: `cors`, `cookie-parser`, `dotenv`, payload size limits (10MB), and centralized error handling

*Architectural Boundary: Pure modular monolith without TypeScript, Next.js, Prisma, PostgreSQL, Redis, or microservices.*

---

## 3. Role-Based Access Control (RBAC) Matrix

PharmaCore defines 4 distinct operational roles:

| Module / Operation | Admin | Pharmacist | Inventory Manager | Cashier |
|---|:---:|:---:|:---:|:---:|
| **Dashboard Executive KPIs** | Full | Full | Full | Full |
| **Medicine Catalog (Read)** | Yes | Yes | Yes | Yes |
| **Medicine Catalog (Create/Edit)** | Yes | Yes | Yes | No |
| **Inventory Stock (View & FEFO)** | Yes | Yes | Yes | Yes |
| **Stock-In & Stock Adjustments** | Yes | No | Yes | No |
| **Quarantine / Release Batches** | Yes | No | Yes | No |
| **Suppliers & Purchase Orders** | Yes | View Only | Yes | No |
| **Goods Receiving & Replenishment** | Yes | No | Yes | No |
| **POS Checkout & Invoicing** | Yes | Yes | No | Yes |
| **Settle Invoice Balance** | Yes | Yes | No | Yes |
| **Cancel Sale & Restore Stock** | Yes | No | No | No |
| **Customer / Patient Management** | Yes | Yes | No | Yes |
| **Prescription Creation (Rx)** | Yes | Yes | No | Yes |
| **Prescription Clinical Verification** | Yes | Yes | No | No |
| **Sales & Inventory Reports** | Yes | Yes | Inventory Only | No |
| **Profit & Loss (P&L) Reports** | Yes | Yes | No | No |
| **Data Export (CSV & PDF)** | Yes | Yes | Yes | No |

---

## 4. Key Architectural Implementations

### A. FEFO Stock Allocation (First Expiry, First Out)
- When medicines are dispensed via POS (`salesService.createSale`), the algorithm evaluates all active batches of the medicine ordered by `expiryDate ASC`.
- Expired or quarantined batches are excluded.
- The quantity requested is drawn first from the earliest-expiring batch, splitting across subsequent batches if needed.
- Available quantity is decremented atomically on each batch, and immutable `stock_out` audit transactions are recorded.

### B. Prescription Safety & Dispensing Compliance
- Medicines flagged with `requiresPrescription: true` (Schedule H/X drugs) require doctor verification.
- At POS checkout, cashiers can search and link registered patients.
- Verified prescriptions for the selected patient are fetched dynamically and linked to the sale.
- POS checkout validates that linked prescriptions are in `verified` status and have not expired.

### C. Audited Sale Cancellation & Stock Restoration
- If a sale is cancelled (Admin-only), the system inspects the exact `batchAllocations` snapshots stored in the sale items.
- For each batch allocation, stock is added back to that batch (`availableQuantity += allocatedQty`).
- An immutable `return_in` inventory transaction is logged referencing the original invoice.

### D. Server-Side PDF & CSV Export Pipeline
- Invoices: Vector-rendered PDF tax invoices via PDFKit with pharmacy branding, DL numbers, GSTIN, itemized VAT/GST tables, doctor Rx details, and payment summaries.
- Reports: Server-streamed CSV and PDF reports for Sales, Inventory Valuation, Procurement Spend, Profit & Loss Statements, and Medicine Performance.

---

## 5. Complete REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/login` — Sign in with email and password (sets HttpOnly cookie)
- `POST /api/auth/register` — Register a staff user (Admin only)
- `GET /api/auth/me` — Get authenticated user profile
- `POST /api/auth/logout` — Clear session cookies

### Medicines (`/api/medicines`)
- `GET /api/medicines` — Paginated medicines catalog with search and filters
- `GET /api/medicines/stats` — Formulary counts and category distribution
- `GET /api/medicines/search` — Autocomplete search by name, SKU, or barcode
- `GET /api/medicines/:id` — Single medicine details with batch inventory
- `POST /api/medicines` — Create new medicine item
- `PUT /api/medicines/:id` — Update medicine details
- `PATCH /api/medicines/:id/deactivate` — Soft deactivation
- `PATCH /api/medicines/:id/activate` — Reactivate medicine

### Inventory & Batches (`/api/inventory`)
- `GET /api/inventory` — Paginated batches listing
- `GET /api/inventory/summary` — Inventory asset valuation and batch stats
- `GET /api/inventory/low-stock` — Medicines below minimum threshold
- `GET /api/inventory/expiring` — Batches expiring within specified days
- `GET /api/inventory/expired` — Expired batches overview
- `GET /api/inventory/transactions` — Stock audit trail ledger
- `GET /api/inventory/batches/:id` — Batch details with movement history
- `GET /api/inventory/medicines/:medicineId/batches` — Active batches for a medicine
- `POST /api/inventory/stock-in` — Manual stock intake
- `PATCH /api/inventory/batches/:id/adjust` — Stock quantity adjustment with reason
- `PATCH /api/inventory/batches/:id/quarantine` — Quarantine batch from sellable stock
- `PATCH /api/inventory/batches/:id/release` — Release quarantined batch
- `POST /api/inventory/fefo-preview` — Preview FEFO batch allocation for requested items

### Suppliers & Procurement (`/api/suppliers` & `/api/purchases`)
- `GET /api/suppliers` — Supplier directory with search
- `GET /api/suppliers/stats` — Supplier counts and status
- `POST /api/suppliers` — Register new supplier
- `GET /api/suppliers/:id` — Single supplier details
- `PUT /api/suppliers/:id` — Update supplier profile
- `PATCH /api/suppliers/:id/deactivate` — Deactivate supplier
- `GET /api/purchases` — Purchase orders list with status filters
- `GET /api/purchases/stats` — Procurement spend and order counts
- `GET /api/purchases/:id` — Single PO details
- `POST /api/purchases` — Create draft purchase order
- `PUT /api/purchases/:id` — Edit draft purchase order
- `PATCH /api/purchases/:id/order` — Transition draft PO to ordered
- `POST /api/purchases/:id/receive` — Receive goods, create batches & replenish stock
- `PATCH /api/purchases/:id/cancel` — Cancel purchase order

### Sales, POS & Invoicing (`/api/sales`)
- `GET /api/sales` — Paginated sales list (Cashier isolation enforced)
- `GET /api/sales/stats` — Sales revenue, payment methods, and daily trend
- `GET /api/sales/:id` — Single sale details with batch allocations
- `GET /api/sales/invoice/:invoiceNumber` — Lookup sale by invoice number
- `POST /api/sales` — Create POS checkout with FEFO stock deduction
- `POST /api/sales/:id/payments` — Record subsequent payment to settle invoice balance
- `PATCH /api/sales/:id/cancel` — Cancel sale and restore batch stock via `return_in`
- `GET /api/sales/:id/invoice` — Download vector PDF tax invoice
- `GET /api/sales/:id/profit` — Itemized profit and margin analytics

### Customers & Prescriptions (`/api/customers` & `/api/prescriptions`)
- `GET /api/customers` — Paginated customer directory
- `GET /api/customers/stats` — Customer counts and retention metrics
- `GET /api/customers/search` — Autocomplete customer lookup by name or phone
- `GET /api/customers/:id` — Single customer details
- `POST /api/customers` — Register new customer profile
- `PUT /api/customers/:id` — Update customer profile
- `PATCH /api/customers/:id/deactivate` — Soft deactivation
- `PATCH /api/customers/:id/activate` — Reactivate customer
- `GET /api/customers/:id/sales` — Patient's dispensing history
- `GET /api/customers/:id/prescriptions` — Patient's prescription history
- `GET /api/prescriptions` — Prescriptions list with status filters
- `GET /api/prescriptions/stats` — Pending vs verified counts
- `GET /api/prescriptions/:id` — Single prescription details
- `POST /api/prescriptions` — Upload and register doctor prescription (starts pending)
- `PATCH /api/prescriptions/:id/verify` — Pharmacist approval
- `PATCH /api/prescriptions/:id/reject` — Pharmacist rejection with clinical reason
- `GET /api/prescriptions/:id/file` — Secure authenticated prescription document stream

### Reports & Business Intelligence (`/api/reports`)
- `GET /api/reports/dashboard` — Live executive statistics across all modules
- `GET /api/reports/sales` — Sales report with payment mode and staff audits
- `GET /api/reports/inventory` — Stock valuation (purchase vs retail) & movements
- `GET /api/reports/purchases` — Vendor procurement spend distribution
- `GET /api/reports/profit-loss` — Net revenue vs COGS vs Gross Profit statement
- `GET /api/reports/medicines` — Bestselling, slow-moving & high-margin drugs
- `GET /api/reports/customers` — Patient retention, spenders & repeat rates
- `GET /api/reports/export/csv` — Stream formatted CSV report
- `GET /api/reports/export/pdf` — Stream multi-page vector PDF report

---

## 6. Automated Verification Test Suite

PharmaCore includes comprehensive automated verification suites covering all modules:

```bash
cd backend
npm test
# Or run master test suite directly:
node utils/testAll.js
```

### Test Suite Execution Summary

```
====================================================
   PHARMACORE FULL SYSTEM VERIFICATION SUITE
====================================================
>>> Running Phase 2: Medicine Management Suite...
    [PASS] 16 Scenarios Passed, 0 Failed

>>> Running Phase 3: Inventory Management Suite...
    [PASS] 23 Scenarios Passed, 0 Failed

>>> Running Phase 4: Supplier & Purchase Management Suite...
    [PASS] 32 Scenarios Passed, 0 Failed

>>> Running Phase 5: Sales, POS & Billing Suite...
    [PASS] 19 Scenarios Passed, 0 Failed

>>> Running Phase 6: Customer & Prescription Management Suite...
    [PASS] 21 Scenarios Passed, 0 Failed

>>> Running Phase 7: Reports & Analytics Suite...
    [PASS] 16 Scenarios Passed, 0 Failed

>>> Running Phase 8: End-to-End Integration Workflows Suite...
    [PASS] 16 Scenarios Passed, 0 Failed
====================================================
  TOTAL TEST SUITE: 143 PASSED, 0 FAILED (100% GREEN)
====================================================
```

---

## 7. Demo Accounts & Credentials

The system includes pre-seeded demo accounts with specific role privileges:

| Role | Email | Password | Primary Capabilities |
|---|---|---|---|
| **Administrator** | `admin@pharmacy.com` | `Password@123` | Full system access, sale cancellation, user management |
| **Pharmacist** | `pharmacist@pharmacy.com` | `Password@123` | Medicine catalog, prescription verification, sales, reports |
| **Inventory Manager** | `inventory@pharmacy.com` | `Password@123` | Batch stock-in, PO creation, goods receiving, quarantine |
| **Cashier** | `cashier@pharmacy.com` | `Password@123` | POS checkout, customer search, pending Rx creation |

---

## 8. Local Setup & Production Deployment

### Prerequisites
- Node.js v20.x or higher
- MongoDB v6.x or higher running locally or accessible via URI

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT Secret
npm run seed     # Seeds demo users, medicines, suppliers & batches
npm run dev      # Starts Express server on port 5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server on port 5173
```

### 3. Production Build
```bash
cd frontend
npm run build    # Compiles production assets into frontend/dist/
```

### Production Checklist
1. Set `NODE_ENV=production` in `backend/.env`.
2. Provide a strong, cryptographically generated `JWT_SECRET`.
3. Set `CLIENT_URL` to the production domain for CORS enforcement.
4. Ensure MongoDB connection string uses authenticated credentials with SSL enabled.
5. Set reverse proxy (Nginx / Cloudflare) to route `/api` to Express and `/` to Vite `dist/`.
