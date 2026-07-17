export default function EmptyState({ icon = 'fa-inbox', title = 'Tidak ada data', desc, action }) {
  return (
    <div className="text-center py-10 text-[#94A3B8]">
      <i className={`fa-solid ${icon} text-3xl mb-3 block opacity-40`}></i>
      <p className="text-sm font-medium">{title}</p>
      {desc && <p className="text-xs mt-1">{desc}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
