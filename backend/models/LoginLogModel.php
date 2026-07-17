<?php
require_once __DIR__ . '/../config/database.php';

class LoginLogModel {
    private PDO $db;
    public function __construct() { $this->db = Database::connect(); }

    public function record(int $userId, string $role, string $status = 'sukses'): void {
        $ip     = $_SERVER['REMOTE_ADDR'] ?? null;
        $ua     = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $device = $this->parseDevice($ua);
        $stmt = $this->db->prepare(
            'INSERT INTO login_logs (user_id, role, ip_address, user_agent, device, status) VALUES (?,?,?,?,?,?)'
        );
        $stmt->execute([$userId, $role, $ip, mb_substr($ua, 0, 255), $device, $status]);
    }

    public function getByUser(int $userId, string $role, int $limit = 20): array {
        $stmt = $this->db->prepare(
            'SELECT id, ip_address, device, status, created_at
             FROM login_logs WHERE user_id=? AND role=? ORDER BY created_at DESC LIMIT ?'
        );
        $stmt->bindValue(1, $userId, PDO::PARAM_INT);
        $stmt->bindValue(2, $role);
        $stmt->bindValue(3, $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    private function parseDevice(string $ua): string {
        $ua = strtolower($ua);
        $browser = str_contains($ua,'edg') ? 'Edge'
            : (str_contains($ua,'chrome') ? 'Chrome'
            : (str_contains($ua,'firefox') ? 'Firefox'
            : (str_contains($ua,'safari') ? 'Safari' : 'Browser')));
        $os = str_contains($ua,'windows') ? 'Windows'
            : (str_contains($ua,'mac') ? 'macOS'
            : (str_contains($ua,'android') ? 'Android'
            : ((str_contains($ua,'iphone') || str_contains($ua,'ipad')) ? 'iOS'
            : (str_contains($ua,'linux') ? 'Linux' : 'Unknown'))));
        return "$browser di $os";
    }
}
