<?php
/**
 * ABI Website Configuration Example
 * 
 * Copy this file to config.php and update with your actual values
 * NEVER commit config.php to version control
 */

// Load environment variables from .env file
function loadEnv($path) {
    if (!file_exists($path)) {
        return;
    }
    
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        
        if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
            putenv(sprintf('%s=%s', $name, $value));
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
        }
    }
}

// Load .env file
loadEnv(__DIR__ . '/.env');

// Helper function to get environment variable
function env($key, $default = null) {
    $value = getenv($key);
    if ($value === false) {
        return $default;
    }
    
    // Convert string booleans
    switch (strtolower($value)) {
        case 'true':
        case '(true)':
            return true;
        case 'false':
        case '(false)':
            return false;
        case 'empty':
        case '(empty)':
            return '';
        case 'null':
        case '(null)':
            return null;
    }
    
    return $value;
}

// Configuration Array
return [
    
    // General Settings
    'app' => [
        'name' => env('APP_NAME', 'ABI Website'),
        'env' => env('APP_ENV', 'production'),
        'debug' => env('APP_DEBUG', false),
        'url' => env('APP_URL', 'https://yourdomain.com'),
    ],
    
    // Email Configuration
    'mail' => [
        'driver' => env('MAIL_DRIVER', 'smtp'),
        'host' => env('MAIL_HOST', 'smtp.gmail.com'),
        'port' => env('MAIL_PORT', 587),
        'username' => env('MAIL_USERNAME'),
        'password' => env('MAIL_PASSWORD'),
        'encryption' => env('MAIL_ENCRYPTION', 'tls'),
        'from' => [
            'address' => env('MAIL_FROM_ADDRESS', 'noreply@bumikarya.co.id'),
            'name' => env('MAIL_FROM_NAME', 'ABI Contact Form'),
        ],
        'to' => env('MAIL_TO_ADDRESS', 'contact@bumikarya.co.id'),
    ],
    
    // Security Settings
    'security' => [
        'csrf_secret' => env('CSRF_SECRET'),
        'rate_limit' => [
            'max_attempts' => env('RATE_LIMIT_MAX_ATTEMPTS', 5),
            'window' => env('RATE_LIMIT_WINDOW', 3600),
            'min_time' => env('RATE_LIMIT_MIN_TIME', 10),
        ],
        'session' => [
            'lifetime' => env('SESSION_LIFETIME', 120),
            'secure' => env('SESSION_SECURE_COOKIE', true),
            'httponly' => env('SESSION_HTTP_ONLY', true),
            'samesite' => env('SESSION_SAME_SITE', 'strict'),
        ],
    ],
    
    // API Configuration
    'api' => [
        'endpoint' => env('API_ENDPOINT', '/api.php'),
        'version' => env('API_VERSION', 'v1'),
        'allowed_origins' => explode(',', env('ALLOWED_ORIGINS', 'https://yourdomain.com')),
    ],
    
    // Database Configuration (for future use)
    'database' => [
        'connection' => env('DB_CONNECTION', 'mysql'),
        'host' => env('DB_HOST', '127.0.0.1'),
        'port' => env('DB_PORT', 3306),
        'database' => env('DB_DATABASE'),
        'username' => env('DB_USERNAME'),
        'password' => env('DB_PASSWORD'),
    ],
    
    // Logging Configuration
    'logging' => [
        'level' => env('LOG_LEVEL', 'warning'),
        'file' => env('LOG_FILE', __DIR__ . '/logs/application.log'),
        'security_file' => env('SECURITY_LOG_FILE', __DIR__ . '/logs/security.log'),
    ],
    
    // Third-party Services
    'services' => [
        'recaptcha' => [
            'site_key' => env('RECAPTCHA_SITE_KEY'),
            'secret_key' => env('RECAPTCHA_SECRET_KEY'),
        ],
        'analytics' => [
            'google_id' => env('GOOGLE_ANALYTICS_ID'),
        ],
    ],
    
    // Validation Rules
    'validation' => [
        'name' => [
            'min' => 2,
            'max' => 50,
            'pattern' => '/^[A-Za-z\s\-\']+$/',
        ],
        'email' => [
            'max' => 254,
        ],
        'phone' => [
            'min' => 10,
            'max' => 15,
            'pattern' => '/^[\d\s\-\+\(\)]+$/',
        ],
        'message' => [
            'min' => 10,
            'max' => 1000,
        ],
    ],
    
];

