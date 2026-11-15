import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import PurchaseForm from '../../components/purchases/PurchaseForm';
import purchaseService from '../../services/purchaseService';

export default function CreatePurchasePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSupplierId = searchParams.get('supplier');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await purchaseService.createPurchaseOrder(formData);
      if (res.success && res.data?.purchaseOrder) {
        navigate(`/purchases/${res.data.purchaseOrder._id}`);
      } else {
        navigate('/purchases');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to create purchase order';
      setError(errMsg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <span className="text-teal-600 font-semibold">New Order</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
            <ShoppingCart className="w-7 h-7 text-teal-600" />
            Create Purchase Order
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Issue procurement orders to authorized vendors with pricing snapshots, discounts, and tax rates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/purchases')}
            className="flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Button>
        </div>
      </div>

      {error && (
        <Alert type="error" title="Order Creation Error" message={error} onClose={() => setError(null)} />
      )}

      {/* Main Order Form */}
      <PurchaseForm
        initialSupplierId={initialSupplierId}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/purchases')}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
