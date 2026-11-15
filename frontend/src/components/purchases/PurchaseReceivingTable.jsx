import React from 'react';
import { Link } from 'react-router-dom';
import { PackageCheck, Calendar, FileText, UserCheck, ArrowRight } from 'lucide-react';

export default function PurchaseReceivingTable({ receivingHistory = [] }) {
  if (!receivingHistory || receivingHistory.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
        <PackageCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p>No delivery receipts recorded yet for this purchase order.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {receivingHistory.map((rec, i) => (
        <div
          key={rec._id || i}
          className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <PackageCheck className="w-4 h-4 text-teal-600" />
                Delivery Event #{receivingHistory.length - i}
              </span>
              <span>•</span>
              <span className="text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {rec.receivedAt ? new Date(rec.receivedAt).toLocaleString() : 'N/A'}
              </span>
              {rec.supplierInvoiceNumber && (
                <>
                  <span>•</span>
                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                    Inv: {rec.supplierInvoiceNumber}
                  </span>
                </>
              )}
            </div>

            {rec.receivedBy && (
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                Received by: <strong className="text-slate-700">{rec.receivedBy.name}</strong>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase">
                  <th className="py-2.5 px-4">Medicine</th>
                  <th className="py-2.5 px-4">Batch Lot Number</th>
                  <th className="py-2.5 px-4 text-center">Expiry Date</th>
                  <th className="py-2.5 px-4 text-right">Qty Received</th>
                  <th className="py-2.5 px-4 text-right">Cost Price ($)</th>
                  <th className="py-2.5 px-4 text-right">Selling Price ($)</th>
                  <th className="py-2.5 px-4 text-right">Batch Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rec.items?.map((item, itemIdx) => (
                  <tr key={itemIdx} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-4 font-semibold text-slate-800">
                      {item.medicineName || 'Medicine'}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-700">
                      <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {item.batchNumber}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center text-slate-600">
                      {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-teal-700">
                      +{item.quantityReceived}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-700">
                      ${item.purchasePrice?.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-emerald-700 font-semibold">
                      ${item.sellingPrice?.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      {item.batchId ? (
                        <Link
                          to={`/inventory/batches/${item.batchId}`}
                          className="font-medium text-teal-600 hover:text-teal-800 hover:underline inline-flex items-center gap-1"
                        >
                          View Batch &rarr;
                        </Link>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rec.notes && (
            <div className="p-3 bg-slate-50/50 border-t border-slate-100 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-600">Notes:</span> {rec.notes}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
