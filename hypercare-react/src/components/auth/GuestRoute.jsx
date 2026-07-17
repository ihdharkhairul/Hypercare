import { Navigate } from 'react-router-dom';

// PERBAIKAN: Baca langsung dari storage, BUKAN dari state React
// State React bisa belum terupdate saat GuestRoute di-render ulang
// tepat setelah navigate() dipanggil dari halaman login
function getAuthFromStorage() {
  const token = localStorage.getItem('hc_token') || sessionStorage.getItem('hc_token');
  const role  = localStorage.getItem('hc_role')  || sessionStorage.getItem('hc_role');
  return { token, role };
}

export default function GuestRoute({ children }) {
  const { token, role } = getAuthFromStorage();

  if (token) {
    const home = role === 'perawat' ? '/dashboard-perawat' : '/dashboard-pasien';
    return <Navigate to={home} replace />;
  }

  return children;
}
