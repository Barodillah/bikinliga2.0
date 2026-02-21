<?php
/**
 * BikinLiga Image Upload API
 * 
 * Deploy ke shared hosting di: cuma.click/bikinligaupload/
 * Endpoint: POST https://cuma.click/bikinligaupload/upload.php
 * 
 * Request:
 *   - Method: POST
 *   - Header: X-Upload-Key: <API_KEY>
 *   - Body: multipart/form-data { file: <image> }
 * 
 * Response:
 *   { "success": true, "url": "https://cuma.click/bikinligaupload/uploads/logos/xxxxx.png" }
 */

// ============================================================
// CONFIGURATION - Sesuaikan sebelum deploy
// ============================================================
define('API_KEY', 'bkl_upload_2024_s3cur3_k3y'); // Ganti dengan key yang lebih aman
define('MAX_FILE_SIZE', 2 * 1024 * 1024); // 2MB
define('UPLOAD_DIR', __DIR__ . '/uploads/logos/');
define('BASE_URL', 'https://cuma.click/bikinligaupload'); // Tanpa trailing slash

// Allowed CORS origins (tambahkan domain frontend Vercel)
$allowed_origins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://bikinliga.online',
    'https://www.bikinliga.online',
    'https://bikinliga.vercel.app',
    // Tambahkan domain Vercel yang benar di sini
];

// Allowed file types
$allowed_types = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/gif'  => 'gif',
    'image/webp' => 'webp',
    'image/svg+xml' => 'svg',
];

// ============================================================
// CORS HEADERS
// ============================================================
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // Fallback: allow all in development, restrict in production
    header("Access-Control-Allow-Origin: *");
}

header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Upload-Key");
header("Access-Control-Max-Age: 86400");
header("Content-Type: application/json; charset=utf-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================
function jsonResponse($success, $message, $data = [], $httpCode = 200) {
    http_response_code($httpCode);
    echo json_encode(array_merge([
        'success' => $success,
        'message' => $message,
    ], $data), JSON_UNESCAPED_SLASHES);
    exit;
}

function generateUniqueFilename($extension) {
    // Format: timestamp_randomhex.ext
    $timestamp = date('Ymd_His');
    $random = bin2hex(random_bytes(8));
    return "{$timestamp}_{$random}.{$extension}";
}

// ============================================================
// VALIDATION
// ============================================================

// 1. Method check
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method not allowed. Use POST.', [], 405);
}

// 2. API Key validation
$apiKey = $_SERVER['HTTP_X_UPLOAD_KEY'] ?? '';
if ($apiKey !== API_KEY) {
    jsonResponse(false, 'Unauthorized. Invalid API key.', [], 401);
}

// 3. File presence check
if (!isset($_FILES['file']) || $_FILES['file']['error'] === UPLOAD_ERR_NO_FILE) {
    jsonResponse(false, 'No file uploaded. Send file in "file" field.', [], 400);
}

$file = $_FILES['file'];

// 4. Upload error check
if ($file['error'] !== UPLOAD_ERR_OK) {
    $errorMessages = [
        UPLOAD_ERR_INI_SIZE   => 'File terlalu besar (server limit)',
        UPLOAD_ERR_FORM_SIZE  => 'File terlalu besar (form limit)',
        UPLOAD_ERR_PARTIAL    => 'File hanya ter-upload sebagian',
        UPLOAD_ERR_NO_TMP_DIR => 'Server error: missing temp directory',
        UPLOAD_ERR_CANT_WRITE => 'Server error: gagal menulis file',
        UPLOAD_ERR_EXTENSION  => 'Upload diblokir oleh extension',
    ];
    $msg = $errorMessages[$file['error']] ?? 'Upload error tidak diketahui';
    jsonResponse(false, $msg, [], 400);
}

// 5. File size check
if ($file['size'] > MAX_FILE_SIZE) {
    $maxMB = MAX_FILE_SIZE / (1024 * 1024);
    jsonResponse(false, "File terlalu besar. Maksimal {$maxMB}MB.", [], 400);
}

// 6. MIME type validation (double check with finfo)
$finfo = new finfo(FILEINFO_MIME_TYPE);
$detectedType = $finfo->file($file['tmp_name']);

if (!array_key_exists($detectedType, $allowed_types)) {
    jsonResponse(false, 'Tipe file tidak diizinkan. Gunakan JPG, PNG, GIF, WebP, atau SVG.', [], 400);
}

$extension = $allowed_types[$detectedType];

// ============================================================
// UPLOAD PROCESS
// ============================================================

// Create upload directory if not exists
if (!is_dir(UPLOAD_DIR)) {
    if (!mkdir(UPLOAD_DIR, 0755, true)) {
        jsonResponse(false, 'Server error: gagal membuat folder upload.', [], 500);
    }
}

// Generate unique filename
$filename = generateUniqueFilename($extension);
$destination = UPLOAD_DIR . $filename;

// Move uploaded file
if (!move_uploaded_file($file['tmp_name'], $destination)) {
    jsonResponse(false, 'Server error: gagal menyimpan file.', [], 500);
}

// Build public URL
$publicUrl = BASE_URL . '/uploads/logos/' . $filename;

// ============================================================
// SUCCESS RESPONSE
// ============================================================
jsonResponse(true, 'Upload berhasil!', [
    'url'      => $publicUrl,
    'filename' => $filename,
    'size'     => $file['size'],
    'type'     => $detectedType,
]);
