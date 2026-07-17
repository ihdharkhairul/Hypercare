# HyperCare Backend — PHP Native REST API

Backend REST API untuk aplikasi monitoring hipertensi **HyperCare**, dibangun dengan PHP Native, PDO, dan MySQL.

---

## Stack Teknologi

| Layer        | Teknologi                        |
|-------------|----------------------------------|
| Language    | PHP 8.1+                         |
| Database    | MySQL 8.0+                       |
| ORM/Query   | PDO + Prepared Statement         |
| Auth        | JWT (implementasi native)        |
| CORS        | Header manual (support Axios)    |
| Upload      | PHP `move_uploaded_file()`       |

---

## Struktur Folder

```
backend/
├── config/
│   ├── database.php      # Koneksi PDO (Singleton)
│   ├── app.php           # Konstanta & konfigurasi
│   └── helpers.php       # Response, JWT, CORS, sanitasi
├── models/
│   ├── PasienModel.php
│   ├── PerawatModel.php
│   ├── TekananDarahModel.php
│   ├── ChatModel.php
│   └── KonsultasiModel.php
├── controllers/
│   ├── AuthController.php
│   ├── PasienController.php
│   ├── PerawatController.php
│   ├── TekananDarahController.php
│   ├── ChatController.php
│   └── KonsultasiController.php
├── api/
│   ├── auth/
│   │   ├── login-pasien.php
│   │   ├── login-perawat.php
│   │   ├── register-pasien.php
│   │   ├── register-perawat.php
│   │   └── me.php
│   ├── pasien/
│   │   └── index.php
│   ├── perawat/
│   │   └── index.php
│   ├── tekanan/
│   │   └── index.php
│   ├── chat/
│   │   └── index.php
│   └── konsultasi/
│       └── index.php
├── uploads/              # Foto profil (auto-created)
├── database/
│   └── hypercare.sql     # Schema + seeder
├── .htaccess
└── axios.js              # Contoh config Axios untuk frontend
```

---

## Instalasi

### 1. Buat Database

```bash
mysql -u root -p < database/hypercare.sql
```

### 2. Konfigurasi Database

