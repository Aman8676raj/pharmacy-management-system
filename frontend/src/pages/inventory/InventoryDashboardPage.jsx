import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes,
  Plus,
  RefreshCw,
  History,
  ListFilter,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import StockSummaryCards from '../../components/inventory/StockSummaryCards';
import LowStockTable from '../../components/inventory/LowStockTable';
import ExpiryAlerts from '../../components/inventory/ExpiryAlerts';
import TransactionTable from '../../components/inventory/TransactionTable';
import inventoryService from '../../services/inventoryService';
import { useAuth } from '../../hooks/useAuth';

export default function InventoryDashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const canManageStock = ['admin', 'inventory_manager'].includes(user?.role);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, lowRes, expRes, txRes] = await Promise.all([
        inventoryService.getInventorySummary(),
        inventoryService.getLowStockMedicines(),
        inventoryService.getExpiringBatches(90),
        inventoryService.getTransactions({ limit: 6 }),
      ]);

      if (sumRes.success) setSummary(sumRes.data);
      if (lowRes.success) setLowStock(lowRes.data?.medicines || lowRes.data || []);
      if (expRes.success) setExpiring(expRes.data?.batches || expRes.data || []);
      if (txRes.success) setTransactions(txRes.data?.transactions || txRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load inventory overview');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <span>Pharmacy</span>
            <span>/</span>
            <span className="text-teal-600 font-semibold">Inventory Hub</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
            <Boxes className="w-7 h-7 text-teal-600" />
            Inventory &amp; Stock Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Batch-wise stock levels, FEFO expiry schedules, inventory valuation, and auditable movement logs.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Link to="/inventory/stock">
            <Button variant="outline" size="sm" className="flex items-center gap-1.5">
              <ListFilter className="w-4 h-4" />
              Batch Directory
            </Button>
          </Link>

          <Link to="/inventory/transactions">
            <Button variant="outline" size="sm" className="flex items-center gap-1.5">
              <History className="w-4 h-4" />
              Audit Logs
            </Button>
          </Link>

          {canManageStock && (
            <Link to="/inventory/stock-in">
              <Button variant="primary" size="sm" className="flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                Record Stock In
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <Alert
          type="error"
          title="Inventory Sync Error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Summary KPI Cards */}
      <StockSummaryCards summary={summary} loading={loading} />

      {/* Operations Grid: Low Stock Alert + Expiry Watch */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <LowStockTable
            medicines={lowStock}
            loading={loading}
            canAddStock={canManageStock}
          />
        </div>
        <div>
          <ExpiryAlerts
            batches={expiring}
            loading={loading}
            threshold={90}
          />
        </div>
      </div>

      {/* Recent Movements Audit Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-blue-50 text-blue-600">
              <History className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold text-slate-800">Recent Stock Movements</h2>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
              Latest 6 events
            </span>
          </div>
          <Link
            to="/inventory/transactions"
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 hover:underline"
          >
            Full Audit Trail
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <TransactionTable
          transactions={transactions}
          loading={loading}
          emptyMessage="No stock transactions recorded yet."
        />
      </div>
    </div>
  );
}

