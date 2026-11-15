import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';
import reportService from '../../services/reportService';

export const ExportDropdown = ({ type, params = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleExport = async (format) => {
    try {
      setDownloading(true);
      setIsOpen(false);
      if (format === 'csv') {
        await reportService.downloadCSV(type, params);
      } else if (format === 'pdf') {
        await reportService.downloadPDF(type, params);
      }
    } catch (err) {
      console.error('Export download failed:', err);
      alert('Failed to generate export file. Please check server logs.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        disabled={downloading}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 shadow-2xs text-xs font-semibold rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50"
      >
        <Download className="w-3.5 h-3.5 text-teal-600" />
        <span>{downloading ? 'Exporting...' : 'Export'}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="origin-top-right absolute right-0 mt-1 w-44 rounded-xl shadow-lg bg-white ring-1 ring-black/5 divide-y divide-slate-100 focus:outline-hidden z-20">
            <div className="py-1">
              <button
                type="button"
                onClick={() => handleExport('csv')}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-900 flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export as CSV (.csv)</span>
              </button>
              <button
                type="button"
                onClick={() => handleExport('pdf')}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-900 flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-rose-600" />
                <span>Export as PDF (.pdf)</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
