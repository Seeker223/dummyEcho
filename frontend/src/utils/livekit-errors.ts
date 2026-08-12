/**
 * Professional LiveKit Error Handling
 * Comprehensive error classification, recovery strategies, and user messaging
 */

import { LiveKitError } from '@/lib/types/livekit';

export class LiveKitErrorHandler {
  private static instance: LiveKitErrorHandler;
  private errorLog: LiveKitError[] = [];
  private readonly maxLogSize = 100;

  private constructor() {}

  static getInstance(): LiveKitErrorHandler {
    if (!LiveKitErrorHandler.instance) {
      LiveKitErrorHandler.instance = new LiveKitErrorHandler();
    }
    return LiveKitErrorHandler.instance;
  }

  /**
   * Create a structured LiveKit error
   */
  createError(
    code: string,
    message: string,
    severity: 'info' | 'warning' | 'error' | 'critical' = 'error',
    context?: Record<string, any>,
    recoveryStrategy?: 'retry' | 'fallback-to-audio' | 'reconnect' | 'end-session'
  ): LiveKitError {
    return {
      code,
      message,
      severity,
      timestamp: Date.now(),
      context,
      recoveryStrategy: recoveryStrategy || this.getDefaultRecoveryStrategy(code),
    };
  }

  /**
   * Log error for monitoring and debugging
   */
  logError(error: LiveKitError): void {
    console.error(`[LiveKit ${error.severity.toUpperCase()}] ${error.code}: ${error.message}`, error.context);

    // Store in error log
    this.errorLog.push(error);

    // Maintain log size
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(code: string): string {
    const messages: Record<string, string> = {
      'connection-failed': 'Unable to connect to video call. Please check your internet connection.',
      'network-error': 'Network error occurred. Attempting to recover...',
      'permission-denied': 'Permission denied. You do not have access to this call.',
      'room-not-found': 'The call room could not be found. The session may have ended.',
      'token-expired': 'Your session has expired. Please rejoin the call.',
      'invalid-token': 'Invalid session token. Please restart the call.',
      'max-participants-exceeded': 'The maximum number of participants has been reached.',
      'media-device-error': 'Unable to access camera or microphone. Please check your device permissions.',
      'audio-only-fallback': 'Video connection lost. Switching to audio-only mode.',
      'reconnection-failed': 'Unable to reconnect to the call. Please try again.',
      'participant-error': 'Error managing participant. Please refresh the page.',
      'recording-error': 'Recording failed. The session will continue without recording.',
      'screen-share-error': 'Unable to share screen. Please try again.',
      'stream-error': 'Unable to establish media stream.',
      'unexpected-error': 'An unexpected error occurred. Please try again.',
    };

    return messages[code] || 'An error occurred. Please try again.';
  }

  /**
   * Determine recovery strategy based on error code
   */
  private getDefaultRecoveryStrategy(
    code: string
  ): 'retry' | 'fallback-to-audio' | 'reconnect' | 'end-session' {
    const strategies: Record<string, 'retry' | 'fallback-to-audio' | 'reconnect' | 'end-session'> = {
      'connection-failed': 'reconnect',
      'network-error': 'fallback-to-audio',
      'permission-denied': 'end-session',
      'room-not-found': 'retry',
      'token-expired': 'retry',
      'invalid-token': 'end-session',
      'max-participants-exceeded': 'end-session',
      'media-device-error': 'fallback-to-audio',
      'audio-only-fallback': 'reconnect',
      'reconnection-failed': 'end-session',
      'participant-error': 'retry',
      'recording-error': 'retry',
      'screen-share-error': 'retry',
      'stream-error': 'reconnect',
    };

    return strategies[code] || 'retry';
  }

  /**
   * Handle error with automatic logging and recovery suggestion
   */
  handleError(
    code: string,
    message: string,
    context?: Record<string, any>
  ): LiveKitError {
    const severity = this.determineSeverity(code);
    const error = this.createError(code, message, severity, context);
    this.logError(error);
    return error;
  }

  /**
   * Determine error severity
   */
  private determineSeverity(code: string): 'info' | 'warning' | 'error' | 'critical' {
    const severityMap: Record<string, 'info' | 'warning' | 'error' | 'critical'> = {
      'connection-failed': 'critical',
      'network-error': 'warning',
      'permission-denied': 'error',
      'room-not-found': 'error',
      'token-expired': 'warning',
      'invalid-token': 'error',
      'max-participants-exceeded': 'error',
      'media-device-error': 'error',
      'audio-only-fallback': 'warning',
      'reconnection-failed': 'critical',
      'participant-error': 'warning',
      'recording-error': 'warning',
      'screen-share-error': 'warning',
      'stream-error': 'error',
    };

    return severityMap[code] || 'error';
  }

  /**
   * Get error recovery instructions for users
   */
  getRecoveryInstructions(code: string): string[] {
    const instructions: Record<string, string[]> = {
      'connection-failed': [
        'Check your internet connection',
        'Refresh the page and try again',
        'Try a different browser or device',
        'Contact support if the issue persists',
      ],
      'network-error': [
        'Wait a moment for the connection to recover',
        'The call will attempt to reconnect automatically',
        'Switch to a stronger Wi-Fi network if possible',
      ],
      'media-device-error': [
        'Check camera and microphone permissions in settings',
        'Ensure no other application is using the camera',
        'Try unplugging and replugging your camera',
        'Restart your browser',
      ],
      'room-not-found': [
        'The call may have already ended',
        'Ask the organizer to send you a new link',
        'Try rejoining with a fresh link',
      ],
    };

    return instructions[code] || ['Please try again', 'Contact support if the issue persists'];
  }

  /**
   * Get error log
   */
  getErrorLog(): LiveKitError[] {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    total: number;
    bySeverity: Record<string, number>;
    byCode: Record<string, number>;
  } {
    const stats = {
      total: this.errorLog.length,
      bySeverity: { info: 0, warning: 0, error: 0, critical: 0 } as Record<string, number>,
      byCode: {} as Record<string, number>,
    };

    this.errorLog.forEach((err) => {
      stats.bySeverity[err.severity]++;
      stats.byCode[err.code] = (stats.byCode[err.code] || 0) + 1;
    });

    return stats;
  }
}

export const liveKitErrorHandler = LiveKitErrorHandler.getInstance();

/**
 * Utility function to handle network errors with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 5,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const delay = initialDelay * Math.pow(2, attempt);
      console.warn(`[LiveKit Retry] Attempt ${attempt + 1}/${maxAttempts} failed. Retrying in ${delay}ms...`);

      if (attempt < maxAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Utility to handle connection state changes
 */
export function createConnectionStateLogger(state: string, context?: Record<string, any>): void {
  const timestamp = new Date().toISOString();
  console.log(`[LiveKit Connection] ${timestamp} - State: ${state}`, context || '');
}
