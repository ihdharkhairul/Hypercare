<?php
// ============================================================
//  controllers/KonsultasiController.php
// ============================================================

require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../models/KonsultasiModel.php';

class KonsultasiController
{
    private KonsultasiModel $model;

    public function __construct()
    {
        $this->model = new KonsultasiModel();
    }

    // GET /api/konsultasi
    public function index(): void
    {
        $auth = requireAuth();

        if ($auth['role'] === 'pasien') {
            $data = $this->model->getByPasien($auth['id']);
        } else {
            $data = $this->model->getByPerawat($auth['id']);
        }

        jsonSuccess('Daftar konsultasi.', $data);
    }

    // POST /api/konsultasi  — pasien buat jadwal
    public function store(): void
    {
        $auth = requireAuth();

        if ($auth['role'] !== 'pasien') {
            jsonError('Hanya pasien yang dapat membuat konsultasi.', 403);
        }

        $body = getBody();
        $required = ['perawat_id', 'tanggal'];
        foreach ($required as $f) {
            if (empty($body[$f])) jsonError("Field '$f' wajib diisi.");
        }
        if (!preg_match('/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/', $body['tanggal'])) {
            jsonError('Format tanggal tidak valid.');
        }
        $body = cleanArray($body, ['keluhan']);

        $body['pasien_id'] = $auth['id'];
        $id = $this->model->create($body);

        jsonSuccess('Permintaan konsultasi berhasil dikirim.', ['id' => $id], 201);
    }

    // PUT /api/konsultasi/{id}/status  — perawat update status
    public function updateStatus(int $id): void
    {
        $auth = requireAuth();

        if ($auth['role'] !== 'perawat') {
            jsonError('Hanya perawat yang dapat mengubah status konsultasi.', 403);
        }

        $body    = getBody();
        $status  = $body['status']  ?? '';
        $catatan = !empty($body['catatan']) ? clean($body['catatan']) : null;

        $allowed = ['menunggu', 'aktif', 'selesai', 'dibatalkan'];
        if (!in_array($status, $allowed, true)) {
            jsonError('Status tidak valid. Pilihan: ' . implode(', ', $allowed));
        }

        $konsultasi = $this->model->findById($id);
        if (!$konsultasi) jsonError('Konsultasi tidak ditemukan.', 404);

        if ((int)$konsultasi['perawat_id'] !== (int)$auth['id']) {
            jsonError('Akses ditolak.', 403);
        }

        $this->model->updateStatus($id, $status, $catatan);
        jsonSuccess('Status konsultasi diperbarui.');
    }
}
