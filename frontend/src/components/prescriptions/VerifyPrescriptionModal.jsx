import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import prescriptionService from '../../services/prescriptionService';
import { CheckCircle2, XCircle, AlertCircle, FileText } from 'lucide-react';

export const VerifyPrescriptionModal = ({ isOpen, onClose, prescription, onSuccess }) => {
  const [action, setAction] = useState('verify'); // 'verify' or 'reject'
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!prescription) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (action === 'reject' && !notes.trim()) {
      setError('A rejection reason is required.');
      return;
    }

    try {
      setLoading(true);
      if (action === 'verify') {
        await prescriptionService.verifyPrescription(
          prescription._id || prescription.id,
          notes.trim() || 'Verified by pharmacist against registered medical records.'
        );
      } else {
        await prescriptionService.rejectPrescription(
          prescription._id || prescription.id,
          notes.trim()
        );
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Prescription Review — ${prescription.prescriptionNumber}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Prescription Metadata Overview */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1">
          <div className="flex justify-between text-slate-600">
            <span>Customer:</span>
            <span className="font-semibold text-slate-900">{prescription.customer?.name}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Doctor:</span>
            <span className="font-semibold text-slate-900">{prescription.doctorName}</span>
          </div>
          {prescription.doctorRegistrationNumber && (
            <div className="flex justify-between text-slate-600">
              <span>Registration #:</span>
              <span className="font-mono text-slate-700">{prescription.doctorRegistrationNumber}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-600">
            <span>Items:</span>
            <span className="font-medium text-slate-800">
              {prescription.prescriptionItems?.length || 0} prescribed medications
            </span>
          </div>
        </div>

        {/* Verification Action Selector */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">
            Verification Decision <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAction('verify')}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                action === 'verify'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${action === 'verify' ? 'text-emerald-600' : 'text-slate-400'}`} />
              Approve &amp; Verify Rx
            </button>

            <button
              type="button"
              onClick={() => setAction('reject')}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                action === 'reject'
                  ? 'border-rose-600 bg-rose-50 text-rose-800 shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <XCircle className={`w-4 h-4 ${action === 'reject' ? 'text-rose-600' : 'text-slate-400'}`} />
              Reject Prescription
            </button>
          </div>
        </div>

        {/* Notes / Reason */}
        <div>
          <label className="text-xs font-medium text-slate-700 block mb-1">
            {action === 'verify' ? 'Verification Notes (Optional)' : 'Rejection Reason (Required)'}
          </label>
          <textarea
            rows="3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              action === 'verify'
                ? 'e.g. Validated with doctor register, dosage and duration confirmed...'
                : 'e.g. Expired date, invalid doctor registration number, missing dosage...'
            }
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
            required={action === 'reject'}
          />
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            className={action === 'verify' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'}
          >
            {action === 'verify' ? 'Confirm Verification' : 'Reject Prescription'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

