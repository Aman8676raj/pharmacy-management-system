import React from 'react';
import { Link } from 'react-router-dom';
import { SAMPLE_DASHBOARD_DATA } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import { SaleStatusBadge } from '../sales/SaleStatusBadge';
import { ArrowRight } from 'lucide-react';

export const RecentTransactionsTable = ({ liveSales = null }) => {
  const hasLiveSales = Array.isArray(liveSales) && liveSales.length > 0;
  const sampleTransactions = SAMPLE_DASHBOARD_DATA.recentTransactions;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-slate-900">
            Recent Billing Transactions
          </h3>
        </div>
        <Link
          to="/sales"
          className="text-xs text-teal-700 hover:text-teal-900 font-medium flex items-center gap-1"
        >
          <span>View All Sales</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
            <tr>
              <th className="px-5 py-3">Invoice #</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Items</th>
              <th className="px-5 py-3">Payment</th>
              <th className="px-5 py-3">Amount (₹)</th>
              <th className="px-5 py-3">Time</th>
              <th className="px-5 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {hasLiveSales ? (
              liveSales.map((sale) => (
                <tr key={sale._id || sale.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3 font-semibold text-teal-700 font-mono">
                    <Link to={`/sales/${sale._id || sale.id}`} className="hover:underline">
                      {sale.invoiceNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-700 font-medium">
                    {sale.customerSnapshot?.name || 'Walk-in Customer'}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {sale.items?.length || 0} meds
                  </td>
                  <td className="px-5 py-3 text-slate-600 uppercase font-medium">
                    {sale.paymentMethod || 'cash'}
                  </td>
                  <td className="px-5 py-3 font-semibold text-slate-900">
                    ₹{Number(sale.totalAmount || 0).toFixed(2)}
                  </td>
                  <td className="px-5 py-3 text-slate-400">
                    {new Date(sale.createdAt).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <SaleStatusBadge status={sale.paymentStatus} type="payment" size="sm" />
                  </td>
                </tr>
              ))
            ) : (
              sampleTransactions.map((tx) => (
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
                    <SaleStatusBadge status="paid" type="payment" size="sm" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTransactionsTable;
