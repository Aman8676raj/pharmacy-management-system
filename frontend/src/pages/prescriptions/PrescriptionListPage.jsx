import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import prescriptionService from '../../services/prescriptionService';
import { PrescriptionTable } from '../../components/prescriptions/PrescriptionTable';
import { VerifyPrescriptionModal } from '../../components/prescriptions/VerifyPrescriptionModal';
import { Button } from '../../components/common/Button';
import {
  FileText,
  Search,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from 'lucide-react';

export const PrescriptionListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canVerify = user?.role === 'admin' || user?.role === 'pharmacist';

  const [prescriptions, setPrescriptions] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  // Modal
  const [selectedRxForVerify, setSelectedRxForVerify] = useState(null);

  const fetchPrescriptions = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        search: search.trim() || undefined,
        status: status !== 'all' ? status : undefined,
      };

      const res = await prescriptionService.getPrescriptions(params);
      setPrescriptions(res.data?.prescriptions || []);
      setPagination(res.data?.pagination || {});
    } catch (err) {
      console.error('Failed to fetch prescriptions:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  const handleResetFilters = () => {
    setSearch('');
    setStatus('all');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            Medical Prescriptions (Rx)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Doctor prescriptions registry, clinical verification workflows, and Schedule H/X dispensing authorizations
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate('/prescriptions/new')}
          className="bg-teal-600 hover:bg-teal-700 text-white shadow-xs font-semibold"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Prescription
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by Rx number, doctor name, registration #..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 font-medium focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
          >
            <option value="all">All Verification Statuses</option>
            <option value="pending">Pending Review</option>
            <option value="verified">Verified (Approved)</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>

          {(search || status !== 'all') && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Prescriptions Table */}
      <PrescriptionTable
        prescriptions={prescriptions}
        pagination={pagination}
        onPageChange={setPage}
        onVerify={setSelectedRxForVerify}
        canVerify={canVerify}
        loading={loading}
      />

      {/* Review & Verify Modal */}
      {selectedRxForVerify && (
        <VerifyPrescriptionModal
          isOpen={Boolean(selectedRxForVerify)}
          onClose={() => setSelectedRxForVerify(null)}
          prescription={selectedRxForVerify}
          onSuccess={fetchPrescriptions}
        />
      )}
    </div>
  );
};

export default PrescriptionListPage;

