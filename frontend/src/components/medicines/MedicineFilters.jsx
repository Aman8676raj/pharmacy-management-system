import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import Button from '../common/Button';

export const MedicineFilters = ({
  filters,
  onChange,
  onReset,
  filterOptions = { categories: [], manufacturers: [] },
  isLoading = false,
}) => {
  const handleInputChange = (field, value) => {
    onChange({ ...filters, [field]: value, page: 1 });
  };

  const hasActiveFilters =
    Boolean(filters.search) ||
    filters.category !== 'all' ||
    filters.manufacturer !== 'all' ||
    filters.status !== 'active' ||
    filters.requiresPrescription !== '';

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Search Bar (covers 5 cols on md+) */}
        <div className="md:col-span-5 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by name, generic, brand, SKU, or barcode..."
            value={filters.search || ''}
            onChange={(e) => handleInputChange('search', e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white transition-colors"
          />
        </div>

        {/* Category Filter */}
        <div className="md:col-span-3">
          <select
            value={filters.category || 'all'}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white"
          >
            <option value="all">All Categories</option>
            {filterOptions.categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Manufacturer Filter */}
        <div className="md:col-span-2">
          <select
            value={filters.manufacturer || 'all'}
            onChange={(e) => handleInputChange('manufacturer', e.target.value)}
            className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white"
          >
            <option value="all">All Manufacturers</option>
            {filterOptions.manufacturers.map((mfg) => (
              <option key={mfg} value={mfg}>
                {mfg}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="md:col-span-2">
          <select
            value={filters.status || 'active'}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white"
          >
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
            <option value="all">All Records</option>
          </select>
        </div>
      </div>

      {/* Secondary Filter Bar: Prescription Toggle, Sorting & Reset */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-3">
          {/* Prescription filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-400">Rx Type:</span>
            <select
              value={filters.requiresPrescription || ''}
              onChange={(e) => handleInputChange('requiresPrescription', e.target.value)}
              className="py-1 px-2 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="">All Medications</option>
              <option value="true">Prescription (Rx)</option>
              <option value="false">Over-the-Counter (OTC)</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-400">Sort By:</span>
            <select
              value={`${filters.sortBy || 'createdAt'}_${filters.sortOrder || 'desc'}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('_');
                onChange({ ...filters, sortBy, sortOrder, page: 1 });
              }}
              className="py-1 px-2 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="createdAt_desc">Recently Added</option>
              <option value="createdAt_asc">Oldest First</option>
              <option value="name_asc">Name (A to Z)</option>
              <option value="name_desc">Name (Z to A)</option>
              <option value="category_asc">Category (A to Z)</option>
            </select>
          </div>
        </div>

        {/* Reset button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
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

export default MedicineFilters;
