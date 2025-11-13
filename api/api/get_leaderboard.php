<?php
require_once "common/cors_header.php";
require_once "common/db_module.php";

$link = null;
taoKetNoi($link);

$response = [];

$query = "
  SELECT 
    lb.user_id,
    u.full_name,
    lb.word_set_quantity
  FROM Leaderboard lb
  JOIN User u ON lb.user_id = u.user_id
  ORDER BY lb.word_set_quantity DESC
";

$result = chayTruyVanTraVeDL($link, $query);

$rank = 1;
while ($row = mysqli_fetch_assoc($result)) {
    $response[] = [
        'user_id' => (int)$row['user_id'],
        'rank' => $rank++,
        'fullname' => $row['full_name'],
        'wordsets_count' => (int)$row['word_set_quantity']
    ];
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);
?>
