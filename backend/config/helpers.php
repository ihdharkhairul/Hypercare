<?php
// ============================================================
//  config/helpers.php
// ============================================================

require_once __DIR__ . '/app.php';

// -----------------------------------------------------------
// CORS Headers — dipanggil di SEMUA endpoint API
// Dua lapis: Apache (.htaccess) + PHP (di sini)
// -----------------------------------------------------------
function setCorsHeaders(): void
{
    // Hapus header CORS yang mungkin sudah dikirim Apache
    // untuk menghindari duplikasi header
    if (function_exists('header_remove')) {
        header_remove('Access-Control-Allow-Origin');
        header_remove('Access-Control-Allow-Methods');
        header_remove('Access-Control-Allow-Headers');
    }

    // Kirim header CORS dari PHP saja (satu kali)
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Max-Age: 86400');
    header('Content-Type: application/json; charset=utf-8');

    // Preflight OPTIONS — langsung return 200
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

// -----------------------------------------------------------
// JSON Responses
// -----------------------------------------------------------
function jsonResponse(bool $success, string $message, mixed $data = null, int $code = 200): never
{
    http_response_code($code);
    $body = ['success' => $success, 'message' => $message];
    if ($data !== null) $body['data'] = $data;
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function jsonSuccess(string $message, mixed $data = null, int $code = 200): never
{
    jsonResponse(true, $message, $data, $code);
}

function jsonError(string $message, int $code = 400, mixed $data = null): never
{
    jsonResponse(false, $message, $data, $code);
}

// -----------------------------------------------------------
// Request Body
// -----------------------------------------------------------
function getBody(): array
{
    $ct = $_SERVER['CONTENT_TYPE'] ?? '';
    if (str_contains($ct, 'application/json')) {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }
    return $_POST;
}

// -----------------------------------------------------------
// JWT
// -----------------------------------------------------------
function jwtEncode(array $payload): string
{
    $h = base64url(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload['iat'] = time();
    $payload['exp'] = time() + JWT_EXPIRE;
    $p = base64url(json_encode($payload));
    $s = base64url(hash_hmac('sha256', "$h.$p", JWT_SECRET, true));
    return "$h.$p.$s";
}

function jwtDecode(string $token): ?array
{
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    [$h, $p, $sig] = $parts;
    $expected = base64url(hash_hmac('sha256', "$h.$p", JWT_SECRET, true));
    if (!hash_equals($expected, $sig)) return null;
    $data = json_decode(base64_decode(strtr($p, '-_', '+/')), true);
    if (!$data || $data['exp'] < time()) return null;
    return $data;
}

function base64url(string $data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

// -----------------------------------------------------------
// Auth Middleware
// -----------------------------------------------------------
function requireAuth(): array
{
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!str_starts_with($auth, 'Bearer ')) {
        jsonError('Token tidak ditemukan. Silakan login.', 401);
    }
    $payload = jwtDecode(substr($auth, 7));
    if (!$payload) {
        jsonError('Token tidak valid atau sudah kadaluarsa.', 401);
    }
    return $payload;
}

function requireRole(string $role): array
{
    $payload = requireAuth();
    if ($payload['role'] !== $role) {
        jsonError("Akses ditolak. Hanya $role yang diizinkan.", 403);
    }
    return $payload;
}

function requireAnyRole(array $roles): array
{
    $payload = requireAuth();
    if (!in_array($payload['role'], $roles, true)) {
        jsonError('Akses ditolak. Anda tidak memiliki izin.', 403);
    }
    return $payload;
}

// -----------------------------------------------------------
// Remember Me
// -----------------------------------------------------------
function generateRememberToken(): string
{
    return bin2hex(random_bytes(32));
}

function saveRememberToken(int $userId, string $role, string $token): void
{
    require_once __DIR__ . '/../config/database.php';
    $db = Database::connect();
    $stmt = $db->prepare('DELETE FROM remember_tokens WHERE user_id = ? AND role = ?');
    $stmt->execute([$userId, $role]);
    $stmt = $db->prepare(
        'INSERT INTO remember_tokens (user_id, role, token, expires_at)
         VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))'
    );
    $stmt->execute([$userId, $role, $token]);
}

function validateRememberToken(string $token): ?array
{
    require_once __DIR__ . '/../config/database.php';
    $db = Database::connect();
    $stmt = $db->prepare(
        'SELECT user_id, role FROM remember_tokens
         WHERE token = ? AND expires_at > NOW() LIMIT 1'
    );
    $stmt->execute([$token]);
    return $stmt->fetch() ?: null;
}

function deleteRememberToken(string $token): void
{
    require_once __DIR__ . '/../config/database.php';
    $db = Database::connect();
    $db->prepare('DELETE FROM remember_tokens WHERE token = ?')->execute([$token]);
}

function deleteAllRememberTokens(int $userId, string $role): void
{
    require_once __DIR__ . '/../config/database.php';
    $db = Database::connect();
    $db->prepare('DELETE FROM remember_tokens WHERE user_id = ? AND role = ?')->execute([$userId, $role]);
}

// -----------------------------------------------------------
// Sanitasi Input
// -----------------------------------------------------------
function clean(string $v): string
{
    $v = trim($v);
    $v = strip_tags($v);
    $v = preg_replace('/javascript\s*:/i', '', $v);
    return $v;
}

function cleanArray(array $data, array $fields): array
{
    foreach ($fields as $f) {
        if (isset($data[$f]) && is_string($data[$f])) {
            $data[$f] = clean($data[$f]);
        }
    }
    return $data;
}

// -----------------------------------------------------------
// Hitung Status Tekanan Darah
// -----------------------------------------------------------
function hitungStatus(int $s, int $d): string
{
    if ($s >= 160 || $d >= 100) return 'Hipertensi Tingkat 2';
    if ($s >= 140 || $d >= 90)  return 'Hipertensi Tingkat 1';
    if ($s >= 130 || $d >= 85)  return 'Pra Hipertensi';
    return 'Normal';
}

// -----------------------------------------------------------
// Activity & Login Log
// -----------------------------------------------------------
function logActivity(int $userId, string $role, string $aksi, ?string $deskripsi = null, ?string $entityType = null, ?int $entityId = null): void
{
    try {
        require_once __DIR__ . '/../models/ActivityLogModel.php';
        (new ActivityLogModel())->record($userId, $role, $aksi, $deskripsi, $entityType, $entityId);
    } catch (\Throwable $e) {
        // Silent — logging tidak boleh gagalkan request utama
    }
}

function logLogin(int $userId, string $role, string $status = 'sukses'): void
{
    try {
        require_once __DIR__ . '/../models/LoginLogModel.php';
        (new LoginLogModel())->record($userId, $role, $status);
    } catch (\Throwable $e) {
        // Silent
    }
}
