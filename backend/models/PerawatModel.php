<?php
// ============================================================
//  models/PerawatModel.php
// ============================================================

require_once __DIR__ . '/../config/database.php';

class PerawatModel
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::connect();
    }

    public function findByEmail(string $email): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM perawat WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare(
            'SELECT id, nama, email, spesialis, pengalaman,
                    jenis_kelamin, tanggal_lahir, alamat, foto, is_online, created_at
             FROM perawat WHERE id = ? LIMIT 1'
        );
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function getAll(): array
    {
        $stmt = $this->db->query(
            'SELECT id, nama, email, spesialis, pengalaman, jenis_kelamin, foto, is_online
             FROM perawat ORDER BY is_online DESC, nama'
        );
        return $stmt->fetchAll();
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO perawat
                (nama, email, password, spesialis, jenis_kelamin, tanggal_lahir, alamat)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['nama'],
            $data['email'],
            password_hash($data['password'], PASSWORD_BCRYPT),
            $data['spesialis']      ?? 'Spesialis Hipertensi',
            $data['jenis_kelamin']  ?? null,
            $data['tanggal_lahir']  ?? null,
            $data['alamat']         ?? null,
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $fields = [];
        $values = [];

        $allowed = ['nama','spesialis','pengalaman','jenis_kelamin','tanggal_lahir','alamat','foto','is_online'];
        foreach ($allowed as $f) {
            if (array_key_exists($f, $data)) {
                $fields[] = "$f = ?";
                $values[] = $data[$f];
            }
        }

        if (empty($fields)) return false;

        $values[] = $id;
        $stmt = $this->db->prepare(
            'UPDATE perawat SET ' . implode(', ', $fields) . ' WHERE id = ?'
        );
        return $stmt->execute($values);
    }

    public function emailExists(string $email): bool
    {
        $stmt = $this->db->prepare('SELECT id FROM perawat WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        return (bool) $stmt->fetch();
    }
}
