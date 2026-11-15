import React from 'react';
import { Badge } from '../common/Badge';

export const SaleStatusBadge = ({ status, type = 'payment', size = 'md' }) => {
  if (type === 'sale') {
    if (status === 'completed') {
      return (
        <Badge variant="success" size={size} dot>
          Completed
        </Badge>
      );
    }
    if (status === 'cancelled') {
      return (
        <Badge variant="danger" size={size} dot>
          Cancelled
        </Badge>
      );
    }
    return (
      <Badge variant="default" size={size}>
        {status}
      </Badge>
    );
  }

  // Payment status
  switch (status) {
    case 'paid':
      return (
        <Badge variant="success" size={size} dot>
          Paid
        </Badge>
      );
    case 'partially_paid':
      return (
        <Badge variant="warning" size={size} dot>
          Partial
        </Badge>
      );
    case 'unpaid':
      return (
        <Badge variant="danger" size={size} dot>
          Unpaid
        </Badge>
      );
    default:
      return (
        <Badge variant="default" size={size}>
          {status}
        </Badge>
      );
  }
};
