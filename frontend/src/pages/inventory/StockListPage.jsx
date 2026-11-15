import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes,
  Plus,
  RefreshCw,
  History,
  ShieldAlert,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import StockFilters from '../../components/inventory/StockFilters';
import StockTable from '../../components/inventory/StockTable';
import StockAdjustmentModal from '../../components/inventory/StockAdjustmentModal';
import inventoryService from '../../services/inventoryService';
import { useAuth } from '../../hooks/useAuth';

export default function StockListPage() {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Filters state
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: 'all',
    expiringSoon: false,
    isExpired: false,
    sortBy: 'expiryDate',
    sortOrder: 'asc',
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Modal states
  const [adjustTargetBatch, setAdjustTargetBatch] = useState(null);
  const [quarantineTargetBatch, setQuarantineTargetBatch] = useState(null);
  const [releaseTargetBatch, setReleaseTargetBatch] = useState(null);

  const [actionReason, setActionReason] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState(null);

  const canManageStock = ['admin', 'inventory_manager'].includes(user?.role);

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await inventoryService.getInventory(filters);
      if (res.success) {
        setBatches(res.data?.batches || []);
        if (res.data?.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch inventory batches');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to page 1 on filter changes
    }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setFilters((prev) => ({ ...prev, page: newPage }));
    }
  };

  // Adjust stock handler
  const handleAdjustSubmit = async (adjustmentData) => {
    if (!adjustTargetBatch) return;
    try {
      const res = await inventoryService.adjustBatch(adjustTargetBatch._id, adjustmentData);
      if (res.success) {
        setSuccessMessage(
          `Successfully adjusted batch ${adjustTargetBatch.batchNumber}. Available quantity is now ${res.data?.batch?.availableQuantity}.`
        );
        setAdjustTargetBatch(null);
        fetchBatches();
      }
    } catch (err) {
      throw err;
    }
  };

  // Quarantine handler
  const handleQuarantineSubmit = async (e) => {
    e.preventDefault();
    if (!quarantineTargetBatch) return;
    if (!actionReason.trim()) {
      setActionError('Reason is required to quarantine a batch.');
      return;
    }

    setIsSubmittingAction(true);
    setActionError(null);
    try {
      const res = await inventoryService.quarantineBatch(quarantineTargetBatch._id, {
        reason: actionReason.trim(),
      });
      if (res.success) {
        setSuccessMessage(`Batch ${quarantineTargetBatch.batchNumber} has been placed under quarantine.`);
        setQuarantineTargetBatch(null);
        setActionReason('');
        fetchBatches();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to quarantine batch');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Release handler
  const handleReleaseSubmit = async (e) => {
    e.preventDefault();
    if (!releaseTargetBatch) return;
    if (!actionReason.trim()) {
      setActionError('Reason is required to release a batch from quarantine.');
      return;
    }

    setIsSubmittingAction(true);
    setActionError(null);
    try {
      const res = await inventoryService.releaseBatch(releaseTargetBatch._id, {
        reason: actionReason.trim(),
      });
      if (res.success) {
        setSuccessMessage(`Batch ${releaseTargetBatch.batchNumber} has been released and reactivated.`);
        setReleaseTargetBatch(null);
        setActionReason('');
        fetchBatches();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to release batch');
    } finally {
      setIsSubmittingAction(false);
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
            <span className="text-teal-600 font-semibold">Stock Batch Directory</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
            <Boxes className="w-7 h-7 text-teal-600" />
            Stock Directory &amp; Batches
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse all medicine lots, FEFO expiry markers, stock levels, and perform auditable adjustments.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link to="/inventory">
            <Button variant="outline" size="sm" className="flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              Back to Overview
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchBatches}
            disabled={loading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

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
          title="Operation Complete"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      {/* Filter Component */}
      <StockFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Batches Table */}
      <StockTable
        batches={batches}
        loading={loading}
        canManageStock={canManageStock}
        onAdjustStock={(batch) => setAdjustTargetBatch(batch)}
        onQuarantine={(batch) => {
          setActionReason('');
          setActionError(null);
          setQuarantineTargetBatch(batch);
        }}
        onRelease={(batch) => {
          setActionReason('');
          setActionError(null);
          setReleaseTargetBatch(batch);
        }}
      />

      {/* Pagination Bar */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500">
            Showing <strong className="font-semibold text-slate-700">{batches.length}</strong> of{' '}
            <strong className="font-semibold text-slate-700">{pagination.total}</strong> total batches
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

      {/* Stock Adjustment Modal */}
      {adjustTargetBatch && (
        <StockAdjustmentModal
          isOpen={!!adjustTargetBatch}
          onClose={() => setAdjustTargetBatch(null)}
          batch={adjustTargetBatch}
          onSubmit={handleAdjustSubmit}
        />
      )}

      {/* Quarantine Confirmation Modal */}
      {quarantineTargetBatch && (
        <Modal
          isOpen={!!quarantineTargetBatch}
          onClose={() => {
            if (!isSubmittingAction) setQuarantineTargetBatch(null);
          }}
          title="Quarantine Batch Hold"
        >
          <form onSubmit={handleQuarantineSubmit} className="space-y-4">
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-2.5 text-xs text-amber-800">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <strong>Warning:</strong> Quarantining batch{' '}
                <span className="font-mono font-bold text-slate-900">
                  {quarantineTargetBatch.batchNumber}
                </span>{' '}
                will immediately freeze all {quarantineTargetBatch.availableQuantity} units. They will be
                excluded from sales and dispensed stock.
              </div>
            </div>

            {actionError && (
              <Alert
                type="error"
                title="Quarantine Failed"
                message={actionError}
                onClose={() => setActionError(null)}
              />
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Quarantine <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="e.g. Temperature excursion detected in storage room B, packaging seal defect, manufacturer advisory recall."
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setQuarantineTargetBatch(null)}
                disabled={isSubmittingAction}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                type="submit"
                disabled={isSubmittingAction || !actionReason.trim()}
              >
                {isSubmittingAction ? 'Applying Quarantine...' : 'Confirm Quarantine'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Release Confirmation Modal */}
      {releaseTargetBatch && (
        <Modal
          isOpen={!!releaseTargetBatch}
          onClose={() => {
            if (!isSubmittingAction) setReleaseTargetBatch(null);
          }}
          title="Release Batch to Active Stock"
        >
          <form onSubmit={handleReleaseSubmit} className="space-y-4">
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <div>
                <strong>Release Hold:</strong> Releasing batch{' '}
                <span className="font-mono font-bold text-slate-900">
                  {releaseTargetBatch.batchNumber}
                </span>{' '}
                will restore its status to <em>Active</em> and make its{' '}
                {releaseTargetBatch.availableQuantity} units eligible for dispensing.
              </div>
            </div>

            {actionError && (
              <Alert
                type="error"
                title="Release Failed"
                message={actionError}
                onClose={() => setActionError(null)}
              />
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Release Authorization Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="e.g. Lab certificate verification cleared, visual inspection passed, QA approved release."
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setReleaseTargetBatch(null)}
                disabled={isSubmittingAction}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                disabled={isSubmittingAction || !actionReason.trim()}
              >
                {isSubmittingAction ? 'Processing Release...' : 'Authorize Release'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

