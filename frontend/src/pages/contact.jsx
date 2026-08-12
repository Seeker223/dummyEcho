import PublicSeoPage from '../shared/components/PublicSeoPage'

export default function ContactPage() {
  return (
    <PublicSeoPage
      title="Contact EmergencyEcho"
      description="Contact EmergencyEcho for patient support, clinician onboarding, healthcare partnerships, demos, and product enquiries."
      path="/contact"
    >
      <h2>Get in touch</h2>
      <p>
        EmergencyEcho is open to patients, medical professionals, healthcare partners, product collaborators, and
        organizations interested in safer emergency response workflows.
      </p>
      <div className="seo-grid">
        <div className="seo-tile">
          <strong>Patient support</strong>
          Questions about accounts, Digital Medical Kit, EchoAI, EchoWallet, or consultations.
        </div>
        <div className="seo-tile">
          <strong>Clinician onboarding</strong>
          Doctors and nurses can register, upload verification documents, and join the care network.
        </div>
        <div className="seo-tile">
          <strong>Partnerships</strong>
          Pharmacies, labs, clinics, wellness providers, and health organizations can explore marketplace partnerships.
        </div>
      </div>
      <h2>Official links</h2>
      <p>
        Start from the <a href="/">EmergencyEcho homepage</a>, create an account at <a href="/signup">registration</a>,
        or sign in from <a href="/login">login</a>.
      </p>
    </PublicSeoPage>
  )
}
