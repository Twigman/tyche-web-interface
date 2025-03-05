import { getData, postData } from './axiosService'
import { TYCHE_API_ENDPOINTS } from '@/config/tycheApi'
import type { ActiveProfileRequest } from '@/types/ActiveProfileRequest'

export async function getAutomationProfiles(): Promise<string[]> {
  return await getData<string[]>(TYCHE_API_ENDPOINTS.AUTOMATION_PROFILES)
}

export async function getAutomationActiveProfile(): Promise<string> {
  return await getData<string>(TYCHE_API_ENDPOINTS.AUTOMATION_ACTIVE_PROFILE)
}

export async function postAutomationActiveProfile(profile: string): Promise<string> {
  return await postData<string, ActiveProfileRequest>(
    TYCHE_API_ENDPOINTS.AUTOMATION_ACTIVE_PROFILE,
    { type: profile },
  )
}
