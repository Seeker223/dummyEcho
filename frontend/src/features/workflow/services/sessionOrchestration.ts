/**
 * Session Orchestration Service
 * Manages emergency call workflow: Patient -> AI Triage -> Doctor -> Nurse -> Ambulance
 */

import {
  SessionOrchestractionState,
  ParticipantMetadata,
  SessionTransition,
  ParticipantRole,
} from '@/lib/types/livekit';
import { livekitAdvancedService } from './livekitAdvanced';

type Phase = 'triage' | 'doctor-consultation' | 'nurse-support' | 'ambulance-dispatch' | 'completed';

class SessionOrchestrationService {
  private static instance: SessionOrchestrationService;
  private sessionState: Map<string, SessionOrchestractionState> = new Map();
  private transitionListeners: Map<string, Set<(transition: SessionTransition) => void>> = new Map();

  private constructor() {}

  static getInstance(): SessionOrchestrationService {
    if (!SessionOrchestrationService.instance) {
      SessionOrchestrationService.instance = new SessionOrchestrationService();
    }
    return SessionOrchestrationService.instance;
  }

  /**
   * Initialize emergency session orchestration
   */
  initializeEmergencySession(
    sessionId: string,
    patient: ParticipantMetadata,
    severity: 'critical' | 'urgent' | 'moderate' | 'minor' = 'urgent'
  ): SessionOrchestractionState {
    const state: SessionOrchestractionState = {
      currentPhase: 'triage',
      patient,
      transitions: [
        {
          from: 'initialized',
          to: 'triage',
          triggeredBy: patient.userId,
          reason: `Emergency session initiated with severity: ${severity}`,
          timestamp: Date.now(),
        },
      ],
      startedAt: Date.now(),
      estimatedDuration: 1800000, // 30 minutes estimated
    };

    this.sessionState.set(sessionId, state);

    console.log(
      `[Orchestration] Emergency session ${sessionId} initialized in TRIAGE phase`
    );

    return state;
  }

  /**
   * Add AI agent to triage phase
   */
  addAIAgent(
    sessionId: string,
    aiAgent: ParticipantMetadata,
    triggeredBy: string
  ): SessionOrchestractionState | null {
    const state = this.sessionState.get(sessionId);
    if (!state) {
      console.error(`[Orchestration] Session ${sessionId} not found`);
      return null;
    }

    state.aiAgent = aiAgent;

    this.recordTransition(sessionId, 'triage', 'triage', triggeredBy, 'AI agent joined triage');

    console.log(
      `[Orchestration] AI agent ${aiAgent.name} added to session ${sessionId}`
    );

    return state;
  }

  /**
   * Transition to doctor consultation
   */
  transitionToDoctor(
    sessionId: string,
    doctor: ParticipantMetadata,
    triggeredBy: string,
    reason: string = 'Escalated from AI triage'
  ): SessionOrchestractionState | null {
    const state = this.sessionState.get(sessionId);
    if (!state) {
      console.error(`[Orchestration] Session ${sessionId} not found`);
      return null;
    }

    const previousPhase = state.currentPhase;
    state.currentPhase = 'doctor-consultation';
    state.doctor = doctor;

    this.recordTransition(sessionId, previousPhase, 'doctor-consultation', triggeredBy, reason);

    console.log(
      `[Orchestration] Session ${sessionId} transitioned to DOCTOR CONSULTATION (doctor: ${doctor.name})`
    );

    return state;
  }

  /**
   * Transition to nurse support
   */
  transitionToNurse(
    sessionId: string,
    nurse: ParticipantMetadata,
    triggeredBy: string,
    reason: string = 'Nurse support initiated'
  ): SessionOrchestractionState | null {
    const state = this.sessionState.get(sessionId);
    if (!state) {
      console.error(`[Orchestration] Session ${sessionId} not found`);
      return null;
    }

    const previousPhase = state.currentPhase;
    state.currentPhase = 'nurse-support';
    state.nurse = nurse;

    this.recordTransition(sessionId, previousPhase, 'nurse-support', triggeredBy, reason);

    console.log(
      `[Orchestration] Session ${sessionId} transitioned to NURSE SUPPORT (nurse: ${nurse.name})`
    );

    return state;
  }

  /**
   * Dispatch ambulance
   */
  dispatchAmbulance(
    sessionId: string,
    ambulance: ParticipantMetadata,
    triggeredBy: string,
    reason: string = 'Emergency ambulance dispatch'
  ): SessionOrchestractionState | null {
    const state = this.sessionState.get(sessionId);
    if (!state) {
      console.error(`[Orchestration] Session ${sessionId} not found`);
      return null;
    }

    const previousPhase = state.currentPhase;
    state.currentPhase = 'ambulance-dispatch';
    state.ambulance = ambulance;

    this.recordTransition(sessionId, previousPhase, 'ambulance-dispatch', triggeredBy, reason);

    console.log(
      `[Orchestration] Session ${sessionId} transitioned to AMBULANCE DISPATCH`
    );

    return state;
  }

