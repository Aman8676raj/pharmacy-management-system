import React from 'react';
import {
  Pill,
  DollarSign,
  AlertTriangle,
  Truck,
  Sparkles,
  Info,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import SalesOverviewChart from '../../components/dashboard/SalesOverviewChart';
import RecentTransactionsTable from '../../components/dashboard/RecentTransactionsTable';
import LowStockPreview from '../../components/dashboard/LowStockPreview';
import ExpiringMedicinesPreview from '../../components/dashboard/ExpiringMedicinesPreview';
import { SAMPLE_DASHBOARD_DATA, ROLE_LABELS, ROLE_COLORS } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { stats } = SAMPLE_DASHBOARD_DATA;

  const todayDateString = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              Phase 1 Foundation Active
            </span>
            <span className="text-xs text-teal-200/80 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {todayDateString}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Welcome back, {user?.name || 'Administrator'}
          </h2>
          <p className="text-xs sm:text-sm text-teal-100/80 mt-1 max-w-xl">
            You are signed in as{' '}
            <strong className="text-white">
              {ROLE_LABELS[user?.role] || user?.role}
            </strong>
            . System authentication, role-based protection, and dashboard architecture are operational.
          </p>
        </div>

        <div className="shrink-0 flex sm:flex-col items-start sm:items-end gap-2">
          <div className="text-left sm:text-right">
            <span className="text-[11px] uppercase tracking-wider text-teal-300 block font-semibold">
              Server Status
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300 font-medium bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              API Connected (Port 5000)
            </span>
          </div>
        </div>
      </div>

      {/* Clearly Identified Sample Data Indicator */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl px-4 py-3 flex items-start gap-3 text-xs text-blue-900">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <div className="leading-relaxed">
          <span className="font-semibold">Sample Data Preview:</span> The metrics, sales charts, and preview tables below are curated sample data for visual layout validation in Phase 1. The database stores user credentials and roles. Live CRUD modules (Medicines, Inventory, Sales, Billing) will connect in subsequent phases.
        </div>
      </div>

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Medicines */}
        <StatCard
          title={stats.totalMedicines.label}
          value={stats.totalMedicines.value}
          change={stats.totalMedicines.change}
          trend={stats.totalMedicines.trend}
          detail={stats.totalMedicines.detail}
          icon={Pill}
          accentColor="teal"
        />

        {/* Today's Sales */}
        <StatCard
          title={stats.todaySales.label}
          value={stats.todaySales.value}
          change={stats.todaySales.change}
          trend={stats.todaySales.trend}
          detail={stats.todaySales.detail}
          icon={DollarSign}
          accentColor="blue"
        />

        {/* Low Stock Medicines */}
        <StatCard
          title={stats.lowStockMedicines.label}
          value={stats.lowStockMedicines.value}
          change={stats.lowStockMedicines.change}
          trend={stats.lowStockMedicines.trend}
          detail={stats.lowStockMedicines.detail}
          icon={AlertTriangle}
          accentColor="amber"
        />

        {/* Total Suppliers */}
        <StatCard
          title={stats.totalSuppliers.label}
          value={stats.totalSuppliers.value}
          change={stats.totalSuppliers.change}
          trend={stats.totalSuppliers.trend}
          detail={stats.totalSuppliers.detail}
          icon={Truck}
          accentColor="purple"
        />
      </div>

      {/* Sales Overview Chart */}
      <div className="grid grid-cols-1 gap-6">
        <SalesOverviewChart />
      </div>

      {/* Previews: Low Stock & Expiring Medicines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LowStockPreview />
        <ExpiringMedicinesPreview />
      </div>

      {/* Recent Transactions Table */}
      <div className="grid grid-cols-1">
        <RecentTransactionsTable />
      </div>
    </div>
  );
};

export default DashboardPage;
