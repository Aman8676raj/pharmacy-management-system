import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Pill,
  DollarSign,
  AlertTriangle,
  Truck,
  Sparkles,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  Archive,
  Database,
} from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import SalesOverviewChart from '../../components/dashboard/SalesOverviewChart';
import RecentTransactionsTable from '../../components/dashboard/RecentTransactionsTable';
import LowStockPreview from '../../components/dashboard/LowStockPreview';
import ExpiringMedicinesPreview from '../../components/dashboard/ExpiringMedicinesPreview';
import { SAMPLE_DASHBOARD_DATA, ROLE_LABELS, ROLE_COLORS } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/formatters';
import medicineService from '../../services/medicineService';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { stats: sampleStats } = SAMPLE_DASHBOARD_DATA;

  const [liveMedicineStats, setLiveMedicineStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const todayDateString = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  useEffect(() => {
    const fetchLiveStats = async () => {
      try {
        const res = await medicineService.getMedicineStats();
        if (res.success && res.data) {
          setLiveMedicineStats(res.data);
        }
      } catch (err) {
        console.error('Error fetching live medicine stats for dashboard:', err);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchLiveStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              Phase 2: Medicine Management Active
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
            . Complete MongoDB Medicine Management CRUD, role-based authorization, and real-time catalog metrics are active.
          </p>
        </div>

        <div className="shrink-0 flex sm:flex-col items-start sm:items-end gap-2">
          <div className="text-left sm:text-right">
            <span className="text-[11px] uppercase tracking-wider text-teal-300 block font-semibold">
              Database Connection
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300 font-medium bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              MongoDB Connected (Port 5000)
            </span>
          </div>
        </div>
      </div>

      {/* Notice differentiating live data vs placeholders */}
      <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl px-4 py-3 flex items-start gap-3 text-xs text-teal-950">
        <Database className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
        <div className="leading-relaxed">
          <span className="font-semibold text-teal-900">Database Integration Active:</span> The <strong>Total Medicines</strong> card and the <strong>Recently Added Medicines</strong> section below are connected directly to live MongoDB records (Phase 2). Sales and Billing, Inventory stock batches, and Supplier orders remain curated sample data until Phase 3 and Phase 4.
        </div>
      </div>

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Medicines (LIVE MONGODB DATA) */}
        <div className="relative">
          <StatCard
            title="Total Active Medicines"
            value={
              isLoadingStats
                ? 'Loading...'
                : `${liveMedicineStats?.totalActive ?? 0}`
            }
            change={
              isLoadingStats
                ? '...'
                : `${liveMedicineStats?.totalCategories ?? 0} Categories`
            }
            trend="up"
            detail={
              liveMedicineStats
                ? `${liveMedicineStats.totalInactive} deactivated in database`
                : 'Live database count'
            }
            icon={Pill}
            accentColor="teal"
          />
          <div className="absolute top-2.5 right-2.5">
            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              Live DB
            </span>
          </div>
        </div>

        {/* Today's Sales (Sample data for future phase) */}
        <div className="relative">
          <StatCard
            title={sampleStats.todaySales.label}
            value={sampleStats.todaySales.value}
            change={sampleStats.todaySales.change}
            trend={sampleStats.todaySales.trend}
            detail="Phase 4 Billing Preview"
            icon={DollarSign}
            accentColor="blue"
          />
          <div className="absolute top-2.5 right-2.5">
            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
              Sample Data
            </span>
          </div>
        </div>

        {/* Low Stock Medicines (Sample data for Phase 3 Inventory) */}
        <div className="relative">
          <StatCard
            title={sampleStats.lowStockMedicines.label}
            value={sampleStats.lowStockMedicines.value}
            change={sampleStats.lowStockMedicines.change}
            trend={sampleStats.lowStockMedicines.trend}
            detail="Phase 3 Inventory Preview"
            icon={AlertTriangle}
            accentColor="amber"
          />
          <div className="absolute top-2.5 right-2.5">
            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
              Sample Data
            </span>
          </div>
        </div>

        {/* Total Suppliers (Sample data for future phase) */}
        <div className="relative">
          <StatCard
            title={sampleStats.totalSuppliers.label}
            value={sampleStats.totalSuppliers.value}
            change={sampleStats.totalSuppliers.change}
            trend={sampleStats.totalSuppliers.trend}
            detail="Phase 3 Supplier Preview"
            icon={Truck}
            accentColor="purple"
          />
          <div className="absolute top-2.5 right-2.5">
            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
              Sample Data
            </span>
          </div>
        </div>
      </div>

      {/* NEW: Live Recently Added Medicines from MongoDB */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
              <Pill className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-900">
                  Recently Added Medicines
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live MongoDB Records
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Latest pharmaceutical formulations added to the master formulary
              </p>
            </div>
          </div>

          <Link
            to="/medicines"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:text-teal-900 transition-colors"
          >
            <span>View All Medicines</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3">Medicine Name</th>
                <th className="px-5 py-3">Generic Entity</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Dosage & Strength</th>
                <th className="px-5 py-3 font-mono">SKU</th>
                <th className="px-5 py-3">Date Registered</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {liveMedicineStats?.recentMedicines && liveMedicineStats.recentMedicines.length > 0 ? (
                liveMedicineStats.recentMedicines.map((med) => (
                  <tr key={med.id || med._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-900">
                      {med.name}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {med.genericName || '-'}
                    </td>
                    <td className="px-5 py-3">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium text-[11px]">
                        {med.category}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-700">
                      {med.dosageForm} {med.strength ? `(${med.strength})` : ''}
                    </td>
                    <td className="px-5 py-3 font-mono text-slate-600">
                      {med.sku}
                    </td>
                    <td className="px-5 py-3 text-slate-400">
                      {formatDate(med.createdAt)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        to={`/medicines/${med.id || med._id}`}
                        className="text-teal-600 hover:text-teal-800 font-medium hover:underline"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-6 text-center text-slate-400">
                    No medicines registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sales Overview Chart (Sample Data) */}
      <div className="grid grid-cols-1 gap-6">
        <SalesOverviewChart />
      </div>

      {/* Previews: Low Stock & Expiring Medicines (Sample Data for Phase 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LowStockPreview />
        <ExpiringMedicinesPreview />
      </div>

      {/* Recent Transactions Table (Sample Data for Phase 4) */}
      <div className="grid grid-cols-1">
        <RecentTransactionsTable />
      </div>
    </div>
  );
};

export default DashboardPage;
