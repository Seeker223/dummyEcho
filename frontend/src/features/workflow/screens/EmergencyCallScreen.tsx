/**
 * Emergency Call Screen
 * Professional interface for emergency consultations with workflow orchestration
 */

import React, { useState, useCallback, useEffect } from 'react';
import { ParticipantRole, LiveKitError } from '@/lib/types/livekit';
import { useLiveKitSession } from '../hooks/useLiveKitSession';
import { sessionOrchestrationService } from '../services/sessionOrchestration';
import { livekitAdvancedService } from '../services/livekitAdvanced';
import { recordingService } from '../services/recording';
import VideoConference from '../components/VideoConference';

interface EmergencyCallScreenProps {
  patientId: string;
  patientName: string;
  userRole: ParticipantRole;
  userId: string;
  userName: string;
  sessionId?: string;
  onSessionEnd?: (reason: string) => void;
  onError?: (error: LiveKitError) => void;
}

export const EmergencyCallScreen: React.FC<EmergencyCallScreenProps> = ({
  patientId,
  patientName,
  userRole,
  userId,
  userName,
  sessionId: providedSessionId,
  onSessionEnd,
  onError,
}) => {
  // Session management
  const sessionId = providedSessionId || `emergency-${Date.now()}`;
  const roomName = `emergency-${patientId}`;

  // Hook for LiveKit session management
  const livekitSession = useLiveKitSession({
    roomName,
    userName,
    userId,
    userRole,
    onError,
  });

  // Local state
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [sessionPhase, setSessionPhase] = useState<string>('initializing');
  const [showPhaseInfo, setShowPhaseInfo] = useState(true);

  // Initialize orchestration on mount
  useEffect(() => {
    const patient = livekitAdvancedService.createParticipantMetadata(
      patientId,
      patientName,
      'patient'
    );

    const orchestrationState = sessionOrchestrationService.initializeEmergencySession(
      sessionId,
      patient,
      'urgent'
    );

    setSessionPhase(orchestrationState.currentPhase);

    // Subscribe to phase transitions
    const unsubscribe = sessionOrchestrationService.onTransition(
      sessionId,
      (transition) => {
        console.log(`[EmergencyScreen] Transition: ${transition.from} -> ${transition.to}`);
        setSessionPhase(orchestrationState.currentPhase);
      }
    );

    return unsubscribe;
  }, [sessionId, patientId, patientName]);

  // Handle participant join
  const handleParticipantJoin = useCallback(
    (participant: any) => {
      console.log(`[EmergencyScreen] Participant joined: ${participant.name} (${participant.role})`);

      // Update orchestration based on role
      switch (participant.role) {
        case 'ai-agent':
          sessionOrchestrationService.addAIAgent(sessionId, participant, userId);
          setSessionPhase('triage');
          break;
        case 'doctor':
          sessionOrchestrationService.transitionToDoctor(
            sessionId,
            participant,
            userId,
            'Doctor joined consultation'
          );
          setSessionPhase('doctor-consultation');
          break;
        case 'nurse':
          sessionOrchestrationService.transitionToNurse(
            sessionId,
            participant,
            userId,
            'Nurse joined to provide support'
          );
          setSessionPhase('nurse-support');
          break;
        case 'ambulance':
          sessionOrchestrationService.dispatchAmbulance(
            sessionId,
            participant,
            userId,
            'Ambulance dispatched to patient location'
          );
          setSessionPhase('ambulance-dispatch');
          break;
      }
    },
    [sessionId, userId]
  );

  // Handle recording start
  const handleStartRecording = useCallback(async () => {
    try {
      const recId = await livekitSession.startRecording();
      setRecordingId(recId);

      // Create recording metadata
      const recording = recordingService.startRecording(
        sessionId,
        recId,
        livekitSession.participants
      );

      // Log audit event
      recordingService.addAuditLog({
        timestamp: Date.now(),
        action: 'recording-started',
        userId,
        userName,
        details: {
          recordingId: recId,
          initiatedBy: userRole,
          participantCount: livekitSession.participants.length,
        },
      });

      console.log(`[EmergencyScreen] Recording started: ${recId}`);
      return recId;
    } catch (error) {
      console.error('[EmergencyScreen] Recording start failed:', error);
      throw error;
    }
  }, [livekitSession, sessionId, userId, userName, userRole]);

  // Handle recording stop
  const handleStopRecording = useCallback(async () => {
    if (recordingId) {
      try {
        await livekitSession.stopRecording();

        // Stop recording service
        recordingService.stopRecording(recordingId);

        // Log audit event
        recordingService.addAuditLog({
          timestamp: Date.now(),
          action: 'recording-stopped',
          userId,
          userName,
          details: {
            recordingId,
            stoppedBy: userRole,
          },
        });

        console.log(`[EmergencyScreen] Recording stopped: ${recordingId}`);
        setRecordingId(null);
      } catch (error) {
        console.error('[EmergencyScreen] Recording stop failed:', error);
        throw error;
      }
    }
  }, [recordingId, livekitSession, userId, userName, userRole]);

  // Handle end call
  const handleEndCall = useCallback(async () => {
    try {
      // Stop recording if active
      if (recordingId) {
        await handleStopRecording();
      }

      // End orchestration
      sessionOrchestrationService.endSession(sessionId, userId, 'Call ended by participant');

      // Disconnect
      await livekitSession.endSession('Session ended');

      // Call parent handler
      onSessionEnd?.('call-ended');
    } catch (error) {
      console.error('[EmergencyScreen] End call failed:', error);
      onSessionEnd?.('call-ended-with-error');
    }
  }, [
    recordingId,
    handleStopRecording,
    sessionId,
    userId,
    livekitSession,
    onSessionEnd,
  ]);

  // Get phase display info
  const getPhaseInfo = () => {
    const phaseInfo: Record<string, { title: string; description: string; icon: string }> = {
      initializing: {
        title: 'Initializing',
        description: 'Setting up emergency call...',
        icon: '⏳',
      },
      triage: {
        title: 'AI Triage',
        description: 'Assessing patient symptoms with AI...',
        icon: '🤖',
      },
      'doctor-consultation': {
        title: 'Doctor Consultation',
        description: 'Doctor is reviewing your case...',
        icon: '👨‍⚕️',
      },
      'nurse-support': {
        title: 'Nurse Support',
        description: 'Nurse is providing additional support...',
        icon: '👩‍⚕️',
      },
      'ambulance-dispatch': {
        title: 'Ambulance Dispatch',
        description: 'Emergency ambulance has been dispatched...',
        icon: '🚑',
      },
      completed: {
        title: 'Session Completed',
        description: 'Thank you for using Emergency Echo',
        icon: '✅',
      },
    };

    return phaseInfo[sessionPhase] || phaseInfo['initializing'];
  };

  const phaseInfo = getPhaseInfo();

  return (
    <div className="w-full h-screen bg-slate-950 flex flex-col">
      {/* Session Info Bar */}
      {showPhaseInfo && (
        <div className="bg-slate-900 border-b border-slate-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{phaseInfo.icon}</div>
              <div>
                <h2 className="text-lg font-semibold text-white">{phaseInfo.title}</h2>
                <p className="text-sm text-slate-400">{phaseInfo.description}</p>
              </div>
            </div>
            <button
              onClick={() => setShowPhaseInfo(false)}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="Close phase info"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Video Conference Component */}
      <VideoConference
        roomName={roomName}
        userRole={userRole}
        participants={livekitSession.participants}
        localParticipant={livekitSession.localParticipant}
        isConnected={livekitSession.isConnected}
        isConnecting={livekitSession.isConnecting}
        error={livekitSession.error}
        isRecording={recordingId !== null}
        onConnect={livekitSession.connect}
        onDisconnect={livekitSession.disconnect}
        onMuteAudio={livekitSession.muteAudio}
        onUnmuteAudio={livekitSession.unmuteAudio}
        onMuteVideo={livekitSession.muteVideo}
        onUnmuteVideo={livekitSession.unmuteVideo}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        onEndCall={handleEndCall}
      />

      {/* Session Info Footer */}
      <div className="bg-slate-900 border-t border-slate-800 px-6 py-3 text-xs text-slate-400">
        <div className="flex items-center justify-between">
          <div>
            Session ID: <code className="bg-slate-800 px-2 py-1 rounded">{sessionId}</code>
          </div>
          <div>
            Participants: <span className="text-white font-semibold">{livekitSession.participants.length}</span>
          </div>
          {recordingId && (
            <div className="flex items-center gap-2 text-red-400">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Recording in progress
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmergencyCallScreen;
