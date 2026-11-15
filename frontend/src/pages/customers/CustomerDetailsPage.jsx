import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import customerService from '../../services/customerService';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  ArrowLeft,
  Edit,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Receipt,
  ShoppingCart,
  IndianRupee,
  Clock,
  PlusCircle,
  AlertCircle,
  Ban,
  CheckCircle2,
} from 'lucide-react';

export const CustomerDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'pharmacist';

  const [customer, setCustomer] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [sales, setSales] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('sales'); // 'sales' or 'prescriptions'

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const [detailRes, salesRes, rxRes] = await Promise.all([
        customerService.getCustomerById(id),
        customerService.getCustomerSales(id, { limit: 10 }),
        customerService.getCustomerPrescriptions(id, { limit: 10 }),
      ]);

      setCustomer(detailRes.data?.customer || null);
      setMetrics(detailRes.data?.metrics || null);
      setSales(salesRes.data?.sales || []);
      setPrescriptions(rxRes.data?.prescriptions || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load customer profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  const handleToggleActive = async () => {
    if (!customer) return;
    try {
      if (customer.isActive) {
        await customerService.deactivateCustomer(id);
      } else {
        await customerService.activateCustomer(id);
      }
      fetchCustomerDetails();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to update customer status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-8 bg-white rounded-xl border border-slate-200 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">Customer Not Found</h3>
        <p className="text-xs text-slate-500">{error || 'Unable to locate customer record.'}</p>
        <Button variant="outline" onClick={() => navigate('/customers')} className="text-xs">
          Back to Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/customers')}
            className="text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Directory
          </Button>
          <div className="h-5 w-px bg-slate-200" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{customer.name}</h1>
              <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {customer.customerCode}
              </span>
              <Badge variant={customer.isActive ? 'success' : 'danger'} size="sm" dot>
                {customer.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Registered on {new Date(customer.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => navigate(`/sales/pos?customerId=${customer._id}`)}
            className="text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold"
          >
            <ShoppingCart className="w-4 h-4 mr-1.5" />
            New POS Sale
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate(`/prescriptions/new?customerId=${customer._id}`)}
            className="text-xs text-slate-700 font-semibold"
          >
            <FileText className="w-4 h-4 mr-1.5" />
            Add Prescription
          </Button>

          {canEdit && (
            <Link
              to={`/customers/${customer._id}/edit`}
              className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 text-slate-700 transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Profile
            </Link>
          )}

          {canEdit && (
            <button
              type="button"
              onClick={handleToggleActive}
              className={`px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors ${
                customer.isActive
                  ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                  : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              {customer.isActive ? 'Deactivate' : 'Activate'}
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Orders</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900">{metrics?.totalOrders || 0}</div>
          <div className="mt-1 text-xs text-slate-500">Lifetime purchases</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Spend</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900">
            ₹{Number(metrics?.totalSpend || 0).toFixed(2)}
          </div>
          <div className="mt-1 text-xs text-slate-500">Revenue contribution</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Outstanding Due</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-amber-800">
            ₹{Number(metrics?.totalBalance || 0).toFixed(2)}
          </div>
          <div className="mt-1 text-xs text-slate-500">Unsettled credit bills</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Prescriptions</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900">
            {metrics?.totalPrescriptions || 0}
          </div>
          <div className="mt-1 text-xs text-slate-500">Doctor Rx on record</div>
        </div>
      </div>

      {/* Main Details Grid: Left Info & Notes, Right Tabs for Orders/Prescriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Customer Profile */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Patient Contact Info
            </h3>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-900">{customer.phone}</span>
              </div>

              {customer.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{customer.email}</span>
                </div>
              )}

              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  {customer.address ? `${customer.address}, ` : ''}
                  {customer.city || 'Local'} {customer.state ? `, ${customer.state}` : ''}{' '}
                  {customer.postalCode ? `- ${customer.postalCode}` : ''}
                </span>
              </div>

              {customer.gender && (
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <span className="text-slate-400">Gender:</span>
                  <span className="capitalize font-medium">{customer.gender.replace(/_/g, ' ')}</span>
                </div>
              )}

              {customer.dateOfBirth && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>DOB: {new Date(customer.dateOfBirth).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {customer.notes && (
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 text-xs space-y-1">
              <h4 className="font-bold text-amber-900">Clinical / Pharmacy Notes</h4>
              <p className="text-amber-800 leading-relaxed">{customer.notes}</p>
            </div>
          )}
        </div>

        {/* Right Column: Tabbed Sales & Prescriptions (2 spans) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('sales')}
              className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'sales'
                  ? 'border-teal-600 text-teal-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Receipt className="w-4 h-4" />
              Sales Orders History ({sales.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('prescriptions')}
              className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'prescriptions'
                  ? 'border-teal-600 text-teal-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              Prescriptions on File ({prescriptions.length})
            </button>
          </div>

          {activeTab === 'sales' ? (
            /* Sales Table */
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              {sales.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No sales recorded for this customer yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Invoice #</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3 text-right">Total (₹)</th>
                        <th className="px-4 py-3 text-right">Paid (₹)</th>
                        <th className="px-4 py-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sales.map((s) => (
                        <tr key={s._id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3 font-semibold text-teal-700 font-mono">
                            <Link to={`/sales/${s._id}`} className="hover:underline">
                              {s.invoiceNumber}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {new Date(s.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-slate-900">
                            ₹{Number(s.totalAmount || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right text-emerald-700 font-medium">
                            ₹{Number(s.amountPaid || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-center capitalize font-medium text-slate-600">
                            {s.paymentStatus}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* Prescriptions Table */
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              {prescriptions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No medical prescriptions registered for this customer yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Rx #</th>
                        <th className="px-4 py-3">Doctor</th>
                        <th className="px-4 py-3">Issue Date</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {prescriptions.map((rx) => (
                        <tr key={rx._id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3 font-semibold text-teal-700 font-mono">
                            <Link to={`/prescriptions/${rx._id}`} className="hover:underline">
                              {rx.prescriptionNumber}
                            </Link>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-800">{rx.doctorName}</td>
                          <td className="px-4 py-3 text-slate-500">
                            {new Date(rx.issueDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-center capitalize">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                rx.status === 'verified'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : rx.status === 'rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {rx.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              to={`/prescriptions/${rx._id}`}
                              className="text-teal-600 hover:text-teal-800 font-medium hover:underline text-xs"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsPage;
