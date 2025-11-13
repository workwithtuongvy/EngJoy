<?php
session_start();

// CORS headers
require_once "../common/cors_header.php";
require_once "../common/db_module.php";

$link = null;
taoKetNoi($link);

$response = ['success' => false, 'message' => ''];

try {
    // Kiểm tra dữ liệu bắt buộc
    if (!isset($_POST['username'], $_POST['password'])) {
        throw new Exception("Please enter your username and password.");
    }

    // Lấy và chuẩn hóa dữ liệu
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);

    // Escape dữ liệu
    $username = mysqli_real_escape_string($link, $username);

    // ✅ Tìm user theo username hoặc email
    $query = "SELECT * FROM User WHERE username = '$username' OR email = '$username' LIMIT 1";
    $result = chayTruyVanTraVeDL($link, $query);

    if (mysqli_num_rows($result) === 0) {
        throw new Exception("Account does not exist.");
    }

    $user = mysqli_fetch_assoc($result);
    error_log("Mật khẩu người dùng nhập: " . $password);
    error_log("password hex: " . bin2hex($password));
    error_log("MD5 của mật khẩu nhập: " . md5($password));
    error_log("Mật khẩu trong CSDL: " . $user['password']);


    // ✅ So sánh mật khẩu đã hash
    if (md5($password) !== $user['password']) {
        throw new Exception("Password is incorrect.");
    }
    

    // ✅ Lưu session
    $_SESSION['user_id'] = $user['user_id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['user_type'] = $user['user_type'];

    // ✅ Trả về phản hồi thành công
    $response['success'] = true;
    $response['message'] = "Login successfully!";
    $response['user_id'] = $user['user_id'];
    $response['user_type'] = $user['user_type'];
    $response['username'] = $user['username'];

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
} finally {
    if ($link) giaiPhongBoNho($link);
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
}
?>
