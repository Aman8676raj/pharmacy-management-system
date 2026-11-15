import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Alert from '../common/Alert';
import { ArrowUpRight, ArrowDownRight, AlertTriangle } from 'lucide-react';

export const StockAdjustmentModal = ({
  batch,
  isOpen,
  onClose,
  onSuccess,
  onAdjust,
}) => {
  const [adjustmentType, setAdjustmentType] = useState('adjustment_out');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [reference, setReference] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!batch) return null;

  const prevQty = batch.availableQuantity;
  const numQty = parseFloat(quantity) || 0;
  const resultingQty =
    adjustmentType === 'adjustment_out' ? prevQty - numQty : prevQty + numQty;

  const isNegative = adjustmentType === 'adjustment_out' && resultingQty < 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (numQty <= 0) {
      setError('Adjustment quantity must be greater than zero.');
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a reason for this stock adjustment (e.g. audit discrepancy, damaged packaging).');
      return;
    }

    if (isNegative) {
      setError(`Cannot deduct ${numQty} units. Only ${prevQty} units available.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdjust(batch.id || batch._id, {
        adjustmentType,
        quantity: numQty,
        reason: reason.trim(),
        reference: reference.trim() || undefined,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to adjust stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Adjust Stock — Batch ${batch.batchNumber}`}
      maxWidth="max-w-md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={isNegative || numQty <= 0}
          >
            Confirm Adjustment
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Medicine summary */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <p className="font-semibold text-slate-800 text-xs">
            {batch.medicine?.name || 'Selected Medicine'}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
            <span>SKU: {batch.medicine?.sku}</span>
            <span>Batch: <strong className="font-mono text-slate-700">{batch.batchNumber}</strong></span>
          </div>
        </div>

        {/* Adjustment Type Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Adjustment Direction <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAdjustmentType('adjustment_out')}
              className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                adjustmentType === 'adjustment_out'
                  ? 'border-rose-400 bg-rose-50 text-rose-800 ring-1 ring-rose-300 font-semibold'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ArrowDownRight className="w-4 h-4 text-rose-600 shrink-0" />
              <div>
                <div className="text-xs">Deduct Stock (-)</div>
                <div className="text-[10px] text-slate-400 font-normal">Damage, loss, disposal</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setAdjustmentType('adjustment_in')}
              className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                adjustmentType === 'adjustment_in'
                  ? 'border-teal-400 bg-teal-50 text-teal-800 ring-1 ring-teal-300 font-semibold'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-teal-600 shrink-0" />
              <div>
                <div className="text-xs">Add Stock (+)</div>
                <div className="text-[10px] text-slate-400 font-normal">Found stock, recount</div>
              </div>
            </button>
          </div>
        </div>

        {/* Quantity */}
        <div>
          <Input
            label="Adjustment Quantity (Units)"
            type="number"
            min="0.01"
            step="any"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter quantity to adjust"
            required
          />
        </div>

        {/* Live Calculation Preview */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-3 text-center">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Current</span>
            <p className="text-sm font-bold text-slate-800 mt-0.5">{prevQty}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Change</span>
            <p
              className={`text-sm font-bold mt-0.5 ${
                adjustmentType === 'adjustment_out' ? 'text-rose-600' : 'text-teal-600'
              }`}
            >
              {adjustmentType === 'adjustment_out' ? `-${numQty}` : `+${numQty}`}
            </p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Resulting</span>
            <p
              className={`text-sm font-bold mt-0.5 ${
                isNegative ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {resultingQty}
            </p>
          </div>
        </div>

        {isNegative && (
          <div className="text-[11px] text-rose-600 flex items-center gap-1.5 font-medium">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            Resulting quantity cannot be negative.
          </div>
        )}

        {/* Reason */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Reason for Adjustment <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Broken seal discovered during warehouse audit; Physical count correction"
            className="w-full rounded-lg border border-slate-300 text-xs py-2 px-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            required
          />
        </div>

        {/* Reference */}
        <div>
          <Input
            label="Audit / Reference Note (Optional)"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g. AUDIT-2026-Q4, WRITEOFF-09"
          />
        </div>
      </form>
    </Modal>
  );
};

export default StockAdjustmentModal;
