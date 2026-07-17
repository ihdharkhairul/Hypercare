<?php
require_once __DIR__ . '/../../config/helpers.php';
require_once __DIR__ . '/../../controllers/AuthController.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method tidak diizinkan.', 405);
}

(new AuthController())->registerPerawat();
