<?php
require_once "../common/cors_header.php";

require_once("../common/db_module.php");
$link = null;
taoKetNoi($link);
$response = ["success" => false, "message" => ""];

try {
    // Kiểm tra dữ liệu bắt buộc
    if (!isset($_POST['user_id'], $_POST['username'], $_POST['full_name'], $_POST['email'], $_POST['birthdate'], $_POST['description'])) {
        throw new Exception("Thiếu thông tin cập nhật.");
    }

    $user_id    = (int)$_POST['user_id'];
    $username   = trim($_POST['username']);
    $fullname   = trim($_POST['full_name']);
    $email      = trim($_POST['email']);
    $birthdate  = trim($_POST['birthdate']);
    $description= trim($_POST['description']);

    // Kiểm tra định dạng email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Email không hợp lệ.");
    }

    // Kiểm tra username/email đã tồn tại chưa (trừ chính mình)
    $checkResult = chayTruyVanTraVeDL($link, 
        "SELECT * FROM user WHERE (username='$username' OR email='$email') AND user_id != $user_id");
    if ($checkResult && mysqli_num_rows($checkResult) > 0) {
        throw new Exception("Username hoặc Email đã được sử dụng.");
    }

    // Cập nhật thông tin cá nhân
    $sqlUpdate = "UPDATE user 
                  SET username='$username', full_name='$fullname', email='$email', birthdate='$birthdate', description='$description' 
                  WHERE user_id=$user_id";
    if (!chayTruyVanKhongTraVeDL($link, $sqlUpdate)) {
        throw new Exception("Cập nhật thông tin thất bại: " . mysqli_error($link));
    }

    // Nếu có yêu cầu đổi mật khẩu
    if (isset($_POST['old_password'], $_POST['new_password'], $_POST['re_password'])) {
        $old_password = $_POST['old_password'];
        $new_password = $_POST['new_password'];
        $re_password  = $_POST['re_password'];

        $md5Old = md5($old_password);

        // Kiểm tra mật khẩu cũ
        $resultPw = chayTruyVanTraVeDL($link, 
            "SELECT user_id FROM user WHERE user_id=$user_id AND password='$md5Old'");
        if (!$resultPw || mysqli_num_rows($resultPw) == 0) {
            throw new Exception("Mật khẩu cũ không đúng.");
        }

        if (empty($new_password)) {
            throw new Exception("Mật khẩu mới không được bỏ trống.");
        }

        if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{9,}$/', $new_password)) {
            throw new Exception("Mật khẩu mới phải có hơn 8 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường và 1 ký tự đặc biệt.");
        }

        if ($new_password === $old_password) {
            throw new Exception("Mật khẩu mới không được trùng mật khẩu cũ.");
        }

        if ($new_password !== $re_password) {
            throw new Exception("Mật khẩu nhập lại không khớp.");
        }

        $md5New = md5($new_password);
        if (!chayTruyVanKhongTraVeDL($link, 
            "UPDATE user SET password='$md5New' WHERE user_id=$user_id")) {
            throw new Exception("Không thể cập nhật mật khẩu mới.");
        }
    }

    $response['success'] = true;
    $response['message'] = "Cập nhật thành công!";
} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = $e->getMessage();
} finally {
    if ($link) giaiPhongBoNho($link);
    echo json_encode($response);
}
?>
