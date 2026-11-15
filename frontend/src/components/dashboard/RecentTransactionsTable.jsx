import React from 'react';
import { SAMPLE_DASHBOARD_DATA } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import Badge from '../common/Badge';

export const RecentTransactionsTable = () => {
  const transactions = SAMPLE_DASHBOARD_DATA.recentTransactions;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-slate-900">
            Recent Billing Transactions
          </h3>
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
            Sample Data
          </span>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Latest {transactions.length} sales
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
            <tr>
              <th className="px-5 py-3">Invoice #</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Items</th>
              <th className="px-5 py-3">Payment</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Time</th>
              <th className="px-5 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-5 py-3 font-semibold text-slate-800 font-mono">
                  {tx.id}
                </td>
                <td className="px-5 py-3 text-slate-700 font-medium">{tx.customer}</td>
                <td className="px-5 py-3 text-slate-500">{tx.itemsCount} meds</td>
                <td className="px-5 py-3 text-slate-600">{tx.paymentMethod}</td>
                <td className="px-5 py-3 font-semibold text-slate-900">
                  {formatCurrency(tx.amount)}
                </td>
                <td className="px-5 py-3 text-slate-400">{tx.time}</td>
                <td className="px-5 py-3 text-right">
                  <Badge variant="success" size="sm" dot>
                    {tx.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTransactionsTable;

