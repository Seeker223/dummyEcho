/**
 * CORS (Cross-Origin Resource Sharing) Middleware
 * Handles CORS headers and preflight requests
 */

/**
 * Get allowed origins based on environment
 */
function getAllowedOrigins() {
  const origins = [];

  // Always allow localhost for development
  origins.push('http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000');

  // Add environment-specified origins
  if (process.env.NEXT_PUBLIC_APP_URL) {
    origins.push(process.env.NEXT_PUBLIC_APP_URL);
  }

  if (process.env.CORS_ALLOWED_ORIGINS) {
    const envOrigins = process.env.CORS_ALLOWED_ORIGINS.split(',').map((o) => o.trim());
    origins.push(...envOrigins);
  }

  return origins;
}

/**
 * CORS Middleware
 * Handles CORS headers and preflight (OPTIONS) requests
 */
export function corsHandler(req, res, next) {
  const allowedOrigins = getAllowedOrigins();
  const origin = req.headers.origin;

  // Check if origin is allowed
  const isAllowedOrigin = allowedOrigins.includes(origin) || allowedOrigins.includes('*');

  if (isAllowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }

  // Set allowed methods
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');

  // Set allowed headers
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Admin-Token, X-API-Key'
  );

  // Allow credentials
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Cache preflight requests
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  next();
}

/**
 * Validate CORS origin
 * Use in API routes that need stricter CORS checking
 */
export function validateCorsOrigin(req) {
  const allowedOrigins = getAllowedOrigins();
  const origin = req.headers.origin;

  if (!origin) {
    return true; // Allow same-origin requests (no origin header)
  }

  return allowedOrigins.includes(origin) || allowedOrigins.includes('*');
}

export default corsHandler;
