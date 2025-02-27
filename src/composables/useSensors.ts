import { ref, watchEffect } from 'vue'
import type { Ref } from 'vue'
import { useStompWebSocket } from '@/composables/useStompWebSocket'
import {
  getTemperatureSensors,
  getHumiditySensors,
  getPresenceSensors,
} from '@/services/sensorService'
import type { Sensor } from '@/types/Sensor'

export function useSensors() {
  // reactive lists
  const sensorsTemperature = ref<Sensor[]>([])
  const sensorsHumidity = ref<Sensor[]>([])
  const sensorsPresence = ref<Sensor[]>([])

  async function loadSensors() {
    try {
      sensorsTemperature.value = await getTemperatureSensors()
      sensorsHumidity.value = await getHumiditySensors()
      sensorsPresence.value = await getPresenceSensors()
    } catch (error) {
      console.log(`[loadSensors] Error loading sensors: ${error}`)
    }
  }

  function updateSensorList(sensorList: Ref<Sensor[]>, sensorUpdate: Sensor | null) {
    if (!sensorUpdate) return // null

    const index = sensorList.value.findIndex((sensor) => sensor.uniqueid === sensorUpdate.uniqueid)

    if (index !== -1) {
      // sensor exists -> update
      sensorList.value[index] = sensorUpdate
    } else {
      // new sensor -> add
      sensorList.value.push(sensorUpdate)
    }
  }

  // init sensors
  loadSensors()

  // WebSocket for live-updates
  const { sensorTemperatureUpdate, sensorHumidityUpdate, sensorPresenceUpdate } =
    useStompWebSocket()

  watchEffect(() => {
    if (sensorTemperatureUpdate.value) {
      // not null
      updateSensorList(sensorsTemperature, sensorTemperatureUpdate.value)
    }
  })
  watchEffect(() => {
    if (sensorHumidityUpdate.value) {
      updateSensorList(sensorsHumidity, sensorHumidityUpdate.value)
    }
  })
  watchEffect(() => {
    if (sensorPresenceUpdate.value) {
      updateSensorList(sensorsPresence, sensorPresenceUpdate.value)
    }
  })

  return { sensorsTemperature, sensorsHumidity, sensorsPresence }
}
