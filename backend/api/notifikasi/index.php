<?php
require_once __DIR__.'/../../config/helpers.php';
require_once __DIR__.'/../../controllers/NotifikasiController.php';
setCorsHeaders();
$method=$_SERVER['REQUEST_METHOD'];
$ctrl=new NotifikasiController();
$id=isset($_GET['id'])?(int)$_GET['id']:null;
$action=$_GET['action']??null;
if($action==='read-all') { $ctrl->markAllRead(); }
elseif($id && $action==='read') { $ctrl->markRead($id); }
elseif($id && $method==='DELETE') { $ctrl->delete($id); }
else match($method){ 'GET'=>$ctrl->index(),default=>jsonError('405',405) };
