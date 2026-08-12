/**
 * Rate Limiting Middleware
 * Implements per-IP rate limiting using in-memory store
 * For production with high traffic, migrate to Redis/Upstash
 */

const requestCounts = {};
const resetTimes = {};

/**
 * Create a rate limiter with configurable limits
 * @param {number} maxRequests - Max requests allowed in time window
 * @param {number} windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 * @returns {Function} Middleware function
 */
export function createRateLimiter(maxRequests = 5, windowMs = 60000) {
  return (req, res, next) => {
    // Get client IP
    const clientIp =
      (req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'].split(',')[0].trim()) ||
      req.socket.remoteAddress ||
      'unknown';

    const key = `${clientIp}:${req.url}`;
    const now = Date.now();

    // Initialize or reset the count if time window has passed
    if (!resetTimes[key] || now > resetTimes[key]) {
      requestCounts[key] = 0;
      resetTimes[key] = now + windowMs;
    }

    requestCounts[key]++;

    // Set rate limit headers
    const remainingRequests = Math.max(0, maxRequests - requestCounts[key]);
    const resetTime = resetTimes[key];

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remainingRequests);
    res.setHeader('X-RateLimit-Reset', new Date(resetTime).toISOString());

    // Check if exceeded
    if (requestCounts[key] > maxRequests) {
      const retryAfter = Math.ceil((resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter);

      return res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
        retryAfter,
      });
    }

    next();
  };
}

/**
 * Pre-configured rate limiters for common endpoints
 */
export const rateLimiters = {
  // Signup: 5 requests per minute per IP
  signup: createRateLimiter(5, 60000),

  // Login: 10 requests per minute per IP
  login: createRateLimiter(10, 60000),

  // Email verification: 3 requests per minute per IP
  emailVerification: createRateLimiter(3, 60000),

  // Password reset: 3 requests per minute per IP
  passwordReset: createRateLimiter(3, 60000),

  // General API: 30 requests per minute per IP
  general: createRateLimiter(30, 60000),
};

/**
 * Clean up old entries periodically (every 5 minutes)
 * Prevents memory leaks in long-running processes
 */
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;

  for (const key in resetTimes) {
    if (resetTimes[key] < now) {
      delete requestCounts[key];
      delete resetTimes[key];
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`[RateLimit] Cleaned up ${cleaned} expired entries`);
  }
}, 5 * 60 * 1000);

export default createRateLimiter;
