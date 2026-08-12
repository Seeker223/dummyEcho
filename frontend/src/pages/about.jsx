import PublicSeoPage from '../shared/components/PublicSeoPage'

export default function AboutPage() {
  return (
    <PublicSeoPage
      title="About EmergencyEcho"
      description="EmergencyEcho is a voice AI emergency health assistant helping patients, doctors, nurses, and healthcare partners respond faster during urgent health situations."
      path="/about"
    >
      <h2>What EmergencyEcho does</h2>
      <p>
        EmergencyEcho helps people explain health concerns quickly, organize critical medical information, and connect
        with appropriate care workflows. The platform combines EchoAI guidance, a Digital Medical Kit, clinician video
        sessions, EchoWallet payments, and partner marketplace services.
      </p>
      <div className="seo-grid">
        <div className="seo-tile">
          <strong>Patients</strong>
          Voice or text symptom guidance, medical kit records, doctor discovery, and emergency-ready information.
        </div>
        <div className="seo-tile">
          <strong>Doctors and nurses</strong>
          Incoming triage queues, patient summaries, secure video sessions, prescriptions, and simulated wallet payouts.
        </div>
        <div className="seo-tile">
          <strong>Partners</strong>
          Marketplace visibility for pharmacies, labs, wellness providers, clinics, and care support services.
        </div>
      </div>
      <h2>Why it matters</h2>
      <p>
        In urgent situations, people often struggle to explain symptoms, allergies, medications, and medical history.
        EmergencyEcho is designed to reduce that friction and help care teams see the right context faster.
      </p>
      <h2>Important safety note</h2>
      <p>
        EmergencyEcho supports health decision-making and access workflows, but it does not replace emergency services,
        hospitals, doctors, or nurses. If symptoms are life-threatening, contact local emergency responders immediately.
      </p>
    </PublicSeoPage>
  )
}
