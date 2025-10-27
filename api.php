<?php
/**
 * ABI Contact Form API
 * Secure backend with validation, sanitization, and rate limiting
 * Version: 1.0.0
 */

// Start session for CSRF protection
session_start();

// Security Headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
header('Content-Security-Policy: default-src \'self\'');
header('Content-Type: application/json; charset=utf-8');

// CORS Headers (adjust domain as needed)
$allowed_origins = ['http://localhost', 'https://yourdomain.com'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
    header('Access-Control-Allow-Credentials: true');
}

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Configuration
define('RATE_LIMIT_MAX_ATTEMPTS', 5); // Max submissions per time window
define('RATE_LIMIT_WINDOW', 3600); // 1 hour in seconds
define('MIN_TIME_BETWEEN_SUBMISSIONS', 10); // Seconds (anti-spam)
define('MAX_INPUT_LENGTH', 1000);
define('LOG_FILE', __DIR__ . '/logs/security.log');

// Email configuration (use environment variables in production)
define('RECIPIENT_EMAIL', 'contact@bumikarya.co.id');
define('EMAIL_FROM', 'noreply@bumikarya.co.id');
define('EMAIL_FROM_NAME', 'ABI Contact Form');

/**
 * Generate CSRF Token
 */
function generateCSRFToken() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        $_SESSION['csrf_token_time'] = time();
    }
    return $_SESSION['csrf_token'];
}

/**
 * Validate CSRF Token
 */
