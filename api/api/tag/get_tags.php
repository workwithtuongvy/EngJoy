<?php
// Nạp cấu hình CORS và kết nối CSDL
require_once "../common/cors_header.php";
require_once "../common/db_module.php";
$link = null;
taoKetNoi($link);

// Chuẩn bị phản hồi
$response = [
    "success" => false,
    "message" => "",
    "tags" => []
];

try {
    // Truy vấn danh sách tag và đếm số lần sử dụng mỗi tag trong WordSetTag
    $query = "
        SELECT t.tag_id, t.tag_name, COUNT(wst.word_set_id) AS usage_count
        FROM Tag t
        LEFT JOIN WordSetTag wst ON t.tag_id = wst.tag_id
        GROUP BY t.tag_id, t.tag_name
        ORDER BY usage_count DESC, tag_name ASC
    ";

    $result = mysqli_query($link, $query);

    if (!$result) {
        throw new Exception("Lỗi truy vấn cơ sở dữ liệu.");
    }

    // Duyệt kết quả
    while ($row = mysqli_fetch_assoc($result)) {
        $response["tags"][] = [
            "tag_id" => (int)$row["tag_id"],
            "tag_name" => $row["tag_name"],
            "usage_count" => (int)$row["usage_count"]
        ];
    }

    $response["success"] = true;
    $response["message"] = "Tải danh sách tag thành công.";
} catch (Exception $e) {
    $response["message"] = $e->getMessage();
} finally {
    giaiPhongBoNho($link, $result ?? null);
    echo json_encode($response);
}
