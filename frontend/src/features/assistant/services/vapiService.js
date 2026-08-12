import Vapi from '@vapi-ai/web'

// Use the public key and assistant ID provided by the user
const VAPI_PUBLIC_KEY = 'c0c5baf7-ec97-4971-b7ac-a18e9bb8db2b'
const VAPI_ASSISTANT_ID = 'cd66b0d9-3543-4417-9f12-e1f18b67f951'

class VapiService {
  constructor() {
    this.vapi = null
    this.assistantId = VAPI_ASSISTANT_ID
  }

  initialize() {
    if (!this.vapi) {
      this.vapi = new Vapi(VAPI_PUBLIC_KEY)
    }
    return this.vapi
  }

  getVapiInstance() {
    if (!this.vapi) {
      this.initialize()
    }
    return this.vapi
  }
}

export const vapiService = new VapiService()
export { VAPI_ASSISTANT_ID }

export async function startVapiSession(vapi, currentUser = null) {
  let locationStr = ''
  let finalLat = null
  let finalLon = null

  if (typeof window !== 'undefined') {
    finalLat = window.localStorage.getItem('ee_location_lat')
    finalLon = window.localStorage.getItem('ee_location_lon')
    if (finalLat && finalLon) {
      locationStr = `Lat: ${finalLat}, Lng: ${finalLon}`
    }
  }

  // Try to get live location
  try {
    if ('geolocation' in navigator) {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 })
      })
      finalLat = pos.coords.latitude
      finalLon = pos.coords.longitude
      locationStr = `Lat: ${finalLat}, Lng: ${finalLon}`
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('ee_location_lat', finalLat)
        window.localStorage.setItem('ee_location_lon', finalLon)
        window.localStorage.setItem('ee_location_enabled', 'true')
      }
    }
  } catch (err) {
    console.log('Could not get live location', err)
  }

  // Attempt reverse geocoding if we have coordinates
  if (finalLat && finalLon) {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${finalLat}&lon=${finalLon}`)
      if (res.ok) {
        const data = await res.json()
        if (data && data.display_name) {
          // e.g. "123 Main St, Springfield, IL 62701, USA"
          locationStr = data.display_name
        }
      }
    } catch (geocodeErr) {
      console.log('Reverse geocoding failed', geocodeErr)
    }
  }

  const userId = currentUser?.id || ''
  const fullName = currentUser?.fullName || currentUser?.full_name || ''
  const submissionId = currentUser?.submission_key || ''

  const options = {
    clientMessages: ['tool-calls', 'transcript', 'speech-update', 'status-update', 'function-call'],
    variableValues: {
      userId,
      full_name: fullName,
      submission_id: submissionId,
      patientLocation: locationStr
    },
    metadata: {
      userId,
      patientLocation: locationStr
    }
  }

  vapi.start(VAPI_ASSISTANT_ID, options)
}
