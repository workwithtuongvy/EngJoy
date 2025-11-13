<?php
require_once "../common/cors_header.php";

require_once("../common/db_module.php");
$link = null;
taoKetNoi($link);
$response = ["success" => false];

if (!isset($_GET['user_id'])) {
    echo json_encode(["success" => false, "message" => "Thiếu user_id."]);
    exit();
}

$user_id = (int)$_GET['user_id'];

$sql = "SELECT user_id, username, email, full_name, description, birthdate 
        FROM user 
        WHERE user_id = $user_id";
$result = chayTruyVanTraVeDL($link, $sql);

if ($result && mysqli_num_rows($result) > 0) {
    $response = mysqli_fetch_assoc($result);
    $response['success'] = true;
} else {
    $response = ["success" => false, "message" => "Không tìm thấy người dùng"];
}

giaiPhongBoNho($link, $result);
echo json_encode($response);
?>
