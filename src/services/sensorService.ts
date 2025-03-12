import { getData } from './axiosService'
import { TYCHE_API_ENDPOINTS } from '@/config/tycheApi'
import type { Sensor, SensorState } from '@/types/Sensor'

export async function getTemperatureSensors(): Promise<Sensor[]> {
  return getData<Sensor[]>(TYCHE_API_ENDPOINTS.SENSORS_TEMPERATURE)
}

export async function getHumiditySensors(): Promise<Sensor[]> {
  return getData<Sensor[]>(TYCHE_API_ENDPOINTS.SENSORS_HUMIDITY)
}

export async function getPresenceSensors(): Promise<Sensor[]> {
  return getData<Sensor[]>(TYCHE_API_ENDPOINTS.SENSORS_PRESENCE)
}

/*export async function getTemperatureSensorStatesBetweenById(
  id: string,
  startDate: string,
  endDate: string,
): Promise<SensorState[]> {
  return getData<SensorState[]>(
    TYCHE_API_ENDPOINTS.TEMPERATURES_BETWEEN_BY_ID(id, startDate, endDate),
  )
}*/

export async function getTemperatureSensorStatesLast24h(id: string): Promise<SensorState[]> {
  return getData<SensorState[]>(TYCHE_API_ENDPOINTS.TEMPERATURES_LAST_24H_BY_ID(id))
}

export async function getHumiditySensorStatesLast24h(id: string): Promise<SensorState[]> {
  return getData<SensorState[]>(TYCHE_API_ENDPOINTS.HUMIDITY_LAST_24H_BY_ID(id))
}
