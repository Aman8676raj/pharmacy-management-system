import React from 'react';
import { Link } from 'react-router-dom';
import { History, ArrowUpRight, ArrowDownLeft, Sliders, ShieldAlert, ShieldCheck } from 'lucide-react';
import { TRANSACTION_TYPE_CONFIGS } from '../../utils/constants';

export default function TransactionTable({ transactions = [], loading = false, emptyMessage = 'No inventory transactions recorded.' }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Loading transaction logs...</p>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
        <History className="w-10 h-10 mx-auto mb-3 text-slate-300" />
        <p className="text-sm font-medium text-slate-700">{emptyMessage}</p>
        <p className="text-xs text-slate-400 mt-1">Audit logs will appear here whenever stock is received, adjusted, or held.</p>
      </div>
    );
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'stock_in':
      case 'return_in':
      case 'adjustment_in':
        return <ArrowUpRight className="w-3.5 h-3.5" />;
      case 'stock_out':
      case 'adjustment_out':
        return <ArrowDownLeft className="w-3.5 h-3.5" />;
      case 'quarantine':
        return <ShieldAlert className="w-3.5 h-3.5" />;
      case 'release':
        return <ShieldCheck className="w-3.5 h-3.5" />;
      default:
        return <Sliders className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-3.5 px-4">Date / Time</th>
              <th className="py-3.5 px-4">Medicine</th>
              <th className="py-3.5 px-4">Batch Number</th>
              <th className="py-3.5 px-4">Type</th>
              <th className="py-3.5 px-4 text-right">Quantity</th>
              <th className="py-3.5 px-4 text-center">Qty Change</th>
              <th className="py-3.5 px-4">Reason / Notes</th>
              <th className="py-3.5 px-4">Performed By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {transactions.map((tx) => {
              const typeConfig = TRANSACTION_TYPE_CONFIGS[tx.transactionType] || {
                label: tx.transactionType,
                color: 'text-slate-700 bg-slate-50 border-slate-200',
                sign: '',
              };

              const formattedDate = tx.createdAt
                ? new Date(tx.createdAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'N/A';

              const medicineName = tx.medicine?.name || (typeof tx.medicine === 'string' ? tx.medicine : '—');
              const medicineSku = tx.medicine?.sku || '';
              const batchNum = tx.batch?.batchNumber || (typeof tx.batch === 'string' ? tx.batch : '—');
              const batchId = tx.batch?._id || tx.batch;
              const userName = tx.performedBy?.fullName || tx.performedBy?.name || 'System / Staff';
              const userRole = tx.performedBy?.role ? tx.performedBy.role.replace('_', ' ') : '';

              return (
                <tr key={tx._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500">
                    {formattedDate}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-800">{medicineName}</div>
                    {medicineSku && (
                      <div className="text-xs text-slate-400 font-mono">{medicineSku}</div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {batchId ? (
                      <Link
                        to={`/inventory/batches/${batchId}`}
                        className="font-mono text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline bg-slate-100 px-2 py-0.5 rounded border border-slate-200"
                      >
                        {batchNum}
                      </Link>
                    ) : (
                      <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {batchNum}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${typeConfig.color}`}
                    >
                      {getTypeIcon(tx.transactionType)}
                      {typeConfig.label}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold whitespace-nowrap">
                    <span
                      className={
                        typeConfig.sign === '+'
                          ? 'text-emerald-600'
                          : typeConfig.sign === '-'
                          ? 'text-rose-600'
                          : 'text-slate-700'
                      }
                    >
                      {typeConfig.sign !== '!' && typeConfig.sign !== '✓' ? typeConfig.sign : ''}
                      {tx.quantity}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap text-xs">
                    {tx.previousQuantity !== undefined && tx.newQuantity !== undefined ? (
                      <div className="flex items-center justify-center gap-1 font-mono text-slate-600">
                        <span>{tx.previousQuantity}</span>
                        <span className="text-slate-400">&rarr;</span>
                        <span className="font-semibold text-slate-800">{tx.newQuantity}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs truncate" title={tx.reason || ''}>
                    {tx.reason || <span className="text-slate-400 italic">None provided</span>}
                    {tx.reference && (
                      <span className="block text-[11px] text-slate-400 font-mono mt-0.5">
                        Ref: {tx.reference}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="text-xs font-medium text-slate-800">{userName}</div>
                    {userRole && (
                      <div className="text-[10px] text-slate-400 capitalize">{userRole}</div>
                    )}
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

