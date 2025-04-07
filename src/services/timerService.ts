import { TIMER_API_ENDPOINTS } from '@/config/timerApi'
import { getData } from './axiosService'
import type { TimerEntry } from '@/types/Timer'

export async function getTimerList(): Promise<TimerEntry[]> {
  return getData<TimerEntry[]>(TIMER_API_ENDPOINTS.LIST)
}
