import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import salesService from '../../services/salesService';
import { SalesTable } from '../../components/sales/SalesTable';
import { PaymentModal } from '../../components/sales/PaymentModal';
import { CancelSaleModal } from '../../components/sales/CancelSaleModal';
import { Button } from '../../components/common/Button';
import {
  Receipt,
  Search,
  RotateCcw,
  IndianRupee,
  Clock,
  AlertCircle,
  FileCheck,
  PlusCircle,
  Filter,
} from 'lucide-react';

export const SalesListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Data states
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [saleStatus, setSaleStatus] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState('all');
  const [page, setPage] = useState(1);

  // Modals state
  const [activeSaleForPayment, setActiveSaleForPayment] = useState(null);
  const [activeSaleForCancel, setActiveSaleForCancel] = useState(null);

  // Fetch sales & stats
  const fetchSalesData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        search: search.trim() || undefined,
        paymentStatus: paymentStatus !== 'all' ? paymentStatus : undefined,
        saleStatus: saleStatus !== 'all' ? saleStatus : undefined,
        paymentMethod: paymentMethod !== 'all' ? paymentMethod : undefined,
      };

      const [salesRes, statsRes] = await Promise.all([
        salesService.getSales(params),
        salesService.getSaleStats(),
      ]);

      setSales(salesRes.data?.sales || []);
      setPagination(salesRes.data?.pagination || {});
      setStats(statsRes.data || null);
    } catch (err) {
      console.error('Failed to fetch sales data:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, paymentStatus, saleStatus, paymentMethod]);

  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  // Handle PDF download
  const handleDownloadPDF = async (saleId, invoiceNumber) => {
    try {
      await salesService.downloadInvoicePDF(saleId, invoiceNumber);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to download invoice PDF');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setPaymentStatus('all');
    setSaleStatus('all');
    setPaymentMethod('all');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Launch POS CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 text-teal-600" />
            Sales & Point of Sale (POS)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage customer bills, track payment balances, print tax invoices, and dispense medicines
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate('/sales/pos')}
          className="bg-teal-600 hover:bg-teal-700 text-white shadow-xs font-semibold"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Open POS Terminal
        </Button>
      </div>

      {/* Summary KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Today's Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900">
            ₹{Number(stats?.today?.revenue || 0).toFixed(2)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {stats?.today?.count || 0} bills completed today
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900">
            ₹{Number(stats?.overall?.totalRevenue || 0).toFixed(2)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {stats?.overall?.totalSales || 0} total invoices
          </div>
        </div>

        {/* Total Collected */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Amount Collected</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-emerald-700">
            ₹{Number(stats?.overall?.totalAmountPaid || 0).toFixed(2)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {stats?.statusCounts?.paid || 0} fully settled bills
          </div>
        </div>

        {/* Outstanding Balance */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Outstanding Balance</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-amber-800">
            ₹{Number(stats?.overall?.totalBalanceDue || 0).toFixed(2)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {(stats?.statusCounts?.partially_paid || 0) + (stats?.statusCounts?.unpaid || 0)} pending payments
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by invoice #, customer name, phone, doctor Rx..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          {/* Payment Status Filter */}
          <select
            value={paymentStatus}
            onChange={(e) => {
              setPaymentStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 font-medium focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
          >
            <option value="all">All Payment Statuses</option>
            <option value="paid">Paid</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>

          {/* Sale Status Filter */}
          <select
            value={saleStatus}
            onChange={(e) => {
              setSaleStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 font-medium focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
          >
            <option value="all">All Sale Statuses</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Payment Method Filter */}
          <select
            value={paymentMethod}
            onChange={(e) => {
              setPaymentMethod(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 font-medium focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
          >
            <option value="all">All Payment Modes</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="upi">UPI / QR</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="other">Other</option>
          </select>

          {/* Reset button */}
          {(search || paymentStatus !== 'all' || saleStatus !== 'all' || paymentMethod !== 'all') && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Sales Master Table */}
      <SalesTable
        sales={sales}
        pagination={pagination}
        onPageChange={setPage}
        onDownloadPDF={handleDownloadPDF}
        onRecordPayment={setActiveSaleForPayment}
        onCancelSale={setActiveSaleForCancel}
        isAdmin={isAdmin}
        loading={loading}
      />

      {/* Record Payment Modal */}
      {activeSaleForPayment && (
        <PaymentModal
          isOpen={Boolean(activeSaleForPayment)}
          onClose={() => setActiveSaleForPayment(null)}
          sale={activeSaleForPayment}
          onSuccess={fetchSalesData}
        />
      )}

      {/* Cancel Sale Modal */}
      {activeSaleForCancel && (
        <CancelSaleModal
          isOpen={Boolean(activeSaleForCancel)}
          onClose={() => setActiveSaleForCancel(null)}
          sale={activeSaleForCancel}
          onSuccess={fetchSalesData}
        />
      )}
    </div>
  );
};

export default SalesListPage;
