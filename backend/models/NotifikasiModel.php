<?php
require_once __DIR__ . '/../config/database.php';

class NotifikasiModel {
    private PDO $db;
    public function __construct() { $this->db = Database::connect(); }

    public function getByUser(int $userId, string $role, int $limit = 20): array {
        $stmt = $this->db->prepare(
            'SELECT * FROM notifikasi WHERE user_id=? AND role=? ORDER BY created_at DESC LIMIT ?'
        );
        $stmt->bindValue(1, $userId, PDO::PARAM_INT);
        $stmt->bindValue(2, $role);
        $stmt->bindValue(3, $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
    public function countUnread(int $userId, string $role): int {
        $stmt = $this->db->prepare('SELECT COUNT(*) FROM notifikasi WHERE user_id=? AND role=? AND dibaca=0');
        $stmt->execute([$userId, $role]);
        return (int)$stmt->fetchColumn();
    }
    public function markRead(int $id, int $userId): bool {
        $stmt = $this->db->prepare('UPDATE notifikasi SET dibaca=1 WHERE id=? AND user_id=?');
        return $stmt->execute([$id, $userId]);
    }
    public function markAllRead(int $userId, string $role): bool {
        $stmt = $this->db->prepare('UPDATE notifikasi SET dibaca=1 WHERE user_id=? AND role=?');
        return $stmt->execute([$userId, $role]);
    }
    public function create(int $userId, string $role, string $judul, string $pesan, string $tipe='info', ?string $link=null): int {
        $stmt = $this->db->prepare(
            'INSERT INTO notifikasi (user_id,role,judul,pesan,tipe,link) VALUES (?,?,?,?,?,?)'
        );
        $stmt->execute([$userId, $role, $judul, $pesan, $tipe, $link]);
        return (int)$this->db->lastInsertId();
    }
    public function delete(int $id, int $userId): bool {
        $stmt = $this->db->prepare('DELETE FROM notifikasi WHERE id=? AND user_id=?');
        $stmt->execute([$id, $userId]);
        return $stmt->rowCount() > 0;
    }
}