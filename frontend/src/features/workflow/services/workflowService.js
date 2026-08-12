const metadata = {
  role: 'Role selection and access control entry point.',
  login: 'Authenticate securely and start a private session.',
  signup: 'Controlled form for onboarding and profile bootstrap.',
  home: 'Unified home screen for voice-first triage and quick actions.',
  voice: 'Hands-free emergency capture and call controls.',
  'patient-home': 'Unified home screen for voice-first triage and quick actions.',
  'doctor-live': 'Doctor live session view for video/audio/chat and intake.',
  payment: 'Payment screen for buying call credit and resuming the live session.',
  profile: 'Account details, medical info, and emergency contacts.',
  kit: 'Digital emergency ID and quick access assets.',
  wallet: 'Wallet balance, transactions, and payment history.',
  'wallet-add-funds': 'Fund your wallet via card or transfer.',
  'wallet-withdraw': 'Withdraw funds to your bank account.',
  'doctor-home': 'Unified home screen for voice-first triage and quick actions.',
  directory: 'User registry used for account lookup and access control.',
  doctors: 'Browse doctors on duty and start a session.',
  'doctor-profile': 'Doctor profile, work history, and contact options.',
  'profile-basic': 'Update your basic profile details.',
  'profile-emergency': 'Update your emergency contact details.',
  'profile-password': 'Update your password and access settings.',
  'profile-notifications': 'Update notification preferences.',
  admin: 'Admin console for supervision and reporting.',
  'admin-users': 'Admin users CRUD.',
  'admin-wallet': 'Admin wallet dashboard and transaction CRUD.',
  'admin-plans': 'Admin plans CRUD.',
  'admin-roles': 'Admin role enable/disable.',
  'admin-pages': 'Admin page enable/disable.',
  'admin-verification': 'Admin document verification console.',
  forbidden: 'Authorization guard denied this route for your role.',
}

export async function fetchPageMetadata(pageId, { signal } = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '/api'
  await wait(220, signal)

  return {
    description: metadata[pageId] || 'Workflow preview.',
    source: `${baseUrl}/workflow/${pageId}`,
  }
}

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    const timerId = window.setTimeout(resolve, ms)
    if (!signal) return

    signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timerId)
        reject(new DOMException('Aborted', 'AbortError'))
      },
      { once: true },
    )
  })
}
