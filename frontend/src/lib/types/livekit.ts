/**
 * Professional LiveKit WebRTC Integration Types
 * Supports emergency consultation workflows with role-based access
 */

export type ParticipantRole = 'patient' | 'doctor' | 'nurse' | 'ai-agent' | 'ambulance' | 'admin';

export type SessionStatus = 'pending' | 'active' | 'paused' | 'ended' | 'failed';

export type PermissionLevel = 'viewer' | 'participant' | 'presenter' | 'admin';

export interface ParticipantMetadata {
  id: string;
  userId: string;
  name: string;
  role: ParticipantRole;
  email?: string;
  phone?: string;
  permissions: Permission[];
  joinedAt: number;
  muteStatus?: {
    audio: boolean;
    video: boolean;
  };
  connectionQuality?: 'excellent' | 'good' | 'fair' | 'poor' | 'lost';
}

export interface Permission {
  canPublish: boolean;
  canPublishData: boolean;
  canPublishMetadata: boolean;
  canSubscribe: boolean;
  allowParticipantCanPublish: boolean;
  allowParticipantCanSubscribe: boolean;
  canRecord: boolean;
  canScreenShare: boolean;
}

export interface SessionMetadata {
  sessionId: string;
  roomName: string;
  patientId: string;
  initiatedBy: string;
  initiationReason: 'emergency' | 'scheduled' | 'followup' | 'triage';
  createdAt: number;
  status: SessionStatus;
  participants: ParticipantMetadata[];
  recordingEnabled: boolean;
  transcriptionEnabled: boolean;
  maxDuration?: number;
  features?: {
    screenSharing: boolean;
    dataChannels: boolean;
    encryption: boolean;
    recording: boolean;
    transcription: boolean;
  };
  emergencyContext?: {
    severity: 'critical' | 'urgent' | 'moderate' | 'minor';
    location?: string;
    symptoms?: string[];
    vitals?: Record<string, number | string>;
  };
}

export interface LiveKitSession {
  id: string;
  sessionId: string;
  patientId: string;
  initiatedBy: string;
  roomName: string;
  status: SessionStatus;
  metadata: SessionMetadata;
  token?: string;
  url?: string;
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  recordingId?: string;
  transcriptUrl?: string;
}

export interface TokenGenerationParams {
  userId: string;
  userName: string;
  roomName: string;
  role: ParticipantRole;
  sessionId?: string;
  metadata?: Partial<ParticipantMetadata>;
  duration?: number;
  canPublish?: boolean;
  canSubscribe?: boolean;
  canPublishData?: boolean;
}

export interface LiveKitRoomConfig {
  name: string;
  emptyTimeout: number;
  maxParticipants: number;
  metadata?: string;
}

export interface RecordingConfig {
  enabled: boolean;
  layout?: 'speaker' | 'gallery' | 'focus';
  audioCodec?: 'opus' | 'aac';
  videoCodec?: 'h264' | 'vp9';
  fileType?: 'mp4' | 'ogg';
  preset?: 'HD_30' | 'HD_60' | 'SD_30' | 'SD_60';
}

export interface ScreenShareState {
  isSharing: boolean;
  participantId?: string;
  participantName?: string;
  startedAt?: number;
  quality?: 'low' | 'medium' | 'high';
}

export interface ConnectionMetrics {
  latency: number;
  jitter: number;
  packetLoss: number;
  bandwidth: number;
  videoQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'lost';
  audioQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'lost';
}

export interface LiveKitError {
  code: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: number;
  context?: Record<string, any>;
  recoveryStrategy?: 'retry' | 'fallback-to-audio' | 'reconnect' | 'end-session';
}

export interface DataChannelMessage {
  type: 'note' | 'vital' | 'prescription' | 'image' | 'document' | 'chat' | 'system';
  from: string;
  to?: string;
  timestamp: number;
  payload: any;
  requiresAck?: boolean;
}

export interface SessionOrchestractionState {
  currentPhase: 'triage' | 'doctor-consultation' | 'nurse-support' | 'ambulance-dispatch' | 'completed';
  patient: ParticipantMetadata;
  aiAgent?: ParticipantMetadata;
  doctor?: ParticipantMetadata;
  nurse?: ParticipantMetadata;
  ambulance?: ParticipantMetadata;
  transitions: SessionTransition[];
  startedAt: number;
  estimatedDuration?: number;
}

export interface SessionTransition {
  from: string;
  to: string;
  triggeredBy: string;
  reason: string;
  timestamp: number;
}

export interface RecordingMetadata {
  sessionId: string;
  recordingId: string;
  participants: ParticipantMetadata[];
  startedAt: number;
  endedAt?: number;
  duration?: number;
  fileSize?: number;
  storagePath?: string;
  transcription?: {
    url: string;
    language: string;
  };
  complianceMetadata: {
    consentObtained: boolean;
    consentRecordedAt?: number;
    regulationCompliance: 'hipaa' | 'gdpr' | 'both' | 'none';
    auditTrail: AuditLogEntry[];
  };
}

export interface AuditLogEntry {
  timestamp: number;
  action: 'session-created' | 'participant-joined' | 'participant-left' | 'recording-started' | 'recording-stopped' | 'error' | 'permission-changed' | 'consent-verified';
  userId: string;
  userName: string;
  details: Record<string, any>;
}

export interface LiveKitServiceConfig {
  url: string;
  apiKey: string;
  apiSecret: string;
  enableRecording: boolean;
  enableTranscription: boolean;
  enableEncryption: boolean;
  defaultLayout: 'speaker' | 'gallery';
  maxParticipants: number;
  sessionTimeout: number;
  reconnectionMaxAttempts: number;
  reconnectionDelay: number;
}
