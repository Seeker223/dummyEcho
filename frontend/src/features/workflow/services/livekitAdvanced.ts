/**
 * Advanced LiveKit Service
 * Handles professional room configuration, permissions, metadata, and session management
 */

import {
  ParticipantMetadata,
  SessionMetadata,
  Permission,
  LiveKitSession,
  TokenGenerationParams,
  ParticipantRole,
  RecordingConfig,
} from '@/lib/types/livekit';
import { livekitConfig } from '@/lib/livekit-config';
import { liveKitErrorHandler } from '@/utils/livekit-errors';

class LiveKitAdvancedService {
  private static instance: LiveKitAdvancedService;

  private constructor() {}

  static getInstance(): LiveKitAdvancedService {
    if (!LiveKitAdvancedService.instance) {
      LiveKitAdvancedService.instance = new LiveKitAdvancedService();
    }
    return LiveKitAdvancedService.instance;
  }

  /**
   * Generate role-based permissions
   */
  generatePermissions(role: ParticipantRole): Permission {
    const rolePermissions: Record<ParticipantRole, Permission> = {
      patient: {
        canPublish: true,
        canPublishData: true,
        canPublishMetadata: true,
        canSubscribe: true,
        allowParticipantCanPublish: true,
        allowParticipantCanSubscribe: true,
        canRecord: false,
        canScreenShare: true,
      },
      doctor: {
        canPublish: true,
        canPublishData: true,
        canPublishMetadata: true,
        canSubscribe: true,
        allowParticipantCanPublish: true,
        allowParticipantCanSubscribe: true,
        canRecord: true,
        canScreenShare: true,
      },
      nurse: {
        canPublish: true,
        canPublishData: true,
        canPublishMetadata: true,
        canSubscribe: true,
        allowParticipantCanPublish: true,
        allowParticipantCanSubscribe: true,
        canRecord: false,
        canScreenShare: false,
      },
      'ai-agent': {
        canPublish: true,
        canPublishData: true,
        canPublishMetadata: false,
        canSubscribe: true,
        allowParticipantCanPublish: false,
        allowParticipantCanSubscribe: true,
        canRecord: false,
        canScreenShare: false,
      },
      ambulance: {
        canPublish: false,
        canPublishData: true,
        canPublishMetadata: false,
        canSubscribe: true,
        allowParticipantCanPublish: false,
        allowParticipantCanSubscribe: true,
        canRecord: false,
        canScreenShare: false,
      },
      admin: {
        canPublish: true,
        canPublishData: true,
        canPublishMetadata: true,
        canSubscribe: true,
        allowParticipantCanPublish: true,
        allowParticipantCanSubscribe: true,
        canRecord: true,
        canScreenShare: true,
      },
    };

    return rolePermissions[role];
  }

  /**
   * Create participant metadata
   */
  createParticipantMetadata(
    userId: string,
    userName: string,
    role: ParticipantRole,
    additional?: Partial<ParticipantMetadata>
  ): ParticipantMetadata {
    return {
      id: `${role}-${userId}`,
      userId,
      name: userName,
      role,
      joinedAt: Date.now(),
      permissions: [this.generatePermissions(role)],
      muteStatus: {
        audio: false,
        video: false,
      },
      connectionQuality: 'excellent',
      ...additional,
    };
  }

  /**
   * Request token for joining room
   */
  async requestToken(params: TokenGenerationParams): Promise<string> {
    try {
      const response = await fetch('/api/livekit/advanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate token');
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Token generation failed';
      liveKitErrorHandler.handleError('token-generation-failed', errorMessage, {
        params,
      });
      throw error;
    }
  }

  /**
   * Create session metadata for emergency consultation
   */
  createSessionMetadata(
    sessionId: string,
    roomName: string,
    patientId: string,
    initiatedBy: string,
    emergencyContext?: any
  ): SessionMetadata {
    return {
      sessionId,
      roomName,
      patientId,
      initiatedBy,
      initiationReason: 'emergency',
      createdAt: Date.now(),
      status: 'pending',
      participants: [],
      recordingEnabled: true,
      transcriptionEnabled: false,
      maxDuration: 3600000, // 1 hour
      features: {
        screenSharing: true,
        dataChannels: true,
        encryption: true,
        recording: true,
        transcription: false,
      },
      emergencyContext: {
        severity: emergencyContext?.severity || 'urgent',
        location: emergencyContext?.location,
        symptoms: emergencyContext?.symptoms || [],
        vitals: emergencyContext?.vitals || {},
      },
    };
  }

