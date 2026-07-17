<?php
require_once __DIR__.'/../../config/helpers.php';
require_once __DIR__.'/../../controllers/TekananDarahController.php';
setCorsHeaders();
$method=$_SERVER['REQUEST_METHOD'];
$ctrl=new TekananDarahController();
$id=isset($_GET['id'])?(int)$_GET['id']:null;
$action=$_GET['action']??null;
if($action==='stat') $ctrl->stat();
elseif($action==='all') $ctrl->allData();
elseif($id) match($method){ 'PUT'=>$ctrl->update($id),'DELETE'=>$ctrl->delete($id),default=>jsonError('Method tidak diizinkan.',405) };
else match($method){ 'GET'=>$ctrl->index(),'POST'=>$ctrl->store(),default=>jsonError('Method tidak diizinkan.',405) };
