<?php
require_once __DIR__ . '/../../config/helpers.php';
require_once __DIR__ . '/../../controllers/ChatController.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$ctrl   = new ChatController();
$action = $_GET['action'] ?? 'messages';

match(true) {
    $action === 'list'     && $method === 'GET'  => $ctrl->list(),
    $action === 'messages' && $method === 'GET'  => $ctrl->messages(),
    $action === 'send'     && $method === 'POST' => $ctrl->send(),
    $action === 'read'     && $method === 'PUT'  => $ctrl->markRead(),
    default => jsonError('Endpoint tidak ditemukan.', 404),
};
