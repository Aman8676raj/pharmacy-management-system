import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  TrendingUp,
  Award,
  AlertTriangle,
  ArrowLeft,
  DollarSign,
  HeartPulse,
} from 'lucide-react';
import reportService from '../../services/reportService';
import { ReportDateFilter } from '../../components/reports/ReportDateFilter';
import { ReportKPICard } from '../../components/reports/ReportKPICard';
import { ExportDropdown } from '../../components/reports/ExportDropdown';

export const CustomerReportPage = () => {
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
      const res = await reportService.getCustomerReport(customFilters);
      setReport(res.data);
    } catch (err) {
      console.error('Failed to load customer report:', err);
      setError('Failed to fetch patient analytics report.');
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
              <Users className="w-5 h-5 text-teal-600" />
              Patient & Customer Analytics
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Patient acquisition rates, repeat dispensing loyalty, and top patient spenders.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ExportDropdown type="customers" params={filters} />
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
          title="Total Registered Patients"
          value={`${summary.totalCustomers || 0}`}
          subtitle={`${summary.activeCustomers || 0} active patient profiles`}
          icon={Users}
          variant="teal"
        />
        <ReportKPICard
          title="New Patients Acquired"
          value={`${summary.newCustomersAcquired || 0}`}
          subtitle="Patients registered in selected period"
          icon={UserCheck}
          variant="emerald"
        />
        <ReportKPICard
          title="Repeat Patient Rate"
          value={`${summary.repeatRatePercent || 0}%`}
          subtitle={`${summary.repeatCustomers || 0} repeat patients (>=2 visits)`}
          icon={HeartPulse}
          variant="indigo"
        />
        <ReportKPICard
          title="Transacting Patients"
          value={`${summary.transactingCustomers || 0}`}
          subtitle="Unique patients with purchases"
          icon={Award}
          variant="amber"
        />
      </div>

      {/* Top Patient Spenders Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-500" />
          Top Spending Patients
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-3">Patient Code</th>
                <th className="py-2.5 px-3">Patient Name</th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-3 text-center">Invoices</th>
                <th className="py-2.5 px-3 text-right">Total Spend</th>
                <th className="py-2.5 px-3 text-right">Average Order Value</th>
                <th className="py-2.5 px-3 text-center">Last Dispense</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(report?.topSpenders || []).length > 0 ? (
                report.topSpenders.map((c) => (
                  <tr key={c.customerId || c.code} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono font-medium text-teal-700">
                      {c.customerId ? (
                        <Link to={`/customers/${c.customerId}`} className="hover:underline">
                          {c.code}
                        </Link>
                      ) : (
                        c.code
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {c.name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono">
                      {c.phone || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                      {c.ordersCount}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      ₹{c.totalSpend?.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                      ₹{c.averageOrderValue?.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-500">
                      {c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-slate-400">
                    No customer purchase transactions recorded in this date range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerReportPage;
