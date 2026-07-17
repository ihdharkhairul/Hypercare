import { useAuth } from '../context/AuthContext';

/**
 * useLocalAuthUser — shorthand untuk mengambil user + role aktif.
 * Mencegah import berulang dari useAuth() di banyak file saat
 * hanya butuh data user, bukan fungsi login/logout.
 */
export function useLocalAuthUser() {
  const { user, role, isPasien, isPerawat, isAdmin } = useAuth();
  return { user, role, isPasien, isPerawat, isAdmin };
}
