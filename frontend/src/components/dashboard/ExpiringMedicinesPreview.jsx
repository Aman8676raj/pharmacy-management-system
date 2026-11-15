import React from 'react';
import { SAMPLE_DASHBOARD_DATA } from '../../utils/constants';
import Badge from '../common/Badge';
import { Clock } from 'lucide-react';

export const ExpiringMedicinesPreview = () => {
  const items = SAMPLE_DASHBOARD_DATA.expiringItems;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-rose-50 text-rose-600">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            Expiring Medicines
          </h3>
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
            Sample Data
          </span>
        </div>
        <span className="text-xs text-slate-500 font-medium">Next 60 Days</span>
      </div>

      <div className="p-4 divide-y divide-slate-100 flex-1 overflow-y-auto">
        {items.map((item, idx) => {
          const isUrgent = item.urgency === 'high';

          return (
            <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-semibold text-slate-800 leading-tight">
                  {item.name}
                </h4>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                  <span>Batch: <strong className="text-slate-600 font-mono">{item.batch}</strong></span>
                  <span>•</span>
                  <span>Expiry: {item.expiryDate}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <Badge
                  variant={isUrgent ? 'danger' : 'warning'}
                  size="sm"
                  dot
                >
                  {item.daysLeft} days left
                </Badge>
                <p className="text-[11px] text-slate-400 mt-1">
                  Qty: <span className="font-semibold text-slate-700">{item.stock}</span> packs
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExpiringMedicinesPreview;

