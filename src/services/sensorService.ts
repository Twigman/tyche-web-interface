import axios from 'axios'
import { TYCHE_API_ENDPOINTS } from '@/config/api'
import type { Sensor } from '@/types/Sensor'

export async function getTemperatureSensors(): Promise<Sensor[]> {
  return getSensors(TYCHE_API_ENDPOINTS.SENSORS_TEMPERATURE)
}

export async function getHumiditySensors(): Promise<Sensor[]> {
  return getSensors(TYCHE_API_ENDPOINTS.SENSORS_HUMIDITY)
}

export async function getPresenceSensors(): Promise<Sensor[]> {
  return getSensors(TYCHE_API_ENDPOINTS.SENSORS_PRESENCE)
}

async function getSensors(endpoint: string): Promise<Sensor[]> {
  try {
    const response = await axios.get<Sensor[]>(endpoint)

    return response.data
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.log(`[API] Error calling ${endpoint}: ${err.message}`)
    } else {
      console.log(`[API] Unexpected error: ${String(err)}`)
    }
    return []
  }
}
