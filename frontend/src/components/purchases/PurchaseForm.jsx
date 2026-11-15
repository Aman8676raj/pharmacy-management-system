import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Building2, Calendar, FileText, Check, AlertCircle } from 'lucide-react';
import Button from '../common/Button';
import Alert from '../common/Alert';
import PurchaseItemRow from './PurchaseItemRow';
import PurchaseSummary from './PurchaseSummary';
import supplierService from '../../services/supplierService';
import medicineService from '../../services/medicineService';

export default function PurchaseForm({
  initialData = {},
  initialSupplierId = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
  isEdit = false,
}) {
  const [suppliers, setSuppliers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(true);

  const [formData, setFormData] = useState({
    supplier: initialData.supplier?._id || initialData.supplier || initialSupplierId || '',
    orderDate: initialData.orderDate
      ? new Date(initialData.orderDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    expectedDeliveryDate: initialData.expectedDeliveryDate
      ? new Date(initialData.expectedDeliveryDate).toISOString().split('T')[0]
      : '',
    status: initialData.status || 'draft',
    discount: initialData.discount || 0,
    shippingCharges: initialData.shippingCharges || 0,
    notes: initialData.notes || '',
    items:
      initialData.items && initialData.items.length > 0
        ? initialData.items.map((it) => ({
            medicine: it.medicine?._id || it.medicine,
            medicineName: it.medicineName || '',
            sku: it.sku || '',
            orderedQuantity: it.orderedQuantity || '',
            unitCost: it.unitCost || '',
            discount: it.discount || 0,
            taxRate: it.taxRate || 0,
          }))
        : [
            {
              medicine: '',
              medicineName: '',
              sku: '',
              orderedQuantity: '',
              unitCost: '',
              discount: 0,
              taxRate: 0,
            },
          ],
  });

  const [error, setError] = useState(null);

  // Load suppliers and active medicines
  useEffect(() => {
    const loadLookups = async () => {
      setLoadingLookups(true);
      try {
        const [supRes, medRes] = await Promise.all([
          supplierService.getSuppliers({ status: 'active', limit: 100 }),
          medicineService.getMedicines({ status: 'active', limit: 200 }),
        ]);

        if (supRes.success) {
          setSuppliers(supRes.data?.suppliers || []);
        }
        if (medRes.success) {
          setMedicines(medRes.data?.medicines || []);
        }
      } catch (err) {
        console.error('Error loading PO lookups:', err);
      } finally {
        setLoadingLookups(false);
      }
    };

    loadLookups();
  }, []);

  const handleItemChange = (index, updatedItem) => {
    const updated = [...formData.items];
    updated[index] = updatedItem;
    setFormData((prev) => ({ ...prev, items: updated }));
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          medicine: '',
          medicineName: '',
          sku: '',
          orderedQuantity: '',
          unitCost: '',
          discount: 0,
          taxRate: 0,
        },
      ],
    }));
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length <= 1) return;
    const updated = formData.items.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, items: updated }));
  };

  // Live calculations
  let subtotal = 0;
  let itemDiscounts = 0;
  let totalTax = 0;

  formData.items.forEach((item) => {
    const qty = parseFloat(item.orderedQuantity) || 0;
    const cost = parseFloat(item.unitCost) || 0;
    const disc = parseFloat(item.discount) || 0;
    const taxRate = parseFloat(item.taxRate) || 0;

    const lineSubtotal = qty * cost;
    const taxable = Math.max(0, lineSubtotal - disc);
    const lineTax = (taxable * taxRate) / 100;

    subtotal += lineSubtotal;
    itemDiscounts += disc;
    totalTax += lineTax;
  });

  const parsedOrderDiscount = parseFloat(formData.discount) || 0;
  const parsedShipping = parseFloat(formData.shippingCharges) || 0;
  const totalDiscount = itemDiscounts + parsedOrderDiscount;
  const totalAmount = Math.max(0, subtotal - totalDiscount + totalTax + parsedShipping);

  const handleSubmit = async (submitStatus) => {
    setError(null);

    if (!formData.supplier) {
      setError('Please select an active supplier.');
      return;
    }

    if (!formData.items || formData.items.length === 0) {
      setError('Please add at least one medicine item to the purchase order.');
      return;
    }

    // Validate each item
    for (let i = 0; i < formData.items.length; i++) {
      const it = formData.items[i];
      if (!it.medicine) {
        setError(`Please select a medicine for item #${i + 1}.`);
        return;
      }
      const qty = parseFloat(it.orderedQuantity);
      if (isNaN(qty) || qty <= 0) {
        setError(`Ordered quantity must be greater than 0 for item #${i + 1}.`);
        return;
      }
      const cost = parseFloat(it.unitCost);
      if (isNaN(cost) || cost < 0) {
        setError(`Unit cost cannot be negative for item #${i + 1}.`);
        return;
      }
    }

    try {
      const payload = {
        ...formData,
        status: submitStatus,
        discount: parsedOrderDiscount,
        shippingCharges: parsedShipping,
        items: formData.items.map((it) => ({
          medicine: it.medicine,
          orderedQuantity: parseFloat(it.orderedQuantity),
          unitCost: parseFloat(it.unitCost),
          discount: parseFloat(it.discount) || 0,
          taxRate: parseFloat(it.taxRate) || 0,
        })),
      };

      await onSubmit(payload);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit purchase order.');
    }
  };

  return (
    <div className="space-y-6">
      {error && <Alert type="error" title="Validation Error" message={error} onClose={() => setError(null)} />}

      {/* SECTION 1: Supplier & Dates Header */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Order Header &amp; Vendor</h3>
            <p className="text-xs text-slate-400">Select authorized distributor and expected fulfillment schedule</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Supplier <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.supplier}
              onChange={(e) => setFormData((prev) => ({ ...prev, supplier: e.target.value }))}
              disabled={loadingLookups}
              className="w-full text-xs rounded-lg border border-slate-300 py-2 px-3 bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            >
              <option value="">-- Choose Active Supplier --</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} [{s.supplierCode}] ({s.city || 'Hub'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Order Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={formData.orderDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, orderDate: e.target.value }))}
              className="w-full text-xs rounded-lg border border-slate-300 py-2 px-3 bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Expected Delivery Date
            </label>
            <input
              type="date"
              value={formData.expectedDeliveryDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, expectedDeliveryDate: e.target.value }))
              }
              className="w-full text-xs rounded-lg border border-slate-300 py-2 px-3 bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: Medicines Line Items */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Medicine Line Items</h3>
              <p className="text-xs text-slate-400">Add medications, requested quantities, and cost quotes</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={handleAddItem}
            className="flex items-center gap-1.5 text-xs text-teal-700 border-teal-200 hover:bg-teal-50"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Another Medicine
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-2.5 px-3">Medicine Form</th>
                <th className="py-2.5 px-3 text-right">Order Qty</th>
                <th className="py-2.5 px-3 text-right">Unit Cost ($)</th>
                <th className="py-2.5 px-3 text-right">Line Disc ($)</th>
                <th className="py-2.5 px-3 text-right">Tax (%)</th>
                <th className="py-2.5 px-3 text-right">Line Total ($)</th>
                <th className="py-2.5 px-3 text-center">Del</th>
              </tr>
            </thead>
            <tbody>
              {formData.items.map((item, idx) => (
                <PurchaseItemRow
                  key={idx}
                  item={item}
                  index={idx}
                  medicines={medicines}
                  onChange={handleItemChange}
                  onRemove={handleRemoveItem}
                  canRemove={formData.items.length > 1}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: Financials & Notes Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Notes & Commercial Terms (Left) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <FileText className="w-4 h-4 text-slate-400" />
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Procurement Notes &amp; Logistics Instructions
            </h4>
          </div>

          <div>
            <textarea
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="e.g. Please supply batches expiring no earlier than 12 months. Attach certificate of analysis (COA) with dispatch."
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Order-Level Discount ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.discount}
                onChange={(e) => setFormData((prev) => ({ ...prev, discount: e.target.value }))}
                placeholder="0.00"
                className="w-full text-xs rounded-lg border border-slate-300 py-1.5 px-2.5 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Shipping Charges ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.shippingCharges}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, shippingCharges: e.target.value }))
                }
                placeholder="0.00"
                className="w-full text-xs rounded-lg border border-slate-300 py-1.5 px-2.5 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Live Calculation Summary (Right) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
          <PurchaseSummary
            subtotal={subtotal}
            discount={totalDiscount}
            taxAmount={totalTax}
            shippingCharges={formData.shippingCharges}
            totalAmount={totalAmount}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <Button variant="outline" size="sm" type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => handleSubmit('draft')}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save as Draft'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            type="button"
            onClick={() => handleSubmit('ordered')}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              'Submitting...'
            ) : (
              <>
                <Check className="w-4 h-4 mr-1.5" />
                {isEdit ? 'Update & Place Order' : 'Submit & Place Order'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
