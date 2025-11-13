<?php
require_once "config.php";

function taoKetNoi(&$link)
{
    error_log("Attempting to connect to MySQL with HOST=" . HOST . ", USER=" . USER . ", DB=" . DB);
    $link = mysqli_connect(HOST, USER, PASSWORD, DB);
    if (mysqli_connect_errno()) {
        $error = "Lỗi kết nối đến máy chủ: " . mysqli_connect_error();
        error_log($error);
        echo json_encode(["success" => false, "message" => $error]);
        exit();
    }
    error_log("Successfully connected to database");
}

function chayTruyVanTraVeDL($link, $q)
{
    $result = mysqli_query($link, $q);
    if (!$result) {
        error_log("Query error: " . mysqli_error($link));
    }
    return $result;
}

function chayTruyVanKhongTraVeDL($link, $q)
{
    $result = mysqli_query($link, $q);
    if (!$result) {
        error_log("Query error: " . mysqli_error($link));
    }
    return $result;
}

function giaiPhongBoNho($link, $result = null)
{
    try {
        if ($link) {
            mysqli_close($link);
        }
        if ($result) {
            mysqli_free_result($result);
        }
    } catch (TypeError $e) {
        error_log("Error in giaiPhongBoNho: " . $e->getMessage());
    }
}
