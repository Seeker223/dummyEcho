import PublicSeoPage from '../shared/components/PublicSeoPage'

const faqItems = [
  ['What is EmergencyEcho?', 'EmergencyEcho is a voice AI emergency health assistant for symptom guidance, medical kit records, clinician video workflows, payments, and healthcare marketplace services.'],
  ['Can patients use EmergencyEcho?', 'Yes. Patients can use EchoAI, fill a Digital Medical Kit, explore doctors, manage EchoWallet, and access emergency support workflows.'],
  ['Can doctors and nurses use EchoAI?', 'Doctors and nurses use EchoAI inside patient call sessions after accepting patient calls or reviewing medical summaries.'],
  ['What is the Digital Medical Kit?', 'It is a structured health profile containing vitals, allergies, medications, medical history, sex-specific fields, emergency contacts, and role-specific verification records.'],
  ['Does EmergencyEcho replace emergency services?', 'No. EmergencyEcho is a support platform. Life-threatening symptoms require immediate local emergency services or in-person hospital care.'],
  ['Does EmergencyEcho support payments?', 'Yes. The prototype includes EchoWallet, add funds, withdraw funds, call credit purchases, subscriptions, and marketplace payment flows.'],
]

export default function FaqPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer,
      },
    })),
  }

  return (
    <PublicSeoPage
      title="EmergencyEcho FAQ"
      description="Answers about EmergencyEcho, EchoAI, Digital Medical Kit, clinician video calls, EchoWallet payments, and emergency care safety."
      path="/faq"
      structuredData={structuredData}
    >
      {faqItems.map(([question, answer]) => (
        <section key={question}>
          <h2>{question}</h2>
          <p>{answer}</p>
        </section>
      ))}
    </PublicSeoPage>
  )
}
