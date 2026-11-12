<?php
/**
 * GESOI Backend API (PHP 8.x + PDO MySQL)
 * Drop-in replacement untuk backend/server.py pada Hostinger Web Hosting (non-VPS).
 */

declare(strict_types=1);

date_default_timezone_set('UTC');

// 1. Muat konfigurasi (prioritas: di luar public_html -> di dalam api/config.php -> env)
$externalConfig = dirname(__DIR__, 2) . '/gesoi_config.php';
$localConfig = __DIR__ . '/config.php';
if (is_file($externalConfig)) {
    $config = require $externalConfig;
} elseif (is_file($localConfig)) {
    $config = require $localConfig;
} else {
    $config = [
        'DB_HOST'        => getenv('DB_HOST') ?: 'localhost',
        'DB_NAME'        => getenv('DB_NAME') ?: '',
        'DB_USER'        => getenv('DB_USER') ?: '',
        'DB_PASS'        => getenv('DB_PASS') ?: '',
        'JWT_SECRET'     => getenv('JWT_SECRET') ?: 'gesoi-default-secret-change-me',
        'ADMIN_EMAIL'    => getenv('ADMIN_EMAIL') ?: 'admin@gesoi.or.id',
        'ADMIN_PASSWORD' => getenv('ADMIN_PASSWORD') ?: 'ChangeMe123!',
        'CORS_ORIGINS'   => getenv('CORS_ORIGINS') ?: '*',
    ];
}

// 2. CORS Headers & Preflight
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = array_map('trim', explode(',', (string)($config['CORS_ORIGINS'] ?? '*')));
if (in_array('*', $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . ($origin ?: '*'));
} elseif ($origin && in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 3. Helper Functions
function json_response(mixed $data, int $status = 200): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function read_json_body(): array {
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }
    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        json_response(['detail' => 'Invalid JSON body'], 422);
    }
    return $decoded;
}

function uuid_v4(): string {
    $data = random_bytes(16);
    $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
    $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

function now_iso(): string {
    return gmdate('Y-m-d\TH:i:s\Z');
}

function b64url_encode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function b64url_decode(string $data): string {
    $remainder = strlen($data) % 4;
    if ($remainder) {
        $data .= str_repeat('=', 4 - $remainder);
    }
    return (string)base64_decode(strtr($data, '-_', '+/'));
}

function create_access_token(string $email, string $secret): string {
    $header = b64url_encode((string)json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload = b64url_encode((string)json_encode([
        'sub'   => $email,
        'email' => $email,
        'exp'   => time() + 86400,
        'type'  => 'access',
    ]));
    $sig = b64url_encode(hash_hmac('sha256', "$header.$payload", $secret, true));
    return "$header.$payload.$sig";
}

function verify_jwt(string $token, string $secret): array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        json_response(['detail' => 'Invalid token'], 401);
    }
    [$h64, $p64, $s64] = $parts;
    $expectedSig = b64url_encode(hash_hmac('sha256', "$h64.$p64", $secret, true));
    if (!hash_equals($expectedSig, $s64)) {
        json_response(['detail' => 'Invalid token'], 401);
    }
    $payload = json_decode(b64url_decode($p64), true);
    if (!is_array($payload)) {
        json_response(['detail' => 'Invalid token'], 401);
    }
    if (isset($payload['exp']) && time() >= (int)$payload['exp']) {
        json_response(['detail' => 'Token expired'], 401);
    }
    if (($payload['type'] ?? '') !== 'access') {
        json_response(['detail' => 'Invalid token type'], 401);
    }
    return $payload;
}

function get_auth_header(): string {
    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        return (string)$_SERVER['HTTP_AUTHORIZATION'];
    }
    if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        return (string)$_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    if (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        foreach ($headers as $k => $v) {
            if (strtolower((string)$k) === 'authorization') {
                return (string)$v;
            }
        }
    }
    return '';
}

