import React from 'react';
import { Plus, Check, AlertCircle, Pill } from 'lucide-react';

export const POSProductCard = ({
  medicine,
  availableStock = 0,
  unitPrice = 0,
  cartQuantity = 0,
  onAddToCart,
}) => {
  const isOutOfStock = availableStock <= 0;

  return (
    <div
      onClick={() => {
        if (!isOutOfStock) onAddToCart(medicine);
      }}
      className={`group relative bg-white rounded-xl border p-4 transition-all duration-200 flex flex-col justify-between select-none ${
        isOutOfStock
          ? 'border-slate-200 bg-slate-50/50 opacity-60 cursor-not-allowed'
          : 'border-slate-200/90 hover:border-teal-400 hover:shadow-md cursor-pointer hover:-translate-y-0.5'
      }`}
    >
      {/* Top row: Category & Prescriptions */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {medicine.category || 'General'}
          </span>
          <div className="flex items-center gap-1">
            {medicine.requiresPrescription && (
              <span
                title="Prescription Required (Schedule H/X)"
                className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800"
              >
                <AlertCircle className="w-3 h-3 text-amber-600" />
                Rx
              </span>
            )}
            {cartQuantity > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-teal-600 text-white text-[11px] font-bold shadow-xs">
                {cartQuantity}
              </span>
            )}
          </div>
        </div>

        {/* Medicine Name & Generic */}
        <h4 className="text-sm font-semibold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-1">
          {medicine.name}
        </h4>
        <p className="text-xs text-slate-500 line-clamp-1 italic mt-0.5">
          {medicine.genericName || medicine.brandName || 'Pharmaceutical'}
        </p>

        {/* Form and Strength */}
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 font-medium text-slate-600">
            <Pill className="w-3 h-3 text-slate-400" />
            {medicine.dosageForm || 'Medicine'}
          </span>
          {medicine.strength && (
            <span className="text-slate-400">• {medicine.strength}</span>
          )}
          {medicine.unit && (
            <span className="text-slate-400">• {medicine.unit}</span>
          )}
        </div>
      </div>

      {/* Bottom row: Price & Stock status */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div>
          <div className="text-base font-bold text-slate-900">
            ₹{Number(unitPrice || 0).toFixed(2)}
          </div>
          <div className="text-[11px] font-medium">
            {isOutOfStock ? (
              <span className="text-rose-600">Out of Stock</span>
            ) : (
              <span className={availableStock <= 10 ? 'text-amber-600' : 'text-emerald-600'}>
                {availableStock} in stock
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          disabled={isOutOfStock}
          onClick={(e) => {
            e.stopPropagation();
            if (!isOutOfStock) onAddToCart(medicine);
          }}
          className={`p-2 rounded-lg transition-all ${
            isOutOfStock
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : cartQuantity > 0
              ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-teal-50 hover:text-teal-700'
          }`}
        >
          {cartQuantity > 0 ? (
            <Check className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};
