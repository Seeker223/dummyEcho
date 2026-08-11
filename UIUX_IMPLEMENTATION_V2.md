# Emergency Echo Dummy UI — UX Foundation v2

This update is based on the supplied `dummyEcho-main.zip` and the three Emergency Echo UI/UX spreadsheet references discussed in the project.

## What changed

### 1. Three explicit visual modes
- **Normal healthcare:** light canvas, white cards, red primary actions.
- **Emergency:** light canvas with stronger red urgency cues and action hierarchy.
- **Live communication:** dark immersive workspace for video, voice, and AI listening.

### 2. Shared component layer
Added reusable primitives:
- `StatusBadge`
- `StatCard`
- `ActionRow`
- `Waveform`
- `CallControlBar`
- `VideoTile`

The existing `AppShell`, `Sidebar`, `Topbar`, `Logo`, and `Avatar` were also tightened for consistency.

### 3. Responsive behavior
- Desktop navigation is grouped into Main / Communication / Records.
- Mobile navigation remains a five-item bottom bar.
- Page content uses a centered max-width canvas.
- Live communication pages use a flexible main stage plus a scrollable information rail on wide screens.
- Video and voice stages have mobile-safe minimum heights and controls that remain reachable.

### 4. Video call direction
The dummy now visually represents:
- clinician as the primary participant
- patient as the secondary participant
- optional live transcript
- care-team state
- patient vitals
- AI assistant context
- session safety
- speaking-state waveform around the active participant

The controls are intentionally still **dummy/local UI state**. They do not claim to be connected to a LiveKit room in this repository.

### 5. Voice call direction
The dummy now represents:
- clinician voice identity
- speaking waveform
- connection/voice quality cards
- microphone, speaker, Bluetooth, keypad and end-call controls
- AI listening/transcript context

### 6. AI and emergency mode
The AI screen now separates:
- listening experience
- triage state
- emergency actions
- AI context
- safety guidance

The emergency screen uses a stronger action hierarchy and reusable action rows.

## Intentionally not included yet

The supplied repository does not yet contain the later Partnership / Marketplace pages. Those should be added only when the corresponding UI/UX source pages are incorporated into this baseline.

Real authentication, payments, dispatch, medical triage, browser media permissions, LiveKit publishing/subscribing, and clinical data are outside this dummy UI scope.

## Validation

Local import references were checked after the refactor. A full Next.js build could not be run in the provided runtime because the uploaded repository's installed `node_modules` is incomplete (`next` and several type packages are missing). The package manifest and lockfile were left unchanged.
