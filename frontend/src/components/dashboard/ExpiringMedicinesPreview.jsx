import React from 'react';
import { Link } from 'react-router-dom';
import { SAMPLE_DASHBOARD_DATA } from '../../utils/constants';
import Badge from '../common/Badge';
import { Clock, ArrowRight } from 'lucide-react';

export const ExpiringMedicinesPreview = ({ items = null, isLive = false }) => {
  const displayItems = Array.isArray(items)
    ? items
    : Array.isArray(items?.batches)
    ? items.batches
    : Array.isArray(SAMPLE_DASHBOARD_DATA?.expiringItems)
    ? SAMPLE_DASHBOARD_DATA.expiringItems
    : [];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-rose-50 text-rose-600">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            Expiring Batches
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
          <span className="text-xs text-slate-500 font-medium">Within 90 Days</span>
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
            No medicine batches expiring in the next 90 days.
          </div>
        ) : (
          displayItems.map((item, idx) => {
            const name = item.medicine?.name || item.name;
            const batchNum = item.batchNumber || item.batch;
            const expiry = item.expiryDate
              ? new Date(item.expiryDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'N/A';
            const daysLeft = item.daysRemaining !== undefined ? item.daysRemaining : item.daysLeft;
            const stock = item.availableQuantity !== undefined ? item.availableQuantity : item.stock;
            const isUrgent = daysLeft <= 30;

            return (
              <div
                key={item._id || idx}
                className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 leading-tight">
                    {name}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                    <span>
                      Batch: <strong className="text-slate-600 font-mono">{batchNum}</strong>
                    </span>
                    <span>•</span>
                    <span>Exp: {expiry}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <Badge
                    variant={daysLeft <= 0 ? 'danger' : isUrgent ? 'danger' : 'warning'}
                    size="sm"
                    dot
                  >
                    {daysLeft <= 0 ? 'Expired' : `${daysLeft}d left`}
                  </Badge>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Qty: <span className="font-semibold text-slate-700">{stock}</span> units
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ExpiringMedicinesPreview;
