import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Plus, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import SupplierStats from '../../components/suppliers/SupplierStats';
import SupplierFilters from '../../components/suppliers/SupplierFilters';
import SupplierTable from '../../components/suppliers/SupplierTable';
import supplierService from '../../services/supplierService';
import { useAuth } from '../../hooks/useAuth';

export default function SupplierListPage() {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Filters state
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: 'all',
    city: 'all',
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Modal states
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [activateTarget, setActivateTarget] = useState(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const canManage = ['admin', 'inventory_manager'].includes(user?.role);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [listRes, statsRes] = await Promise.all([
        supplierService.getSuppliers(filters),
        supplierService.getSupplierStats(),
      ]);

      if (listRes.success) {
        setSuppliers(listRes.data?.suppliers || []);
        if (listRes.data?.pagination) {
          setPagination(listRes.data.pagination);
        }
      }
      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load suppliers data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setFilters((prev) => ({ ...prev, page: newPage }));
    }
  };

  // Deactivate handler
  const handleConfirmDeactivate = async () => {
    if (!deactivateTarget) return;
    setIsProcessingAction(true);
    try {
      const res = await supplierService.deactivateSupplier(deactivateTarget._id);
      if (res.success) {
        setSuccessMessage(`Supplier "${deactivateTarget.name}" has been deactivated.`);
        setDeactivateTarget(null);
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to deactivate supplier');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Activate handler
  const handleConfirmActivate = async () => {
    if (!activateTarget) return;
    setIsProcessingAction(true);
    try {
      const res = await supplierService.activateSupplier(activateTarget._id);
      if (res.success) {
        setSuccessMessage(`Supplier "${activateTarget.name}" has been activated.`);
        setActivateTarget(null);
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to activate supplier');
    } finally {
      setIsProcessingAction(false);
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
            <span className="text-teal-600 font-semibold">Vendors &amp; Suppliers</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
            <Truck className="w-7 h-7 text-teal-600" />
            Supplier Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage pharmaceutical distributors, commercial terms, licenses, and procurement records.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {canManage && (
            <Link to="/suppliers/new">
              <Button variant="primary" size="sm" className="flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                Add Supplier
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <Alert
          type="error"
          title="Directory Error"
          message={error}
          onClose={() => setError(null)}
        />
      )}
      {successMessage && (
        <Alert
          type="success"
          title="Success"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      {/* Stats Cards */}
      <SupplierStats stats={stats} loading={loading} />

      {/* Filter Bar */}
      <SupplierFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={() =>
          setFilters({
            page: 1,
            limit: 10,
            search: '',
            status: 'all',
            city: 'all',
            sortBy: 'name',
            sortOrder: 'asc',
          })
        }
        cities={stats?.cities || []}
        loading={loading}
      />

      {/* Table */}
      <SupplierTable
        suppliers={suppliers}
        loading={loading}
        canManage={canManage}
        onDeactivate={(sup) => setDeactivateTarget(sup)}
        onActivate={(sup) => setActivateTarget(sup)}
      />

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500">
            Showing <strong className="font-semibold text-slate-700">{suppliers.length}</strong> of{' '}
            <strong className="font-semibold text-slate-700">{pagination.total}</strong> suppliers
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

      {/* Deactivate Confirmation Modal */}
      {deactivateTarget && (
        <Modal
          isOpen={!!deactivateTarget}
          onClose={() => !isProcessingAction && setDeactivateTarget(null)}
          title="Deactivate Supplier"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to deactivate{' '}
              <strong className="text-slate-900">{deactivateTarget.name}</strong> (
              <span className="font-mono">{deactivateTarget.supplierCode}</span>)?
            </p>
            <p className="text-xs text-slate-500 bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-amber-800">
              <strong>Notice:</strong> Historical purchase orders will remain intact, but no new purchase orders can be placed with this vendor while inactive.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeactivateTarget(null)}
                disabled={isProcessingAction}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmDeactivate}
                disabled={isProcessingAction}
              >
                {isProcessingAction ? 'Deactivating...' : 'Confirm Deactivation'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Activate Confirmation Modal */}
      {activateTarget && (
        <Modal
          isOpen={!!activateTarget}
          onClose={() => !isProcessingAction && setActivateTarget(null)}
          title="Reactivate Supplier"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Reactivate <strong className="text-slate-900">{activateTarget.name}</strong> to allow issuing new purchase orders?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActivateTarget(null)}
                disabled={isProcessingAction}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmActivate}
                disabled={isProcessingAction}
              >
                {isProcessingAction ? 'Activating...' : 'Reactivate Supplier'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

