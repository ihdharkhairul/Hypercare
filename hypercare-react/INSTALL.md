# HyperCare — Panduan Instalasi Lengkap

## Persyaratan

| Komponen | Versi Minimum |
|---|---|
| XAMPP | 8.1+ (PHP 8.1, MySQL 8.0, Apache) |
| Node.js | 18+ |
| Browser | Chrome/Firefox/Edge terbaru |
| (Opsional) OpenAI API Key | Untuk fitur AI Chat |

---

## 1. Setup Backend (XAMPP)

### 1a. Letakkan folder backend

```
C:\xampp\htdocs\
└── hypercare\
    └── backend\          ← taruh folder ini di sini
        ├── api\
        ├── config\
        ├── controllers\
        ├── models\
        ├── services\
        ├── uploads\
        └── database\
```

### 1b. Buat database

1. Buka `http://localhost/phpmyadmin`
2. Klik **New** → buat database bernama `hypercare` dengan charset `utf8mb4_unicode_ci`
3. Pilih database tersebut → tab **Import** → pilih file `backend/database/hypercare.sql` → klik **Go**

### 1c. Konfigurasi koneksi database

Edit `backend/config/database.php`:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'hypercare');
define('DB_USER', 'root');       // ← sesuaikan
define('DB_PASS', '');           // ← sesuaikan (default XAMPP kosong)
```

### 1d. (Opsional) Konfigurasi OpenAI API

Edit `backend/config/app.php`:

```php
define('OPENAI_API_KEY', 'sk-xxxxxxxxxxxxxxxx');  // ← isi API key Anda
```

Atau set sebagai environment variable di XAMPP (lebih aman):

Di `C:\xampp\apache\conf\httpd.conf` atau `.htaccess` tambahkan:
```
SetEnv OPENAI_API_KEY "sk-xxxxxxxxxxxxxxxx"
```

### 1e. Buat folder uploads dan beri izin tulis

```
C:\xampp\htdocs\hypercare\backend\uploads\   ← pastikan folder ini ada
```

Di Windows XAMPP, folder htdocs biasanya sudah writable. Di Linux:
```bash
chmod 755 /var/www/html/hypercare/backend/uploads
```

### 1f. Test backend berjalan

Buka: `http://localhost/hypercare/backend/api/edukasi/index.php`

Jika berhasil, akan muncul response JSON:
```json
{"success": true, "message": "OK", "data": {...}}
```

---

## 2. Setup Frontend (React + Vite)

### 2a. Install dependencies

```bash
cd hypercare-react
npm install
```

### 2b. (Opsional) Konfigurasi URL backend

Jika backend berjalan di path berbeda, edit `src/api/axios.js`:

```js
export const BASE_URL = 'http://localhost/hypercare/backend/api';
// atau buat file .env berisi:
// VITE_API_URL=http://localhost/hypercare/backend/api
```

### 2c. Jalankan development server

```bash
npm run dev
```

Buka: `http://localhost:5173`

> **Catatan CORS**: Vite sudah dikonfigurasi proxy ke backend XAMPP di `vite.config.js`. Request ke `/api/*` dari frontend development server akan diteruskan ke `http://localhost/hypercare/backend`. Jika backend Anda di path berbeda, sesuaikan `target` di `vite.config.js`.

### 2d. Build untuk production

```bash
npm run build
```

Output ada di folder `dist/`. Copy isi folder `dist/` ke `C:\xampp\htdocs\hypercare\` untuk serve via Apache, atau deploy ke hosting.

---

## 3. Akun Demo

| Role | Email | Password |
|---|---|---|
| Pasien | pasien@gmail.com | 123456 |
| Perawat | perawat@gmail.com | 123456 |
| Admin | admin@hypercare.id | admin123 |

> Seeder data demo sudah termasuk di file SQL, tidak perlu input manual.

---

## 4. URL Halaman Utama

| URL | Keterangan |
|---|---|
| `http://localhost:5173/` | Landing page (Home) |
| `http://localhost:5173/login-pasien` | Login Pasien |
| `http://localhost:5173/login-perawat` | Login Perawat |
| `http://localhost:5173/admin/login` | Login Admin |
| `http://localhost:5173/dashboard-pasien` | Dashboard Pasien |
| `http://localhost:5173/dashboard-perawat` | Dashboard Perawat |
| `http://localhost:5173/admin/edukasi` | Panel Admin Edukasi |

---

## 5. Troubleshooting Umum

**CORS Error di browser console**
→ Pastikan Apache sudah berjalan di XAMPP dan `mod_headers` aktif.
→ Periksa `backend/config/app.php` → `ALLOWED_ORIGINS` sudah termasuk `http://localhost:5173`.

**"Koneksi database gagal"**
→ Pastikan MySQL Service aktif di XAMPP Control Panel.
→ Periksa kredensial di `backend/config/database.php`.

**Upload foto gagal**
→ Pastikan folder `backend/uploads/` ada dan writable.
→ Periksa `php.ini`: `file_uploads = On`, `upload_max_filesize = 2M`, `post_max_size = 8M`.

**AI Chat "OPENAI_API_KEY belum dikonfigurasi"**
→ Isi `OPENAI_API_KEY` di `backend/config/app.php`.
→ Pastikan server PHP bisa membuat koneksi keluar (curl aktif, tidak diblokir firewall).

**Halaman blank / error setelah login**
→ Buka browser DevTools → Console → lihat error detail.
→ Biasanya karena sesi lama di localStorage berisi data format lama — tekan F12 → Application → Local Storage → Clear All, lalu login ulang.
