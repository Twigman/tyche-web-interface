import { getData } from './axiosService'
import { TYCHE_API_ENDPOINTS } from '@/config/tycheApi'

export async function getAutomationProfiles(): Promise<string[]> {
  return await getData<string[]>(TYCHE_API_ENDPOINTS.AUTOMATION_PROFILES)
}

export async function getAutomationActiveProfile(): Promise<string> {
  return await getData<string>(TYCHE_API_ENDPOINTS.AUTOMATION_ACTIVE_PROFILE)
}
