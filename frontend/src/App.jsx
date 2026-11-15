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
            <Route path="/dashboard" element={<DashboardPage />} />
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
