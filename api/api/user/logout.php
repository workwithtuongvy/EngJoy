<?php
    session_start();
    require_once "../common/cors_header.php";
    session_unset();
    session_destroy();
    echo json_encode(['success' => true, 'message' => 'Đăng xuất thành công']);
?>