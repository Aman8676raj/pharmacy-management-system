import React from 'react';
import Spinner from './Spinner';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  onClick,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variantClasses = {
    primary:
      'bg-teal-600 hover:bg-teal-700 text-white shadow-sm hover:shadow focus:ring-teal-500 active:bg-teal-800',
    secondary:
      'bg-slate-800 hover:bg-slate-900 text-white shadow-sm hover:shadow focus:ring-slate-700 active:bg-slate-950',
    outline:
      'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-sm focus:ring-slate-400 active:bg-slate-100',
    ghost:
      'text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:ring-slate-400 active:bg-slate-200',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500 active:bg-rose-800',
    blue:
      'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow focus:ring-blue-500 active:bg-blue-800',
  };

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${sizeClasses[size] || sizeClasses.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner size="sm" color="text-current" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;

