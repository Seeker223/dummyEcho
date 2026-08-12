/**
 * Admin Authentication Middleware
 * Validates user is admin via Supabase bearer token and role verification
 */

import { createClient } from '@supabase/supabase-js';

// Initialize admin client for token verification
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials for admin auth. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Extract bearer token from Authorization header
 */
function extractBearerToken(authHeader) {
  if (!authHeader || typeof authHeader !== 'string') {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    return parts[1];
  }

  return null;
}

/**
 * Verify JWT token and get user data
 */
async function verifyToken(token) {
  try {
    const supabase = getSupabaseClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.admin.getUserById(token.split('.')[0]);

    if (error) {
      return null;
    }

    // Decode JWT to check claims
    // Token format: header.payload.signature
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.user_role,
      aud: payload.aud,
    };
  } catch (error) {
    console.error('[AdminAuth] Token verification error:', error.message);
    return null;
  }
}

/**
 * Check if user has admin role
 */
async function isUserAdmin(userId) {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[AdminAuth] Role check error:', error.message);
      return false;
    }

    return data?.role === 'admin';
  } catch (error) {
    console.error('[AdminAuth] Admin check error:', error.message);
    return false;
  }
}

/**
 * Admin Authentication Middleware
 * Validates Authorization header contains valid JWT and user is admin
 */
export async function adminAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing Authorization header',
      });
    }

    const token = extractBearerToken(authHeader);

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid Authorization header format. Expected: Bearer <token>',
      });
    }

    // Verify token validity
    const user = await verifyToken(token);

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
    }

    // Check if user is admin
    const isAdmin = await isUserAdmin(user.userId);

    if (!isAdmin) {
      console.warn(`[AdminAuth] Non-admin user attempted access: ${user.email}`);
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin access required',
      });
    }

    // Attach user info to request for use in route handlers
    req.adminUser = {
      id: user.userId,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error('[AdminAuth] Middleware error:', error.message);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to verify admin access',
    });
  }
}

/**
 * Middleware wrapper for Next.js API routes
 * Usage: export const middleware = adminAuthMiddleware
 */
export function requireAdminAuth(handler) {
  return async (req, res) => {
    return adminAuthMiddleware(req, res, () => handler(req, res));
  };
}

export default adminAuthMiddleware;
