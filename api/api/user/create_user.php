<?php
// CORS headers
require_once "../common/cors_header.php";
require_once "../common/db_module.php";

$link = null;
taoKetNoi($link);

$response = ['success' => false, 'message' => ''];

try {
    // Kiểm tra dữ liệu bắt buộc
    if (!isset($_POST['username'], $_POST['email'], $_POST['password'])) {
        throw new Exception("Missing input data!");
    }

    // Lấy và chuẩn hóa dữ liệu
    $username = trim($_POST['username']);
    $email = trim($_POST['email']);
    $password = $_POST['password'];

    // Escape dữ liệu
    $username = mysqli_real_escape_string($link, $username);
    $email = mysqli_real_escape_string($link, $email);

    // Kiểm tra username và email đã tồn tại chưa
    $checkUserQuery = "SELECT 1 FROM User WHERE username = '$username' LIMIT 1";
    $checkEmailQuery = "SELECT 1 FROM User WHERE email = '$email' LIMIT 1";

    if (mysqli_num_rows(chayTruyVanTraVeDL($link, $checkUserQuery)) > 0) {
        throw new Exception("Username already exists!");
    }

    if (mysqli_num_rows(chayTruyVanTraVeDL($link, $checkEmailQuery)) > 0) {
        throw new Exception("Email already used!");
    }

    // Validate mật khẩu
    if (strlen($password) < 6 || !preg_match('/[A-Z]/', $password) || !preg_match('/[0-9]/', $password)) {
        throw new Exception("Password must be at least 6 characters, 1 uppercase letter, and 1 number.");
    }

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Invalid email.");
    }

    // Mã hóa mật khẩu
    $passwordHash = md5($password);


    // Chỉ thêm 3 trường bắt buộc
    $insertSql = "
        INSERT INTO User (username, password, email)
        VALUES ('$username', '$passwordHash', '$email')
    ";

    if (!chayTruyVanKhongTraVeDL($link, $insertSql)) {
        throw new Exception("Cannot create account. Please try again!");
    }

    $response['success'] = true;
    $response['message'] = "Register successfully!";
    $response['user_id'] = mysqli_insert_id($link);

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
} finally {
    if ($link) giaiPhongBoNho($link);
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
}
?>
