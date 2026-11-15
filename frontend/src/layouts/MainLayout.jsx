import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import TopNav from '../components/layout/TopNav';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { useAuth } from '../hooks/useAuth';
import { ROLE_LABELS, ROLE_COLORS } from '../utils/constants';
import { ShieldCheck, CheckCircle2, Lock } from 'lucide-react';

export const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const { user } = useAuth();

  const roleMatrices = [
    {
      role: 'admin',
      title: 'Administrator',
      desc: 'Full navigation & configuration access across all operational, financial, and management modules.',
      modules: [
        'Dashboard',
        'Medicines CRUD',
        'Inventory & Batch Tracking',
        'Suppliers Management',
        'Purchases & Orders',
        'Sales & Billing POS',
        'Customer Profiles',
        'Prescription Dispensing',
        'Audit & Financial Reports',
        'Staff & Role Settings',
      ],
    },
    {
      role: 'pharmacist',
      title: 'Pharmacist',
      desc: 'Operational access to medicine dispensing, inventory monitoring, prescriptions, and customer care.',
      modules: [
        'Dashboard',
        'Medicines Catalog (View/Check)',
        'Inventory Status',
        'Prescription Verification & Dispensing',
        'Customer History',
        'Over-the-Counter Sales',
      ],
    },
    {
      role: 'cashier',
      title: 'Cashier',
      desc: 'Billing-related access for POS checkouts, receipt printing, customer invoices, and daily registers.',
      modules: [
        'Dashboard',
        'Sales & Billing Checkout',
        'Invoicing & Receipts',
        'Customer Records Lookup',
      ],
    },
    {
      role: 'inventory_manager',
      title: 'Inventory Manager',
      desc: 'Stock control, warehouse reception, purchase orders, supplier coordination, and expiry control.',
      modules: [
        'Dashboard',
        'Medicines & Stocks',
        'Inventory Batch Audits',
        'Suppliers Catalog',
        'Purchase Order Workflows',
        'Expiry & Damage Logging',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onRoleInfoClick={() => setIsRoleModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navbar */}
        <TopNav
          onMenuClick={() => setIsSidebarOpen(true)}
          onRoleInfoClick={() => setIsRoleModalOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Role-Based Permissions Reference Modal */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title="Role-Based Access Control (RBAC) Permissions"
        maxWidth="max-w-2xl"
        footer={
          <Button variant="outline" size="sm" onClick={() => setIsRoleModalOpen(false)}>
            Close Reference
          </Button>
        }
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Role-based permissions and route protections are enforced across the pharmacy system. 
            Your current logged-in role is{' '}
            <span
              className={`font-semibold px-2 py-0.5 rounded-full border ${
                ROLE_COLORS[user?.role] || 'bg-slate-100 text-slate-700'
              }`}
            >
              {ROLE_LABELS[user?.role] || user?.role}
            </span>
            . Below is the access matrix planned across system roles:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {roleMatrices.map((matrix) => {
              const isCurrent = user?.role === matrix.role;
              return (
                <div
                  key={matrix.role}
                  className={`p-3 rounded-xl border transition-all ${
                    isCurrent
                      ? 'border-teal-400 bg-teal-50/40 ring-1 ring-teal-300'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck
                        className={`w-4 h-4 ${isCurrent ? 'text-teal-600' : 'text-slate-400'}`}
                      />
                      {matrix.title}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2 leading-snug">
                    {matrix.desc}
                  </p>
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      Permitted Modules
                    </div>
                    {matrix.modules.slice(0, 4).map((mod, i) => (
                      <div key={i} className="flex items-center gap-1 text-[11px] text-slate-700">
                        <CheckCircle2 className="w-3 h-3 text-teal-600 shrink-0" />
                        <span>{mod}</span>
                      </div>
                    ))}
                    {matrix.modules.length > 4 && (
                      <span className="text-[10px] text-slate-400 block pt-0.5">
                        + {matrix.modules.length - 4} more operational privileges
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MainLayout;

