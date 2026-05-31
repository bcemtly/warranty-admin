import React from 'react';
import { SubmissionStatus } from '../types';

const CONFIG = {
  pending: { label: 'Beklemede', classes: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Onaylandı', classes: 'bg-green-100 text-green-700' },
  rejected: { label: 'Reddedildi', classes: 'bg-red-100 text-red-700' },
};

export default function StatusBadge({ status }: { status: SubmissionStatus }) {
  const { label, classes } = CONFIG[status];
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${classes}`}>
      {label}
    </span>
  );
}
