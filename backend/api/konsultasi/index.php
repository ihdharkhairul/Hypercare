<?php
require_once __DIR__ . '/../../config/helpers.php';
require_once __DIR__ . '/../../controllers/KonsultasiController.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$ctrl   = new KonsultasiController();
$id     = isset($_GET['id'])     ? (int)$_GET['id'] : null;
$action = $_GET['action'] ?? null;

if ($id && $action === 'status' && $method === 'PUT') {
    $ctrl->updateStatus($id);
} elseif (!$id) {
    match($method) {
        'GET'  => $ctrl->index(),
        'POST' => $ctrl->store(),
        default => jsonError('Method tidak diizinkan.', 405),
    };
} else {
    jsonError('Endpoint tidak ditemukan.', 404);
}
