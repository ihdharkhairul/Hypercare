<?php
require_once __DIR__.'/../../config/helpers.php';
require_once __DIR__.'/../../controllers/AdminAuthController.php';
setCorsHeaders();
if ($_SERVER['REQUEST_METHOD'] !== 'GET') jsonError('Method tidak diizinkan.', 405);
(new AdminAuthController())->me();
