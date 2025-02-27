export const TYCHE_BASE_URL = import.meta.env.VITE_TYCHE_URL
export const TYCHE_BASE_URL_WS = import.meta.env.VITE_TYCHE_URL_WS

export const TYCHE_WS_ENDPOINTS = {
  TEMPERATURE: '/topic/sensors/temperature',
  HUMIDITY: '/topic/sensors/humidity',
  PRESENCE: '/topic/sensors/presence',
  PRESSURE: '/topic/sensors/pressure',
  LIGHTLEVEL: '/topic/sensors/lightlevel',
  HUELIGHTS: '/topic/huelights',
}

export const TYCHE_API_ENDPOINTS = {
  SENSORS_ALL: `${TYCHE_BASE_URL}/api/sensors/all`,
  SENSORS_SENSOR_BY_ID: (id: number) => `${TYCHE_BASE_URL}/api/sensors/${id}`,
  SENSORS_TEMPERATURE: `${TYCHE_BASE_URL}/api/sensors/temperature`,
  SENSORS_PRESENCE: `${TYCHE_BASE_URL}/api/sensors/presence`,
  SENSORS_HUMIDITY: `${TYCHE_BASE_URL}/api/sensors/humidity`,
  SENSORS_LIGHTLEVEL: `${TYCHE_BASE_URL}/api/sensors/lightlevel`,
  SENSORS_PRESSURE: `${TYCHE_BASE_URL}/api/sensors/pressure`,
  //
  TEMPERATURES_ALL: `${TYCHE_BASE_URL}/api/temperatures/all`,
  TEMPERATURES_LATEST_BY_ID: (id: number) => `${TYCHE_BASE_URL}/api/temperatures/${id}/latest`,
  TEMPERATURES_BETWEEN_BY_ID: (id: number, date: string) =>
    `${TYCHE_BASE_URL}/api/temperatures/${id}?date=${encodeURIComponent(date)}`,
  //
  HUMIDITY_ALL: `${TYCHE_BASE_URL}/api/humidity/all`,
  HUMIDITY_LATEST_BY_ID: (id: number) => `${TYCHE_BASE_URL}/api/humidity/${id}/latest`,
  THUMIDITY_BETWEEN_BY_ID: (id: number, date: string) =>
    `${TYCHE_BASE_URL}/api/humidity/${id}?date=${encodeURIComponent(date)}`,
  //
  LIGHTLEVEL_ALL: `${TYCHE_BASE_URL}/api/lightlevel/all`,
  LIGHTLEVEL_LATEST_BY_ID: (id: number) => `${TYCHE_BASE_URL}/api/lightlevel/${id}/latest`,
  LIGHTLEVEL_BETWEEN_BY_ID: (id: number, date: string) =>
    `${TYCHE_BASE_URL}/api/lightlevel/${id}?date=${encodeURIComponent(date)}`,
  //
  PRESENCE_ALL: `${TYCHE_BASE_URL}/api/presence/all`,
  PRESENCE_LATEST_BY_ID: (id: number) => `${TYCHE_BASE_URL}/api/presence/${id}/latest`,
  PRESENCE_BETWEEN_BY_ID: (id: number, date: string) =>
    `${TYCHE_BASE_URL}/api/presence/${id}?date=${encodeURIComponent(date)}`,
  //
  PRESSURE_ALL: `${TYCHE_BASE_URL}/api/pressure/all`,
  PRESSURE_LATEST_BY_ID: (id: number) => `${TYCHE_BASE_URL}/api/pressure/${id}/latest`,
  PRESSURE_BETWEEN_BY_ID: (id: number, date: string) =>
    `${TYCHE_BASE_URL}/api/pressure/${id}?date=${encodeURIComponent(date)}`,
}
