import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import {
  Banknote,
  CreditCard,
  Smartphone,
  Building,
  Wallet,
  AlertTriangle,
  Receipt,
  CheckCircle,
} from 'lucide-react';

export const CheckoutModal = ({
  isOpen,
  onClose,
  cartItems,
  subtotal,
  orderDiscount,
  orderDiscountType,
  totalTax,
  grandTotal,
  onConfirmCheckout,
  loading = false,
}) => {
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [prescriptionRef, setPrescriptionRef] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Check if any cart item requires prescription
  const hasRxItems = cartItems.some((item) => item.requiresPrescription);

  useEffect(() => {
    if (isOpen) {
      setAmountPaid(grandTotal > 0 ? String(grandTotal) : '0');
      setError('');
    }
  }, [isOpen, grandTotal]);

  const numAmountPaid = parseFloat(amountPaid) || 0;
  const isOverpaid = numAmountPaid > grandTotal;
  const changeAmount = isOverpaid ? Math.round((numAmountPaid - grandTotal) * 100) / 100 : 0;
  const balanceDue = numAmountPaid < grandTotal ? Math.round((grandTotal - numAmountPaid) * 100) / 100 : 0;

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (hasRxItems && !prescriptionRef.trim()) {
      setError('Prescription reference / Doctor name is mandatory for prescription medicines (Rx).');
      return;
    }

    if (numAmountPaid < 0) {
      setError('Amount paid cannot be negative.');
      return;
    }

    const payload = {
      items: cartItems.map((item) => ({
        medicine: item.medicine,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        discountType: item.discountType || 'percentage',
        taxRate: item.taxRate || 0,
      })),
      discount: orderDiscount,
      discountType: orderDiscountType,
      amountPaid: Math.min(numAmountPaid, grandTotal),
      paymentMethod,
      customerSnapshot: {
        name: customerName.trim() || 'Walk-in Customer',
        phone: customerPhone.trim(),
        email: customerEmail.trim(),
        address: customerAddress.trim(),
        prescriptionRef: prescriptionRef.trim(),
      },
      notes: notes.trim(),
    };

    onConfirmCheckout(payload);
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
      title="Point of Sale — Billing & Payment"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleCheckoutSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {hasRxItems && (
          <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Prescription Items in Cart:</span>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Cart contains Schedule H/X medicines requiring doctor verification. Enter the Doctor / Clinic Rx number below.
              </p>
            </div>
          </div>
        )}

        {/* Financial Summary Strip */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 grid grid-cols-4 gap-2 text-center text-xs">
          <div>
            <div className="text-slate-500 text-[11px]">Subtotal</div>
            <div className="font-semibold text-slate-800">₹{subtotal.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-slate-500 text-[11px]">Discounts</div>
            <div className="font-semibold text-rose-600">-₹{orderDiscount.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-slate-500 text-[11px]">Taxes</div>
            <div className="font-semibold text-slate-800">+₹{totalTax.toFixed(2)}</div>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-1">
            <div className="text-teal-700 text-[11px] font-medium">Grand Total</div>
            <div className="font-bold text-teal-800 text-sm">₹{grandTotal.toFixed(2)}</div>
          </div>
        </div>

        {/* Customer Snapshot Form */}
        <div className="border border-slate-200 rounded-xl p-3.5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Customer Information
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Walk-in Customer"
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Doctor / Prescription Ref {hasRxItems && <span className="text-rose-600">*</span>}
              </label>
              <input
                type="text"
                value={prescriptionRef}
                onChange={(e) => setPrescriptionRef(e.target.value)}
                placeholder={hasRxItems ? "Dr. Name & Rx # (Mandatory)" : "Dr. Name & Rx # (Optional)"}
                className={`w-full px-3 py-1.5 text-xs border rounded-lg focus:ring-1 focus:outline-hidden ${
                  hasRxItems && !prescriptionRef.trim()
                    ? 'border-amber-400 bg-amber-50/30 focus:ring-amber-500'
                    : 'border-slate-200 focus:ring-teal-500'
                }`}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Email / Address (Optional)
              </label>
              <input
                type="text"
                value={customerEmail || customerAddress}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Email or City"
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border border-slate-200 rounded-xl p-3.5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Payment Details
          </h4>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-5 gap-2">
            {paymentMethods.map((m) => {
              const Icon = m.icon;
              const isSelected = paymentMethod === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-medium transition-all ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/70 text-teal-800 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-teal-600' : 'text-slate-500'}`} />
                  <span className="text-[11px] truncate w-full text-center">{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Amount Paid Input & Quick Presets */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-700">
                Amount Received / Paid (₹)
              </label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setAmountPaid(String(grandTotal))}
                  className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-medium"
                >
                  Exact (₹{grandTotal.toFixed(2)})
                </button>
                {[100, 200, 500, 1000, 2000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmountPaid(String(preset))}
                    className="text-[11px] px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
                  >
                    ₹{preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 font-bold text-sm">₹</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-base font-bold text-slate-900 border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            {/* Change or Balance Due Indicators */}
            <div className="mt-2.5 flex items-center justify-between text-xs px-1">
              {isOverpaid ? (
                <div className="text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Change to Return: <strong>₹{changeAmount.toFixed(2)}</strong></span>
                </div>
              ) : balanceDue > 0 ? (
                <div className="text-amber-700 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Remaining Balance: <strong>₹{balanceDue.toFixed(2)}</strong> (Partial Sale)</span>
                </div>
              ) : (
                <div className="text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Exact Payment (Invoice Fully Paid)</span>
                </div>
              )}

              <span className="text-slate-400 text-[11px]">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in bill
              </span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold"
          >
            <Receipt className="w-4 h-4 mr-1.5" />
            Complete Sale & Bill
          </Button>
        </div>
      </form>
    </Modal>
  );
};
