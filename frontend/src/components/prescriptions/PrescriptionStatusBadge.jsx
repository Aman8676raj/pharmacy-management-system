import React from 'react';
import { Badge } from '../common/Badge';

export const PrescriptionStatusBadge = ({ status = 'pending', size = 'md' }) => {
  switch (status) {
    case 'verified':
      return (
        <Badge variant="success" size={size} dot>
          Verified
        </Badge>
      );
    case 'rejected':
      return (
        <Badge variant="danger" size={size} dot>
          Rejected
        </Badge>
      );
    case 'expired':
      return (
        <Badge variant="neutral" size={size} dot>
          Expired
        </Badge>
      );
    case 'pending':
    default:
      return (
        <Badge variant="warning" size={size} dot>
          Pending Review
        </Badge>
      );
  }
};

