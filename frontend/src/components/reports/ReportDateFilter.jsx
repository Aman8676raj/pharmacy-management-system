import React, { useState } from 'react';
import { Calendar, Filter, RotateCcw } from 'lucide-react';
import { Button } from '../common/Button';

export const ReportDateFilter = ({
  startDate,
  endDate,
  onApply,
  onReset,
  loading = false,
}) => {
  const [localStart, setLocalStart] = useState(startDate || '');
  const [localEnd, setLocalEnd] = useState(endDate || '');

  const handlePreset = (preset) => {
    const today = new Date();
    const endStr = today.toISOString().split('T')[0];
    let startStr = '';

    if (preset === 'today') {
      startStr = endStr;
    } else if (preset === '7days') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      startStr = d.toISOString().split('T')[0];
    } else if (preset === '30days') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      startStr = d.toISOString().split('T')[0];
    } else if (preset === 'thisMonth') {
      const d = new Date(today.getFullYear(), today.getMonth(), 1);
      startStr = d.toISOString().split('T')[0];
    } else if (preset === 'all') {
      startStr = '';
      setLocalStart('');
      setLocalEnd('');
      onApply({ startDate: '', endDate: '' });
      return;
    }

    setLocalStart(startStr);
    setLocalEnd(endStr);
    onApply({ startDate: startStr, endDate: endStr });
  };

  const handleManualApply = (e) => {
    e.preventDefault();
    onApply({ startDate: localStart, endDate: localEnd });
  };

  const handleResetFilter = () => {
    setLocalStart('');
    setLocalEnd('');
    if (onReset) onReset();
    else onApply({ startDate: '', endDate: '' });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Presets */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-slate-500 font-medium mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            Quick Range:
          </span>
          <button
            type="button"
            onClick={() => handlePreset('today')}
            className="px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200 hover:border-teal-400 hover:text-teal-700 bg-slate-50 hover:bg-teal-50/50 transition-colors"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => handlePreset('7days')}
            className="px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200 hover:border-teal-400 hover:text-teal-700 bg-slate-50 hover:bg-teal-50/50 transition-colors"
          >
            Last 7 Days
          </button>
          <button
            type="button"
            onClick={() => handlePreset('30days')}
            className="px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200 hover:border-teal-400 hover:text-teal-700 bg-slate-50 hover:bg-teal-50/50 transition-colors"
          >
            Last 30 Days
          </button>
          <button
            type="button"
            onClick={() => handlePreset('thisMonth')}
            className="px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200 hover:border-teal-400 hover:text-teal-700 bg-slate-50 hover:bg-teal-50/50 transition-colors"
          >
            This Month
          </button>
          <button
            type="button"
            onClick={() => handlePreset('all')}
            className="px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200 hover:border-slate-300 text-slate-600 bg-slate-50 transition-colors"
          >
            All-Time
          </button>
        </div>

        {/* Custom Range Picker */}
        <form onSubmit={handleManualApply} className="flex items-center gap-2">
          <input
            type="date"
            value={localStart}
            onChange={(e) => setLocalStart(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
            title="Start Date"
          />
          <span className="text-slate-400 text-xs">to</span>
          <input
            type="date"
            value={localEnd}
            onChange={(e) => setLocalEnd(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
            title="End Date"
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={loading}
            className="bg-teal-600 hover:bg-teal-700 text-xs px-3 py-1"
          >
            <Filter className="w-3.5 h-3.5 mr-1" />
            Apply
          </Button>
          {(localStart || localEnd) && (
            <button
              type="button"
              onClick={handleResetFilter}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Reset dates"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
