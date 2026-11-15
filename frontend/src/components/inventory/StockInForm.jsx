import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Search,
  Check,
  Calendar,
  Layers,
  CircleDollarSign,
  AlertCircle,
  Truck,
  Hash,
  Pill,
} from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';
import Alert from '../common/Alert';
import medicineService from '../../services/medicineService';

export const StockInForm = ({ onSubmit, onCancel, isSubmitting = false, initialMedicineId = null }) => {
  const [formData, setFormData] = useState({
    medicine: initialMedicineId || '',
    batchNumber: '',
    manufacturingDate: '',
    expiryDate: '',
    supplierName: '',
    purchasePrice: '',
    sellingPrice: '',
    quantityReceived: '',
    receivedDate: new Date().toISOString().split('T')[0],
  });

  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [medicineQuery, setMedicineQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);

  // If initialMedicineId is provided, load its details
  useEffect(() => {
    if (initialMedicineId) {
      medicineService.getMedicineById(initialMedicineId)
        .then((res) => {
          if (res.success && res.data?.medicine) {
            setSelectedMedicine(res.data.medicine);
            setFormData((prev) => ({ ...prev, medicine: res.data.medicine.id || res.data.medicine._id }));
          }
        })
        .catch((err) => console.error('Error fetching initial medicine:', err));
    }
  }, [initialMedicineId]);

  // Search medicines for selection
  useEffect(() => {
    if (!medicineQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await medicineService.searchMedicines(medicineQuery.trim());
        if (res.success && res.data?.medicines) {
          setSearchResults(res.data.medicines);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [medicineQuery]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (formError) setFormError(null);
  };

  const handleSelectMedicine = (med) => {
    setSelectedMedicine(med);
    setFormData((prev) => ({ ...prev, medicine: med.id || med._id }));
    setMedicineQuery('');
    setSearchResults([]);
    if (errors.medicine) {
      setErrors((prev) => ({ ...prev, medicine: null }));
    }
  };

  const validate = () => {
    const errs = {};

    if (!formData.medicine) {
      errs.medicine = 'Please search and select a medicine.';
    }

    if (!formData.batchNumber.trim()) {
      errs.batchNumber = 'Batch number is required.';
    }

    if (!formData.expiryDate) {
      errs.expiryDate = 'Expiry date is required.';
    } else if (
      formData.manufacturingDate &&
      new Date(formData.expiryDate) <= new Date(formData.manufacturingDate)
    ) {
      errs.expiryDate = 'Expiry date must be later than manufacturing date.';
    }

    const qty = parseFloat(formData.quantityReceived);
    if (!formData.quantityReceived || isNaN(qty) || qty <= 0) {
      errs.quantityReceived = 'Quantity received must be a positive number greater than 0.';
    }

    const pPrice = parseFloat(formData.purchasePrice);
    if (formData.purchasePrice === '' || isNaN(pPrice) || pPrice < 0) {
      errs.purchasePrice = 'Purchase price must be a non-negative number.';
    }

    const sPrice = parseFloat(formData.sellingPrice);
    if (formData.sellingPrice === '' || isNaN(sPrice) || sPrice < 0) {
      errs.sellingPrice = 'Selling price must be a non-negative number.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!validate()) return;

    try {
      const payload = {
        ...formData,
        batchNumber: formData.batchNumber.trim().toUpperCase(),
        quantityReceived: parseFloat(formData.quantityReceived),
        purchasePrice: parseFloat(formData.purchasePrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        supplierName: formData.supplierName.trim(),
        manufacturingDate: formData.manufacturingDate || undefined,
      };

      await onSubmit(payload);
    } catch (err) {
      setFormError(err.message || 'Failed to record stock intake.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <Alert type="error" onClose={() => setFormError(null)}>
          {formError}
        </Alert>
      )}

      {/* SECTION 1: Medicine Selection */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
            <Pill className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Medicine Selection</h3>
            <p className="text-[11px] text-slate-500">
              Select the active pharmaceutical product for this batch intake
            </p>
          </div>
        </div>

        {selectedMedicine ? (
          <div className="p-3.5 bg-teal-50/50 rounded-xl border border-teal-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">
                  {selectedMedicine.name}
                </span>
                <span className="text-[11px] font-mono text-teal-800 bg-teal-100 px-2 py-0.5 rounded font-semibold">
                  {selectedMedicine.sku}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Generic: {selectedMedicine.genericName || '-'} • Category:{' '}
                <span className="font-medium text-slate-800">{selectedMedicine.category}</span>
                {selectedMedicine.dosageForm && ` • Form: ${selectedMedicine.dosageForm}`}
                {selectedMedicine.strength && ` (${selectedMedicine.strength})`}
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedMedicine(null);
                setFormData((prev) => ({ ...prev, medicine: '' }));
              }}
            >
              Change Medicine
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search active medicine by name, generic, brand, or SKU..."
                value={medicineQuery}
                onChange={(e) => setMedicineQuery(e.target.value)}
                className={`w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors ${
                  errors.medicine ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                }`}
              />
            </div>

            {errors.medicine && (
              <p className="text-xs text-rose-600 font-medium">{errors.medicine}</p>
            )}

            {/* Live Autocomplete Results */}
            {searchResults.length > 0 && (
              <div className="border border-slate-200 rounded-lg shadow-lg bg-white divide-y divide-slate-100 max-h-56 overflow-y-auto z-20">
                {searchResults.map((m) => (
                  <div
                    key={m.id || m._id}
                    onClick={() => handleSelectMedicine(m)}
                    className="p-3 hover:bg-teal-50/60 cursor-pointer transition-colors text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{m.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {m.genericName || m.category} • SKU: <span className="font-mono">{m.sku}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      Select
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 2: Batch Information */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <Hash className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Batch Identification & Expiry</h3>
            <p className="text-[11px] text-slate-500">
              Manufacturing codes, expiry dates, and distribution references
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Batch Number */}
          <Input
            label="Batch Number / Lot #"
            name="batchNumber"
            value={formData.batchNumber}
            onChange={handleChange}
            placeholder="e.g. BT-2026-081"
            error={errors.batchNumber}
            helperText="If the same medicine and batch number exists, stock will be added to it"
            className="font-mono"
            required
          />

          {/* Supplier Name */}
          <Input
            label="Supplier / Distributor Name (Optional)"
            name="supplierName"
            value={formData.supplierName}
            onChange={handleChange}
            placeholder="e.g. Apex Health Logistics, Global Pharma Dist."
            leftIcon={<Truck className="w-4 h-4" />}
          />

          {/* Manufacturing Date */}
          <Input
            label="Manufacturing Date (Optional)"
            type="date"
            name="manufacturingDate"
            value={formData.manufacturingDate}
            onChange={handleChange}
            leftIcon={<Calendar className="w-4 h-4" />}
          />

          {/* Expiry Date */}
          <Input
            label="Expiry Date"
            type="date"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            error={errors.expiryDate}
            leftIcon={<Calendar className="w-4 h-4" />}
            required
          />
        </div>
      </div>

      {/* SECTION 3: Pricing & Quantities */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <CircleDollarSign className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Stock Details & Unit Pricing</h3>
            <p className="text-[11px] text-slate-500">
              Units received, acquisition cost, and retail dispensing price
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Quantity Received */}
          <Input
            label="Quantity Received (Units)"
            type="number"
            min="1"
            name="quantityReceived"
            value={formData.quantityReceived}
            onChange={handleChange}
            placeholder="e.g. 100"
            error={errors.quantityReceived}
            required
          />

          {/* Purchase Price */}
          <Input
            label="Purchase Cost per Unit ($)"
            type="number"
            min="0"
            step="0.01"
            name="purchasePrice"
            value={formData.purchasePrice}
            onChange={handleChange}
            placeholder="e.g. 3.50"
            error={errors.purchasePrice}
            required
          />

          {/* Selling Price */}
          <Input
            label="Selling Price per Unit ($)"
            type="number"
            min="0"
            step="0.01"
            name="sellingPrice"
            value={formData.sellingPrice}
            onChange={handleChange}
            placeholder="e.g. 6.00"
            error={errors.sellingPrice}
            required
          />

          {/* Received Date */}
          <div className="sm:col-span-2 lg:col-span-3">
            <Input
              label="Intake Received Date"
              type="date"
              name="receivedDate"
              value={formData.receivedDate}
              onChange={handleChange}
              leftIcon={<Calendar className="w-4 h-4" />}
            />
          </div>
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          leftIcon={<Check className="w-4 h-4" />}
        >
          Confirm & Add Stock
        </Button>
      </div>
    </form>
  );
};

export default StockInForm;
