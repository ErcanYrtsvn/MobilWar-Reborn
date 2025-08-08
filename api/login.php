<?php
require 'config.php';
$b = jsonBody();
$username = trim($b['username'] ?? '');
$pass = $b['password'] ?? '';
if ($username==='' || $pass===''){ http_response_code(400); echo json_encode(['ok'=>false,'error'=>'Eksik']); exit; }

$stmt = $pdo->prepare("SELECT id, pass_hash FROM users WHERE username=?");
$stmt->execute([$username]);
$u = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$u || !password_verify($pass, $u['pass_hash'])) {
  http_response_code(401); echo json_encode(['ok'=>false,'error'=>'Geçersiz giriş']); exit;
}
$token = makeToken();
$pdo->prepare("INSERT INTO tokens(user_id, token, expires_at) VALUES(?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))")
    ->execute([intval($u['id']), $token]);

echo json_encode(['ok'=>true,'token'=>$token,'user'=>['id'=>intval($u['id']),'username'=>$username]]);
