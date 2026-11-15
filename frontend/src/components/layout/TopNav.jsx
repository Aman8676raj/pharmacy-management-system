import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getInitials, formatRole } from '../../utils/formatters';
import { ROLE_COLORS, ROLE_LABELS } from '../../utils/constants';

export const TopNav = ({ onMenuClick, onRoleInfoClick }) => {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sampleNotifications = [
    {
      id: 1,
      title: 'Low Stock Alert',
      message: 'Amoxicillin 500mg has reached reorder threshold (12 left).',
      time: '15m ago',
      type: 'warning',
    },
    {
      id: 2,
      title: 'Batch Expiry Notice',
      message: 'Insulin Glargine batch B-77402 expires in 13 days.',
      time: '1h ago',
      type: 'danger',
    },
    {
      id: 3,
      title: 'System Operational',
      message: 'Database backup completed successfully.',
      time: '3h ago',
      type: 'info',
    },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Left side: Hamburger button + Page Title and Breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden text-slate-500 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Home</span>
            <span>/</span>
            <span className="text-teal-700 font-medium">Dashboard</span>
          </nav>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">
            Pharmacy Overview
          </h1>
        </div>
      </div>

      {/* Center: Search Field (visual only for Phase 1) */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search medicines, batches, customers (Phase 2 preview)..."
            readOnly
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-600 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-not-allowed"
            title="Search functionality will be fully enabled in Phase 2 with database integration"
          />
        </div>
      </div>

      {/* Right side: Notifications + User profile */}
      <div className="flex items-center gap-3">
        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full ring-2 ring-white" />
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-800 uppercase tracking-wider">
                  Notifications
                </span>
                <span className="text-[11px] text-teal-600 font-medium">3 New</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {sampleNotifications.map((notif) => (
                  <div key={notif.id} className="p-3 hover:bg-slate-50 text-xs transition-colors">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-semibold text-slate-800">{notif.title}</span>
                      <span className="text-[10px] text-slate-400">{notif.time}</span>
                    </div>
                    <p className="text-slate-500 text-[11px] leading-snug">{notif.message}</p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-slate-100 text-center">
                <span className="text-[11px] text-slate-400">Sample notification preview</span>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none"
            aria-label="User profile menu"
          >
            <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-semibold text-xs flex items-center justify-center shadow-xs">
              {getInitials(user?.name)}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                {user?.name || 'User'}
              </div>
              <div className="text-[10px] text-slate-400 capitalize">
                {ROLE_LABELS[user?.role] || user?.role || 'Staff'}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              {/* Profile summary */}
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {user?.name || 'Pharmacy Staff'}
                </p>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {user?.email || 'staff@pharmacy.com'}
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      ROLE_COLORS[user?.role] || 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {ROLE_LABELS[user?.role] || user?.role}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Active
                  </span>
                </div>
              </div>

              {/* Quick actions */}
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    if (onRoleInfoClick) onRoleInfoClick();
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    Role Permissions Info
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </button>
              </div>

              {/* Logout button */}
              <div className="pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNav;

