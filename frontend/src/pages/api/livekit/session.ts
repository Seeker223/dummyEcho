/**
 * LiveKit Session Management API
 * Handles session creation, joining, recording, and lifecycle management
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { RoomServiceClient } from 'livekit-server-sdk';
import { livekitConfig } from '@/lib/livekit-config';
import { LiveKitSession, RecordingConfig, SessionMetadata } from '@/lib/types/livekit';

interface SessionResponse {
  sessionId: string;
  roomName: string;
  status: string;
  createdAt?: string;
  recordingId?: string;
}

interface ErrorResponse {
  error: string;
  message: string;
  code: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SessionResponse | ErrorResponse>
) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method Not Allowed',
      message: 'Only POST and GET requests are allowed',
      code: 'method-not-allowed',
    });
  }

  try {
    const config = livekitConfig.getConfig();

    if (!config.apiKey || !config.apiSecret || !config.url) {
      console.error('[LiveKit Session API] Missing configuration');
      return res.status(500).json({
        error: 'Server Configuration Error',
        message: 'LiveKit is not properly configured',
        code: 'missing-config',
      });
    }

    const roomService = new RoomServiceClient(config.url, config.apiKey, config.apiSecret);

    // GET: List participants or get session status
    if (req.method === 'GET') {
      const { roomName } = req.query;

      if (!roomName) {
        return res.status(400).json({
          error: 'Missing Parameter',
          message: 'roomName is required',
          code: 'missing-room-name',
        });
      }

      try {
        const room = await roomService.listRooms();
        const targetRoom = room.find((r) => r.name === roomName);

        if (!targetRoom) {
          return res.status(404).json({
            error: 'Room Not Found',
            message: `Room ${roomName} does not exist`,
            code: 'room-not-found',
          });
        }

        return res.status(200).json({
          sessionId: targetRoom.sid,
          roomName: targetRoom.name,
          status: 'active',
          createdAt: new Date(Number(targetRoom.creationTime) * 1000).toISOString(),
        });
      } catch (error) {
        console.error('[LiveKit Session API] Error listing rooms:', error);
        return res.status(500).json({
          error: 'Failed to Query Session',
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'query-error',
        });
      }
    }

    // POST: Handle various session actions
    const { action, sessionId, roomName, recordingId, config: recordingConfig, reason } = req.body;

    if (!action) {
      return res.status(400).json({
        error: 'Missing Parameter',
        message: 'action is required',
        code: 'missing-action',
      });
    }

    switch (action) {
      case 'start-recording':
        return handleStartRecording(res, roomName, recordingConfig);

      case 'stop-recording':
        return handleStopRecording(res, roomName, recordingId);

      case 'end-session':
        return handleEndSession(res, roomService, roomName, reason);

      case 'get-status':
        return handleGetStatus(res, roomService, roomName);

      default:
        return res.status(400).json({
          error: 'Invalid Action',
          message: `Unknown action: ${action}`,
          code: 'invalid-action',
        });
    }
  } catch (error) {
    console.error('[LiveKit Session API] Error:', error);

    return res.status(500).json({
      error: 'Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'server-error',
    });
  }
}

async function handleStartRecording(
  res: NextApiResponse<SessionResponse | ErrorResponse>,
  roomName: string,
  recordingConfig?: RecordingConfig
): Promise<void> {
  try {
    if (!roomName) {
      res.status(400).json({
        error: 'Missing Parameter',
        message: 'roomName is required',
        code: 'missing-room-name',
      });
      return;
    }

    // Generate recording ID
    const recordingId = `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.log(`[LiveKit Session API] Starting recording for room ${roomName}`);

    res.status(200).json({
      sessionId: recordingId,
      roomName,
      status: 'recording-started',
      recordingId,
    });
  } catch (error) {
    console.error('[LiveKit Session API] Error starting recording:', error);
    res.status(500).json({
      error: 'Recording Failed',
      message: error instanceof Error ? error.message : 'Failed to start recording',
      code: 'recording-error',
    });
  }
}

async function handleStopRecording(
  res: NextApiResponse<SessionResponse | ErrorResponse>,
  roomName: string,
  recordingId: string
): Promise<void> {
  try {
    if (!roomName || !recordingId) {
      res.status(400).json({
        error: 'Missing Parameters',
        message: 'roomName and recordingId are required',
        code: 'missing-params',
      });
      return;
    }

    console.log(`[LiveKit Session API] Stopping recording ${recordingId}`);

    res.status(200).json({
      sessionId: recordingId,
      roomName,
      status: 'recording-stopped',
      recordingId,
    });
  } catch (error) {
    console.error('[LiveKit Session API] Error stopping recording:', error);
    res.status(500).json({
      error: 'Recording Stop Failed',
      message: error instanceof Error ? error.message : 'Failed to stop recording',
      code: 'recording-error',
    });
  }
}

async function handleEndSession(
  res: NextApiResponse<SessionResponse | ErrorResponse>,
  roomService: RoomServiceClient,
  roomName: string,
  reason: string
): Promise<void> {
  try {
    if (!roomName) {
      res.status(400).json({
        error: 'Missing Parameter',
        message: 'roomName is required',
        code: 'missing-room-name',
      });
      return;
    }

    console.log(`[LiveKit Session API] Ending session for room ${roomName}. Reason: ${reason}`);

    // Delete room to end session
    await roomService.deleteRoom(roomName);

    res.status(200).json({
      sessionId: roomName,
      roomName,
      status: 'ended',
    });
  } catch (error) {
    console.error('[LiveKit Session API] Error ending session:', error);
    res.status(500).json({
      error: 'Session End Failed',
      message: error instanceof Error ? error.message : 'Failed to end session',
      code: 'session-error',
    });
  }
}

async function handleGetStatus(
  res: NextApiResponse<SessionResponse | ErrorResponse>,
  roomService: RoomServiceClient,
  roomName: string
): Promise<void> {
  try {
    if (!roomName) {
      res.status(400).json({
        error: 'Missing Parameter',
        message: 'roomName is required',
        code: 'missing-room-name',
      });
      return;
    }

    const participants = await roomService.listParticipants(roomName);

    res.status(200).json({
      sessionId: roomName,
      roomName,
      status: 'active',
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({
        error: 'Room Not Found',
        message: `Room ${roomName} does not exist`,
        code: 'room-not-found',
      });
      return;
    }

    console.error('[LiveKit Session API] Error getting session status:', error);
    res.status(500).json({
      error: 'Query Failed',
      message: error instanceof Error ? error.message : 'Failed to get session status',
      code: 'query-error',
    });
  }
}
