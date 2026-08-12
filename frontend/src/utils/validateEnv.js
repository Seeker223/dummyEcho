/**
 * Environment Variable Validation
 * Ensures all required environment variables are configured
 */

/**
 * Required environment variables with descriptions
 */
const REQUIRED_ENV_VARS = {
  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: {
    description: 'Supabase project URL',
    example: 'https://xxxxxx.supabase.co',
    required: true,
  },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: {
    description: 'Supabase anonymous key for client-side auth',
    example: 'eyJ...',
    required: true,
  },
  SUPABASE_SERVICE_ROLE_KEY: {
    description: 'Supabase service role key for server-side operations',
    example: 'eyJ...',
    required: true,
    serverOnly: true,
  },

  // n8n Webhook Configuration
  N8N_SIGNUP_WEBHOOK_URL: {
    description: 'n8n webhook for user signup workflow',
    example: 'https://n8n.example.com/webhook/signup',
    required: true,
  },
  N8N_LOGIN_WEBHOOK_URL: {
    description: 'n8n webhook for user login workflow',
    example: 'https://n8n.example.com/webhook/login',
    required: true,
  },
  N8N_EMAIL_WEBHOOK_URL: {
    description: 'n8n webhook for email verification workflow',
    example: 'https://n8n.example.com/webhook/email',
    required: true,
  },
  N8N_PASSWORD_RESET_WEBHOOK_URL: {
    description: 'n8n webhook for password reset workflow',
    example: 'https://n8n.example.com/webhook/password-reset',
    required: true,
  },

  // LiveKit Configuration
  NEXT_PUBLIC_LIVEKIT_URL: {
    description: 'LiveKit web socket URL for secure video rooms',
    example: 'wss://livekit.example.com',
    required: true,
  },
  LIVEKIT_API_KEY: {
    description: 'LiveKit API key used to mint room tokens',
    example: 'your-livekit-api-key',
    required: true,
    serverOnly: true,
  },
  LIVEKIT_API_SECRET: {
    description: 'LiveKit API secret used to mint room tokens',
    example: 'your-livekit-api-secret',
    required: true,
    serverOnly: true,
  },

  // Application Configuration
  NEXT_PUBLIC_APP_URL: {
    description: 'Application URL for CORS and redirects',
    example: 'https://app.example.com',
    required: false,
  },

  // CORS Configuration
  CORS_ALLOWED_ORIGINS: {
    description: 'Comma-separated list of allowed CORS origins',
    example: 'https://app.example.com,https://admin.example.com',
    required: false,
  },

  // VAPI Configuration
  NEXT_PUBLIC_VAPI_PUBLIC_KEY: {
    description: 'VAPI public key for voice assistant',
    example: 'xxxxxx',
    required: false,
  },
  NEXT_PUBLIC_VAPI_ASSISTANT_ID: {
    description: 'VAPI assistant ID',
    example: 'xxxxxx',
    required: false,
  },

  // Sendgrid Configuration (optional for email)
  SENDGRID_API_KEY: {
    description: 'SendGrid API key for email delivery',
    example: 'SG.xxxxxx',
    required: false,
    serverOnly: true,
  },
};

/**
 * Validate all environment variables
 * Throws error if critical variables are missing
 */
export function validateEnvironment() {
  const errors = [];
  const warnings = [];
  const missing = [];

  for (const [key, config] of Object.entries(REQUIRED_ENV_VARS)) {
    const value = process.env[key];

    // Check if required variable is missing
    if (config.required && !value) {
      errors.push(`CRITICAL: Missing required environment variable: ${key}`);
      errors.push(`  Description: ${config.description}`);
      errors.push(`  Example: ${config.example}`);
      missing.push(key);
    }

    // Warn if optional but empty
    if (!config.required && !value) {
      warnings.push(`Optional variable ${key} not configured. Some features may not work.`);
    }
  }

  // Display results
  if (missing.length > 0) {
    console.error('\n===== ENVIRONMENT CONFIGURATION ERROR =====');
    console.error(`Missing ${missing.length} critical environment variable(s):\n`);
    errors.forEach((e) => console.error(e));
    console.error(
      '\nTo fix: Add these variables to your .env.local or deployment platform settings.\n'
    );
    throw new Error(`Environment validation failed: ${missing.length} critical variables missing`);
  }

  if (warnings.length > 0) {
    console.warn('\n===== ENVIRONMENT CONFIGURATION WARNINGS =====');
    warnings.forEach((w) => console.warn(`WARNING: ${w}`));
    console.warn('');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    missing,
  };
}

/**
 * Get environment variable with fallback
 * Safe retrieval with optional validation
 */
export function getEnvVar(key, defaultValue = undefined, required = false) {
  const value = process.env[key] || defaultValue;

  if (required && !value) {
    throw new Error(`Required environment variable not found: ${key}`);
  }

  return value;
}

/**
 * Validate specific environment variables needed for a feature
 */
export function validateFeature(featureName, requiredVars) {
  const missing = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    console.warn(
      `Feature "${featureName}" has missing environment variables: ${missing.join(', ')}`
    );
    return false;
  }

  return true;
}

/**
 * Generate environment variable setup guide
 */
export function getSetupGuide() {
  let guide = '\n===== EMERGENCY ECHO - ENVIRONMENT SETUP GUIDE =====\n\n';
  guide += 'Copy the template below to your .env.local file:\n\n';
  guide += '# SUPABASE CONFIGURATION\n';
  guide += 'NEXT_PUBLIC_SUPABASE_URL=\n';
  guide += 'NEXT_PUBLIC_SUPABASE_ANON_KEY=\n';
  guide += 'SUPABASE_SERVICE_ROLE_KEY=\n\n';

  guide += '# n8N WEBHOOK CONFIGURATION\n';
  guide += 'N8N_SIGNUP_WEBHOOK_URL=\n';
  guide += 'N8N_LOGIN_WEBHOOK_URL=\n';
  guide += 'N8N_EMAIL_WEBHOOK_URL=\n';
  guide += 'N8N_PASSWORD_RESET_WEBHOOK_URL=\n\n';

  guide += '# LIVEKIT CONFIGURATION\n';
  guide += 'NEXT_PUBLIC_LIVEKIT_URL=\n';
  guide += 'LIVEKIT_API_KEY=\n';
  guide += 'LIVEKIT_API_SECRET=\n\n';

  guide += '# APPLICATION CONFIGURATION\n';
  guide += 'NEXT_PUBLIC_APP_URL=\n';
  guide += 'CORS_ALLOWED_ORIGINS=\n\n';

  guide += '# OPTIONAL: VAPI CONFIGURATION\n';
  guide += 'NEXT_PUBLIC_VAPI_PUBLIC_KEY=\n';
  guide += 'NEXT_PUBLIC_VAPI_ASSISTANT_ID=\n\n';

  guide += '# OPTIONAL: EMAIL CONFIGURATION\n';
  guide += 'SENDGRID_API_KEY=\n\n';

  return guide;
}

// Run validation on module load (only in server context)
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  try {
    validateEnvironment();
  } catch (error) {
    // Only throw in development/production, not in build time
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'production') {
      console.error('\n' + error.message);
      console.log(getSetupGuide());
    }
  }
}

export default {
  validateEnvironment,
  getEnvVar,
  validateFeature,
  getSetupGuide,
};
