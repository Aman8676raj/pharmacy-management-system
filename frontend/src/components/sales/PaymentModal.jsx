import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import salesService from '../../services/salesService';
import { Banknote, CreditCard, Smartphone, Building, Wallet, AlertCircle } from 'lucide-react';

export const PaymentModal = ({ isOpen, onClose, sale, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (sale) {
      setAmount(sale.balanceAmount > 0 ? String(sale.balanceAmount) : '');
      setNotes('');
      setError('');
    }
  }, [sale, isOpen]);

  if (!sale) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Payment amount must be greater than zero.');
      return;
    }

    try {
      setLoading(true);
      await salesService.recordPayment(sale._id || sale.id, {
        amount: numAmount,
        paymentMethod,
        notes: notes.trim(),
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { id: 'cash', label: 'Cash', icon: Banknote },
    { id: 'upi', label: 'UPI / QR', icon: Smartphone },
    { id: 'card', label: 'Card', icon: CreditCard },
    { id: 'bank_transfer', label: 'Bank Transfer', icon: Building },
    { id: 'other', label: 'Other', icon: Wallet },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Record Payment — ${sale.invoiceNumber}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Invoice Summary Strip */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <div className="text-slate-500 text-[11px]">Total Bill</div>
            <div className="font-semibold text-slate-800">
              ₹{Number(sale.totalAmount || 0).toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-slate-500 text-[11px]">Paid So Far</div>
            <div className="font-semibold text-emerald-600">
              ₹{Number(sale.amountPaid || 0).toFixed(2)}
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-1">
            <div className="text-amber-800 text-[11px] font-medium">Balance Due</div>
            <div className="font-bold text-amber-900 text-sm">
              ₹{Number(sale.balanceAmount || 0).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Payment Amount */}
        <div>
          <label className="text-xs font-medium text-slate-700 block mb-1">
            Payment Amount (₹) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-slate-400 font-bold text-sm">₹</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={sale.balanceAmount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm font-semibold border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              required
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Full outstanding balance is ₹{Number(sale.balanceAmount || 0).toFixed(2)}
          </p>
        </div>

        {/* Payment Method */}
        <div>
          <label className="text-xs font-medium text-slate-700 block mb-1.5">
            Payment Mode <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {paymentMethods.map((m) => {
              const Icon = m.icon;
              const isSelected = paymentMethod === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-medium transition-all ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50 text-teal-800 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-teal-600' : 'text-slate-500'}`} />
                  <span className="text-[10px] truncate w-full text-center">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-medium text-slate-700 block mb-1">
            Reference / Notes
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. UPI Ref #, Cheque #, or customer note"
            className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
          />
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            Confirm & Save Payment
          </Button>
        </div>
      </form>
    </Modal>
  );
};

