<?php
require_once "../common/cors_header.php";
require_once "../common/db_module.php";
$link = null;
taoKetNoi($link);
$response = ["success" => false, "message" => ""];
try {
    if (!isset($_POST['word_set_id'], $_POST['title'], $_POST['cards'])) {
        throw new Exception("Thiếu dữ liệu.");
    }
    $word_set_id = intval($_POST['word_set_id']);
    $title = mysqli_real_escape_string($link, $_POST['title']);
    $cards = json_decode($_POST['cards'], true);
    $tag_ids = isset($_POST['tag_ids']) ? json_decode($_POST['tag_ids'], true) : [];
    chayTruyVanKhongTraVeDL($link, "UPDATE WordSet SET title = '$title' WHERE word_set_id = $word_set_id");
    chayTruyVanKhongTraVeDL($link, "DELETE FROM Vocabulary WHERE word_set_id = $word_set_id");
    foreach ($cards as $c) {
        $term = mysqli_real_escape_string($link, $c['term']);
        $definition = mysqli_real_escape_string($link, $c['definition']);
        chayTruyVanKhongTraVeDL($link, "INSERT INTO Vocabulary (word_set_id, term, definition) VALUES ($word_set_id, '$term', '$definition')");
    }
    chayTruyVanKhongTraVeDL($link, "DELETE FROM WordSetTag WHERE word_set_id = $word_set_id");
    foreach ($tag_ids as $tid) {
        chayTruyVanKhongTraVeDL($link, "INSERT INTO WordSetTag (word_set_id, tag_id) VALUES ($word_set_id, $tid)");
    }
    $response['success'] = true;
    $response['message'] = "Update successfully!";
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
} finally {
    giaiPhongBoNho($link);
}
echo json_encode($response, JSON_UNESCAPED_UNICODE);