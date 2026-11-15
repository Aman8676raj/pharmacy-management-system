import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit3 } from 'lucide-react';
import MedicineForm from '../../components/medicines/MedicineForm';
import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';
import medicineService from '../../services/medicineService';

export const EditMedicinePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [medicine, setMedicine] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMedicine = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await medicineService.getMedicineById(id);
        if (res.success && res.data?.medicine) {
          setMedicine(res.data.medicine);
        } else {
          setError('Medicine not found');
        }
      } catch (err) {
        setError(err.message || 'Failed to load medicine details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedicine();
  }, [id]);

  const handleSubmit = async (payload) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await medicineService.updateMedicine(id, payload);
      if (res.success && res.data?.medicine) {
        navigate(`/medicines/${id}`, {
          state: { message: `Medicine '${res.data.medicine.name}' updated successfully.` },
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to update medicine');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <Spinner size="lg" color="text-teal-600" />
        <p className="text-xs text-slate-500 mt-3 font-medium">Loading medicine data...</p>
      </div>
    );
  }

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
          <span className="text-slate-800 font-medium">Edit {medicine?.name}</span>
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
          Edit Medicine: {medicine?.name}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Modify formulation details, dosage parameters, packaging units, and reorder levels
        </p>
      </div>

      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Form */}
      {medicine && (
        <MedicineForm
          initialData={medicine}
          isEdit={true}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/medicines/${id}`)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default EditMedicinePage;
