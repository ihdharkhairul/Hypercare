export default function ErrorState({ message = 'Terjadi kesalahan saat memuat data.', onRetry }) {
  return (
    <div className="text-center py-10">
      <i className="fa-solid fa-triangle-exclamation text-3xl mb-3 block text-red-300"></i>
      <p className="text-sm text-[#64748B]">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-outline text-xs mt-3 px-4 py-1.5">
          <i className="fa-solid fa-rotate-right mr-1"></i>Coba Lagi
        </button>
      )}
    </div>
  );
}
