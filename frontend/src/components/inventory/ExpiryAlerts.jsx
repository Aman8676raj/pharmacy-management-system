import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Clock, Calendar, ChevronRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import Badge from '../common/Badge';

export default function ExpiryAlerts({ batches = [], loading = false, onThresholdChange, threshold = 90 }) {
  const [filterUrgency, setFilterUrgency] = useState('all'); // 'all', 'critical' (<30d), 'warning' (<90d), 'expired'

  const filteredBatches = batches.filter((batch) => {
    const days = batch.daysRemaining ?? batch.daysLeft ?? 0;
    if (filterUrgency === 'expired') {
      return days <= 0;
    }
    if (filterUrgency === 'critical') {
      return days > 0 && days <= 30;
    }
    if (filterUrgency === 'warning') {
      return days > 30 && days <= 90;
    }
    return true;
  });

  const getUrgencyConfig = (days) => {
    if (days <= 0) {
      return {
        badge: 'Expired',
        badgeVariant: 'danger',
        bg: 'bg-rose-50/70 border-rose-200',
        text: 'text-rose-700',
        icon: ShieldAlert,
      };
    }
    if (days <= 30) {
      return {
        badge: `${days}d left (Urgent)`,
        badgeVariant: 'danger',
        bg: 'bg-rose-50/50 border-rose-200',
        text: 'text-rose-600',
        icon: AlertTriangle,
      };
    }
    if (days <= 60) {
      return {
        badge: `${days}d left`,
        badgeVariant: 'warning',
        bg: 'bg-amber-50/50 border-amber-200',
        text: 'text-amber-700',
        icon: Clock,
      };
    }
    return {
      badge: `${days}d left`,
      badgeVariant: 'info',
      bg: 'bg-blue-50/40 border-blue-100',
      text: 'text-blue-700',
      icon: Clock,
    };
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800">Expiry Watch & Alerts</h3>
            <p className="text-xs text-slate-500">Batches expiring within threshold monitoring</p>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => setFilterUrgency('all')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filterUrgency === 'all'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({batches.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterUrgency('critical')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filterUrgency === 'critical'
                ? 'bg-white text-rose-600 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-rose-600'
            }`}
          >
            &lt; 30 Days
          </button>
          <button
            type="button"
            onClick={() => setFilterUrgency('expired')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filterUrgency === 'expired'
                ? 'bg-white text-slate-800 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Expired
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400">Loading expiry records...</div>
        ) : filteredBatches.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-700">No batches match this expiry criteria</p>
            <p className="text-xs text-slate-400 mt-1">All batches are safe within the selected threshold.</p>
          </div>
        ) : (
          filteredBatches.map((batch) => {
            const days = batch.daysRemaining ?? batch.daysLeft ?? 0;
            const config = getUrgencyConfig(days);
            const Icon = config.icon;
            const medName = batch.medicine?.name || 'Unknown Medicine';
            const medSku = batch.medicine?.sku || '';
            const expiryFormatted = batch.expiryDate
              ? new Date(batch.expiryDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'N/A';

            return (
              <div
                key={batch._id}
                className="p-3.5 sm:p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`p-2 rounded-lg border mt-0.5 shrink-0 ${config.bg}`}>
                    <Icon className={`w-4 h-4 ${config.text}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={`/inventory/batches/${batch._id}`}
                        className="text-sm font-semibold text-slate-800 hover:text-teal-600 truncate"
                      >
                        {medName}
                      </Link>
                      <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                        {batch.batchNumber}
                      </span>
                      {medSku && <span className="text-xs text-slate-400">({medSku})</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Expires: {expiryFormatted}
                      </span>
                      <span>•</span>
                      <span>
                        Units available:{' '}
                        <strong className="text-slate-700 font-semibold">{batch.availableQuantity}</strong>
                      </span>
                      {batch.status === 'quarantined' && (
                        <Badge variant="warning" size="sm">
                          Quarantined
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={config.badgeVariant} size="sm">
                    {config.badge}
                  </Badge>
                  <Link
                    to={`/inventory/batches/${batch._id}`}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    title="View Batch Details"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer link */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
        <Link
          to="/inventory/stock"
          className="text-xs font-medium text-teal-600 hover:text-teal-700 hover:underline"
        >
          View Full Stock Inventory &rarr;
        </Link>
      </div>
    </div>
  );
}
