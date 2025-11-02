<?php
/**
 * ABI Contact Form API
 * Secure backend with validation, sanitization, and rate limiting
 * Version: 2.0.0 - Security Hardened
 */

// Load configuration
$config = [];
if (file_exists(__DIR__ . '/config.php')) {
    $config = require __DIR__ . '/config.php';
}

// Start session for CSRF protection
session_start([
    'cookie_httponly' => true,
    'cookie_secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
    'cookie_samesite' => 'Strict'
]);

// Security Headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Permissions-Policy: geolocation=(), microphone=(), camera=()');
header('Content-Type: application/json; charset=utf-8');

// CORS Headers - Load from config
$allowed_origins = $config['api']['allowed_origins'] ?? ['http://localhost', 'https://yourdomain.com'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
    header('Access-Control-Allow-Credentials: true');
}

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuration - Use config.php or fallback to defaults
define('RATE_LIMIT_MAX_ATTEMPTS', $config['security']['rate_limit']['max_attempts'] ?? 5);
define('RATE_LIMIT_WINDOW', $config['security']['rate_limit']['window'] ?? 3600);
define('MIN_TIME_BETWEEN_SUBMISSIONS', $config['security']['rate_limit']['min_time'] ?? 10);
define('MAX_INPUT_LENGTH', 1000);
define('LOG_FILE', $config['logging']['security_file'] ?? __DIR__ . '/logs/security.log');
define('RATE_LIMIT_DIR', __DIR__ . '/logs/rate_limits/');

// Email configuration from config.php
define('RECIPIENT_EMAIL', $config['mail']['to'] ?? 'contact@bumikarya.co.id');
define('EMAIL_FROM', $config['mail']['from']['address'] ?? 'noreply@bumikarya.co.id');
define('EMAIL_FROM_NAME', $config['mail']['from']['name'] ?? 'ABI Contact Form');

// Ensure rate limit directory exists
if (!is_dir(RATE_LIMIT_DIR)) {
    mkdir(RATE_LIMIT_DIR, 0750, true);
}

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
 * Get rate limit file path based on IP and User-Agent
 */
function getRateLimitFile($ip, $user_agent) {
    $identifier = md5($ip . '|' . $user_agent);
    return RATE_LIMIT_DIR . 'rate_' . $identifier . '.json';
}

/**
 * Rate Limiting - Filesystem-based (IP + User-Agent keyed)
 */
function checkRateLimit() {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
    $rate_file = getRateLimitFile($ip, $user_agent);
    
    $now = time();
    $attempts = [];
    
    // Read existing attempts
    if (file_exists($rate_file)) {
        $content = file_get_contents($rate_file);
        $attempts = json_decode($content, true) ?? [];
        
        // Clean old attempts outside the time window
        $attempts = array_filter($attempts, function($timestamp) use ($now) {
            return ($now - $timestamp) < RATE_LIMIT_WINDOW;
        });
    }
    
    // Check if rate limit exceeded
    if (count($attempts) >= RATE_LIMIT_MAX_ATTEMPTS) {
        logSecurity('Rate limit exceeded', [
            'ip' => $ip,
            'user_agent' => $user_agent,
            'attempts' => count($attempts)
        ]);
        return false;
    }
    
    // Check minimum time between submissions
    if (!empty($attempts)) {
        $last_submission = max($attempts);
        if (($now - $last_submission) < MIN_TIME_BETWEEN_SUBMISSIONS) {
            logSecurity('Minimum time between submissions not met', [
                'ip' => $ip,
                'time_since_last' => $now - $last_submission
            ]);
            return false;
        }
    }
    
    // Add current attempt
    $attempts[] = $now;
    
    // Save to file
    file_put_contents($rate_file, json_encode($attempts), LOCK_EX);
    
    return true;
}

/**
 * Canonical Server-Side Input Validation (replaces client-side sanitization)
 */
