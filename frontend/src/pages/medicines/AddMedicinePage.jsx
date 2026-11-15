import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import MedicineForm from '../../components/medicines/MedicineForm';
import Alert from '../../components/common/Alert';
import medicineService from '../../services/medicineService';

export const AddMedicinePage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (payload) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await medicineService.createMedicine(payload);
      if (res.success && res.data?.medicine) {
        navigate('/medicines', {
          state: { message: `Medicine '${res.data.medicine.name}' registered successfully.` },
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to add medicine');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/dashboard" className="hover:text-teal-700 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/medicines" className="hover:text-teal-700 transition-colors">
            Medicines
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">Add New</span>
        </div>

        <button
          type="button"
          onClick={() => navigate('/medicines')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to List
        </button>
      </div>

      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Register New Medicine
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Add a new medicine formulation to the pharmacy catalogue with dosage and SKU specifications
        </p>
      </div>

      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Form */}
      <MedicineForm
        onSubmit={handleSubmit}
        onCancel={() => navigate('/medicines')}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default AddMedicinePage;

