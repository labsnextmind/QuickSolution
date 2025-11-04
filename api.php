---

### 🧩 **api.php**
*(Kept for compatibility, but not required for Node version — this file just forwards API requests if needed.)*
```php
<?php
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);
    $question = urlencode($input['question']);

    $url = "https://api.affiliateplus.xyz/api/chatbot?message=$question";
    $response = file_get_contents($url);

    echo $response;
} else {
    echo json_encode(["error" => "Invalid Request"]);
}
?>