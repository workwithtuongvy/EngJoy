<?php
require_once "../common/cors_header.php";
require_once "../common/db_module.php";

$link = null;
taoKetNoi($link);

$user_id = intval($_GET['user_id'] ?? 0);
$data = [];

if ($user_id > 0) {
    $sql = "SELECT * FROM User WHERE user_id = $user_id";
    $result = chayTruyVanTraVeDL($link, $sql);
    if ($row = mysqli_fetch_assoc($result)) {
        $data = $row;
    }
}

giaiPhongBoNho($link);
echo json_encode($data, JSON_UNESCAPED_UNICODE);
