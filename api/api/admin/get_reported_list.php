<?php
require_once "../common/cors_header.php";
require_once "../common/db_module.php";

$link = null;
taoKetNoi($link);

$response = [];

$query = "
  SELECT 
    r.report_id,
    r.word_set_id,
    ws.title AS wordset_title,
    r.report_status,
    r.reason,
    r.reported_date
  FROM ReportedSet r
  JOIN WordSet ws ON r.word_set_id = ws.word_set_id
  ORDER BY r.reported_date DESC
";

$result = chayTruyVanTraVeDL($link, $query);

while ($row = mysqli_fetch_assoc($result)) {
    $response[] = [
        'report_id' => (int)$row['report_id'],
        'word_set_id' => (int)$row['word_set_id'],
        'wordset_title' => $row['wordset_title'],
        'report_status' => (int)$row['report_status'],
        'reason' => $row['reason'],
        'reported_date' => $row['reported_date']
    ];
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);
?>
