<?php
// ============================================================
//  config/app.php
//  Konfigurasi umum aplikasi
// ============================================================

define('APP_NAME',    'HyperCare API');
define('APP_VERSION', '1.0.0');
define('APP_ENV',     'development');   // 'production' di server live

// Ganti dengan URL backend setelah deploy
define('BASE_URL', 'http://localhost/hypercare/backend');

// Secret key untuk JWT – WAJIB diganti di production!
define('JWT_SECRET', 'hypercare_secret_key_2025_ganti_ini');
define('JWT_EXPIRE', 86400); // 24 jam (detik)

// Izinkan origin frontend (sesuaikan port Vite)
define('ALLOWED_ORIGINS', [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
]);

// Ukuran maksimum upload foto (bytes)
define('MAX_UPLOAD_SIZE', 2 * 1024 * 1024); // 2 MB
define('ALLOWED_IMG_TYPES', ['image/jpeg', 'image/png', 'image/webp']);

// Path folder upload (relatif terhadap root backend)
define('UPLOAD_PATH', __DIR__ . '/../uploads/');
define('UPLOAD_URL',  BASE_URL . '/uploads/');

// ── OpenAI API (AI Chat) — TIDAK DIPAKAI SAAT INI ───────────
// Aplikasi sekarang memakai Google Gemini (lihat di bawah).
// Konfigurasi ini dibiarkan tersimpan kalau suatu saat ingin
// pindah kembali ke OpenAI — tinggal ganti AI_PROVIDER.
define('OPENAI_API_KEY', getenv('OPENAI_API_KEY') ?: 'sk-REPLACE_WITH_YOUR_OPENAI_API_KEY');
define('OPENAI_MODEL', 'gpt-4o-mini');
define('OPENAI_API_URL', 'https://api.openai.com/v1/chat/completions');

// ── Google Gemini API (AI Chat) — AKTIF ─────────────────────
// Dapatkan API key gratis di: https://aistudio.google.com/apikey
// PENTING: Jangan commit API key asli ke repository publik.
// Disarankan set lewat environment variable GEMINI_API_KEY di server.
define('GEMINI_API_KEY', getenv('GEMINI_API_KEY') ?: '');
define('GEMINI_MODEL', 'gemini-2.5-flash');
define('GEMINI_API_URL', 'https://generativelanguage.googleapis.com/v1beta/models');

define('AI_MAX_HISTORY', 12);      // jumlah pesan terakhir yang dikirim sebagai konteks
define('AI_REQUEST_TIMEOUT', 30);  // detik