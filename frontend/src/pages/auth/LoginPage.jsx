import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, ShieldAlert, CheckCircle2, UserCheck } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { useAuth } from '../../hooks/useAuth';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Restore remembered email securely (only email is preserved, never passwords or tokens)
  useEffect(() => {
    const savedEmail = localStorage.getItem('pms_remembered_email');
    if (savedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: savedEmail,
        rememberMe: true,
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear validation error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (authError) {
      setAuthError(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await login(formData.email, formData.password);

      // Handle secure email remembrance
      if (formData.rememberMe) {
        localStorage.setItem('pms_remembered_email', formData.email.trim());
      } else {
        localStorage.removeItem('pms_remembered_email');
      }

      // Redirect to intended page or dashboard
      const origin = location.state?.from?.pathname || '/dashboard';
      navigate(origin, { replace: true });
    } catch (err) {
      setAuthError(
        err.message || 'Authentication failed. Please verify your credentials and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick fill demo user credentials for testing
  const handleQuickFill = (roleEmail) => {
    setFormData({
      email: roleEmail,
      password: 'Password@123',
      rememberMe: formData.rememberMe,
    });
    setErrors({});
    setAuthError(null);
  };

  return (
    <div className="bg-white py-8 px-6 sm:px-8 shadow-sm rounded-2xl border border-slate-200">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900">Sign in to your account</h3>
        <p className="text-xs text-slate-500 mt-1">
          Enter your authorized pharmacy credentials to access the console
        </p>
      </div>

      {authError && (
        <Alert
          type="error"
          onClose={() => setAuthError(null)}
          className="mb-5 text-xs"
        >
          {authError}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email field */}
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="admin@pharmacy.com"
          error={errors.email}
          leftIcon={<Mail className="w-4 h-4" />}
          autoComplete="email"
          required
        />

        {/* Password field */}
        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          error={errors.password}
          leftIcon={<Lock className="w-4 h-4" />}
          autoComplete="current-password"
          required
        />

        {/* Remember me option */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 focus:ring-offset-0 transition"
            />
            <span className="text-xs text-slate-600 font-medium">Remember my email</span>
          </label>
        </div>

        {/* Submit button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full text-sm font-semibold"
            leftIcon={<LogIn className="w-4 h-4" />}
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
          </Button>
        </div>
      </form>

      {/* Quick Access Test Accounts Card */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-teal-600" />
            Quick Demo Accounts
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Password@123</span>
        </div>
        <p className="text-[11px] text-slate-500 mb-3">
          Click any role below to pre-fill credentials for quick role verification:
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleQuickFill('admin@pharmacy.com')}
            className="text-left px-2.5 py-2 rounded-lg border border-purple-200 bg-purple-50/50 hover:bg-purple-50 text-purple-900 transition-colors"
          >
            <span className="font-semibold block text-[11px]">Administrator</span>
            <span className="text-[10px] text-purple-600 truncate block">admin@pharmacy.com</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill('pharmacist@pharmacy.com')}
            className="text-left px-2.5 py-2 rounded-lg border border-teal-200 bg-teal-50/50 hover:bg-teal-50 text-teal-900 transition-colors"
          >
            <span className="font-semibold block text-[11px]">Pharmacist</span>
            <span className="text-[10px] text-teal-600 truncate block">pharmacist@pharmacy.com</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill('cashier@pharmacy.com')}
            className="text-left px-2.5 py-2 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-900 transition-colors"
          >
            <span className="font-semibold block text-[11px]">Cashier</span>
            <span className="text-[10px] text-blue-600 truncate block">cashier@pharmacy.com</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill('inventory@pharmacy.com')}
            className="text-left px-2.5 py-2 rounded-lg border border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-amber-900 transition-colors"
          >
            <span className="font-semibold block text-[11px]">Inventory Mgr</span>
            <span className="text-[10px] text-amber-600 truncate block">inventory@pharmacy.com</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
