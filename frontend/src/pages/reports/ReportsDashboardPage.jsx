import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
  Receipt,
  ArrowRight,
  RefreshCw,
  DollarSign,
  FileText,
  PieChart as PieIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import reportService from '../../services/reportService';
import { ReportKPICard } from '../../components/reports/ReportKPICard';
import { Button } from '../../components/common/Button';

export const ReportsDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await reportService.getDashboardStats();
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load dashboard report stats:', err);
      setError('Failed to fetch analytics statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const reportModules = [
    {
      title: 'Sales & Revenue Analytics',
      description: 'Daily revenue trends, payment mode breakdown, staff sales performance, and audit trails.',
      icon: Receipt,
      path: '/reports/sales',
      color: 'teal',
      statsLabel: "Today's Sales",
      statsValue: stats ? `₹${stats.sales?.todayRevenue?.toLocaleString('en-IN') || 0}` : '...',
    },
    {
      title: 'Inventory & Stock Valuation',
      description: 'Total purchase and selling valuation, expiry risk alerts, and stock movements.',
      icon: Package,
      path: '/reports/inventory',
      color: 'indigo',
      statsLabel: 'Low Stock Alerts',
      statsValue: stats ? `${stats.medicines?.lowStock || 0} items` : '...',
    },
    {
      title: 'Procurement & Purchases',
      description: 'Supplier spending distribution, open purchase orders, and receiving efficiency.',
      icon: ShoppingCart,
      path: '/reports/purchases',
      color: 'emerald',
      statsLabel: 'Pending POs',
      statsValue: stats ? `${stats.procurement?.pendingPOs || 0} orders` : '...',
    },
    {
      title: 'Profit & Loss (P&L)',
      description: 'Gross revenue, Cost of Goods Sold (COGS) through FEFO allocation, and operating margins.',
      icon: TrendingUp,
      path: '/reports/profit-loss',
      color: 'amber',
      statsLabel: 'Lifetime Sales',
      statsValue: stats ? `${stats.sales?.lifetimeCount || 0} orders` : '...',
    },
    {
      title: 'Medicine Performance',
      description: 'Top best-selling medications, high-margin items, and slow-moving inventory alerts.',
      icon: BarChart3,
      path: '/reports/medicines',
      color: 'rose',
      statsLabel: 'Active Medicines',
      statsValue: stats ? `${stats.medicines?.total || 0} drugs` : '...',
    },
    {
      title: 'Customer Retention & CRM',
      description: 'Patient acquisition trends, top spending customers, and repeat dispensing rates.',
      icon: Users,
      path: '/reports/customers',
      color: 'teal',
      statsLabel: 'Registered Patients',
      statsValue: stats ? `${stats.patients?.totalCustomers || 0} patients` : '...',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-600" />
            Executive Reports & Business Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time clinical, financial, inventory valuation, and procurement analytics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadStats}
            isLoading={loading}
            className="text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh Data
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportKPICard
          title="Today's Revenue"
          value={stats ? `₹${stats.sales?.todayRevenue?.toLocaleString('en-IN') || 0}` : '...'}
          subtitle={stats ? `${stats.sales?.todayCount || 0} invoices generated today` : ''}
          icon={Receipt}
          variant="teal"
        />
        <ReportKPICard
          title="Lifetime Revenue"
          value={stats ? `₹${stats.sales?.lifetimeRevenue?.toLocaleString('en-IN') || 0}` : '...'}
          subtitle={stats ? `${stats.sales?.lifetimeCount || 0} completed orders` : ''}
          icon={TrendingUp}
          variant="indigo"
        />
        <ReportKPICard
          title="Inventory Health"
          value={stats ? `${stats.medicines?.total || 0} Medicines` : '...'}
          subtitle={
            stats
              ? `${stats.medicines?.lowStock || 0} low stock • ${stats.medicines?.outOfStock || 0} out`
              : ''
          }
          icon={Package}
          variant={stats?.medicines?.lowStock > 0 ? 'amber' : 'emerald'}
        />
        <ReportKPICard
          title="Clinical Operations"
          value={stats ? `${stats.patients?.totalCustomers || 0} Patients` : '...'}
          subtitle={
            stats
              ? `${stats.patients?.pendingPrescriptions || 0} prescriptions pending review`
              : ''
          }
          icon={Users}
          variant="rose"
        />
      </div>

      {/* Weekly Revenue Trend Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              7-Day Sales Revenue Trend
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Daily revenue breakdown for the past week
            </p>
          </div>
          <Link
            to="/reports/sales"
            className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1"
          >
            <span>Full Sales Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="h-64 w-full">
          {stats?.dailyTrend && stats.dailyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.dailyTrend}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="dayName" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                  labelFormatter={(label) => `Day: ${label}`}
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0D9488"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No sales data recorded in the last 7 days.
            </div>
          )}
        </div>
      </div>

      {/* Reports Directory Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 mb-3">
          Specialized Report Modules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportModules.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.path}
                to={m.path}
                className="group bg-white border border-slate-200 hover:border-teal-500 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="p-2 rounded-lg bg-teal-50 text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-slate-400 group-hover:text-teal-600 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                    {m.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {m.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">{m.statsLabel}</span>
                  <span className="font-semibold text-slate-800">{m.statsValue}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboardPage;
