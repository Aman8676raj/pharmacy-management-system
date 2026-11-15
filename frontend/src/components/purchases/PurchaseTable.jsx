import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit2, PackageCheck, ShoppingCart, Calendar, Building2 } from 'lucide-react';
import PurchaseStatusBadge from './PurchaseStatusBadge';

export default function PurchaseTable({
  purchaseOrders = [],
  loading = false,
  canManage = false,
  onReceiveStock,
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Loading purchase orders...</p>
      </div>
    );
  }

  if (!purchaseOrders || purchaseOrders.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
        <ShoppingCart className="w-10 h-10 mx-auto mb-3 text-slate-300" />
        <p className="text-sm font-medium text-slate-700">No purchase orders found</p>
        <p className="text-xs text-slate-400 mt-1">Create a purchase order to initiate procurement with suppliers.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-3.5 px-4">PO Number</th>
              <th className="py-3.5 px-4">Supplier</th>
              <th className="py-3.5 px-4">Order Date</th>
              <th className="py-3.5 px-4">Expected Delivery</th>
              <th className="py-3.5 px-4 text-right">Total Amount</th>
              <th className="py-3.5 px-4">Receipt Progress</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {purchaseOrders.map((po) => {
              const totalOrdered = po.items?.reduce((acc, it) => acc + (it.orderedQuantity || 0), 0) || 0;
              const totalReceived = po.items?.reduce((acc, it) => acc + (it.receivedQuantity || 0), 0) || 0;
              const percent = totalOrdered > 0 ? Math.min(100, Math.round((totalReceived / totalOrdered) * 100)) : 0;

              const isReceivable =
                canManage && (po.status === 'ordered' || po.status === 'partially_received');

              return (
                <tr key={po._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <Link
                      to={`/purchases/${po._id}`}
                      className="font-mono text-xs font-bold text-teal-600 hover:text-teal-800 hover:underline bg-slate-100 px-2 py-1 rounded border border-slate-200 inline-block"
                    >
                      {po.purchaseOrderNumber}
                    </Link>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">
                      {po.supplier?.name || 'Unknown Supplier'}
                    </div>
                    {po.supplier?.supplierCode && (
                      <span className="text-[11px] text-slate-400 font-mono">
                        {po.supplier.supplierCode}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                    {po.orderDate ? new Date(po.orderDate).toLocaleDateString() : 'N/A'}
                  </td>

                  <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                    {po.expectedDeliveryDate ? (
                      <span className="flex items-center gap-1 text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(po.expectedDeliveryDate).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Not set</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                    ${po.totalAmount?.toFixed(2)}
                  </td>

                  <td className="py-3.5 px-4 min-w-[140px]">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span>
                        <strong className="text-slate-800 font-semibold">{totalReceived}</strong> / {totalOrdered}
                      </span>
                      <span className="font-mono">{percent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          percent === 100
                            ? 'bg-emerald-500'
                            : percent > 0
                            ? 'bg-amber-500'
                            : 'bg-slate-300'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <PurchaseStatusBadge status={po.status} />
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/purchases/${po._id}`}
                        className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      {canManage && po.status === 'draft' && (
                        <Link
                          to={`/purchases/${po._id}/edit`}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Draft Order"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                      )}

                      {isReceivable && (
                        <button
                          type="button"
                          onClick={() => onReceiveStock && onReceiveStock(po)}
                          className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors border border-teal-200"
                          title="Receive Stock Delivery"
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          Receive
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
    </div>
  );
}

