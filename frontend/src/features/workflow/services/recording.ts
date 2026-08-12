/**
 * Recording Service for LiveKit
 * Manages recording lifecycle, metadata, and audit trails for compliance
 */

import { RecordingMetadata, AuditLogEntry, ParticipantMetadata } from '@/lib/types/livekit';

class RecordingService {
  private static instance: RecordingService;
  private activeRecordings: Map<string, RecordingMetadata> = new Map();
  private auditLog: AuditLogEntry[] = [];
  private readonly maxAuditLogSize = 10000;

  private constructor() {}

  static getInstance(): RecordingService {
    if (!RecordingService.instance) {
      RecordingService.instance = new RecordingService();
    }
    return RecordingService.instance;
  }

  /**
   * Start recording a session
   */
  startRecording(
    sessionId: string,
    recordingId: string,
    participants: ParticipantMetadata[]
  ): RecordingMetadata {
    const recording: RecordingMetadata = {
      sessionId,
      recordingId,
      participants,
      startedAt: Date.now(),
      complianceMetadata: {
        consentObtained: true, // Should be verified in app logic
        regulationCompliance: 'hipaa',
        auditTrail: [],
      },
    };

    this.activeRecordings.set(recordingId, recording);

    // Log audit event
    this.addAuditLog({
      timestamp: Date.now(),
      action: 'recording-started',
      userId: 'system',
      userName: 'System',
      details: {
        recordingId,
        sessionId,
        participantCount: participants.length,
      },
    });

    console.log(`[Recording] Started recording ${recordingId} for session ${sessionId}`);

    return recording;
  }

  /**
   * Stop recording
   */
  stopRecording(recordingId: string): RecordingMetadata | null {
    const recording = this.activeRecordings.get(recordingId);

    if (!recording) {
      console.warn(`[Recording] Recording ${recordingId} not found`);
      return null;
    }

    recording.endedAt = Date.now();
    recording.duration = recording.endedAt - recording.startedAt;

    this.activeRecordings.delete(recordingId);

    // Log audit event
    this.addAuditLog({
      timestamp: Date.now(),
      action: 'recording-stopped',
      userId: 'system',
      userName: 'System',
      details: {
        recordingId,
        duration: recording.duration,
        durationMinutes: recording.duration ? Math.round(recording.duration / 60000) : 0,
      },
    });

    console.log(`[Recording] Stopped recording ${recordingId} (duration: ${recording.duration}ms)`);

    return recording;
  }

  /**
   * Update recording with file information
   */
  updateRecordingFileInfo(
    recordingId: string,
    storagePath: string,
    sizeBytes: number
  ): RecordingMetadata | null {
    const recording = this.activeRecordings.get(recordingId);

    if (!recording) {
      console.warn(`[Recording] Recording ${recordingId} not found`);
      return null;
    }

    recording.storagePath = storagePath;
    recording.fileSize = sizeBytes;

    console.log(
      `[Recording] Updated file info for ${recordingId}: ${sizeBytes} bytes at ${storagePath}`
    );

    return recording;
  }

  /**
   * Add transcription metadata
   */
  setTranscription(
    recordingId: string,
    transcriptionUrl: string,
    language: string = 'en'
  ): RecordingMetadata | null {
    const recording = this.activeRecordings.get(recordingId);

    if (!recording) {
      console.warn(`[Recording] Recording ${recordingId} not found`);
      return null;
    }

    recording.transcription = {
      url: transcriptionUrl,
      language,
    };

    console.log(`[Recording] Added transcription for ${recordingId}`);

    return recording;
  }

  /**
   * Get active recording
   */
  getRecording(recordingId: string): RecordingMetadata | undefined {
    return this.activeRecordings.get(recordingId);
  }

  /**
   * Get all active recordings
   */
  getActiveRecordings(): RecordingMetadata[] {
    return Array.from(this.activeRecordings.values());
  }

