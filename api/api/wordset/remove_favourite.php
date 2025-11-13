<?php
require_once "../common/cors_header.php";
require_once "../common/db_module.php";

$link = null;
taoKetNoi($link);

$user_id = intval($_POST['user_id'] ?? 0);
$word_set_id = intval($_POST['word_set_id'] ?? 0);
$success = false;

if ($user_id > 0 && $word_set_id > 0) {
    $sql = "DELETE FROM SavedWordSet WHERE user_saved_id = $user_id AND word_set_id = $word_set_id";
    $success = chayTruyVanKhongTraVeDL($link, $sql);
}

giaiPhongBoNho($link);
echo json_encode([
  'success' => $success,
  'message' => $success ? 'Removed from favorites' : 'Failed to remove'
], JSON_UNESCAPED_UNICODE);