  /**
   * Add participant to session metadata
   */
  addParticipant(
    sessionMetadata: SessionMetadata,
    participant: ParticipantMetadata
  ): SessionMetadata {
    return {
      ...sessionMetadata,
      participants: [...sessionMetadata.participants, participant],
    };
  }

  /**
   * Remove participant from session metadata
   */
  removeParticipant(
    sessionMetadata: SessionMetadata,
    participantId: string
  ): SessionMetadata {
    return {
      ...sessionMetadata,
      participants: sessionMetadata.participants.filter((p) => p.id !== participantId),
    };
  }

  /**
   * Update participant status
   */
  updateParticipantStatus(
    sessionMetadata: SessionMetadata,
    participantId: string,
    updates: Partial<ParticipantMetadata>
  ): SessionMetadata {
    return {
      ...sessionMetadata,
      participants: sessionMetadata.participants.map((p) =>
        p.id === participantId ? { ...p, ...updates } : p
      ),
    };
  }

  /**
   * Get recording configuration based on role and context
   */
  getRecordingConfig(initiatedBy: ParticipantRole): RecordingConfig {
    const configs: Record<ParticipantRole, RecordingConfig> = {
      patient: {
        enabled: false,
        layout: 'gallery',
      },
      doctor: {
        enabled: true,
        layout: 'speaker',
        audioCodec: 'opus',
        videoCodec: 'h264',
        preset: 'HD_30',
      },
      nurse: {
        enabled: false,
        layout: 'gallery',
      },
      'ai-agent': {
        enabled: false,
      },
      ambulance: {
        enabled: false,
      },
      admin: {
        enabled: true,
        layout: 'gallery',
        audioCodec: 'opus',
        videoCodec: 'h264',
        preset: 'HD_60',
      },
    };

    return configs[initiatedBy] || { enabled: false };
  }

  /**
   * Validate session before joining
   */
  validateSession(session: LiveKitSession, userRole: ParticipantRole): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (session.status === 'ended') {
      errors.push('Session has ended');
    }

    if (session.status === 'failed') {
      errors.push('Session encountered an error and cannot be joined');
    }

    // Check role permissions
    const rolePermissions = this.generatePermissions(userRole);
    if (!rolePermissions.canSubscribe) {
      errors.push('Your role does not have permission to join this session');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Start recording session
   */
  async startRecording(sessionId: string, recordingConfig?: RecordingConfig): Promise<string> {
    try {
      const response = await fetch('/api/livekit/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start-recording',
          sessionId,
          config: recordingConfig,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to start recording');
      }

      const data = await response.json();
      return data.recordingId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Recording start failed';
      liveKitErrorHandler.handleError('recording-error', errorMessage, { sessionId });
      throw error;
    }
  }

  /**
   * Stop recording session
   */
  async stopRecording(sessionId: string, recordingId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/livekit/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'stop-recording',
          sessionId,
          recordingId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to stop recording');
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Recording stop failed';
      liveKitErrorHandler.handleError('recording-error', errorMessage, { sessionId, recordingId });
      throw error;
    }
  }

  /**
   * End session
   */
  async endSession(sessionId: string, reason: string): Promise<boolean> {
    try {
      const response = await fetch('/api/livekit/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'end-session',
          sessionId,
          reason,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to end session');
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Session end failed';
      liveKitErrorHandler.handleError('session-end-error', errorMessage, { sessionId });
      throw error;
    }
  }

  /**
   * Serialize session metadata for storage
   */
  serializeMetadata(metadata: SessionMetadata): string {
    try {
      return JSON.stringify(metadata);
    } catch (error) {
      console.error('[LiveKit] Failed to serialize metadata:', error);
      return '{}';
    }
  }

  /**
   * Deserialize session metadata
   */
  deserializeMetadata(data: string): SessionMetadata | null {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('[LiveKit] Failed to deserialize metadata:', error);
      return null;
    }
  }
}

export const livekitAdvancedService = LiveKitAdvancedService.getInstance();
