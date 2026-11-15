import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Truck,
  DollarSign,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
import reportService from '../../services/reportService';
import { ReportDateFilter } from '../../components/reports/ReportDateFilter';
import { ReportKPICard } from '../../components/reports/ReportKPICard';
import { ExportDropdown } from '../../components/reports/ExportDropdown';

export const PurchaseReportPage = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
  });

  const loadReport = async (customFilters = filters) => {
    try {
      setLoading(true);
      setError('');
      const res = await reportService.getPurchaseReport(customFilters);
      setReport(res.data);
    } catch (err) {
      console.error('Failed to load purchase report:', err);
      setError('Failed to fetch procurement report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const handleApplyFilter = (newDates) => {
    const updated = { ...filters, ...newDates };
    setFilters(updated);
    loadReport(updated);
  };

  const handleResetFilter = () => {
    const reset = { startDate: '', endDate: '' };
    setFilters(reset);
    loadReport(reset);
  };

  const summary = report?.summary || {};
  const statusCounts = report?.statusCounts || {};

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/reports"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-emerald-600" />
              Procurement & Purchase Report
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Vendor procurement spend, purchase order fulfillments, and supplier allocation audits.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ExportDropdown type="purchases" params={filters} />
        </div>
      </div>

      {/* Date Filter */}
      <ReportDateFilter
        startDate={filters.startDate}
        endDate={filters.endDate}
        onApply={handleApplyFilter}
        onReset={handleResetFilter}
        loading={loading}
      />

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportKPICard
          title="Procurement Spend"
          value={`₹${summary.netProcurementSpend?.toLocaleString('en-IN') || 0}`}
          subtitle={`${summary.totalOrders || 0} purchase orders placed`}
          icon={DollarSign}
          variant="emerald"
        />
        <ReportKPICard
          title="Active Vendors"
          value={`${summary.activeSuppliersCount || 0} Suppliers`}
          subtitle="Suppliers with purchase orders in period"
          icon={Truck}
          variant="teal"
        />
        <ReportKPICard
          title="Fulfillment Status"
          value={`${statusCounts.received || 0} Received`}
          subtitle={`${statusCounts.partial || 0} partial • ${statusCounts.ordered || 0} pending`}
          icon={CheckCircle2}
          variant="indigo"
        />
        <ReportKPICard
          title="Draft / Cancelled"
          value={`${statusCounts.draft || 0} Draft`}
          subtitle={`${statusCounts.cancelled || 0} orders cancelled`}
          icon={Layers}
          variant="amber"
        />
      </div>

      {/* Supplier Spend Distribution & Recent POs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Supplier Spend Share */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-emerald-600" />
            Top Suppliers by Spend
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Procurement expenditure distribution across vendors
          </p>

          <div className="space-y-3.5">
            {(report?.supplierSpend || []).length > 0 ? (
              report.supplierSpend.map((s) => (
                <div key={s.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 truncate max-w-[140px]">
                      {s.name}
                    </span>
                    <span className="text-slate-500 font-mono">
                      ₹{s.totalSpend.toLocaleString('en-IN')} ({s.spendPercent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${s.spendPercent}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between">
                    <span>Code: {s.code}</span>
                    <span>{s.orderCount} POs</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                No purchase spend recorded in this date range.
              </div>
            )}
          </div>
        </div>

        {/* Recent Purchase Orders Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
            <ShoppingCart className="w-4 h-4 text-teal-600" />
            Purchase Orders in Period
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">PO Number</th>
                  <th className="py-2.5 px-3">Supplier</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-center">Items</th>
                  <th className="py-2.5 px-3 text-right">Total Amount</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(report?.recentPurchases || []).length > 0 ? (
                  report.recentPurchases.map((po) => (
                    <tr key={po._id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-mono font-medium text-teal-700">
                        <Link to={`/purchases/${po._id}`} className="hover:underline">
                          {po.poNumber}
                        </Link>
                      </td>
                      <td className="py-2.5 px-3 text-slate-800 font-medium truncate max-w-[150px]">
                        {po.supplierName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {new Date(po.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-3 text-center font-medium text-slate-700">
                        {po.itemCount}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        ₹{po.totalAmount?.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                            po.status === 'received'
                              ? 'bg-emerald-100 text-emerald-700'
                              : po.status === 'partial'
                              ? 'bg-blue-100 text-blue-700'
                              : po.status === 'ordered'
                              ? 'bg-amber-100 text-amber-700'
                              : po.status === 'cancelled'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {po.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-slate-400">
                      No purchase orders recorded in this date range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseReportPage;

