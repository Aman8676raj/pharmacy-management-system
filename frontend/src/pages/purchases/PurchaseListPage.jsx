import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import PurchaseTable from '../../components/purchases/PurchaseTable';
import ReceiveStockModal from '../../components/purchases/ReceiveStockModal';
import purchaseService from '../../services/purchaseService';
import supplierService from '../../services/supplierService';
import { useAuth } from '../../hooks/useAuth';

export default function PurchaseListPage() {
  const { user } = useAuth();
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Filters state
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: 'all',
    supplier: '',
    startDate: '',
    endDate: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Modal for receiving stock directly
  const [receivingTargetPO, setReceivingTargetPO] = useState(null);

  const canManage = ['admin', 'inventory_manager'].includes(user?.role);

  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [listRes, statsRes] = await Promise.all([
        purchaseService.getPurchases(filters),
        purchaseService.getPurchaseStats(),
      ]);

      if (listRes.success) {
        setPurchaseOrders(listRes.data?.purchaseOrders || []);
        if (listRes.data?.pagination) {
          setPagination(listRes.data.pagination);
        }
      }

      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch purchase orders');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  // Load suppliers list for filter dropdown
  useEffect(() => {
    supplierService
      .getSuppliers({ limit: 100 })
      .then((res) => {
        if (res.success) setSuppliers(res.data?.suppliers || []);
      })
      .catch((err) => console.error('Failed to load suppliers for filter:', err));
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: '',
      status: 'all',
      supplier: '',
      startDate: '',
      endDate: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setFilters((prev) => ({ ...prev, page: newPage }));
    }
  };

  // Submit stock intake from modal
  const handleReceiveSubmit = async (payload) => {
    if (!receivingTargetPO) return;
    try {
      const res = await purchaseService.receiveStock(receivingTargetPO._id, payload);
      if (res.success) {
        setSuccessMessage(
          `Delivery successfully received for PO ${receivingTargetPO.purchaseOrderNumber}. Inventory updated.`
        );
        setReceivingTargetPO(null);
        fetchPurchases();
      }
    } catch (err) {
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <span>Procurement</span>
            <span>/</span>
            <span className="text-teal-600 font-semibold">Purchase Orders</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
            <ShoppingCart className="w-7 h-7 text-teal-600" />
            Purchase Order Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create vendor orders, track expected deliveries, receive warehouse stock, and audit invoices.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPurchases}
            disabled={loading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {canManage && (
            <Link to="/purchases/new">
              <Button variant="primary" size="sm" className="flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                New Purchase Order
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <Alert
          type="error"
          title="Procurement Error"
          message={error}
          onClose={() => setError(null)}
        />
      )}
      {successMessage && (
        <Alert
          type="success"
          title="Stock Intake Complete"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Total Purchase Orders</p>
            <h3 className="text-xl font-bold text-slate-900 mt-1 font-mono">
              {loading ? '...' : stats?.totalOrders ?? 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {stats?.draftOrders ?? 0} in draft status
            </p>
          </div>
          <div className="p-3 rounded-xl bg-teal-50 text-teal-600 shrink-0">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Pending Deliveries</p>
            <h3 className="text-xl font-bold text-amber-700 mt-1 font-mono">
              {loading ? '...' : stats?.pendingOrders ?? 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {stats?.orderedOrders ?? 0} ordered, {stats?.partiallyReceivedOrders ?? 0} partial
            </p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Total Procurement Value</p>
            <h3 className="text-xl font-bold text-slate-900 mt-1 font-mono">
              ${loading ? '...' : stats?.totalPurchaseValue?.toFixed(2) ?? '0.00'}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Active non-cancelled orders</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Completed Orders</p>
            <h3 className="text-xl font-bold text-slate-900 mt-1 font-mono">
              {loading ? '...' : stats?.receivedOrders ?? 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {stats?.cancelledOrders ?? 0} cancelled
            </p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search */}
          <div className="md:col-span-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by PO number or supplier name..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Supplier dropdown */}
          <div className="md:col-span-3">
            <select
              value={filters.supplier}
              onChange={(e) => handleFilterChange('supplier', e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white"
            >
              <option value="">All Suppliers</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.supplierCode})
                </option>
              ))}
            </select>
          </div>

          {/* Status dropdown */}
          <div className="md:col-span-2">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="ordered">Ordered</option>
              <option value="partially_received">Partially Received</option>
              <option value="received">Received</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Date range inputs */}
          <div className="md:col-span-3 flex items-center gap-2">
            <input
              type="date"
              title="Start Date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-1/2 py-1.5 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
            <span className="text-slate-400 text-xs">to</span>
            <input
              type="date"
              title="End Date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-1/2 py-1.5 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Secondary Bar */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-400">Sort By:</span>
            <select
              value={`${filters.sortBy}_${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('_');
                setFilters((prev) => ({ ...prev, sortBy, sortOrder, page: 1 }));
              }}
              className="py-1 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="createdAt_desc">Recently Created</option>
              <option value="orderDate_desc">Order Date (Newest First)</option>
              <option value="orderDate_asc">Order Date (Oldest First)</option>
              <option value="totalAmount_desc">Order Value (High to Low)</option>
              <option value="totalAmount_asc">Order Value (Low to High)</option>
            </select>
          </div>

          {(filters.search ||
            filters.status !== 'all' ||
            filters.supplier ||
            filters.startDate ||
            filters.endDate) && (
            <button
              type="button"
              onClick={handleResetFilters}
              disabled={loading}
              className="inline-flex items-center gap-1 text-[11px] text-teal-700 hover:text-teal-900 font-medium px-2 py-1 rounded bg-teal-50 hover:bg-teal-100 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <PurchaseTable
        purchaseOrders={purchaseOrders}
        loading={loading}
        canManage={canManage}
        onReceiveStock={(po) => setReceivingTargetPO(po)}
      />

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500">
            Showing <strong className="font-semibold text-slate-700">{purchaseOrders.length}</strong> of{' '}
            <strong className="font-semibold text-slate-700">{pagination.total}</strong> orders
            (Page {pagination.page} of {pagination.totalPages})
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

      {/* Quick Receive Delivery Modal */}
      {receivingTargetPO && (
        <ReceiveStockModal
          isOpen={!!receivingTargetPO}
          onClose={() => setReceivingTargetPO(null)}
          purchaseOrder={receivingTargetPO}
          onSubmit={handleReceiveSubmit}
        />
      )}
    </div>
  );
}
