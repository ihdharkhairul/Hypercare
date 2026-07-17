<?php
// ============================================================
//  models/ChatModel.php
// ============================================================

require_once __DIR__ . '/../config/database.php';

class ChatModel
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::connect();
    }

    // Ambil percakapan antara pasien & perawat
    public function getMessages(int $pasienId, int $perawatId, int $limit = 100): array
    {
        $stmt = $this->db->prepare(
            'SELECT id, pengirim, pesan, dibaca, created_at
             FROM chat_perawat
             WHERE pasien_id = ? AND perawat_id = ?
             ORDER BY created_at ASC
             LIMIT ?'
        );
        $stmt->bindValue(1, $pasienId, PDO::PARAM_INT);
        $stmt->bindValue(2, $perawatId, PDO::PARAM_INT);
        $stmt->bindValue(3, $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    // Kirim pesan
    public function send(int $pasienId, int $perawatId, string $pengirim, string $pesan): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO chat_perawat (pasien_id, perawat_id, pengirim, pesan)
             VALUES (?, ?, ?, ?)'
        );
        $stmt->execute([$pasienId, $perawatId, $pengirim, $pesan]);
        return (int) $this->db->lastInsertId();
    }

    // Tandai pesan sebagai sudah dibaca
    public function markRead(int $pasienId, int $perawatId, string $pembaca): bool
    {
        // Tandai semua pesan dari pihak lain
        $pengirim = $pembaca === 'pasien' ? 'perawat' : 'pasien';
        $stmt = $this->db->prepare(
            'UPDATE chat_perawat
             SET dibaca = 1
             WHERE pasien_id = ? AND perawat_id = ? AND pengirim = ? AND dibaca = 0'
        );
        $stmt->execute([$pasienId, $perawatId, $pengirim]);
        return true;
    }

    // Daftar percakapan milik pasien (semua perawat)
    public function listByPasien(int $pasienId): array
    {
        $stmt = $this->db->prepare(
            'SELECT pr.id AS perawat_id, pr.nama AS perawat_nama, pr.spesialis, pr.foto, pr.is_online,
                    (SELECT pesan FROM chat_perawat cp2
                     WHERE cp2.pasien_id = :pid AND cp2.perawat_id = pr.id
                     ORDER BY cp2.created_at DESC LIMIT 1) AS pesan_terakhir,
                    (SELECT COUNT(*) FROM chat_perawat cp3
                     WHERE cp3.pasien_id = :pid2 AND cp3.perawat_id = pr.id
                       AND cp3.pengirim = "perawat" AND cp3.dibaca = 0) AS belum_dibaca
             FROM perawat pr
             WHERE pr.id IN (
                 SELECT DISTINCT perawat_id FROM chat_perawat WHERE pasien_id = :pid3
             )
             ORDER BY pesan_terakhir DESC'
        );
        $stmt->execute([':pid' => $pasienId, ':pid2' => $pasienId, ':pid3' => $pasienId]);
        return $stmt->fetchAll();
    }

    // Daftar percakapan milik perawat (semua pasien)
    public function listByPerawat(int $perawatId): array
    {
        $stmt = $this->db->prepare(
            'SELECT p.id AS pasien_id, p.nama AS pasien_nama, p.foto,
                    (SELECT pesan FROM chat_perawat cp2
                     WHERE cp2.pasien_id = p.id AND cp2.perawat_id = :pid
                     ORDER BY cp2.created_at DESC LIMIT 1) AS pesan_terakhir,
                    (SELECT COUNT(*) FROM chat_perawat cp3
                     WHERE cp3.pasien_id = p.id AND cp3.perawat_id = :pid2
                       AND cp3.pengirim = "pasien" AND cp3.dibaca = 0) AS belum_dibaca
             FROM pasien p
             WHERE p.id IN (
                 SELECT DISTINCT pasien_id FROM chat_perawat WHERE perawat_id = :pid3
             )
             ORDER BY pesan_terakhir DESC'
        );
        $stmt->execute([':pid' => $perawatId, ':pid2' => $perawatId, ':pid3' => $perawatId]);
        return $stmt->fetchAll();
    }
}
