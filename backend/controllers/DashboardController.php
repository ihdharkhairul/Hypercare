<?php
// ============================================================
//  controllers/DashboardController.php
//  Endpoint agregat: menggabungkan beberapa query jadi SATU
//  response agar frontend tidak perlu banyak round-trip
//  (optimasi performa REST API).
// ============================================================

require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../models/TekananDarahModel.php';
require_once __DIR__ . '/../models/NotifikasiModel.php';
require_once __DIR__ . '/../models/ActivityLogModel.php';
require_once __DIR__ . '/../models/LoginLogModel.php';
require_once __DIR__ . '/../models/AiConversationModel.php';
require_once __DIR__ . '/../models/PasienModel.php';
require_once __DIR__ . '/../models/ChatModel.php';
require_once __DIR__ . '/../models/EdukasiModel.php';

class DashboardController
{
    // GET /api/dashboard/index.php?action=pasien
    // Satu request untuk seluruh kebutuhan Dashboard Pasien:
    // statistik tekanan darah, grafik, notifikasi, aktivitas terbaru.
    public function pasien(): void
    {
        $auth = requireRole('pasien');
        $pasienId = $auth['id'];

        $tekananModel = new TekananDarahModel();
        $notifModel   = new NotifikasiModel();
        $activityModel= new ActivityLogModel();
        $edukasiModel = new EdukasiModel();

        $rows  = $tekananModel->getByPasien($pasienId, 6);
        $stat  = $tekananModel->getStat($pasienId);
        $notif = $notifModel->getByUser($pasienId, 'pasien', 5);
        $unread= $notifModel->countUnread($pasienId, 'pasien');
        $activities = $activityModel->getByUser($pasienId, 'pasien', 8);
        $edukasiTerbaru = array_slice($edukasiModel->getAll(null, true), 0, 3);

        jsonSuccess('OK', [
            'tekanan_terbaru' => $rows,
            'statistik'       => $stat,
            'notifikasi'      => $notif,
            'notifikasi_unread' => $unread,
            'aktivitas'       => $activities,
            'edukasi_terbaru' => $edukasiTerbaru,
        ]);
    }

    public function perawat(): void
    {
        // Satu decode saja — simpan hasil requireRole untuk dipakai di bawah
        $auth = requireRole('perawat');

        $tekananModel  = new TekananDarahModel();
        $pasienModel   = new PasienModel();
        $chatModel     = new ChatModel();
        $activityModel = new ActivityLogModel();

        $statGlobal = $tekananModel->getStatistikGlobal();
        $statGlobal['total_pasien_terdaftar'] = count($pasienModel->getAll());
        $chatList   = array_slice($chatModel->listByPerawat($auth['id']), 0, 5);
        $activities = $activityModel->getRecentAll(10);

        jsonSuccess('OK', [
            'statistik'          => $statGlobal,
            'konsultasi_terbaru' => $chatList,
            'aktivitas'          => $activities,
        ]);
    }

    // GET /api/dashboard/index.php?action=aktivitas
    // Riwayat aktivitas lengkap (paginated) — dipakai halaman "Aktivitas Terbaru" detail
    public function aktivitas(): void
    {
        $auth = requireAuth();
        $limit = min((int)($_GET['limit'] ?? 30), 100);
        $model = new ActivityLogModel();
        $data = $auth['role'] === 'perawat'
            ? $model->getRecentAll($limit)
            : $model->getByUser($auth['id'], $auth['role'], $limit);
        jsonSuccess('OK', $data);
    }

    // GET /api/dashboard/index.php?action=login-history
    public function loginHistory(): void
    {
        $auth = requireAuth();
        $limit = min((int)($_GET['limit'] ?? 20), 50);
        $model = new LoginLogModel();
        jsonSuccess('OK', $model->getByUser($auth['id'], $auth['role'], $limit));
    }

    // GET /api/dashboard/index.php?action=chat-ai-history
    // Ringkasan riwayat chat AI (dipakai widget "Riwayat Chat AI" di luar halaman AI Chat utama)
    public function chatAiSummary(): void
    {
        $auth = requireRole('pasien');
        $model = new AiConversationModel();
        $total = $model->countMessages($auth['id']);
        $recent = $model->getRecentForContext($auth['id'], 6);
        jsonSuccess('OK', ['total_pesan' => $total, 'pesan_terakhir' => $recent]);
    }
}