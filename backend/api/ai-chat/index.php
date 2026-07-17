<?php
require_once __DIR__.'/../../config/helpers.php';
require_once __DIR__.'/../../controllers/AiChatController.php';
setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? null;
$ctrl   = new AiChatController();

if ($action === 'history' && $method === 'GET') {
    $ctrl->history();
} elseif ($action === 'send' && $method === 'POST') {
    $ctrl->send();
} elseif ($action === 'clear' && $method === 'DELETE') {
    $ctrl->clear();
} else {
    jsonError('Endpoint atau method tidak ditemukan.', 404);
}
