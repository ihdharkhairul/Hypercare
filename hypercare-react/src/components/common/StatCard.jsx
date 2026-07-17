import { memo } from 'react';

function StatCard({ label, value, suffix, sub, subIcon, valueColor = '', loading = false }) {
  return (
    <div className="card-soft p-5">
      <p className="text-xs text-[#94A3B8] mb-1">{label}</p>
      {loading ? (
        <div className="h-6 w-16 bg-secondary rounded animate-pulse"></div>
      ) : (
        <p className={`font-display font-bold text-2xl ${valueColor}`}>
          {value} {suffix && <span className="text-sm font-normal text-[#94A3B8]">{suffix}</span>}
        </p>
      )}
      {sub && (
        <p className="text-xs text-[#94A3B8] mt-2">
          {subIcon && <i className={`fa-solid ${subIcon} mr-1`}></i>}{sub}
        </p>
      )}
    </div>
  );
}

export default memo(StatCard);
