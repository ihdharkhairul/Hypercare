// ============================================================
//  src/api/axios.js
//  Konfigurasi Axios untuk HyperCare React
//  Letakkan file ini di dalam folder src/api/ frontend React
// ============================================================

import axios from 'axios';

// Ganti URL ini sesuai lokasi backend kamu
const BASE_URL = 'http://localhost/hypercare/backend/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// ── Request Interceptor ──────────────────────────────────────
// Otomatis sisipkan JWT token dari localStorage ke setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hc_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ─────────────────────────────────────
// Handle 401 → redirect ke login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hc_token');
      localStorage.removeItem('hc_user');
      localStorage.removeItem('hc_role');
      // Redirect ke halaman login
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;

// ============================================================
//  Contoh penggunaan di komponen React:
//
//  import api from '../api/axios';
//
//  // Login Pasien
//  const res = await api.post('/auth/login-pasien.php', { email, password });
//  localStorage.setItem('hc_token', res.data.data.token);
//  localStorage.setItem('hc_user',  JSON.stringify(res.data.data.user));
//  localStorage.setItem('hc_role',  'pasien');
//
//  // Ambil riwayat tekanan darah
//  const res = await api.get('/tekanan/index.php');
//
//  // Catat tekanan darah
//  const res = await api.post('/tekanan/index.php', {
//    tanggal: '2025-06-29',
//    sistolik: 120,
//    diastolik: 80,
//    denyut_nadi: 72,
//    berat_badan: 68.5,
//    catatan: 'Setelah istirahat',
//  });
//
//  // Kirim pesan chat
//  const res = await api.post('/chat/index.php?action=send', {
//    pasien_id: 1,
//    perawat_id: 1,
//    pesan: 'Halo dok, tekanan darah saya naik.',
//  });
// ============================================================
