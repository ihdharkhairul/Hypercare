// Reusable loading spinner — konsisten di seluruh aplikasi
export default function LoadingSpinner({ size = 'md', label, fullHeight = false, className = '' }) {
  const sizeCls = { sm: 'text-sm', md: 'text-xl', lg: 'text-3xl' }[size] || 'text-xl';
  return (
    <div className={`flex flex-col items-center justify-center gap-2 text-[#94A3B8] ${fullHeight ? 'h-full min-h-[160px]' : 'py-6'} ${className}`}>
      <i className={`fa-solid fa-spinner fa-spin ${sizeCls}`}></i>
      {label && <p className="text-xs">{label}</p>}
    </div>
  );
}
