import { Navigate, useLocation } from 'react-router-dom';

// PERBAIKAN: Baca langsung dari storage, konsisten dengan GuestRoute
function getAuthFromStorage() {
  const token = localStorage.getItem('hc_token') || sessionStorage.getItem('hc_token');
  const role  = localStorage.getItem('hc_role')  || sessionStorage.getItem('hc_role');
  return { token, role };
}

export default function ProtectedRoute({ children, role }) {
  const { token, role: userRole } = getAuthFromStorage();
  const location = useLocation();

  if (!token) {
    const loginPage = role === 'perawat' ? '/login-perawat' : '/login-pasien';
    return <Navigate to={loginPage} state={{ from: location }} replace />;
  }

  if (role && userRole !== role) {
    const home = userRole === 'perawat' ? '/dashboard-perawat' : '/dashboard-pasien';
    return <Navigate to={home} replace />;
  }

  return children;
}
