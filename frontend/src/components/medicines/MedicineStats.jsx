import React from 'react';
import { Pill, AlertCircle, FileText, Layers, Archive } from 'lucide-react';

export const MedicineStats = ({ stats, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-slate-100 rounded-xl" />
        ))}
      </div>
    );
  }

  const items = [
    {
      label: 'Active Medicines',
      value: stats?.totalActive ?? 0,
      icon: Pill,
      color: 'teal',
      bg: 'bg-teal-50',
      text: 'text-teal-600',
      border: 'border-teal-200/80',
    },
    {
      label: 'Categories',
      value: stats?.totalCategories ?? 0,
      icon: Layers,
      color: 'blue',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200/80',
    },
    {
      label: 'Rx Required (Active)',
      value: stats?.prescriptionCount ?? stats?.recentMedicines?.filter(m => m.requiresPrescription)?.length ?? 0,
      icon: FileText,
      color: 'amber',
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-200/80',
    },
    {
      label: 'Deactivated Records',
      value: stats?.totalInactive ?? 0,
      icon: Archive,
      color: 'slate',
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-200/80',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs flex items-center justify-between"
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {item.label}
              </p>
              <h4 className="text-xl font-bold text-slate-900 mt-1">
                {item.value}
              </h4>
            </div>
            <div className={`p-2.5 rounded-lg ${item.bg} ${item.text} border ${item.border}`}>
              <Icon className="w-4 h-4" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MedicineStats;
