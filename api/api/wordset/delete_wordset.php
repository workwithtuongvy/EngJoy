<?php
require_once "../common/cors_header.php";
require_once "../common/db_module.php";

$link = null;
taoKetNoi($link);

$word_set_id = intval($_POST['word_set_id'] ?? 0);
$success = false;

if ($word_set_id > 0) {
    $sql = "DELETE FROM WordSet WHERE word_set_id = $word_set_id";
    $success = chayTruyVanKhongTraVeDL($link, $sql);
}

giaiPhongBoNho($link);
echo json_encode([
  'success' => $success,
  'message' => $success ? 'Deleted successfully' : 'Deletion failed'
], JSON_UNESCAPED_UNICODE);
