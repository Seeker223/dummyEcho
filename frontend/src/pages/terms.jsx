import PublicSeoPage from '../shared/components/PublicSeoPage'

export default function TermsPage() {
  return (
    <PublicSeoPage
      title="Terms of Use"
      description="EmergencyEcho terms overview for using EchoAI, Digital Medical Kit, clinician sessions, EchoWallet, marketplace features, and role-based access."
      path="/terms"
    >
      <h2>Using EmergencyEcho</h2>
      <p>
        EmergencyEcho provides digital workflows for health guidance, role-based access, simulated payments, clinician
        sessions, and marketplace services. Users are responsible for providing accurate information and seeking urgent
        in-person care when needed.
      </p>
      <h2>Medical limitation</h2>
      <p>
        EchoAI and EmergencyEcho are not substitutes for a licensed clinician, hospital, ambulance service, or emergency
        responder. The platform supports communication and triage workflows but does not guarantee diagnosis, treatment,
        or outcomes.
      </p>
      <h2>Professional accounts</h2>
      <p>
        Doctors and nurses may be required to upload government ID, annual licence, qualifications, and registration
        documents. Verification workflows must be completed before live production use.
      </p>
    </PublicSeoPage>
  )
}
