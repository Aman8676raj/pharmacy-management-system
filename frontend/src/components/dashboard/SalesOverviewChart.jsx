import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, DollarSign } from 'lucide-react';
import { SAMPLE_DASHBOARD_DATA } from '../../utils/constants';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-lg text-xs space-y-1 border border-slate-700">
        <p className="font-semibold text-slate-300">{label}</p>
        <p className="text-teal-400 font-bold text-sm">
          Revenue: ${payload[0].value.toLocaleString()}
        </p>
        {payload[1] && (
          <p className="text-slate-300">
            Transactions: {payload[1].value}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export const SalesOverviewChart = () => {
  const [period, setPeriod] = useState('weekly');

  const data =
    period === 'weekly'
      ? SAMPLE_DASHBOARD_DATA.salesChartWeekly
      : SAMPLE_DASHBOARD_DATA.salesChartMonthly;

  const totalRevenue = data.reduce((acc, curr) => acc + curr.revenue, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">
              Sales Revenue Overview
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              Sample Data
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Total for period: <span className="font-semibold text-slate-800">${totalRevenue.toLocaleString()}</span>
          </p>
        </div>

        {/* View Switcher */}
        <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setPeriod('weekly')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              period === 'weekly'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Weekly
          </button>
          <button
            type="button"
            onClick={() => setPeriod('monthly')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              period === 'monthly'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v >= 1000 ? `${v / 1000}k` : v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#0d9488"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesOverviewChart;
