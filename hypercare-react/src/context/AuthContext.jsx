import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { clearAuthStorage } from '../api/axios';

const AuthContext = createContext(null);

function readStorage() {
  const token   = localStorage.getItem('hc_token')   || sessionStorage.getItem('hc_token');
  const userRaw = localStorage.getItem('hc_user')    || sessionStorage.getItem('hc_user');
  const role    = localStorage.getItem('hc_role')    || sessionStorage.getItem('hc_role');
  try {
    return { token, user: userRaw ? JSON.parse(userRaw) : null, role };
  } catch {
    return { token: null, user: null, role: null };
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth]       = useState(() => readStorage());
  const [loading, setLoading] = useState(false);

  // ── Login Pasien ───────────────────────────────────────────
  const loginPasien = useCallback(async (email, password, remember = false) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login-pasien.php', { email, password, remember });
      const { token, remember_token, user, role } = res.data.data;
      _persist(token, user, role, remember_token, remember);
      return { success: true };
    } catch (err) {
      return _apiError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Login Perawat ──────────────────────────────────────────
  const loginPerawat = useCallback(async (email, password, remember = false) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login-perawat.php', { email, password, remember });
      const { token, remember_token, user, role } = res.data.data;
      _persist(token, user, role, remember_token, remember);
      return { success: true };
    } catch (err) {
      return _apiError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Register Pasien ────────────────────────────────────────
  const registerPasien = useCallback(async (data) => {
    setLoading(true);
    try {
      await api.post('/auth/register-pasien.php', data);
      return { success: true };
    } catch (err) {
      return _apiError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Register Perawat ───────────────────────────────────────
  const registerPerawat = useCallback(async (data) => {
    setLoading(true);
    try {
      await api.post('/auth/register-perawat.php', data);
      return { success: true };
    } catch (err) {
      return _apiError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Logout ─────────────────────────────────────────────────
  const logout = useCallback(async () => {
    const rememberToken =
      localStorage.getItem('hc_remember_token') ||
      sessionStorage.getItem('hc_remember_token');
    try {
      await api.post('/auth/logout.php', { remember_token: rememberToken });
    } catch { /* lanjut logout lokal walau request gagal */ }
    clearAuthStorage();
    setAuth({ token: null, user: null, role: null });
  }, []);

  // ── Sinkron state antar tab ────────────────────────────────
  useEffect(() => {
    const onStorage = () => setAuth(readStorage());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // ── Simpan ke storage & update state SINKRON ──────────────
  // PERBAIKAN BUG: setAuth dipanggil di sini secara langsung
  // sehingga React state terupdate SEBELUM navigate() dipanggil
  // di halaman login. Sebelumnya ada setTimeout yang menyebabkan
  // race condition (navigate terjadi sebelum state terupdate).
  function _persist(token, user, role, rememberToken, useLong) {
    const storage = useLong ? localStorage : sessionStorage;
    clearAuthStorage();
    storage.setItem('hc_token', token);
    storage.setItem('hc_user', JSON.stringify(user));
    storage.setItem('hc_role', role);
    if (rememberToken) storage.setItem('hc_remember_token', rememberToken);
    // Update state React secara sinkron
    setAuth({ token, user, role });
  }

  function _apiError(err) {
    const data   = err.response?.data;
    const msg    = data?.message || 'Terjadi kesalahan, coba lagi.';
    const errors = data?.data?.errors || null;
    return { success: false, message: msg, errors };
  }

  const isLoggedIn = !!auth.token;
  const isPasien   = auth.role === 'pasien';
  const isPerawat  = auth.role === 'perawat';

  return (
    <AuthContext.Provider value={{
      ...auth,
      loading,
      isLoggedIn,
      isPasien,
      isPerawat,
      loginPasien,
      loginPerawat,
      registerPasien,
      registerPerawat,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus digunakan di dalam <AuthProvider>');
  return ctx;
}
