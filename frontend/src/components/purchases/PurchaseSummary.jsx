import React from 'react';
import { CircleDollarSign, Percent, Truck, Calculator } from 'lucide-react';

export default function PurchaseSummary({
  subtotal = 0,
  discount = 0,
  taxAmount = 0,
  shippingCharges = 0,
  totalAmount = 0,
}) {
  return (
    <div className="bg-slate-50/80 rounded-xl border border-slate-200 p-4 space-y-2.5 text-xs text-slate-600">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <span className="font-semibold text-slate-700 flex items-center gap-1.5">
          <Calculator className="w-3.5 h-3.5 text-slate-400" />
          Financial Breakdown
        </span>
        <span className="text-[10px] uppercase font-bold text-slate-400">USD ($)</span>
      </div>

      <div className="flex items-center justify-between">
        <span>Items Subtotal:</span>
        <span className="font-mono text-slate-800 font-medium">${subtotal.toFixed(2)}</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Percent className="w-3 h-3 text-amber-500" />
          Applicable Discounts:
        </span>
        <span className="font-mono text-rose-600 font-medium">-${discount.toFixed(2)}</span>
      </div>

      <div className="flex items-center justify-between">
        <span>Applicable Taxes:</span>
        <span className="font-mono text-slate-800">+${taxAmount.toFixed(2)}</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Truck className="w-3 h-3 text-blue-500" />
          Shipping / Logistics:
        </span>
        <span className="font-mono text-slate-800">+${parseFloat(shippingCharges || 0).toFixed(2)}</span>
      </div>

      <div className="flex items-center justify-between pt-2.5 border-t border-slate-200 text-sm font-bold text-slate-900">
        <span>Final Total:</span>
        <span className="font-mono text-teal-700 text-base font-extrabold">${totalAmount.toFixed(2)}</span>
      </div>
    </div>
  );
}

