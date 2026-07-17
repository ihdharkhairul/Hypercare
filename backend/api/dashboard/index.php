<?php
require_once __DIR__.'/../../config/helpers.php';
require_once __DIR__.'/../../controllers/DashboardController.php';
setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') jsonError('Method tidak diizinkan.', 405);

$action = $_GET['action'] ?? null;
$ctrl = new DashboardController();

match ($action) {
    'pasien'          => $ctrl->pasien(),
    'perawat'         => $ctrl->perawat(),
    'aktivitas'       => $ctrl->aktivitas(),
    'login-history'   => $ctrl->loginHistory(),
    'chat-ai-history' => $ctrl->chatAiSummary(),
    default           => jsonError('Action tidak dikenali.', 404),
};