Edit `config/database.php`:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'hypercare');
define('DB_USER', 'root');
define('DB_PASS', 'password_kamu');
```

### 3. Letakkan di Web Server

Taruh folder `backend/` di dalam root web server:
- **XAMPP**: `C:/xampp/htdocs/hypercare/backend/`
- **LAMP**: `/var/www/html/hypercare/backend/`

### 4. Sesuaikan BASE_URL

Di `config/app.php`:
```php
define('BASE_URL', 'http://localhost/hypercare/backend');
```

### 5. Buat folder uploads dan beri izin

```bash
mkdir -p backend/uploads
chmod 755 backend/uploads
```

### 6. Copy axios.js ke frontend

Salin `axios.js` ke `src/api/axios.js` pada project React, lalu install Axios:

```bash
npm install axios
```

---

## Endpoint API

### 🔐 Auth

| Method | URL                              | Deskripsi            | Auth |
|--------|----------------------------------|----------------------|------|
| POST   | `/api/auth/login-pasien.php`     | Login pasien         | ❌   |
| POST   | `/api/auth/login-perawat.php`    | Login perawat        | ❌   |
| POST   | `/api/auth/register-pasien.php`  | Registrasi pasien    | ❌   |
| POST   | `/api/auth/register-perawat.php` | Registrasi perawat   | ❌   |
| GET    | `/api/auth/me.php`               | Profil saat ini      | ✅   |

### 👤 Pasien

| Method | URL                               | Deskripsi             | Auth       |
|--------|-----------------------------------|-----------------------|------------|
| GET    | `/api/pasien/index.php`           | Daftar semua pasien   | Perawat    |
| GET    | `/api/pasien/index.php?id=1`      | Detail pasien         | ✅         |
| PUT    | `/api/pasien/index.php?id=1`      | Update profil         | Pasien     |

### 🩺 Perawat

| Method | URL                                           | Deskripsi             | Auth    |
|--------|-----------------------------------------------|-----------------------|---------|
| GET    | `/api/perawat/index.php`                      | Daftar perawat        | ✅      |
| GET    | `/api/perawat/index.php?id=1`                 | Detail perawat        | ✅      |
| PUT    | `/api/perawat/index.php?id=1`                 | Update profil         | Perawat |
| PUT    | `/api/perawat/index.php?id=1&action=status`   | Toggle online/offline | Perawat |

### 💉 Tekanan Darah

| Method | URL                                         | Deskripsi                | Auth    |
|--------|---------------------------------------------|--------------------------|---------|
| GET    | `/api/tekanan/index.php`                    | Riwayat tekanan darah    | ✅      |
| GET    | `/api/tekanan/index.php?action=stat`        | Statistik                | ✅      |
| POST   | `/api/tekanan/index.php`                    | Catat tekanan darah baru | Pasien  |
| DELETE | `/api/tekanan/index.php?id=1`               | Hapus record             | Pasien  |

### 💬 Chat

| Method | URL                                           | Deskripsi             | Auth |
|--------|-----------------------------------------------|-----------------------|------|
| GET    | `/api/chat/index.php?action=list`             | Daftar percakapan     | ✅   |
| GET    | `/api/chat/index.php?action=messages&pasien_id=1&perawat_id=1` | Ambil pesan | ✅ |
| POST   | `/api/chat/index.php?action=send`             | Kirim pesan           | ✅   |
| PUT    | `/api/chat/index.php?action=read`             | Tandai sudah dibaca   | ✅   |

### 📋 Konsultasi

| Method | URL                                              | Deskripsi            | Auth    |
|--------|--------------------------------------------------|----------------------|---------|
| GET    | `/api/konsultasi/index.php`                      | Daftar konsultasi    | ✅      |
| POST   | `/api/konsultasi/index.php`                      | Buat konsultasi baru | Pasien  |
| PUT    | `/api/konsultasi/index.php?id=1&action=status`   | Update status        | Perawat |

---

## Format Response

Semua response menggunakan format JSON seragam:

```json
{
  "success": true,
  "message": "Login berhasil.",
  "data": { ... }
}
```

Response error:
```json
{
  "success": false,
  "message": "Email atau password salah."
}
```

---

## Akun Demo (Seeder)

| Role    | Email                  | Password |
|---------|------------------------|----------|
| Pasien  | pasien@gmail.com       | 123456   |
| Perawat | perawat@gmail.com      | 123456   |

---

## Keamanan

- Password di-hash menggunakan `password_hash()` + `PASSWORD_BCRYPT`
- JWT disimpan di localStorage sisi frontend
- Semua query menggunakan **Prepared Statement** PDO
- CORS dikonfigurasi hanya untuk origin yang diizinkan
- Validasi input di setiap controller sebelum menyentuh database

---

## Sistem Edukasi (Baru)

### Tabel Database
- `edukasi` — konten edukasi (artikel/video/reel)
- `admin` — akun admin pengelola konten

### Endpoint API

| Method | URL | Deskripsi | Auth |
|---|---|---|---|
| GET | `/api/edukasi/index.php` | List konten publik (terbit saja) | ❌ |
| GET | `/api/edukasi/index.php?kategori=Nutrisi` | Filter kategori | ❌ |
| GET | `/api/edukasi/index.php?admin=1` | List semua (termasuk draft) | Admin |
| GET | `/api/edukasi/index.php?id=1` | Detail satu konten | ❌ |
| POST | `/api/edukasi/index.php` | Tambah konten baru | Admin |
| PUT | `/api/edukasi/index.php?id=1` | Update konten | Admin |
| DELETE | `/api/edukasi/index.php?id=1` | Hapus konten | Admin |
| PUT | `/api/edukasi/index.php?id=1&action=toggle` | Toggle terbit/draft | Admin |
| POST | `/api/admin/login.php` | Login admin | ❌ |
| GET | `/api/admin/me.php` | Profil admin aktif | Admin |

### Validasi Sumber Terpercaya
Backend menolak `url_artikel` yang bukan dari domain: `who.int`, `kemkes.go.id`, `satusehat.kemkes.go.id`, `mayoclinic.org`, `clevelandclinic.org`, `cdc.gov`, `nhs.uk`, `halodoc.com`, `alodokter.com`.

`url_video` wajib dari domain YouTube (`youtube.com`/`youtu.be`), dan `url_reel` wajib dari `instagram.com`.

### Akun Admin Demo
```
Email: admin@hypercare.id
Password: admin123
```
Akses panel: `/admin/login` → `/admin/edukasi`

---

## AI Chatbot (OpenAI Integration)

### Arsitektur
```
React (AIChat.jsx)
   ↓ Axios
PHP REST API (/api/ai-chat/index.php → AiChatController)
   ↓ cURL (server-to-server, API key tidak pernah dikirim ke frontend)
OpenAI Chat Completions API
   ↓ JSON
PHP (simpan ke MySQL + cari rekomendasi edukasi)
   ↓ JSON
