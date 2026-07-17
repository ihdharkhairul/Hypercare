<?php
require_once __DIR__ . '/../config/database.php';

class PasienModel {
    private PDO $db;
    public function __construct() { $this->db = Database::connect(); }

    public function findByEmail(string $email): ?array {
        $stmt = $this->db->prepare('SELECT * FROM pasien WHERE email=? LIMIT 1');
        $stmt->execute([$email]);
        return $stmt->fetch() ?: null;
    }
    public function findById(int $id): ?array {
        $stmt = $this->db->prepare('SELECT id,nama,email,no_hp,jenis_kelamin,tanggal_lahir,agama,alamat,foto,created_at FROM pasien WHERE id=? LIMIT 1');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }
    public function getAll(?string $search=null): array {
        if ($search) {
            $stmt = $this->db->prepare(
                'SELECT p.id,p.nama,p.email,p.no_hp,p.jenis_kelamin,p.foto,p.tanggal_lahir,
                 TIMESTAMPDIFF(YEAR,p.tanggal_lahir,CURDATE()) as umur,
                 (SELECT t.status FROM tekanan_darah t WHERE t.pasien_id=p.id ORDER BY t.tanggal DESC,t.id DESC LIMIT 1) as status_terakhir,
                 (SELECT CONCAT(t2.sistolik,"/",t2.diastolik) FROM tekanan_darah t2 WHERE t2.pasien_id=p.id ORDER BY t2.tanggal DESC,t2.id DESC LIMIT 1) as td_terakhir
                 FROM pasien p WHERE p.nama LIKE ? OR p.email LIKE ? ORDER BY p.nama'
            );
            $q = "%$search%";
            $stmt->execute([$q,$q]);
        } else {
            $stmt = $this->db->query(
                'SELECT p.id,p.nama,p.email,p.no_hp,p.jenis_kelamin,p.foto,p.tanggal_lahir,
                 TIMESTAMPDIFF(YEAR,p.tanggal_lahir,CURDATE()) as umur,
                 (SELECT t.status FROM tekanan_darah t WHERE t.pasien_id=p.id ORDER BY t.tanggal DESC,t.id DESC LIMIT 1) as status_terakhir,
                 (SELECT CONCAT(t2.sistolik,"/",t2.diastolik) FROM tekanan_darah t2 WHERE t2.pasien_id=p.id ORDER BY t2.tanggal DESC,t2.id DESC LIMIT 1) as td_terakhir
                 FROM pasien p ORDER BY p.nama'
            );
        }
        return $stmt->fetchAll();
    }
    public function create(array $d): int {
        $stmt = $this->db->prepare('INSERT INTO pasien (nama,email,password,no_hp,jenis_kelamin,tanggal_lahir,agama,alamat) VALUES (?,?,?,?,?,?,?,?)');
        $stmt->execute([$d['nama'],$d['email'],password_hash($d['password'],PASSWORD_BCRYPT),$d['no_hp']??null,$d['jenis_kelamin']??null,$d['tanggal_lahir']??null,$d['agama']??null,$d['alamat']??null]);
        return (int)$this->db->lastInsertId();
    }
    public function update(int $id, array $d): bool {
        $fields=[]; $values=[];
        $allowed=['nama','no_hp','jenis_kelamin','tanggal_lahir','agama','alamat','foto'];
        foreach($allowed as $f) { if(array_key_exists($f,$d)){$fields[]="$f=?";$values[]=$d[$f];} }
        if(!$fields) return false;
        $values[]=$id;
        return $this->db->prepare('UPDATE pasien SET '.implode(',',$fields).' WHERE id=?')->execute($values);
    }
    public function updatePassword(int $id, string $password): bool {
        $stmt = $this->db->prepare('UPDATE pasien SET password=? WHERE id=?');
        return $stmt->execute([password_hash($password,PASSWORD_BCRYPT),$id]);
    }
    public function delete(int $id): bool {
        $stmt = $this->db->prepare('DELETE FROM pasien WHERE id=?');
        $stmt->execute([$id]);
        return $stmt->rowCount()>0;
    }
    public function emailExists(string $email, ?int $excludeId=null): bool {
        if($excludeId){
            $stmt=$this->db->prepare('SELECT id FROM pasien WHERE email=? AND id!=? LIMIT 1');
            $stmt->execute([$email,$excludeId]);
        } else {
            $stmt=$this->db->prepare('SELECT id FROM pasien WHERE email=? LIMIT 1');
            $stmt->execute([$email]);
        }
        return (bool)$stmt->fetch();
    }
}
