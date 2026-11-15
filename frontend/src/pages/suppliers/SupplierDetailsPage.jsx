import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Truck,
  ArrowLeft,
  Edit2,
  Plus,
  Phone,
  Mail,
  MapPin,
  Building2,
  FileText,
  DollarSign,
  ShoppingCart,
  Calendar,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Badge from '../../components/common/Badge';
import { PAYMENT_TERMS_CONFIGS, PURCHASE_STATUS_CONFIGS } from '../../utils/constants';
import supplierService from '../../services/supplierService';
import { useAuth } from '../../hooks/useAuth';

export default function SupplierDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [supplier, setSupplier] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const canManage = ['admin', 'inventory_manager'].includes(user?.role);

  useEffect(() => {
    const fetchSupplierData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await supplierService.getSupplierById(id);
        if (res.success) {
          setSupplier(res.data?.supplier);
          setStats(res.data?.stats);
          setRecentPurchases(res.data?.recentPurchases || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load supplier details');
      } finally {
        setLoading(false);
      }
    };

    fetchSupplierData();
  }, [id]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-16 text-center text-slate-500">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Loading supplier profile and procurement history...</p>
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="space-y-4">
        <Alert
          type="error"
          title="Supplier Not Found"
          message={error || 'The requested supplier record does not exist.'}
          action={
            <Link to="/suppliers">
              <Button size="sm" variant="outline">
                Back to Directory
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <Link to="/suppliers" className="hover:text-teal-600 transition-colors">
              Suppliers
            </Link>
            <span>/</span>
            <span className="text-teal-600 font-semibold font-mono">{supplier.supplierCode}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
            <Truck className="w-7 h-7 text-teal-600" />
            Supplier Account Details
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link to="/suppliers">
            <Button variant="outline" size="sm" className="flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>

          {canManage && (
            <>
              <Link to={`/suppliers/${id}/edit`}>
                <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </Button>
              </Link>

              {supplier.isActive && (
                <Link to={`/purchases/new?supplier=${id}`}>
                  <Button variant="primary" size="sm" className="flex items-center gap-1.5">
                    <Plus className="w-4 h-4" />
                    New Purchase Order
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl shrink-0 mt-1">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900">{supplier.name}</h2>
                <span className="font-mono text-sm font-bold bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded border border-slate-200">
                  {supplier.supplierCode}
                </span>
                <Badge variant={supplier.isActive ? 'success' : 'neutral'} size="sm" dot>
                  {supplier.isActive ? 'Active Vendor' : 'Deactivated'}
                </Badge>
              </div>

              {supplier.contactPerson && (
                <p className="text-xs text-slate-500 mt-1">
                  Contact Person: <strong className="text-slate-700">{supplier.contactPerson}</strong>
                </p>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs text-slate-400">Total Purchase Orders</div>
              <div className="text-2xl font-bold text-slate-900 font-mono">
                {stats?.totalOrders ?? 0}
              </div>
            </div>
            <div className="text-right border-l pl-6 border-slate-200">
              <div className="text-xs text-slate-400">Lifetime Spend</div>
              <div className="text-2xl font-bold text-teal-600 font-mono">
                ${stats?.totalSpend?.toFixed(2) ?? '0.00'}
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              Contact Information
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Primary Phone:</span>
                <span className="font-medium text-slate-800">{supplier.phone}</span>
              </div>
              {supplier.alternatePhone && (
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Alternate Phone:</span>
                  <span className="text-slate-800">{supplier.alternatePhone}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Email:</span>
                <span className="text-slate-800">{supplier.email || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Address &amp; Hub
            </h4>
            <div className="space-y-2 text-xs">
              <div className="py-1 border-b border-slate-50 text-slate-700">
                {supplier.address || 'No street address provided.'}
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">City / State:</span>
                <span className="font-medium text-slate-800">
                  {supplier.city ? `${supplier.city}, ${supplier.state || ''}` : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Postal / Country:</span>
                <span className="text-slate-800">
                  {supplier.postalCode} ({supplier.country || 'India'})
                </span>
              </div>
            </div>
          </div>

          {/* Business & Commercial Terms */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Commercial &amp; Compliance
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">GST Number:</span>
                <span className="font-mono font-medium text-slate-800">
                  {supplier.gstNumber || 'Not provided'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Drug License No:</span>
                <span className="font-mono text-slate-800">
                  {supplier.drugLicenseNumber || 'Not provided'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Payment Terms:</span>
                <span className="font-semibold text-teal-700">
                  {PAYMENT_TERMS_CONFIGS[supplier.paymentTerms] || supplier.paymentTerms}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {supplier.notes && (
          <div className="mt-5 pt-4 border-t border-slate-100 text-xs">
            <span className="font-semibold text-slate-700 block mb-1">Internal Notes:</span>
            <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
              {supplier.notes}
            </p>
          </div>
        )}
      </div>

      {/* Recent Purchases Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-blue-50 text-blue-600">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold text-slate-800">Purchase Order History</h2>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
              {recentPurchases.length} orders
            </span>
          </div>

          <Link
            to={`/purchases?supplier=${supplier._id}`}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline flex items-center gap-1"
          >
            View All Purchases &rarr;
          </Link>
        </div>

        {recentPurchases.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
            No purchase orders have been placed with this supplier yet.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">PO Number</th>
                    <th className="py-3 px-4">Order Date</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4 text-right">Total Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentPurchases.map((po) => {
                    const statusConfig = PURCHASE_STATUS_CONFIGS[po.status] || {
                      label: po.status,
                      badgeVariant: 'neutral',
                    };
                    return (
                      <tr key={po._id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                          {po.purchaseOrderNumber}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {po.orderDate ? new Date(po.orderDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {po.items?.length || 0} line items
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          ${po.totalAmount?.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={statusConfig.badgeVariant} size="sm">
                            {statusConfig.label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            to={`/purchases/${po._id}`}
                            className="font-medium text-teal-600 hover:text-teal-800 hover:underline"
                          >
                            Details &rarr;
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
