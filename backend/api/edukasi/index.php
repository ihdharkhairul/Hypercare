<?php
require_once __DIR__.'/../../config/helpers.php';
require_once __DIR__.'/../../controllers/EdukasiController.php';
setCorsHeaders();
$method = $_SERVER['REQUEST_METHOD'];
$ctrl   = new EdukasiController();
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;
$action = $_GET['action'] ?? null;

if ($id && $action === 'toggle' && $method === 'PUT') {
    $ctrl->toggle($id);
} elseif ($id) {
    match($method) {
        'GET'    => $ctrl->show($id),
        'PUT'    => $ctrl->update($id),
        'DELETE' => $ctrl->delete($id),
        default  => jsonError('Method tidak diizinkan.', 405),
    };
} else {
    match($method) {
        'GET'  => $ctrl->index(),
        'POST' => $ctrl->store(),
        default => jsonError('Method tidak diizinkan.', 405),
    };
}
