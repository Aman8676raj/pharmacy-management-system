import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import customerService from '../../services/customerService';
import { Search, UserPlus, Check, Phone, User, AlertCircle } from 'lucide-react';

export const CustomerSelectModal = ({ isOpen, onClose, onSelectCustomer }) => {
  const [activeTab, setActiveTab] = useState('search'); // 'search' or 'create'
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Quick Create Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSearchResults([]);
      setError('');
      setActiveTab('search');
    }
  }, [isOpen]);

  // Handle search
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchTerm.trim().length >= 2) {
        try {
          setLoading(true);
          const res = await customerService.searchCustomers(searchTerm.trim());
          setSearchResults(res.data?.customers || []);
        } catch (err) {
          console.error('Customer search error:', err);
        } finally {
          setLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleQuickCreate = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !phone.trim()) {
      setError('Customer name and phone number are required.');
      return;
    }

    try {
      setCreateLoading(true);
      const res = await customerService.createCustomer({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        city: city.trim(),
        address: address.trim(),
      });
      const newCust = res.data.customer;
      onSelectCustomer(newCust);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create customer');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select or Register Customer"
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {/* Tab switch */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 transition-colors ${
              activeTab === 'search'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Search Patient Directory
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 transition-colors ${
              activeTab === 'create'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            + Register New Customer
          </button>
        </div>

        {activeTab === 'search' ? (
          <div className="space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type customer name, phone number or CUST code..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            {/* Results list */}
            <div className="max-h-60 overflow-y-auto space-y-1.5 divide-y divide-slate-100 pr-1">
              {loading ? (
                <div className="text-center py-6 text-xs text-slate-400">Searching...</div>
              ) : searchResults.length > 0 ? (
                searchResults.map((cust) => (
                  <div
                    key={cust._id}
                    onClick={() => {
                      onSelectCustomer(cust);
                      onClose();
                    }}
                    className="p-2.5 rounded-lg hover:bg-teal-50/70 border border-slate-100 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                        <span>{cust.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">({cust.customerCode})</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {cust.phone}
                        </span>
                        {cust.city && <span>• {cust.city}</span>}
                      </div>
                    </div>

                    <Button variant="ghost" size="sm" className="text-xs text-teal-700 font-semibold">
                      Select
                    </Button>
                  </div>
                ))
              ) : searchTerm.trim().length >= 2 ? (
                <div className="text-center py-6">
                  <p className="text-xs text-slate-500">No customers found matching "{searchTerm}".</p>
                  <button
                    type="button"
                    onClick={() => {
                      setName(searchTerm);
                      setActiveTab('create');
                    }}
                    className="mt-2 text-xs font-semibold text-teal-700 hover:underline"
                  >
                    Click here to register "{searchTerm}"
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-400">
                  Enter at least 2 characters to search patient records.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Quick Create Form */
          <form onSubmit={handleQuickCreate} className="space-y-3">
            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Anand Kumar"
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Hyderabad"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Optional"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street / Colony / Landmark"
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setActiveTab('search')}>
                Back to Search
              </Button>
              <Button type="submit" variant="primary" isLoading={createLoading} className="bg-teal-600 text-white">
                Save &amp; Select Customer
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
