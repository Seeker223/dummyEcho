/**
 * Professional Call Controls Component
 * Mute/unmute, video, screen share, recording, end call
 */

import React, { useState, useCallback } from 'react';
import { ParticipantRole } from '@/lib/types/livekit';

interface CallControlsProps {
  userRole: ParticipantRole;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  onEndCall: () => void;
  disabled?: boolean;
}

export const CallControls: React.FC<CallControlsProps> = ({
  userRole,
  isAudioMuted,
  isVideoMuted,
  isScreenSharing,
  isRecording,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onStartRecording,
  onStopRecording,
  onEndCall,
  disabled = false,
}) => {
  const [showRecordingWarning, setShowRecordingWarning] = useState(false);

  // Check role permissions
  const canScreenShare = userRole !== 'ambulance' && userRole !== 'ai-agent';
  const canRecord = userRole === 'doctor' || userRole === 'admin';

  const handleRecordingToggle = useCallback(() => {
    if (!isRecording && canRecord) {
      setShowRecordingWarning(true);
      setTimeout(() => {
        onStartRecording?.();
        setShowRecordingWarning(false);
      }, 1500);
    } else if (isRecording && canRecord) {
      onStopRecording?.();
    }
  }, [isRecording, canRecord, onStartRecording, onStopRecording]);

  return (
    <div className="flex items-center justify-center gap-3 bg-slate-900 px-4 py-3 rounded-lg border border-slate-700">
      {/* Audio Control */}
      <button
        onClick={onToggleAudio}
        disabled={disabled}
        className={`p-3 rounded-full transition-all ${
          isAudioMuted
            ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
            : 'bg-slate-700 hover:bg-slate-600 text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={isAudioMuted ? 'Unmute microphone' : 'Mute microphone'}
        aria-label={isAudioMuted ? 'Unmute microphone' : 'Mute microphone'}
      >
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          {isAudioMuted ? (
            <path d="M10 3a1 1 0 011 1v2a1 1 0 11-2 0V4a1 1 0 011-1zm-3 2a1 1 0 00-1 1v4a1 1 0 001 1h1V5a1 1 0 00-1-1zM7 14a3 3 0 110 2v-2zm6 0v2a3 3 0 110-2zM8 9a2 2 0 114 0H8z" />
          ) : (
            <path d="M10 3a1 1 0 011 1v2a1 1 0 11-2 0V4a1 1 0 011-1zM6 5a1 1 0 00-1 1v4a1 1 0 001 1h1V5a1 1 0 00-1-1zm8 0a1 1 0 00-1 1v4a1 1 0 001 1h1V5a1 1 0 00-1-1zm-2 10a3 3 0 00-3 3v1a1 1 0 001 1h2v-2a1 1 0 112 0v2h2a1 1 0 001-1v-1a3 3 0 00-3-3z" />
          )}
        </svg>
      </button>

      {/* Video Control */}
      <button
        onClick={onToggleVideo}
        disabled={disabled}
        className={`p-3 rounded-full transition-all ${
          isVideoMuted
            ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
            : 'bg-slate-700 hover:bg-slate-600 text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={isVideoMuted ? 'Turn on camera' : 'Turn off camera'}
        aria-label={isVideoMuted ? 'Turn on camera' : 'Turn off camera'}
      >
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          {isVideoMuted ? (
            <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm14-4a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1h12z" />
          ) : (
            <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm14-4a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1h12z" />
          )}
        </svg>
      </button>

      {/* Screen Share Control */}
      {canScreenShare && (
        <button
          onClick={onToggleScreenShare}
          disabled={disabled}
          className={`p-3 rounded-full transition-all ${
            isScreenSharing
              ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400'
              : 'bg-slate-700 hover:bg-slate-600 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
          aria-label={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 11-2 0V5H5v4h4a1 1 0 110 2H5v4h8v-1a1 1 0 112 0v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
          </svg>
        </button>
      )}

      {/* Recording Control */}
      {canRecord && (
        <button
          onClick={handleRecordingToggle}
          disabled={disabled}
          className={`p-3 rounded-full transition-all ${
            isRecording
              ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
              : 'bg-slate-700 hover:bg-slate-600 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title={isRecording ? 'Stop recording' : 'Start recording'}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            {isRecording ? (
              <rect x="5" y="5" width="10" height="10" rx="2" />
            ) : (
              <circle cx="10" cy="10" r="5" />
            )}
          </svg>
        </button>
      )}

      {/* Divider */}
      <div className="h-8 w-px bg-slate-600" />

      {/* End Call Button */}
      <button
        onClick={onEndCall}
        disabled={disabled}
        className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        title="End call"
        aria-label="End call"
      >
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M3 2a1 1 0 011-1h3.5a1 1 0 01.82.45l2.7 4.05a1 1 0 01.16 1.02l-.85 2.55a7 7 0 002.22 2.22l2.55-.85a1 1 0 011.02.16l4.05 2.7a1 1 0 01.45.82V17a1 1 0 01-1 1h-2.694a1 1 0 01-.997-.923c-.596-6.547-2.907-10.128-7.662-10.128-4.38 0-7.662 3.295-7.662 9.128C3 17.464 4.889 19 6.306 19h2.694a1 1 0 001-1v-2.694a1 1 0 00-.923-.997c-6.547-.596-10.128-2.907-10.128-7.662 0-4.38 3.295-7.662 9.128-7.662z" />
        </svg>
      </button>

      {/* Recording Warning Indicator */}
      {showRecordingWarning && (
        <div className="absolute bottom-16 right-4 bg-red-500 text-white px-3 py-2 rounded text-sm animate-fade-in">
          Recording started - All participants are being recorded
        </div>
      )}
    </div>
  );
};

export default CallControls;
