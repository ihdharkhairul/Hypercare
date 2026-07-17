<?php
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../models/TekananDarahModel.php';
require_once __DIR__ . '/../models/NotifikasiModel.php';

class TekananDarahController {
    private TekananDarahModel $model;
    private NotifikasiModel $notif;
    public function __construct() {
        $this->model = new TekananDarahModel();
        $this->notif = new NotifikasiModel();
    }

    public function index(): void {
        $auth = requireAuth();
        $pasienId = $auth['role']==='pasien' ? $auth['id'] : (int)($_GET['pasien_id']??0);
        if(!$pasienId) jsonError('pasien_id wajib.');
        jsonSuccess('OK', $this->model->getByPasien($pasienId));
    }

    public function stat(): void {
        $auth = requireAuth();
        $pasienId = $auth['role']==='pasien' ? $auth['id'] : (int)($_GET['pasien_id']??0);
        if(!$pasienId) jsonError('pasien_id wajib.');
        jsonSuccess('OK', $this->model->getStat($pasienId));
    }

    public function store(): void {
        $auth = requireAuth();
        $body = getBody();
        $pasienId = $auth['role']==='pasien' ? $auth['id'] : (int)($body['pasien_id']??0);
        if(!$pasienId) jsonError('pasien_id wajib.');

        $required=['tanggal','sistolik','diastolik'];
        foreach($required as $f) { if(empty($body[$f])) jsonError("$f wajib diisi."); }
        $this->validateMeasurement($body);
        $body = cleanArray($body, ['catatan']);

        $body['pasien_id']=$pasienId;
        if($auth['role']==='perawat') $body['perawat_id']=$auth['id'];
        $id = $this->model->create($body);
        $record = $this->model->findById($id);

        // Notifikasi jika tidak normal
        if($record['status']!=='Normal') {
            $this->notif->create($pasienId,'pasien','Peringatan Tekanan Darah',
                "Pemeriksaan {$body['tanggal']}: {$body['sistolik']}/{$body['diastolik']} mmHg - {$record['status']}.",
                $record['status']==='Hipertensi Tingkat 2'?'bahaya':'peringatan');
        }
        logActivity($pasienId, $auth['role'], 'catat_tekanan',
            "Mencatat tekanan darah {$body['sistolik']}/{$body['diastolik']} mmHg ({$record['status']})",
            'tekanan_darah', $id);
        jsonSuccess('Data berhasil disimpan.', $record, 201);
    }

    public function update(int $id): void {
        $auth = requireAuth();
        $body = getBody();
        $record = $this->model->findById($id);
        if(!$record) jsonError('Data tidak ditemukan.',404);
        if($auth['role']==='pasien' && (int)$record['pasien_id'] !== (int)$auth['id']) jsonError('Akses ditolak.',403);

        $required=['tanggal','sistolik','diastolik'];
        foreach($required as $f) { if(empty($body[$f])) jsonError("$f wajib diisi."); }
        $this->validateMeasurement($body);
        $body = cleanArray($body, ['catatan']);

        $this->model->update($id,$body);
        jsonSuccess('Data diperbarui.', $this->model->findById($id));
    }

    // Validasi rentang nilai medis yang masuk akal — mencegah data sampah/serangan input ekstrem
    private function validateMeasurement(array $body): void {
        $sis = (int) $body['sistolik'];
        $dia = (int) $body['diastolik'];
        if ($sis < 50 || $sis > 260) jsonError('Nilai sistolik tidak valid (rentang wajar 50-260 mmHg).');
        if ($dia < 30 || $dia > 200) jsonError('Nilai diastolik tidak valid (rentang wajar 30-200 mmHg).');
        if (isset($body['denyut_nadi']) && $body['denyut_nadi'] !== '') {
            $nadi = (int) $body['denyut_nadi'];
            if ($nadi < 20 || $nadi > 250) jsonError('Nilai denyut nadi tidak valid (rentang wajar 20-250 bpm).');
        }
        if (isset($body['berat_badan']) && $body['berat_badan'] !== '') {
            $bb = (float) $body['berat_badan'];
            if ($bb < 1 || $bb > 400) jsonError('Nilai berat badan tidak valid.');
        }
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $body['tanggal'])) jsonError('Format tanggal tidak valid.');
    }

    public function delete(int $id): void {
        $auth = requireAuth();
        $pasienId = $auth['role']==='pasien' ? $auth['id'] : null;
        $ok = $this->model->delete($id,$pasienId);
        if(!$ok) jsonError('Data tidak ditemukan.',404);
        jsonSuccess('Data dihapus.');
    }

    public function allData(): void {
        requireRole('perawat');
        jsonSuccess('OK', $this->model->getAll());
    }
}
