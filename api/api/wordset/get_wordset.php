<?php
require_once "../common/cors_header.php";
require_once "../common/db_module.php";
$link = null;
taoKetNoi($link);
$word_set_id = intval($_GET['word_set_id'] ?? 0);
$response = null;
if ($word_set_id > 0) {
    $sql = "SELECT * FROM WordSet WHERE word_set_id = $word_set_id";
    $result = chayTruyVanTraVeDL($link, $sql);
    if ($row = mysqli_fetch_assoc($result)) {
        $response = $row;
        $vocab = [];
        $res = chayTruyVanTraVeDL($link, "SELECT * FROM Vocabulary WHERE word_set_id = $word_set_id");
        while ($word = mysqli_fetch_assoc($res)) $vocab[] = $word;
        $response['words'] = $vocab;
        $tags = [];
        $res = chayTruyVanTraVeDL($link, "SELECT tag_id FROM WordSetTag WHERE word_set_id = $word_set_id");
        while ($tag = mysqli_fetch_assoc($res)) $tags[] = intval($tag['tag_id']);
        $response['tag_ids'] = $tags;
    }
}
giaiPhongBoNho($link);
echo json_encode($response, JSON_UNESCAPED_UNICODE);