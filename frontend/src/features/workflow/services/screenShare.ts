/**
 * Screen Sharing Service for LiveKit
 * Manages screen sharing state, permissions, and quality settings
 */

import { ScreenShareState } from '@/lib/types/livekit';

class ScreenShareService {
  private static instance: ScreenShareService;
  private screenShareState: ScreenShareState = {
    isSharing: false,
  };
  private listeners: Set<(state: ScreenShareState) => void> = new Set();

  private constructor() {}

  static getInstance(): ScreenShareService {
    if (!ScreenShareService.instance) {
      ScreenShareService.instance = new ScreenShareService();
    }
    return ScreenShareService.instance;
  }

  /**
   * Request screen sharing permission
   */
  async requestScreenShare(): Promise<MediaStream | null> {
    try {
      if (!navigator.mediaDevices.getDisplayMedia) {
        throw new Error('Screen sharing is not supported in your browser');
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
        } as any,
        audio: false,
      });

      return stream;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        console.warn('[ScreenShare] User denied screen sharing permission');
        return null;
      }

      console.error('[ScreenShare] Error requesting screen share:', error);
      throw error;
    }
  }

  /**
   * Start screen sharing
   */
  startScreenShare(participantId: string, participantName: string, quality: 'low' | 'medium' | 'high' = 'high'): void {
    this.screenShareState = {
      isSharing: true,
      participantId,
      participantName,
      startedAt: Date.now(),
      quality,
    };

    this.notifyListeners();
    console.log(`[ScreenShare] Started screen sharing from ${participantName}`);
  }

  /**
   * Stop screen sharing
   */
  stopScreenShare(): void {
    this.screenShareState = {
      isSharing: false,
    };

    this.notifyListeners();
    console.log('[ScreenShare] Stopped screen sharing');
  }

  /**
   * Get current screen share state
   */
  getScreenShareState(): ScreenShareState {
    return { ...this.screenShareState };
  }

  /**
   * Check if screen is being shared
   */
  isScreenSharing(): boolean {
    return this.screenShareState.isSharing;
  }

  /**
   * Subscribe to screen share state changes
   */
  subscribe(listener: (state: ScreenShareState) => void): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    const state = this.getScreenShareState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (error) {
        console.error('[ScreenShare] Error in listener:', error);
      }
    });
  }

  /**
   * Get quality settings for screen share
   */
  getQualitySettings(
    quality: 'low' | 'medium' | 'high'
  ): {
    width: number;
    height: number;
    frameRate: number;
    bitrate: number;
  } {
    const settings = {
      low: { width: 1024, height: 768, frameRate: 15, bitrate: 500000 },
      medium: { width: 1280, height: 960, frameRate: 24, bitrate: 1000000 },
      high: { width: 1920, height: 1080, frameRate: 30, bitrate: 2000000 },
    };

    return settings[quality];
  }

  /**
   * Check if browser supports screen sharing
   */
  supportsScreenSharing(): boolean {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getDisplayMedia &&
      navigator.mediaDevices.getDisplayMedia instanceof Function
    );
  }
}

export const screenShareService = ScreenShareService.getInstance();
