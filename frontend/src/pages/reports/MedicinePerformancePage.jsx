import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Award,
  AlertTriangle,
  ArrowLeft,
  Package,
  Layers,
  Percent,
} from 'lucide-react';
import reportService from '../../services/reportService';
import { ReportDateFilter } from '../../components/reports/ReportDateFilter';
import { ExportDropdown } from '../../components/reports/ExportDropdown';

export const MedicinePerformancePage = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('revenue'); // revenue, quantity, margin, slow
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
  });

  const loadReport = async (customFilters = filters) => {
    try {
      setLoading(true);
      setError('');
      const res = await reportService.getMedicinePerformanceReport({ ...customFilters, limit: 15 });
      setReport(res.data);
    } catch (err) {
      console.error('Failed to load medicine performance report:', err);
      setError('Failed to fetch medicine performance analytics.');
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

  const getTableData = () => {
    if (!report) return [];
    if (activeTab === 'revenue') return report.topByRevenue || [];
    if (activeTab === 'quantity') return report.topByQuantity || [];
    if (activeTab === 'margin') return report.highestMargin || [];
    if (activeTab === 'slow') return report.slowMoving || [];
    return [];
  };

  const tableData = getTableData();

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
              <BarChart3 className="w-5 h-5 text-rose-600" />
              Medicine Sales & Margin Performance
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Top performing drugs, prescription bestsellers, gross margins, and slow-moving stock detection.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ExportDropdown type="medicines" params={filters} />
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

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('revenue')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'revenue'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          Top Bestsellers by Revenue
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('quantity')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'quantity'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4 text-teal-600" />
          Top by Units Sold
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('margin')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'margin'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Percent className="w-4 h-4 text-emerald-600" />
          Highest Profit Margin
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('slow')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'slow'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          Slow-Moving Inventory
        </button>
      </div>

      {/* Performance Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Medicine Name</th>
                <th className="py-2.5 px-3 text-center">Units Sold</th>
                <th className="py-2.5 px-3 text-right">Total Revenue</th>
                <th className="py-2.5 px-3 text-right">Cost (COGS)</th>
                <th className="py-2.5 px-3 text-right">Gross Profit</th>
                <th className="py-2.5 px-3 text-right">Margin (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tableData.length > 0 ? (
                tableData.map((item, idx) => (
                  <tr key={item.medicineName + idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {item.medicineId ? (
                        <Link to={`/medicines/${item.medicineId}`} className="hover:underline text-teal-700">
                          {item.medicineName}
                        </Link>
                      ) : (
                        item.medicineName
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold font-mono text-slate-800">
                      {item.totalQuantitySold}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-900">
                      ₹{item.totalRevenue?.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-rose-600">
                      ₹{item.totalCost?.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                      ₹{item.grossProfit?.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-teal-800">
                      {item.marginPercent}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-slate-400">
                    No medicine sales activity recorded in this timeframe.
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

export default MedicinePerformancePage;
