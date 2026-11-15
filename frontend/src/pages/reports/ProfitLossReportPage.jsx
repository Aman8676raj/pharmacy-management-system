import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  DollarSign,
  PieChart as PieIcon,
  AlertTriangle,
  ArrowLeft,
  Percent,
  Receipt,
  Scale,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import reportService from '../../services/reportService';
import { ReportDateFilter } from '../../components/reports/ReportDateFilter';
import { ReportKPICard } from '../../components/reports/ReportKPICard';
import { ExportDropdown } from '../../components/reports/ExportDropdown';

export const ProfitLossReportPage = () => {
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
      const res = await reportService.getProfitLossReport(customFilters);
      setReport(res.data);
    } catch (err) {
      console.error('Failed to load profit and loss report:', err);
      setError('Failed to fetch Profit & Loss analytics report.');
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
              <TrendingUp className="w-5 h-5 text-amber-600" />
              Profit & Loss (P&L) Statement
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Net revenue vs Cost of Goods Sold (COGS), batch allocation margins, and operating figures.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ExportDropdown type="profit_loss" params={filters} />
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

      {/* KPI Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportKPICard
          title="Gross Sales Revenue"
          value={`₹${summary.grossRevenue?.toLocaleString('en-IN') || 0}`}
          subtitle={`${summary.totalOrders || 0} completed orders`}
          icon={Receipt}
          variant="teal"
        />
        <ReportKPICard
          title="Cost of Goods Sold (COGS)"
          value={`₹${summary.costOfGoodsSold?.toLocaleString('en-IN') || 0}`}
          subtitle="Inventory acquisition cost via FEFO"
          icon={Scale}
          variant="rose"
        />
        <ReportKPICard
          title="Gross Profit"
          value={`₹${summary.grossProfit?.toLocaleString('en-IN') || 0}`}
          subtitle={`₹${summary.totalDiscountsGiven || 0} discounts deducted`}
          icon={DollarSign}
          variant="emerald"
        />
        <ReportKPICard
          title="Gross Margin"
          value={`${summary.grossMarginPercent || 0}%`}
          subtitle="Gross profit percentage on sales"
          icon={Percent}
          variant="indigo"
        />
      </div>

      {/* Financial Comparison Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-800 mb-1">
          Revenue vs COGS vs Gross Profit Comparison
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Financial performance breakdown over the selected timeframe
        </p>

        <div className="h-72 w-full">
          {report?.timeSeries && report.timeSeries.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.timeSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  formatter={(val, name) => [`₹${Number(val).toLocaleString('en-IN')}`, name]}
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="revenue" name="Revenue" fill="#0D9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cogs" name="COGS" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Gross Profit" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No financial sales records found in this timeframe.
            </div>
          )}
        </div>
      </div>

      {/* Income Statement Summary Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
          <Scale className="w-4 h-4 text-teal-600" />
          Financial Statement Ledger Breakdown
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Revenue (INR)</th>
                <th className="py-2.5 px-3 text-right">COGS (INR)</th>
                <th className="py-2.5 px-3 text-right">Gross Profit (INR)</th>
                <th className="py-2.5 px-3 text-right">Margin (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(report?.timeSeries || []).length > 0 ? (
                report.timeSeries.map((row) => {
                  const m = row.revenue > 0 ? ((row.profit / row.revenue) * 100).toFixed(1) : 0;
                  return (
                    <tr key={row.date} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-mono text-slate-700 font-medium">
                        {row.date}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-900">
                        ₹{row.revenue?.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-rose-600">
                        ₹{row.cogs?.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                        ₹{row.profit?.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-700">
                        {m}%
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-slate-400">
                    No ledger entries for the selected period.
                  </td>
                </tr>
              )}
            </tbody>
            {report?.timeSeries && report.timeSeries.length > 0 && (
              <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-200 text-xs">
                <tr>
                  <td className="py-3 px-3 text-slate-900">Period Total</td>
                  <td className="py-3 px-3 text-right text-slate-900">
                    ₹{summary.grossRevenue?.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right text-rose-600">
                    ₹{summary.costOfGoodsSold?.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-700 font-extrabold">
                    ₹{summary.grossProfit?.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right text-teal-800">
                    {summary.grossMarginPercent}%
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProfitLossReportPage;
