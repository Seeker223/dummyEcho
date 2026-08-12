# Emergency Echo — Video UI Desktop & Controls Update

## Implemented

- Reworked the video-call layout to use the available viewport height on desktop and mobile instead of relying on the parent card's intrinsic height.
- Forced the LiveKit room, video stage, focus layout, focused tile, and stage body to occupy the full available width.
- Removed blur/backdrop-filter effects from the video-call experience and replaced translucent/glass surfaces with solid, high-contrast panels.
- Kept the right-side Video Call information panel so the video workspace receives the space previously used by the care-team/status/session cards inside the call stage.
- Made microphone, camera, and screen-share controls call the LiveKit local-participant track APIs directly through `useLocalParticipant()`.
- Added async control handling, busy-state protection, and user-visible success/error feedback.
- Added a browser-permission-specific message for `NotAllowedError` when microphone, camera, or screen sharing is denied.
- Control button state is driven by LiveKit's actual `isMicrophoneEnabled`, `isCameraEnabled`, and `isScreenShareEnabled` values rather than separate local UI state.
- Preserved speaking detection and voice-wave visualization around participant avatars.

## Validation

The four modified JSX files were transpiled with the installed TypeScript compiler to validate JSX/JavaScript syntax successfully.

A full dependency-backed browser build/runtime test was not performed because the repository environment previously reported an npm registry 404 for `zod-validation-error@4.0.2` during dependency installation. No dependency versions were changed to bypass that issue.
