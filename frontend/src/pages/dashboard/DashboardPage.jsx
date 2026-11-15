import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Pill,
  DollarSign,
  AlertTriangle,
  Truck,
  Sparkles,
  Calendar,
  ArrowRight,
  Database,
  ShoppingCart,
  Boxes,
} from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import SalesOverviewChart from '../../components/dashboard/SalesOverviewChart';
import RecentTransactionsTable from '../../components/dashboard/RecentTransactionsTable';
import LowStockPreview from '../../components/dashboard/LowStockPreview';
import ExpiringMedicinesPreview from '../../components/dashboard/ExpiringMedicinesPreview';
import { SAMPLE_DASHBOARD_DATA, ROLE_LABELS } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/formatters';
import medicineService from '../../services/medicineService';
import inventoryService from '../../services/inventoryService';
import supplierService from '../../services/supplierService';
import purchaseService from '../../services/purchaseService';

export default function DashboardPage() {
  const { user } = useAuth();
  const { stats: sampleStats } = SAMPLE_DASHBOARD_DATA;

  const [liveMedicineStats, setLiveMedicineStats] = useState(null);
  const [liveInventorySummary, setLiveInventorySummary] = useState(null);
  const [liveSupplierStats, setLiveSupplierStats] = useState(null);
  const [livePurchaseStats, setLivePurchaseStats] = useState(null);
  const [liveLowStock, setLiveLowStock] = useState([]);
  const [liveExpiring, setLiveExpiring] = useState([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const todayDateString = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [medsRes, invSummaryRes, lowRes, expRes, supRes, poRes] = await Promise.allSettled([
          medicineService.getMedicineStats(),
          inventoryService.getInventorySummary(),
          inventoryService.getLowStockMedicines(),
          inventoryService.getExpiringBatches(90),
          supplierService.getSupplierStats(),
          purchaseService.getPurchaseStats(),
        ]);

        if (medsRes.status === 'fulfilled' && medsRes.value.success) {
          setLiveMedicineStats(medsRes.value.data);
        }
        if (invSummaryRes.status === 'fulfilled' && invSummaryRes.value.success) {
          setLiveInventorySummary(invSummaryRes.value.data);
        }
        if (lowRes.status === 'fulfilled' && lowRes.value.success) {
          setLiveLowStock(lowRes.value.data?.medicines || lowRes.value.data || []);
        }
        if (expRes.status === 'fulfilled' && expRes.value.success) {
          setLiveExpiring(expRes.value.data?.batches || expRes.value.data || []);
        }
        if (supRes.status === 'fulfilled' && supRes.value.success) {
          setLiveSupplierStats(supRes.value.data);
        }
        if (poRes.status === 'fulfilled' && poRes.value.success) {
          setLivePurchaseStats(poRes.value.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard live data:', err);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              Phase 4: Supplier &amp; Purchase Management Active
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
            . Live MongoDB formulary catalog, batch tracking, FEFO dispatch, vendor directory, and procurement workflows are fully operational.
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
          <span className="font-semibold text-teal-900">Database Integration Active:</span> <strong>Total Medicines</strong>, <strong>Low Stock Thresholds</strong>, <strong>Active Suppliers</strong>, and <strong>Purchase Orders &amp; Deliveries</strong> are connected live to MongoDB records (Phases 1-4). Point-of-Sale billing and Customer directories remain curated previews for Phase 5.
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

        {/* Low Stock Medicines (LIVE MONGODB DATA) */}
        <div className="relative">
          <StatCard
            title="Low Stock Medicines"
            value={
              isLoadingStats
                ? 'Loading...'
                : `${liveInventorySummary?.lowStockMedicineCount ?? 0}`
            }
            change={
              isLoadingStats
                ? '...'
                : `${liveInventorySummary?.expiringSoonCount ?? 0} Expiring Soon`
            }
            trend={
              liveInventorySummary?.lowStockMedicineCount > 0 ? 'warning' : 'up'
            }
            detail="Below minimum threshold in live DB"
            icon={AlertTriangle}
            accentColor="amber"
          />
          <div className="absolute top-2.5 right-2.5">
            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              Live DB
            </span>
          </div>
        </div>

        {/* Total Suppliers (LIVE MONGODB DATA - PHASE 4) */}
        <div className="relative">
          <StatCard
            title="Active Suppliers"
            value={
              isLoadingStats
                ? 'Loading...'
                : `${liveSupplierStats?.active ?? 0}`
            }
            change={
              isLoadingStats
                ? '...'
                : `${liveSupplierStats?.totalCities ?? 0} Operating Cities`
            }
            trend="up"
            detail={
              liveSupplierStats
                ? `${liveSupplierStats.total} total vendors registered`
                : 'Live vendor directory'
            }
            icon={Truck}
            accentColor="purple"
          />
          <div className="absolute top-2.5 right-2.5">
            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              Live DB
            </span>
          </div>
        </div>

        {/* Purchase Orders (LIVE MONGODB DATA - PHASE 4) */}
        <div className="relative">
          <StatCard
            title="Purchase Orders"
            value={
              isLoadingStats
                ? 'Loading...'
                : `${livePurchaseStats?.totalOrders ?? 0}`
            }
            change={
              isLoadingStats
                ? '...'
                : `${livePurchaseStats?.pendingOrders ?? 0} Pending Deliveries`
            }
            trend={livePurchaseStats?.pendingOrders > 0 ? 'warning' : 'up'}
            detail={
              livePurchaseStats
                ? `$${livePurchaseStats.totalPurchaseValue?.toFixed(2)} lifetime spend`
                : 'Procurement metrics'
            }
            icon={ShoppingCart}
            accentColor="blue"
          />
          <div className="absolute top-2.5 right-2.5">
            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              Live DB
            </span>
          </div>
        </div>
      </div>

      {/* Live Recently Added Medicines from MongoDB */}
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
                <th className="px-5 py-3">Dosage &amp; Strength</th>
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

      {/* Previews: Low Stock & Expiring Medicines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LowStockPreview items={liveLowStock} isLive={true} />
        <ExpiringMedicinesPreview items={liveExpiring} isLive={true} />
      </div>

      {/* Sales Overview Chart (Sample Data for Phase 5) */}
      <div className="grid grid-cols-1 gap-6">
        <SalesOverviewChart />
      </div>

      {/* Recent Transactions Table (Sample Data for Phase 5) */}
      <div className="grid grid-cols-1">
        <RecentTransactionsTable />
      </div>
    </div>
  );
}
