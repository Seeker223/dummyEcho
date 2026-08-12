import doctorAvatar from '../../assets/emergency_echo doctor.png'
import nurseAvatar from '../../assets/emergency_echonurse.png'
import patientAvatar1 from '../../assets/emergency echo patient.png'
import patientAvatar2 from '../../assets/emergency echo patient 2.png'
import patientAvatar3 from '../../assets/emergency echo patient 3.png'
import { imageSource } from '../../shared/utils/imageSource'

export const assistantAvatars = {
  doctor: imageSource(doctorAvatar),
  nurse: imageSource(nurseAvatar),
  patients: [imageSource(patientAvatar1), imageSource(patientAvatar2), imageSource(patientAvatar3)],
}

export function pickPatientAvatar(seed = 0) {
  const list = assistantAvatars.patients
  if (!list.length) return nurseAvatar
  const index = Math.abs(Number(seed) || 0) % list.length
  return list[index]
}

