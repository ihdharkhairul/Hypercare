<?php
// ============================================================
//  controllers/AuthController.php  — v2 with remember-me
// ============================================================

require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../models/PasienModel.php';
require_once __DIR__ . '/../models/PerawatModel.php';

class AuthController
{
    private PasienModel  $pasienModel;
    private PerawatModel $perawatModel;

    public function __construct()
    {
        $this->pasienModel  = new PasienModel();
        $this->perawatModel = new PerawatModel();
    }

    // ----------------------------------------------------------
    // POST /api/auth/login-pasien.php
    // Body: { email, password, remember? }
    // ----------------------------------------------------------
    public function loginPasien(): void
    {
        $body     = getBody();
        $email    = trim($body['email']    ?? '');
        $password = trim($body['password'] ?? '');
        $remember = !empty($body['remember']);

        // Validasi
        $errors = [];
        if (!$email)                                          $errors['email']    = 'Email wajib diisi.';
        elseif (!filter_var($email, FILTER_VALIDATE_EMAIL))  $errors['email']    = 'Format email tidak valid.';
        if (!$password)                                       $errors['password'] = 'Password wajib diisi.';
        elseif (strlen($password) < 6)                       $errors['password'] = 'Password minimal 6 karakter.';
        if ($errors) jsonError('Validasi gagal.', 422, ['errors' => $errors]);

        $pasien = $this->pasienModel->findByEmail($email);
        if (!$pasien || !password_verify($password, $pasien['password'])) {
            jsonError('Email atau password salah.', 401);
        }

        // Buat JWT
        $token = jwtEncode(['id' => $pasien['id'], 'role' => 'pasien', 'nama' => $pasien['nama']]);

        // Remember me token
        $rememberToken = null;
        if ($remember) {
            $rememberToken = generateRememberToken();
            saveRememberToken($pasien['id'], 'pasien', $rememberToken);
        }

        unset($pasien['password']);

        logLogin($pasien['id'], 'pasien');
        logActivity($pasien['id'], 'pasien', 'login', 'Berhasil masuk ke akun', 'auth');

        jsonSuccess('Login berhasil.', [
            'token'          => $token,
            'remember_token' => $rememberToken,
            'user'           => $pasien,
            'role'           => 'pasien',
        ]);
    }

    // ----------------------------------------------------------
    // POST /api/auth/login-perawat.php
    // ----------------------------------------------------------
    public function loginPerawat(): void
    {
        $body     = getBody();
        $email    = trim($body['email']    ?? '');
        $password = trim($body['password'] ?? '');
        $remember = !empty($body['remember']);

        $errors = [];
        if (!$email)                                         $errors['email']    = 'Email wajib diisi.';
        elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors['email']    = 'Format email tidak valid.';
        if (!$password)                                      $errors['password'] = 'Password wajib diisi.';
        elseif (strlen($password) < 6)                      $errors['password'] = 'Password minimal 6 karakter.';
        if ($errors) jsonError('Validasi gagal.', 422, ['errors' => $errors]);

        $perawat = $this->perawatModel->findByEmail($email);
        if (!$perawat || !password_verify($password, $perawat['password'])) {
            jsonError('Email atau password salah.', 401);
        }

        // Set online
        $this->perawatModel->update($perawat['id'], ['is_online' => 1]);

        $token = jwtEncode(['id' => $perawat['id'], 'role' => 'perawat', 'nama' => $perawat['nama']]);

        $rememberToken = null;
        if ($remember) {
            $rememberToken = generateRememberToken();
            saveRememberToken($perawat['id'], 'perawat', $rememberToken);
        }

        unset($perawat['password']);

        logLogin($perawat['id'], 'perawat');
        logActivity($perawat['id'], 'perawat', 'login', 'Berhasil masuk ke akun', 'auth');

        jsonSuccess('Login berhasil.', [
            'token'          => $token,
            'remember_token' => $rememberToken,
            'user'           => $perawat,
            'role'           => 'perawat',
        ]);
    }

