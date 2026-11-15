import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Pill,
  Boxes,
  Truck,
  ShoppingCart,
  Receipt,
  Users,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  X,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { NAVIGATION_ITEMS, APP_NAME, ROLE_LABELS, ROLE_COLORS } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';

// Map icon string names to components
const iconMap = {
  LayoutDashboard,
  Pill,
  Boxes,
  Truck,
  ShoppingCart,
  Receipt,
  Users,
  FileText,
  BarChart3,
  Settings,
};

export const Sidebar = ({ isOpen, onClose, onRoleInfoClick }) => {
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-500/30">
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 tracking-tight text-base">
                  {APP_NAME}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium leading-none">
                Pharmacy Admin
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-slate-600 p-1 rounded-md"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current user role badge card */}
        {user && (
          <div className="px-4 pt-3 pb-1">
            <div
              onClick={onRoleInfoClick}
              className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/80 transition-colors group"
              title="Click to view role access permissions"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Active Role
                </span>
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 truncate">
                  {ROLE_LABELS[user.role] || user.role}
                </span>
                <span
                  className={`text-[10px] font-medium px-2 py-0.2 rounded-full border ${
                    ROLE_COLORS[user.role] || 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Main Navigation
          </div>

          {NAVIGATION_ITEMS.map((item) => {
            const IconComponent = iconMap[item.icon] || LayoutDashboard;

            if (item.enabled) {
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                      isActive
                        ? 'bg-teal-50 text-teal-800 shadow-xs border-l-4 border-teal-600 pl-2'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className="w-4 h-4 text-teal-600 group-hover:text-teal-700 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                </NavLink>
              );
            }

            // Disabled / Coming Soon navigation items for Phase 1
            return (
              <div
                key={item.id}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-400 cursor-not-allowed select-none transition-colors opacity-75 hover:bg-slate-50/50"
                title={`${item.label} module`}
              >
                <div className="flex items-center gap-3">
                  <IconComponent className="w-4 h-4 text-slate-300 shrink-0" />
                  <span className="text-slate-500">{item.label}</span>
                </div>
                <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  {item.badge || 'Soon'}
                </span>
              </div>
            );
          })}
        </div>

        {/* User logout section */}
        <div className="p-3 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

