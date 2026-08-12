import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import styled from 'styled-components'
import { InPageMenuButton } from '../components/InPageMenuButton'
import { VoiceSessionSection } from '../components/VoiceSessionSection'
import { Screen } from './ScreenPrimitives'
import { CallTypeSheetModal } from '../components/CallTypeSheetModal'

const Shell = styled(Screen)`
  /* Voice screens are full-bleed on mobile (no bottom nav). */
  @media (max-width: 640px) {
    padding-bottom: 18px;
  }
`

export default function VoiceScreen() {
  const navigate = useNavigate()
  const [callOpen, setCallOpen] = useState(false)

  return (
    <Shell>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
        <InPageMenuButton />
      </div>

      <VoiceSessionSection
        onOpenVoiceAi={() => navigate('/app/voice-ai')}
        onOpenChatSeed={(seed) => navigate('/app/chat', { state: { seed } })}
        onCallClinician={() => setCallOpen(true)}
      />

      <CallTypeSheetModal
        isOpen={callOpen}
        title="Call a clinician"
        message="Choose voice or video call (simulated)."
        onClose={() => setCallOpen(false)}
        onPick={(type) => {
          setCallOpen(false)
          navigate('/app/doctor-live', { state: { callType: type, source: 'voice-session' } })
        }}
      />
    </Shell>
  )
}
