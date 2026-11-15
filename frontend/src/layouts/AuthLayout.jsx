import React from 'react';
import { Outlet } from 'react-router-dom';
import { Activity, ShieldCheck, HeartPulse, Pill } from 'lucide-react';
import { APP_NAME, APP_SUBTITLE } from '../utils/constants';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-600 text-white shadow-md shadow-teal-600/30 mb-3">
          <Activity className="w-7 h-7 stroke-[2.5]" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {APP_NAME}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {APP_SUBTITLE}
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Outlet />
      </div>

      <footer className="mt-8 text-center text-xs text-slate-400">
        <p>© 2026 {APP_NAME} • Secure Pharmacy Administration Portal • Phase 1</p>
      </footer>
    </div>
  );
};

export default AuthLayout;

