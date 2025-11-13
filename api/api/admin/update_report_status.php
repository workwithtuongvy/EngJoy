<?php
require_once "../common/cors_header.php";
require_once "../common/db_module.php";
require_once "../common/mail_config.php";
require '../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$link = null;
taoKetNoi($link);

$response = ['success' => false, 'message' => ''];

try {
    if (!isset($_POST['report_id'], $_POST['report_status'])) {
        throw new Exception("Missing required information.");
    }

    $report_id = (int)$_POST['report_id'];
    $report_status = (int)$_POST['report_status'];

    if (!in_array($report_status, [0, 1, 2])) {
        throw new Exception("Invalid status value.");
    }

    // Update report status
    $update = "UPDATE ReportedSet SET report_status = ? WHERE report_id = ?";
    $stmt = $link->prepare($update);
    $stmt->bind_param("ii", $report_status, $report_id);
    if (!$stmt->execute()) {
        throw new Exception("Failed to update report status.");
    }

    // If accepted, send email to owner
    if ($report_status === 1) {
        $sql = "SELECT r.reason, ws.title AS wordset_title, u.email AS owner_email
                FROM ReportedSet r
                JOIN WordSet ws ON r.word_set_id = ws.word_set_id
                JOIN User u ON ws.user_id = u.user_id
                WHERE r.report_id = ?";
        $stmtInfo = $link->prepare($sql);
        $stmtInfo->bind_param("i", $report_id);
        $stmtInfo->execute();
        $stmtInfo->bind_result($reason, $title, $ownerEmail);
        if ($stmtInfo->fetch()) {
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
                $mail->addAddress($ownerEmail);
                $mail->isHTML(true);
                $mail->Subject = 'Your vocabulary set has been removed';
                $mail->Body = "
                    <h2>Hello,</h2>
                    <p>We would like to inform you that your vocabulary set <strong>\"$title\"</strong> has been <span style='color: red;'><strong>removed</strong></span> due to a violation of our community standards.</p>
                    <p><strong>Reported reason:</strong> $reason</p>
                    <p>If you believe this was a mistake, please contact our support team.</p>
                    <hr>
                    <small>EngJoy Team – Vocabulary is Power 💪</small>
                ";
                $mail->send();
            } catch (Exception $e) {
                error_log("Failed to send email to owner: " . $mail->ErrorInfo);
            }
        }
    }

    $response['success'] = true;
    $response['message'] = "Report status updated successfully.";

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);
