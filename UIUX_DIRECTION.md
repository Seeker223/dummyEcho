# Emergency Echo UI/UX Direction

This dummy frontend is derived directly from the three supplied UI spreadsheets.

## Shared visual language
- Primary red: `#D60000`
- Emergency red: `#FF3830`
- Success green: `#34C759`
- Warning yellow: `#FFCC00`
- Info blue: `#007AFF`
- Primary text: `#101010`
- Secondary text: `#687280`
- Background: `#FAFAFA`
- Surface: `#FFFFFF`
- Border: `#E5E7EB`
- Inter typography
- 8pt spacing rhythm
- 8/12/16/24/32px corner language
- Solid surfaces and restrained shadows; no glassmorphism

## Information architecture represented
1. Splash/onboarding direction
2. Home dashboard
3. AI voice interface
4. Emergency detection
5. Doctor discovery/connected doctor
6. Video call
7. Voice call
8. AI conversation
9. Emergency timeline
10. Summary report

## Implementation boundary
This repo is a frontend dummy/prototype. It intentionally does not implement:
- real LiveKit tokens or room authentication
- real medical diagnosis
- ambulance dispatch
- persistence
- real notifications
- patient records
- production HIPAA/NDPR controls

The LiveKit packages are included so the video/voice screens can later be connected to the same real-time stack used by the Emergency Echo application.
