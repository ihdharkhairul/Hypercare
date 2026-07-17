<?php
require_once __DIR__.'/../../config/helpers.php';
require_once __DIR__.'/../../controllers/PasienController.php';
setCorsHeaders();
$method=$_SERVER['REQUEST_METHOD'];
$ctrl=new PasienController();
$id=isset($_GET['id'])?(int)$_GET['id']:null;
if($id) match($method){ 'GET'=>$ctrl->show($id),'POST'=>$ctrl->update($id),'PUT'=>$ctrl->update($id),'DELETE'=>$ctrl->delete($id),default=>jsonError('405',405) };
else match($method){ 'GET'=>$ctrl->index(),default=>jsonError('405',405) };
