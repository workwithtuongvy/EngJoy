<?php
require_once "../common/cors_header.php";
require_once "../common/db_module.php";
$link = null;
taoKetNoi($link);

$sql = "
SELECT ws.word_set_id, ws.title, ws.description, ws.last_update, ws.user_id, u.username,
    COUNT(DISTINCT v.vocab_id) AS term_count,
    COUNT(DISTINCT sw.user_saved_id) AS saved_count,
    GROUP_CONCAT(DISTINCT t.tag_name) AS tag_list
FROM wordset ws
JOIN user u ON ws.user_id = u.user_id
LEFT JOIN vocabulary v ON ws.word_set_id = v.word_set_id
LEFT JOIN savedwordset sw ON ws.word_set_id = sw.word_set_id
LEFT JOIN wordsettag wst ON ws.word_set_id = wst.word_set_id
LEFT JOIN tag t ON wst.tag_id = t.tag_id
WHERE ws.is_hidden = 2
GROUP BY ws.word_set_id
ORDER BY ws.last_update DESC
";

$result = chayTruyVanTraVeDL($link, $sql);
$response = [];

if ($result && mysqli_num_rows($result) > 0) {
    while ($row = mysqli_fetch_assoc($result)) {
        $tags = [];
        if (!empty($row['tag_list'])) {
            $tags = explode(',', $row['tag_list']);  // Tách thành mảng
        }

        $response[] = [
            'word_set_id' => (int)$row['word_set_id'],
            'title' => $row['title'],
            'description' => $row['description'],
            'last_update' => $row['last_update'],
            'user_id' => (int)$row['user_id'],
            'username' => $row['username'],
            'termCount' => (int)$row['term_count'],
            'savedCount' => (int)$row['saved_count'],
            'tags' => $tags // ✅ Trả về danh sách tag
        ];
    }

    echo json_encode(["success" => true, "data" => $response]);
} else {
    echo json_encode(["success" => false, "message" => "Không có bộ từ nào."]);
}

giaiPhongBoNho($link, $result);
?>
