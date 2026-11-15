import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/common/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import MedicineListPage from './pages/medicines/MedicineListPage';
import AddMedicinePage from './pages/medicines/AddMedicinePage';
import EditMedicinePage from './pages/medicines/EditMedicinePage';
import MedicineDetailsPage from './pages/medicines/MedicineDetailsPage';

// Phase 3: Inventory Pages
import InventoryDashboardPage from './pages/inventory/InventoryDashboardPage';
import StockListPage from './pages/inventory/StockListPage';
import AddStockPage from './pages/inventory/AddStockPage';
import BatchDetailsPage from './pages/inventory/BatchDetailsPage';
import StockTransactionsPage from './pages/inventory/StockTransactionsPage';

// Phase 4: Supplier Pages
import SupplierListPage from './pages/suppliers/SupplierListPage';
import AddSupplierPage from './pages/suppliers/AddSupplierPage';
import EditSupplierPage from './pages/suppliers/EditSupplierPage';
import SupplierDetailsPage from './pages/suppliers/SupplierDetailsPage';

// Phase 4: Purchase Pages
import PurchaseListPage from './pages/purchases/PurchaseListPage';
import CreatePurchasePage from './pages/purchases/CreatePurchasePage';
import EditPurchasePage from './pages/purchases/EditPurchasePage';
import PurchaseDetailsPage from './pages/purchases/PurchaseDetailsPage';

// Phase 5: Sales & POS Pages
import SalesListPage from './pages/sales/SalesListPage';
import POSPage from './pages/sales/POSPage';
import SaleDetailsPage from './pages/sales/SaleDetailsPage';

// Phase 6: Customer Pages
import CustomerListPage from './pages/customers/CustomerListPage';
import AddCustomerPage from './pages/customers/AddCustomerPage';
import EditCustomerPage from './pages/customers/EditCustomerPage';
import CustomerDetailsPage from './pages/customers/CustomerDetailsPage';

// Phase 6: Prescription Pages
import PrescriptionListPage from './pages/prescriptions/PrescriptionListPage';
import AddPrescriptionPage from './pages/prescriptions/AddPrescriptionPage';
import PrescriptionDetailsPage from './pages/prescriptions/PrescriptionDetailsPage';

// Phase 7: Reports & Analytics Pages
import ReportsDashboardPage from './pages/reports/ReportsDashboardPage';
import SalesReportPage from './pages/reports/SalesReportPage';
import InventoryReportPage from './pages/reports/InventoryReportPage';
import PurchaseReportPage from './pages/reports/PurchaseReportPage';
import ProfitLossReportPage from './pages/reports/ProfitLossReportPage';
import MedicinePerformancePage from './pages/reports/MedicinePerformancePage';
import CustomerReportPage from './pages/reports/CustomerReportPage';

