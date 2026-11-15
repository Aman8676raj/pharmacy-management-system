import React from 'react';
import { PURCHASE_STATUS_CONFIGS } from '../../utils/constants';
import Badge from '../common/Badge';

export default function PurchaseStatusBadge({ status, size = 'sm' }) {
  const config = PURCHASE_STATUS_CONFIGS[status] || {
    label: status || 'Unknown',
    badgeVariant: 'neutral',
  };

  return (
    <Badge variant={config.badgeVariant} size={size} dot>
      {config.label}
    </Badge>
  );
}
