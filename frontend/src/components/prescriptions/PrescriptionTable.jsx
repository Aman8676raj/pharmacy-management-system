import React from 'react';
import { Link } from 'react-router-dom';
import { PrescriptionStatusBadge } from './PrescriptionStatusBadge';
import { Eye, CheckCircle2, ChevronLeft, ChevronRight, User, Stethoscope } from 'lucide-react';

export const PrescriptionTable = ({
  prescriptions = [],
  pagination = {},
  onPageChange,
  onVerify,
  canVerify = false,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent" />
        <p className="mt-2 text-xs text-slate-500">Loading prescriptions...</p>
      </div>
    );
  }

  if (prescriptions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3 text-lg font-bold">
          📋
        </div>
        <h3 className="text-sm font-semibold text-slate-800">No Prescriptions Found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          No medical prescriptions match your filters. Upload or record a prescription to begin pharmacist verification.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Prescription #</th>
              <th className="px-4 py-3">Customer / Patient</th>
              <th className="px-4 py-3">Prescribing Doctor</th>
              <th className="px-4 py-3">Issue Date</th>
              <th className="px-4 py-3">Medicines</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {prescriptions.map((rx) => {
              const rxId = rx._id || rx.id;
              const isPending = rx.status === 'pending';

              return (
                <tr key={rxId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      to={`/prescriptions/${rxId}`}
                      className="font-bold text-teal-700 hover:text-teal-900 font-mono hover:underline"
                    >
                      {rx.prescriptionNumber}
                    </Link>
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>{rx.customer?.name || 'Customer'}</span>
                    </div>
                    {rx.customer?.phone && (
                      <div className="text-[10px] text-slate-400 pl-4">{rx.customer.phone}</div>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800 flex items-center gap-1">
                      <Stethoscope className="w-3 h-3 text-slate-400" />
                      <span>{rx.doctorName}</span>
                    </div>
                    {rx.doctorRegistrationNumber && (
                      <div className="text-[10px] text-slate-400 pl-4">Reg: {rx.doctorRegistrationNumber}</div>
                    )}
                  </td>

                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {new Date(rx.issueDate).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>

                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    <span className="font-semibold text-slate-800">
                      {rx.prescriptionItems?.length || 0}
                    </span>{' '}
                    {(rx.prescriptionItems?.length || 0) === 1 ? 'med' : 'meds'}
                  </td>

                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <PrescriptionStatusBadge status={rx.status} size="sm" />
                  </td>

                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        to={`/prescriptions/${rxId}`}
                        title="View Prescription"
                        className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      {canVerify && isPending && (
                        <button
                          type="button"
                          onClick={() => onVerify(rx)}
                          title="Review & Verify Prescription"
                          className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-md transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
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
      {pagination && pagination.totalPages > 1 && (
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Page <span className="font-semibold">{pagination.page}</span> of{' '}
            <span className="font-semibold">{pagination.totalPages}</span> ({pagination.total} total)
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={!pagination.hasPrevPage}
              onClick={() => onPageChange(pagination.page - 1)}
              className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={!pagination.hasNextPage}
              onClick={() => onPageChange(pagination.page + 1)}
              className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
