# Emergency Echo — Video UI Upgrade Notes

This update focuses on the production-oriented video-call workspace and preserves the existing LiveKit/backend architecture.

## Implemented in this update

- The video stage now uses the space previously occupied by the in-screen care-team/status/session sidebar.
- Care team, emergency status, and current-session information now live in the application's right-side **Video Call** information panel.
- The generic video-call help panel now keeps the page title and "Main area for your tasks." context while surfacing live call information below it.
- Technical LiveKit room/session identifiers remain hidden from the patient-facing UI.
- Call controls now use consistent inline SVG icons instead of emoji/placeholder glyphs.
- Speaking participants receive an animated green speaking state; when video is unavailable, the participant initials are surrounded by animated voice-wave rings.
- The AI assistant floating action and mobile bottom navigation are suppressed during the video-call page so they cannot compete with call controls.
- The right-side call information reflects LiveKit participant and connection state through the lifted video-call summary state.

## Recommended next improvements

### 1. Add a real clinical emergency summary
Use authoritative emergency-session data to show:

- emergency reason / triage category
- patient location
- key vitals
- allergies and critical conditions
- current care phase
- assigned clinician
- ambulance/disposition state

These values should come from the existing backend/session model rather than client-entered UI state.

### 2. Add a compact connection-quality panel
Show actual LiveKit network quality, packet loss and reconnection state. Keep it secondary to the clinical information.

### 3. Add a focused participant mode
For multi-party calls, support:

- speaker focus
- clinician/patient pinning
- presentation/screen-share focus
- one-click return to grid

### 4. Make speaking visualization audio-driven
The current speaking animation is driven by LiveKit's `isSpeaking` participant state. A later enhancement can use measured audio level to vary the waveform amplitude in real time.

### 5. Make recording state authoritative
Only show a recording indicator when the backend confirms an actual LiveKit Egress recording is active. Recording consent and audit status should be durable and server-authoritative.

### 6. Add emergency-safe exit behavior
For an active emergency session, replace a simple leave action with a confirmation that clearly distinguishes:

- leave this device/session
- end the emergency consultation
- keep the emergency session active for the care team

### 7. Add accessibility and reduced-motion support
Provide reduced-motion behavior for the speaking waves and stronger screen-reader announcements for connection changes, participant joins/leaves, recording, and emergency escalation.
