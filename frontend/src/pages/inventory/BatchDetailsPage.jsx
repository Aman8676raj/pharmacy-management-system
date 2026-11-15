import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Boxes,
  ArrowLeft,
  Calendar,
  Pill,
  Clock,
  CircleDollarSign,
  TrendingUp,
  Truck,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  History,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import BatchStatusBadge from '../../components/inventory/BatchStatusBadge';
import StockAdjustmentModal from '../../components/inventory/StockAdjustmentModal';
import TransactionTable from '../../components/inventory/TransactionTable';
import inventoryService from '../../services/inventoryService';
import { useAuth } from '../../hooks/useAuth';

export default function BatchDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [batch, setBatch] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Modals
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isQuarantineOpen, setIsQuarantineOpen] = useState(false);
  const [isReleaseOpen, setIsReleaseOpen] = useState(false);
  const [actionReason, setActionReason] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState(null);

  const canManageStock = ['admin', 'inventory_manager'].includes(user?.role);

  const fetchBatchDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await inventoryService.getBatchById(id);
      if (res.success) {
        setBatch(res.data?.batch);
        setTransactions(res.data?.transactions || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to retrieve batch information');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBatchDetails();
  }, [fetchBatchDetails]);

  // Adjust handler
  const handleAdjustSubmit = async (adjustmentData) => {
    try {
      const res = await inventoryService.adjustBatch(id, adjustmentData);
      if (res.success) {
        setSuccessMessage('Batch quantity adjusted successfully.');
        setIsAdjustOpen(false);
        fetchBatchDetails();
      }
    } catch (err) {
      throw err;
    }
  };

  // Quarantine handler
  const handleQuarantine = async (e) => {
    e.preventDefault();
    if (!actionReason.trim()) {
      setActionError('Reason is required.');
      return;
    }
    setIsSubmittingAction(true);
    setActionError(null);
    try {
      const res = await inventoryService.quarantineBatch(id, { reason: actionReason.trim() });
      if (res.success) {
        setSuccessMessage('Batch has been quarantined.');
        setIsQuarantineOpen(false);
        setActionReason('');
        fetchBatchDetails();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to quarantine batch');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Release handler
  const handleRelease = async (e) => {
    e.preventDefault();
    if (!actionReason.trim()) {
      setActionError('Reason is required.');
      return;
    }
    setIsSubmittingAction(true);
    setActionError(null);
    try {
      const res = await inventoryService.releaseBatch(id, { reason: actionReason.trim() });
      if (res.success) {
        setSuccessMessage('Batch has been released from quarantine.');
        setIsReleaseOpen(false);
        setActionReason('');
        fetchBatchDetails();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to release batch');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-16 text-center text-slate-500">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Loading batch details...</p>
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="space-y-4">
        <Alert
          type="error"
          title="Batch Lookup Error"
          message={error || 'Batch not found'}
          action={
            <Link to="/inventory/stock">
              <Button size="sm" variant="outline">
                Back to Stock Directory
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  // Margin calculation
  const marginPercent =
    batch.sellingPrice > 0
      ? (((batch.sellingPrice - batch.purchasePrice) / batch.sellingPrice) * 100).toFixed(1)
      : 0;

  const stockPercentage =
    batch.quantityReceived > 0
      ? Math.round((batch.availableQuantity / batch.quantityReceived) * 100)
      : 0;

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : 'N/A';

  return (
    <div className="space-y-6">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <Link to="/inventory" className="hover:text-teal-600 transition-colors">
              Inventory
            </Link>
            <span>/</span>
            <Link to="/inventory/stock" className="hover:text-teal-600 transition-colors">
              Batches
            </Link>
            <span>/</span>
            <span className="text-teal-600 font-semibold font-mono">{batch.batchNumber}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
            <Boxes className="w-7 h-7 text-teal-600" />
            Batch Details &amp; Movement Audit
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link to="/inventory/stock">
            <Button variant="outline" size="sm" className="flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              Back to List
            </Button>
          </Link>

          {canManageStock && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAdjustOpen(true)}
                className="flex items-center gap-1.5 text-slate-700"
              >
                <Sliders className="w-4 h-4 text-teal-600" />
                Adjust Stock
              </Button>

              {batch.status === 'quarantined' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActionReason('');
                    setActionError(null);
                    setIsReleaseOpen(true);
                  }}
                  className="flex items-center gap-1.5 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Release Batch
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActionReason('');
                    setActionError(null);
                    setIsQuarantineOpen(true);
                  }}
                  className="flex items-center gap-1.5 text-amber-700 border-amber-300 hover:bg-amber-50"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  Quarantine Batch
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <Alert
          type="success"
          title="Success"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      {/* Primary Batch Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl shrink-0 mt-1">
              <Pill className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900">
                  {batch.medicine?.name || 'Unknown Medicine'}
                </h2>
                <span className="font-mono text-sm font-bold bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded border border-slate-200">
                  Lot: {batch.batchNumber}
                </span>
                <BatchStatusBadge status={batch.status} />
              </div>
              <div className="text-xs text-slate-500 mt-1.5 flex items-center gap-3 flex-wrap">
                <span>
                  Generic:{' '}
                  <strong className="text-slate-700 font-medium">
                    {batch.medicine?.genericName || 'N/A'}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Category:{' '}
                  <strong className="text-slate-700 font-medium">
                    {batch.medicine?.category || 'General'}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  SKU:{' '}
                  <strong className="text-slate-700 font-mono">
                    {batch.medicine?.sku || 'N/A'}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-400">Available Stock</div>
              <div className="text-3xl font-extrabold text-slate-900 font-mono">
                {batch.availableQuantity}
                <span className="text-sm font-normal text-slate-400 ml-1">
                  / {batch.quantityReceived} units
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Progress Bar */}
        <div className="py-4 border-b border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>Stock Retention Level</span>
            <span className="font-mono font-semibold text-slate-700">{stockPercentage}% in stock</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                stockPercentage > 30
                  ? 'bg-emerald-500'
                  : stockPercentage > 10
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, stockPercentage))}%` }}
            />
          </div>
        </div>

        {/* Detailed Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-3.5 bg-slate-50/70 rounded-lg border border-slate-100">
            <div className="text-xs text-slate-400 flex items-center gap-1 mb-1">
              <CircleDollarSign className="w-3.5 h-3.5 text-slate-400" />
              Purchase Price
            </div>
            <div className="text-base font-bold text-slate-800 font-mono">
              ${batch.purchasePrice?.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Unit cost</div>
          </div>

          <div className="p-3.5 bg-slate-50/70 rounded-lg border border-slate-100">
            <div className="text-xs text-slate-400 flex items-center gap-1 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
              Selling Price
            </div>
            <div className="text-base font-bold text-slate-800 font-mono">
              ${batch.sellingPrice?.toFixed(2)}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              +{marginPercent}% margin
            </div>
          </div>

          <div className="p-3.5 bg-slate-50/70 rounded-lg border border-slate-100">
            <div className="text-xs text-slate-400 flex items-center gap-1 mb-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Manufacture Date
            </div>
            <div className="text-sm font-semibold text-slate-800">
              {formatDate(batch.manufacturingDate)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Recv: {formatDate(batch.receivedDate)}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50/70 rounded-lg border border-slate-100">
            <div className="text-xs text-slate-400 flex items-center gap-1 mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Expiry Date
            </div>
            <div className="text-sm font-bold text-slate-800">
              {formatDate(batch.expiryDate)}
            </div>
            <div className="text-[11px] font-semibold text-amber-600 mt-0.5">
              {batch.daysRemaining !== undefined
                ? batch.daysRemaining <= 0
                  ? 'Expired'
                  : `${batch.daysRemaining} days left`
                : 'Active schedule'}
            </div>
          </div>
        </div>

        {/* Supplier / Distributor info */}
        {batch.supplierName && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
            <Truck className="w-4 h-4 text-slate-400" />
            <span>Supplier / Distributor:</span>
            <span className="font-semibold text-slate-800">{batch.supplierName}</span>
          </div>
        )}
      </div>

      {/* Transaction History Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-blue-50 text-blue-600">
              <History className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold text-slate-800">Batch Movement Audit Trail</h2>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
              {transactions.length} records
            </span>
          </div>
        </div>

        <TransactionTable
          transactions={transactions}
          loading={false}
          emptyMessage="No transactions recorded for this batch yet."
        />
      </div>

      {/* Stock Adjustment Modal */}
      {isAdjustOpen && (
        <StockAdjustmentModal
          isOpen={isAdjustOpen}
          onClose={() => setIsAdjustOpen(false)}
          batch={batch}
          onSubmit={handleAdjustSubmit}
        />
      )}

      {/* Quarantine Confirmation Modal */}
      {isQuarantineOpen && (
        <Modal
          isOpen={isQuarantineOpen}
          onClose={() => setIsQuarantineOpen(false)}
          title="Quarantine Batch Hold"
        >
          <form onSubmit={handleQuarantine} className="space-y-4">
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800">
              Quarantining this batch will freeze its {batch.availableQuantity} units.
            </div>

            {actionError && (
              <Alert
                type="error"
                title="Quarantine Error"
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
                placeholder="Reason..."
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIsQuarantineOpen(false)}
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
                {isSubmittingAction ? 'Applying...' : 'Confirm Quarantine'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Release Confirmation Modal */}
      {isReleaseOpen && (
        <Modal
          isOpen={isReleaseOpen}
          onClose={() => setIsReleaseOpen(false)}
          title="Release Batch"
        >
          <form onSubmit={handleRelease} className="space-y-4">
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-800">
              Releasing this batch will restore it to active status.
            </div>

            {actionError && (
              <Alert
                type="error"
                title="Release Error"
                message={actionError}
                onClose={() => setActionError(null)}
              />
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Release Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Authorization reason..."
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIsReleaseOpen(false)}
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
                {isSubmittingAction ? 'Releasing...' : 'Authorize Release'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

