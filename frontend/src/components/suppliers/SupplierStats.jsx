import React from 'react';
import { Truck, CheckCircle2, XCircle, MapPin } from 'lucide-react';

export default function SupplierStats({ stats = null, loading = false }) {
  const cards = [
    {
      title: 'Total Suppliers',
      value: stats?.total ?? 0,
      detail: 'Registered vendor accounts',
      icon: Truck,
      bg: 'bg-teal-50 text-teal-600',
    },
    {
      title: 'Active Suppliers',
      value: stats?.active ?? 0,
      detail: 'Eligible for purchase orders',
      icon: CheckCircle2,
      bg: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Inactive Suppliers',
      value: stats?.inactive ?? 0,
      detail: 'Deactivated / archived',
      icon: XCircle,
      bg: 'bg-rose-50 text-rose-600',
    },
    {
      title: 'Coverage Hubs',
      value: stats?.totalCities ?? 0,
      detail: 'Operating cities & hubs',
      icon: MapPin,
      bg: 'bg-blue-50 text-blue-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-medium text-slate-500">{card.title}</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1 font-mono">
                {loading ? '...' : card.value}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{card.detail}</p>
            </div>
            <div className={`p-3 rounded-xl shrink-0 ${card.bg}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
