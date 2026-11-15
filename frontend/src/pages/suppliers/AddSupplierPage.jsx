import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import SupplierForm from '../../components/suppliers/SupplierForm';
import supplierService from '../../services/supplierService';

export default function AddSupplierPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await supplierService.createSupplier(formData);
      if (res.success) {
        navigate('/suppliers');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to register supplier.';
      setError(errMsg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <Link to="/suppliers" className="hover:text-teal-600 transition-colors">
              Suppliers
            </Link>
            <span>/</span>
            <span className="text-teal-600 font-semibold">New Registration</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
            <Truck className="w-7 h-7 text-teal-600" />
            Register New Supplier
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Add a licensed pharmaceutical distributor or manufacturer to the procurement directory.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/suppliers')}
            className="flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Directory
          </Button>
        </div>
      </div>

      {error && (
        <Alert type="error" title="Registration Failed" message={error} onClose={() => setError(null)} />
      )}

      {/* Main Form */}
      <SupplierForm
        onSubmit={handleSubmit}
        onCancel={() => navigate('/suppliers')}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
