import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Plus, CheckCircle2 } from 'lucide-react';
import Badge from '../common/Badge';

export const LowStockTable = ({ lowStockItems = [], isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Loading low stock analysis...
      </div>
    );
  }

  if (!lowStockItems || lowStockItems.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
        <p className="font-semibold text-slate-800">All Stock Levels Optimal</p>
        <p className="text-slate-400 mt-0.5">
          No medicines are currently below their minimum reorder thresholds.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
            <tr>
              <th className="px-4 py-3">Medicine</th>
              <th className="px-4 py-3 font-mono">SKU</th>
              <th className="px-4 py-3 text-right">Available Stock</th>
              <th className="px-4 py-3 text-right">Min Reorder Level</th>
              <th className="px-4 py-3 text-right">Deficit</th>
              <th className="px-4 py-3 text-center">Urgency</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lowStockItems.map((item, idx) => {
              const med = item.medicine || {};
              const isCritical = item.isCritical;

              return (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900 leading-snug">
                      {med.name}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {med.genericName || med.category}
                    </div>
                  </td>

                  <td className="px-4 py-3 font-mono text-slate-600 font-medium">
                    {med.sku}
                  </td>

                  <td className="px-4 py-3 text-right font-bold text-slate-900">
                    <span className={isCritical ? 'text-rose-600' : 'text-amber-600'}>
                      {item.totalSellableQuantity}
                    </span>{' '}
                    <span className="text-[10px] text-slate-400 font-normal">
                      {med.unit || 'units'}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right text-slate-600">
                    {item.minimumStock}
                  </td>

                  <td className="px-4 py-3 text-right font-semibold text-rose-600">
                    -{item.deficit}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <Badge variant={isCritical ? 'danger' : 'warning'} size="sm" dot>
                      {isCritical ? 'Critical' : 'Low Stock'}
                    </Badge>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <Link
                      to="/inventory/stock-in"
                      className="inline-flex items-center gap-1 text-[11px] text-teal-700 bg-teal-50 hover:bg-teal-100 px-2 py-1 rounded font-medium transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Restock
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LowStockTable;

