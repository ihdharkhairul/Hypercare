<?php
// ============================================================
//  models/KonsultasiModel.php
// ============================================================

require_once __DIR__ . '/../config/database.php';

class KonsultasiModel
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::connect();
    }

    public function getByPasien(int $pasienId): array
    {
        $stmt = $this->db->prepare(
            'SELECT k.*, pr.nama AS perawat_nama, pr.spesialis, pr.foto AS perawat_foto
             FROM konsultasi k
             JOIN perawat pr ON pr.id = k.perawat_id
             WHERE k.pasien_id = ?
             ORDER BY k.tanggal DESC'
        );
        $stmt->execute([$pasienId]);
        return $stmt->fetchAll();
    }

    public function getByPerawat(int $perawatId): array
    {
        $stmt = $this->db->prepare(
            'SELECT k.*, p.nama AS pasien_nama, p.foto AS pasien_foto,
                    TIMESTAMPDIFF(YEAR, p.tanggal_lahir, CURDATE()) AS umur
             FROM konsultasi k
             JOIN pasien p ON p.id = k.pasien_id
             WHERE k.perawat_id = ?
             ORDER BY k.tanggal DESC'
        );
        $stmt->execute([$perawatId]);
        return $stmt->fetchAll();
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM konsultasi WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO konsultasi (pasien_id, perawat_id, tanggal, keluhan)
             VALUES (?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['pasien_id'],
            $data['perawat_id'],
            $data['tanggal'],
            $data['keluhan'] ?? null,
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function updateStatus(int $id, string $status, ?string $catatan = null): bool
    {
        $stmt = $this->db->prepare(
            'UPDATE konsultasi SET status = ?, catatan = ? WHERE id = ?'
        );
        return $stmt->execute([$status, $catatan, $id]);
    }
}
