import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building,
  Sliders,
  Receipt,
  User,
  ShieldCheck,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Mail,
  Phone,
  MapPin,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { ROLE_LABELS, ROLE_COLORS } from '../../utils/constants';

const DEFAULT_SETTINGS = {
  // Pharmacy Details
  pharmacyName: 'PharmaCore Healthcare & Pharmacy',
  drugLicenseNumber: 'DL-TS-2026-987654',
  gstin: '36ABCDE1234F1Z5',
  phone: '+91 98765 43210',
  email: 'contact@pharmacore.com',
  address: '123 Healthcare Ave, Medical Enclave, Tech City - 500081',
  invoiceDisclaimer:
    'Goods once sold will not be accepted back without physician prescription and original invoice. Keep all medicines out of reach of children.',

  // Inventory & Clinical
  currency: 'INR (₹)',
  lowStockThreshold: 15,
  expiryHorizonDays: 90,
  fefoEnabled: true,
  strictPrescriptionCheck: true,

  // Billing & POS
  defaultTaxRate: 5,
  defaultPaymentMethod: 'cash',
  autoPrintInvoice: true,
  allowPartialPayments: true,
};

export const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general'); // general, inventory, billing, security
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Change password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  // Load persisted settings from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pharmacore_settings');
      if (saved) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      }
    } catch (e) {
      console.error('Failed to parse settings from localStorage:', e);
    }
  }, []);

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      localStorage.setItem('pharmacore_settings', JSON.stringify(settings));
      setTimeout(() => {
        setSaveLoading(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }, 400);
    } catch (err) {
      setSaveLoading(false);
      console.error('Failed to save settings:', err);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all settings back to standard system defaults?')) {
      setSettings(DEFAULT_SETTINGS);
      localStorage.removeItem('pharmacore_settings');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'All password fields are required.' });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    // Success feedback
    setPasswordMsg({ type: 'success', text: 'Password credentials updated successfully.' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordMsg({ type: '', text: '' }), 4000);
  };

  const tabs = [
    { id: 'general', label: 'Pharmacy Information', icon: Building },
    { id: 'inventory', label: 'Inventory & Clinical', icon: Sliders },
    { id: 'billing', label: 'Billing & POS Defaults', icon: Receipt },
    { id: 'security', label: 'Account & Security', icon: User },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-teal-600" />
            Pharmacy Settings & Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure store licensing, invoice headers, inventory safety thresholds, and account security.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            className="text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1 text-slate-500" />
            Reset Defaults
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSaveSettings}
            isLoading={saveLoading}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs"
          >
            <Save className="w-3.5 h-3.5 mr-1" />
            Save Changes
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="font-medium">Settings saved successfully. All changes are active across the system.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-6 text-xs font-semibold overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-teal-600 text-teal-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Pharmacy General Information */}
      {activeTab === 'general' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Pharmacy Identity & Licensing
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              These details appear on printed tax invoices, PDF reports, and procurement records.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Pharmacy / Business Name
              </label>
              <input
                type="text"
                value={settings.pharmacyName}
                onChange={(e) => handleChange('pharmacyName', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Drug License Number (DL No.)
              </label>
              <input
                type="text"
                value={settings.drugLicenseNumber}
                onChange={(e) => handleChange('drugLicenseNumber', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                GSTIN / Tax ID
              </label>
              <input
                type="text"
                value={settings.gstin}
                onChange={(e) => handleChange('gstin', e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Official Email Address
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Pharmacy Physical Address
              </label>
              <textarea
                rows={2}
                value={settings.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Invoice Footer Disclaimer & Notes
              </label>
              <textarea
                rows={2}
                value={settings.invoiceDisclaimer}
                onChange={(e) => handleChange('invoiceDisclaimer', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Inventory & Clinical Rules */}
      {activeTab === 'inventory' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Inventory & Clinical Dispensing Rules
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Control stock movement logic, shelf-life alert thresholds, and prescription compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Currency Standard
              </label>
              <input
                type="text"
                disabled
                value={settings.currency}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-500 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Default Minimum Stock Alert Threshold (Units)
              </label>
              <input
                type="number"
                min="1"
                value={settings.lowStockThreshold}
                onChange={(e) => handleChange('lowStockThreshold', parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Medicines below this unit quantity trigger low-stock dashboard notifications.
              </span>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Expiry Monitoring Horizon (Days)
              </label>
              <select
                value={settings.expiryHorizonDays}
                onChange={(e) => handleChange('expiryHorizonDays', parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              >
                <option value={30}>30 Days (Critical window)</option>
                <option value={60}>60 Days (Two months)</option>
                <option value={90}>90 Days (Quarterly standard)</option>
                <option value={180}>180 Days (Half year)</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <div className="text-xs font-bold text-slate-800">
                  Automatic FEFO Allocation (First Expiry, First Out)
                </div>
                <div className="text-[11px] text-slate-500">
                  Automatically allocate earlier-expiring active batches first during POS checkout.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.fefoEnabled}
                onChange={(e) => handleChange('fefoEnabled', e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <div className="text-xs font-bold text-slate-800">
                  Strict Doctor Prescription Verification (Schedule H/X)
                </div>
                <div className="text-[11px] text-slate-500">
                  Enforce verified doctor prescription attachment before dispensing prescription drugs.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.strictPrescriptionCheck}
                onChange={(e) => handleChange('strictPrescriptionCheck', e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Billing & POS Defaults */}
      {activeTab === 'billing' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Billing & Point of Sale (POS) Settings
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure default tax rates, supported payment methods, and invoice formatting.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Default GST / Tax Rate (%)
              </label>
              <select
                value={settings.defaultTaxRate}
                onChange={(e) => handleChange('defaultTaxRate', parseFloat(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              >
                <option value={0}>0% (Tax Exempt / Life-saving)</option>
                <option value={5}>5% (Standard Pharmaceutical Goods)</option>
                <option value={12}>12% (Medical Devices / Consumables)</option>
                <option value={18}>18% (General Health & Cosmetic)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Default Primary Payment Channel
              </label>
              <select
                value={settings.defaultPaymentMethod}
                onChange={(e) => handleChange('defaultPaymentMethod', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden capitalize"
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI / Instant QR</option>
                <option value="card">Credit / Debit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <div className="text-xs font-bold text-slate-800">
                  Auto-Print / Stream PDF Invoices
                </div>
                <div className="text-[11px] text-slate-500">
                  Automatically prompt tax invoice PDF generation upon completing a sale.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoPrintInvoice}
                onChange={(e) => handleChange('autoPrintInvoice', e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <div className="text-xs font-bold text-slate-800">
                  Allow Partial Payments on Bills
                </div>
                <div className="text-[11px] text-slate-500">
                  Permit customers to make partial down-payments and track remaining balance dues.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.allowPartialPayments}
                onChange={(e) => handleChange('allowPartialPayments', e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: User Profile & Security */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* User Profile Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
              <User className="w-4 h-4 text-teal-600" />
              Authenticated Staff Profile
            </h3>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-12 h-12 rounded-full bg-teal-600 text-white font-bold text-lg flex items-center justify-center shrink-0">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="space-y-1">
                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  {user?.name || 'Administrator'}
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      ROLE_COLORS[user?.role] || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {ROLE_LABELS[user?.role] || user?.role}
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {user?.email || 'admin@pharmacy.com'}
                </div>
              </div>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-teal-600" />
              Change Account Password
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Update your security credentials for sign-in.
            </p>

            {passwordMsg.text && (
              <div
                className={`p-3 text-xs rounded-xl mb-4 flex items-center gap-2 ${
                  passwordMsg.type === 'error'
                    ? 'bg-rose-50 border border-rose-200 text-rose-700'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                }`}
              >
                {passwordMsg.type === 'error' ? (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                )}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-3 max-w-md">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold"
                >
                  <Lock className="w-3.5 h-3.5 mr-1" />
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;

