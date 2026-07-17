<?php
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../models/RiwayatKesehatanModel.php';

class RiwayatKesehatanController {
    private RiwayatKesehatanModel $model;
    public function __construct() { $this->model = new RiwayatKesehatanModel(); }

    public function index(): void {
        $auth = requireAuth();
        $pasienId = $auth['role']==='pasien' ? $auth['id'] : (int)($_GET['pasien_id']??0);
        if(!$pasienId) jsonError('pasien_id wajib.');
        jsonSuccess('OK', $this->model->getByPasien($pasienId));
    }

    public function store(): void {
        $auth = requireAuth();
        $body = getBody();
        $pasienId = $auth['role']==='pasien' ? $auth['id'] : (int)($body['pasien_id']??0);
        if(!$pasienId) jsonError('pasien_id wajib.');
        if(empty($body['judul'])) jsonError('Judul wajib diisi.');
        if(empty($body['tanggal'])) jsonError('Tanggal wajib diisi.');
        if(!preg_match('/^\d{4}-\d{2}-\d{2}$/', $body['tanggal'])) jsonError('Format tanggal tidak valid.');
        $body = cleanArray($body, ['judul', 'deskripsi']);
        $body['pasien_id']=$pasienId;
        $id = $this->model->create($body);
        jsonSuccess('Berhasil disimpan.', $this->model->findById($id), 201);
    }

    public function update(int $id): void {
        $auth = requireAuth();
        $body = getBody();
        $record = $this->model->findById($id);
        if(!$record) jsonError('Data tidak ditemukan.',404);
        if($auth['role']==='pasien' && (int)$record['pasien_id'] !== (int)$auth['id']) jsonError('Akses ditolak.',403);
        if(empty($body['judul'])) jsonError('Judul wajib diisi.');
        if(empty($body['tanggal'])) jsonError('Tanggal wajib diisi.');
        if(!preg_match('/^\d{4}-\d{2}-\d{2}$/', $body['tanggal'])) jsonError('Format tanggal tidak valid.');
        $body = cleanArray($body, ['judul', 'deskripsi']);
        $this->model->update($id,$body);
        jsonSuccess('Diperbarui.', $this->model->findById($id));
    }

    public function delete(int $id): void {
        $auth = requireAuth();
        $pasienId = $auth['role']==='pasien' ? $auth['id'] : null;
        $ok = $pasienId ? $this->model->delete($id,$pasienId) : (function() use($id){ 
            // perawat bisa hapus juga
            require_once __DIR__.'/../config/database.php';
            $db=Database::connect(); $s=$db->prepare('DELETE FROM riwayat_kesehatan WHERE id=?');
            $s->execute([$id]); return $s->rowCount()>0; })();
        if(!$ok) jsonError('Data tidak ditemukan.',404);
        jsonSuccess('Dihapus.');
    }
}
