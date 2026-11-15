import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import PurchaseForm from '../../components/purchases/PurchaseForm';
import purchaseService from '../../services/purchaseService';

export default function EditPurchasePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPO = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await purchaseService.getPurchaseById(id);
        if (res.success && res.data?.purchaseOrder) {
          setPurchaseOrder(res.data.purchaseOrder);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load purchase order');
      } finally {
        setLoading(false);
      }
    };

    fetchPO();
  }, [id]);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await purchaseService.updatePurchaseOrder(id, formData);
      if (res.success) {
        navigate(`/purchases/${id}`);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to update purchase order';
      setError(errMsg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Loading purchase order...</p>
      </div>
    );
  }

  if (error && !purchaseOrder) {
    return (
      <div className="space-y-4">
        <Alert
          type="error"
          title="Lookup Error"
          message={error}
          action={
            <Link to="/purchases">
              <Button size="sm" variant="outline">
                Back to Orders
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  if (purchaseOrder?.status !== 'draft') {
    return (
      <div className="space-y-4">
        <Alert
          type="warning"
          title="Order Locked"
          message={`Only draft purchase orders can be modified. This order is currently in "${purchaseOrder?.status}" status.`}
          action={
            <Link to={`/purchases/${id}`}>
              <Button size="sm" variant="outline">
                View Order Details
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <Link to="/purchases" className="hover:text-teal-600 transition-colors">
              Purchases
            </Link>
            <span>/</span>
            <Link to={`/purchases/${id}`} className="hover:text-teal-600 transition-colors">
              {purchaseOrder.purchaseOrderNumber}
            </Link>
            <span>/</span>
            <span className="text-teal-600 font-semibold">Edit Draft</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
            <ShoppingCart className="w-7 h-7 text-teal-600" />
            Edit Draft Purchase Order
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Modify items, pricing, or dispatch dates before confirming the order with the supplier.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/purchases/${id}`)}
            className="flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Cancel
          </Button>
        </div>
      </div>

      {error && (
        <Alert type="error" title="Update Error" message={error} onClose={() => setError(null)} />
      )}

      {/* Main Order Form */}
      <PurchaseForm
        initialData={purchaseOrder}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/purchases/${id}`)}
        isSubmitting={isSubmitting}
        isEdit={true}
      />
    </div>
  );
}
