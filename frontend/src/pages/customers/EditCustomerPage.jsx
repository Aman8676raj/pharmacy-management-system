import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import customerService from '../../services/customerService';
import { Button } from '../../components/common/Button';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

export const EditCustomerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    gender: 'prefer_not_to_say',
    city: '',
    state: '',
    postalCode: '',
    address: '',
    notes: '',
  });

  const [customerCode, setCustomerCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        const res = await customerService.getCustomerById(id);
        const c = res.data?.customer;
        if (c) {
          setCustomerCode(c.customerCode);
          setFormData({
            name: c.name || '',
            phone: c.phone || '',
            email: c.email || '',
            dateOfBirth: c.dateOfBirth ? c.dateOfBirth.split('T')[0] : '',
            gender: c.gender || 'prefer_not_to_say',
            city: c.city || '',
            state: c.state || '',
            postalCode: c.postalCode || '',
            address: c.address || '',
            notes: c.notes || '',
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load customer');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.phone.trim()) {
      setError('Customer name and phone number are required.');
      return;
    }

    try {
      setSaveLoading(true);
      await customerService.updateCustomer(id, formData);
      navigate(`/customers/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update customer');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/customers/${id}`)}
          className="text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Profile
        </Button>
        <div className="h-5 w-px bg-slate-200" />
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            Edit Customer — <span className="font-mono text-teal-700">{customerCode}</span>
          </h1>
          <p className="text-xs text-slate-500">Update patient details and clinical remarks</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              >
                <option value="prefer_not_to_say">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Postal Code</label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Street Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Medical / Pharmacy Notes</label>
            <textarea
              name="notes"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate(`/customers/${id}`)} disabled={saveLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={saveLoading} className="bg-teal-600 hover:bg-teal-700 text-white font-semibold">
              <Save className="w-4 h-4 mr-1.5" />
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCustomerPage;
