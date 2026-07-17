<?php
require_once __DIR__.'/../../config/helpers.php';
require_once __DIR__.'/../../models/TekananDarahModel.php';
require_once __DIR__.'/../../models/PasienModel.php';
setCorsHeaders();
requireRole('perawat');
$tekananModel = new TekananDarahModel();
$pasienModel  = new PasienModel();
$stat = $tekananModel->getStatistikGlobal();
$stat['total_pasien_terdaftar'] = count($pasienModel->getAll());
jsonSuccess('OK', $stat);
