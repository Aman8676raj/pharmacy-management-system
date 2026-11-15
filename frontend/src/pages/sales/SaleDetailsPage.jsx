import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import salesService from '../../services/salesService';
import { SaleStatusBadge } from '../../components/sales/SaleStatusBadge';
import { PaymentModal } from '../../components/sales/PaymentModal';
import { CancelSaleModal } from '../../components/sales/CancelSaleModal';
import { Button } from '../../components/common/Button';
import {
  ArrowLeft,
  FileDown,
  CreditCard,
  Ban,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  AlertTriangle,
  Receipt,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react';

export const SaleDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isPharmacistOrAdmin = user?.role === 'admin' || user?.role === 'pharmacist';

  const [sale, setSale] = useState(null);
  const [payments, setPayments] = useState([]);
  const [profitData, setProfitData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const fetchSaleDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await salesService.getSaleById(id);
      setSale(res.data?.sale || null);
      setPayments(res.data?.payments || []);

      if (isPharmacistOrAdmin) {
        try {
          const profitRes = await salesService.getSaleProfit(id);
          setProfitData(profitRes.data || null);
        } catch {
          // ignore profit load error if unauthorized
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load sale details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaleDetails();
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!sale) return;
    try {
      await salesService.downloadInvoicePDF(sale._id || sale.id, sale.invoiceNumber);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to download PDF invoice');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent" />
          <p className="mt-2 text-xs text-slate-500">Loading invoice details...</p>
        </div>
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="p-8 bg-white rounded-xl border border-slate-200 text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">Sale Record Not Found</h3>
        <p className="text-xs text-slate-500">{error || 'The requested invoice does not exist or access is restricted.'}</p>
        <Button variant="outline" onClick={() => navigate('/sales')} className="text-xs">
          Back to Sales List
        </Button>
      </div>
    );
  }

  const isCancelled = sale.saleStatus === 'cancelled';
  const hasBalance = sale.balanceAmount > 0 && !isCancelled;

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/sales')}
            className="text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Sales
          </Button>
          <div className="h-5 w-px bg-slate-200" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">{sale.invoiceNumber}</h1>
              <SaleStatusBadge status={sale.paymentStatus} type="payment" size="sm" />
              <SaleStatusBadge status={sale.saleStatus} type="sale" size="sm" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Dispensed on{' '}
              {new Date(sale.createdAt).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}{' '}
              by <span className="font-medium text-slate-700">{sale.soldBy?.name || 'Staff'}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            className="text-xs flex items-center gap-1.5"
          >
            <FileDown className="w-4 h-4 text-teal-600" />
            Download PDF Invoice
          </Button>

          {hasBalance && (
            <Button
              variant="primary"
              onClick={() => setIsPaymentModalOpen(true)}
              className="text-xs bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5"
            >
              <CreditCard className="w-4 h-4" />
              Record Balance Payment
            </Button>
          )}

          {isAdmin && !isCancelled && (
            <Button
              variant="outline"
              onClick={() => setIsCancelModalOpen(true)}
              className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 flex items-center gap-1.5"
            >
              <Ban className="w-4 h-4" />
              Cancel Sale
            </Button>
          )}
        </div>
      </div>

      {/* Cancellation Notice Banner */}
      {isCancelled && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
          <Ban className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-800">
            <span className="font-bold block mb-1">
              Invoice Cancelled on {new Date(sale.cancelledAt).toLocaleString()} by {sale.cancelledBy?.name || 'Admin'}
            </span>
            <p>Reason: <span className="italic font-medium">{sale.cancelReason || 'No reason provided'}</span></p>
            <p className="text-rose-600 mt-1">All allocated medicine quantities were returned into inventory batches.</p>
          </div>
        </div>
      )}

      {/* Main Grid: Left Items & Payments, Right Summary & Customer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Items Table & Payments (2 spans) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-teal-600" />
                Dispensed Medicines ({sale.items?.length || 0})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Medicine & Details</th>
                    <th className="px-4 py-3">FEFO Batch Allocations</th>
                    <th className="px-4 py-3 text-right">Price (₹)</th>
                    <th className="px-4 py-3 text-right">Disc / Tax</th>
                    <th className="px-4 py-3 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sale.items?.map((item, idx) => (
                    <tr key={item._id || idx} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-slate-400 font-medium">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{item.medicineName}</div>
                        <div className="text-[11px] text-slate-500">
                          {item.dosageForm} • {item.unit || 'Strip'} {item.sku && `• SKU: ${item.sku}`}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          {item.batchAllocations?.map((alloc, aIdx) => (
                            <div
                              key={alloc._id || aIdx}
                              className="text-[11px] bg-slate-50 px-2 py-0.5 rounded border border-slate-100 flex items-center justify-between gap-2"
                            >
                              <span className="font-mono font-medium text-slate-700">
                                {alloc.batchNumber}
                              </span>
                              <span className="text-slate-500">
                                Exp: {new Date(alloc.expiryDate).toLocaleDateString('en-GB', { month: '2-digit', year: '2-digit' })}
                              </span>
                              <span className="font-bold text-teal-700">
                                Qty: {alloc.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <span className="font-medium text-slate-800">
                          ₹{Number(item.unitPrice).toFixed(2)}
                        </span>
                        <div className="text-[10px] text-slate-400">Qty: {item.quantity}</div>
                      </td>
                      <td className="px-4 py-3 text-right text-[11px] text-slate-500 whitespace-nowrap">
                        {item.discount > 0 && <div>Disc: -{item.discount}%</div>}
                        <div>Tax: {item.taxRate}% (₹{Number(item.taxAmount || 0).toFixed(2)})</div>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900 whitespace-nowrap">
                        ₹{Number(item.lineTotal || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment History Log */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" />
                Payment Transactions History ({payments.length})
              </h3>
            </div>

            {payments.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No payment transactions recorded for this invoice yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <div key={p._id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50/50">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-800 flex items-center gap-2">
                        <span>{p.paymentReference || 'Payment'}</span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {p.paymentMethod}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {new Date(p.paymentDate).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}{' '}
                        • Received by {p.receivedBy?.name || 'Staff'}
                      </div>
                      {p.notes && <div className="text-[11px] text-slate-400 italic">Note: {p.notes}</div>}
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-700">
                        +₹{Number(p.amount).toFixed(2)}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 justify-end">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Customer Info & Financial Breakdown (1 span) */}
        <div className="space-y-6">
          {/* Customer Snapshot Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-600" />
              Customer Information
            </h3>

            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-900 text-sm">
                {sale.customerSnapshot?.name || 'Walk-in Customer'}
              </div>

              {sale.customerSnapshot?.phone && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{sale.customerSnapshot.phone}</span>
                </div>
              )}

              {sale.customerSnapshot?.email && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{sale.customerSnapshot.email}</span>
                </div>
              )}

              {sale.customerSnapshot?.address && (
                <div className="flex items-start gap-2 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{sale.customerSnapshot.address}</span>
                </div>
              )}

              {sale.customerSnapshot?.prescriptionRef && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-start gap-2 text-teal-800 bg-teal-50/50 p-2 rounded-lg">
                  <FileText className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[11px] block">Doctor / Rx Reference:</span>
                    <span className="text-xs">{sale.customerSnapshot.prescriptionRef}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Financial Summary Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Bill Summary
            </h3>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-medium text-slate-900">₹{Number(sale.subtotal || 0).toFixed(2)}</span>
              </div>

              {sale.discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Order Discount:</span>
                  <span>-₹{Number(sale.discount).toFixed(2)}</span>
                </div>
              )}

              {sale.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span>GST / Tax Amount:</span>
                  <span className="font-medium text-slate-900">+₹{Number(sale.taxAmount).toFixed(2)}</span>
                </div>
              )}

              {sale.rounding && sale.rounding !== 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Rounding:</span>
                  <span>{sale.rounding > 0 ? '+' : ''}₹{Number(sale.rounding).toFixed(2)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-bold text-sm text-slate-900">
                <span>Grand Total:</span>
                <span className="text-base text-teal-800">₹{Number(sale.totalAmount || 0).toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-emerald-700 font-semibold pt-1">
                <span>Amount Paid:</span>
                <span>₹{Number(sale.amountPaid || 0).toFixed(2)}</span>
              </div>

              {sale.balanceAmount > 0 && (
                <div className="flex justify-between text-amber-700 font-bold bg-amber-50 p-2 rounded-lg">
                  <span>Balance Due:</span>
                  <span>₹{Number(sale.balanceAmount).toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Profit & Gross Margin Card (Admin / Pharmacist Only) */}
          {profitData && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
                Profit & Margin Analysis
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-500 block">Total COGS</span>
                  <span className="font-bold text-slate-800">
                    ₹{Number(profitData.totalCost || 0).toFixed(2)}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-100">
                  <span className="text-[11px] text-teal-700 block">Gross Profit</span>
                  <span className="font-bold text-teal-900">
                    ₹{Number(profitData.grossProfit || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500">Gross Margin:</span>
                <span className="font-bold text-teal-700">{profitData.marginPercent}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isPaymentModalOpen && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          sale={sale}
          onSuccess={fetchSaleDetails}
        />
      )}

      {isCancelModalOpen && (
        <CancelSaleModal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          sale={sale}
          onSuccess={fetchSaleDetails}
        />
      )}
    </div>
  );
};

export default SaleDetailsPage;
