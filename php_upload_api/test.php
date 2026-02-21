<?php
/**
 * Test endpoint - untuk verifikasi API sudah berjalan
 * GET https://cuma.click/bikinligaupload/test.php
 */

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");

$uploadDir = __DIR__ . '/uploads/logos/';
$dirExists = is_dir($uploadDir);
$dirWritable = $dirExists && is_writable($uploadDir);

// Count existing files
$fileCount = 0;
if ($dirExists) {
    $files = glob($uploadDir . '*.{jpg,png,gif,webp,svg}', GLOB_BRACE);
    $fileCount = $files ? count($files) : 0;
}

echo json_encode([
    'success' => true,
    'message' => 'BikinLiga Upload API is running!',
    'status' => [
        'php_version'    => PHP_VERSION,
        'upload_dir'     => $dirExists ? 'exists' : 'missing',
        'dir_writable'   => $dirWritable ? 'yes' : 'no',
        'max_upload'     => ini_get('upload_max_filesize'),
        'max_post'       => ini_get('post_max_size'),
        'total_files'    => $fileCount,
    ],
    'timestamp' => date('Y-m-d H:i:s T'),
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
