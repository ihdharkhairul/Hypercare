<?php
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../models/NotifikasiModel.php';

class NotifikasiController {
    private NotifikasiModel $model;
    public function __construct() { $this->model = new NotifikasiModel(); }

    public function index(): void {
        $auth = requireAuth();
        $list = $this->model->getByUser($auth['id'],$auth['role']);
        $unread = $this->model->countUnread($auth['id'],$auth['role']);
        jsonSuccess('OK',['list'=>$list,'unread'=>$unread]);
    }

    public function markRead(int $id): void {
        $auth = requireAuth();
        $this->model->markRead($id,$auth['id']);
        jsonSuccess('Ditandai dibaca.');
    }

    public function markAllRead(): void {
        $auth = requireAuth();
        $this->model->markAllRead($auth['id'],$auth['role']);
        jsonSuccess('Semua ditandai dibaca.');
    }

    public function delete(int $id): void {
        $auth = requireAuth();
        $ok = $this->model->delete($id,$auth['id']);
        if(!$ok) jsonError('Tidak ditemukan.',404);
        jsonSuccess('Dihapus.');
    }
}
