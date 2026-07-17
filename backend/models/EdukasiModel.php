<?php
require_once __DIR__ . '/../config/database.php';

class EdukasiModel {
    private PDO $db;
    public function __construct() { $this->db = Database::connect(); }

    public function getAll(?string $kategori = null, bool $publishedOnly = true): array {
        $where = $publishedOnly ? 'WHERE is_published = 1' : 'WHERE 1=1';
        $params = [];
        if ($kategori) { $where .= ' AND kategori = ?'; $params[] = $kategori; }
        $stmt = $this->db->prepare("SELECT * FROM edukasi $where ORDER BY created_at DESC");
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function findById(int $id): ?array {
        $stmt = $this->db->prepare('SELECT * FROM edukasi WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function getKategori(): array {
        $stmt = $this->db->query('SELECT DISTINCT kategori FROM edukasi WHERE is_published=1 AND kategori IS NOT NULL ORDER BY kategori');
        return array_column($stmt->fetchAll(), 'kategori');
    }

    public function create(array $d): int {
        $stmt = $this->db->prepare(
            'INSERT INTO edukasi (judul,ringkasan,isi,thumbnail,kategori,penulis,sumber,waktu_baca,url_artikel,url_video,url_reel,url_tiktok,is_published)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)'
        );
        $stmt->execute([
            $d['judul'], $d['ringkasan']??null, $d['isi']??null,
            $d['thumbnail']??null, $d['kategori']??null,
            $d['penulis'], $d['sumber']??null,
            (int)($d['waktu_baca']??3),
            $d['url_artikel']??null, $d['url_video']??null, $d['url_reel']??null, $d['url_tiktok']??null,
            isset($d['is_published']) ? (int)$d['is_published'] : 1,
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function update(int $id, array $d): bool {
        $stmt = $this->db->prepare(
            'UPDATE edukasi SET judul=?,ringkasan=?,isi=?,thumbnail=?,kategori=?,penulis=?,sumber=?,
             waktu_baca=?,url_artikel=?,url_video=?,url_reel=?,url_tiktok=?,is_published=? WHERE id=?'
        );
        return $stmt->execute([
            $d['judul'], $d['ringkasan']??null, $d['isi']??null,
            $d['thumbnail']??null, $d['kategori']??null,
            $d['penulis'], $d['sumber']??null,
            (int)($d['waktu_baca']??3),
            $d['url_artikel']??null, $d['url_video']??null, $d['url_reel']??null, $d['url_tiktok']??null,
            isset($d['is_published']) ? (int)$d['is_published'] : 1,
            $id,
        ]);
    }

    public function delete(int $id): bool {
        $stmt = $this->db->prepare('DELETE FROM edukasi WHERE id=?');
        $stmt->execute([$id]);
        return $stmt->rowCount() > 0;
    }

    public function togglePublish(int $id): bool {
        $stmt = $this->db->prepare('UPDATE edukasi SET is_published = NOT is_published WHERE id=?');
        return $stmt->execute([$id]);
    }
}