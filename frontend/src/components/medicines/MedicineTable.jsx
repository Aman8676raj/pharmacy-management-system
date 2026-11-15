import React from 'react';
import { Eye, Edit, Trash2, ShieldAlert, ChevronLeft, ChevronRight, AlertCircle, Pill } from 'lucide-react';
import Badge from '../common/Badge';
import { useAuth } from '../../hooks/useAuth';

export const MedicineTable = ({
  medicines = [],
  pagination = { page: 1, limit: 10, total: 0, totalPages: 1 },
  isLoading = false,
  onPageChange,
  onView,
  onEdit,
  onDeactivate,
}) => {
  const { user } = useAuth();

  const canEdit = user?.role === 'admin' || user?.role === 'pharmacist' || user?.role === 'inventory_manager';
  const canDeactivate = user?.role === 'admin';

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-8 text-center space-y-3">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-teal-600 border-t-transparent" />
          <p className="text-xs text-slate-500 font-medium">Loading medicine records...</p>
        </div>
      </div>
    );
  }

  if (!medicines || medicines.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Pill className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">No medicines found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          No records match your selected filters or search terms. Try adjusting your filter parameters.
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
              <th className="px-4 py-3.5">Category</th>
              <th className="px-4 py-3.5">Form & Strength</th>
              <th className="px-4 py-3.5">SKU / Code</th>
              <th className="px-4 py-3.5">Manufacturer</th>
              <th className="px-4 py-3.5 text-center">Rx Type</th>
              <th className="px-4 py-3.5 text-center">Status</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {medicines.map((med) => {
              const isDeactivated = !med.isActive;

              return (
                <tr
                  key={med.id || med._id}
                  className={`hover:bg-slate-50/70 transition-colors ${
                    isDeactivated ? 'bg-slate-50/50 opacity-75' : ''
                  }`}
                >
                  {/* Medicine Name & Generic */}
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900 leading-snug">
                      {med.name}
                    </div>
                    {med.genericName && (
                      <div className="text-[11px] text-slate-400 font-medium">
                        {med.genericName}
                        {med.brandName && ` • ${med.brandName}`}
                      </div>
                    )}
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3 text-slate-700">
                    <span className="inline-block bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded text-[11px]">
                      {med.category}
                    </span>
                  </td>

                  {/* Dosage Form & Strength */}
                  <td className="px-4 py-3 text-slate-700">
                    <div className="font-medium text-slate-800">{med.dosageForm}</div>
                    <div className="text-[11px] text-slate-500">{med.strength || '-'}</div>
                  </td>

                  {/* SKU */}
                  <td className="px-4 py-3 font-mono font-medium text-slate-600">
                    {med.sku}
                  </td>

                  {/* Manufacturer */}
                  <td className="px-4 py-3 text-slate-600 truncate max-w-[140px]" title={med.manufacturer}>
                    {med.manufacturer || '-'}
                  </td>

                  {/* Rx / OTC Badge */}
                  <td className="px-4 py-3 text-center">
                    {med.requiresPrescription ? (
                      <span className="inline-flex items-center text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        Rx Required
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        OTC
                      </span>
                    )}
                  </td>

                  {/* Active / Inactive Status */}
                  <td className="px-4 py-3 text-center">
                    {med.isActive ? (
                      <Badge variant="success" size="sm" dot>
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="neutral" size="sm" dot>
                        Deactivated
                      </Badge>
                    )}
                  </td>

                  {/* Action Buttons */}
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center justify-end gap-1">
                      {/* View details */}
                      <button
                        type="button"
                        onClick={() => onView(med)}
                        title="View Medicine Details"
                        className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Edit (Admin, Pharmacist, Inventory Manager) */}
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(med)}
                          title="Edit Medicine"
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}

                      {/* Deactivate (Admin only) */}
                      {canDeactivate && med.isActive && (
                        <button
                          type="button"
                          onClick={() => onDeactivate(med)}
                          title="Deactivate Medicine"
                          className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
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
          <span className="font-semibold text-slate-800">{pagination.total}</span> medicines
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

export default MedicineTable;

