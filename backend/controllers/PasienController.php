<?php
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../models/PasienModel.php';

class PasienController {
    private PasienModel $model;
    public function __construct() { $this->model = new PasienModel(); }

    public function index(): void {
        requireAuth();
        $search = $_GET['search']??null;
        jsonSuccess('OK', $this->model->getAll($search));
    }

    public function show(int $id): void {
        $auth = requireAuth();
        if($auth['role']==='pasien' && (int)$auth['id']!==$id) jsonError('Akses ditolak.',403);
        $p = $this->model->findById($id);
        if(!$p) jsonError('Tidak ditemukan.',404);
        jsonSuccess('OK',$p);
    }

    public function update(int $id): void {
        $auth = requireAuth();
        if($auth['role']==='pasien' && (int)$auth['id']!==$id) jsonError('Akses ditolak.',403);

        // multipart/form-data (dengan file upload)
        $body = $_POST ?: getBody();

        if (isset($body['nama']) && trim($body['nama']) === '') {
            jsonError('Nama tidak boleh kosong.');
        }
        if (!empty($body['email']) && !filter_var($body['email'], FILTER_VALIDATE_EMAIL)) {
            jsonError('Format email tidak valid.');
        }
        if (!empty($body['no_hp']) && !preg_match('/^08[0-9]{8,11}$/', preg_replace('/[-\s]/', '', $body['no_hp']))) {
            jsonError('Format nomor HP tidak valid.');
        }

        $body = cleanArray($body, ['nama', 'alamat']);

        if(!empty($_FILES['foto'])) {
            $body['foto'] = $this->uploadFoto($_FILES['foto']);
        } elseif (!empty($body['hapus_foto'])) {
            $body['foto'] = null;
        }

        // Cek email duplikat
        if(!empty($body['email']) && $this->model->emailExists($body['email'],$id)) {
            jsonError('Email sudah digunakan.',409);
        }

        $this->model->update($id,$body);
        logActivity($id, 'pasien', 'edit_profil', 'Memperbarui informasi profil', 'profil', $id);
        jsonSuccess('Profil diperbarui.', $this->model->findById($id));
    }

    public function delete(int $id): void {
        requireRole('perawat');
        $ok = $this->model->delete($id);
        if(!$ok) jsonError('Tidak ditemukan.',404);
        jsonSuccess('Pasien dihapus.');
    }

    private function uploadFoto(array $file): string {
        if($file['size']>MAX_UPLOAD_SIZE) jsonError('Foto maks 2 MB.');

        // Validasi MIME type dari ISI FILE sesungguhnya (bukan dari header
        // yang dikirim client, yang dapat dipalsukan dengan mudah).
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $realMime = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if(!in_array($realMime, ALLOWED_IMG_TYPES, true)) {
            jsonError('Format file tidak valid. Harus berupa gambar JPG, PNG, atau WEBP asli.');
        }

        // Whitelist ekstensi keluaran — abaikan nama asli file dari client,
        // tentukan ekstensi sendiri berdasarkan MIME asli yang sudah divalidasi.
        $extMap = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
        $ext = $extMap[$realMime];

        $filename='pasien_'.bin2hex(random_bytes(16)).'.'.$ext;
        if(!move_uploaded_file($file['tmp_name'],UPLOAD_PATH.$filename)) jsonError('Gagal simpan foto.',500);
        return UPLOAD_URL.$filename;
    }
}
