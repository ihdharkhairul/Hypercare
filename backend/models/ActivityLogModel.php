<?php
require_once __DIR__ . '/../config/database.php';

class ActivityLogModel {
    private PDO $db;
    public function __construct() { $this->db = Database::connect(); }

    public function record(int $userId, string $role, string $aksi, ?string $deskripsi = null, ?string $entityType = null, ?int $entityId = null): void {
        $stmt = $this->db->prepare(
            'INSERT INTO activity_logs (user_id, role, aksi, deskripsi, entity_type, entity_id) VALUES (?,?,?,?,?,?)'
        );
        $stmt->execute([$userId, $role, $aksi, $deskripsi, $entityType, $entityId]);
    }

    public function getByUser(int $userId, string $role, int $limit = 15): array {
        $stmt = $this->db->prepare(
            'SELECT id, aksi, deskripsi, entity_type, created_at
             FROM activity_logs WHERE user_id=? AND role=? ORDER BY created_at DESC LIMIT ?'
        );
        $stmt->bindValue(1, $userId, PDO::PARAM_INT);
        $stmt->bindValue(2, $role);
        $stmt->bindValue(3, $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getRecentAll(int $limit = 20): array {
        $stmt = $this->db->prepare(
            'SELECT a.id, a.aksi, a.deskripsi, a.entity_type, a.created_at, a.role,
                    CASE WHEN a.role="pasien" THEN p.nama ELSE pr.nama END as nama,
                    CASE WHEN a.role="pasien" THEN p.foto ELSE pr.foto END as foto
             FROM activity_logs a
             LEFT JOIN pasien p   ON a.role="pasien"  AND p.id  = a.user_id
             LEFT JOIN perawat pr ON a.role="perawat" AND pr.id = a.user_id
             ORDER BY a.created_at DESC LIMIT ?'
        );
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
}
