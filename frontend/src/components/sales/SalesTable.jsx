import React from 'react';
import { Link } from 'react-router-dom';
import { SaleStatusBadge } from './SaleStatusBadge';
import { Eye, FileDown, CreditCard, Ban, ChevronLeft, ChevronRight } from 'lucide-react';

export const SalesTable = ({
  sales = [],
  pagination = {},
  onPageChange,
  onDownloadPDF,
  onRecordPayment,
  onCancelSale,
  isAdmin = false,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent" />
        <p className="mt-2 text-xs text-slate-500">Loading sales records...</p>
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
          🧾
        </div>
        <h3 className="text-sm font-semibold text-slate-800">No Sales Records Found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          No transactions match your search filters or date range. Process a sale in the POS terminal to see it here.
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
              <th className="px-4 py-3">Invoice #</th>
              <th className="px-4 py-3">Date & Time</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3 text-right">Total (₹)</th>
              <th className="px-4 py-3 text-right">Paid (₹)</th>
              <th className="px-4 py-3 text-right">Balance (₹)</th>
              <th className="px-4 py-3 text-center">Payment</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3">Dispensed By</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sales.map((sale) => {
              const saleId = sale._id || sale.id;
              const isCancelled = sale.saleStatus === 'cancelled';
              const hasBalance = sale.balanceAmount > 0 && !isCancelled;

              return (
                <tr
                  key={saleId}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isCancelled ? 'bg-rose-50/20' : ''
                  }`}
                >
                  {/* Invoice # */}
                  <td className="px-4 py-3">
                    <Link
                      to={`/sales/${saleId}`}
                      className="font-bold text-teal-700 hover:text-teal-900 hover:underline"
                    >
                      {sale.invoiceNumber}
                    </Link>
                  </td>

                  {/* Date & Time */}
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {new Date(sale.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                    <div className="text-[10px] text-slate-400">
                      {new Date(sale.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 truncate max-w-[140px]">
                      {sale.customerSnapshot?.name || 'Walk-in Customer'}
                    </div>
                    {sale.customerSnapshot?.phone && (
                      <div className="text-[10px] text-slate-400">
                        {sale.customerSnapshot.phone}
                      </div>
                    )}
                  </td>

                  {/* Items */}
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    <span className="font-medium text-slate-800">
                      {sale.items?.length || 0}
                    </span>{' '}
                    {(sale.items?.length || 0) === 1 ? 'item' : 'items'}
                  </td>

                  {/* Total */}
                  <td className="px-4 py-3 text-right font-bold text-slate-900 whitespace-nowrap">
                    ₹{Number(sale.totalAmount || 0).toFixed(2)}
                  </td>

                  {/* Paid */}
                  <td className="px-4 py-3 text-right text-emerald-700 font-medium whitespace-nowrap">
                    ₹{Number(sale.amountPaid || 0).toFixed(2)}
                  </td>

                  {/* Balance */}
                  <td className="px-4 py-3 text-right whitespace-nowrap font-medium">
                    {sale.balanceAmount > 0 ? (
                      <span className="text-amber-700 font-semibold">
                        ₹{Number(sale.balanceAmount).toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-slate-400">₹0.00</span>
                    )}
                  </td>

                  {/* Payment Status */}
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <SaleStatusBadge status={sale.paymentStatus} type="payment" size="sm" />
                  </td>

                  {/* Sale Status */}
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <SaleStatusBadge status={sale.saleStatus} type="sale" size="sm" />
                  </td>

                  {/* Staff */}
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {sale.soldBy?.name || 'Staff'}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      {/* View Details */}
                      <Link
                        to={`/sales/${saleId}`}
                        title="View Sale Details"
                        className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      {/* Download PDF */}
                      <button
                        type="button"
                        onClick={() => onDownloadPDF(saleId, sale.invoiceNumber)}
                        title="Download Tax Invoice PDF"
                        className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>

                      {/* Record Subsequent Payment */}
                      {hasBalance && (
                        <button
                          type="button"
                          onClick={() => onRecordPayment(sale)}
                          title="Record Balance Payment"
                          className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-md transition-colors"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                      )}

                      {/* Cancel Sale (Admin only) */}
                      {isAdmin && !isCancelled && (
                        <button
                          type="button"
                          onClick={() => onCancelSale(sale)}
                          title="Cancel Sale & Restore Stock"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        >
                          <Ban className="w-4 h-4" />
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
            Showing page <span className="font-semibold">{pagination.page}</span> of{' '}
            <span className="font-semibold">{pagination.totalPages}</span> (
            {pagination.total} total sales)
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