  /**
   * End session
   */
  endSession(
    sessionId: string,
    triggeredBy: string,
    reason: string = 'Session completed'
  ): SessionOrchestractionState | null {
    const state = this.sessionState.get(sessionId);
    if (!state) {
      console.error(`[Orchestration] Session ${sessionId} not found`);
      return null;
    }

    const previousPhase = state.currentPhase;
    state.currentPhase = 'completed';

    this.recordTransition(sessionId, previousPhase, 'completed', triggeredBy, reason);

    console.log(`[Orchestration] Session ${sessionId} completed`);

    return state;
  }

  /**
   * Get current session state
   */
  getSessionState(sessionId: string): SessionOrchestractionState | null {
    const state = this.sessionState.get(sessionId);
    return state ? JSON.parse(JSON.stringify(state)) : null;
  }

  /**
   * Get all participants in session
   */
  getSessionParticipants(sessionId: string): ParticipantMetadata[] {
    const state = this.sessionState.get(sessionId);
    if (!state) return [];

    const participants: ParticipantMetadata[] = [state.patient];

    if (state.aiAgent) participants.push(state.aiAgent);
    if (state.doctor) participants.push(state.doctor);
    if (state.nurse) participants.push(state.nurse);
    if (state.ambulance) participants.push(state.ambulance);

    return participants;
  }

  /**
   * Check if role can access session
   */
  canAccessSession(sessionId: string, userRole: ParticipantRole, userId: string): boolean {
    const state = this.sessionState.get(sessionId);
    if (!state) return false;

    // Patient can always access their own session
    if (userRole === 'patient' && state.patient.userId === userId) {
      return true;
    }

    // Doctor can access any session
    if (userRole === 'doctor') {
      return true;
    }

    // Nurse can access if assigned to session
    if (userRole === 'nurse' && state.nurse?.userId === userId) {
      return true;
    }

    // AI agent can access if assigned
    if (userRole === 'ai-agent' && state.aiAgent?.userId === userId) {
      return true;
    }

    // Ambulance can access if dispatched
    if (userRole === 'ambulance' && state.ambulance?.userId === userId) {
      return true;
    }

    // Admin can access any session
    if (userRole === 'admin') {
      return true;
    }

    return false;
  }

  /**
   * Get next recommended action
   */
  getNextAction(sessionId: string): string {
    const state = this.sessionState.get(sessionId);
    if (!state) return 'Session not found';

    const actions: Record<Phase, string> = {
      triage: 'Waiting for AI triage assessment...',
      'doctor-consultation': 'Doctor is reviewing patient...',
      'nurse-support': 'Nurse is providing support...',
      'ambulance-dispatch': 'Ambulance is en route...',
      completed: 'Session has ended',
    };

    return actions[state.currentPhase];
  }

  /**
   * Subscribe to session transitions
   */
  onTransition(
    sessionId: string,
    callback: (transition: SessionTransition) => void
  ): () => void {
    if (!this.transitionListeners.has(sessionId)) {
      this.transitionListeners.set(sessionId, new Set());
    }

    const listeners = this.transitionListeners.get(sessionId)!;
    listeners.add(callback);

    return () => {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.transitionListeners.delete(sessionId);
      }
    };
  }

  /**
   * Record and notify transition
   */
  private recordTransition(
    sessionId: string,
    from: string,
    to: string,
    triggeredBy: string,
    reason: string
  ): void {
    const state = this.sessionState.get(sessionId);
    if (!state) return;

    const transition: SessionTransition = {
      from,
      to,
      triggeredBy,
      reason,
      timestamp: Date.now(),
    };

    state.transitions.push(transition);

    // Notify listeners
    const listeners = this.transitionListeners.get(sessionId);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(transition);
        } catch (error) {
          console.error('[Orchestration] Error in transition listener:', error);
        }
      });
    }
  }

  /**
   * Get session timeline
   */
  getSessionTimeline(sessionId: string): SessionTransition[] {
    const state = this.sessionState.get(sessionId);
    return state ? [...state.transitions] : [];
  }

  /**
   * Calculate session duration
   */
  getSessionDuration(sessionId: string): number | null {
    const state = this.sessionState.get(sessionId);
    if (!state) return null;

    return Date.now() - state.startedAt;
  }

  /**
   * Get session summary
   */
  getSessionSummary(sessionId: string): Record<string, any> | null {
    const state = this.sessionState.get(sessionId);
    if (!state) return null;

    return {
      sessionId,
      currentPhase: state.currentPhase,
      patient: {
        name: state.patient.name,
        role: state.patient.role,
      },
      participants: {
        aiAgent: state.aiAgent ? state.aiAgent.name : null,
        doctor: state.doctor ? state.doctor.name : null,
        nurse: state.nurse ? state.nurse.name : null,
        ambulance: state.ambulance ? state.ambulance.name : null,
      },
      startedAt: new Date(state.startedAt).toISOString(),
      duration: this.getSessionDuration(sessionId),
      transitionCount: state.transitions.length,
    };
  }

  /**
   * Clear completed session
   */
  clearSession(sessionId: string): boolean {
    const state = this.sessionState.get(sessionId);
    if (!state) return false;

    if (state.currentPhase !== 'completed') {
      console.warn(`[Orchestration] Cannot clear session ${sessionId} - not completed`);
      return false;
    }

    this.sessionState.delete(sessionId);
    this.transitionListeners.delete(sessionId);

    console.log(`[Orchestration] Cleared session ${sessionId}`);

    return true;
  }
}

export const sessionOrchestrationService = SessionOrchestrationService.getInstance();
