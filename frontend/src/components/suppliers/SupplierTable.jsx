import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit2, ShieldAlert, CheckCircle2, Phone, Mail, Building2 } from 'lucide-react';
import Badge from '../common/Badge';

export default function SupplierTable({
  suppliers = [],
  loading = false,
  canManage = false,
  onDeactivate,
  onActivate,
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Loading suppliers directory...</p>
      </div>
    );
  }

  if (!suppliers || suppliers.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
        <Building2 className="w-10 h-10 mx-auto mb-3 text-slate-300" />
        <p className="text-sm font-medium text-slate-700">No suppliers found</p>
        <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or register a new vendor.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-3.5 px-4">Code</th>
              <th className="py-3.5 px-4">Supplier Name</th>
              <th className="py-3.5 px-4">Contact Person</th>
              <th className="py-3.5 px-4">Phone &amp; Email</th>
              <th className="py-3.5 px-4">City</th>
              <th className="py-3.5 px-4">GST Number</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {suppliers.map((sup) => (
              <tr key={sup._id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {sup.supplierCode}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <Link
                    to={`/suppliers/${sup._id}`}
                    className="font-semibold text-slate-900 hover:text-teal-600 hover:underline block"
                  >
                    {sup.name}
                  </Link>
                  {sup.drugLicenseNumber && (
                    <span className="text-[11px] text-slate-400 font-mono">
                      DL: {sup.drugLicenseNumber}
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-xs text-slate-700">
                  {sup.contactPerson || <span className="text-slate-400 italic">—</span>}
                </td>
                <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-slate-800">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sup.phone}</span>
                  </div>
                  {sup.email && (
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{sup.email}</span>
                    </div>
                  )}
                </td>
                <td className="py-3.5 px-4 text-xs text-slate-700 whitespace-nowrap">
                  {sup.city || '—'}
                </td>
                <td className="py-3.5 px-4 text-xs font-mono text-slate-600 whitespace-nowrap">
                  {sup.gstNumber || <span className="text-slate-400">—</span>}
                </td>
                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                  <Badge variant={sup.isActive ? 'success' : 'neutral'} size="sm" dot>
                    {sup.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      to={`/suppliers/${sup._id}`}
                      className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="View Details & Purchases"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    {canManage && (
                      <>
                        <Link
                          to={`/suppliers/${sup._id}/edit`}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Supplier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>

                        {sup.isActive ? (
                          <button
                            type="button"
                            onClick={() => onDeactivate && onDeactivate(sup)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Deactivate Supplier"
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onActivate && onActivate(sup)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Activate Supplier"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

