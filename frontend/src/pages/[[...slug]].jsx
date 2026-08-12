import dynamic from 'next/dynamic'
import Head from 'next/head'
import { ErrorBoundary } from '../shared/components/ErrorBoundary'

const EmergencyEchoApp = dynamic(() => import('../App.jsx'), {
  ssr: false,
})

const SITE_URL = 'https://emergencyecho.org'
const SITE_NAME = 'EmergencyEcho'
const SITE_DESCRIPTION =
  'EmergencyEcho is a voice-based AI health assistant and emergency care platform for patients, doctors, nurses, and healthcare partners.'
const SITE_KEYWORDS = [
  'EmergencyEcho',
  'emergency health assistant',
  'voice AI healthcare',
  'telemedicine Nigeria',
  'online doctor consultation',
  'digital medical kit',
  'EchoWallet',
  'emergency triage',
  'doctor video call',
  'nurse triage',
  'medical marketplace',
]

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/emergencyecho.png`,
      sameAs: [
        'https://github.com/Seeker223/EMERGENCY_ECHO',
      ],
      description: SITE_DESCRIPTION,
      areaServed: {
        '@type': 'Country',
        name: 'Nigeria',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      publisher: {
        '@id': `${SITE_URL}/#organization`,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/app/marketplace?search={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${SITE_URL}/#app`,
      name: SITE_NAME,
      applicationCategory: 'HealthApplication',
      operatingSystem: 'Web',
      url: SITE_URL,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'NGN',
      },
      featureList: [
        'Voice-first emergency triage',
        'EchoAI health guidance',
        'Digital Medical Kit',
        'Doctor and nurse video consultation workflow',
        'EchoWallet payments',
        'Healthcare marketplace',
      ],
    },
    {
      '@type': 'MedicalWebPage',
      '@id': `${SITE_URL}/#medical-web-page`,
      url: SITE_URL,
      name: 'EmergencyEcho emergency health assistant',
      about: {
        '@type': 'MedicalCondition',
        name: 'Emergency symptoms and urgent care triage',
      },
      audience: [
        { '@type': 'PatientAudience', name: 'Patients' },
        { '@type': 'Audience', audienceType: 'Doctors, nurses, pharmacies, laboratories, and healthcare partners' },
      ],
      isPartOf: {
        '@id': `${SITE_URL}/#website`,
      },
      description: SITE_DESCRIPTION,
      medicalAudience: 'Patient',
    },
    {
      '@type': 'FAQPage',
      '@id': `${SITE_URL}/#faq`,
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is EmergencyEcho?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'EmergencyEcho is a web-based emergency health assistant that helps users describe symptoms by voice or text, organize health information in a Digital Medical Kit, and connect to doctors or nurses through a guided consultation workflow.',
          },
        },
        {
          '@type': 'Question',
          name: 'Who can use EmergencyEcho?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'EmergencyEcho supports patients, doctors, nurses, and healthcare partners such as pharmacies, labs, wellness providers, and clinics.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does EmergencyEcho replace emergency medical care?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. EmergencyEcho provides guidance and workflow support, but life-threatening emergencies still require immediate local emergency services or in-person medical care.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is the Digital Medical Kit?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The Digital Medical Kit stores important health details such as vitals, allergies, medications, medical history, emergency contacts, and role-specific professional verification information.',
          },
        },
      ],
    },
  ],
}

export default function CatchAllPage() {
  return (
    <>
      <Head>
        <title>EmergencyEcho | Voice AI Emergency Health Assistant</title>
        <meta
          name="description"
          content={SITE_DESCRIPTION}
        />
        <meta name="application-name" content={SITE_NAME} />
        <meta name="keywords" content={SITE_KEYWORDS.join(', ')} />
        <meta name="author" content="Yenak Technologies" />
        <meta name="creator" content="Yenak Technologies" />
        <meta name="publisher" content="Yenak Technologies" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="theme-color" content="#E60000" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="geo.region" content="NG" />
        <meta name="geo.placename" content="Nigeria" />
        <meta name="language" content="English" />
        <meta name="coverage" content="Nigeria" />
        <meta name="distribution" content="global" />
        <link rel="canonical" href={SITE_URL} />
        <link rel="icon" href="/emergencyecho.png" />
        <link rel="apple-touch-icon" href="/emergencyecho.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content="EmergencyEcho | Voice AI Emergency Health Assistant" />
        <meta property="og:description" content={SITE_DESCRIPTION} />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:image" content={`${SITE_URL}/emergencyecho.png`} />
        <meta property="og:image:alt" content="EmergencyEcho logo and emergency health assistant brand" />
        <meta property="og:locale" content="en_NG" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="EmergencyEcho | Voice AI Emergency Health Assistant" />
        <meta name="twitter:description" content={SITE_DESCRIPTION} />
        <meta name="twitter:image" content={`${SITE_URL}/emergencyecho.png`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>
      <noscript>
        <main>
          <h1>EmergencyEcho voice AI emergency health assistant</h1>
          <p>
            EmergencyEcho helps patients describe urgent symptoms, organize a Digital Medical Kit, and connect with
            doctors or nurses through secure voice and video consultation workflows.
          </p>
          <h2>EmergencyEcho features</h2>
          <ul>
            <li>EchoAI voice and text triage for patients.</li>
            <li>Digital Medical Kit with allergies, medications, vitals, medical history, and emergency contacts.</li>
            <li>Doctor and nurse portals for incoming patient calls, clinical summaries, prescriptions, and wallet payouts.</li>
            <li>EchoWallet payments, call credits, plan upgrades, and healthcare marketplace payments.</li>
            <li>Partner workflows for pharmacies, laboratories, wellness providers, and healthcare services.</li>
          </ul>
          <p>
            EmergencyEcho is not a replacement for emergency services. If symptoms are life-threatening, contact local
            emergency responders or go to the nearest hospital immediately.
          </p>
        </main>
      </noscript>
      <ErrorBoundary>
        <EmergencyEchoApp />
      </ErrorBoundary>
    </>
  )
}

export async function getServerSideProps() {
  return {
    props: {},
  }
}
