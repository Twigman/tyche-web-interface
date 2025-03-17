import { defineStore } from 'pinia'
import { onMounted, ref, watchEffect } from 'vue'
import type { Ref } from 'vue'
import { useStompStore } from '@/stores/stompStore'
import {
  getTemperatureSensors,
  getHumiditySensors,
  getPresenceSensors,
} from '@/services/sensorService'
import type { Sensor } from '@/types/Sensor'

export const useSensorStore = defineStore('sensor', () => {
  // reactive lists
  const sensorsTemperature = ref<Sensor[]>([])
  const sensorsHumidity = ref<Sensor[]>([])
  const sensorsPresence = ref<Sensor[]>([])
  const stompStore = useStompStore()

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

  watchEffect(() => {
    if (stompStore.sensorTemperatureUpdate) {
      // not null
      updateSensorList(sensorsTemperature, stompStore.sensorTemperatureUpdate)
    }
  })
  watchEffect(() => {
    if (stompStore.sensorHumidityUpdate) {
      updateSensorList(sensorsHumidity, stompStore.sensorHumidityUpdate)
    }
  })
  watchEffect(() => {
    if (stompStore.sensorPresenceUpdate) {
      updateSensorList(sensorsPresence, stompStore.sensorPresenceUpdate)
    }
  })

  onMounted(loadSensors)

  return { sensorsTemperature, sensorsHumidity, sensorsPresence }
})
