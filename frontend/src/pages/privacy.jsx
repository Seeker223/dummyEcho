import PublicSeoPage from '../shared/components/PublicSeoPage'

export default function PrivacyPage() {
  return (
    <PublicSeoPage
      title="Privacy Policy"
      description="EmergencyEcho privacy overview for patient health information, account data, document uploads, EchoWallet payments, and consultation workflows."
      path="/privacy"
    >
      <h2>Privacy overview</h2>
      <p>
        EmergencyEcho is designed around sensitive health workflows. The prototype demonstrates how patients,
        clinicians, administrators, and partners may interact with medical information, documents, payments, and call
        records.
      </p>
      <h2>Information the product may handle</h2>
      <ul>
        <li>Account details such as name, role, contact information, and preferences.</li>
        <li>Digital Medical Kit details such as allergies, medications, vitals, emergency contacts, and history.</li>
        <li>Professional verification uploads for doctors and nurses.</li>
        <li>Payment workflow records for EchoWallet, call credits, plans, withdrawals, and marketplace activity.</li>
      </ul>
      <h2>Health data protection</h2>
      <p>
        Production handling of health data should use encryption, role-based access controls, audit logs, secure
        consent flows, and applicable Nigerian data protection requirements. Prototype data should not be treated as a
        production medical record.
      </p>
    </PublicSeoPage>
  )
}
