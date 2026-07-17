<?php
require_once __DIR__.'/../../config/helpers.php';
require_once __DIR__.'/../../controllers/PerawatController.php';
setCorsHeaders();
$method=$_SERVER['REQUEST_METHOD'];
$ctrl=new PerawatController();
$id=isset($_GET['id'])?(int)$_GET['id']:null;
$action=$_GET['action']??null;
if($id && $action==='status' && $method==='PUT') { $ctrl->status($id); }
elseif($id) match($method){ 'GET'=>$ctrl->show($id),'POST'=>$ctrl->update($id),'PUT'=>$ctrl->update($id),'DELETE'=>$ctrl->delete($id),default=>jsonError('405',405) };
else match($method){ 'GET'=>$ctrl->index(),default=>jsonError('405',405) };