// Settings Page
import SettingsPage from './pages/settings/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Routes */}
          <Route element={<AuthLayout />}>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
          </Route>

          {/* Protected Application Routes */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Medicine Management (Phase 2) */}
            <Route path="/medicines" element={<MedicineListPage />} />
            <Route
              path="/medicines/new"
              element={
                <ProtectedRoute allowedRoles={['admin', 'pharmacist', 'inventory_manager']}>
                  <AddMedicinePage />
                </ProtectedRoute>
              }
            />
            <Route path="/medicines/:id" element={<MedicineDetailsPage />} />
            <Route
              path="/medicines/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['admin', 'pharmacist', 'inventory_manager']}>
                  <EditMedicinePage />
                </ProtectedRoute>
              }
            />

            {/* Inventory Management (Phase 3) */}
            <Route path="/inventory" element={<InventoryDashboardPage />} />
            <Route path="/inventory/stock" element={<StockListPage />} />
            <Route
              path="/inventory/stock-in"
              element={
                <ProtectedRoute allowedRoles={['admin', 'inventory_manager']}>
                  <AddStockPage />
                </ProtectedRoute>
              }
            />
            <Route path="/inventory/batches/:id" element={<BatchDetailsPage />} />
            <Route path="/inventory/transactions" element={<StockTransactionsPage />} />

            {/* Supplier Management (Phase 4) */}
            <Route path="/suppliers" element={<SupplierListPage />} />
            <Route
              path="/suppliers/new"
              element={
                <ProtectedRoute allowedRoles={['admin', 'inventory_manager']}>
                  <AddSupplierPage />
                </ProtectedRoute>
              }
            />
            <Route path="/suppliers/:id" element={<SupplierDetailsPage />} />
            <Route
              path="/suppliers/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['admin', 'inventory_manager']}>
                  <EditSupplierPage />
                </ProtectedRoute>
              }
            />

            {/* Purchase Order Management (Phase 4) */}
            <Route
              path="/purchases"
              element={
                <ProtectedRoute allowedRoles={['admin', 'inventory_manager', 'pharmacist']}>
                  <PurchaseListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/purchases/new"
              element={
                <ProtectedRoute allowedRoles={['admin', 'inventory_manager']}>
                  <CreatePurchasePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/purchases/:id"
              element={
                <ProtectedRoute allowedRoles={['admin', 'inventory_manager', 'pharmacist']}>
                  <PurchaseDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/purchases/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['admin', 'inventory_manager']}>
                  <EditPurchasePage />
                </ProtectedRoute>
              }
            />

            {/* Sales, POS & Billing (Phase 5) */}
            <Route path="/sales" element={<SalesListPage />} />
            <Route
              path="/sales/pos"
              element={
                <ProtectedRoute allowedRoles={['admin', 'pharmacist', 'cashier']}>
                  <POSPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pos"
              element={
                <ProtectedRoute allowedRoles={['admin', 'pharmacist', 'cashier']}>
                  <POSPage />
                </ProtectedRoute>
              }
            />
            <Route path="/sales/:id" element={<SaleDetailsPage />} />

            {/* Customer Management (Phase 6) */}
            <Route path="/customers" element={<CustomerListPage />} />
            <Route
              path="/customers/new"
              element={
                <ProtectedRoute allowedRoles={['admin', 'pharmacist', 'cashier']}>
                  <AddCustomerPage />
                </ProtectedRoute>
              }
            />
            <Route path="/customers/:id" element={<CustomerDetailsPage />} />
            <Route
              path="/customers/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['admin', 'pharmacist', 'cashier']}>
                  <EditCustomerPage />
                </ProtectedRoute>
              }
            />

            {/* Prescription Management (Phase 6) */}
            <Route
              path="/prescriptions"
              element={
                <ProtectedRoute allowedRoles={['admin', 'pharmacist']}>
                  <PrescriptionListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/prescriptions/new"
              element={
                <ProtectedRoute allowedRoles={['admin', 'pharmacist']}>
                  <AddPrescriptionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/prescriptions/:id"
              element={
                <ProtectedRoute allowedRoles={['admin', 'pharmacist']}>
                  <PrescriptionDetailsPage />
                </ProtectedRoute>
              }
            />

            {/* Reports & Analytics (Phase 7) */}
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={['admin', 'pharmacist', 'inventory_manager']}>
                  <ReportsDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/sales"
              element={
                <ProtectedRoute allowedRoles={['admin', 'pharmacist']}>
                  <SalesReportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/inventory"
              element={
                <ProtectedRoute allowedRoles={['admin', 'pharmacist', 'inventory_manager']}>
                  <InventoryReportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/purchases"
              element={
                <ProtectedRoute allowedRoles={['admin', 'inventory_manager']}>
                  <PurchaseReportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/profit-loss"
              element={
                <ProtectedRoute allowedRoles={['admin', 'pharmacist']}>
                  <ProfitLossReportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/medicines"
              element={
                <ProtectedRoute allowedRoles={['admin', 'pharmacist']}>
                  <MedicinePerformancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/customers"
              element={
                <ProtectedRoute allowedRoles={['admin', 'pharmacist']}>
                  <CustomerReportPage />
                </ProtectedRoute>
              }
            />

            {/* System Settings */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={['admin', 'pharmacist', 'inventory_manager', 'cashier']}>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Fallback Root & Unknown Routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
