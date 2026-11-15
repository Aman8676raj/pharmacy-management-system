import React, { useState, useEffect } from 'react';
import { Pill, Check, X, ShieldAlert, Layers, Package, FileText, Barcode, Hash } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { DOSAGE_FORMS, PACKAGE_UNITS, COMMON_CATEGORIES } from '../../utils/constants';

export const MedicineForm = ({
  initialData = null,
  isEdit = false,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    brandName: '',
    category: '',
    manufacturer: '',
    description: '',
    composition: '',
    dosageForm: 'Tablet',
    strength: '',
    packSize: '',
    unit: 'Strip',
    sku: '',
    barcode: '',
    requiresPrescription: false,
    minimumStock: 10,
    isActive: true,
  });

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);

  // Prepopulate values if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        genericName: initialData.genericName || '',
        brandName: initialData.brandName || '',
        category: initialData.category || '',
        manufacturer: initialData.manufacturer || '',
        description: initialData.description || '',
        composition: initialData.composition || '',
        dosageForm: initialData.dosageForm || 'Tablet',
        strength: initialData.strength || '',
        packSize: initialData.packSize || '',
        unit: initialData.unit || 'Strip',
        sku: initialData.sku || '',
        barcode: initialData.barcode || '',
        requiresPrescription: Boolean(initialData.requiresPrescription),
        minimumStock: initialData.minimumStock !== undefined ? initialData.minimumStock : 10,
        isActive: initialData.isActive !== undefined ? Boolean(initialData.isActive) : true,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (formError) {
      setFormError(null);
    }
  };

  const validate = () => {
    const errs = {};

    if (!formData.name.trim()) {
      errs.name = 'Medicine name is required';
    }

    if (!formData.category.trim()) {
      errs.category = 'Category is required';
    }

    if (!formData.sku.trim()) {
      errs.sku = 'SKU is required';
    } else if (formData.sku.trim().length < 2) {
      errs.sku = 'SKU must be at least 2 characters';
    }

    if (formData.minimumStock === '' || isNaN(formData.minimumStock) || Number(formData.minimumStock) < 0) {
      errs.minimumStock = 'Minimum stock must be a non-negative number';
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
        sku: formData.sku.trim().toUpperCase(),
        barcode: formData.barcode.trim() || undefined,
        minimumStock: parseInt(formData.minimumStock, 10) || 0,
      };

      await onSubmit(payload);
    } catch (err) {
      setFormError(err.message || 'Failed to save medicine record.');
    }
  };

  // Helper to generate a recommended SKU from medicine name & category
  const handleAutoGenerateSku = () => {
    if (!formData.name.trim()) return;
    const cleanName = formData.name
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 4)
      .toUpperCase();
    const cleanCat = (formData.category || 'MED')
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 4)
      .toUpperCase();
    const rand = Math.floor(100 + Math.random() * 900);
    setFormData((prev) => ({
      ...prev,
      sku: `${cleanCat}-${cleanName}-${rand}`,
    }));
    if (errors.sku) {
      setErrors((prev) => ({ ...prev, sku: null }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <Alert type="error" onClose={() => setFormError(null)}>
          {formError}
        </Alert>
      )}

      {/* SECTION 1: Basic Information */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
            <Pill className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Basic Information</h3>
            <p className="text-[11px] text-slate-500">Core identification and clinical naming</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Medicine Name */}
          <div className="md:col-span-2">
            <Input
              label="Medicine Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Paracetamol 500mg, Amoxicillin 250mg"
              error={errors.name}
              required
            />
          </div>

          {/* Generic Name */}
          <Input
            label="Generic Name (Active Ingredient)"
            name="genericName"
            value={formData.genericName}
            onChange={handleChange}
            placeholder="e.g. Acetaminophen, Amoxicillin Trihydrate"
          />

          {/* Brand Name */}
          <Input
            label="Brand / Trade Name"
            name="brandName"
            value={formData.brandName}
            onChange={handleChange}
            placeholder="e.g. Panadol, Amoxil"
          />

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Category <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                list="category-suggestions"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Select or type category (e.g. Antibiotics)"
                className={`w-full rounded-lg border text-sm py-2 px-3.5 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.category
                    ? 'border-rose-400 bg-rose-50/20 text-rose-900'
                    : 'border-slate-300 bg-white text-slate-900'
                }`}
              />
              <datalist id="category-suggestions">
                {COMMON_CATEGORIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            {errors.category && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.category}</p>
            )}
          </div>

          {/* Manufacturer */}
          <Input
            label="Manufacturer / Supplier"
            name="manufacturer"
            value={formData.manufacturer}
            onChange={handleChange}
            placeholder="e.g. GSK Consumer Healthcare, Pfizer, Novartis"
          />

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description / Clinical Indications
            </label>
            <textarea
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief details regarding indications, usage, or precautions..."
              className="w-full rounded-lg border border-slate-300 text-sm py-2 px-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: Medicine Specifications */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Medicine Specifications</h3>
            <p className="text-[11px] text-slate-500">Dosage formulation, strength, and packaging units</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Composition */}
          <div className="md:col-span-3">
            <Input
              label="Composition (Detailed Formula)"
              name="composition"
              value={formData.composition}
              onChange={handleChange}
              placeholder="e.g. Paracetamol 500mg, Caffeine 30mg"
            />
          </div>

          {/* Dosage Form */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Dosage Form
            </label>
            <select
              name="dosageForm"
              value={formData.dosageForm}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 text-sm py-2 px-3 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {DOSAGE_FORMS.map((form) => (
                <option key={form} value={form}>
                  {form}
                </option>
              ))}
            </select>
          </div>

          {/* Strength */}
          <Input
            label="Strength"
            name="strength"
            value={formData.strength}
            onChange={handleChange}
            placeholder="e.g. 500mg, 250mg/5ml, 1%"
          />

          {/* Unit */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Dispensing Unit
            </label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 text-sm py-2 px-3 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {PACKAGE_UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* Pack Size */}
          <div className="md:col-span-3">
            <Input
              label="Package Size / Presentation"
              name="packSize"
              value={formData.packSize}
              onChange={handleChange}
              placeholder="e.g. 10x10 Tablets, 100ml Bottle, 1 Vial with Solvent"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: Identifiers & Additional Information */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
            <Hash className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Additional Information & Codes</h3>
            <p className="text-[11px] text-slate-500">Inventory identifiers and regulatory flags</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* SKU */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                SKU Identifier <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAutoGenerateSku}
                className="text-[11px] text-teal-600 hover:text-teal-800 font-medium underline"
              >
                Auto-generate
              </button>
            </div>
            <Input
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              placeholder="e.g. MED-PARA-500"
              error={errors.sku}
              className="font-mono"
              required
            />
          </div>

          {/* Barcode */}
          <Input
            label="Barcode (EAN / UPC / Code 128)"
            name="barcode"
            value={formData.barcode}
            onChange={handleChange}
            placeholder="e.g. 890103001001"
            leftIcon={<Barcode className="w-4 h-4" />}
            className="font-mono"
          />

          {/* Minimum Stock Threshold */}
          <Input
            label="Minimum Reorder Threshold (Units)"
            type="number"
            min="0"
            name="minimumStock"
            value={formData.minimumStock}
            onChange={handleChange}
            error={errors.minimumStock}
            helperText="Triggers low-stock alerts when inventory drops below this number"
          />

          {/* Prescription Required Toggle */}
          <div className="flex flex-col justify-center">
            <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Prescription Requirement (Rx)
            </span>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                name="requiresPrescription"
                checked={formData.requiresPrescription}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600" />
              <span className="ml-3 text-xs font-medium text-slate-700">
                {formData.requiresPrescription ? (
                  <span className="text-rose-700 font-semibold">Requires Doctor Prescription (Rx Only)</span>
                ) : (
                  <span className="text-emerald-700">Over-The-Counter (OTC - No Rx Required)</span>
                )}
              </span>
            </label>
          </div>

          {/* Active Status (if edit mode) */}
          {isEdit && (
            <div className="md:col-span-2 pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Record Status
                </span>
                <p className="text-[11px] text-slate-400">
                  Deactivated records are excluded from default listings and searches
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600" />
                <span className="ml-3 text-xs font-medium text-slate-700">
                  {formData.isActive ? 'Active' : 'Deactivated'}
                </span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          leftIcon={<Check className="w-4 h-4" />}
        >
          {isEdit ? 'Save Medicine Changes' : 'Register Medicine'}
        </Button>
      </div>
    </form>
  );
};

export default MedicineForm;

