import React from 'react';
import { Trash2, Pill } from 'lucide-react';

export default function PurchaseItemRow({
  item,
  index,
  medicines = [],
  onChange,
  onRemove,
  canRemove = true,
}) {
  const handleFieldChange = (field, value) => {
    onChange(index, { ...item, [field]: value });
  };

  const handleMedicineSelect = (e) => {
    const medId = e.target.value;
    const selectedMed = medicines.find((m) => (m.id || m._id) === medId);
    if (selectedMed) {
      onChange(index, {
        ...item,
        medicine: medId,
        medicineName: selectedMed.name,
        sku: selectedMed.sku,
      });
    } else {
      onChange(index, {
        ...item,
        medicine: '',
        medicineName: '',
        sku: '',
      });
    }
  };

  // Live line total calculation
  const qty = parseFloat(item.orderedQuantity) || 0;
  const cost = parseFloat(item.unitCost) || 0;
  const disc = parseFloat(item.discount) || 0;
  const taxRate = parseFloat(item.taxRate) || 0;
  const subtotal = Math.max(0, qty * cost - disc);
  const tax = (subtotal * taxRate) / 100;
  const lineTotal = Math.round((subtotal + tax) * 100) / 100;

  return (
    <tr className="hover:bg-slate-50/60 border-b border-slate-100 text-xs">
      <td className="py-2.5 px-3 min-w-[220px]">
        <select
          value={item.medicine || ''}
          onChange={handleMedicineSelect}
          className="w-full text-xs rounded-lg border border-slate-300 py-1.5 px-2 bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
        >
          <option value="">-- Select Active Medicine --</option>
          {medicines.map((m) => (
            <option key={m.id || m._id} value={m.id || m._id}>
              {m.name} [{m.sku}] ({m.dosageForm || 'Form'})
            </option>
          ))}
        </select>
        {item.sku && (
          <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
            SKU: {item.sku}
          </span>
        )}
      </td>

      <td className="py-2.5 px-3 w-28">
        <input
          type="number"
          min="1"
          step="1"
          value={item.orderedQuantity}
          onChange={(e) => handleFieldChange('orderedQuantity', e.target.value)}
          placeholder="Qty"
          className="w-full text-xs rounded-lg border border-slate-300 py-1.5 px-2 text-right font-mono focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
        />
      </td>

      <td className="py-2.5 px-3 w-32">
        <input
          type="number"
          min="0"
          step="0.01"
          value={item.unitCost}
          onChange={(e) => handleFieldChange('unitCost', e.target.value)}
          placeholder="0.00"
          className="w-full text-xs rounded-lg border border-slate-300 py-1.5 px-2 text-right font-mono focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
        />
      </td>

      <td className="py-2.5 px-3 w-28">
        <input
          type="number"
          min="0"
          step="0.01"
          value={item.discount}
          onChange={(e) => handleFieldChange('discount', e.target.value)}
          placeholder="0.00"
          className="w-full text-xs rounded-lg border border-slate-300 py-1.5 px-2 text-right font-mono focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
        />
      </td>

      <td className="py-2.5 px-3 w-28">
        <select
          value={item.taxRate || 0}
          onChange={(e) => handleFieldChange('taxRate', e.target.value)}
          className="w-full text-xs rounded-lg border border-slate-300 py-1.5 px-2 bg-white text-right focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
        >
          <option value="0">0%</option>
          <option value="5">5%</option>
          <option value="12">12%</option>
          <option value="18">18%</option>
          <option value="28">28%</option>
        </select>
      </td>

      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800 w-32 whitespace-nowrap">
        ${lineTotal.toFixed(2)}
      </td>

      <td className="py-2.5 px-3 text-center w-12">
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Remove item line"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </td>
    </tr>
  );
}
