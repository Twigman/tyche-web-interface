import { getData } from './axiosService'
import { TYCHE_API_ENDPOINTS } from '@/config/tycheApi'
import type { PhoneInfo } from '@/types/PhoneInfo'

export async function getPhoneInfo(): Promise<PhoneInfo> {
  return await getData<PhoneInfo>(TYCHE_API_ENDPOINTS.PHONE_INFO)
}

export async function getUpdateInfo(): Promise<PhoneInfo> {
  return await getData<PhoneInfo>(TYCHE_API_ENDPOINTS.PHONE_UPDATE_INFO)
}
