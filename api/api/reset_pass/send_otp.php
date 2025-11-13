<?php
include '../common/cors_header.php';
include '../common/db_module.php';
require '../common/mail_config.php';
require '../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Get email from frontend
$post = json_decode(file_get_contents("php://input"), true);
$email = $post['email'] ?? '';

if (empty($email)) {
    echo json_encode(["success" => false, "message" => "Missing email"]);
    exit;
}

$conn = null;
taoKetNoi($conn);

// Check if email exists
$sqlCheck = "SELECT * FROM User WHERE email = ?";
$stmtCheck = $conn->prepare($sqlCheck);
if (!$stmtCheck) {
    echo json_encode(["success" => false, "message" => "Database error (check statement)"]);
    exit;
}
$stmtCheck->bind_param("s", $email);
$stmtCheck->execute();
$result = $stmtCheck->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Email does not exist"]);
    exit;
}

// Generate OTP and update password
$otp = rand(100000, 999999);
$hashedPassword = md5((string)$otp);

$sqlUpdate = "UPDATE User SET password = ? WHERE email = ?";
$stmtUpdate = $conn->prepare($sqlUpdate);
if (!$stmtUpdate) {
    echo json_encode(["success" => false, "message" => "Database error (update statement)"]);
    exit;
}
$stmtUpdate->bind_param("ss", $hashedPassword, $email);
$stmtUpdate->execute();

// Send email
$mail = new PHPMailer(true);
try {
    $mail->CharSet = MAIL_CHARSET;
    $mail->Encoding = MAIL_ENCODING;
    $mail->isSMTP();
    $mail->Host = MAIL_HOST;
    $mail->SMTPAuth = true;
    $mail->Username = MAIL_USERNAME;
    $mail->Password = MAIL_PASSWORD;
    $mail->SMTPSecure = MAIL_SMTP_SECURE;
    $mail->Port = MAIL_PORT;

    $mail->setFrom(MAIL_FROM_ADDRESS, MAIL_FROM_NAME);
    $mail->addAddress($email);
    $mail->isHTML(true);
    $mail->Subject = 'Temporary password for your EngJoy account';
    $mail->Body = "
        <h2>Hello!</h2>
        <p>You have requested to reset your password at <strong>EngJoy</strong>.</p>
        <p>Your temporary password is: <strong style='font-size: 24px;'>$otp</strong></p>
        <p>Please use this password to log in, and don't forget to change it in your account settings after logging in.</p>
        <hr>
        <small>EngJoy Team – Vocabulary is Power 💪</small>
    ";

    $mail->send();
    echo json_encode(["success" => true, "message" => "A temporary password has been sent to your email."]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Failed to send email: " . $mail->ErrorInfo]);
}