function validateInputCanonical($data, $rules) {
    $errors = [];
    $sanitized = [];
    
    foreach ($rules as $field => $rule) {
        $value = $data[$field] ?? '';
        
        // Remove NULL bytes
        $value = str_replace(chr(0), '', $value);
        
        // Trim whitespace
        $value = trim($value);
        
        // Required check
        if (isset($rule['required']) && $rule['required'] && empty($value)) {
            $errors[$field] = $rule['label'] . ' is required';
            continue;
        }
        
        if (empty($value)) {
            $sanitized[$field] = '';
            continue;
        }
        
        // Length check
        if (isset($rule['minLength']) && mb_strlen($value) < $rule['minLength']) {
            $errors[$field] = $rule['label'] . ' must be at least ' . $rule['minLength'] . ' characters';
        }
        
        if (isset($rule['maxLength']) && mb_strlen($value) > $rule['maxLength']) {
            $errors[$field] = $rule['label'] . ' must not exceed ' . $rule['maxLength'] . ' characters';
        }
        
        // Type-specific validation and sanitization
        switch ($rule['type']) {
            case 'email':
                $value = filter_var($value, FILTER_SANITIZE_EMAIL);
                if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    $errors[$field] = 'Please enter a valid email address';
                }
                break;
                
            case 'phone':
                // Allow only digits, spaces, +, -, (, )
                $value = preg_replace('/[^0-9+\-\s\(\)]/', '', $value);
                if (!preg_match('/^[\d\s\-\+\(\)]{10,15}$/', $value)) {
                    $errors[$field] = 'Please enter a valid phone number';
                }
                break;
                
            case 'name':
                // Allow only letters, spaces, hyphens, apostrophes
                $value = preg_replace('/[^A-Za-z\s\-\']/', '', $value);
                if (!preg_match('/^[A-Za-z\s\-\']{2,50}$/', $value)) {
                    $errors[$field] = 'Please enter a valid ' . strtolower($rule['label']);
                }
                break;
                
            default:
                // HTML escape for text fields
                $value = htmlspecialchars($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        }
        
        $sanitized[$field] = $value;
    }
    
    return ['errors' => $errors, 'sanitized' => $sanitized];
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
        '/<script/i',
        '/javascript:/i',
        '/onerror=/i',
        '/onclick=/i',
        '/\b(viagra|cialis|casino|poker|loan|mortgage)\b/i',
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
 * Enhanced Security Logging with Anomaly Detection
 */
function logSecurity($message, $data = []) {
    $log_dir = dirname(LOG_FILE);
    if (!is_dir($log_dir)) {
        mkdir($log_dir, 0750, true);
    }
    
    $timestamp = date('Y-m-d H:i:s');
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
    $request_method = $_SERVER['REQUEST_METHOD'] ?? 'unknown';
    $request_uri = $_SERVER['REQUEST_URI'] ?? 'unknown';
    
    $log_entry = sprintf(
        "[%s] IP: %s | Method: %s | URI: %s | Message: %s | User-Agent: %s | Data: %s\n",
        $timestamp,
        $ip,
        $request_method,
        $request_uri,
        $message,
        $user_agent,
        json_encode($data)
    );
    
    error_log($log_entry, 3, LOG_FILE);
    
    // Anomaly detection - check for repeated failures
    static $failure_counts = [];
    $failure_key = $ip . '|' . $message;
    
    if (strpos($message, 'failed') !== false || 
        strpos($message, 'Rate limit') !== false ||
        strpos($message, 'Honeypot') !== false) {
        
        $failure_counts[$failure_key] = ($failure_counts[$failure_key] ?? 0) + 1;
        
        // Alert if multiple failures from same IP
        if ($failure_counts[$failure_key] >= 3) {
            $alert_log = $log_dir . '/alerts.log';
            $alert_entry = sprintf(
                "[%s] ALERT: Multiple failures detected | IP: %s | Pattern: %s | Count: %d\n",
                $timestamp,
                $ip,
                $message,
                $failure_counts[$failure_key]
            );
            error_log($alert_entry, 3, $alert_log);
        }
    }
}

/**
 * Send Email with Server-Side Sanitized Data Only
 */
function sendEmail($sanitized_data) {
    $to = RECIPIENT_EMAIL;
    $subject = 'New Contact Form Submission from ABI Website';
    
    // All data is already sanitized by validateInputCanonical
    // Double-check HTML escaping for email template
    $safe_data = [
        'firstName' => htmlspecialchars($sanitized_data['firstName'], ENT_QUOTES | ENT_HTML5, 'UTF-8'),
        'lastName' => htmlspecialchars($sanitized_data['lastName'], ENT_QUOTES | ENT_HTML5, 'UTF-8'),
        'email' => htmlspecialchars($sanitized_data['email'], ENT_QUOTES | ENT_HTML5, 'UTF-8'),
        'phone' => htmlspecialchars($sanitized_data['phone'], ENT_QUOTES | ENT_HTML5, 'UTF-8'),
        'message' => nl2br(htmlspecialchars($sanitized_data['message'], ENT_QUOTES | ENT_HTML5, 'UTF-8'))
    ];
    
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
                    <div class='value'>{$safe_data['firstName']} {$safe_data['lastName']}</div>
                </div>
                <div class='field'>
                    <div class='label'>Email:</div>
                    <div class='value'>{$safe_data['email']}</div>
                </div>
                <div class='field'>
                    <div class='label'>Phone:</div>
                    <div class='value'>{$safe_data['phone']}</div>
                </div>
                <div class='field'>
                    <div class='label'>Message:</div>
                    <div class='value'>{$safe_data['message']}</div>
                </div>
                <div class='field'>
                    <div class='label'>Submitted:</div>
                    <div class='value'>" . date('Y-m-d H:i:s') . "</div>
                </div>
                <div class='field'>
                    <div class='label'>IP Address:</div>
                    <div class='value'>" . htmlspecialchars($_SERVER['REMOTE_ADDR'] ?? 'unknown', ENT_QUOTES | ENT_HTML5, 'UTF-8') . "</div>
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
        'Reply-To: ' . $safe_data['email'],
        'X-Mailer: PHP/' . phpversion()
    ];
    
    return mail($to, $subject, $message, implode("\r\n", $headers));
}

// Handle GET requests for CSRF token
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Ensure JSON content type
    header('Content-Type: application/json; charset=utf-8');
    $token = generateCSRFToken();
    echo json_encode(['csrf_token' => $token], JSON_UNESCAPED_SLASHES);
    logSecurity('CSRF token requested', ['ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown']);
    exit();
}

// Only allow POST requests for form submissions
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
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
        logSecurity('CSRF token validation failed', ['ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown']);
        http_response_code(403);
        echo json_encode(['error' => 'Invalid security token. Please refresh the page.']);
        exit();
    }
    
    // Check rate limiting
    if (!checkRateLimit()) {
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
    
    // Validate and sanitize input (server-side canonical validation)
    $validation_result = validateInputCanonical($input, $rules);
    
    if (!empty($validation_result['errors'])) {
        http_response_code(400);
        echo json_encode(['errors' => $validation_result['errors']]);
        exit();
    }
    
    // Use sanitized data
    $sanitized_data = $validation_result['sanitized'];
    
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
    logSecurity('Error: ' . $e->getMessage(), ['ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown']);
    http_response_code(500);
    echo json_encode([
        'error' => 'An error occurred while processing your request. Please try again later.'
    ]);
}
?>
