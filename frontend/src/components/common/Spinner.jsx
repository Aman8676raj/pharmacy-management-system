import React from 'react';

export const Spinner = ({ size = 'md', className = '', color = 'text-teal-600' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4',
  };

  return (
    <div
      role="status"
      className={`inline-block animate-spin rounded-full border-current border-t-transparent ${sizeClasses[size] || sizeClasses.md} ${color} ${className}`}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;

