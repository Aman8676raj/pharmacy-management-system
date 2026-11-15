import React from 'react';
import { Link } from 'react-router-dom';
import { SAMPLE_DASHBOARD_DATA } from '../../utils/constants';
import Badge from '../common/Badge';
import { AlertCircle, ArrowRight } from 'lucide-react';

export const LowStockPreview = ({ items = null, isLive = false }) => {
  const displayItems = items !== null ? items : SAMPLE_DASHBOARD_DATA.lowStockItems;

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
          <span
            className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
              isLive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {isLive ? 'Live DB' : 'Sample Data'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-medium">
            {displayItems.length} Requires Action
          </span>
          <Link
            to="/inventory"
            className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center"
            title="Go to Inventory"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="p-4 divide-y divide-slate-100 flex-1 overflow-y-auto max-h-72">
        {displayItems.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            All medicines are currently above minimum stock levels.
          </div>
        ) : (
          displayItems.map((item, idx) => {
            // Normalize live vs sample item
            const name = item.name;
            const subtitle = item.genericName || item.generic || item.category || '';
            const stock = item.totalSellableQuantity !== undefined ? item.totalSellableQuantity : item.stock;
            const reorderLevel = item.minimumStock !== undefined ? item.minimumStock : item.reorderLevel;
            const isCritical =
              item.status === 'Critical' || item.status === 'out_of_stock' || stock === 0;
            const statusLabel =
              item.status === 'out_of_stock'
                ? 'Out of Stock'
                : item.status === 'low_stock'
                ? 'Low Stock'
                : item.status || 'Low';

            const percent =
              reorderLevel > 0 ? Math.min(100, Math.round((stock / reorderLevel) * 100)) : 0;

            return (
              <div key={item._id || idx} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800 leading-tight">
                      {name}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {subtitle} {item.sku && <span className="font-mono text-slate-500">({item.sku})</span>}
                    </p>
                  </div>
                  <Badge
                    variant={isCritical ? 'danger' : 'warning'}
                    size="sm"
                    dot
                  >
                    {statusLabel}
                  </Badge>
                </div>

                {/* Progress bar */}
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span>
                      Stock:{' '}
                      <strong className={isCritical ? 'text-rose-600' : 'text-amber-600'}>
                        {stock}
                      </strong>{' '}
                      units
                    </span>
                    <span>Min threshold: {reorderLevel}</span>
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
          })
        )}
      </div>
    </div>
  );
};

export default LowStockPreview;
