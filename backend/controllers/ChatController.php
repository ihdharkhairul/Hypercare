<?php
// ============================================================
//  controllers/ChatController.php
// ============================================================

require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../models/ChatModel.php';
require_once __DIR__ . '/../models/NotifikasiModel.php';
require_once __DIR__ . '/../models/PasienModel.php';
require_once __DIR__ . '/../models/PerawatModel.php';

class ChatController
{
    private ChatModel $model;
    private NotifikasiModel $notifModel;

    public function __construct()
    {
        $this->model = new ChatModel();
        $this->notifModel = new NotifikasiModel();
    }

    // GET /api/chat/list  — daftar percakapan
    public function list(): void
    {
        $auth = requireAuth();

        if ($auth['role'] === 'pasien') {
            $data = $this->model->listByPasien($auth['id']);
        } else {
            $data = $this->model->listByPerawat($auth['id']);
        }

        jsonSuccess('Daftar percakapan.', $data);
    }

    // GET /api/chat/messages?pasien_id=1&perawat_id=1
    public function messages(): void
    {
        $auth      = requireAuth();
        $pasienId  = (int)($_GET['pasien_id']  ?? 0);
        $perawatId = (int)($_GET['perawat_id'] ?? 0);

        if (!$pasienId || !$perawatId) {
            jsonError('pasien_id dan perawat_id wajib diisi.');
        }

        // Otorisasi: pasien hanya bisa lihat chatnya sendiri
        if ($auth['role'] === 'pasien' && (int)$auth['id'] !== $pasienId) {
            jsonError('Akses ditolak.', 403);
        }
        if ($auth['role'] === 'perawat' && (int)$auth['id'] !== $perawatId) {
            jsonError('Akses ditolak.', 403);
        }

        $messages = $this->model->getMessages($pasienId, $perawatId);
        jsonSuccess('Pesan.', $messages);
    }

    // POST /api/chat/send
    public function send(): void
    {
        $auth = requireAuth();
        $body = getBody();

        $pasienId  = (int)($body['pasien_id']  ?? 0);
        $perawatId = (int)($body['perawat_id'] ?? 0);
        $pesan     = trim($body['pesan']        ?? '');

        if (!$pasienId || !$perawatId || !$pesan) {
            jsonError('pasien_id, perawat_id, dan pesan wajib diisi.');
        }
        if (mb_strlen($pesan) > 1000) {
            jsonError('Pesan terlalu panjang (maks 1000 karakter).');
        }

        // Otorisasi: pengirim hanya boleh mengirim sebagai dirinya sendiri
        if ($auth['role'] === 'pasien' && (int)$auth['id'] !== $pasienId) {
            jsonError('Akses ditolak.', 403);
        }
        if ($auth['role'] === 'perawat' && (int)$auth['id'] !== $perawatId) {
            jsonError('Akses ditolak.', 403);
        }

        $pesan = clean($pesan);
        $pengirim = $auth['role']; // 'pasien' atau 'perawat'

        $id = $this->model->send($pasienId, $perawatId, $pengirim, $pesan);

        // ── Bikin notifikasi buat lawan chat, biar langsung muncul
        //    di ikon lonceng dan bisa diklik langsung ke percakapannya ──
        $preview = mb_strlen($pesan) > 60 ? mb_substr($pesan, 0, 60) . '...' : $pesan;
        if ($pengirim === 'pasien') {
            $pasienModel = new PasienModel();
            $pengirimData = $pasienModel->findById($pasienId);
            $namaPengirim = $pengirimData['nama'] ?? 'Pasien';
            $this->notifModel->create(
                $perawatId, 'perawat',
                'Pesan baru dari ' . $namaPengirim,
                $preview,
                'chat',
                '/chat-perawat?pasien_id=' . $pasienId
            );
        } else {
            $perawatModel = new PerawatModel();
            $pengirimData = $perawatModel->findById($perawatId);
            $namaPengirim = $pengirimData['nama'] ?? 'Perawat';
            $this->notifModel->create(
                $pasienId, 'pasien',
                'Balasan dari ' . $namaPengirim,
                $preview,
                'chat',
                '/konsultasi-perawat?perawat_id=' . $perawatId
            );
        }

        jsonSuccess('Pesan terkirim.', [
            'id'         => $id,
            'pengirim'   => $pengirim,
            'pesan'      => $pesan,
            'created_at' => date('Y-m-d H:i:s'),
        ], 201);
    }

    // PUT /api/chat/read
    public function markRead(): void
    {
        $auth = requireAuth();
        $body = getBody();

        $pasienId  = (int)($body['pasien_id']  ?? 0);
        $perawatId = (int)($body['perawat_id'] ?? 0);

        if (!$pasienId || !$perawatId) {
            jsonError('pasien_id dan perawat_id wajib diisi.');
        }

        $this->model->markRead($pasienId, $perawatId, $auth['role']);
        jsonSuccess('Pesan ditandai sudah dibaca.');
    }
}