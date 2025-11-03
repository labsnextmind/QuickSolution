<?php
function safe_eval($s){
  if(preg_match('/[^0-9+\-*/().\s]/',$s)) return null;
  return eval('return '.$s.';');
}
$q = $_POST['q'] ?? file_get_contents('php://input');
if(is_string($q) && preg_match('/^[0-9+\-*/().\s]+$/',$q)){
  $r = safe_eval($q);
  echo json_encode(['answer'=>strval($r)]);
  exit;
}
echo json_encode(['answer'=>'Unable to fetch remote AI from PHP host. Use Node proxy for full API access.']);
?>