import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import customerService from '../../services/customerService';
import { CustomerTable } from '../../components/customers/CustomerTable';
import { Button } from '../../components/common/Button';
import {
  Users,
  Search,
  UserPlus,
  UserCheck,
  UserX,
  Calendar,
  RotateCcw,
} from 'lucide-react';

export const CustomerListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'pharmacist';

  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  const fetchCustomersData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        search: search.trim() || undefined,
        status: status !== 'all' ? status : undefined,
      };

      const [listRes, statsRes] = await Promise.all([
        customerService.getCustomers(params),
        customerService.getCustomerStats(),
      ]);

      setCustomers(listRes.data?.customers || []);
      setPagination(listRes.data?.pagination || {});
      setStats(statsRes.data || null);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    fetchCustomersData();
  }, [fetchCustomersData]);

  const handleResetFilters = () => {
    setSearch('');
    setStatus('all');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            Customer &amp; Patient Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage patient records, search histories, link prescriptions, and track lifetime pharmacy spend
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate('/customers/new')}
          className="bg-teal-600 hover:bg-teal-700 text-white shadow-xs font-semibold"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Patients</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900">
            {stats?.total ?? 0}
          </div>
          <div className="mt-1 text-xs text-slate-500">Registered pharmacy clients</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Active Patients</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-emerald-700">
            {stats?.active ?? 0}
          </div>
          <div className="mt-1 text-xs text-slate-500">Currently active accounts</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>New This Month</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900">
            {stats?.newThisMonth ?? 0}
          </div>
          <div className="mt-1 text-xs text-slate-500">Registered in current month</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Inactive Patients</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-slate-600">
            {stats?.inactive ?? 0}
          </div>
          <div className="mt-1 text-xs text-slate-500">Deactivated patient records</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by customer name, phone, code or email..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 font-medium focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          {(search || status !== 'all') && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Customers Table */}
      <CustomerTable
        customers={customers}
        pagination={pagination}
        onPageChange={setPage}
        loading={loading}
        canEdit={canEdit}
      />
    </div>
  );
};

export default CustomerListPage;

