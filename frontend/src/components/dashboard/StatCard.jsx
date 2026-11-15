import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  change,
  trend = 'up',
  detail,
  icon: Icon,
  accentColor = 'teal',
}) => {
  const accentConfigs = {
    teal: {
      bg: 'bg-teal-50',
      text: 'text-teal-600',
      border: 'border-teal-100',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-100',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-100',
    },
  };

  const currentAccent = accentConfigs[accentColor] || accentConfigs.teal;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">
            {value}
          </h3>
        </div>

        {Icon && (
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center ${currentAccent.bg} ${currentAccent.text} ${currentAccent.border} border`}
          >
            <Icon className="w-5 h-5 stroke-[2.2]" />
          </div>
        )}
      </div>

      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-medium">
          {trend === 'up' && (
            <span className="inline-flex items-center text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              {change}
            </span>
          )}
          {trend === 'warning' && (
            <span className="inline-flex items-center text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[11px]">
              <AlertCircle className="w-3 h-3 mr-0.5" />
              {change}
            </span>
          )}
          {trend === 'neutral' && (
            <span className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
              {change}
            </span>
          )}
        </div>

        {detail && <span className="text-slate-400 text-[11px] truncate">{detail}</span>}
      </div>
    </div>
  );
};

export default StatCard;

