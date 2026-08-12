/**
 * React Hook for LiveKit Session Management
 * Handles connection lifecycle, participants, and error recovery
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  LiveKitRoom,
  useLocalParticipant,
  useRemoteParticipants,
  useRoomContext,
} from '@livekit/components-react';
import {
  ParticipantMetadata,
  SessionMetadata,
  ConnectionMetrics,
  LiveKitError,
  ParticipantRole,
} from '@/lib/types/livekit';
import { liveKitErrorHandler, retryWithBackoff } from '@/utils/livekit-errors';
import { livekitAdvancedService } from '../services/livekitAdvanced';

export interface UseLiveKitSessionOptions {
  roomName: string;
  userName: string;
  userId: string;
  userRole: ParticipantRole;
  onParticipantJoin?: (participant: ParticipantMetadata) => void;
  onParticipantLeave?: (participantId: string) => void;
  onConnectionQualityChange?: (quality: 'excellent' | 'good' | 'fair' | 'poor' | 'lost') => void;
  onError?: (error: LiveKitError) => void;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
}

export interface UseLiveKitSessionReturn {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  token: string | null;
  error: LiveKitError | null;

  // Session data
  sessionMetadata: SessionMetadata | null;
  participants: ParticipantMetadata[];
  localParticipant: ParticipantMetadata | null;

  // Metrics
  connectionMetrics: ConnectionMetrics | null;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  reconnect: () => Promise<void>;
  muteAudio: () => void;
  unmuteAudio: () => void;
  muteVideo: () => void;
  unmuteVideo: () => void;
  updateParticipantMetadata: (updates: Partial<ParticipantMetadata>) => void;
  startRecording: () => Promise<string>;
  stopRecording: () => Promise<void>;
  endSession: (reason: string) => Promise<void>;
}

export function useLiveKitSession(options: UseLiveKitSessionOptions): UseLiveKitSessionReturn {
  const {
    roomName,
    userName,
    userId,
    userRole,
    onParticipantJoin,
    onParticipantLeave,
    onConnectionQualityChange,
    onError,
    maxReconnectAttempts = 5,
    reconnectDelay = 2000,
  } = options;

  // State
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<LiveKitError | null>(null);
  const [sessionMetadata, setSessionMetadata] = useState<SessionMetadata | null>(null);
  const [participants, setParticipants] = useState<ParticipantMetadata[]>([]);
  const [localParticipant, setLocalParticipant] = useState<ParticipantMetadata | null>(null);
  const [connectionMetrics, setConnectionMetrics] = useState<ConnectionMetrics | null>(null);

  // Refs
  const reconnectAttemptsRef = useRef(0);
  const recordingIdRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string>(Date.now().toString());

  /**
   * Generate access token
   */
  const generateToken = useCallback(async () => {
    try {
      const token = await livekitAdvancedService.requestToken({
        userId,
        userName,
        roomName,
        role: userRole,
        sessionId: sessionIdRef.current,
      });
      return token;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Token generation failed';
      const err = liveKitErrorHandler.handleError('token-generation-failed', errorMessage);
      setError(err);
      onError?.(err);
      throw error;
    }
  }, [userId, userName, roomName, userRole, onError]);

  /**
   * Connect to session
   */
  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);
      reconnectAttemptsRef.current = 0;

      // Generate token with retry
      const newToken = await retryWithBackoff(() => generateToken(), 3);
      setToken(newToken);

      // Create local participant metadata
      const local = livekitAdvancedService.createParticipantMetadata(userId, userName, userRole);
      setLocalParticipant(local);

      // Create session metadata
      const sessionMeta = livekitAdvancedService.createSessionMetadata(
        sessionIdRef.current,
        roomName,
        userId,
        userId
      );
      setSessionMetadata(sessionMeta);

      setIsConnected(true);
      setIsConnecting(false);
    } catch (error) {
      setIsConnecting(false);
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      const err = liveKitErrorHandler.handleError('connection-failed', errorMessage);
      setError(err);
      onError?.(err);
    }
  }, [generateToken, userId, userName, userRole, roomName, onError]);

  /**
   * Disconnect from session
   */
  const disconnect = useCallback(async () => {
    try {
      setIsConnected(false);
      if (sessionIdRef.current && sessionMetadata) {
        await livekitAdvancedService.endSession(sessionIdRef.current, 'User disconnected');
      }
    } catch (error) {
      console.error('[useLiveKitSession] Error disconnecting:', error);
    }
  }, [sessionMetadata]);

  /**
   * Reconnect with exponential backoff
   */
  const reconnect = useCallback(async () => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      const err = liveKitErrorHandler.handleError(
        'reconnection-failed',
        'Max reconnection attempts reached'
      );
      setError(err);
      onError?.(err);
      return;
    }

    reconnectAttemptsRef.current++;
    const delay = reconnectDelay * Math.pow(2, reconnectAttemptsRef.current - 1);

    console.log(`[useLiveKitSession] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);

    await new Promise((resolve) => setTimeout(resolve, delay));

    try {
      await connect();
    } catch (error) {
      console.error('[useLiveKitSession] Reconnection failed:', error);
      await reconnect();
    }
  }, [connect, maxReconnectAttempts, reconnectDelay, onError]);

  /**
   * Mute/unmute audio
   */
  const muteAudio = useCallback(() => {
    if (localParticipant && localParticipant.muteStatus) {
      setLocalParticipant({
        ...localParticipant,
        muteStatus: { audio: true, video: localParticipant.muteStatus.video },
      });
    }
  }, [localParticipant]);

  const unmuteAudio = useCallback(() => {
    if (localParticipant && localParticipant.muteStatus) {
      setLocalParticipant({
        ...localParticipant,
        muteStatus: { audio: false, video: localParticipant.muteStatus.video },
      });
    }
  }, [localParticipant]);

  /**
   * Mute/unmute video
   */
  const muteVideo = useCallback(() => {
    if (localParticipant && localParticipant.muteStatus) {
      setLocalParticipant({
        ...localParticipant,
        muteStatus: { audio: localParticipant.muteStatus.audio, video: true },
      });
    }
  }, [localParticipant]);

  const unmuteVideo = useCallback(() => {
    if (localParticipant && localParticipant.muteStatus) {
      setLocalParticipant({
        ...localParticipant,
        muteStatus: { audio: localParticipant.muteStatus.audio, video: false },
      });
    }
  }, [localParticipant]);

  /**
   * Update participant metadata
   */
  const updateParticipantMetadata = useCallback((updates: Partial<ParticipantMetadata>) => {
    if (localParticipant) {
      const updated = { ...localParticipant, ...updates };
      setLocalParticipant(updated);
    }
  }, [localParticipant]);

  /**
   * Start recording
   */
  const startRecording = useCallback(async (): Promise<string> => {
    try {
      if (!sessionIdRef.current) {
        throw new Error('No active session');
      }

      const recordingConfig = livekitAdvancedService.getRecordingConfig(userRole);
      const recordingId = await livekitAdvancedService.startRecording(
        sessionIdRef.current,
        recordingConfig
      );

      recordingIdRef.current = recordingId;
      return recordingId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Recording failed';
      const err = liveKitErrorHandler.handleError('recording-error', errorMessage);
      setError(err);
      onError?.(err);
      throw error;
    }
  }, [userRole, onError]);

  /**
   * Stop recording
   */
  const stopRecording = useCallback(async () => {
    try {
      if (!sessionIdRef.current || !recordingIdRef.current) {
        throw new Error('No active recording');
      }

      await livekitAdvancedService.stopRecording(sessionIdRef.current, recordingIdRef.current);
      recordingIdRef.current = null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Stop recording failed';
      const err = liveKitErrorHandler.handleError('recording-error', errorMessage);
      setError(err);
      onError?.(err);
      throw error;
    }
  }, [onError]);

  /**
   * End session
   */
  const endSession = useCallback(
    async (reason: string) => {
      try {
        if (recordingIdRef.current) {
          await stopRecording();
        }
        await disconnect();
      } catch (error) {
        console.error('[useLiveKitSession] Error ending session:', error);
      }
    },
    [disconnect, stopRecording]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isConnected) {
        disconnect();
      }
    };
  }, [isConnected, disconnect]);

  return {
    isConnected,
    isConnecting,
    token,
    error,
    sessionMetadata,
    participants,
    localParticipant,
    connectionMetrics,
    connect,
    disconnect,
    reconnect,
    muteAudio,
    unmuteAudio,
    muteVideo,
    unmuteVideo,
    updateParticipantMetadata,
    startRecording,
    stopRecording,
    endSession,
  };
}
