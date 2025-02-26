export interface SensorState {
  type: string
  id: string
  sensorId: string
  lastupdated: string
  temperature?: number
  humidity?: number
  pressure?: number
  presence?: boolean
  lightlevel?: number
  lux?: number
  dark?: boolean
  daylight?: boolean
}

export interface SensorConfig {
  id: string
  sensorId: string
  battery: number
  on: boolean
  reachable: boolean
}

export interface Sensor {
  type: string
  uniqueid: string
  ep: number
  etag: string
  modelid: string
  manufacturername: string
  name: string
  swversion: string
  state: SensorState
  config: SensorConfig
}
