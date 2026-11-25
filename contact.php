<?php
/** SPIDER — contact form endpoint: stores the request in the admin inbox and optionally emails it. */
declare(strict_types=1);
require __DIR__ . '/api/config.php';
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['ok' => false]); exit; }
$d = json_decode((string)file_get_contents('php://input'), true) ?: $_POST;
if (!empty($d['website'])) { echo json_encode(['ok' => true]); exit; } // honeypot

$c = fn($k, $max = 200) => mb_substr(trim(strip_tags((string)($d[$k] ?? ''))), 0, $max);
$msg = ['id' => bin2hex(random_bytes(6)), 'date' => date('c'), 'read' => false,
    'name' => $c('name'), 'company' => $c('company'), 'email' => $c('email'), 'phone' => $c('phone', 40),
    'type' => $c('type'), 'details' => $c('details', 5000)];
if ($msg['name'] === '' || !filter_var($msg['email'], FILTER_VALIDATE_EMAIL) || $msg['details'] === '') {
    http_response_code(422); echo json_encode(['ok' => false, 'error' => 'invalid']); exit;
}

$file = DATA_DIR . '/messages.json';
$fp = fopen($file, 'c+');
if (!$fp) { http_response_code(500); echo json_encode(['ok' => false]); exit; }
flock($fp, LOCK_EX);
$all = json_decode(stream_get_contents($fp) ?: '[]', true) ?: [];
$all[] = $msg;
ftruncate($fp, 0); rewind($fp);
fwrite($fp, json_encode($all, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
flock($fp, LOCK_UN); fclose($fp);

if (NOTIFY_EMAIL !== '') {
    $body = "الاسم: {$msg['name']}\nالشركة: {$msg['company']}\nالبريد: {$msg['email']}\nالهاتف: {$msg['phone']}\nنوع المشروع: {$msg['type']}\n\n{$msg['details']}";
    $email = str_replace(["\r", "\n"], '', $msg['email']);
    @mail(NOTIFY_EMAIL, '=?UTF-8?B?' . base64_encode('طلب مشروع جديد — ' . $msg['name']) . '?=', $body,
        "From: SPIDER Website <no-reply@" . preg_replace('/[^a-z0-9.\-]/i', '', $_SERVER['HTTP_HOST'] ?? 'localhost') . ">\r\nReply-To: $email\r\nContent-Type: text/plain; charset=UTF-8");
}
echo json_encode(['ok' => true]);
