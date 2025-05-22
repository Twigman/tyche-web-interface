import { TIMER_API_ENDPOINTS } from '@/config/timerApi'
import { getData, postData } from './axiosService'
import type { Timer, TimerEntry } from '@/types/Timer'

export async function getTimerList(): Promise<TimerEntry[]> {
  return getData<TimerEntry[]>(TIMER_API_ENDPOINTS.LIST)
}

export async function postTimer(timer: Timer): Promise<TimerEntry> {
  return postData<TimerEntry, Timer>(TIMER_API_ENDPOINTS.START, timer)
}