    // ----------------------------------------------------------
    // POST /api/auth/register-pasien.php
    // ----------------------------------------------------------
    public function registerPasien(): void
    {
        $body = getBody();

        $errors = [];
        if (empty($body['nama']))                                     $errors['nama']     = 'Nama wajib diisi.';
        if (empty($body['email']))                                    $errors['email']    = 'Email wajib diisi.';
        elseif (!filter_var($body['email'], FILTER_VALIDATE_EMAIL))  $errors['email']    = 'Format email tidak valid.';
        if (empty($body['password']))                                 $errors['password'] = 'Password wajib diisi.';
        elseif (strlen($body['password']) < 6)                       $errors['password'] = 'Password minimal 6 karakter.';
        if (!empty($body['no_hp'])) {
            $body['no_hp'] = preg_replace('/[-\s]/', '', $body['no_hp']);
            if (!preg_match('/^08[0-9]{8,11}$/', $body['no_hp'])) {
                $errors['no_hp'] = 'Nomor HP tidak valid (08xxxxxxxx).';
            }
        }
        if ($errors) jsonError('Validasi gagal.', 422, ['errors' => $errors]);

        if ($this->pasienModel->emailExists($body['email'])) {
            jsonError('Email sudah terdaftar.', 409, ['errors' => ['email' => 'Email sudah digunakan.']]);
        }

        $id = $this->pasienModel->create($body);
        jsonSuccess('Registrasi berhasil.', ['id' => $id], 201);
    }

    // ----------------------------------------------------------
    // POST /api/auth/register-perawat.php
    // ----------------------------------------------------------
    public function registerPerawat(): void
    {
        $body = getBody();

        $errors = [];
        if (empty($body['nama']))                                     $errors['nama']     = 'Nama wajib diisi.';
        if (empty($body['email']))                                    $errors['email']    = 'Email wajib diisi.';
        elseif (!filter_var($body['email'], FILTER_VALIDATE_EMAIL))  $errors['email']    = 'Format email tidak valid.';
        if (empty($body['password']))                                 $errors['password'] = 'Password wajib diisi.';
        elseif (strlen($body['password']) < 6)                       $errors['password'] = 'Password minimal 6 karakter.';
        if ($errors) jsonError('Validasi gagal.', 422, ['errors' => $errors]);

        if ($this->perawatModel->emailExists($body['email'])) {
            jsonError('Email sudah terdaftar.', 409, ['errors' => ['email' => 'Email sudah digunakan.']]);
        }

        $id = $this->perawatModel->create($body);
        jsonSuccess('Registrasi perawat berhasil.', ['id' => $id], 201);
    }

    // ----------------------------------------------------------
    // POST /api/auth/logout.php
    // ----------------------------------------------------------
    public function logout(): void
    {
        $body  = getBody();
        $rTok  = $body['remember_token'] ?? null;

        // Hapus remember token jika ada
        if ($rTok) deleteRememberToken($rTok);

        // Jika masih bisa decode JWT, set perawat offline
        $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (str_starts_with($auth, 'Bearer ')) {
            $payload = jwtDecode(substr($auth, 7));
            if ($payload && $payload['role'] === 'perawat') {
                $this->perawatModel->update($payload['id'], ['is_online' => 0]);
            }
        }

        jsonSuccess('Logout berhasil.');
    }

    // ----------------------------------------------------------
    // POST /api/auth/refresh.php  — tukar remember_token → JWT baru
    // ----------------------------------------------------------
    public function refresh(): void
    {
        $body  = getBody();
        $rTok  = trim($body['remember_token'] ?? '');

        if (!$rTok) jsonError('Remember token tidak ditemukan.', 401);

        $row = validateRememberToken($rTok);
        if (!$row) jsonError('Token ingat login kadaluarsa atau tidak valid.', 401);

        $userId = (int) $row['user_id'];
        $role   = $row['role'];

        if ($role === 'pasien') {
            $user = (new PasienModel())->findById($userId);
        } else {
            $user = (new PerawatModel())->findById($userId);
        }

        if (!$user) jsonError('Pengguna tidak ditemukan.', 404);

        $newToken = jwtEncode(['id' => $userId, 'role' => $role, 'nama' => $user['nama']]);

        jsonSuccess('Token diperbarui.', [
            'token' => $newToken,
            'user'  => $user,
            'role'  => $role,
        ]);
    }

    // ----------------------------------------------------------
    // GET /api/auth/me.php
    // ----------------------------------------------------------
    public function me(): void
    {
        $payload = requireAuth();

        if ($payload['role'] === 'pasien') {
            $user = $this->pasienModel->findById($payload['id']);
        } else {
            $user = $this->perawatModel->findById($payload['id']);
        }

        if (!$user) jsonError('Pengguna tidak ditemukan.', 404);

        jsonSuccess('OK', ['role' => $payload['role'], 'user' => $user]);
    }
}