<?php
    require_once "../common/cors_header.php";
    require_once "../common/db_module.php";
    $link = null;
    taoKetNoi($link);
    $response = ["success" => false, "message" => ""];
    try {
        if (!isset($_POST['title'], $_POST['cards'], $_POST['user_id'])) {
            throw new Exception("Missing input data!");
        }
        $title = mysqli_real_escape_string($link, $_POST['title']);
        $user_id = intval($_POST['user_id']);
        $cards = json_decode($_POST['cards'], true);
        $tag_ids = isset($_POST['tag_ids']) ? json_decode($_POST['tag_ids'], true) : [];
        if (!is_array($cards) || count($cards) === 0) {
            throw new Exception("Invalid word list.");
        }
        $sql_insert = "INSERT INTO WordSet (title, user_id) VALUES ('$title', $user_id)";
        if (!chayTruyVanKhongTraVeDL($link, $sql_insert)) {
            throw new Exception("Cannot create word set.");
        }
        $word_set_id = mysqli_insert_id($link);
        foreach ($cards as $card) {
            $term = mysqli_real_escape_string($link, $card['term']);
            $definition = mysqli_real_escape_string($link, $card['definition']);
            $sql_vocab = "INSERT INTO Vocabulary (word_set_id, term, definition) VALUES ($word_set_id, '$term', '$definition')";
            chayTruyVanKhongTraVeDL($link, $sql_vocab);
        }
        foreach ($tag_ids as $tag_id) {
            $sql_tag = "INSERT INTO WordSetTag (word_set_id, tag_id) VALUES ($word_set_id, $tag_id)";
            chayTruyVanKhongTraVeDL($link, $sql_tag);
        }
        $response['success'] = true;
        $response['message'] = "Create word set successfully!";
        $response['word_set_id'] = $word_set_id;
    } catch (Exception $e) {
        $response['message'] = $e->getMessage();
    } finally {
        giaiPhongBoNho($link);
    }
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
?>