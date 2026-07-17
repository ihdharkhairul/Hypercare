<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/helpers.php';

class TekananDarahModel {
    private PDO $db;
    public function __construct() { $this->db = Database::connect(); }

    public function getByPasien(int $pasienId, int $limit = 100): array {
        $stmt = $this->db->prepare(
            'SELECT * FROM tekanan_darah WHERE pasien_id=? ORDER BY tanggal DESC,id DESC LIMIT ?'
        );
        $stmt->bindValue(1, $pasienId, PDO::PARAM_INT);
        $stmt->bindValue(2, $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getAll(int $limit = 200): array {
        $stmt = $this->db->prepare(
            'SELECT t.*, p.nama as pasien_nama, p.foto as pasien_foto,
             TIMESTAMPDIFF(YEAR,p.tanggal_lahir,CURDATE()) as umur
             FROM tekanan_darah t JOIN pasien p ON p.id=t.pasien_id
             ORDER BY t.tanggal DESC, t.id DESC LIMIT ?'
        );
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function findById(int $id): ?array {
        $stmt = $this->db->prepare('SELECT * FROM tekanan_darah WHERE id=? LIMIT 1');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function create(array $d): int {
        $status = hitungStatus((int)$d['sistolik'], (int)$d['diastolik']);
        $stmt = $this->db->prepare(
            'INSERT INTO tekanan_darah (pasien_id,perawat_id,tanggal,sistolik,diastolik,denyut_nadi,berat_badan,catatan,status)
             VALUES (?,?,?,?,?,?,?,?,?)'
        );
        $stmt->execute([
            (int)$d['pasien_id'],
            isset($d['perawat_id']) ? (int)$d['perawat_id'] : null,
            $d['tanggal'],
            (int)$d['sistolik'],
            (int)$d['diastolik'],
            isset($d['denyut_nadi']) && $d['denyut_nadi'] !== '' ? (int)$d['denyut_nadi'] : null,
            isset($d['berat_badan']) && $d['berat_badan'] !== '' ? (float)$d['berat_badan'] : null,
            $d['catatan'] ?? null,
            $status,
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function update(int $id, array $d): bool {
        $status = hitungStatus((int)$d['sistolik'], (int)$d['diastolik']);
        $stmt = $this->db->prepare(
            'UPDATE tekanan_darah SET tanggal=?,sistolik=?,diastolik=?,denyut_nadi=?,berat_badan=?,catatan=?,status=? WHERE id=?'
        );
        return $stmt->execute([
            $d['tanggal'],
            (int)$d['sistolik'],
            (int)$d['diastolik'],
            isset($d['denyut_nadi']) && $d['denyut_nadi'] !== '' ? (int)$d['denyut_nadi'] : null,
            isset($d['berat_badan']) && $d['berat_badan'] !== '' ? (float)$d['berat_badan'] : null,
            $d['catatan'] ?? null,
            $status,
            $id,
        ]);
    }

    public function delete(int $id, ?int $pasienId = null): bool {
        if ($pasienId !== null) {
            $stmt = $this->db->prepare('DELETE FROM tekanan_darah WHERE id=? AND pasien_id=?');
            $stmt->execute([$id, $pasienId]);
        } else {
            $stmt = $this->db->prepare('DELETE FROM tekanan_darah WHERE id=?');
            $stmt->execute([$id]);
        }
        return $stmt->rowCount() > 0;
    }

    public function getStat(int $pasienId): array {
        $stmt = $this->db->prepare(
            'SELECT COUNT(*) as total,
             ROUND(AVG(sistolik),1) as avg_sistol,
             ROUND(AVG(diastolik),1) as avg_diastol,
             MAX(sistolik) as max_sistol,
             MIN(sistolik) as min_sistol,
             (SELECT status FROM tekanan_darah WHERE pasien_id=:pid
              ORDER BY tanggal DESC,id DESC LIMIT 1) as status_terakhir,
             (SELECT CONCAT(sistolik,"/",diastolik) FROM tekanan_darah WHERE pasien_id=:pid2
              ORDER BY tanggal DESC,id DESC LIMIT 1) as td_terakhir
             FROM tekanan_darah WHERE pasien_id=:pid3'
        );
        $stmt->execute([':pid' => $pasienId, ':pid2' => $pasienId, ':pid3' => $pasienId]);
        return $stmt->fetch() ?: [];
    }

    public function getStatistikGlobal(): array {
        $stmt = $this->db->query(
            'SELECT COUNT(*) as total_pemeriksaan,
             COUNT(DISTINCT pasien_id) as total_pasien,
             SUM(status="Normal") as normal,
             SUM(status="Pra Hipertensi") as pra_hipertensi,
             SUM(status="Hipertensi Tingkat 1") as hipertensi_1,
             SUM(status="Hipertensi Tingkat 2") as hipertensi_2
             FROM tekanan_darah'
        );
        return $stmt->fetch() ?: [];
    }
}
