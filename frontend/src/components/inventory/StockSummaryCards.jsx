import React from 'react';
import {
  Boxes,
  Layers,
  AlertTriangle,
  Clock,
  AlertOctagon,
  CircleDollarSign,
  ShieldAlert,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const StockSummaryCards = ({ summary, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-24 bg-slate-100 rounded-xl border border-slate-200" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'Sellable Units',
      value: (summary?.totalSellableUnits ?? 0).toLocaleString(),
      detail: 'Available stock units',
      icon: Boxes,
      color: 'teal',
      bg: 'bg-teal-50',
      text: 'text-teal-600',
      border: 'border-teal-200/80',
    },
    {
      label: 'Total Batches',
      value: (summary?.totalBatches ?? 0).toLocaleString(),
      detail: `${summary?.totalActiveMedicines ?? 0} active medicines`,
      icon: Layers,
      color: 'blue',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200/80',
    },
    {
      label: 'Low Stock Deficit',
      value: summary?.lowStockMedicineCount ?? 0,
      detail: 'Medicines <= min threshold',
      icon: AlertTriangle,
      color: 'amber',
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-200/80',
      isWarning: (summary?.lowStockMedicineCount ?? 0) > 0,
    },
    {
      label: 'Expiring Soon',
      value: summary?.expiringBatchCount ?? 0,
      detail: 'Within next 90 days',
      icon: Clock,
      color: 'amber',
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-200/80',
      isWarning: (summary?.expiringBatchCount ?? 0) > 0,
    },
    {
      label: 'Expired Batches',
      value: summary?.expiredBatchCount ?? 0,
      detail: 'Non-sellable expired stock',
      icon: AlertOctagon,
      color: 'rose',
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      border: 'border-rose-200/80',
      isDanger: (summary?.expiredBatchCount ?? 0) > 0,
    },
    {
      label: 'Inventory Value',
      value: formatCurrency(summary?.inventoryPurchaseValue ?? 0),
      detail: 'Total acquisition cost',
      icon: CircleDollarSign,
      color: 'emerald',
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-200/80',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs hover:shadow-sm transition-shadow flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
                {card.label}
              </span>
              <div className={`p-1.5 rounded-lg ${card.bg} ${card.text} border ${card.border}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold text-slate-900 leading-tight">
                {card.value}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 truncate">
                {card.detail}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StockSummaryCards;

