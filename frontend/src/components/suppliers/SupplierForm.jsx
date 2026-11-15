import React, { useState } from 'react';
import { Truck, Phone, MapPin, FileText, Check, AlertCircle } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { PAYMENT_TERMS_CONFIGS } from '../../utils/constants';

export default function SupplierForm({
  initialData = {},
  onSubmit,
  onCancel,
  isSubmitting = false,
  isEdit = false,
}) {
  const [formData, setFormData] = useState({
    supplierCode: initialData.supplierCode || '',
    name: initialData.name || '',
    contactPerson: initialData.contactPerson || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    alternatePhone: initialData.alternatePhone || '',
    address: initialData.address || '',
    city: initialData.city || '',
    state: initialData.state || '',
    postalCode: initialData.postalCode || '',
    country: initialData.country || 'India',
    gstNumber: initialData.gstNumber || '',
    drugLicenseNumber: initialData.drugLicenseNumber || '',
    paymentTerms: initialData.paymentTerms || 'net_30',
    notes: initialData.notes || '',
  });

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Supplier name is required.';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required.';
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errs.email = 'Please provide a valid email address.';
      }
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
        supplierCode: formData.supplierCode.trim() ? formData.supplierCode.trim().toUpperCase() : undefined,
        name: formData.name.trim(),
        gstNumber: formData.gstNumber.trim() ? formData.gstNumber.trim().toUpperCase() : undefined,
        email: formData.email.trim() ? formData.email.trim().toLowerCase() : undefined,
      };
      await onSubmit(payload);
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to save supplier details.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <Alert type="error" title="Submission Error" message={formError} onClose={() => setFormError(null)} />
      )}

      {/* SECTION 1: Basic Identification */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Basic Information</h3>
            <p className="text-xs text-slate-400">Supplier entity name and code identification</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Supplier Company Name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="e.g. Apex Health Distributors Pvt Ltd"
            />
          </div>

          <div>
            <Input
              label="Supplier Code"
              name="supplierCode"
              value={formData.supplierCode}
              onChange={handleChange}
              error={errors.supplierCode}
              placeholder={isEdit ? 'SUP-0001' : 'Auto-generated if empty'}
              helperText={isEdit ? 'Unique identifier' : 'Leave empty to auto-assign'}
            />
          </div>

          <div className="md:col-span-3">
            <Input
              label="Primary Contact Person"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              placeholder="e.g. Vikram Malhotra (Key Accounts Mgr)"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: Contact Information */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Contact Details</h3>
            <p className="text-xs text-slate-400">Communication lines for purchase orders and dispatch</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Input
              label="Primary Phone Number"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="e.g. +91 98201 12345"
            />
          </div>

          <div>
            <Input
              label="Alternate Phone Number"
              name="alternatePhone"
              value={formData.alternatePhone}
              onChange={handleChange}
              placeholder="e.g. +91 22 2845 6789"
            />
          </div>

          <div>
            <Input
              label="Official Orders Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="e.g. orders@apexhealth.in"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: Address & Location */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Warehouse &amp; Billing Address</h3>
            <p className="text-xs text-slate-400">Physical address for dispatch and invoices</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-4">
            <Input
              label="Street Address / Logistics Unit"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. Plot 42, Logistics Park, Phase II"
            />
          </div>

          <div>
            <Input
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g. Mumbai"
            />
          </div>

          <div>
            <Input
              label="State / Province"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="e.g. Maharashtra"
            />
          </div>

          <div>
            <Input
              label="Postal / ZIP Code"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="e.g. 400069"
            />
          </div>

          <div>
            <Input
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="India"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: Business, Licensing & Payment Terms */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Business &amp; Commercial Terms</h3>
            <p className="text-xs text-slate-400">Tax compliance, wholesale drug license, and credit terms</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Input
              label="GST Identification Number (GSTIN)"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={handleChange}
              placeholder="e.g. 27AABCA1234F1Z1"
              helperText="Optional, checked for uniqueness"
            />
          </div>

          <div>
            <Input
              label="Wholesale Drug License No."
              name="drugLicenseNumber"
              value={formData.drugLicenseNumber}
              onChange={handleChange}
              placeholder="e.g. DL-MH-2024-8841"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Agreed Payment Terms
            </label>
            <select
              name="paymentTerms"
              value={formData.paymentTerms}
              onChange={handleChange}
              className="w-full text-xs rounded-lg border border-slate-300 py-2.5 px-3 bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            >
              {Object.entries(PAYMENT_TERMS_CONFIGS).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Internal Procurement Notes
            </label>
            <textarea
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g. Authorized distributor for GSK and Pfizer products. Minimum order value $500 for free delivery."
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Submit / Cancel Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <Button variant="outline" size="sm" type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            'Saving Supplier...'
          ) : (
            <>
              <Check className="w-4 h-4 mr-1.5" />
              {isEdit ? 'Update Supplier Profile' : 'Register Supplier'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

