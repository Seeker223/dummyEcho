# Emergency Echo Video UI — Production UX Update

This update builds on the audited video-call UI and implements the recommended next UX improvements.

## Implemented

- Video stage remains the dominant workspace while the right-side `Video Call` information panel holds contextual information.
- Preserved the `Main area for your tasks` and `What you can do here` guidance above live call context.
- Care team panel now shows participant role, speaking state, and LiveKit-reported connection quality when available.
- Emergency status panel shows the current inferred care phase and explicit severity/reason/location fallbacks when the session context does not provide them.
- Patient safety snapshot surfaces available medical-kit fields without inventing missing clinical information.
- Live vitals panel accepts real LiveKit data-channel messages with `type: "vital"`, `type: "vitals"`, or `topic: "vitals"`.
- Focus mode makes the selected participant the primary video and moves other participants into a thumbnail strip.
- The first remote participant is preferred as the initial focus when available.
- Speaking detection uses LiveKit participant speaking state and the participant audio level when exposed by the SDK. Avatar waveforms respond to the live level while speaking.
- Network quality is displayed from the participant's LiveKit `connectionQuality` state when available.
- Clinician identity is displayed using participant names and role/specialty metadata when supplied.
- Leaving the emergency consultation now requires an explicit confirmation.
- Recording status in the sidebar is deliberately authoritative-only: the UI does not claim that recording is active unless an authoritative session layer supplies that state.
- Technical room/session identifiers remain hidden from the patient-facing UI.

## Intentionally not fabricated

- No emergency severity, diagnosis, location, or vital values are invented when they are not present in the authenticated/session data.
- The existing repository's recording backend was not reimplemented as part of this UI change.
- The existing legacy `EmergencyCallScreen` architecture was not silently rewritten; the primary routed `video-call` experience is the updated LiveKit-native UI.

## Live vitals message shape

The LiveKit room listener accepts JSON payloads such as:

```json
{
  "type": "vital",
  "payload": {
    "heart_rate": 104,
    "spo2": "94%",
    "temperature": "37.1 C"
  }
}
```

or:

```json
{
  "topic": "vitals",
  "vitals": {
    "heart_rate": 104
  }
}
```

Only received values are rendered in the UI.

## Desktop viewport and LiveKit control correction

- The focused participant tile is forced to consume the full available central video stage width and height.
- LiveKit `VideoTrack` wrapper layers are explicitly stretched to the tile bounds so portrait camera feeds do not collapse into a narrow column.
- Video uses `object-fit: cover` so the feed fills the available stage rather than preserving a narrow intrinsic camera width.
- Microphone, camera, and screen-share controls call the `LocalParticipant` methods directly (`setMicrophoneEnabled`, `setCameraEnabled`, `setScreenShareEnabled`). This matches the current LiveKit React/JS client API and avoids treating nonexistent setters from `useLocalParticipant()` as functions.
