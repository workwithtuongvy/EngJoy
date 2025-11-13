<?php
require_once "../common/cors_header.php";
require_once "../common/db_module.php";

$response = ['success' => false, 'data' => []];

try {
    if (!isset($_GET['user_id'])) {
        throw new Exception("Thiếu user_id");
    }

    $link = null;
    taoKetNoi($link);
    $user_id = intval($_GET['user_id']);

    $query = "SELECT word_set_id FROM SavedWordSet WHERE user_saved_id = $user_id";
    $result = chayTruyVanTraVeDL($link, $query);

    while ($row = mysqli_fetch_assoc($result)) {
        $response['data'][] = intval($row['word_set_id']);
    }

    $response['success'] = true;
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

header('Content-Type: application/json');
echo json_encode($response);
