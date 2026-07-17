<?php
require_once __DIR__ . '/../config/database.php';

class AdminModel {
    private PDO $db;
    public function __construct() { $this->db = Database::connect(); }

    public function findByEmail(string $email): ?array {
        $stmt = $this->db->prepare('SELECT * FROM admin WHERE email=? LIMIT 1');
        $stmt->execute([$email]);
        return $stmt->fetch() ?: null;
    }
    public function findById(int $id): ?array {
        $stmt = $this->db->prepare('SELECT id,nama,email FROM admin WHERE id=? LIMIT 1');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }
}
