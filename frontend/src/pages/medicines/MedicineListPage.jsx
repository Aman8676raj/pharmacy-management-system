import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pill, AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import MedicineStats from '../../components/medicines/MedicineStats';
import MedicineFilters from '../../components/medicines/MedicineFilters';
import MedicineTable from '../../components/medicines/MedicineTable';
import MedicineDetailsModal from '../../components/medicines/MedicineDetailsModal';
import medicineService from '../../services/medicineService';
import { useAuth } from '../../hooks/useAuth';

export const MedicineListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [medicines, setMedicines] = useState([]);
  const [stats, setStats] = useState(null);
  const [filterOptions, setFilterOptions] = useState({ categories: [], manufacturers: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Filters state
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    category: 'all',
    manufacturer: 'all',
    status: 'active',
    requiresPrescription: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Modal states
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  // Role permissions
  const canAdd = user?.role === 'admin' || user?.role === 'pharmacist' || user?.role === 'inventory_manager';

  // Fetch medicines and stats
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [medsRes, statsRes, optionsRes] = await Promise.all([
        medicineService.getMedicines(filters),
        medicineService.getMedicineStats(),
        medicineService.getFilterOptions(),
      ]);

      if (medsRes.success) {
        setMedicines(medsRes.data.medicines);
        setPagination(medsRes.data.pagination);
      }

      if (statsRes.success) {
        setStats(statsRes.data);
      }

      if (optionsRes.success) {
        setFilterOptions(optionsRes.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load medicines');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle deactivation
  const handleConfirmDeactivate = async () => {
    if (!deactivateTarget) return;
    setIsDeactivating(true);
    try {
      await medicineService.deactivateMedicine(deactivateTarget.id || deactivateTarget._id);
      setSuccessMessage(`Successfully deactivated '${deactivateTarget.name}'.`);
      setDeactivateTarget(null);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to deactivate medicine');
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: '',
      category: 'all',
      manufacturer: 'all',
      status: 'active',
      requiresPrescription: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Add Medicine CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Medicines Management
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              {pagination.total} Registered
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Maintain your master pharmaceutical formulary, dosage formulations, and dispensing rules
          </p>
        </div>

        {canAdd && (
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/medicines/new')}
          >
            Add New Medicine
          </Button>
        )}
      </div>

      {/* Notifications */}
      {successMessage && (
        <Alert
          type="success"
          onClose={() => setSuccessMessage(null)}
          title="Operation Completed"
        >
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert
          type="error"
          onClose={() => setError(null)}
          title="Error Loading Data"
        >
          {error}
        </Alert>
      )}

      {/* Statistics summary bar */}
      <MedicineStats stats={stats} isLoading={isLoading && !stats} />

      {/* Filters component */}
      <MedicineFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
        filterOptions={filterOptions}
        isLoading={isLoading}
      />

      {/* Table component */}
      <MedicineTable
        medicines={medicines}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={(newPage) => setFilters((prev) => ({ ...prev, page: newPage }))}
        onView={(med) => {
          setSelectedMedicine(med);
          setIsDetailsOpen(true);
        }}
        onEdit={(med) => navigate(`/medicines/${med.id || med._id}/edit`)}
        onDeactivate={(med) => setDeactivateTarget(med)}
      />

      {/* Quick Details Modal */}
      <MedicineDetailsModal
        medicine={selectedMedicine}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedMedicine(null);
        }}
      />

      {/* Deactivation Confirmation Modal */}
      <Modal
        isOpen={Boolean(deactivateTarget)}
        onClose={() => setDeactivateTarget(null)}
        title="Confirm Medicine Deactivation"
        maxWidth="max-w-md"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeactivateTarget(null)}
              disabled={isDeactivating}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isDeactivating}
              onClick={handleConfirmDeactivate}
            >
              Yes, Deactivate Medicine
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs text-slate-600">
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-2.5 text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-xs mb-0.5">Soft Deactivation Notice</p>
              <p className="text-[11px] leading-snug">
                Deactivating will hide <strong>{deactivateTarget?.name}</strong> from standard medicine searches and active catalog lists. Historical records and audit data remain completely preserved.
              </p>
            </div>
          </div>
          <p>
            Are you sure you want to deactivate SKU: <code className="font-mono text-slate-800 font-semibold">{deactivateTarget?.sku}</code>?
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default MedicineListPage;

