import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Truck, ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import SupplierForm from '../../components/suppliers/SupplierForm';
import supplierService from '../../services/supplierService';

export default function EditSupplierPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSupplier = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await supplierService.getSupplierById(id);
        if (res.success && res.data?.supplier) {
          setSupplier(res.data.supplier);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load supplier details');
      } finally {
        setLoading(false);
      }
    };

    fetchSupplier();
  }, [id]);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await supplierService.updateSupplier(id, formData);
      if (res.success) {
        navigate(`/suppliers/${id}`);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to update supplier profile.';
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
        <p className="text-sm">Loading supplier profile...</p>
      </div>
    );
  }

  if (error && !supplier) {
    return (
      <div className="space-y-4">
        <Alert
          type="error"
          title="Lookup Failed"
          message={error}
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <Link to="/suppliers" className="hover:text-teal-600 transition-colors">
              Suppliers
            </Link>
            <span>/</span>
            <Link to={`/suppliers/${id}`} className="hover:text-teal-600 transition-colors">
              {supplier.name}
            </Link>
            <span>/</span>
            <span className="text-teal-600 font-semibold">Edit Profile</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
            <Truck className="w-7 h-7 text-teal-600" />
            Edit Supplier Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Update contact information, commercial terms, or drug license records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/suppliers/${id}`)}
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

      {/* Main Form */}
      <SupplierForm
        initialData={supplier}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/suppliers/${id}`)}
        isSubmitting={isSubmitting}
        isEdit={true}
      />
    </div>
  );
}

