<?php
require_once "common/cors_header.php";
require_once "common/db_module.php";

$link = null;
taoKetNoi($link);

$response = ["success" => false, "message" => ""];

try {
    // Kiểm tra các trường bắt buộc
    if (!isset($_POST['word_set_id']) || !isset($_POST['reason'])) {
        throw new Exception("Thiếu word_set_id hoặc reason");
    }

    // Lấy dữ liệu từ request
    $word_set_id = intval($_POST['word_set_id']);
    $reason = trim($_POST['reason']);

    if ($word_set_id <= 0 || $reason === '') {
        throw new Exception("Dữ liệu không hợp lệ");
    }

    // Thêm vào bảng ReportedSet
    $query = "
        INSERT INTO ReportedSet (word_set_id, reason)
        VALUES ($word_set_id, '$reason')
    ";

    $result = chayTruyVanKhongTraVeDL($link, $query);
    if (!$result) {
        throw new Exception("Không thể lưu báo cáo.");
    }

    $response["success"] = true;
    $response["message"] = "Report submitted successfully.";

} catch (Exception $e) {
    $response["message"] = $e->getMessage();
}

echo json_encode($response);
?>
