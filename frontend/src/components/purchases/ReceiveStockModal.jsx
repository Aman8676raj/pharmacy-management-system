import React, { useState } from 'react';
import { PackageCheck, Calendar, AlertCircle, Check, DollarSign } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Alert from '../common/Alert';

export default function ReceiveStockModal({
  isOpen,
  onClose,
  purchaseOrder,
  onSubmit,
}) {
  if (!isOpen || !purchaseOrder) return null;

  // Filter items with remaining quantity > 0
  const unfulfilledItems = purchaseOrder.items.filter(
    (it) => it.orderedQuantity - it.receivedQuantity > 0
  );

  const [receivedRows, setReceivedRows] = useState(
    unfulfilledItems.map((it) => {
      const remaining = it.orderedQuantity - it.receivedQuantity;
      return {
        medicineId: it.medicine?._id || it.medicine,
        medicineName: it.medicineName,
        sku: it.sku,
        orderedQuantity: it.orderedQuantity,
        previouslyReceived: it.receivedQuantity,
        remainingQuantity: remaining,
        quantityReceived: remaining, // default to remaining
        batchNumber: '',
        manufacturingDate: '',
        expiryDate: '',
        purchasePrice: it.unitCost,
        sellingPrice: Math.round(it.unitCost * 1.5 * 100) / 100, // reasonable default markup
      };
    })
  );

  const [supplierInvoiceNumber, setSupplierInvoiceNumber] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleRowChange = (index, field, value) => {
    const updated = [...receivedRows];
    updated[index] = { ...updated[index], [field]: value };
    setReceivedRows(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Filter rows where quantityReceived > 0
    const activeReceiving = receivedRows.filter((row) => parseFloat(row.quantityReceived) > 0);

    if (activeReceiving.length === 0) {
      setError('Please enter a received quantity greater than 0 for at least one item.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Validate active receiving rows
    for (const row of activeReceiving) {
      const qty = parseFloat(row.quantityReceived);
      if (isNaN(qty) || qty <= 0) {
        setError(`Please enter a valid quantity for ${row.medicineName}.`);
        return;
      }
      if (qty > row.remainingQuantity) {
        setError(
          `Received quantity (${qty}) cannot exceed remaining ordered (${row.remainingQuantity}) for ${row.medicineName}.`
        );
        return;
      }
      if (!row.batchNumber.trim()) {
        setError(`Batch lot number is required for ${row.medicineName}.`);
        return;
      }
      if (!row.expiryDate) {
        setError(`Expiry date is required for batch ${row.batchNumber}.`);
        return;
      }
      if (row.expiryDate <= todayStr) {
        setError(`Expiry date must be in the future for batch ${row.batchNumber}.`);
        return;
      }
      if (row.manufacturingDate && row.expiryDate <= row.manufacturingDate) {
        setError(`Expiry date must be later than manufacturing date for batch ${row.batchNumber}.`);
        return;
      }
      const sPrice = parseFloat(row.sellingPrice);
      if (isNaN(sPrice) || sPrice < 0) {
        setError(`Selling price cannot be negative for batch ${row.batchNumber}.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        supplierInvoiceNumber: supplierInvoiceNumber.trim(),
        notes: deliveryNotes.trim(),
        items: activeReceiving.map((row) => ({
          medicine: row.medicineId,
          batchNumber: row.batchNumber.trim().toUpperCase(),
          manufacturingDate: row.manufacturingDate || undefined,
          expiryDate: row.expiryDate,
          quantityReceived: parseFloat(row.quantityReceived),
          purchasePrice: parseFloat(row.purchasePrice),
          sellingPrice: parseFloat(row.sellingPrice),
        })),
      };

      await onSubmit(payload);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to record stock receipt.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      title={`Receive Delivery - ${purchaseOrder.purchaseOrderNumber}`}
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <Alert type="error" title="Intake Verification Error" message={error} onClose={() => setError(null)} />
        )}

        {/* Invoice and Reference Bar */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Supplier Invoice / Delivery Challan No.
            </label>
            <input
              type="text"
              value={supplierInvoiceNumber}
              onChange={(e) => setSupplierInvoiceNumber(e.target.value)}
              placeholder="e.g. INV-APEX-9824"
              className="w-full text-xs rounded-lg border border-slate-300 py-1.5 px-3 bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Delivery Inspection Notes
            </label>
            <input
              type="text"
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="e.g. Packaging intact, cold-chain temperature verified"
              className="w-full text-xs rounded-lg border border-slate-300 py-1.5 px-3 bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Items to Receive Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">Medicine &amp; SKU</th>
                  <th className="py-2.5 px-3 text-center">Remaining</th>
                  <th className="py-2.5 px-3 w-24">Recv Qty</th>
                  <th className="py-2.5 px-3 w-32">Batch Lot #</th>
                  <th className="py-2.5 px-3 w-32">Expiry Date</th>
                  <th className="py-2.5 px-3 w-28 text-right">Cost Price ($)</th>
                  <th className="py-2.5 px-3 w-28 text-right">Selling Price ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {receivedRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{row.medicineName}</div>
                      <span className="text-[11px] text-slate-400 font-mono">{row.sku}</span>
                    </td>

                    <td className="py-2.5 px-3 text-center font-mono">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                        {row.remainingQuantity}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min="0"
                        max={row.remainingQuantity}
                        step="1"
                        value={row.quantityReceived}
                        onChange={(e) => handleRowChange(idx, 'quantityReceived', e.target.value)}
                        className="w-full text-xs rounded border border-slate-300 py-1 px-2 text-right font-mono font-semibold focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                      />
                    </td>

                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        required={parseFloat(row.quantityReceived) > 0}
                        placeholder="e.g. BT-9921"
                        value={row.batchNumber}
                        onChange={(e) => handleRowChange(idx, 'batchNumber', e.target.value)}
                        className="w-full text-xs rounded border border-slate-300 py-1 px-2 font-mono uppercase focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                      />
                    </td>

                    <td className="py-2.5 px-3">
                      <input
                        type="date"
                        required={parseFloat(row.quantityReceived) > 0}
                        value={row.expiryDate}
                        onChange={(e) => handleRowChange(idx, 'expiryDate', e.target.value)}
                        className="w-full text-xs rounded border border-slate-300 py-1 px-2 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                      />
                    </td>

                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.purchasePrice}
                        onChange={(e) => handleRowChange(idx, 'purchasePrice', e.target.value)}
                        className="w-full text-xs rounded border border-slate-300 py-1 px-2 text-right font-mono focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                      />
                    </td>

                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required={parseFloat(row.quantityReceived) > 0}
                        value={row.sellingPrice}
                        onChange={(e) => handleRowChange(idx, 'sellingPrice', e.target.value)}
                        className="w-full text-xs rounded border border-slate-300 py-1 px-2 text-right font-mono font-semibold text-emerald-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notice */}
        <div className="text-xs text-slate-500 bg-teal-50/70 border border-teal-200/80 p-3 rounded-xl flex items-start gap-2 text-teal-950">
          <PackageCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <div>
            <strong>Automated Inventory Integration:</strong> Confirming this receipt will automatically create or replenish the corresponding batches in active inventory and record an auditable <code className="font-mono font-bold text-teal-900">stock_in</code> transaction.
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              'Processing Intake...'
            ) : (
              <>
                <Check className="w-4 h-4 mr-1.5" />
                Confirm &amp; Add to Inventory
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

