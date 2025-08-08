<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
if ($_SERVER['REQUEST_METHOD']==='OPTIONS') { http_response_code(200); exit; }

$DB_HOST = 'localhost';
$DB_NAME = 'mobilwar';
$DB_USER = 'root';
$DB_PASS = ''; // hostuna göre doldur

try {
  $pdo = new PDO("mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4",$DB_USER,$DB_PASS,[
    PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION
  ]);
} catch(Exception $e){
  http_response_code(500);
  echo json_encode(['ok'=>false,'error'=>'DB fail']);
  exit;
}

function jsonBody(){
  $raw = file_get_contents('php://input');
  return $raw ? json_decode($raw,true) : [];
}

function makeToken(){
  return bin2hex(random_bytes(32)); // 64-char
}

function authUserId($pdo){
  $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
  if (!preg_match('/Bearer\s+([a-f0-9]{64})/i',$auth,$m)) return null;
  $t = $m[1];
  $stmt = $pdo->prepare("SELECT user_id FROM tokens WHERE token=? AND expires_at > NOW()");
  $stmt->execute([$t]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  return $row ? intval($row['user_id']) : null;
}