React (render bubble chat + auto scroll + rekomendasi)
```

### Setup Wajib
1. Dapatkan API key dari https://platform.openai.com/api-keys
2. Set sebagai environment variable di server (disarankan, jangan hardcode):
   ```bash
   # Linux/Apache — tambahkan di .htaccess atau vhost config
   SetEnv OPENAI_API_KEY "sk-xxxxxxxxxxxxxxxx"
   ```
   Atau edit langsung `config/app.php` (kurang aman, hanya untuk development lokal):
   ```php
   define('OPENAI_API_KEY', 'sk-xxxxxxxxxxxxxxxx');
   ```
3. Pastikan ekstensi PHP `curl` aktif (`php -m | grep curl`).
4. Import ulang `database/hypercare.sql` agar tabel `ai_conversations` ikut terbuat (atau jalankan bagian SQL tabel tersebut secara manual jika DB sudah ada sebelumnya).

### Tabel Database
- `ai_conversations` — menyimpan SETIAP pesan (baik dari pasien maupun balasan AI), termasuk id konten edukasi yang direkomendasikan pada pesan tersebut.

### Endpoint API

| Method | URL | Deskripsi | Auth |
|---|---|---|---|
| GET | `/api/ai-chat/index.php?action=history` | Ambil seluruh riwayat chat pasien | Pasien |
| POST | `/api/ai-chat/index.php?action=send` | Kirim pesan baru, dapat balasan AI | Pasien |
| DELETE | `/api/ai-chat/index.php?action=clear` | Hapus seluruh riwayat chat pasien | Pasien |

### Cara Kerja Rekomendasi Edukasi
`EdukasiRecommenderService` mencocokkan kata kunci dari (pertanyaan pengguna + judul riwayat kesehatan pasien) terhadap judul/ringkasan/kategori seluruh konten `edukasi` yang berstatus terbit, lalu mengembalikan hingga 3 konten paling relevan. AI sendiri TIDAK menentukan rekomendasi — pencocokan dilakukan murni di backend PHP berdasarkan data MySQL, sehingga rekomendasi selalu konsisten dengan database meski jawaban AI bervariasi.

### Fitur yang Diimplementasikan
- Riwayat percakapan tersimpan permanen di MySQL (tabel `ai_conversations`), dimuat ulang saat halaman dibuka.
- Context window: 12 pesan terakhir dikirim ke OpenAI sebagai riwayat percakapan + system prompt berisi profil, riwayat kesehatan, dan data tekanan darah pasien.
- Retry otomatis di level server (2x percobaan dengan backoff) untuk error 429/500/502/503 dari OpenAI.
- Retry manual di frontend: jika gagal, muncul tombol "Coba lagi" pada bubble error.
- Typing indicator (3 titik animasi) saat menunggu balasan AI.
- Auto-scroll ke pesan terbaru.
- Timestamp per pesan (format waktu lokal Indonesia).
- Validasi panjang pesan (maks 2000 karakter) dan pesan kosong di backend.

---

## Pelengkap Sebelumnya + Fitur Baru (Update Terbaru)

### Tabel Database Baru
- `login_logs` — riwayat login (device, IP, status, waktu)
- `activity_logs` — jejak aktivitas user (login, catat tekanan, edit profil, dll)

### Endpoint Baru (Agregat — Optimasi REST API)
| Method | URL | Deskripsi |
|---|---|---|
| GET | `/api/dashboard/index.php?action=pasien` | Satu request gabungan: statistik + grafik + notifikasi + aktivitas pasien |
| GET | `/api/dashboard/index.php?action=perawat` | Satu request gabungan: statistik global + konsultasi terbaru + aktivitas |
| GET | `/api/dashboard/index.php?action=aktivitas&limit=30` | Daftar aktivitas terbaru (pasien: milik sendiri, perawat: semua) |
| GET | `/api/dashboard/index.php?action=login-history&limit=20` | Riwayat login akun aktif |
| GET | `/api/dashboard/index.php?action=chat-ai-history` | Ringkasan riwayat chat AI |

Endpoint agregat ini mengurangi jumlah round-trip Axios dari 2–3 request terpisah menjadi 1 request per halaman dashboard — mempercepat waktu muat dan mengurangi beban server.

### Logging Otomatis
Setiap login sukses dan aksi penting (catat tekanan darah, edit profil) otomatis tercatat lewat helper global `logActivity()` dan `logLogin()` di `config/helpers.php`. Logging tidak pernah menggagalkan request utama (dibungkus try-catch silent).

### Keamanan Tambahan
Folder `config/` dan `services/` kini diproteksi `.htaccess` (`Deny from all`) — tidak bisa diakses langsung lewat URL browser, hanya bisa di-`require` dari controller server-side.

---

## Optimasi Performa Frontend (React)

### React Lazy Loading
Seluruh halaman di `App.jsx` di-lazy-load dengan `React.lazy()` + `<Suspense>`. Hasil build menunjukkan setiap halaman jadi chunk JS terpisah (code-splitting), bundle awal jadi jauh lebih kecil karena halaman lain baru dimuat saat rute-nya diakses.

### Error Boundary
`src/components/common/ErrorBoundary.jsx` membungkus seluruh `<Routes>` di `App.jsx`. Jika ada error render di halaman manapun, hanya area konten yang menampilkan pesan error + tombol "Muat Ulang" — tidak mem-blank-kan seluruh aplikasi.

### Custom Hooks Baru
| Hook | Fungsi |
|---|---|
| `useApi(url, deps, options)` | Generik untuk GET request: loading, error, data, refetch otomatis |
| `useDebounce(value, delay)` | Menunda update value (dipakai di search Data Pasien) |
| `usePolling(callback, ms, enabled)` | Polling otomatis dengan cleanup aman (dipakai di chat real-time) |
| `useChartJs(config, deps)` | Loader Chart.js singleton + auto cleanup instance grafik |
| `useLocalAuthUser()` | Shorthand ambil data user aktif dari AuthContext |

### Reusable Components Baru
`src/components/common/`: `LoadingSpinner`, `SkeletonCard`, `EmptyState`, `ErrorState`, `StatCard`, `StatusBadge` — dipakai berulang di banyak halaman menggantikan kode loading/empty/error yang sebelumnya ditulis manual di setiap file.

### React.memo
`Sidebar`, `StatCard`, `StatusBadge` dibungkus `React.memo()` karena sering menerima props yang sama berulang kali saat halaman lain re-render — mencegah re-render yang tidak perlu.

### Halaman Baru
- **Aktivitas Terbaru** (`/aktivitas`) — log aktivitas user (pasien: miliknya sendiri, perawat: gabungan semua pasien)
- **Riwayat Login** (`/riwayat-login`) — histori login dengan info device & IP
- **Riwayat Chat AI** (`/riwayat-chat-ai`) — ringkasan percakapan AI Chat di luar halaman chat utama
- **Dashboard Statistik** (`/statistik`, khusus perawat) — grafik donat + bar perbandingan status risiko seluruh pasien

Build production diverifikasi sukses (`npm run build`) tanpa error sebelum dikemas.

---

## Catatan Audit Final (Review & Finalisasi)

Audit menyeluruh dilakukan sebelum rilis final. Berikut temuan dan status perbaikannya secara jujur — tidak ada klaim "100% sempurna" tanpa bukti.

### Bug Keamanan Nyata yang Ditemukan & Diperbaiki
1. **Upload file tidak aman** (`PasienController`, `PerawatController`) — validasi sebelumnya hanya mengecek `$_FILES['type']` yang dikirim browser (mudah dipalsukan, misal upload `.php` berisi shell dengan header MIME palsu `image/jpeg`). Diperbaiki dengan `finfo_file()` untuk membaca MIME type asli dari isi file, dan nama file output ditentukan sistem (bukan dari nama asli yang dikirim client).
2. **Otorisasi chat lemah** (`ChatController::send`) — sebelumnya siapa pun yang login bisa kirim pesan atas nama `pasien_id`/`perawat_id` siapa saja selama tahu ID-nya. Diperbaiki dengan memverifikasi pengirim hanya boleh mengirim sebagai dirinya sendiri.
3. **Perbandingan ID rentan tipe data** (11 titik di `TekananDarahController`, `RiwayatKesehatanController`, `KonsultasiController`, `PasienController`, `PerawatController`, `ChatController`) — perbandingan `!==`/`===` antara ID dari JWT (integer) dan ID dari hasil fetch PDO berisiko salah jika konfigurasi server berbeda. Semua dipaksa `(int)` eksplisit di kedua sisi agar type-safe terlepas dari konfigurasi PHP/MySQL/PDO apa pun.
4. **Tidak ada validasi rentang nilai medis** (`TekananDarahController`) — sistolik/diastolik/nadi/berat badan sebelumnya hanya dicek "tidak kosong", bisa diisi nilai negatif atau ekstrem. Ditambahkan validasi rentang wajar (sistolik 50-260, diastolik 30-200, dst).
5. **Sanitasi XSS belum diterapkan** — fungsi `clean()` sudah ada sejak awal tapi tidak pernah dipanggil di controller manapun. Sekarang diterapkan ke semua field teks bebas (judul edukasi, ringkasan, isi, penulis, deskripsi riwayat kesehatan, catatan tekanan darah, pesan chat, keluhan konsultasi) sebagai lapis pertahanan kedua di luar auto-escaping React.
6. **Validasi format input kurang ketat** — ditambahkan validasi format tanggal (regex `YYYY-MM-DD`), format email (`FILTER_VALIDATE_EMAIL`), format nomor HP, dan batas panjang pesan chat (1000 karakter) / pesan AI Chat (2000 karakter) di backend.
7. **System prompt AI rentan prompt injection ringan** — riwayat kesehatan pasien (judul ditulis bebas oleh pasien) dimasukkan mentah ke system prompt OpenAI. Ditambahkan instruksi eksplisit agar AI memperlakukan konteks tersebut sebagai data, bukan instruksi yang harus diikuti. Dampak risiko rendah karena terisolasi per pasien (tidak ada eskalasi ke akun lain).

### Dead Code yang Dibersihkan
`src/data/data.js` sebelumnya masih menyimpan `HC_RIWAYAT`, `HC_PASIEN_LIST`, `HC_AI_ANSWERS`, dan fungsi `hcAIReply()` — sisa dummy data dari versi awal sebelum backend terhubung. Dikonfirmasi tidak ada satu pun file yang masih meng-import-nya, lalu dihapus. File ini sekarang hanya berisi `HC_NURSES`, `HC_FAQ`, `HC_AI_QUICK` — konten statis non-database yang memang tidak perlu API call (FAQ landing page, label tombol pertanyaan cepat).

### Verifikasi yang Dilakukan (Bukan Asumsi)
- **SQL Injection**: di-grep menyeluruh untuk pola `->query()` (non-prepared) dan string interpolation langsung ke SQL. Hasil: nol query berisiko — seluruh input user masuk lewat placeholder `?` di prepared statement.
- **XSS frontend**: di-grep untuk `dangerouslySetInnerHTML` di seluruh `src/`. Hasil: nol penggunaan — React secara otomatis meng-escape semua output teks.
- **Auth coverage**: setiap method di setiap controller diperiksa satu per satu untuk memastikan endpoint sensitif memanggil `requireAuth()`/`requireRole()`. Endpoint publik yang sengaja tidak diproteksi (login, register, baca artikel edukasi) dikonfirmasi memang harus publik sesuai desain.
- **Password hashing**: dikonfirmasi `password_hash(PASSWORD_BCRYPT)` dipakai di semua titik registrasi/buat user, `password_verify()` di semua titik login.
- **Build production**: `npm run build` dijalankan ulang setelah seluruh perbaikan backend untuk memastikan tidak ada regresi di frontend. Hasil: sukses, 38 chunk JS ter-generate (bukti code-splitting/lazy-loading bekerja).

### Keterbatasan yang Diketahui (Transparansi)
- Validasi form di sisi React untuk halaman CRUD non-auth (Catat Tekanan, Monitoring Pasien, Data Pasien, Admin Edukasi, Profil) masih mengandalkan atribut HTML `required` bawaan browser, bukan komponen validasi custom seperti di halaman Login/Register. Ini sengaja TIDAK diubah karena instruksi eksplisit melarang perubahan desain — menambah elemen pesan error baru akan mengubah tampilan visual halaman tersebut. Sebagai gantinya, validasi keamanan dan integritas data sepenuhnya ditegakkan di backend (lihat poin 4 dan 6 di atas), sehingga data tetap aman dan valid meskipun validasi HTML di-bypass oleh pengguna teknis.
- Endpoint `/api/konsultasi/*` (jadwal konsultasi terstruktur) ada lengkap di backend dengan keamanan yang sudah diaudit, namun tidak punya halaman UI di frontend — fitur booking konsultasi yang ada saat ini berbasis chat real-time (`/api/chat/*`), bukan penjadwalan formal. Tabel `konsultasi` dan controller-nya dibiarkan ada untuk pengembangan fitur ke depan, tidak mengganggu apa pun yang sudah berjalan.
- Audit ini dilakukan melalui pembacaan kode statis dan `npm run build` (karena PHP CLI tidak tersedia di lingkungan pengembangan ini untuk menjalankan backend secara langsung/unit test). Disarankan tetap melakukan smoke-test manual di XAMPP sebelum deploy ke production: login tiap role, CRUD tiap modul, dan kirim 1 pesan AI Chat sungguhan dengan API key OpenAI aktif.
