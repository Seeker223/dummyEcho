# Emergency Echo — Video UI Implementation

## Scope

This update implements the production-oriented video-call UI changes identified in the video UI audit. It is focused on the user-facing video experience and does not claim to replace the server-side LiveKit authorization, recording, or emergency orchestration work.

## Implemented

- Unified the primary `/app/video-call` experience around one LiveKit-native room surface.
- Replaced technical room/session identifiers in the visible UI with patient/care-team oriented language.
- Added truthful connection states: connecting, connected, reconnecting, disconnected, and connection error.
- Added a dedicated emergency-session status treatment.
- Added a single modern call-control bar using LiveKit room state for microphone, camera, and screen sharing.
- Removed the misleading recording control from the primary UI until the backend can report a real recording/Egress state.
- Added participant tiles backed by actual LiveKit participants and camera tracks.
- Added role-aware participant labels and speaking state.
- Added a compact care-team sidebar driven by actual LiveKit participants.
- Added emergency context guidance and current-user session information.
- Added responsive desktop/tablet/mobile layouts.
- Added keyboard focus states and accessible labels for call controls and participant focus.
- Avoided displaying LiveKit room names and internal session identifiers to patients.
- Kept the existing token endpoint and backend architecture unchanged in this UI-focused implementation.

## Validation

The two updated JSX files were syntax/type-checked with the repository's available TypeScript compiler using JSX parsing and no emit.

A full application dependency install/build could not be completed in this environment because the configured package registry returned a 404 for `zod-validation-error@4.0.2`. No dependency versions were changed.
