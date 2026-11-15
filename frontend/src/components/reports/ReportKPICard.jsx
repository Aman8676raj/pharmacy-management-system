import React from 'react';

export const ReportKPICard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'teal', // teal, indigo, emerald, amber, rose
  trend,
  trendDirection = 'neutral', // up, down, neutral
}) => {
  const variantStyles = {
    teal: {
      bg: 'bg-teal-50/60',
      border: 'border-teal-100',
      iconBg: 'bg-teal-100/80',
      iconColor: 'text-teal-700',
      textColor: 'text-teal-950',
    },
    indigo: {
      bg: 'bg-indigo-50/60',
      border: 'border-indigo-100',
      iconBg: 'bg-indigo-100/80',
      iconColor: 'text-indigo-700',
      textColor: 'text-indigo-950',
    },
    emerald: {
      bg: 'bg-emerald-50/60',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-100/80',
      iconColor: 'text-emerald-700',
      textColor: 'text-emerald-950',
    },
    amber: {
      bg: 'bg-amber-50/60',
      border: 'border-amber-100',
      iconBg: 'bg-amber-100/80',
      iconColor: 'text-amber-700',
      textColor: 'text-amber-950',
    },
    rose: {
      bg: 'bg-rose-50/60',
      border: 'border-rose-100',
      iconBg: 'bg-rose-100/80',
      iconColor: 'text-rose-700',
      textColor: 'text-rose-950',
    },
  };

  const style = variantStyles[variant] || variantStyles.teal;

  return (
    <div
      className={`rounded-xl border ${style.border} ${style.bg} p-4 shadow-2xs transition-all hover:shadow-xs`}
    >
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </div>
        {Icon && (
          <div className={`p-2 rounded-lg ${style.iconBg}`}>
            <Icon className={`w-4 h-4 ${style.iconColor}`} />
          </div>
        )}
      </div>

      <div className="mt-2.5">
        <div className={`text-xl font-bold tracking-tight ${style.textColor}`}>
          {value}
        </div>
        {subtitle && (
          <div className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</div>
        )}
      </div>

      {trend && (
        <div className="mt-2 text-[11px] font-medium flex items-center gap-1">
          <span
            className={
              trendDirection === 'up'
                ? 'text-emerald-600'
                : trendDirection === 'down'
                ? 'text-rose-600'
                : 'text-slate-500'
            }
          >
            {trend}
          </span>
        </div>
      )}
    </div>
  );
};
