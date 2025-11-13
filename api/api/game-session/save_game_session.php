<?php
require_once "../common/cors_header.php";
require_once "../common/db_module.php";

$link = null;
taoKetNoi($link);

$response = ["success" => false, "message" => ""];

try {
    // Kiểm tra các trường bắt buộc
    $required = ['user_id', 'word_set_id', 'play_duration', 'end_date', 'game_mode_id', 'score'];
    foreach ($required as $field) {
        if (!isset($_POST[$field])) {
            throw new Exception("Thiếu trường bắt buộc: $field");
        }
    }

    // Lấy dữ liệu từ request
    $user_id = intval($_POST['user_id']);
    $word_set_id = intval($_POST['word_set_id']);
    $play_date = $_POST['play_date'];
    $play_duration = intval($_POST['play_duration']);
    $end_date = $_POST['end_date'];
    $game_mode_id = intval($_POST['game_mode_id']);
    $score = intval($_POST['score']);

    // Lưu kết quả vào bảng GameSession
    $query = "
        INSERT INTO GameSession (user_id, word_set_id, play_date, play_duration, end_date, game_mode_id, score)
        VALUES ($user_id, $word_set_id, '$play_date', $play_duration, '$end_date', $game_mode_id, $score)
    ";

    $result = chayTruyVanKhongTraVeDL($link, $query);
    if (!$result) {
        throw new Exception("Cannot save game result.");
    }

    // Lấy session_id vừa thêm
    $session_id = mysqli_insert_id($link);

    // Truy vấn thứ hạng (rank) theo game_mode_id
    $rankQuery = "
        SELECT COUNT(*) + 1 AS rank
        FROM GameSession
        WHERE game_mode_id = $game_mode_id AND score > $score
    ";
    $rankResult = chayTruyVanTraVeDL($link, $rankQuery);
    $rankRow = mysqli_fetch_assoc($rankResult);
    $rank = intval($rankRow['rank']);

    // Trả kết quả
    $response["success"] = true;
    $response["message"] = "Save game session successfully.";
    $response["session_id"] = $session_id;
    $response["rank"] = $rank;

} catch (Exception $e) {
    $response["message"] = $e->getMessage();
}

echo json_encode($response);
?>
