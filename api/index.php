<?php
/** SPIDER admin API — single endpoint: api/index.php?action=... */
declare(strict_types=1);
require __DIR__ . '/config.php';

session_set_cookie_params(['httponly' => true, 'samesite' => 'Strict', 'secure' => !empty($_SERVER['HTTPS'])]);
session_start();
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function out($data, int $code = 200): never { http_response_code($code); echo json_encode($data, JSON_UNESCAPED_UNICODE); exit; }
function readJson(string $file, $default) { return is_file($file) ? (json_decode((string)file_get_contents($file), true) ?? $default) : $default; }
function writeJson(string $file, $data): bool {
    $tmp = $file . '.tmp';
    if (file_put_contents($tmp, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), LOCK_EX) === false) return false;
    return rename($tmp, $file);
}
function authed(): bool { return !empty($_SESSION['spider_admin']); }
function requireAuth(): void {
    if (!authed()) out(['ok' => false, 'error' => 'unauthorized'], 401);
    if (($_SERVER['HTTP_X_CSRF'] ?? '') !== ($_SESSION['csrf'] ?? '-')) out(['ok' => false, 'error' => 'csrf'], 403);
}
function body(): array { return json_decode((string)file_get_contents('php://input'), true) ?: []; }

$action = $_GET['action'] ?? '';
$adminFile = DATA_DIR . '/admin.json';

switch ($action) {
    case 'me':
        out(['ok' => true, 'authed' => authed(), 'csrf' => authed() ? $_SESSION['csrf'] : null]);

    case 'login':
        $b = body();
        $fails = $_SESSION['fails'] ?? 0;
        if ($fails >= 5 && time() - ($_SESSION['fail_at'] ?? 0) < 300) out(['ok' => false, 'error' => 'locked'], 429);
        $stored = readJson($adminFile, []);
        $user = $stored['user'] ?? ADMIN_USER;
        if (empty($stored['hash']) && ADMIN_PASSWORD === 'change-me') out(['ok' => false, 'error' => 'default_password'], 403);
        $valid = hash_equals($user, (string)($b['user'] ?? '')) && (
            !empty($stored['hash']) ? password_verify((string)($b['pass'] ?? ''), $stored['hash'])
                                    : hash_equals(ADMIN_PASSWORD, (string)($b['pass'] ?? '')));
        if (!$valid) { $_SESSION['fails'] = $fails + 1; $_SESSION['fail_at'] = time(); usleep(400000); out(['ok' => false, 'error' => 'invalid'], 401); }
        session_regenerate_id(true);
        $_SESSION = ['spider_admin' => true, 'csrf' => bin2hex(random_bytes(16))];
        out(['ok' => true, 'csrf' => $_SESSION['csrf']]);

    case 'logout':
        $_SESSION = []; session_destroy(); out(['ok' => true]);

    case 'save':
        requireAuth();
        $b = body();
        if (!is_array($b['content'] ?? null)) out(['ok' => false, 'error' => 'invalid'], 422);
        $file = DATA_DIR . '/content.json';
        if (is_file($file)) @copy($file, DATA_DIR . '/content.backup.json');
        out(['ok' => writeJson($file, $b['content'])]);

    case 'upload':
        requireAuth();
        $f = $_FILES['file'] ?? null;
        if (!$f || $f['error'] !== UPLOAD_ERR_OK) out(['ok' => false, 'error' => 'upload'], 422);
        if ($f['size'] > 5 * 1024 * 1024) out(['ok' => false, 'error' => 'too_large'], 422);
        $types = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
        $mime = (new finfo(FILEINFO_MIME_TYPE))->file($f['tmp_name']);
        if (!isset($types[$mime])) out(['ok' => false, 'error' => 'type'], 422);
        $name = date('Ymd-His') . '-' . bin2hex(random_bytes(4)) . '.' . $types[$mime];
        if (!move_uploaded_file($f['tmp_name'], UPLOAD_DIR . '/' . $name)) out(['ok' => false, 'error' => 'move'], 500);
        out(['ok' => true, 'url' => 'uploads/' . $name]);

    case 'messages':
        requireAuth();
        out(['ok' => true, 'messages' => array_reverse(readJson(DATA_DIR . '/messages.json', []))]);

    case 'message-update':
        requireAuth();
        $b = body(); $msgs = readJson(DATA_DIR . '/messages.json', []);
        foreach ($msgs as $i => $m) {
            if (($m['id'] ?? '') !== ($b['id'] ?? null)) continue;
            if (!empty($b['delete'])) array_splice($msgs, $i, 1); else $msgs[$i]['read'] = (bool)($b['read'] ?? true);
            break;
        }
        out(['ok' => writeJson(DATA_DIR . '/messages.json', array_values($msgs))]);

    case 'password':
        requireAuth();
        $b = body();
        $new = (string)($b['pass'] ?? '');
        if (mb_strlen($new) < 10) out(['ok' => false, 'error' => 'weak'], 422);
        $user = trim((string)($b['user'] ?? '')) ?: ADMIN_USER;
        out(['ok' => writeJson($adminFile, ['user' => $user, 'hash' => password_hash($new, PASSWORD_DEFAULT)])]);

    default:
        out(['ok' => false, 'error' => 'unknown_action'], 404);
}
