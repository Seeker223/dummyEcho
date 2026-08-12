/**
 * Centralized LiveKit Configuration
 * Manages environment validation, service initialization, and fallback strategies
 */

import { LiveKitServiceConfig } from './types/livekit';

class LiveKitConfigManager {
  private static instance: LiveKitConfigManager;
  private config: LiveKitServiceConfig;
  private initialized: boolean = false;

  private constructor() {
    this.config = this.loadConfig();
  }

  static getInstance(): LiveKitConfigManager {
    if (!LiveKitConfigManager.instance) {
      LiveKitConfigManager.instance = new LiveKitConfigManager();
    }
    return LiveKitConfigManager.instance;
  }

  private loadConfig(): LiveKitServiceConfig {
    // Validate required environment variables
    const url = process.env.NEXT_PUBLIC_LIVEKIT_URL;
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!url) {
      console.error('[LiveKit Config] NEXT_PUBLIC_LIVEKIT_URL is not set');
    }
    if (!apiKey && typeof window === 'undefined') {
      console.error('[LiveKit Config] LIVEKIT_API_KEY is not set');
    }
    if (!apiSecret && typeof window === 'undefined') {
      console.error('[LiveKit Config] LIVEKIT_API_SECRET is not set');
    }

    return {
      url: url || 'ws://localhost:7880',
      apiKey: apiKey || '',
      apiSecret: apiSecret || '',
      enableRecording: true,
      enableTranscription: false,
      enableEncryption: true,
      defaultLayout: 'gallery',
      maxParticipants: 20,
      sessionTimeout: 3600000, // 1 hour in ms
      reconnectionMaxAttempts: 5,
      reconnectionDelay: 2000, // 2 seconds
    };
  }

  getConfig(): LiveKitServiceConfig {
    return this.config;
  }

  getUrl(): string {
    return this.config.url;
  }

  getApiKey(): string {
    return this.config.apiKey;
  }

  getApiSecret(): string {
    return this.config.apiSecret;
  }

  isConfigured(): boolean {
    return !!(this.config.url && this.config.apiKey && this.config.apiSecret);
  }

  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.url) {
      errors.push('LiveKit URL is not configured');
    }

    if (typeof window === 'undefined') {
      // Server-side validation
      if (!this.config.apiKey) {
        errors.push('LiveKit API Key is not configured');
      }
      if (!this.config.apiSecret) {
        errors.push('LiveKit API Secret is not configured');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // URL normalization for WebSocket connection
  getNormalizedUrl(): string {
    let url = this.config.url;

    // Ensure protocol
    if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
      if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
        url = 'wss://' + url;
      } else {
        url = 'ws://' + url;
      }
    }

    // Remove trailing slash
    url = url.replace(/\/$/, '');

    return url;
  }

  // Get role-specific configuration
  getRoleConfig(role: 'patient' | 'doctor' | 'nurse' | 'ai-agent' | 'ambulance' | 'admin') {
    const baseConfig = {
      patient: {
        canPublish: true,
        canPublishData: true,
        canScreenShare: true,
        canRecord: false,
        canPublishMetadata: true,
      },
      doctor: {
        canPublish: true,
        canPublishData: true,
        canScreenShare: true,
        canRecord: true,
        canPublishMetadata: true,
      },
      nurse: {
        canPublish: true,
        canPublishData: true,
        canScreenShare: false,
        canRecord: false,
        canPublishMetadata: true,
      },
      'ai-agent': {
        canPublish: true,
        canPublishData: true,
        canScreenShare: false,
        canRecord: false,
        canPublishMetadata: false,
      },
      ambulance: {
        canPublish: false,
        canPublishData: true,
        canScreenShare: false,
        canRecord: false,
        canPublishMetadata: false,
      },
      admin: {
        canPublish: true,
        canPublishData: true,
        canScreenShare: true,
        canRecord: true,
        canPublishMetadata: true,
      },
    };

    return baseConfig[role];
  }

  // Get fallback strategies based on error type
  getFallbackStrategy(errorCode: string): 'retry' | 'fallback-to-audio' | 'reconnect' | 'end-session' {
    const strategies: Record<string, 'retry' | 'fallback-to-audio' | 'reconnect' | 'end-session'> = {
      'connection-failed': 'reconnect',
      'network-error': 'fallback-to-audio',
      'permission-denied': 'end-session',
      'room-not-found': 'retry',
      'token-expired': 'retry',
      'invalid-token': 'end-session',
      'max-participants-exceeded': 'end-session',
      'media-device-error': 'fallback-to-audio',
      'subscription-error': 'retry',
    };

    return strategies[errorCode] || 'retry';
  }
}

export const livekitConfig = LiveKitConfigManager.getInstance();

export function validateLiveKitConfig(): boolean {
  const validation = livekitConfig.validate();
  if (!validation.valid) {
    console.warn('[LiveKit] Configuration validation failed:', validation.errors);
    return false;
  }
  return true;
}

export function getLiveKitUrl(): string {
  return livekitConfig.getNormalizedUrl();
}
