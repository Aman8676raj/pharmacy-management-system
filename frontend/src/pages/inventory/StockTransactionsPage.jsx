import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  ArrowLeft,
  RefreshCw,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Boxes,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import TransactionTable from '../../components/inventory/TransactionTable';
import inventoryService from '../../services/inventoryService';
import { TRANSACTION_TYPE_CONFIGS } from '../../utils/constants';

export default function StockTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 15,
    transactionType: '',
    search: '',
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: filters.page,
        limit: filters.limit,
      };
      if (filters.transactionType) params.transactionType = filters.transactionType;

      const res = await inventoryService.getTransactions(params);
      if (res.success) {
        let list = res.data?.transactions || [];
        // Apply frontend search filtering if user typed search query
        if (filters.search.trim()) {
          const q = filters.search.trim().toLowerCase();
          list = list.filter((t) => {
            const medName = t.medicine?.name?.toLowerCase() || '';
            const sku = t.medicine?.sku?.toLowerCase() || '';
            const batchNum = t.batch?.batchNumber?.toLowerCase() || '';
            const reason = t.reason?.toLowerCase() || '';
            const ref = t.reference?.toLowerCase() || '';
            return (
              medName.includes(q) ||
              sku.includes(q) ||
              batchNum.includes(q) ||
              reason.includes(q) ||
              ref.includes(q)
            );
          });
        }
        setTransactions(list);
        if (res.data?.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleTypeChange = (e) => {
    setFilters((prev) => ({ ...prev, transactionType: e.target.value, page: 1 }));
  };

  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setFilters((prev) => ({ ...prev, page: newPage }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <Link to="/inventory" className="hover:text-teal-600 transition-colors">
              Inventory Hub
            </Link>
            <span>/</span>
            <span className="text-teal-600 font-semibold">Audit Logs</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
            <History className="w-7 h-7 text-teal-600" />
            Stock Movement Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Immutable log of all stock intakes, manual adjustments, quarantine holds, and releases.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link to="/inventory">
            <Button variant="outline" size="sm" className="flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              Back to Overview
            </Button>
          </Link>
          <Link to="/inventory/stock">
            <Button variant="outline" size="sm" className="flex items-center gap-1.5">
              <Boxes className="w-4 h-4" />
              Batch Directory
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTransactions}
            disabled={loading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <Alert
          type="error"
          title="Audit Trail Error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={handleSearchChange}
              placeholder="Search by medicine, batch, reason, reference..."
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filters.transactionType}
              onChange={handleTypeChange}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white"
            >
              <option value="">All Movement Types</option>
              {Object.entries(TRANSACTION_TYPE_CONFIGS).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 text-right">
          Showing <strong className="font-semibold text-slate-700">{transactions.length}</strong> transactions
        </div>
      </div>

      {/* Transactions Table */}
      <TransactionTable
        transactions={transactions}
        loading={loading}
        emptyMessage="No matching transaction events found."
      />

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total recorded movements)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="flex items-center gap-1 text-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <span className="text-xs font-mono font-medium text-slate-600 px-2">
              {pagination.page} / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || loading}
              className="flex items-center gap-1 text-xs"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

