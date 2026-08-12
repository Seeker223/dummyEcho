/**
 * Input Sanitization Utility
 * Sanitizes user input to prevent XSS and injection attacks
 */

/**
 * Sanitize string input
 * - Removes leading/trailing whitespace
 * - Removes dangerous characters and tags
 * - Escapes HTML entities
 */
export function sanitizeString(input) {
  if (typeof input !== 'string') {
    return '';
  }

  // Trim whitespace
  let sanitized = input.trim();

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Escape HTML entities
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  return sanitized;
}

/**
 * Sanitize email input
 * - Converts to lowercase
 * - Removes dangerous characters
 * - Validates basic email format
 */
export function sanitizeEmail(input) {
  if (typeof input !== 'string') {
    return '';
  }

  const email = input.trim().toLowerCase();

  // Remove any HTML/script tags
  const sanitized = email.replace(/<[^>]*>/g, '');

  // Basic email validation (used for sanitization, not strict validation)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(sanitized)) {
    return '';
  }

  return sanitized;
}

/**
 * Sanitize name input
 * - Allows alphanumeric, spaces, hyphens, apostrophes
 * - Removes special characters and potential injection attempts
 */
export function sanitizeName(input) {
  if (typeof input !== 'string') {
    return '';
  }

  let sanitized = input.trim();

  // Remove leading/trailing spaces
  sanitized = sanitized.replace(/^\s+|\s+$/g, '');

  // Reduce multiple spaces to single space
  sanitized = sanitized.replace(/\s+/g, ' ');

  // Allow only: letters, numbers, spaces, hyphens, apostrophes
  sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-']/g, '');

  // Remove consecutive special characters
  sanitized = sanitized.replace(/[\-']{2,}/g, '-');

  return sanitized.trim();
}

/**
 * Sanitize phone number
 * - Removes all non-digit and non-symbol characters
 * - Allows: digits, +, -, (), spaces
 */
export function sanitizePhoneNumber(input) {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove anything except digits, +, -, (), spaces
  const sanitized = input.replace(/[^\d\+\-\(\)\s]/g, '');

  return sanitized.trim();
}

/**
 * Sanitize URL
 * - Ensures URL is properly formatted
 * - Prevents javascript: and data: protocols
 */
export function sanitizeUrl(input) {
  if (typeof input !== 'string') {
    return '';
  }

  const trimmed = input.trim();

  // Block dangerous protocols
  if (trimmed.match(/^(javascript|data|vbscript):/i)) {
    return '';
  }

  try {
    const url = new URL(trimmed);
    // Only allow http and https
    if (!['http:', 'https:'].includes(url.protocol)) {
      return '';
    }
    return url.toString();
  } catch {
    // If not a valid URL, return empty
    return '';
  }
}

/**
 * Sanitize textarea/rich text input
 * - Removes script tags and event handlers
 * - Keeps basic HTML but escapes dangerous content
 */
export function sanitizeRichText(input) {
  if (typeof input !== 'string') {
    return '';
  }

  let sanitized = input;

  // Remove script tags and content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*['"][^'"]*['"]/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove iframe tags
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

  // Remove style tags
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  return sanitized.trim();
}

/**
 * Sanitize object (recursively sanitizes all string values)
 */
export function sanitizeObject(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  const sanitized = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Batch sanitize common form fields
 */
export function sanitizeFormData(formData) {
  return {
    ...formData,
    firstName: sanitizeName(formData.firstName || ''),
    lastName: sanitizeName(formData.lastName || ''),
    email: sanitizeEmail(formData.email || ''),
    phone: sanitizePhoneNumber(formData.phone || ''),
    specialization: sanitizeName(formData.specialization || ''),
    licenseNumber: sanitizeString(formData.licenseNumber || ''),
    notes: sanitizeRichText(formData.notes || ''),
  };
}

export default {
  sanitizeString,
  sanitizeEmail,
  sanitizeName,
  sanitizePhoneNumber,
  sanitizeUrl,
  sanitizeRichText,
  sanitizeObject,
  sanitizeFormData,
};
