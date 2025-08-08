<?php
require 'config.php';
$uid = authUserId($pdo);
if (!$uid){ http_response_code(401); echo json_encode(['ok'=>false,'error'=>'Auth']); exit; }

$stmt = $pdo->prepare("SELECT u.id, u.username, p.gold, p.food, p.stone, p.buildings, p.army
                       FROM users u LEFT JOIN profiles p ON p.user_id=u.id WHERE u.id=?");
$stmt->execute([$uid]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$row){ http_response_code(404); echo json_encode(['ok'=>false,'error'=>'Not found']); exit; }

echo json_encode(['ok'=>true,'user'=>[
  'id'=>intval($row['id']),
  'username'=>$row['username'],
  'gold'=>intval($row['gold']),
  'food'=>intval($row['food']),
  'stone'=>intval($row['stone']),
  'buildings'=>json_decode($row['buildings']??'{}',true),
  'army'=>json_decode($row['army']??'{}',true)
]]);
