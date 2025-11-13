<?php
require_once "../common/cors_header.php";
require_once "../common/db_module.php";

$link = null;
taoKetNoi($link);

$response = ['success' => false, 'message' => ''];

try {
    if (!isset($_POST['user_saved_id'], $_POST['word_set_id'])) {
        throw new Exception("Thiếu dữ liệu cần thiết.");
    }

    $user_saved_id = intval($_POST['user_saved_id']);
    $word_set_id = intval($_POST['word_set_id']);

    $query = "INSERT INTO SavedWordSet (user_saved_id, word_set_id) VALUES ($user_saved_id, $word_set_id)";
    $result = chayTruyVanKhongTraVeDL($link, $query);

    if ($result) {
        $response['success'] = true;
        $response['message'] = "Đã lưu bộ từ.";
    } else {
        throw new Exception("Không thể lưu vào cơ sở dữ liệu.");
    }
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
?>