function get_db(array $config): PDO {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }
    $dsn = sprintf(
        'mysql:host=%s;dbname=%s;charset=utf8mb4',
        $config['DB_HOST'] ?? 'localhost',
        $config['DB_NAME'] ?? ''
    );
    try {
        $pdo = new PDO($dsn, (string)($config['DB_USER'] ?? ''), (string)($config['DB_PASS'] ?? ''), [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    } catch (PDOException $e) {
        json_response(['detail' => 'Koneksi database MySQL gagal. Periksa api/config.php.'], 500);
    }
    return $pdo;
}

function ensure_schema_and_admin(PDO $pdo, array $config): void {
    $schemaFile = dirname(__DIR__, 2) . '/hostinger/schema.sql';
    // Buat tabel otomatis jika tabel users belum ada
    try {
        $pdo->query('SELECT 1 FROM `users` LIMIT 1');
    } catch (PDOException) {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `users` (
              `email` VARCHAR(190) NOT NULL PRIMARY KEY,
              `password_hash` VARCHAR(255) NOT NULL,
              `name` VARCHAR(100) NOT NULL DEFAULT 'Admin GESOI',
              `role` VARCHAR(30) NOT NULL DEFAULT 'admin',
              `created_at` VARCHAR(40) NOT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            CREATE TABLE IF NOT EXISTS `login_attempts` (
              `identifier` VARCHAR(190) NOT NULL PRIMARY KEY,
              `count` INT NOT NULL DEFAULT 0,
              `last_attempt` VARCHAR(40) NOT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            CREATE TABLE IF NOT EXISTS `contacts` (
              `id` CHAR(36) NOT NULL PRIMARY KEY,
              `name` VARCHAR(200) NOT NULL,
              `email` VARCHAR(190) NOT NULL,
              `organization` VARCHAR(200) DEFAULT NULL,
              `interest` VARCHAR(50) NOT NULL,
              `message` TEXT DEFAULT NULL,
              `created_at` VARCHAR(40) NOT NULL,
              KEY `idx_contacts_created_at` (`created_at`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            CREATE TABLE IF NOT EXISTS `orders` (
              `id` CHAR(36) NOT NULL PRIMARY KEY,
              `publication_title` VARCHAR(255) NOT NULL,
              `price` VARCHAR(50) NOT NULL,
              `name` VARCHAR(200) NOT NULL,
              `email` VARCHAR(190) NOT NULL,
              `phone` VARCHAR(50) NOT NULL,
              `organization` VARCHAR(200) DEFAULT NULL,
              `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
              `created_at` VARCHAR(40) NOT NULL,
              KEY `idx_orders_created_at` (`created_at`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            CREATE TABLE IF NOT EXISTS `site_content` (
              `id` VARCHAR(50) NOT NULL PRIMARY KEY,
              `data` LONGTEXT NOT NULL,
              `updated_at` VARCHAR(40) NOT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            CREATE TABLE IF NOT EXISTS `files` (
              `id` CHAR(36) NOT NULL PRIMARY KEY,
              `storage_path` VARCHAR(255) NOT NULL UNIQUE,
              `original_filename` VARCHAR(255) NOT NULL,
              `content_type` VARCHAR(100) DEFAULT NULL,
              `size` BIGINT NOT NULL DEFAULT 0,
              `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
              `created_at` VARCHAR(40) NOT NULL,
              KEY `idx_files_deleted_created` (`is_deleted`, `created_at`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            CREATE TABLE IF NOT EXISTS `analytics` (
              `id` CHAR(36) NOT NULL PRIMARY KEY,
              `type` VARCHAR(20) NOT NULL,
              `name` VARCHAR(60) DEFAULT NULL,
              `visitor_id` VARCHAR(64) NOT NULL,
              `lang` VARCHAR(5) DEFAULT NULL,
              `device` VARCHAR(10) DEFAULT NULL,
              `referrer` VARCHAR(200) DEFAULT NULL,
              `date` CHAR(10) NOT NULL,
              `created_at` VARCHAR(40) NOT NULL,
              KEY `idx_analytics_date_type` (`date`, `type`),
              KEY `idx_analytics_visitor` (`visitor_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
    }

    $adminEmail = strtolower(trim((string)($config['ADMIN_EMAIL'] ?? '')));
    $adminPass = (string)($config['ADMIN_PASSWORD'] ?? '');
    if ($adminEmail === '' || $adminPass === '') {
        return;
    }
    $stmt = $pdo->prepare('SELECT email, password_hash FROM `users` WHERE email = ? LIMIT 1');
    $stmt->execute([$adminEmail]);
    $existing = $stmt->fetch();
    if (!$existing) {
        $ins = $pdo->prepare('INSERT INTO `users` (email, password_hash, name, role, created_at) VALUES (?, ?, ?, ?, ?)');
        $ins->execute([
            $adminEmail,
            password_hash($adminPass, PASSWORD_BCRYPT),
            'Admin GESOI',
            'admin',
            now_iso(),
        ]);
    } elseif (!password_verify($adminPass, (string)$existing['password_hash'])) {
        $upd = $pdo->prepare('UPDATE `users` SET password_hash = ? WHERE email = ?');
        $upd->execute([password_hash($adminPass, PASSWORD_BCRYPT), $adminEmail]);
    }
}

function get_current_admin(PDO $pdo, array $config): array {
    $token = $_COOKIE['access_token'] ?? '';
    if ($token === '') {
        $authHeader = get_auth_header();
        if (str_starts_with($authHeader, 'Bearer ')) {
            $token = substr($authHeader, 7);
        }
    }
    if ($token === '') {
        json_response(['detail' => 'Not authenticated'], 401);
    }
    $payload = verify_jwt($token, (string)$config['JWT_SECRET']);
    $stmt = $pdo->prepare('SELECT email, name FROM `users` WHERE email = ? LIMIT 1');
    $stmt->execute([(string)($payload['email'] ?? '')]);
    $user = $stmt->fetch();
    if (!$user) {
        json_response(['detail' => 'User not found'], 401);
    }
    return [
        'email' => $user['email'],
        'name'  => $user['name'] ?: 'Admin',
    ];
}

// 4. Parse Route & Method
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$uriPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$route = preg_replace('#^/api(?:/index\.php)?#', '', $uriPath);
$route = '/' . ltrim((string)$route, '/');
if ($route !== '/') {
    $route = rtrim($route, '/');
}

// Root check (tanpa perlu koneksi DB)
if ($method === 'GET' && $route === '/') {
    json_response(['message' => 'GESOI API']);
}

$pdo = get_db($config);

// --- POST /api/auth/login ---
if ($method === 'POST' && $route === '/auth/login') {
    ensure_schema_and_admin($pdo, $config);
    $body = read_json_body();
    $email = strtolower(trim((string)($body['email'] ?? '')));
    $password = (string)($body['password'] ?? '');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
        json_response(['detail' => 'Email atau password tidak valid'], 422);
    }

    $stmtAtt = $pdo->prepare('SELECT count, last_attempt FROM `login_attempts` WHERE identifier = ? LIMIT 1');
    $stmtAtt->execute([$email]);
    $att = $stmtAtt->fetch();
    if ($att && (int)$att['count'] >= 5) {
        $lastTs = strtotime((string)$att['last_attempt']) ?: 0;
        if ((time() - $lastTs) < 900) {
            json_response(['detail' => 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.'], 429);
        }
        $pdo->prepare('DELETE FROM `login_attempts` WHERE identifier = ?')->execute([$email]);
    }

    $stmtUser = $pdo->prepare('SELECT email, password_hash, name FROM `users` WHERE email = ? LIMIT 1');
    $stmtUser->execute([$email]);
    $user = $stmtUser->fetch();

    if (!$user || !password_verify($password, (string)$user['password_hash'])) {
        $nowIso = now_iso();
        $stmtUpsert = $pdo->prepare("
            INSERT INTO `login_attempts` (identifier, count, last_attempt)
            VALUES (?, 1, ?)
            ON DUPLICATE KEY UPDATE count = count + 1, last_attempt = VALUES(last_attempt)
        ");
        $stmtUpsert->execute([$email, $nowIso]);
        json_response(['detail' => 'Email atau password salah'], 401);
    }

    $pdo->prepare('DELETE FROM `login_attempts` WHERE identifier = ?')->execute([$email]);
    $token = create_access_token((string)$user['email'], (string)$config['JWT_SECRET']);
    $isSecure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');

    setcookie('access_token', $token, [
        'expires'  => time() + 86400,
        'path'     => '/',
        'secure'   => $isSecure,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);

    json_response([
        'email'        => $user['email'],
        'name'         => $user['name'] ?: 'Admin',
        'access_token' => $token,
    ]);
}

// --- POST /api/auth/logout ---
if ($method === 'POST' && $route === '/auth/logout') {
    setcookie('access_token', '', [
        'expires'  => time() - 3600,
        'path'     => '/',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    json_response(['message' => 'Logged out']);
}

// --- GET /api/auth/me ---
if ($method === 'GET' && $route === '/auth/me') {
    $admin = get_current_admin($pdo, $config);
    json_response($admin);
}

// --- POST /api/contact (Publik) ---
if ($method === 'POST' && $route === '/contact') {
    $body = read_json_body();
    $name = trim((string)($body['name'] ?? ''));
    $email = trim((string)($body['email'] ?? ''));
    $interest = trim((string)($body['interest'] ?? ''));
    $organization = isset($body['organization']) && trim((string)$body['organization']) !== ''
        ? trim((string)$body['organization'])
        : null;
    $message = isset($body['message']) && trim((string)$body['message']) !== ''
        ? trim((string)$body['message'])
        : null;

    if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || $interest === '') {
        json_response(['detail' => 'Nama, email valid, dan minat wajib diisi'], 422);
    }

    $id = uuid_v4();
    $createdAt = now_iso();
    $stmt = $pdo->prepare('
        INSERT INTO `contacts` (id, name, email, organization, interest, message, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ');
    $stmt->execute([$id, $name, $email, $organization, $interest, $message, $createdAt]);

    json_response([
        'id'           => $id,
        'name'         => $name,
        'email'        => $email,
        'organization' => $organization,
        'interest'     => $interest,
        'message'      => $message,
        'created_at'   => $createdAt,
    ]);
}

// --- GET /api/contact & GET /api/admin/contacts (Admin) ---
if ($method === 'GET' && ($route === '/contact' || $route === '/admin/contacts')) {
    get_current_admin($pdo, $config);
    $stmt = $pdo->query('SELECT id, name, email, organization, interest, message, created_at FROM `contacts` ORDER BY created_at DESC LIMIT 1000');
    json_response($stmt->fetchAll());
}

// --- POST /api/orders (Publik) ---
if ($method === 'POST' && $route === '/orders') {
    $body = read_json_body();
    $pubTitle = trim((string)($body['publication_title'] ?? ''));
    $price = trim((string)($body['price'] ?? ''));
    $name = trim((string)($body['name'] ?? ''));
    $email = trim((string)($body['email'] ?? ''));
    $phone = trim((string)($body['phone'] ?? ''));
    $organization = isset($body['organization']) && trim((string)$body['organization']) !== ''
        ? trim((string)$body['organization'])
        : null;

    if ($pubTitle === '' || $price === '' || $name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || $phone === '') {
        json_response(['detail' => 'Data pemesanan tidak lengkap atau email tidak valid'], 422);
    }

    $id = uuid_v4();
    $status = 'pending';
    $createdAt = now_iso();
    $stmt = $pdo->prepare('
        INSERT INTO `orders` (id, publication_title, price, name, email, phone, organization, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ');
    $stmt->execute([$id, $pubTitle, $price, $name, $email, $phone, $organization, $status, $createdAt]);

    json_response([
        'id'                => $id,
        'publication_title' => $pubTitle,
        'price'             => $price,
        'name'              => $name,
        'email'             => $email,
        'phone'             => $phone,
        'organization'      => $organization,
        'status'            => $status,
        'created_at'        => $createdAt,
    ]);
}

// --- GET /api/admin/orders (Admin) ---
if ($method === 'GET' && $route === '/admin/orders') {
    get_current_admin($pdo, $config);
    $stmt = $pdo->query('SELECT id, publication_title, price, name, email, phone, organization, status, created_at FROM `orders` ORDER BY created_at DESC LIMIT 1000');
    json_response($stmt->fetchAll());
}

// --- PATCH /api/admin/orders/{order_id} (Admin) ---
if (($method === 'PATCH' || $method === 'POST') && preg_match('#^/admin/orders/([^/]+)$#', $route, $m)) {
    get_current_admin($pdo, $config);
    $orderId = $m[1];
    $body = read_json_body();
    $status = (string)($body['status'] ?? '');
    if (!in_array($status, ['pending', 'contacted', 'completed'], true)) {
        json_response(['detail' => 'Status tidak valid'], 400);
    }
    $chk = $pdo->prepare('SELECT id FROM `orders` WHERE id = ? LIMIT 1');
    $chk->execute([$orderId]);
    if (!$chk->fetch()) {
        json_response(['detail' => 'Pesanan tidak ditemukan'], 404);
    }
    $upd = $pdo->prepare('UPDATE `orders` SET status = ? WHERE id = ?');
    $upd->execute([$status, $orderId]);
    json_response(['ok' => true]);
}

// --- GET /api/content (Publik) ---
if ($method === 'GET' && $route === '/content') {
    try {
        $stmt = $pdo->prepare("SELECT data FROM `site_content` WHERE id = 'content' LIMIT 1");
        $stmt->execute();
        $row = $stmt->fetch();
        if (!$row || empty($row['data'])) {
            json_response(new stdClass());
        }
        $decoded = json_decode((string)$row['data'], true);
        if (!is_array($decoded)) {
            json_response(new stdClass());
        }
        unset($decoded['_id']);
        json_response($decoded ?: new stdClass());
    } catch (PDOException) {
        json_response(new stdClass());
    }
}

// --- PUT /api/admin/content (Admin) ---
if (($method === 'PUT' || $method === 'POST') && $route === '/admin/content') {
    get_current_admin($pdo, $config);
    $payload = read_json_body();
    unset($payload['_id']);
    $json = (string)json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    $now = now_iso();
    $stmt = $pdo->prepare("
        INSERT INTO `site_content` (id, data, updated_at)
        VALUES ('content', ?, ?)
        ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = VALUES(updated_at)
    ");
    $stmt->execute([$json, $now]);
    json_response(['ok' => true]);
}

// --- DELETE /api/admin/content (Admin) ---
if ($method === 'DELETE' && $route === '/admin/content') {
    get_current_admin($pdo, $config);
    $pdo->exec("DELETE FROM `site_content` WHERE id = 'content'");
    json_response(['ok' => true]);
}

// --- POST /api/admin/upload (Admin) ---
if ($method === 'POST' && $route === '/admin/upload') {
    get_current_admin($pdo, $config);
    if (empty($_FILES['file']) || !is_array($_FILES['file'])) {
        json_response(['detail' => 'File tidak ditemukan dalam request'], 400);
    }
    $file = $_FILES['file'];
    if (($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
        json_response(['detail' => 'Gagal mengunggah file (periksa ukuran maksimal upload di PHP)'], 400);
    }
    $origName = (string)($file['name'] ?? 'file');
    $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
    $allowedImages = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    $allowedVideos = ['mp4', 'webm', 'mov'];

    if (!in_array($ext, $allowedImages, true) && !in_array($ext, $allowedVideos, true)) {
        json_response(['detail' => 'Format tidak didukung. Gunakan JPG, PNG, GIF, WEBP, MP4, WEBM, atau MOV.'], 400);
    }

    $isVideo = in_array($ext, $allowedVideos, true);
    $maxSize = $isVideo ? 200 * 1024 * 1024 : 8 * 1024 * 1024;
    $size = (int)($file['size'] ?? 0);
    if ($size > $maxSize) {
        json_response([
            'detail' => 'Ukuran file maksimal ' . ($isVideo ? '200MB untuk video' : '8MB untuk gambar') . '.',
        ], 400);
    }

    $uploadDir = __DIR__ . '/uploads';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    $uploadHtaccess = $uploadDir . '/.htaccess';
    if (!is_file($uploadHtaccess)) {
        @file_put_contents(
            $uploadHtaccess,
            "<FilesMatch \"\\.(php|php5|php7|php8|phtml|phar|pl|py|cgi|sh)$\">\n"
            . "  <IfModule mod_authz_core.c>\n"
            . "    Require all denied\n"
            . "  </IfModule>\n"
            . "  <IfModule !mod_authz_core.c>\n"
            . "    Order allow,deny\n"
            . "    Deny from all\n"
            . "  </IfModule>\n"
            . "</FilesMatch>\n"
            . "Options -Indexes\n"
        );
    }

    $fileUuid = uuid_v4();
    $fileName = "$fileUuid.$ext";
    $storagePath = "gesoi/uploads/$fileName";
    $destPath = "$uploadDir/$fileName";

    if (!move_uploaded_file((string)$file['tmp_name'], $destPath)) {
        json_response(['detail' => 'Gagal menyimpan file di server'], 500);
    }

    $defaultMime = $isVideo ? 'video/mp4' : 'image/jpeg';
    $contentType = !empty($file['type']) ? (string)$file['type'] : $defaultMime;
    $id = uuid_v4();
    $createdAt = now_iso();

    $stmt = $pdo->prepare('
        INSERT INTO `files` (id, storage_path, original_filename, content_type, size, is_deleted, created_at)
        VALUES (?, ?, ?, ?, ?, 0, ?)
    ');
    $stmt->execute([$id, $storagePath, $origName, $contentType, $size, $createdAt]);

    json_response([
        'url'  => "/api/files/$storagePath",
        'path' => $storagePath,
    ]);
}

// --- GET /api/videos (Publik: daftar video di Galeri Media) ---
if ($method === 'GET' && $route === '/videos') {
    try {
        $stmt = $pdo->query("
            SELECT id, storage_path, original_filename, content_type, size, created_at
            FROM `files`
            WHERE is_deleted = 0
              AND (
                content_type LIKE 'video/%'
                OR LOWER(storage_path) LIKE '%.mp4'
                OR LOWER(storage_path) LIKE '%.webm'
                OR LOWER(storage_path) LIKE '%.mov'
              )
            ORDER BY created_at DESC
            LIMIT 200
        ");
        $rows = $stmt->fetchAll();
        foreach ($rows as &$r) {
            $r['size'] = (int)$r['size'];
            $r['url'] = '/api/files/' . $r['storage_path'];
        }
        unset($r);
        json_response($rows);
    } catch (PDOException) {
        json_response([]);
    }
}

// --- GET /api/admin/files (Admin) ---
if ($method === 'GET' && $route === '/admin/files') {
    get_current_admin($pdo, $config);
    $stmt = $pdo->query('
        SELECT id, storage_path, original_filename, content_type, size, is_deleted, created_at
        FROM `files`
        WHERE is_deleted = 0
        ORDER BY created_at DESC
        LIMIT 1000
    ');
    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) {
        $r['size'] = (int)$r['size'];
        $r['is_deleted'] = (bool)$r['is_deleted'];
    }
    unset($r);
    json_response($rows);
}

// --- DELETE /api/admin/files/{file_id} (Admin) ---
if ($method === 'DELETE' && preg_match('#^/admin/files/([^/]+)$#', $route, $m)) {
    get_current_admin($pdo, $config);
    $fileId = $m[1];
    $chk = $pdo->prepare('SELECT id FROM `files` WHERE id = ? LIMIT 1');
    $chk->execute([$fileId]);
    if (!$chk->fetch()) {
        json_response(['detail' => 'File tidak ditemukan'], 404);
    }
    $upd = $pdo->prepare('UPDATE `files` SET is_deleted = 1 WHERE id = ?');
    $upd->execute([$fileId]);
    json_response(['ok' => true]);
}

// --- GET /api/files/{path} (Publik) ---
if ($method === 'GET' && preg_match('#^/files/(.+)$#', $route, $m)) {
    $storagePath = $m[1];
    $stmt = $pdo->prepare('SELECT storage_path, content_type FROM `files` WHERE storage_path = ? AND is_deleted = 0 LIMIT 1');
    $stmt->execute([$storagePath]);
    $record = $stmt->fetch();
    if (!$record) {
        json_response(['detail' => 'File not found'], 404);
    }

    $uploadDir = realpath(__DIR__ . '/uploads');
    $candidate = __DIR__ . '/uploads/' . basename($storagePath);
    $realFile = realpath($candidate);

    if (!$uploadDir || !$realFile || !str_starts_with($realFile, $uploadDir) || !is_file($realFile)) {
        json_response(['detail' => 'File not found on disk'], 404);
    }

    $mime = $record['content_type'] ?: 'application/octet-stream';
    $fileSize = filesize($realFile);
    header('Content-Type: ' . $mime);
    header('Cache-Control: public, max-age=86400');
    header('Accept-Ranges: bytes');

    // Dukungan HTTP Range untuk streaming video MP4/WebM
    if (isset($_SERVER['HTTP_RANGE']) && preg_match('/bytes=(\d+)-(\d*)/', (string)$_SERVER['HTTP_RANGE'], $rm)) {
        $start = (int)$rm[1];
        $end = $rm[2] !== '' ? (int)$rm[2] : ($fileSize - 1);
        $end = min($end, $fileSize - 1);
        if ($start <= $end && $start < $fileSize) {
            $length = $end - $start + 1;
            http_response_code(206);
            header("Content-Range: bytes $start-$end/$fileSize");
            header("Content-Length: $length");
            $fp = fopen($realFile, 'rb');
            if ($fp) {
                fseek($fp, $start);
                echo fread($fp, $length);
                fclose($fp);
            }
            exit;
        }
    }

    header('Content-Length: ' . (string)$fileSize);
    readfile($realFile);
    exit;
}

// --- POST /api/track (Publik) ---
if ($method === 'POST' && $route === '/track') {
    $body = read_json_body();
    if (!isset($body['visitor_id']) || trim((string)$body['visitor_id']) === '') {
        json_response(['detail' => 'visitor_id wajib diisi'], 422);
    }
    $type = (string)($body['type'] ?? '');
    if (!in_array($type, ['pageview', 'event'], true)) {
        json_response(['detail' => 'Tipe tidak valid'], 400);
    }

    $name = isset($body['name']) ? substr(trim((string)$body['name']), 0, 60) : '';
    $name = $name !== '' ? $name : null;
    $visitorId = substr((string)$body['visitor_id'], 0, 64);
    $lang = in_array($body['lang'] ?? null, ['id', 'en'], true) ? (string)$body['lang'] : null;
    $device = in_array($body['device'] ?? null, ['mobile', 'desktop'], true) ? (string)$body['device'] : null;
    $referrer = isset($body['referrer']) ? substr(trim((string)$body['referrer']), 0, 200) : '';
    $referrer = $referrer !== '' ? $referrer : null;

    $date = gmdate('Y-m-d');
    $createdAt = now_iso();

    $stmt = $pdo->prepare('
        INSERT INTO `analytics` (id, type, name, visitor_id, lang, device, referrer, date, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ');
    $stmt->execute([uuid_v4(), $type, $name, $visitorId, $lang, $device, $referrer, $date, $createdAt]);
    json_response(['ok' => true]);
}

// --- GET /api/admin/analytics (Admin) ---
if ($method === 'GET' && $route === '/admin/analytics') {
    get_current_admin($pdo, $config);
    $days = isset($_GET['days']) ? (int)$_GET['days'] : 30;
    $days = max(1, min($days, 90));
    $now = time();
    $start = gmdate('Y-m-d', $now - ($days - 1) * 86400);

    // 1. Daily pageviews & unique visitors per day
    $stmtDaily = $pdo->prepare("
        SELECT date, COUNT(*) AS views, COUNT(DISTINCT visitor_id) AS uniques
        FROM `analytics`
        WHERE date >= ? AND type = 'pageview'
        GROUP BY date
    ");
    $stmtDaily->execute([$start]);
    $byDate = [];
    foreach ($stmtDaily->fetchAll() as $r) {
        $byDate[$r['date']] = [
            'views'   => (int)$r['views'],
            'uniques' => (int)$r['uniques'],
        ];
    }

    $daily = [];
    $totalViews = 0;
    for ($i = 0; $i < $days; $i++) {
        $key = gmdate('Y-m-d', $now - ($days - 1 - $i) * 86400);
        $row = $byDate[$key] ?? ['views' => 0, 'uniques' => 0];
        $daily[] = [
            'date'    => $key,
            'views'   => $row['views'],
            'uniques' => $row['uniques'],
        ];
        $totalViews += $row['views'];
    }

    // 2. Total unique visitors across range (pageview)
    $stmtUniq = $pdo->prepare("
        SELECT COUNT(DISTINCT visitor_id) AS n
        FROM `analytics`
        WHERE date >= ? AND type = 'pageview'
    ");
    $stmtUniq->execute([$start]);
    $totalUniques = (int)($stmtUniq->fetch()['n'] ?? 0);

    // 3. Devices (pageview only)
    $stmtDev = $pdo->prepare("
        SELECT device, COUNT(*) AS count
        FROM `analytics`
        WHERE date >= ? AND type = 'pageview' AND device IS NOT NULL
        GROUP BY device
    ");
    $stmtDev->execute([$start]);
    $devices = [];
    foreach ($stmtDev->fetchAll() as $r) {
        $devices[$r['device']] = (int)$r['count'];
    }

    // 4. Langs (includes pageview + event by design)
    $stmtLang = $pdo->prepare("
        SELECT lang, COUNT(*) AS count
        FROM `analytics`
        WHERE date >= ? AND lang IS NOT NULL
        GROUP BY lang
    ");
    $stmtLang->execute([$start]);
    $langs = [];
    foreach ($stmtLang->fetchAll() as $r) {
        $langs[$r['lang']] = (int)$r['count'];
    }

    // 5. Top referrers (pageview only, limit 10)
    $stmtRef = $pdo->prepare("
        SELECT referrer AS source, COUNT(*) AS count
        FROM `analytics`
        WHERE date >= ? AND type = 'pageview' AND referrer IS NOT NULL
        GROUP BY referrer
        ORDER BY count DESC
        LIMIT 10
    ");
    $stmtRef->execute([$start]);
    $referrers = [];
    foreach ($stmtRef->fetchAll() as $r) {
        $referrers[] = [
            'source' => $r['source'],
            'count'  => (int)$r['count'],
        ];
    }

    // 6. Events count by name
    $stmtEvt = $pdo->prepare("
        SELECT name, COUNT(*) AS count
        FROM `analytics`
        WHERE date >= ? AND type = 'event' AND name IS NOT NULL
        GROUP BY name
    ");
    $stmtEvt->execute([$start]);
    $events = [];
    foreach ($stmtEvt->fetchAll() as $r) {
        $events[$r['name']] = (int)$r['count'];
    }

    json_response([
        'days'      => $days,
        'totals'    => [
            'views'   => $totalViews,
            'uniques' => $totalUniques,
        ],
        'daily'     => $daily,
        'devices'   => (object)$devices,
        'langs'     => (object)$langs,
        'referrers' => $referrers,
        'events'    => (object)$events,
    ]);
}

json_response(['detail' => 'Endpoint not found: ' . $route], 404);
