<?php
require_once __DIR__.'/../../config/helpers.php';
require_once __DIR__.'/../../controllers/EdukasiKuisController.php';
setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$ctrl   = new EdukasiKuisController();
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;
$action = $_GET['action'] ?? null;

if ($method === 'GET' && $action === 'count') {
    $ctrl->count();
} elseif ($method === 'GET' && $action === 'hasil') {
    $ctrl->hasil();
} elseif ($method === 'POST' && $action === 'submit') {
    $ctrl->submit();
} elseif ($id) {
    match ($method) {
        'PUT'    => $ctrl->update($id),
        'DELETE' => $ctrl->delete($id),
        default  => jsonError('Method tidak diizinkan.', 405),
    };
} else {
    match ($method) {
        'GET'  => $ctrl->index(),
        'POST' => $ctrl->store(),
        default => jsonError('Method tidak diizinkan.', 405),
    };
}