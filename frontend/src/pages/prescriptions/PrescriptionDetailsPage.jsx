import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import prescriptionService from '../../services/prescriptionService';
import { PrescriptionStatusBadge } from '../../components/prescriptions/PrescriptionStatusBadge';
import { VerifyPrescriptionModal } from '../../components/prescriptions/VerifyPrescriptionModal';
import { Button } from '../../components/common/Button';
import {
  ArrowLeft,
  FileText,
  User,
  Stethoscope,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Upload,
  ShoppingCart,
  Pill,
} from 'lucide-react';

export const PrescriptionDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canVerify = user?.role === 'admin' || user?.role === 'pharmacist';

  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals / Upload
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  const fetchPrescription = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await prescriptionService.getPrescriptionById(id);
      setPrescription(res.data?.prescription || null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load prescription');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescription();
  }, [id]);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    try {
      setUploadLoading(true);
      const formData = new FormData();
      formData.append('prescriptionFile', uploadFile);
      await prescriptionService.uploadPrescriptionFile(id, formData);
      setUploadFile(null);
      fetchPrescription();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to upload document');
    } finally {
      setUploadLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !prescription) {
    return (
      <div className="p-8 bg-white rounded-xl border border-slate-200 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">Prescription Not Found</h3>
        <p className="text-xs text-slate-500">{error || 'Unable to locate prescription record.'}</p>
        <Button variant="outline" onClick={() => navigate('/prescriptions')} className="text-xs">
          Back to Prescriptions
        </Button>
      </div>
    );
  }

  const isVerified = prescription.status === 'verified';
  const isPending = prescription.status === 'pending';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/prescriptions')}
            className="text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Prescriptions
          </Button>
          <div className="h-5 w-px bg-slate-200" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{prescription.prescriptionNumber}</h1>
              <PrescriptionStatusBadge status={prescription.status} size="sm" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Issued on {new Date(prescription.issueDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isVerified && (
            <Button
              variant="primary"
              onClick={() =>
                navigate(
                  `/sales/pos?customerId=${prescription.customer?._id}&prescriptionId=${prescription._id}`
                )
              }
              className="text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold"
            >
              <ShoppingCart className="w-4 h-4 mr-1.5" />
              Dispense in POS
            </Button>
          )}

          {canVerify && isPending && (
            <Button
              variant="primary"
              onClick={() => setIsVerifyModalOpen(true)}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Review &amp; Verify Rx
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Prescribed Medicines & Items (2 spans) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Medications Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Pill className="w-4 h-4 text-teal-600" />
                Prescribed Medicines ({prescription.prescriptionItems?.length || 0})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Medicine Formulation</th>
                    <th className="px-4 py-3">Prescribed Qty</th>
                    <th className="px-4 py-3">Dosage &amp; Regimen</th>
                    <th className="px-4 py-3">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prescription.prescriptionItems?.map((item, idx) => (
                    <tr key={item._id || idx} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-slate-400 font-medium">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">
                          {item.medicineNameSnapshot || item.medicine?.name}
                        </div>
                        {item.medicine?.dosageForm && (
                          <div className="text-[11px] text-slate-500">
                            {item.medicine.dosageForm} • {item.medicine.strength}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          {item.prescribedQuantity} units
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium">
                        {item.dosageInstructions || '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {item.duration || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Verification Audit Status Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Pharmacist Verification Audit
            </h3>

            {prescription.status === 'verified' ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-xs text-emerald-800">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Verified &amp; Authorized for Dispensing</span>
                </div>
                <div>Verified by: <strong className="text-emerald-950">{prescription.verifiedBy?.name || 'Pharmacist'}</strong></div>
                {prescription.verifiedAt && (
                  <div>Verified at: {new Date(prescription.verifiedAt).toLocaleString()}</div>
                )}
                {prescription.verificationNotes && (
                  <div className="mt-1 pt-1 border-t border-emerald-200/60 italic">
                    "{prescription.verificationNotes}"
                  </div>
                )}
              </div>
            ) : prescription.status === 'rejected' ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-xs text-rose-800">
                <div className="flex items-center gap-1.5 font-bold">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Prescription Rejected</span>
                </div>
                <div>Reviewed by: <strong>{prescription.verifiedBy?.name || 'Staff'}</strong></div>
                <div className="mt-1 font-medium">Reason: {prescription.verificationNotes || 'No notes provided'}</div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Pending Pharmacist Clinical Review</span>
                </div>
                <p>
                  This prescription must be reviewed and verified by a licensed pharmacist before prescription-required (Schedule H/X) medications can be dispensed.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Customer Info & Doctor Info & Document (1 span) */}
        <div className="space-y-6">
          {/* Customer Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-600" />
              Patient Details
            </h3>

            <div className="text-xs space-y-1.5">
              <div className="font-bold text-slate-900 text-sm">
                <Link to={`/customers/${prescription.customer?._id}`} className="hover:underline text-teal-700">
                  {prescription.customer?.name}
                </Link>
              </div>
              <div className="text-slate-500">Code: <span className="font-mono text-slate-700">{prescription.customer?.customerCode}</span></div>
              <div className="text-slate-600">Phone: {prescription.customer?.phone}</div>
              {prescription.customer?.address && (
                <div className="text-slate-500 text-[11px]">{prescription.customer.address}</div>
              )}
            </div>
          </div>

          {/* Doctor Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
              Prescribing Physician
            </h3>

            <div className="text-xs space-y-1.5">
              <div className="font-bold text-slate-900 text-sm">{prescription.doctorName}</div>
              {prescription.doctorRegistrationNumber && (
                <div className="text-slate-600">Reg #: <span className="font-mono font-medium">{prescription.doctorRegistrationNumber}</span></div>
              )}
              {prescription.doctorContact && (
                <div className="text-slate-600">Contact: {prescription.doctorContact}</div>
              )}
              {prescription.expiryDate && (
                <div className="text-slate-500 pt-1 border-t border-slate-100 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>Valid until: {new Date(prescription.expiryDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Document Attachment Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              Document Attachment
            </h3>

            {prescription.prescriptionImage?.filename ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                <div className="font-semibold text-slate-800 truncate">
                  {prescription.prescriptionImage.originalName || 'Prescription Document'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {prescription.prescriptionImage.mimeType} •{' '}
                  {prescription.prescriptionImage.size
                    ? `${(prescription.prescriptionImage.size / 1024).toFixed(1)} KB`
                    : ''}
                </div>
                <a
                  href={prescriptionService.getPrescriptionFileUrl(prescription._id)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 mt-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  View / Download Document
                </a>
              </div>
            ) : (
              <form onSubmit={handleFileUpload} className="space-y-2 text-xs">
                <p className="text-[11px] text-slate-500">No document attached. Upload prescription scan:</p>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  onChange={(e) => setUploadFile(e.target.files[0] || null)}
                  className="w-full text-xs text-slate-600"
                />
                {uploadFile && (
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={uploadLoading}
                    className="w-full text-xs bg-teal-600 text-white mt-1"
                  >
                    <Upload className="w-3.5 h-3.5 mr-1" />
                    Upload File
                  </Button>
                )}
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {isVerifyModalOpen && (
        <VerifyPrescriptionModal
          isOpen={isVerifyModalOpen}
          onClose={() => setIsVerifyModalOpen(false)}
          prescription={prescription}
          onSuccess={fetchPrescription}
        />
      )}
    </div>
  );
};

export default PrescriptionDetailsPage;
