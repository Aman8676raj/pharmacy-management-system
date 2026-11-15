import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Pill,
  Package,
  Hash,
  Barcode,
  Layers,
  FileText,
  User,
  Calendar,
  ArrowLeft,
  Edit,
  Trash2,
  AlertTriangle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import medicineService from '../../services/medicineService';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

export const MedicineDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [medicine, setMedicine] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(location.state?.message || null);

  const [isDeactivating, setIsDeactivating] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  const canEdit = user?.role === 'admin' || user?.role === 'pharmacist' || user?.role === 'inventory_manager';
  const canDeactivate = user?.role === 'admin';

  useEffect(() => {
    const fetchMedicine = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await medicineService.getMedicineById(id);
        if (res.success && res.data?.medicine) {
          setMedicine(res.data.medicine);
        } else {
          setError('Medicine record not found');
        }
      } catch (err) {
        setError(err.message || 'Failed to load medicine details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedicine();
  }, [id]);

  const handleDeactivate = async () => {
    setIsDeactivating(true);
    try {
      await medicineService.deactivateMedicine(id);
      setSuccessMessage('Medicine deactivated successfully.');
      setShowDeactivateModal(false);
      // Refresh details
      const refreshed = await medicineService.getMedicineById(id);
      setMedicine(refreshed.data.medicine);
    } catch (err) {
      setError(err.message || 'Failed to deactivate medicine');
    } finally {
      setIsDeactivating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center">
        <Spinner size="lg" color="text-teal-600" />
        <p className="text-xs text-slate-500 mt-3 font-medium">Loading medicine profile...</p>
      </div>
    );
  }

  if (error || !medicine) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center space-y-4">
        <Alert type="error">{error || 'Medicine not found'}</Alert>
        <Button variant="outline" onClick={() => navigate('/medicines')}>
          Return to Medicines List
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Breadcrumb & Navigation */}
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
          <span className="text-slate-800 font-medium truncate max-w-xs">{medicine.name}</span>
        </div>

        <button
          type="button"
          onClick={() => navigate('/medicines')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Medicines
        </button>
      </div>

      {successMessage && (
        <Alert type="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {/* Main Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 border border-teal-200/80 flex items-center justify-center shrink-0">
            <Pill className="w-6 h-6 stroke-[2.2]" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{medicine.name}</h1>
              <Badge variant={medicine.isActive ? 'success' : 'neutral'} dot>
                {medicine.isActive ? 'Active Catalog' : 'Deactivated'}
              </Badge>
              {medicine.requiresPrescription ? (
                <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  Prescription Only (Rx)
                </span>
              ) : (
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Over-the-Counter (OTC)
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-1">
              Generic: <strong className="text-slate-700">{medicine.genericName || 'Not specified'}</strong>
              {medicine.brandName && (
                <> • Brand: <strong className="text-slate-700">{medicine.brandName}</strong></>
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
          {canEdit && (
            <Button
              variant="outline"
              size="md"
              leftIcon={<Edit className="w-4 h-4" />}
              onClick={() => navigate(`/medicines/${medicine.id || medicine._id}/edit`)}
            >
              Edit Medicine
            </Button>
          )}

          {canDeactivate && medicine.isActive && (
            <Button
              variant="danger"
              size="md"
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={() => setShowDeactivateModal(true)}
            >
              Deactivate
            </Button>
          )}
        </div>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Clinical & Specification Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Card: Basic Clinical Information */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600" />
              General Clinical Information
            </h3>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <dt className="text-slate-400 font-semibold uppercase text-[10px]">Category</dt>
                <dd className="text-slate-800 font-medium mt-0.5">{medicine.category}</dd>
              </div>

              <div>
                <dt className="text-slate-400 font-semibold uppercase text-[10px]">Manufacturer</dt>
                <dd className="text-slate-800 font-medium mt-0.5">{medicine.manufacturer || 'Unspecified'}</dd>
              </div>

              <div>
                <dt className="text-slate-400 font-semibold uppercase text-[10px]">Brand / Trade Name</dt>
                <dd className="text-slate-800 font-medium mt-0.5">{medicine.brandName || 'Generic / N/A'}</dd>
              </div>

              <div>
                <dt className="text-slate-400 font-semibold uppercase text-[10px]">Generic Active Entity</dt>
                <dd className="text-slate-800 font-medium mt-0.5">{medicine.genericName || 'N/A'}</dd>
              </div>

              {medicine.composition && (
                <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                  <dt className="text-slate-400 font-semibold uppercase text-[10px]">Chemical Composition</dt>
                  <dd className="text-slate-800 font-medium mt-0.5">{medicine.composition}</dd>
                </div>
              )}

              {medicine.description && (
                <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                  <dt className="text-slate-400 font-semibold uppercase text-[10px]">Clinical Indications & Description</dt>
                  <dd className="text-slate-700 leading-relaxed mt-0.5">{medicine.description}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Card: Formulation & Packaging */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" />
              Formulation & Packaging Presentation
            </h3>

            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <dt className="text-slate-400 font-semibold uppercase text-[10px]">Dosage Form</dt>
                <dd className="text-slate-800 font-medium mt-0.5">{medicine.dosageForm}</dd>
              </div>

              <div>
                <dt className="text-slate-400 font-semibold uppercase text-[10px]">Strength</dt>
                <dd className="text-slate-800 font-medium mt-0.5">{medicine.strength || '-'}</dd>
              </div>

              <div>
                <dt className="text-slate-400 font-semibold uppercase text-[10px]">Unit Type</dt>
                <dd className="text-slate-800 font-medium mt-0.5">{medicine.unit}</dd>
              </div>

              <div>
                <dt className="text-slate-400 font-semibold uppercase text-[10px]">Package Size</dt>
                <dd className="text-slate-800 font-medium mt-0.5">{medicine.packSize || 'Standard'}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Right Column: Inventory Identifiers & Audit Trail */}
        <div className="space-y-6">
          {/* Card: Identifiers & Reorder Thresholds */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Hash className="w-4 h-4 text-amber-600" />
              Codes & Inventory Thresholds
            </h3>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">SKU Identifier</span>
              <div className="mt-1 font-mono text-xs font-bold text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-200">
                {medicine.sku}
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Barcode (EAN / UPC)</span>
              <div className="mt-1 font-mono text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center gap-2">
                <Barcode className="w-4 h-4 text-slate-400" />
                <span>{medicine.barcode || 'No barcode registered'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Minimum Reorder Level</span>
              <div className="mt-1 text-sm font-bold text-teal-700">
                {medicine.minimumStock} <span className="text-xs font-normal text-slate-500">units</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Low stock alerts trigger when physical inventory drops below this quantity.
              </p>
            </div>
          </div>

          {/* Card: Audit & Compliance */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              Audit & Compliance Trail
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Created By:</span>
                <span className="font-semibold text-slate-700">{medicine.createdBy?.name || 'Administrator'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Creator Role:</span>
                <span className="capitalize text-slate-600">{medicine.createdBy?.role || 'Staff'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Created Date:</span>
                <span className="text-slate-600">{formatDate(medicine.createdAt)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Last Modified:</span>
                <span className="text-slate-600">{formatDate(medicine.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deactivation Modal */}
      <Modal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        title="Confirm Deactivation"
        maxWidth="max-w-md"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeactivateModal(false)}
              disabled={isDeactivating}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isDeactivating}
              onClick={handleDeactivate}
            >
              Confirm Deactivation
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs text-slate-600">
          <p>
            Are you sure you want to deactivate <strong>{medicine.name}</strong>?
          </p>
          <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            This operation will hide this record from standard dispensing and catalog views, but will preserve all historical audit data and references.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default MedicineDetailsPage;

