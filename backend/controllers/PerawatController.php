<?php
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../models/PerawatModel.php';

class PerawatController {
    private PerawatModel $model;
    public function __construct() { $this->model = new PerawatModel(); }

    public function index(): void {
        requireAuth();
        jsonSuccess('OK', $this->model->getAll());
    }
    public function show(int $id): void {
        requireAuth();
        $p = $this->model->findById($id);
        if (!$p) jsonError('Tidak ditemukan.', 404);
        jsonSuccess('OK', $p);
    }
    public function update(int $id): void {
        $auth = requireAuth();
        if ($auth['role'] !== 'perawat' || (int)$auth['id'] !== $id) jsonError('Akses ditolak.', 403);
        $body = $_POST ?: getBody();

        if (isset($body['nama']) && trim($body['nama']) === '') {
            jsonError('Nama tidak boleh kosong.');
        }
        $body = cleanArray($body, ['nama', 'alamat', 'spesialis', 'pengalaman']);

        if (!empty($_FILES['foto'])) {
            $body['foto'] = $this->uploadFoto($_FILES['foto']);
        } elseif (!empty($body['hapus_foto'])) {
            $body['foto'] = null;
        }
        $this->model->update($id, $body);
        logActivity($id, 'perawat', 'edit_profil', 'Memperbarui informasi profil', 'profil', $id);
        jsonSuccess('Profil diperbarui.', $this->model->findById($id));
    }
    public function status(int $id): void {
        $auth = requireAuth();
        if ($auth['role'] !== 'perawat' || (int)$auth['id'] !== $id) jsonError('Akses ditolak.', 403);
        $body = getBody();
        $isOnline = isset($body['is_online']) ? (int)(bool)$body['is_online'] : null;
        if ($isOnline === null) jsonError('is_online wajib.');
        $this->model->update($id, ['is_online' => $isOnline]);
        jsonSuccess($isOnline ? 'Online.' : 'Offline.');
    }
    public function delete(int $id): void {
        requireRole('perawat');
        require_once __DIR__.'/../config/database.php';
        $db = Database::connect();
        $s = $db->prepare('DELETE FROM perawat WHERE id=?');
        $s->execute([$id]);
        if ($s->rowCount() === 0) jsonError('Tidak ditemukan.', 404);
        jsonSuccess('Dihapus.');
    }
    private function uploadFoto(array $file): string {
        if ($file['size'] > MAX_UPLOAD_SIZE) jsonError('Foto maks 2 MB.');

        // Validasi MIME type dari ISI FILE sesungguhnya (bukan dari header
        // yang dikirim client, yang dapat dipalsukan dengan mudah).
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $realMime = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($realMime, ALLOWED_IMG_TYPES, true)) {
            jsonError('Format file tidak valid. Harus berupa gambar JPG, PNG, atau WEBP asli.');
        }

        $extMap = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
        $ext = $extMap[$realMime];

        $filename = 'perawat_' . bin2hex(random_bytes(16)) . '.' . $ext;
        if (!move_uploaded_file($file['tmp_name'], UPLOAD_PATH . $filename)) jsonError('Gagal simpan.', 500);
        return UPLOAD_URL . $filename;
    }
}