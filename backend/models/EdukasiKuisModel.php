<?php
require_once __DIR__ . '/../config/database.php';

class EdukasiKuisModel {
    private PDO $db;
    public function __construct() { $this->db = Database::connect(); }

    public function getByEdukasi(int $edukasiId, string $tipe): array {
        $stmt = $this->db->prepare(
            'SELECT * FROM edukasi_kuis WHERE edukasi_id=? AND tipe=? ORDER BY urutan ASC, id ASC'
        );
        $stmt->execute([$edukasiId, $tipe]);
        return $stmt->fetchAll();
    }

    public function findById(int $id): ?array {
        $stmt = $this->db->prepare('SELECT * FROM edukasi_kuis WHERE id=?');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function create(array $d): int {
        $stmt = $this->db->prepare(
            'INSERT INTO edukasi_kuis (edukasi_id,tipe,pertanyaan,pilihan_a,pilihan_b,pilihan_c,pilihan_d,jawaban_benar,urutan)
             VALUES (?,?,?,?,?,?,?,?,?)'
        );
        $stmt->execute([
            $d['edukasi_id'], $d['tipe'], $d['pertanyaan'],
            $d['pilihan_a'], $d['pilihan_b'], $d['pilihan_c'], $d['pilihan_d'],
            $d['jawaban_benar'], (int)($d['urutan'] ?? 0),
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function update(int $id, array $d): bool {
        $stmt = $this->db->prepare(
            'UPDATE edukasi_kuis SET pertanyaan=?,pilihan_a=?,pilihan_b=?,pilihan_c=?,pilihan_d=?,jawaban_benar=?,urutan=? WHERE id=?'
        );
        return $stmt->execute([
            $d['pertanyaan'], $d['pilihan_a'], $d['pilihan_b'], $d['pilihan_c'], $d['pilihan_d'],
            $d['jawaban_benar'], (int)($d['urutan'] ?? 0), $id,
        ]);
    }

    public function delete(int $id): bool {
        $stmt = $this->db->prepare('DELETE FROM edukasi_kuis WHERE id=?');
        return $stmt->execute([$id]);
    }

    public function countByEdukasi(int $edukasiId): array {
        $stmt = $this->db->prepare(
            "SELECT tipe, COUNT(*) as jumlah FROM edukasi_kuis WHERE edukasi_id=? GROUP BY tipe"
        );
        $stmt->execute([$edukasiId]);
        $rows = $stmt->fetchAll();
        $out = ['pre' => 0, 'post' => 0];
        foreach ($rows as $r) { $out[$r['tipe']] = (int)$r['jumlah']; }
        return $out;
    }

    // ── Hasil kuis pasien ──
    public function saveHasil(int $pasienId, int $edukasiId, string $tipe, int $skor, int $total, int $benar): int {
        $stmt = $this->db->prepare(
            'INSERT INTO edukasi_kuis_hasil (pasien_id,edukasi_id,tipe,skor,total_soal,benar) VALUES (?,?,?,?,?,?)'
        );
        $stmt->execute([$pasienId, $edukasiId, $tipe, $skor, $total, $benar]);
        return (int)$this->db->lastInsertId();
    }

    public function getHasilTerbaru(int $pasienId, int $edukasiId): array {
        $stmt = $this->db->prepare(
            'SELECT tipe, skor, total_soal, benar, created_at FROM edukasi_kuis_hasil
             WHERE pasien_id=? AND edukasi_id=?
             ORDER BY created_at DESC'
        );
        $stmt->execute([$pasienId, $edukasiId]);
        $rows = $stmt->fetchAll();
        $out = ['pre' => null, 'post' => null];
        foreach ($rows as $r) {
            if ($out[$r['tipe']] === null) $out[$r['tipe']] = $r; // ambil yang terbaru saja
        }
        return $out;
    }
}