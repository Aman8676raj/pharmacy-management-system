import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import salesService from '../../services/salesService';
import { AlertTriangle } from 'lucide-react';

export const CancelSaleModal = ({ isOpen, onClose, sale, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!sale) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('A cancellation reason is required.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await salesService.cancelSale(sale._id || sale.id, reason.trim());
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to cancel sale');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Cancel Invoice — ${sale.invoiceNumber}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-800">
            <span className="font-semibold block mb-0.5">Warning: Irreversible Action</span>
            Cancelling this sale will mark the invoice as cancelled and automatically restore{' '}
            <strong>{sale.items?.length || 0} item(s)</strong> back into active inventory batches
            with audit logs.
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1">
          <div className="flex justify-between text-slate-600">
            <span>Customer:</span>
            <span className="font-medium text-slate-800">
              {sale.customerSnapshot?.name || 'Walk-in Customer'}
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Total Bill:</span>
            <span className="font-semibold text-slate-900">
              ₹{Number(sale.totalAmount || 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Amount Paid:</span>
            <span className="font-medium text-emerald-700">
              ₹{Number(sale.amountPaid || 0).toFixed(2)}
            </span>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-700 block mb-1">
            Cancellation Reason <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows="3"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Customer cancelled order, wrong dosage selected, prescription voided..."
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
            required
          />
        </div>

        <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Dismiss
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            className="bg-rose-600 hover:bg-rose-700 text-white"
          >
            Confirm Cancellation
          </Button>
        </div>
      </form>
    </Modal>
  );
};
