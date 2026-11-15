import React from 'react';
import { Eye, Edit3, ShieldAlert, ShieldCheck, ChevronLeft, ChevronRight, Boxes } from 'lucide-react';
import BatchStatusBadge from './BatchStatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

export const StockTable = ({
  batches = [],
  pagination = { page: 1, limit: 10, total: 0, totalPages: 1 },
  isLoading = false,
  onPageChange,
  onView,
  onAdjust,
  onQuarantine,
  onRelease,
}) => {
  const { user } = useAuth();

  const canManage = user?.role === 'admin' || user?.role === 'inventory_manager';

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-12 text-center space-y-3">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-teal-600 border-t-transparent" />
          <p className="text-xs text-slate-500 font-medium">Loading inventory batches...</p>
        </div>
      </div>
    );
  }

  if (!batches || batches.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Boxes className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">No batch records found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          No stock batches match your current search or filter criteria.
        </p>
      </div>
    );
  }

  const startRecord = (pagination.page - 1) * pagination.limit + 1;
  const endRecord = Math.min(pagination.total, pagination.page * pagination.limit);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
            <tr>
              <th className="px-4 py-3.5">Medicine & Generic</th>
              <th className="px-4 py-3.5 font-mono">SKU</th>
              <th className="px-4 py-3.5 font-mono">Batch #</th>
              <th className="px-4 py-3.5 text-right">Available Qty</th>
              <th className="px-4 py-3.5 text-right">Cost Price</th>
              <th className="px-4 py-3.5 text-right">Retail Price</th>
              <th className="px-4 py-3.5">Expiry Date</th>
              <th className="px-4 py-3.5 text-center">Stock Status</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {batches.map((b) => {
              const med = b.medicine || {};
              const isExpired = new Date(b.expiryDate) < new Date();
              const isQuarantined = b.status === 'quarantined';

              return (
                <tr
                  key={b.id || b._id}
                  className={`hover:bg-slate-50/70 transition-colors ${
                    isQuarantined
                      ? 'bg-amber-50/30'
                      : isExpired
                      ? 'bg-rose-50/30'
                      : b.availableQuantity === 0
                      ? 'opacity-60 bg-slate-50/40'
                      : ''
                  }`}
                >
                  {/* Medicine Name & Generic */}
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900 leading-snug">
                      {med.name || 'Unknown Medicine'}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      {med.genericName || med.category || '-'}
                    </div>
                  </td>

                  {/* SKU */}
                  <td className="px-4 py-3 font-mono font-medium text-slate-600">
                    {med.sku || '-'}
                  </td>

                  {/* Batch Number */}
                  <td className="px-4 py-3 font-mono font-semibold text-slate-800">
                    {b.batchNumber}
                  </td>

                  {/* Available Quantity */}
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`font-bold ${
                        b.availableQuantity === 0
                          ? 'text-slate-400'
                          : b.availableQuantity <= (med.minimumStock || 10)
                          ? 'text-amber-600'
                          : 'text-slate-900'
                      }`}
                    >
                      {b.availableQuantity.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1">
                      {med.unit || 'units'}
                    </span>
                  </td>

                  {/* Purchase Price */}
                  <td className="px-4 py-3 text-right text-slate-600">
                    {formatCurrency(b.purchasePrice)}
                  </td>

                  {/* Selling Price */}
                  <td className="px-4 py-3 text-right font-medium text-slate-900">
                    {formatCurrency(b.sellingPrice)}
                  </td>

                  {/* Expiry Date */}
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{formatDate(b.expiryDate)}</div>
                    {isExpired ? (
                      <span className="text-[10px] text-rose-600 font-semibold">Expired</span>
                    ) : (
                      <span className="text-[10px] text-slate-400">
                        {Math.ceil((new Date(b.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))} days left
                      </span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="px-4 py-3 text-center">
                    <BatchStatusBadge status={b.status} />
                  </td>

                  {/* Action Buttons */}
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center justify-end gap-1">
                      {/* View batch details */}
                      <button
                        type="button"
                        onClick={() => onView(b)}
                        title="View Batch Profile & History"
                        className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Stock Adjustment (Admin & Inventory Manager) */}
                      {canManage && !isQuarantined && (
                        <button
                          type="button"
                          onClick={() => onAdjust(b)}
                          title="Adjust Batch Stock"
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}

                      {/* Quarantine / Release (Admin & Inventory Manager) */}
                      {canManage && !isQuarantined && (
                        <button
                          type="button"
                          onClick={() => onQuarantine(b)}
                          title="Quarantine Batch"
                          className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-md transition-colors"
                        >
                          <ShieldAlert className="w-4 h-4" />
                        </button>
                      )}

                      {canManage && isQuarantined && (
                        <button
                          type="button"
                          onClick={() => onRelease(b)}
                          title="Release from Quarantine"
                          className="p-1.5 text-amber-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-white">
        <div>
          Showing <span className="font-semibold text-slate-800">{startRecord}</span> to{' '}
          <span className="font-semibold text-slate-800">{endRecord}</span> of{' '}
          <span className="font-semibold text-slate-800">{pagination.total}</span> batches
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 font-medium text-slate-700">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => onPageChange(pagination.page + 1)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockTable;

