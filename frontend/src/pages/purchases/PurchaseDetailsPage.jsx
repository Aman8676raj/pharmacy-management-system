import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShoppingCart,
  ArrowLeft,
  Edit2,
  PackageCheck,
  Send,
  XCircle,
  Building2,
  Calendar,
  Clock,
  UserCheck,
  FileText,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import PurchaseStatusBadge from '../../components/purchases/PurchaseStatusBadge';
import PurchaseSummary from '../../components/purchases/PurchaseSummary';
import ReceiveStockModal from '../../components/purchases/ReceiveStockModal';
import PurchaseReceivingTable from '../../components/purchases/PurchaseReceivingTable';
import purchaseService from '../../services/purchaseService';
import { useAuth } from '../../hooks/useAuth';

export default function PurchaseDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Modals
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [actionError, setActionError] = useState(null);

  const canManage = ['admin', 'inventory_manager'].includes(user?.role);

  const fetchPO = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await purchaseService.getPurchaseById(id);
      if (res.success && res.data?.purchaseOrder) {
        setPurchaseOrder(res.data.purchaseOrder);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load purchase order details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPO();
  }, [fetchPO]);

  // Mark as ordered
  const handleMarkAsOrdered = async () => {
    setIsProcessingAction(true);
    setActionError(null);
    try {
      const res = await purchaseService.markAsOrdered(id);
      if (res.success) {
        setSuccessMessage('Purchase order successfully marked as ordered and transmitted to vendor.');
        fetchPO();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update order status');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Receive stock submit
  const handleReceiveStockSubmit = async (payload) => {
    try {
      const res = await purchaseService.receiveStock(id, payload);
      if (res.success) {
        setSuccessMessage('Stock delivery successfully received and inventory replenished.');
        setIsReceiveOpen(false);
        fetchPO();
      }
    } catch (err) {
      throw err;
    }
  };

  // Cancel order submit
  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    setIsProcessingAction(true);
    setActionError(null);
    try {
      const res = await purchaseService.cancelPurchaseOrder(id, cancelReason);
      if (res.success) {
        setSuccessMessage('Purchase order cancelled.');
        setIsCancelOpen(false);
        setCancelReason('');
        fetchPO();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to cancel order');
    } finally {
      setIsProcessingAction(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-16 text-center text-slate-500">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Loading purchase order profile...</p>
      </div>
    );
  }

  if (error || !purchaseOrder) {
    return (
      <div className="space-y-4">
        <Alert
          type="error"
          title="Lookup Failed"
          message={error || 'Purchase order not found'}
          action={
            <Link to="/purchases">
              <Button size="sm" variant="outline">
                Back to Orders
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  const totalOrdered =
    purchaseOrder.items?.reduce((acc, it) => acc + (it.orderedQuantity || 0), 0) || 0;
  const totalReceived =
    purchaseOrder.items?.reduce((acc, it) => acc + (it.receivedQuantity || 0), 0) || 0;
  const totalRemaining = Math.max(0, totalOrdered - totalReceived);
  const percentReceived =
    totalOrdered > 0 ? Math.min(100, Math.round((totalReceived / totalOrdered) * 100)) : 0;

  const isEligibleToCancel =
    (purchaseOrder.status === 'draft' ||
      (purchaseOrder.status === 'ordered' && totalReceived === 0)) &&
    canManage;

  const isReceivable =
    canManage &&
    (purchaseOrder.status === 'ordered' || purchaseOrder.status === 'partially_received') &&
    totalRemaining > 0;

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <Link to="/purchases" className="hover:text-teal-600 transition-colors">
              Purchases
            </Link>
            <span>/</span>
            <span className="text-teal-600 font-semibold font-mono">
              {purchaseOrder.purchaseOrderNumber}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
            <ShoppingCart className="w-7 h-7 text-teal-600" />
            Purchase Order Overview
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link to="/purchases">
            <Button variant="outline" size="sm" className="flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>

          {canManage && (
            <>
              {purchaseOrder.status === 'draft' && (
                <>
                  <Link to={`/purchases/${id}/edit`}>
                    <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                      <Edit2 className="w-4 h-4" />
                      Edit Draft
                    </Button>
                  </Link>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleMarkAsOrdered}
                    disabled={isProcessingAction}
                    className="flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    Place Order (Mark as Ordered)
                  </Button>
                </>
              )}

              {isReceivable && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsReceiveOpen(true)}
                  className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <PackageCheck className="w-4 h-4" />
                  Receive Delivery
                </Button>
              )}

              {isEligibleToCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCancelReason('');
                    setActionError(null);
                    setIsCancelOpen(true);
                  }}
                  className="flex items-center gap-1.5 text-rose-600 border-rose-200 hover:bg-rose-50"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel Order
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
          title="Operation Complete"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}
      {error && (
        <Alert type="error" title="Error" message={error} onClose={() => setError(null)} />
      )}

      {/* Main Order Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-xl font-bold bg-slate-100 text-slate-900 px-3 py-1 rounded-lg border border-slate-200">
                {purchaseOrder.purchaseOrderNumber}
              </span>
              <PurchaseStatusBadge status={purchaseOrder.status} size="md" />
            </div>

            <div className="mt-3 flex items-center gap-2 text-sm text-slate-700">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>Vendor:</span>
              <Link
                to={`/suppliers/${purchaseOrder.supplier?._id}`}
                className="font-bold text-teal-700 hover:underline"
              >
                {purchaseOrder.supplier?.name || 'Unknown Supplier'}
              </Link>
              {purchaseOrder.supplier?.supplierCode && (
                <span className="text-xs text-slate-400 font-mono">
                  [{purchaseOrder.supplier.supplierCode}]
                </span>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-right">
            <div>
              <div className="text-[11px] text-slate-400">Order Date</div>
              <div className="text-xs font-semibold text-slate-800 mt-0.5">
                {purchaseOrder.orderDate
                  ? new Date(purchaseOrder.orderDate).toLocaleDateString()
                  : 'N/A'}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400">Expected Delivery</div>
              <div className="text-xs font-semibold text-slate-800 mt-0.5">
                {purchaseOrder.expectedDeliveryDate
                  ? new Date(purchaseOrder.expectedDeliveryDate).toLocaleDateString()
                  : 'Not set'}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400">Units (Recv / Ord)</div>
              <div className="text-xs font-mono font-bold text-slate-900 mt-0.5">
                {totalReceived} / {totalOrdered}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400">Total Purchase</div>
              <div className="text-base font-extrabold text-teal-700 font-mono">
                ${purchaseOrder.totalAmount?.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Fulfillment Progress */}
        <div className="py-4 border-b border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-medium text-slate-700">Delivery Fulfillment Progress</span>
            <span className="font-mono font-semibold text-slate-800">
              {percentReceived}% completed ({totalRemaining} units pending)
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                percentReceived === 100
                  ? 'bg-emerald-500'
                  : percentReceived > 0
                  ? 'bg-amber-500'
                  : 'bg-slate-300'
              }`}
              style={{ width: `${percentReceived}%` }}
            />
          </div>
        </div>

        {/* Audit Meta Information */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Created by:</span>
            <strong className="text-slate-700 font-medium">
              {purchaseOrder.createdBy?.name || 'Staff'}
            </strong>
          </div>

          {purchaseOrder.receivedAt && (
            <div className="flex items-center gap-1.5 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                Fully received on {new Date(purchaseOrder.receivedAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Ordered Line Items Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-teal-600" />
            Purchased Medicine Items ({purchaseOrder.items?.length || 0})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                <th className="py-3 px-4">Medicine Item</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4 text-right">Ordered Qty</th>
                <th className="py-3 px-4 text-right">Received Qty</th>
                <th className="py-3 px-4 text-right">Remaining</th>
                <th className="py-3 px-4 text-right">Unit Cost ($)</th>
                <th className="py-3 px-4 text-right">Tax (%)</th>
                <th className="py-3 px-4 text-right">Line Total ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {purchaseOrder.items?.map((item) => {
                const rem = Math.max(0, item.orderedQuantity - item.receivedQuantity);
                const isFulfilled = item.receivedQuantity >= item.orderedQuantity;

                return (
                  <tr key={item._id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      {item.medicine?._id ? (
                        <Link
                          to={`/medicines/${item.medicine._id}`}
                          className="font-semibold text-slate-900 hover:text-teal-600 hover:underline"
                        >
                          {item.medicineName}
                        </Link>
                      ) : (
                        <span className="font-semibold text-slate-900">{item.medicineName}</span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-600">
                      {item.sku}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-800">
                      {item.orderedQuantity}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-semibold">
                      <span className={item.receivedQuantity > 0 ? 'text-teal-700' : 'text-slate-400'}>
                        {item.receivedQuantity}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-semibold">
                      <span className={rem > 0 ? 'text-amber-700' : 'text-emerald-700'}>
                        {rem}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-slate-800">
                      ${item.unitCost?.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {item.taxRate || 0}%
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ${item.lineTotal?.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial Breakdown & Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Notes (Left) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            Procurement &amp; Logistics Notes
          </h4>
          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-line leading-relaxed">
            {purchaseOrder.notes || 'No special instructions recorded for this purchase order.'}
          </p>
        </div>

        {/* Financial Summary (Right) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <PurchaseSummary
            subtotal={purchaseOrder.subtotal || 0}
            discount={purchaseOrder.discount || 0}
            taxAmount={purchaseOrder.taxAmount || 0}
            shippingCharges={purchaseOrder.shippingCharges || 0}
            totalAmount={purchaseOrder.totalAmount || 0}
          />
        </div>
      </div>

      {/* Receiving History Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-teal-50 text-teal-600">
              <PackageCheck className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold text-slate-800">Warehouse Receiving Log</h2>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
              {purchaseOrder.receivingHistory?.length || 0} deliveries
            </span>
          </div>

          {isReceivable && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReceiveOpen(true)}
              className="text-xs text-teal-700 border-teal-300 hover:bg-teal-50"
            >
              <PackageCheck className="w-3.5 h-3.5 mr-1" />
              Receive Additional Delivery
            </Button>
          )}
        </div>

        <PurchaseReceivingTable receivingHistory={purchaseOrder.receivingHistory || []} />
      </div>

      {/* Receive Stock Modal */}
      {isReceiveOpen && (
        <ReceiveStockModal
          isOpen={isReceiveOpen}
          onClose={() => setIsReceiveOpen(false)}
          purchaseOrder={purchaseOrder}
          onSubmit={handleReceiveStockSubmit}
        />
      )}

      {/* Cancel Order Modal */}
      {isCancelOpen && (
        <Modal
          isOpen={isCancelOpen}
          onClose={() => !isProcessingAction && setIsCancelOpen(false)}
          title="Cancel Purchase Order"
        >
          <form onSubmit={handleCancelSubmit} className="space-y-4">
            <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 text-xs text-rose-800">
              Are you sure you want to cancel purchase order{' '}
              <strong className="font-mono">{purchaseOrder.purchaseOrderNumber}</strong>? This action
              cannot be undone.
            </div>

            {actionError && (
              <Alert type="error" title="Cancellation Failed" message={actionError} onClose={() => setActionError(null)} />
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Cancellation
              </label>
              <textarea
                rows={3}
                required
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Vendor price dispute, alternative distributor chosen, order placed in error."
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIsCancelOpen(false)}
                disabled={isProcessingAction}
              >
                Keep Order
              </Button>
              <Button
                variant="danger"
                size="sm"
                type="submit"
                disabled={isProcessingAction || !cancelReason.trim()}
              >
                {isProcessingAction ? 'Cancelling...' : 'Confirm Cancellation'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

