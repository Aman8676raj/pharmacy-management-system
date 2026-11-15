import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Boxes, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { StockInForm } from '../../components/inventory/StockInForm';
import inventoryService from '../../services/inventoryService';

export default function AddStockPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMedicineId = searchParams.get('medicineId');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (stockData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await inventoryService.stockIn(stockData);
      if (res.success) {
        setSuccess('Stock has been successfully added and audit transaction recorded.');
        setTimeout(() => {
          navigate('/inventory/stock');
        }, 1200);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to record stock in';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/inventory');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <Link to="/inventory" className="hover:text-teal-600 transition-colors">
              Inventory Hub
            </Link>
            <span>/</span>
            <span className="text-teal-600 font-semibold">Stock Intake</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
            <Boxes className="w-7 h-7 text-teal-600" />
            Record Stock Intake
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Receive and register a new medicine batch or replenish an existing batch into active inventory.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Cancel
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert
          type="error"
          title="Stock Intake Failed"
          message={error}
          onClose={() => setError(null)}
        />
      )}
      {success && (
        <Alert
          type="success"
          title="Intake Success"
          message={success}
          onClose={() => setSuccess(null)}
        />
      )}

      {/* Main Form */}
      <StockInForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        initialMedicineId={initialMedicineId}
      />
    </div>
  );
}

