// src/api/axios.js
import axios from 'axios';

// ── Base URL ─────────────────────────────────────────────────
// Mode 1 (Development dengan Vite proxy — DISARANKAN):
//   Ganti menjadi '/api' dan pastikan vite.config.js sudah
//   mengkonfigurasi proxy ke XAMPP (sudah dikonfigurasi otomatis).
//
// Mode 2 (Production atau akses langsung):
//   Ganti dengan URL penuh backend XAMPP/server Anda.
export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/hypercare/backend/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Request: sisipkan JWT otomatis ───────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hc_token') || sessionStorage.getItem('hc_token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

// ── Response: handle 401 — refresh token atau paksa logout ──
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error.response?.status;

    if (status === 401 && !error.config._retry) {
      // Cek apakah request ini memang dikirim dengan token (artinya user
      // SEHARUSNYA masih login saat request ini dibuat). Kalau tidak ada
      // token sama sekali, 401 ini bukan tanda sesi berakhir — jangan
      // paksa redirect, biarkan komponen pemanggil yang menangani errornya
      // sendiri (mis. halaman publik yang memang tidak butuh login).
      const hadToken = !!(error.config.headers?.Authorization);

      const rt =
        localStorage.getItem('hc_remember_token') ||
        sessionStorage.getItem('hc_remember_token');

      if (hadToken && rt) {
        error.config._retry = true;
        try {
          const res = await axios.post(
            `${BASE_URL}/auth/refresh.php`,
            { remember_token: rt }
          );
          const { token, user, role } = res.data.data;
          const storage = localStorage.getItem('hc_remember_token') ? localStorage : sessionStorage;
          storage.setItem('hc_token', token);
          storage.setItem('hc_user', JSON.stringify(user));
          storage.setItem('hc_role', role);
          error.config.headers['Authorization'] = `Bearer ${token}`;
          return api(error.config);
        } catch {
          clearAuthStorage();
          forceRedirectIfNeeded();
          return Promise.reject(error);
        }
      } else if (hadToken) {
        // Ada token tapi ditolak (kadaluarsa/invalid) dan tidak ada
        // remember token untuk refresh — baru di sini kita anggap sesi
        // benar-benar berakhir dan paksa balik ke halaman awal.
        clearAuthStorage();
        forceRedirectIfNeeded();
      }
      // Jika request ini memang tidak membawa token dari awal (hadToken
      // false), biarkan error diteruskan apa adanya tanpa reload paksa —
      // ini mencegah polling/background request "basi" menyeret pengguna
      // kembali ke Home saat mereka sedang di halaman lain (mis. Register).
    }

    return Promise.reject(error);
  }
);

// Hanya reload paksa kalau kita SEDANG berada di halaman yang butuh login
// (bukan halaman publik seperti Home/Login/Register), supaya tidak
// mengganggu pengguna yang memang sedang tidak login / sedang mendaftar.
function forceRedirectIfNeeded() {
  const publicPaths = ['/', '/login-pasien', '/login-perawat', '/register-pasien', '/register-perawat', '/edukasi'];
  if (!publicPaths.includes(window.location.pathname)) {
    window.location.href = '/';
  }
}

export function clearAuthStorage() {
  ['hc_token', 'hc_user', 'hc_role', 'hc_remember_token'].forEach((k) => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  });
}

export default api;