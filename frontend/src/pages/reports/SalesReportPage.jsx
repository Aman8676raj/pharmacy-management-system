import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Receipt,
  TrendingUp,
  DollarSign,
  CreditCard,
  UserCheck,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import reportService from '../../services/reportService';
import { ReportDateFilter } from '../../components/reports/ReportDateFilter';
import { ReportKPICard } from '../../components/reports/ReportKPICard';
import { ExportDropdown } from '../../components/reports/ExportDropdown';

export const SalesReportPage = () => {
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
      const res = await reportService.getSalesReport(customFilters);
      setReport(res.data);
    } catch (err) {
      console.error('Failed to load sales report:', err);
      setError('Failed to fetch sales analytics report.');
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
              <Receipt className="w-5 h-5 text-teal-600" />
              Sales & Revenue Report
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Financial reconciliation, collections, payment modes, and staff sales audits.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ExportDropdown type="sales" params={filters} />
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
          title="Gross Revenue"
          value={`₹${summary.grossRevenue?.toLocaleString('en-IN') || 0}`}
          subtitle={`${summary.completedOrders || 0} completed transactions`}
          icon={Receipt}
          variant="teal"
        />
        <ReportKPICard
          title="Amount Collected"
          value={`₹${summary.totalAmountPaid?.toLocaleString('en-IN') || 0}`}
          subtitle={`₹${summary.totalBalanceDue?.toLocaleString('en-IN') || 0} balance due`}
          icon={DollarSign}
          variant="emerald"
        />
        <ReportKPICard
          title="Average Order Value"
          value={`₹${summary.averageOrderValue?.toLocaleString('en-IN') || 0}`}
          subtitle="Revenue per customer order"
          icon={TrendingUp}
          variant="indigo"
        />
        <ReportKPICard
          title="Total Discounts & Tax"
          value={`-₹${summary.totalDiscount?.toLocaleString('en-IN') || 0}`}
          subtitle={`+₹${summary.totalTax?.toLocaleString('en-IN') || 0} tax collected`}
          icon={CreditCard}
          variant="amber"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Over Time */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-800 mb-1">
            Revenue Over Selected Period
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Daily collection totals across completed transactions
          </p>

          <div className="h-64 w-full">
            {report?.timeSeries && report.timeSeries.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={report.timeSeries}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip
                    formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                    labelFormatter={(l) => `Date: ${l}`}
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0D9488"
                    strokeWidth={2}
                    fill="url(#salesGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No revenue recorded in this period.
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-800 mb-1">
            Payment Mode Distribution
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Orders and amounts by payment channel
          </p>

          <div className="space-y-3">
            {(report?.paymentMethods || []).map((pm) => {
              const totalRev = summary.grossRevenue || 1;
              const pct = Math.min(100, Math.round((pm.amount / totalRev) * 100));
              return (
                <div key={pm.method} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 capitalize">
                      {pm.method.replace('_', ' ')}
                    </span>
                    <span className="text-slate-500 font-mono">
                      ₹{pm.amount.toLocaleString('en-IN')} ({pm.count} orders)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Staff Performance & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staff Sales Performance */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-teal-600" />
            Staff Dispensing Performance
          </h3>
          <div className="divide-y divide-slate-100">
            {(report?.staffPerformance || []).length > 0 ? (
              report.staffPerformance.map((staff) => (
                <div key={staff.name} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-800">{staff.name}</div>
                    <div className="text-[11px] text-slate-400 capitalize">{staff.role}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-teal-700">
                      ₹{staff.totalRevenue?.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {staff.salesCount} sales
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-4 text-xs text-slate-400 text-center">
                No staff sales data for this period.
              </div>
            )}
          </div>
        </div>

        {/* Recent Sales Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-teal-600" />
            Recent Sales in Period
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2 px-3">Invoice #</th>
                  <th className="py-2 px-3">Customer</th>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Method</th>
                  <th className="py-2 px-3 text-right">Amount</th>
                  <th className="py-2 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(report?.recentSales || []).length > 0 ? (
                  report.recentSales.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-mono font-medium text-teal-700">
                        <Link to={`/sales/${s._id}`} className="hover:underline">
                          {s.invoiceNumber}
                        </Link>
                      </td>
                      <td className="py-2.5 px-3 text-slate-800 font-medium truncate max-w-[140px]">
                        {s.customerName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-3 capitalize text-slate-600">
                        {s.paymentMethod}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        ₹{s.totalAmount?.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                            s.saleStatus === 'cancelled'
                              ? 'bg-rose-100 text-rose-700'
                              : s.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {s.saleStatus === 'cancelled' ? 'Cancelled' : s.paymentStatus.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-4 text-center text-slate-400">
                      No sales found in this date range.
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

export default SalesReportPage;