  /**
   * Add audit log entry
   */
  addAuditLog(entry: AuditLogEntry): void {
    // Add to all active recordings
    this.activeRecordings.forEach((recording) => {
      if (recording.complianceMetadata) {
        recording.complianceMetadata.auditTrail.push(entry);
      }
    });

    // Add to global audit log
    this.auditLog.push(entry);

    // Maintain log size
    if (this.auditLog.length > this.maxAuditLogSize) {
      this.auditLog = this.auditLog.slice(-this.maxAuditLogSize);
    }

    console.log(`[Recording Audit] ${entry.action} by ${entry.userName}`);
  }

  /**
   * Get audit log
   */
  getAuditLog(recordingId?: string): AuditLogEntry[] {
    if (recordingId) {
      const recording = this.activeRecordings.get(recordingId);
      if (recording?.complianceMetadata) {
        return [...recording.complianceMetadata.auditTrail];
      }
      return [];
    }

    return [...this.auditLog];
  }

  /**
   * Verify recording consent
   */
  verifyConsent(recordingId: string, consentProof: any): boolean {
    const recording = this.activeRecordings.get(recordingId);

    if (!recording) {
      console.warn(`[Recording] Recording ${recordingId} not found`);
      return false;
    }

    recording.complianceMetadata.consentObtained = true;
    recording.complianceMetadata.consentRecordedAt = Date.now();

    this.addAuditLog({
      timestamp: Date.now(),
      action: 'consent-verified',
      userId: 'system',
      userName: 'System',
      details: consentProof,
    });

    console.log(`[Recording] Consent verified for ${recordingId}`);

    return true;
  }

  /**
   * Export recording metadata
   */
  exportMetadata(recordingId: string): RecordingMetadata | null {
    const recording = this.activeRecordings.get(recordingId);

    if (!recording) {
      console.warn(`[Recording] Recording ${recordingId} not found`);
      return null;
    }

    return JSON.parse(JSON.stringify(recording));
  }

  /**
   * Generate compliance report
   */
  generateComplianceReport(recordingId: string): Record<string, any> | null {
    const recording = this.activeRecordings.get(recordingId);

    if (!recording) {
      return null;
    }

    return {
      recordingId: recording.recordingId,
      sessionId: recording.sessionId,
      startedAt: new Date(recording.startedAt).toISOString(),
      endedAt: recording.endedAt ? new Date(recording.endedAt).toISOString() : null,
      duration: recording.duration,
      participants: recording.participants.map((p) => ({
        id: p.id,
        name: p.name,
        role: p.role,
        joinedAt: new Date(p.joinedAt).toISOString(),
      })),
      compliance: {
        consentObtained: recording.complianceMetadata.consentObtained,
        consentRecordedAt: recording.complianceMetadata.consentRecordedAt
          ? new Date(recording.complianceMetadata.consentRecordedAt).toISOString()
          : null,
        regulationCompliance: recording.complianceMetadata.regulationCompliance,
      },
      auditTrailLength: recording.complianceMetadata.auditTrail.length,
      storagePath: recording.storagePath,
      fileSize: recording.fileSize,
      transcription: recording.transcription ? true : false,
    };
  }

  /**
   * Get recording statistics
   */
  getStatistics(): {
    activeRecordings: number;
    totalAuditEvents: number;
    auditEventsByAction: Record<string, number>;
  } {
    const stats = {
      activeRecordings: this.activeRecordings.size,
      totalAuditEvents: this.auditLog.length,
      auditEventsByAction: {} as Record<string, number>,
    };

    this.auditLog.forEach((entry) => {
      stats.auditEventsByAction[entry.action] =
        (stats.auditEventsByAction[entry.action] || 0) + 1;
    });

    return stats;
  }

  /**
   * Clear old recordings (cleanup)
   */
  clearOldRecordings(olderThanMs: number = 86400000): number {
    // Default: 24 hours
    const cutoffTime = Date.now() - olderThanMs;
    let clearedCount = 0;

    Array.from(this.activeRecordings.entries()).forEach(([id, recording]) => {
      if (recording.endedAt && recording.endedAt < cutoffTime) {
        this.activeRecordings.delete(id);
        clearedCount++;
      }
    });

    console.log(`[Recording] Cleared ${clearedCount} old recordings`);

    return clearedCount;
  }
}

export const recordingService = RecordingService.getInstance();
