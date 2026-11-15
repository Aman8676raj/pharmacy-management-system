import React, { useState } from 'react';
import { Minus, Plus, Trash2, Tag, Percent } from 'lucide-react';

export const CartItem = ({
  item,
  onUpdateQuantity,
  onUpdateDiscount,
  onUpdateTaxRate,
  onRemove,
}) => {
  const [showOptions, setShowOptions] = useState(false);

  const baseTotal = item.quantity * item.unitPrice;
  const discountVal = item.discountType === 'fixed'
    ? Math.min(baseTotal, item.discount || 0)
    : (baseTotal * (item.discount || 0)) / 100;
  const taxable = Math.max(0, baseTotal - discountVal);
  const taxVal = (taxable * (item.taxRate || 0)) / 100;
  const lineTotal = Math.round((taxable + taxVal) * 100) / 100;

  return (
    <div className="p-3 bg-white rounded-xl border border-slate-200/80 hover:border-slate-300 transition-all shadow-2xs">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h5 className="text-sm font-semibold text-slate-900 truncate">
              {item.medicineName}
            </h5>
            {item.requiresPrescription && (
              <span className="text-[10px] font-bold px-1 py-0.2 rounded bg-amber-100 text-amber-800 shrink-0">
                Rx
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
            <span>₹{Number(item.unitPrice).toFixed(2)} / {item.unit || 'unit'}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400">Max: {item.maxStock}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onRemove(item.medicine)}
          className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors"
          title="Remove from cart"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Quantity & Line Total */}
      <div className="mt-3 flex items-center justify-between gap-3">
        {/* Counter */}
        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.medicine, item.quantity - 1)}
            className="p-1.5 hover:bg-slate-200 text-slate-600 transition-colors disabled:opacity-40"
            disabled={item.quantity <= 1}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <input
            type="number"
            min="1"
            max={item.maxStock}
            value={item.quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val)) onUpdateQuantity(item.medicine, val);
            }}
            className="w-12 text-center text-xs font-semibold bg-white py-1 focus:outline-hidden border-x border-slate-200"
          />
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.medicine, item.quantity + 1)}
            className="p-1.5 hover:bg-slate-200 text-slate-600 transition-colors disabled:opacity-40"
            disabled={item.quantity >= item.maxStock}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="text-right">
          <div className="text-sm font-bold text-slate-900">
            ₹{lineTotal.toFixed(2)}
          </div>
          {(item.discount > 0 || item.taxRate > 0) && (
            <div className="text-[10px] text-slate-500">
              {item.discount > 0 && `-${item.discount}% `}
              {item.taxRate > 0 && `+${item.taxRate}% tax`}
            </div>
          )}
        </div>
      </div>

      {/* Toggle item discount & tax options */}
      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => setShowOptions(!showOptions)}
          className="text-[11px] font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1"
        >
          <Tag className="w-3 h-3" />
          {showOptions ? 'Hide Discount/Tax' : 'Add Item Discount/Tax'}
        </button>
      </div>

      {showOptions && (
        <div className="mt-2.5 pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 bg-slate-50/70 p-2 rounded-lg text-xs">
          <div>
            <label className="text-[10px] font-medium text-slate-500 block mb-1">
              Item Disc (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={item.discount || 0}
              onChange={(e) => onUpdateDiscount(item.medicine, parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1 text-xs border border-slate-200 rounded bg-white focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>
          <div>
            <label className="text-[10px] font-medium text-slate-500 block mb-1">
              GST / Tax (%)
            </label>
            <select
              value={item.taxRate || 0}
              onChange={(e) => onUpdateTaxRate(item.medicine, parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1 text-xs border border-slate-200 rounded bg-white focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
            >
              <option value="0">0% (Exempt)</option>
              <option value="5">5% GST</option>
              <option value="12">12% GST</option>
              <option value="18">18% GST</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
