<?php
require_once "../common/cors_header.php";
require_once "../common/db_module.php";
$link = null;
taoKetNoi($link);

$user_id = intval($_GET['user_id'] ?? 0);
$data = [];

if ($user_id > 0) {
    $sql = "
        SELECT DISTINCT ws.* 
        FROM WordSet ws
        JOIN GameSession gs ON ws.word_set_id = gs.word_set_id
        WHERE gs.user_id = $user_id
        ORDER BY gs.play_date DESC
    ";

    $result = chayTruyVanTraVeDL($link, $sql);

    while ($row = mysqli_fetch_assoc($result)) {
        $word_set_id = $row['word_set_id'];

        // Lấy danh sách từ
        $words = [];
        $sql_words = "SELECT vocab_id, term, definition FROM Vocabulary WHERE word_set_id = $word_set_id";
        $result_words = chayTruyVanTraVeDL($link, $sql_words);
        while ($word = mysqli_fetch_assoc($result_words)) {
            $words[] = $word;
        }

        $row['words'] = $words;
        $data[] = $row;
    }
}

giaiPhongBoNho($link);
echo json_encode($data, JSON_UNESCAPED_UNICODE);
