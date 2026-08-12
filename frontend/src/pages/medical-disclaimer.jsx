import PublicSeoPage from '../shared/components/PublicSeoPage'

export default function MedicalDisclaimerPage() {
  return (
    <PublicSeoPage
      title="Medical Disclaimer"
      description="EmergencyEcho medical disclaimer explaining that EchoAI guidance and digital workflows do not replace emergency services, doctors, nurses, or hospital care."
      path="/medical-disclaimer"
    >
      <h2>Emergency guidance limitation</h2>
      <p>
        EmergencyEcho and EchoAI provide informational guidance and workflow support. They do not provide a definitive
        medical diagnosis and should not be used as the only source of care in a serious or life-threatening situation.
      </p>
      <h2>When to seek urgent help</h2>
      <p>
        If someone has chest pain, severe breathing difficulty, unconsciousness, severe bleeding, stroke symptoms,
        poisoning, seizure, major trauma, or any rapidly worsening symptom, contact local emergency services or go to the
        nearest hospital immediately.
      </p>
      <h2>Clinician involvement</h2>
      <p>
        Doctors and nurses using EmergencyEcho should apply independent clinical judgment, verify patient information,
        and follow applicable professional standards and local regulations.
      </p>
    </PublicSeoPage>
  )
}