function validateCSRFToken($token) {
    if (empty($_SESSION['csrf_token']) || empty($token)) {
        return false;
    }
    
    // Check if token has expired (1 hour)
    if (time() - ($_SESSION['csrf_token_time'] ?? 0) > 3600) {
        unset($_SESSION['csrf_token']);
        unset($_SESSION['csrf_token_time']);
        return false;
    }
    
    return hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Rate Limiting
 */
function checkRateLimit() {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $rate_key = 'rate_limit_' . md5($ip);
    
    if (!isset($_SESSION[$rate_key])) {
        $_SESSION[$rate_key] = [];
    }
    
    // Clean old attempts
    $_SESSION[$rate_key] = array_filter(
        $_SESSION[$rate_key],
        function($timestamp) {
            return (time() - $timestamp) < RATE_LIMIT_WINDOW;
        }
    );
    
    // Check if rate limit exceeded
    if (count($_SESSION[$rate_key]) >= RATE_LIMIT_MAX_ATTEMPTS) {
        return false;
    }
    
    // Check minimum time between submissions
    if (!empty($_SESSION[$rate_key])) {
        $last_submission = end($_SESSION[$rate_key]);
        if ((time() - $last_submission) < MIN_TIME_BETWEEN_SUBMISSIONS) {
            return false;
        }
    }
    
    // Add current attempt
    $_SESSION[$rate_key][] = time();
    return true;
}

/**
 * Sanitize Input
 */
function sanitizeInput($data, $type = 'text') {
    // Remove any NULL bytes
    $data = str_replace(chr(0), '', $data);
    
    // Trim whitespace
    $data = trim($data);
    
    // Type-specific sanitization
    switch ($type) {
        case 'email':
            return filter_var($data, FILTER_SANITIZE_EMAIL);
        case 'phone':
            return preg_replace('/[^0-9+\-\s\(\)]/', '', $data);
        case 'name':
            return preg_replace('/[^A-Za-z\s\-\']/', '', $data);
        default:
            return htmlspecialchars($data, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }
}

/**
 * Validate Input
 */
function validateInput($data, $rules) {
    $errors = [];
    
    foreach ($rules as $field => $rule) {
        $value = $data[$field] ?? '';
        
        // Required check
        if (isset($rule['required']) && $rule['required'] && empty($value)) {
            $errors[$field] = $rule['label'] . ' is required';
            continue;
        }
        
        if (empty($value)) continue;
        
        // Length check
        if (isset($rule['minLength']) && mb_strlen($value) < $rule['minLength']) {
            $errors[$field] = $rule['label'] . ' must be at least ' . $rule['minLength'] . ' characters';
        }
        
        if (isset($rule['maxLength']) && mb_strlen($value) > $rule['maxLength']) {
            $errors[$field] = $rule['label'] . ' must not exceed ' . $rule['maxLength'] . ' characters';
        }
        
        // Type-specific validation
        switch ($rule['type']) {
            case 'email':
                if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    $errors[$field] = 'Please enter a valid email address';
                }
                break;
            case 'phone':
                if (!preg_match('/^[\d\s\-\+\(\)]{10,15}$/', $value)) {
                    $errors[$field] = 'Please enter a valid phone number';
                }
                break;
            case 'name':
                if (!preg_match('/^[A-Za-z\s\-\']{2,50}$/', $value)) {
                    $errors[$field] = 'Please enter a valid ' . strtolower($rule['label']);
                }
                break;
        }
    }
    
    return $errors;
}

/**
 * Check for bot/spam indicators
 */
function checkForSpam($data) {
    // Honeypot check
    if (!empty($data['website'])) {
        logSecurity('Honeypot triggered', $data);
        return true;
    }
    
    // Check for suspicious patterns
    $suspicious_patterns = [
        '/\[url=/i',
        '/\[link=/i',
        '/<a href=/i',
        '/\b(viagra|cialis|casino|poker)\b/i',
        '/http.*http.*http/i' // Multiple URLs
    ];
    
    $message = $data['message'] ?? '';
    foreach ($suspicious_patterns as $pattern) {
        if (preg_match($pattern, $message)) {
            logSecurity('Spam pattern detected: ' . $pattern, $data);
            return true;
        }
    }
    
    return false;
}

/**
 * Security Logging
 */
function logSecurity($message, $data = []) {
    $log_dir = dirname(LOG_FILE);
    if (!is_dir($log_dir)) {
        mkdir($log_dir, 0755, true);
    }
    
    $timestamp = date('Y-m-d H:i:s');
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
    
    $log_entry = sprintf(
        "[%s] IP: %s | Message: %s | User-Agent: %s | Data: %s\n",
        $timestamp,
        $ip,
        $message,
        $user_agent,
        json_encode($data)
    );
    
    error_log($log_entry, 3, LOG_FILE);
}

/**
 * Send Email
 */
function sendEmail($data) {
    $to = RECIPIENT_EMAIL;
    $subject = 'New Contact Form Submission from ABI Website';
    
    $message = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1C3830; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #1C3830; }
            .value { margin-top: 5px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>New Contact Form Submission</h2>
            </div>
            <div class='content'>
                <div class='field'>
                    <div class='label'>Name:</div>
                    <div class='value'>" . htmlspecialchars($data['firstName'] . ' ' . $data['lastName']) . "</div>
                </div>
                <div class='field'>
                    <div class='label'>Email:</div>
                    <div class='value'>" . htmlspecialchars($data['email']) . "</div>
                </div>
                <div class='field'>
                    <div class='label'>Phone:</div>
                    <div class='value'>" . htmlspecialchars($data['phone']) . "</div>
                </div>
                <div class='field'>
                    <div class='label'>Message:</div>
                    <div class='value'>" . nl2br(htmlspecialchars($data['message'])) . "</div>
                </div>
                <div class='field'>
                    <div class='label'>Submitted:</div>
                    <div class='value'>" . date('Y-m-d H:i:s') . "</div>
                </div>
                <div class='field'>
                    <div class='label'>IP Address:</div>
                    <div class='value'>" . htmlspecialchars($_SERVER['REMOTE_ADDR']) . "</div>
                </div>
            </div>
        </div>
    </body>
    </html>
    ";
    
    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=utf-8',
        'From: ' . EMAIL_FROM_NAME . ' <' . EMAIL_FROM . '>',
        'Reply-To: ' . $data['email'],
        'X-Mailer: PHP/' . phpversion()
    ];
    
    return mail($to, $subject, $message, implode("\r\n", $headers));
}

// Main Processing
try {
    // Get JSON input
    $json = file_get_contents('php://input');
    $input = json_decode($json, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON data');
    }
    
    // Validate CSRF Token
    $csrf_token = $input['csrf_token'] ?? '';
    if (!validateCSRFToken($csrf_token)) {
        logSecurity('CSRF token validation failed', $input);
        http_response_code(403);
        echo json_encode(['error' => 'Invalid security token. Please refresh the page.']);
        exit();
    }
    
    // Check rate limiting
    if (!checkRateLimit()) {
        logSecurity('Rate limit exceeded', $input);
        http_response_code(429);
        echo json_encode(['error' => 'Too many requests. Please try again later.']);
        exit();
    }
    
    // Check for spam
    if (checkForSpam($input)) {
        http_response_code(400);
        echo json_encode(['error' => 'Your submission appears to be spam.']);
        exit();
    }
    
    // Define validation rules
    $rules = [
        'firstName' => [
            'label' => 'First Name',
            'type' => 'name',
            'required' => true,
            'minLength' => 2,
            'maxLength' => 50
        ],
        'lastName' => [
            'label' => 'Last Name',
            'type' => 'name',
            'required' => true,
            'minLength' => 2,
            'maxLength' => 50
        ],
        'email' => [
            'label' => 'Email',
            'type' => 'email',
            'required' => true,
            'maxLength' => 254
        ],
        'phone' => [
            'label' => 'Phone',
            'type' => 'phone',
            'required' => true,
            'minLength' => 10,
            'maxLength' => 15
        ],
        'message' => [
            'label' => 'Message',
            'type' => 'text',
            'required' => true,
            'minLength' => 10,
            'maxLength' => 1000
        ]
    ];
    
    // Validate input
    $errors = validateInput($input, $rules);
    
    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode(['errors' => $errors]);
        exit();
    }
    
    // Sanitize data
    $sanitized_data = [
        'firstName' => sanitizeInput($input['firstName'], 'name'),
        'lastName' => sanitizeInput($input['lastName'], 'name'),
        'email' => sanitizeInput($input['email'], 'email'),
        'phone' => sanitizeInput($input['phone'], 'phone'),
        'message' => sanitizeInput($input['message'], 'text')
    ];
    
    // Send email
    if (sendEmail($sanitized_data)) {
        // Log successful submission
        logSecurity('Form submitted successfully', [
            'email' => $sanitized_data['email'],
            'name' => $sanitized_data['firstName'] . ' ' . $sanitized_data['lastName']
        ]);
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Thank you for contacting us! We will get back to you soon.'
        ]);
    } else {
        throw new Exception('Failed to send email');
    }
    
} catch (Exception $e) {
    logSecurity('Error: ' . $e->getMessage(), $_POST ?? []);
    http_response_code(500);
    echo json_encode([
        'error' => 'An error occurred while processing your request. Please try again later.'
    ]);
}

// Generate new CSRF token for next request
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode(['csrf_token' => generateCSRFToken()]);
}
?>

