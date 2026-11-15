import React from 'react';
import { SAMPLE_DASHBOARD_DATA } from '../../utils/constants';
import Badge from '../common/Badge';
import { AlertCircle } from 'lucide-react';

export const LowStockPreview = () => {
  const items = SAMPLE_DASHBOARD_DATA.lowStockItems;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-amber-50 text-amber-600">
            <AlertCircle className="w-4 h-4" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            Low Stock Alert
          </h3>
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
            Sample Data
          </span>
        </div>
        <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-medium">
          {items.length} Requires Action
        </span>
      </div>

      <div className="p-4 divide-y divide-slate-100 flex-1 overflow-y-auto">
        {items.map((item, idx) => {
          const percent = Math.min(100, Math.round((item.stock / item.reorderLevel) * 100));
          const isCritical = item.status === 'Critical';

          return (
            <div key={idx} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 leading-tight">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {item.generic} • <span className="text-slate-500">{item.category}</span>
                  </p>
                </div>
                <Badge
                  variant={isCritical ? 'danger' : 'warning'}
                  size="sm"
                  dot
                >
                  {item.status}
                </Badge>
              </div>

              {/* Progress bar */}
              <div className="mt-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span>
                    Stock: <strong className={isCritical ? 'text-rose-600' : 'text-amber-600'}>{item.stock}</strong> units
                  </span>
                  <span>Min reorder: {item.reorderLevel}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isCritical ? 'bg-rose-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LowStockPreview;
