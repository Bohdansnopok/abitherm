<?php
header('Content-Type: application/json; charset=utf-8');

// === config ===
$to_email = 'info@abitherm.de';
$subject_prefix = '[Kontaktformular ABITHERM] ';
$max_file_size = 5 * 1024 * 1024; // 5 MB
$allowed_ext = ['jpg','jpeg','png','pdf','doc','docx','xls','xlsx','gif'];

// === helper ===
function json_out($ok, $msg){
    echo json_encode(['success' => $ok, 'message' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}

// accept POST only
if($_SERVER['REQUEST_METHOD'] !== 'POST'){
    json_out(false, 'Invalid request method.');
}

// Simple server-side validation & sanitation
$company = isset($_POST['company']) ? trim($_POST['company']) : '';
if($company !== ''){
    // honeypot triggered
    json_out(false, 'Spam detected.');
}

$firstname = isset($_POST['firstname']) ? trim($_POST['firstname']) : '';
$lastname = isset($_POST['lastname']) ? trim($_POST['lastname']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
$gdpr = isset($_POST['gdpr']) ? $_POST['gdpr'] : '';

if(!$firstname || !$lastname || !$email || !$phone || !$gdpr){
    json_out(false, 'Bitte füllen Sie alle Pflichtfelder aus.');
}
if(!filter_var($email, FILTER_VALIDATE_EMAIL)){
    json_out(false, 'E-Mail-Adresse ist ungültig.');
}

// collect remaining optional fields
$street = isset($_POST['street']) ? trim($_POST['street']) : '';
$zip = isset($_POST['zip']) ? trim($_POST['zip']) : '';
$city = isset($_POST['city']) ? trim($_POST['city']) : '';
$mobile = isset($_POST['mobile']) ? trim($_POST['mobile']) : '';
$date = isset($_POST['date']) ? trim($_POST['date']) : '';
$time = isset($_POST['time']) ? trim($_POST['time']) : '';
$topic = isset($_POST['topic']) ? trim($_POST['topic']) : '';
$details = isset($_POST['details']) ? trim($_POST['details']) : '';
$title = isset($_POST['title']) ? trim($_POST['title']) : '';

// create message body (text)
$message_lines = [];
$message_lines[] = "Neue Anfrage vom Kontaktformular";
$message_lines[] = "---------------------------------";
$message_lines[] = "Name: $title $firstname $lastname";
$message_lines[] = "E-Mail: $email";
$message_lines[] = "Telefon: $phone";
if($mobile) $message_lines[] = "Handy: $mobile";
if($street || $zip || $city) $message_lines[] = "Adresse: $street / $zip $city";
if($date || $time) $message_lines[] = "Bevorzugte Zeit: $date $time";
if($topic) $message_lines[] = "Anliegen: $topic";
if($details) $message_lines[] = "Weitere Details: $details";
$message_lines[] = "IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
$message_lines[] = "Datum: " . date('Y-m-d H:i:s');

$body_text = implode("\r\n", $message_lines);

// prepare mail with possible attachment
$has_attachment = isset($_FILES['attachment']) && $_FILES['attachment']['error'] !== UPLOAD_ERR_NO_FILE;

$headers = [];
$from = $email;
$subject = $subject_prefix . 'Nachricht von ' . $firstname . ' ' . $lastname;

// If no attachment - simple mail
if(!$has_attachment){
    $headers[] = "From: " . $firstname . " " . $lastname . " <" . $email . ">";
    $headers[] = "Reply-To: " . $email;
    $headers[] = "Content-Type: text/plain; charset=utf-8";
    $ok = mail($to_email, $subject, $body_text, implode("\r\n", $headers));
    if($ok){
        json_out(true, 'Vielen Dank — Ihre Nachricht wurde gesendet.');
    } else {
        json_out(false, 'Fehler beim Senden der Nachricht (mail).');
    }
    exit;
}

// handle attachment: validate
$file = $_FILES['attachment'];
if($file['error'] !== UPLOAD_ERR_OK){
    json_out(false, 'Fehler beim Hochladen der Datei.');
}
if($file['size'] > $max_file_size){
    json_out(false, 'Die Datei ist zu groß (max 5 MB).');
}
$fname = $file['name'];
$fext = strtolower(pathinfo($fname, PATHINFO_EXTENSION));
if(!in_array($fext, $allowed_ext)){
    json_out(false, 'Ungültiger Dateityp.');
}
$tmp_path = $file['tmp_name'];
$file_content = file_get_contents($tmp_path);
$mime = mime_content_type($tmp_path) ?: 'application/octet-stream';
$attachment_encoded = chunk_split(base64_encode($file_content));

// Create a boundary
$boundary = md5(time());

// headers
$headers = "From: " . $firstname . " " . $lastname . " <" . $email . ">\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/mixed; boundary=\"".$boundary."\"\r\n";

// message
$body = "--".$boundary."\r\n";
$body .= "Content-Type: text/plain; charset=\"utf-8\"\r\n";
$body .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
$body .= $body_text . "\r\n\r\n";

// attachment part
$body .= "--".$boundary."\r\n";
$body .= "Content-Type: ".$mime."; name=\"".$fname."\"\r\n";
$body .= "Content-Transfer-Encoding: base64\r\n";
$body .= "Content-Disposition: attachment; filename=\"".$fname."\"\r\n\r\n";
$body .= $attachment_encoded . "\r\n\r\n";
$body .= "--".$boundary."--";

// send mail
$ok = mail($to_email, $subject, $body, $headers);
if($ok){
    json_out(true, 'Vielen Dank — Ihre Nachricht wurde gesendet.');
} else {
    json_out(false, 'Fehler beim Senden der Nachricht (mail).');
}
