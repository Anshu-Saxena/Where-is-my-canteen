import React from 'react';
import { getStatusBadgeProps } from '../../utils/formatters';

export default function StatusBadge({ status, className = '' }) {
  const { bg, dot, label } = getStatusBadgeProps(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-semibold border whitespace-nowrap ${bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      <span>{label}</span>
    </span>
  );
}
