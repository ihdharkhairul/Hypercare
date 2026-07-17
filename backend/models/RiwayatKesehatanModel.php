<?php
require_once __DIR__ . '/../config/database.php';

class RiwayatKesehatanModel {
    private PDO $db;
    public function __construct() { $this->db = Database::connect(); }

    public function getByPasien(int $pasienId): array {
        $stmt = $this->db->prepare('SELECT * FROM riwayat_kesehatan WHERE pasien_id=? ORDER BY tanggal DESC');
        $stmt->execute([$pasienId]);
        return $stmt->fetchAll();
    }
    public function findById(int $id): ?array {
        $stmt = $this->db->prepare('SELECT * FROM riwayat_kesehatan WHERE id=? LIMIT 1');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }
    public function create(array $d): int {
        $stmt = $this->db->prepare('INSERT INTO riwayat_kesehatan (pasien_id,judul,deskripsi,tanggal,jenis) VALUES (?,?,?,?,?)');
        $stmt->execute([$d['pasien_id'],$d['judul'],$d['deskripsi']??null,$d['tanggal'],$d['jenis']??'lainnya']);
        return (int)$this->db->lastInsertId();
    }
    public function update(int $id, array $d): bool {
        $stmt = $this->db->prepare('UPDATE riwayat_kesehatan SET judul=?,deskripsi=?,tanggal=?,jenis=? WHERE id=?');
        return $stmt->execute([$d['judul'],$d['deskripsi']??null,$d['tanggal'],$d['jenis']??'lainnya',$id]);
    }
    public function delete(int $id, int $pasienId): bool {
        $stmt = $this->db->prepare('DELETE FROM riwayat_kesehatan WHERE id=? AND pasien_id=?');
        $stmt->execute([$id,$pasienId]);
        return $stmt->rowCount()>0;
    }
}
