import { memo } from 'react';

const STATUS_MAP = {
  'Normal':                { cls: 'badge-normal' },
  'Pra Hipertensi':        { cls: 'badge-pra' },
  'Hipertensi Tingkat 1':  { cls: 'badge-tk1' },
  'Hipertensi Tingkat 2':  { cls: 'badge-tk2' },
};

export function statusBadgeClass(status) {
  if (!status) return 'badge-normal';
  if (status.includes('Tingkat 2')) return 'badge-tk2';
  if (status.includes('Tingkat 1')) return 'badge-tk1';
  if (status.includes('Pra'))       return 'badge-pra';
  return 'badge-normal';
}

function StatusBadgeBase({ status }) {
  const cls = STATUS_MAP[status]?.cls || statusBadgeClass(status);
  return <span className={`badge-status ${cls}`}>{status || 'Normal'}</span>;
}

const StatusBadge = memo(StatusBadgeBase);
export default StatusBadge;
