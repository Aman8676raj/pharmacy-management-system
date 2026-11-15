import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../common/Badge';
import { Eye, Edit, ChevronLeft, ChevronRight, Phone, Mail, MapPin } from 'lucide-react';

export const CustomerTable = ({
  customers = [],
  pagination = {},
  onPageChange,
  onToggleStatus,
  loading = false,
  canEdit = false,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent" />
        <p className="mt-2 text-xs text-slate-500">Loading customers...</p>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3 text-lg font-bold">
          👥
        </div>
        <h3 className="text-sm font-semibold text-slate-800">No Customers Found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          No customer records match your filter criteria. Add a customer to build your pharmacy patient directory.
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
              <th className="px-4 py-3">Customer Code</th>
              <th className="px-4 py-3">Patient Name</th>
              <th className="px-4 py-3">Phone &amp; Contact</th>
              <th className="px-4 py-3">City / Address</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((c) => {
              const custId = c._id || c.id;
              return (
                <tr key={custId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      to={`/customers/${custId}`}
                      className="font-bold text-teal-700 hover:text-teal-900 font-mono hover:underline"
                    >
                      {c.customerCode}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{c.name}</div>
                    {c.gender && c.gender !== 'prefer_not_to_say' && (
                      <span className="text-[10px] text-slate-400 capitalize">{c.gender}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{c.phone}</span>
                    </div>
                    {c.email && (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-300" />
                        <span>{c.email}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="font-medium text-slate-800">{c.city || 'Local'}</span>
                    </div>
                    {c.address && (
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                        {c.address}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    {c.isActive ? (
                      <Badge variant="success" size="sm" dot>
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="danger" size="sm" dot>
                        Inactive
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {new Date(c.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/customers/${custId}`}
                        title="View Patient Details"
                        className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      {canEdit && (
                        <Link
                          to={`/customers/${custId}/edit`}
                          title="Edit Customer"
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
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
