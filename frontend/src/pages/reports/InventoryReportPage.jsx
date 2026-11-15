import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  BarChart2,
  Boxes,
} from 'lucide-react';
import reportService from '../../services/reportService';
import { ReportKPICard } from '../../components/reports/ReportKPICard';
import { ExportDropdown } from '../../components/reports/ExportDropdown';

export const InventoryReportPage = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReport = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await reportService.getInventoryReport();
      setReport(res.data);
    } catch (err) {
      console.error('Failed to load inventory report:', err);
      setError('Failed to fetch inventory report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const summary = report?.summary || {};
  const expiry = report?.expiryAnalysis || {};
  const movements = report?.recentMovements || {};

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
              <Package className="w-5 h-5 text-indigo-600" />
              Inventory Valuation & Stock Report
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live stock asset valuation, shelf-life risk profiling, category distributions, and audit movements.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ExportDropdown type="inventory" />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Valuation Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportKPICard
          title="Purchase Cost Valuation"
          value={`₹${summary.purchaseCostValuation?.toLocaleString('en-IN') || 0}`}
          subtitle={`${summary.totalStockUnits || 0} total units in stock`}
          icon={Package}
          variant="indigo"
        />
        <ReportKPICard
          title="Retail Selling Valuation"
          value={`₹${summary.sellingPriceValuation?.toLocaleString('en-IN') || 0}`}
          subtitle={`₹${summary.potentialProfit?.toLocaleString('en-IN') || 0} potential profit`}
          icon={TrendingUp}
          variant="teal"
        />
        <ReportKPICard
          title="Potential Gross Margin"
          value={`${summary.potentialMarginPercent || 0}%`}
          subtitle="Theoretical margin on current inventory"
          icon={BarChart2}
          variant="emerald"
        />
        <ReportKPICard
          title="Stock Alerts"
          value={`${summary.lowStockCount || 0} Low`}
          subtitle={`${summary.outOfStockCount || 0} out of stock medicines`}
          icon={AlertTriangle}
          variant={summary.lowStockCount > 0 ? 'amber' : 'emerald'}
        />
      </div>

      {/* Expiry Risk Buckets & Recent Stock Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiry Risk Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600" />
            Batch Expiration Risk Profile
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Proactive monitoring to minimize expired medicine write-offs
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
              <div className="text-[11px] text-rose-600 font-semibold uppercase">Already Expired</div>
              <div className="text-lg font-bold text-rose-800 mt-1">{expiry.expiredBatches || 0}</div>
              <div className="text-[10px] text-rose-500 mt-0.5">
                Loss: ₹{expiry.expiredValuationLoss || 0}
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="text-[11px] text-amber-600 font-semibold uppercase">&le; 30 Days</div>
              <div className="text-lg font-bold text-amber-800 mt-1">{expiry.expiringWithin30Days || 0}</div>
              <div className="text-[10px] text-amber-600 mt-0.5">Critical Priority</div>
            </div>

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="text-[11px] text-yellow-700 font-semibold uppercase">31–60 Days</div>
              <div className="text-lg font-bold text-yellow-800 mt-1">{expiry.expiringWithin60Days || 0}</div>
              <div className="text-[10px] text-yellow-600 mt-0.5">Upcoming Risk</div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="text-[11px] text-emerald-700 font-semibold uppercase">61–90 Days</div>
              <div className="text-lg font-bold text-emerald-800 mt-1">{expiry.expiringWithin90Days || 0}</div>
              <div className="text-[10px] text-emerald-600 mt-0.5">Safe Horizon</div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Quarantined Stock Units: <strong>{summary.quarantinedUnits || 0}</strong></span>
            <Link to="/inventory/stock" className="text-teal-600 hover:underline font-medium">
              View Active Batches &rarr;
            </Link>
          </div>
        </div>

        {/* Stock Movements Audit */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-1.5">
            <Boxes className="w-4 h-4 text-teal-600" />
            Stock Movements Summary
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Audited quantity changes across transaction types
          </p>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-xs">
              <span className="font-semibold text-emerald-900">Stock Received (Stock In)</span>
              <span className="font-bold text-emerald-800 font-mono">+{movements.stock_in || 0} units</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-teal-50 text-xs">
              <span className="font-semibold text-teal-900">Dispensed via POS (Stock Out)</span>
              <span className="font-bold text-teal-800 font-mono">-{movements.stock_out || 0} units</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 text-xs">
              <span className="font-semibold text-blue-900">Customer Returns (Return In)</span>
              <span className="font-bold text-blue-800 font-mono">+{movements.return_in || 0} units</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs">
              <span className="font-semibold text-slate-700">Audit Adjustments (+ / -)</span>
              <span className="font-bold text-slate-700 font-mono">
                +{movements.adjustment_in || 0} / -{movements.adjustment_out || 0} units
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Warnings Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Low Stock & Reorder Alerts
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Medicines currently below or at their configured minimum threshold
            </p>
          </div>
          <Link
            to="/purchases/new"
            className="text-xs text-teal-700 hover:text-teal-800 font-semibold px-2.5 py-1 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
          >
            Create Purchase Order &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-3">Medicine Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-3 text-center">Min Threshold</th>
                <th className="py-2.5 px-3 text-center">Available Stock</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(report?.lowStockAlerts || []).length > 0 ? (
                report.lowStockAlerts.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      <Link to={`/medicines/${m._id}`} className="hover:underline text-teal-700">
                        {m.name}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{m.category}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{m.sku}</td>
                    <td className="py-2.5 px-3 text-center font-medium text-slate-700">
                      {m.minimumStock}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold font-mono">
                      <span className={m.currentStock === 0 ? 'text-rose-600' : 'text-amber-600'}>
                        {m.currentStock}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                          m.currentStock === 0
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {m.currentStock === 0 ? 'Out of Stock' : 'Low Stock'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-slate-400">
                    All inventory levels are currently above configured minimum thresholds.
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

export default InventoryReportPage;

