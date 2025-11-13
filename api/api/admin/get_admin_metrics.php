<?php
require_once "../common/cors_header.php";
require_once "../common/db_module.php";

$link = null;
taoKetNoi($link);

$response = [
    'new_player' => 0,
    'avg_play_time' => 0,
    'pending_reports' => 0,
    'total_wordset' => 0,
    'wordset_created_today' => 0,
];

// 1. Số người chơi mới (trong hôm nay)
$query1 = "SELECT COUNT(*) FROM User WHERE DATE(registration_date) = CURDATE()";
$result1 = chayTruyVanTraVeDL($link, $query1);
$response['new_player'] = (int)mysqli_fetch_array($result1)[0];

// 2. Thời gian chơi trung bình (giây)
$query2 = "SELECT AVG(play_duration) FROM GameSession";
$result2 = chayTruyVanTraVeDL($link, $query2);
$response['avg_play_time'] = (int)mysqli_fetch_array($result2)[0];

// 3. Số báo cáo đang chờ xử lý (report_status = 0)
$query3 = "SELECT COUNT(*) FROM ReportedSet WHERE report_status = 0";
$result3 = chayTruyVanTraVeDL($link, $query3);
$response['pending_reports'] = (int)mysqli_fetch_array($result3)[0];

// 4. Tổng số WordSet
$query4 = "SELECT COUNT(*) FROM WordSet";
$result4 = chayTruyVanTraVeDL($link, $query4);
$response['total_wordset'] = (int)mysqli_fetch_array($result4)[0];

// 5. Số WordSet được tạo hôm nay
$query5 = "SELECT COUNT(*) FROM WordSet WHERE DATE(created_date) = CURDATE()";
$result5 = chayTruyVanTraVeDL($link, $query5);
$response['wordset_created_today'] = (int)mysqli_fetch_array($result5)[0];

echo json_encode($response, JSON_UNESCAPED_UNICODE);
?>
