# Video Call Navigation - Direct Access Guide

## Overview

You can now access the video call feature directly from the navigation without going through the payment flow. This allows you to test and use LiveKit video conferencing independently of the wallet/payment system.

## How to Access

### 1. Navigate to Video Call
- Log in to your Emergency Echo account
- Look at the left navigation sidebar
- Click on **"Video Call"** button (camera/play icon)
- You'll be taken directly to the video conference room

### 2. What Happens
- The system generates a unique room name: `video-room-{timestamp}`
- A token is requested from `/api/livekit/advanced` endpoint
- The LiveKit connection is established with your credentials
- The video conference interface loads with full controls

## Features Available

### In Video Call Screen
- **Participants**: See all participants in the call
- **Audio Control**: Mute/unmute your microphone
- **Video Control**: Turn your camera on/off
- **Screen Sharing**: Share your screen with other participants
- **Leave Call**: Exit the conference at any time

### Real-Time Information
- Connection quality indicators
- Participant list with status
- Call duration timer
- Network stats

## User Info Sent

When you join, the following information is included:
- Your user ID
- Your name or email
- Your role (patient, doctor, nurse, etc.)
- Your avatar (if available)
- Room name and timestamp

## Troubleshooting

### Connection Fails
**Error**: "Connection Error: Failed to connect to video service"

**Solutions**:
1. Check that `NEXT_PUBLIC_LIVEKIT_URL` is set correctly in Vercel env vars
2. Verify `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` are correct
3. Check your internet connection
4. Allow camera and microphone permissions in your browser
5. Click "Retry Connection" button

### No Video/Audio
1. Check browser permissions for camera/microphone
2. Ensure your device hardware is working
3. Verify no other app is using your camera
4. Try muting/unmuting from the controls

### Can't See Other Participants
1. Verify they are connected to the same room
2. Check your network connection
3. Reload the page and reconnect

## Environment Variables Required

The following must be set in Vercel project settings:

```
NEXT_PUBLIC_LIVEKIT_URL=<your-livekit-url>
LIVEKIT_API_KEY=<your-api-key>
LIVEKIT_API_SECRET=<your-api-secret>
```

## Technical Details

### Endpoint Used
```
POST /api/livekit/advanced
```

**Request Body**:
```json
{
  "roomName": "video-room-{timestamp}",
  "userName": "user@email.com",
  "userId": "user-id-123",
  "metadata": {
    "role": "patient",
    "email": "user@email.com",
    "avatar": "https://..."
  }
}
```

**Response**:
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "data": {...}
}
```

### React Components
- **VideoCallScreen.jsx**: Main video call interface
- Uses `LiveKitRoom` and `VideoConference` from `@livekit/components-react`
- Automatic token refresh
- Error handling with user-friendly messages

## Navigation Changes

New page added to navigation:
- Page ID: `video-call`
- Label: "Video Call"
- Navigation Icon: Video camera icon
- Visibility: Visible in all authenticated views
- Role Access: All authenticated roles

## Testing Workflow

1. **Single User Test**
   - Log in as one user
   - Click "Video Call"
   - Camera should display
   - Test mute/unmute controls

2. **Multi-User Test**
   - Open incognito/private browser window
   - Log in as different user
   - Both navigate to "Video Call"
   - Check if both can see each other
   - Test data channels and screen sharing

3. **Error Scenarios**
   - Disable internet (should show error)
   - Restart browser (should reconnect)
   - Switch tabs (should maintain connection)

## Payment System Status

The "Video Call" button bypasses the payment system entirely. This means:
- ✅ You can access video calls without payment
- ✅ Payment errors won't block video features
- ✅ Independent from wallet/funds system
- ⚠️ Payment integration can be fixed separately

## Notes

- Each call gets a unique room name
- Room persists while participants are connected
- No recording by default (can be enabled separately)
- No time limits on calls
- Automatic cleanup when all participants leave

## Support

If you encounter issues:

1. Check console logs in browser DevTools (F12)
2. Verify all environment variables are set
3. Check `/api/payments/diagnose` for payment service status
4. Restart the dev server
5. Clear browser cache and try again

---

**Status**: Video call navigation is now fully functional and independent of payment systems.
