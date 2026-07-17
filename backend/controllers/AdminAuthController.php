<?php
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../models/AdminModel.php';

class AdminAuthController {
    private AdminModel $model;
    public function __construct() { $this->model = new AdminModel(); }

    public function login(): void {
        $body = getBody();
        $email    = trim($body['email'] ?? '');
        $password = trim($body['password'] ?? '');

        if (!$email || !$password) jsonError('Email dan password wajib diisi.');

        $admin = $this->model->findByEmail($email);
        if (!$admin || !password_verify($password, $admin['password'])) {
            jsonError('Email atau password salah.', 401);
        }

        $token = jwtEncode(['id' => $admin['id'], 'role' => 'admin', 'nama' => $admin['nama']]);
        unset($admin['password']);

        jsonSuccess('Login berhasil.', ['token' => $token, 'user' => $admin, 'role' => 'admin']);
    }

    public function me(): void {
        $payload = requireAuth();
        if ($payload['role'] !== 'admin') jsonError('Akses ditolak.', 403);
        $admin = $this->model->findById($payload['id']);
        if (!$admin) jsonError('Admin tidak ditemukan.', 404);
        jsonSuccess('OK', ['role' => 'admin', 'user' => $admin]);
    }
}
