import { getData } from './axiosService'
import { TYCHE_API_ENDPOINTS } from '@/config/tycheApi'
import type { Sensor } from '@/types/Sensor'

export async function getTemperatureSensors(): Promise<Sensor[]> {
  return getData<Sensor[]>(TYCHE_API_ENDPOINTS.SENSORS_TEMPERATURE)
}

export async function getHumiditySensors(): Promise<Sensor[]> {
  return getData<Sensor[]>(TYCHE_API_ENDPOINTS.SENSORS_HUMIDITY)
}

export async function getPresenceSensors(): Promise<Sensor[]> {
  return getData<Sensor[]>(TYCHE_API_ENDPOINTS.SENSORS_PRESENCE)
}
