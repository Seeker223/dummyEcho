/**
 * Participant Panel Component
 * Displays live participant list with role indicators and connection quality
 */

import React from 'react';
import { ParticipantMetadata } from '@/lib/types/livekit';

interface ParticipantPanelProps {
  participants: ParticipantMetadata[];
  localParticipantId?: string;
  maxHeight?: string;
}

const getRoleIcon = (role: string): string => {
  const icons: Record<string, string> = {
    patient: '👤',
    doctor: '👨‍⚕️',
    nurse: '👩‍⚕️',
    'ai-agent': '🤖',
    ambulance: '🚑',
    admin: '👨‍💼',
  };
  return icons[role] || '👤';
};

const getRoleBadgeColor = (role: string): string => {
  const colors: Record<string, string> = {
    patient: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    doctor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    nurse: 'bg-green-500/20 text-green-300 border-green-500/30',
    'ai-agent': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    ambulance: 'bg-red-500/20 text-red-300 border-red-500/30',
    admin: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  };
  return colors[role] || 'bg-slate-500/20 text-slate-300 border-slate-500/30';
};

const getConnectionQualityColor = (quality?: string): string => {
  const colors: Record<string, string> = {
    excellent: 'text-green-400',
    good: 'text-green-500',
    fair: 'text-yellow-500',
    poor: 'text-orange-500',
    lost: 'text-red-500',
  };
  return colors[quality || 'excellent'] || 'text-slate-400';
};

const getConnectionQualityLabel = (quality?: string): string => {
  const labels: Record<string, string> = {
    excellent: '●●●●●',
    good: '●●●●○',
    fair: '●●●○○',
    poor: '●●○○○',
    lost: '●○○○○',
  };
  return labels[quality || 'excellent'] || '●●●●●';
};

export const ParticipantPanel: React.FC<ParticipantPanelProps> = ({
  participants,
  localParticipantId,
  maxHeight = '400px',
}) => {
  return (
    <div className="flex flex-col bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-800 border-b border-slate-700">
        <h3 className="text-sm font-semibold text-white">
          Participants ({participants.length})
        </h3>
      </div>

      {/* Participant List */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ maxHeight }}
      >
        {participants.length === 0 ? (
          <div className="px-4 py-8 text-center text-slate-400 text-sm">
            No participants yet
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className={`px-4 py-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors ${
                  participant.id === localParticipantId ? 'bg-slate-800/30' : ''
                }`}
              >
                {/* Participant Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getRoleIcon(participant.role)}</span>
                    <span className="text-sm font-medium text-white truncate">
                      {participant.name}
                      {participant.id === localParticipantId && (
                        <span className="text-xs text-slate-400 ml-1">(You)</span>
                      )}
                    </span>
                  </div>

                  {/* Role Badge */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded border ${getRoleBadgeColor(
                        participant.role
                      )}`}
                    >
                      {participant.role}
                    </span>

                    {/* Mute Status */}
                    <div className="flex items-center gap-1">
                      {participant.muteStatus?.audio && (
                        <span
                          className="text-red-400 text-xs"
                          title="Microphone muted"
                        >
                          🔇
                        </span>
                      )}
                      {participant.muteStatus?.video && (
                        <span
                          className="text-red-400 text-xs"
                          title="Camera off"
                        >
                          📹
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Connection Quality */}
                <div className="ml-3 text-right flex-shrink-0">
                  <div
                    className={`text-xs font-mono ${getConnectionQualityColor(
                      participant.connectionQuality
                    )}`}
                    title={`Connection: ${participant.connectionQuality || 'excellent'}`}
                  >
                    {getConnectionQualityLabel(participant.connectionQuality)}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {participant.connectionQuality || 'Excellent'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-slate-800 border-t border-slate-700 text-xs text-slate-400">
        <div>Active: {participants.length}</div>
      </div>
    </div>
  );
};

export default ParticipantPanel;
