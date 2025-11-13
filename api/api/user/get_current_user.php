<?php
    session_start();
    require_once "../common/cors_header.php";
    header("Content-Type: application/json; charset=UTF-8");

    $response = ['isLoggedIn' => false];

    if (isset($_SESSION['user_id'])) {
        $response['isLoggedIn'] = true;
        $response['user_id'] = $_SESSION['user_id'];
        $response['username'] = $_SESSION['username'];
        $response['user_type'] = $_SESSION['user_type'];
    }

    echo json_encode($response, JSON_UNESCAPED_UNICODE);
?>