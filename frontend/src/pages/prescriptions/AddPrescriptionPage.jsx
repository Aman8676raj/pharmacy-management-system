import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import customerService from '../../services/customerService';
import medicineService from '../../services/medicineService';
import prescriptionService from '../../services/prescriptionService';
import { CustomerSelectModal } from '../../components/customers/CustomerSelectModal';
import { Button } from '../../components/common/Button';
import {
  ArrowLeft,
  FilePlus,
  Plus,
  Trash2,
  Upload,
  User,
  AlertCircle,
  FileText,
} from 'lucide-react';

export const AddPrescriptionPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCustId = searchParams.get('customerId');

  const [customer, setCustomer] = useState(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const [doctorName, setDoctorName] = useState('');
  const [doctorRegistrationNumber, setDoctorRegistrationNumber] = useState('');
  const [doctorContact, setDoctorContact] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('');

  // Prescription items
  const [medicinesList, setMedicinesList] = useState([]);
  const [items, setItems] = useState([
    {
      medicine: '',
      medicineNameSnapshot: '',
      prescribedQuantity: 1,
      dosageInstructions: '1-0-1 after food',
      duration: '5 days',
      notes: '',
    },
  ]);

  // File
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load medicines & preselected customer if any
  useEffect(() => {
    const init = async () => {
      try {
        const medsRes = await medicineService.getMedicines({ limit: 200 });
        setMedicinesList(medsRes.data?.medicines?.filter((m) => m.isActive) || []);

        if (preselectedCustId) {
          const custRes = await customerService.getCustomerById(preselectedCustId);
          setCustomer(custRes.data?.customer || null);
        }
      } catch (err) {
        console.error('Init error:', err);
      }
    };
    init();
  }, [preselectedCustId]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        medicine: '',
        medicineNameSnapshot: '',
        prescribedQuantity: 1,
        dosageInstructions: '1-0-1 after food',
        duration: '5 days',
        notes: '',
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx === index) {
          const updated = { ...item, [field]: value };
          if (field === 'medicine') {
            const medObj = medicinesList.find((m) => (m._id || m.id) === value);
            updated.medicineNameSnapshot = medObj ? medObj.name : '';
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!customer) {
      setError('Please select a customer for this prescription.');
      return;
    }

    if (!doctorName.trim()) {
      setError('Prescribing doctor name is required.');
      return;
    }

    const validItems = items.filter((it) => it.medicine);
    if (validItems.length === 0) {
      setError('At least one prescribed medicine item is required.');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        customer: customer._id || customer.id,
        doctorName: doctorName.trim(),
        doctorRegistrationNumber: doctorRegistrationNumber.trim(),
        doctorContact: doctorContact.trim(),
        issueDate,
        expiryDate: expiryDate || null,
        prescriptionItems: validItems,
      };

      const res = await prescriptionService.createPrescription(payload);
      const newRx = res.data.prescription;

      // If document file attached, upload it
      if (file) {
        const formData = new FormData();
        formData.append('prescriptionFile', file);
        await prescriptionService.uploadPrescriptionFile(newRx._id || newRx.id, formData);
      }

      navigate(`/prescriptions/${newRx._id || newRx.id}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/prescriptions')}
          className="text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Prescriptions
        </Button>
        <div className="h-5 w-px bg-slate-200" />
        <div>
          <h1 className="text-lg font-bold text-slate-900">Add Doctor Prescription</h1>
          <p className="text-xs text-slate-500">
            Record physician details, prescribed medications, and clinical document scan
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Customer Selection Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <User className="w-4 h-4 text-teal-600" />
              Patient / Customer Assignment <span className="text-rose-500">*</span>
            </h3>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCustomerModalOpen(true)}
              className="text-xs font-semibold text-teal-700"
            >
              {customer ? 'Change Customer' : 'Select Customer'}
            </Button>
          </div>

          {customer ? (
            <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-lg flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 text-sm">{customer.name}</span>
                <span className="font-mono text-teal-800 text-[11px] ml-2">({customer.customerCode})</span>
                <div className="text-slate-500 mt-0.5">Phone: {customer.phone} • {customer.city || 'Local'}</div>
              </div>
              <span className="text-teal-700 text-xs font-semibold">Selected</span>
            </div>
          ) : (
            <div
              onClick={() => setIsCustomerModalOpen(true)}
              className="p-6 border-2 border-dashed border-slate-200 rounded-xl text-center cursor-pointer hover:border-teal-500 hover:bg-teal-50/20 transition-all text-xs text-slate-500"
            >
              Click here to search and select a patient from directory
            </div>
          )}
        </div>

        {/* Doctor Information Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Physician &amp; Clinic Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Doctor Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="e.g. Dr. K. Srinivas Rao, MD"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Doctor Medical Reg #
              </label>
              <input
                type="text"
                value={doctorRegistrationNumber}
                onChange={(e) => setDoctorRegistrationNumber(e.target.value)}
                placeholder="e.g. MCI-2012-9844"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Doctor / Clinic Phone
              </label>
              <input
                type="tel"
                value={doctorContact}
                onChange={(e) => setDoctorContact(e.target.value)}
                placeholder="e.g. +91 98480 12345"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Prescription Issue Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Prescription Expiry Date
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Prescribed Items Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Prescribed Medicines
              </h3>
              <p className="text-[11px] text-slate-400">Specify medications, required quantities, and dosage directions</p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              className="text-xs font-semibold text-teal-700"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Medicine
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 relative"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Select Medicine <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={item.medicine}
                      onChange={(e) => handleItemChange(idx, 'medicine', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                    >
                      <option value="">-- Choose Formulary Medicine --</option>
                      {medicinesList.map((m) => (
                        <option key={m._id || m.id} value={m._id || m.id}>
                          {m.name} ({m.dosageForm} - {m.strength}) {m.requiresPrescription ? '[Rx]' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Prescribed Qty <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.prescribedQuantity}
                      onChange={(e) => handleItemChange(idx, 'prescribedQuantity', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">
                      Dosage Instructions
                    </label>
                    <input
                      type="text"
                      value={item.dosageInstructions}
                      onChange={(e) => handleItemChange(idx, 'dosageInstructions', e.target.value)}
                      placeholder="e.g. 1 tab morning &amp; night after food"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">
                      Duration / Regimen
                    </label>
                    <input
                      type="text"
                      value={item.duration}
                      onChange={(e) => handleItemChange(idx, 'duration', e.target.value)}
                      placeholder="e.g. 5 days, 1 month"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-rose-600 p-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Prescription File Upload */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Upload className="w-4 h-4 text-teal-600" />
            Attach Physical Prescription Document (Optional)
          </h3>
          <p className="text-[11px] text-slate-500">
            Upload digital scan or photo of prescription (JPEG, PNG, WEBP or PDF, Max 5MB).
          </p>

          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            onChange={(e) => setFile(e.target.files[0] || null)}
            className="text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
          />

          {file && (
            <div className="text-xs text-emerald-700 font-medium flex items-center gap-1.5 mt-1">
              <FileText className="w-4 h-4" />
              <span>Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="pt-2 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/prescriptions')} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold"
          >
            <FilePlus className="w-4 h-4 mr-1.5" />
            Save Prescription (Pending Verification)
          </Button>
        </div>
      </form>

      {/* Customer Select Modal */}
      <CustomerSelectModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSelectCustomer={(c) => setCustomer(c)}
      />
    </div>
  );
};

export default AddPrescriptionPage;
