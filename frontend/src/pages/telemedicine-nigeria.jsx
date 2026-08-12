import PublicSeoPage from '../shared/components/PublicSeoPage'

export default function TelemedicineNigeriaPage() {
  return (
    <PublicSeoPage
      title="Telemedicine in Nigeria for Emergency Health Support"
      description="Learn how EmergencyEcho supports telemedicine in Nigeria with voice AI triage, Digital Medical Kit records, doctor and nurse video workflows, and EchoWallet payments."
      path="/telemedicine-nigeria"
      eyebrow="Telemedicine Nigeria"
    >
      <h2>Telemedicine built around urgent context</h2>
      <p>
        EmergencyEcho focuses on moments when the patient needs to explain symptoms quickly and safely. The platform
        helps collect health context, present a medical summary, and support voice or video workflows between patients
        and clinicians.
      </p>
      <h2>Core telemedicine workflows</h2>
      <div className="seo-grid">
        <div className="seo-tile">
          <strong>Voice AI triage</strong>
          Patients can describe symptoms by voice or text before escalation.
        </div>
        <div className="seo-tile">
          <strong>Doctor and nurse video</strong>
          Clinicians can review patient summaries and continue care inside the call session.
        </div>
        <div className="seo-tile">
          <strong>EchoWallet</strong>
          Simulated payment flows support call credits, subscriptions, wallet top-ups, and withdrawals.
        </div>
      </div>
      <h2>Why Nigeria needs faster triage</h2>
      <p>
        Digital health workflows can reduce repeated explanations, improve preparation before clinician calls, and make
        medical context easier to share during urgent care situations.
      </p>
    </PublicSeoPage>
  )
}
