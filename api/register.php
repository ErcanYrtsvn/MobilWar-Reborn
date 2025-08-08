<?php
require 'config.php';
$b = jsonBody();
$username = trim($b['username'] ?? '');
$pass = $b['password'] ?? '';

if ($username==='' || $pass==='') { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'Eksik']); exit; }
if (!preg_match('/^[a-zA-Z0-9_]{3,32}$/',$username)) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'Kullanıcı adı geçersiz']); exit; }

try {
  $hash = password_hash($pass, PASSWORD_BCRYPT);
  $pdo->beginTransaction();
  $stmt = $pdo->prepare("INSERT INTO users(username, pass_hash) VALUES(?,?)");
  $stmt->execute([$username,$hash]);
  $uid = intval($pdo->lastInsertId());

  // profil başlangıç verisi
  $pdo->prepare("INSERT INTO profiles(user_id, gold, food, stone, buildings, army) VALUES(?,1000,1000,1000,'{}','{}')")
      ->execute([$uid]);

  // token üret
  $token = makeToken();
  $pdo->prepare("INSERT INTO tokens(user_id, token, expires_at) VALUES(?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))")
      ->execute([$uid,$token]);

  $pdo->commit();
  echo json_encode(['ok'=>true,'token'=>$token,'user'=>['id'=>$uid,'username'=>$username]]);
} catch(Exception $e){
  if ($pdo->inTransaction()) $pdo->rollBack();
  $dup = (strpos($e->getMessage(),'Duplicate')!==false);
  http_response_code($dup?409:500);
  echo json_encode(['ok'=>false,'error'=>$dup?'Kullanıcı adı alınmış':'Sunucu hatası']);
}
