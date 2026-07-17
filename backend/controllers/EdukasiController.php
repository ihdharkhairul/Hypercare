<?php
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../models/EdukasiModel.php';

class EdukasiController {
    private EdukasiModel $model;
    public function __construct() { $this->model = new EdukasiModel(); }

    // GET /api/edukasi/index.php  — public, bisa filter ?kategori=
    public function index(): void {
        $kategori = $_GET['kategori'] ?? null;
        $admin    = $_GET['admin']    ?? null;
        // Mode admin: tampilkan semua termasuk unpublished
        $pubOnly  = !$admin;
        $data = $this->model->getAll($kategori, $pubOnly);
        $kategoriList = $this->model->getKategori();
        jsonSuccess('OK', ['list' => $data, 'kategori' => $kategoriList]);
    }

    // GET /api/edukasi/index.php?id=1
    public function show(int $id): void {
        $e = $this->model->findById($id);
        if (!$e) jsonError('Konten tidak ditemukan.', 404);
        jsonSuccess('OK', $e);
    }

    // POST /api/edukasi/index.php  — admin only
    public function store(): void {
        $this->requireAdmin();
        $body = getBody();
        if (empty($body['judul']))   jsonError('Judul wajib diisi.');
        if (empty($body['penulis'])) jsonError('Penulis wajib diisi.');

        // Sanitasi field teks bebas sebelum disimpan (defense-in-depth XSS)
        $body = cleanArray($body, ['judul', 'ringkasan', 'isi', 'penulis']);

        // Validasi URL sumber terpercaya
        if (!empty($body['url_artikel'])) {
            $this->validateTrustedSource($body['url_artikel'], 'artikel');
        }
        if (!empty($body['url_video'])) {
            $this->validateVideoSource($body['url_video']);
        }
        if (!empty($body['url_reel'])) {
            $this->validateReelSource($body['url_reel']);
        }
        if (!empty($body['url_tiktok'])) {
            $this->validateTiktokSource($body['url_tiktok']);
        }

        $id = $this->model->create($body);
        jsonSuccess('Konten edukasi berhasil ditambahkan.', $this->model->findById($id), 201);
    }

    // PUT /api/edukasi/index.php?id=1  — admin only
    public function update(int $id): void {
        $this->requireAdmin();
        $body = getBody();
        if (empty($body['judul']))   jsonError('Judul wajib diisi.');
        if (empty($body['penulis'])) jsonError('Penulis wajib diisi.');

        $body = cleanArray($body, ['judul', 'ringkasan', 'isi', 'penulis']);

        if (!empty($body['url_artikel'])) $this->validateTrustedSource($body['url_artikel'], 'artikel');
        if (!empty($body['url_video']))   $this->validateVideoSource($body['url_video']);
        if (!empty($body['url_reel']))    $this->validateReelSource($body['url_reel']);
        if (!empty($body['url_tiktok']))  $this->validateTiktokSource($body['url_tiktok']);

        $e = $this->model->findById($id);
        if (!$e) jsonError('Tidak ditemukan.', 404);
        $this->model->update($id, $body);
        jsonSuccess('Berhasil diperbarui.', $this->model->findById($id));
    }

    // DELETE /api/edukasi/index.php?id=1  — admin only
    public function delete(int $id): void {
        $this->requireAdmin();
        $ok = $this->model->delete($id);
        if (!$ok) jsonError('Tidak ditemukan.', 404);
        jsonSuccess('Konten dihapus.');
    }

    // PUT /api/edukasi/index.php?id=1&action=toggle  — admin only
    public function toggle(int $id): void {
        $this->requireAdmin();
        $this->model->togglePublish($id);
        $e = $this->model->findById($id);
        jsonSuccess($e['is_published'] ? 'Diterbitkan.' : 'Disembunyikan.', $e);
    }

    // ── Helpers ──────────────────────────────────────────────
    // Admin & Perawat sama-sama boleh mengelola konten edukasi
    private function requireAdmin(): array {
        return requireAnyRole(['admin', 'perawat']);
    }

    private function validateTrustedSource(string $url, string $label): void {
        $trustedDomains = [
            'who.int', 'kemkes.go.id', 'satusehat.kemkes.go.id',
            'mayoclinic.org', 'clevelandclinic.org', 'my.clevelandclinic.org',
            'cdc.gov', 'nhs.uk', 'halodoc.com', 'alodokter.com',
        ];
        $host = strtolower(parse_url($url, PHP_URL_HOST) ?? '');
        $host = ltrim($host, 'www.');
        foreach ($trustedDomains as $d) {
            if ($host === $d || str_ends_with($host, '.' . $d)) return;
        }
        jsonError("URL $label harus berasal dari sumber terpercaya (WHO, Kemenkes, Mayo Clinic, dll).");
    }

    private function validateVideoSource(string $url): void {
        $host = strtolower(parse_url($url, PHP_URL_HOST) ?? '');
        $validHosts = ['youtube.com', 'www.youtube.com', 'youtu.be', 'm.youtube.com'];
        if (!in_array($host, $validHosts, true)) {
            jsonError('URL video harus berasal dari YouTube atau YouTube Shorts.');
        }
    }

    private function validateReelSource(string $url): void {
        $host = strtolower(parse_url($url, PHP_URL_HOST) ?? '');
        if (!str_contains($host, 'instagram.com')) {
            jsonError('URL Reel harus berasal dari Instagram Reels.');
        }
    }

    private function validateTiktokSource(string $url): void {
        $host = strtolower(parse_url($url, PHP_URL_HOST) ?? '');
        if (!str_contains($host, 'tiktok.com')) {
            jsonError('URL TikTok harus berasal dari tiktok.com.');
        }
    }
}