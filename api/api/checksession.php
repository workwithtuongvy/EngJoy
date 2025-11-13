<?php
session_start();

$response = [
  'isLoggedIn' => false,
  'user_id' => null,
  'user_type' => null,
  'username' => null
];

if (isset($_SESSION['user_id'])) {
  $response['isLoggedIn'] = true;
  $response['user_id'] = $_SESSION['user_id'];
  $response['user_type'] = $_SESSION['user_type'];
  $response['username'] = $_SESSION['username'];
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode($response, JSON_UNESCAPED_UNICODE);
