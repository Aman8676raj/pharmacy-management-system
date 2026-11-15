import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

export const StockFilters = ({
  filters = {},
  onChange,
  onFilterChange,
  onReset,
  categories = [],
  isLoading = false,
}) => {
  const triggerChange = (updated) => {
    if (onFilterChange) onFilterChange(updated);
    if (onChange) onChange(updated);
  };

  const handleInputChange = (field, value) => {
    triggerChange({ ...filters, [field]: value, page: 1 });
  };

  const handleExpiryFilter = (value) => {
    if (value === 'expiring_soon') {
      triggerChange({ ...filters, expiringSoon: true, isExpired: false, expiry: value, page: 1 });
    } else if (value === 'expired') {
      triggerChange({ ...filters, expiringSoon: false, isExpired: true, expiry: value, page: 1 });
    } else {
      triggerChange({ ...filters, expiringSoon: false, isExpired: false, expiry: 'all', page: 1 });
    }
  };

  const handleReset = () => {
    const defaultFilters = {
      search: '',
      category: 'all',
      status: 'all',
      expiry: 'all',
      expiringSoon: false,
      isExpired: false,
      sortBy: 'expiryDate',
      sortOrder: 'asc',
      page: 1,
    };
    if (onReset) {
      onReset();
    } else {
      triggerChange(defaultFilters);
    }
  };

  const hasActiveFilters =
    Boolean(filters.search) ||
    (filters.category && filters.category !== 'all') ||
    (filters.status && filters.status !== 'all') ||
    Boolean(filters.expiringSoon) ||
    Boolean(filters.isExpired) ||
    (filters.expiry && filters.expiry !== 'all');

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="md:col-span-5 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by medicine, generic, SKU, batch #, or supplier..."
            value={filters.search || ''}
            onChange={(e) => handleInputChange('search', e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white transition-colors"
          />
        </div>

        {/* Category */}
        <div className="md:col-span-3">
          <select
            value={filters.category || 'all'}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="md:col-span-2">
          <select
            value={filters.status || 'all'}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Stock</option>
            <option value="depleted">Depleted (0 units)</option>
            <option value="expired">Expired</option>
            <option value="quarantined">Quarantined</option>
          </select>
        </div>

        {/* Expiry classification */}
        <div className="md:col-span-2">
          <select
            value={filters.expiry || (filters.expiringSoon ? 'expiring_soon' : filters.isExpired ? 'expired' : 'all')}
            onChange={(e) => handleExpiryFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white"
          >
            <option value="all">All Expiries</option>
            <option value="expiring_soon">Expiring Soon (90d)</option>
            <option value="expired">Expired Batches</option>
            <option value="safe">Safe Stock (&gt;90d)</option>
          </select>
        </div>
      </div>

      {/* Secondary Bar: Sorting & Reset */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-slate-400">Sort By:</span>
          <select
            value={`${filters.sortBy || 'expiryDate'}_${filters.sortOrder || 'asc'}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('_');
              triggerChange({ ...filters, sortBy, sortOrder, page: 1 });
            }}
            className="py-1 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="expiryDate_asc">Expiry Date (Earliest First - FEFO)</option>
            <option value="expiryDate_desc">Expiry Date (Latest First)</option>
            <option value="availableQuantity_desc">Available Stock (High to Low)</option>
            <option value="availableQuantity_asc">Available Stock (Low to High)</option>
            <option value="createdAt_desc">Recently Received</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className="inline-flex items-center gap-1 text-[11px] text-teal-700 hover:text-teal-900 font-medium px-2 py-1 rounded bg-teal-50 hover:bg-teal-100 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default StockFilters;
