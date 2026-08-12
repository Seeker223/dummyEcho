/**
 * Professional Video Conference Component
 * Main interface for video/voice calls with participant gallery and controls
 */

import React, { useState, useCallback, useEffect } from 'react';
import { ParticipantMetadata, ParticipantRole, LiveKitError } from '@/lib/types/livekit';
import CallControls from './CallControls';
import ParticipantPanel from './ParticipantPanel';

interface VideoConferenceProps {
  roomName: string;
  userRole: ParticipantRole;
  participants: ParticipantMetadata[];
  localParticipant: ParticipantMetadata | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: LiveKitError | null;
  isScreenSharing?: boolean;
  isRecording?: boolean;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
  onMuteAudio: () => void;
  onUnmuteAudio: () => void;
  onMuteVideo: () => void;
  onUnmuteVideo: () => void;
  onToggleScreenShare?: () => void;
  onStartRecording?: () => Promise<string>;
  onStopRecording?: () => Promise<void>;
  onEndCall: () => Promise<void>;
}

export const VideoConference: React.FC<VideoConferenceProps> = ({
  roomName,
  userRole,
  participants,
  localParticipant,
  isConnected,
  isConnecting,
  error,
  isScreenSharing = false,
  isRecording = false,
  onConnect,
  onDisconnect,
  onMuteAudio,
  onUnmuteAudio,
  onMuteVideo,
  onUnmuteVideo,
  onToggleScreenShare,
  onStartRecording,
  onStopRecording,
  onEndCall,
}) => {
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [showLayout, setShowLayout] = useState<'gallery' | 'speaker'>('gallery');
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'stopping'>('idle');

  // Auto-connect on mount
  useEffect(() => {
    if (!isConnected && !isConnecting && !error) {
      onConnect();
    }
  }, [isConnected, isConnecting, error, onConnect]);

  // Handle audio toggle
  const handleToggleAudio = useCallback(() => {
    if (isAudioMuted) {
      onUnmuteAudio();
    } else {
      onMuteAudio();
    }
    setIsAudioMuted(!isAudioMuted);
  }, [isAudioMuted, onMuteAudio, onUnmuteAudio]);

  // Handle video toggle
  const handleToggleVideo = useCallback(() => {
    if (isVideoMuted) {
      onUnmuteVideo();
    } else {
      onMuteVideo();
    }
    setIsVideoMuted(!isVideoMuted);
  }, [isVideoMuted, onMuteVideo, onUnmuteVideo]);

  // Handle screen share toggle
  const handleToggleScreenShare = useCallback(async () => {
    if (onToggleScreenShare) {
      try {
        onToggleScreenShare();
      } catch (error) {
        console.error('[VideoConference] Screen share error:', error);
      }
    }
  }, [onToggleScreenShare]);

  // Handle recording toggle
  const handleToggleRecording = useCallback(async () => {
    if (isRecording) {
      setRecordingStatus('stopping');
      try {
        await onStopRecording?.();
        setRecordingStatus('idle');
      } catch (error) {
        console.error('[VideoConference] Recording stop error:', error);
        setRecordingStatus('idle');
      }
    } else {
      setRecordingStatus('recording');
      try {
        await onStartRecording?.();
      } catch (error) {
        console.error('[VideoConference] Recording start error:', error);
        setRecordingStatus('idle');
      }
    }
  }, [isRecording, onStartRecording, onStopRecording]);

  // Handle end call
  const handleEndCall = useCallback(async () => {
    try {
      await onEndCall();
    } catch (error) {
      console.error('[VideoConference] End call error:', error);
    }
  }, [onEndCall]);

  return (
    <div className="flex flex-col h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">{roomName}</h1>
            <p className="text-sm text-slate-400 mt-1">
              {isConnected ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Connected
                </span>
              ) : isConnecting ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                  Connecting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                  Disconnected
                </span>
              )}
            </p>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-4">
            {/* Recording Indicator */}
            {isRecording && (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded text-red-400 text-sm">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Recording
              </div>
            )}

            {/* Screen Share Indicator */}
            {isScreenSharing && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-blue-400 text-sm">
                <span className="w-2 h-2 bg-blue-500 rounded-full" />
                Screen Sharing
              </div>
            )}

            {/* User Role Badge */}
            <div className="px-3 py-1 bg-slate-800 rounded text-xs font-medium text-slate-300">
              {userRole}
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 border-b border-red-500/30 px-6 py-3 text-red-200 text-sm">
          <div className="font-semibold mb-1">Connection Error</div>
          <div>{error.message}</div>
          {error.recoveryStrategy && (
            <div className="text-xs text-red-300 mt-1">
              Recovery strategy: {error.recoveryStrategy}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Video Grid */}
          <div className="flex-1 bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
            {isConnected && participants.length > 0 ? (
              <div className="w-full h-full grid grid-cols-2 gap-1 p-2 auto-rows-fr">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="bg-slate-800 rounded overflow-hidden flex items-center justify-center relative group"
                  >
                    {/* Placeholder for video stream */}
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
                      <div className="text-4xl mb-2">
                        {getRoleEmoji(participant.role)}
                      </div>
                      <div className="text-white font-semibold text-sm text-center px-2">
                        {participant.name}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {participant.role}
                      </div>

                      {/* Mute Indicators */}
                      {(participant.muteStatus?.audio || participant.muteStatus?.video) && (
                        <div className="absolute top-2 right-2 flex gap-1">
                          {participant.muteStatus?.audio && (
                            <div className="bg-red-500/80 rounded p-1" title="Microphone muted">
                              🔇
                            </div>
                          )}
                          {participant.muteStatus?.video && (
                            <div className="bg-red-500/80 rounded p-1" title="Camera off">
                              📹
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <div className="text-5xl mb-4">📹</div>
                  <p>Waiting for participants...</p>
                </div>
              </div>
            )}
          </div>

          {/* Call Controls */}
          <CallControls
            userRole={userRole}
            isAudioMuted={isAudioMuted}
            isVideoMuted={isVideoMuted}
            isScreenSharing={isScreenSharing}
            isRecording={recordingStatus === 'recording'}
            onToggleAudio={handleToggleAudio}
            onToggleVideo={handleToggleVideo}
            onToggleScreenShare={handleToggleScreenShare}
            onStartRecording={handleToggleRecording}
            onStopRecording={handleToggleRecording}
            onEndCall={handleEndCall}
            disabled={!isConnected}
          />
        </div>

        {/* Sidebar - Participant Panel */}
        <div className="w-80 flex-shrink-0">
          <ParticipantPanel
            participants={participants}
            localParticipantId={localParticipant?.id}
            maxHeight="calc(100vh - 280px)"
          />
        </div>
      </div>
    </div>
  );
};

function getRoleEmoji(role: string): string {
  const emojis: Record<string, string> = {
    patient: '👤',
    doctor: '👨‍⚕️',
    nurse: '👩‍⚕️',
    'ai-agent': '🤖',
    ambulance: '🚑',
    admin: '👨‍💼',
  };
  return emojis[role] || '👤';
}

export default VideoConference;
