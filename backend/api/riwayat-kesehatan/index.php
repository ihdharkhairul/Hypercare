<?php
require_once __DIR__.'/../../config/helpers.php';
require_once __DIR__.'/../../controllers/RiwayatKesehatanController.php';
setCorsHeaders();
$method=$_SERVER['REQUEST_METHOD'];
$ctrl=new RiwayatKesehatanController();
$id=isset($_GET['id'])?(int)$_GET['id']:null;
if($id) match($method){ 'PUT'=>$ctrl->update($id),'DELETE'=>$ctrl->delete($id),default=>jsonError('405',405) };
else match($method){ 'GET'=>$ctrl->index(),'POST'=>$ctrl->store(),default=>jsonError('405',405) };
