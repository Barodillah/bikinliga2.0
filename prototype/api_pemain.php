<?php
header("Content-Type: application/json; charset=UTF-8");

// Koneksi DB
$conn = mysqli_connect(
    "153.92.15.23",
    "u444914729_liga",
    "Alobas22",
    "u444914729_kompetisi"
);

if (!$conn) {
    http_response_code(500);
    echo json_encode([
        "status" => false,
        "message" => "Database connection failed"
    ]);
    exit;
}

// Ambil parameter q (optional)
$q = isset($_GET['q']) ? trim($_GET['q']) : "";

// Query dasar
if ($q !== "") {
    // Search by nama
    $stmt = $conn->prepare("
        SELECT id, nama, posisi, team, negara
        FROM db_player
        WHERE nama LIKE ?
        ORDER BY nama ASC
    ");
    $search = "%{$q}%";
    $stmt->bind_param("s", $search);
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    // Ambil semua data
    $sql = "
        SELECT id, nama, posisi, team, negara
        FROM db_player
        ORDER BY nama ASC
    ";
    $result = mysqli_query($conn, $sql);
}

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

// Output JSON
echo json_encode([
    "status" => true,
    "count" => count($data),
    "data" => $data
], JSON_PRETTY_PRINT);

$conn->close();
