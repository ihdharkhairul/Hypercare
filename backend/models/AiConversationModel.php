<?php
require_once __DIR__ . '/../config/database.php';

class AiConversationModel {
    private PDO $db;
    public function __construct() { $this->db = Database::connect(); }

    public function getHistory(int $pasienId, int $limit = 100): array {
        $stmt = $this->db->prepare(
            'SELECT id, role, message, recommended_edukasi_ids, created_at
             FROM ai_conversations WHERE pasien_id = ? ORDER BY id ASC LIMIT ?'
        );
        $stmt->bindValue(1, $pasienId, PDO::PARAM_INT);
        $stmt->bindValue(2, $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getRecentForContext(int $pasienId, int $limit): array {
        $stmt = $this->db->prepare(
            'SELECT role, message FROM ai_conversations
             WHERE pasien_id = ? ORDER BY id DESC LIMIT ?'
        );
        $stmt->bindValue(1, $pasienId, PDO::PARAM_INT);
        $stmt->bindValue(2, $limit, PDO::PARAM_INT);
        $stmt->execute();
        return array_reverse($stmt->fetchAll());
    }

    public function saveMessage(int $pasienId, string $role, string $message, ?array $edukasiIds = null): int {
        $idsStr = $edukasiIds ? implode(',', array_map('intval', $edukasiIds)) : null;
        $stmt = $this->db->prepare(
            'INSERT INTO ai_conversations (pasien_id, role, message, recommended_edukasi_ids) VALUES (?,?,?,?)'
        );
        $stmt->execute([$pasienId, $role, $message, $idsStr]);
        return (int)$this->db->lastInsertId();
    }

    public function clearHistory(int $pasienId): bool {
        $stmt = $this->db->prepare('DELETE FROM ai_conversations WHERE pasien_id = ?');
        return $stmt->execute([$pasienId]);
    }

    public function countMessages(int $pasienId): int {
        $stmt = $this->db->prepare('SELECT COUNT(*) FROM ai_conversations WHERE pasien_id = ?');
        $stmt->execute([$pasienId]);
        return (int)$stmt->fetchColumn();
    }
}
