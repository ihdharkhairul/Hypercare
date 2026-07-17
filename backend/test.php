<?php
// File diagnosa — hapus setelah selesai testing
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

echo json_encode([
    'status'  => 'OK',
    'php'     => phpversion(),
    'method'  => $_SERVER['REQUEST_METHOD'],
    'origin'  => $_SERVER['HTTP_ORIGIN'] ?? 'tidak ada',
    'message' => 'Backend HyperCare berjalan dengan baik!'
]);
