<?php
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../models/EdukasiKuisModel.php';

class EdukasiKuisController
{
    private EdukasiKuisModel $model;
    public function __construct() { $this->model = new EdukasiKuisModel(); }

    // GET /api/edukasi-kuis/index.php?edukasi_id=1&tipe=pre
    // Pasien/publik: jawaban_benar disembunyikan.
    // Perawat (?admin=1): jawaban_benar ikut ditampilkan untuk keperluan edit.
    public function index(): void {
        $edukasiId = (int)($_GET['edukasi_id'] ?? 0);
        $tipe      = $_GET['tipe'] ?? '';
        $admin     = $_GET['admin'] ?? null;

        if (!$edukasiId) jsonError('edukasi_id wajib diisi.');
        if (!in_array($tipe, ['pre', 'post'], true)) jsonError('tipe harus pre atau post.');

        $list = $this->model->getByEdukasi($edukasiId, $tipe);

        if (!$admin) {
            // Sembunyikan kunci jawaban dari pasien/publik
            $list = array_map(function ($q) {
                unset($q['jawaban_benar']);
                return $q;
            }, $list);
        }

        jsonSuccess('OK', $list);
    }

    // GET /api/edukasi-kuis/index.php?action=count&edukasi_id=1
    // Jumlah soal pre/post — dipakai untuk menampilkan badge di kartu edukasi
    public function count(): void {
        $edukasiId = (int)($_GET['edukasi_id'] ?? 0);
        if (!$edukasiId) jsonError('edukasi_id wajib diisi.');
        jsonSuccess('OK', $this->model->countByEdukasi($edukasiId));
    }

    // POST /api/edukasi-kuis/index.php  — Perawat/Admin only
    public function store(): void {
        requireAnyRole(['perawat', 'admin']);
        $body = getBody();
        $this->validate($body);
        $id = $this->model->create($body);
        jsonSuccess('Soal berhasil ditambahkan.', $this->model->findById($id), 201);
    }

    // PUT /api/edukasi-kuis/index.php?id=1  — Perawat/Admin only
    public function update(int $id): void {
        requireAnyRole(['perawat', 'admin']);
        $existing = $this->model->findById($id);
        if (!$existing) jsonError('Soal tidak ditemukan.', 404);
        $body = getBody();
        $this->validate($body, false);
        $this->model->update($id, $body);
        jsonSuccess('Soal berhasil diperbarui.', $this->model->findById($id));
    }

    // DELETE /api/edukasi-kuis/index.php?id=1  — Perawat/Admin only
    public function delete(int $id): void {
        requireAnyRole(['perawat', 'admin']);
        $existing = $this->model->findById($id);
        if (!$existing) jsonError('Soal tidak ditemukan.', 404);
        $this->model->delete($id);
        jsonSuccess('Soal berhasil dihapus.');
    }

    // POST /api/edukasi-kuis/index.php?action=submit  — Pasien only
    // body: { edukasi_id, tipe, jawaban: { "<kuis_id>": "a"/"b"/"c"/"d", ... } }
    public function submit(): void {
        $payload = requireRole('pasien');
        $body = getBody();
        $edukasiId = (int)($body['edukasi_id'] ?? 0);
        $tipe      = $body['tipe'] ?? '';
        $jawaban   = $body['jawaban'] ?? [];

        if (!$edukasiId) jsonError('edukasi_id wajib diisi.');
        if (!in_array($tipe, ['pre', 'post'], true)) jsonError('tipe harus pre atau post.');
        if (!is_array($jawaban) || empty($jawaban)) jsonError('Jawaban wajib diisi.');

        $soalList = $this->model->getByEdukasi($edukasiId, $tipe);
        if (empty($soalList)) jsonError('Kuis untuk konten ini belum tersedia.', 404);

        $benar = 0;
        $koreksi = [];
        foreach ($soalList as $soal) {
            $jawabanUser = $jawaban[$soal['id']] ?? null;
            $isBenar = $jawabanUser === $soal['jawaban_benar'];
            if ($isBenar) $benar++;
            $koreksi[] = [
                'id'            => $soal['id'],
                'pertanyaan'    => $soal['pertanyaan'],
                'jawaban_user'  => $jawabanUser,
                'jawaban_benar' => $soal['jawaban_benar'],
                'is_benar'      => $isBenar,
            ];
        }

        $total = count($soalList);
        $skor  = $total > 0 ? (int)round(($benar / $total) * 100) : 0;

        $this->model->saveHasil($payload['id'], $edukasiId, $tipe, $skor, $total, $benar);

        jsonSuccess('Kuis berhasil dikirim.', [
            'skor'      => $skor,
            'total'     => $total,
            'benar'     => $benar,
            'koreksi'   => $koreksi,
        ]);
    }

    // GET /api/edukasi-kuis/index.php?action=hasil&edukasi_id=1  — Pasien only
    public function hasil(): void {
        $payload = requireRole('pasien');
        $edukasiId = (int)($_GET['edukasi_id'] ?? 0);
        if (!$edukasiId) jsonError('edukasi_id wajib diisi.');
        jsonSuccess('OK', $this->model->getHasilTerbaru($payload['id'], $edukasiId));
    }

    private function validate(array $body, bool $requireEdukasiTipe = true): void {
        if ($requireEdukasiTipe) {
            if (empty($body['edukasi_id'])) jsonError('edukasi_id wajib diisi.');
            if (!in_array($body['tipe'] ?? '', ['pre', 'post'], true)) jsonError('tipe harus pre atau post.');
        }
        if (empty($body['pertanyaan'])) jsonError('Pertanyaan wajib diisi.');
        foreach (['pilihan_a', 'pilihan_b', 'pilihan_c', 'pilihan_d'] as $f) {
            if (empty($body[$f])) jsonError('Semua pilihan (A-D) wajib diisi.');
        }
        if (!in_array($body['jawaban_benar'] ?? '', ['a', 'b', 'c', 'd'], true)) {
            jsonError('Jawaban benar harus salah satu dari a/b/c/d.');
        }
    }
}