import React from 'react';
import Badge from '../common/Badge';
import { BATCH_STATUS_CONFIGS } from '../../utils/constants';

export const BatchStatusBadge = ({ status, className = '' }) => {
  const config = BATCH_STATUS_CONFIGS[status] || {
    label: status || 'Unknown',
    badgeVariant: 'default',
  };

  return (
    <Badge
      variant={config.badgeVariant}
      size="sm"
      dot
      className={`capitalize font-medium ${className}`}
    >
      {config.label}
    </Badge>
  );
};

export default BatchStatusBadge;

