import { Client } from '@stomp/stompjs'
import { ref, onUnmounted, onMounted } from 'vue'
import { TYCHE_BASE_URL_WS, TYCHE_WS_ENDPOINTS } from '@/config/api'
import type { Sensor } from '@/types/Sensor'

export function useStompWebSocket() {
  const sensorTemperatureUpdate = ref<Sensor | null>(null)
  const sensorPresenceUpdate = ref<Sensor | null>(null)
  const sensorHumidityUpdate = ref<Sensor | null>(null)

  const client = new Client({
    brokerURL: TYCHE_BASE_URL_WS,
    connectHeaders: {},
    onConnect: () => {
      console.log(`[STOMP] Connected with WebSocket: ${TYCHE_BASE_URL_WS}`)

      client.subscribe(TYCHE_WS_ENDPOINTS.TEMPERATURE, (message) => {
        console.log(`[STOMP] ${TYCHE_WS_ENDPOINTS.TEMPERATURE} -> update`)
        sensorTemperatureUpdate.value = JSON.parse(message.body).sensor
      })
      client.subscribe(TYCHE_WS_ENDPOINTS.HUMIDITY, (message) => {
        console.log(`[STOMP] ${TYCHE_WS_ENDPOINTS.HUMIDITY} -> update`)
        sensorHumidityUpdate.value = JSON.parse(message.body).sensor
      })

      client.subscribe(TYCHE_WS_ENDPOINTS.PRESENCE, (message) => {
        console.log(`[STOMP] ${TYCHE_WS_ENDPOINTS.PRESENCE} -> update`)
        sensorPresenceUpdate.value = JSON.parse(message.body).sensor
      })
    },
    //debug: (str) => console.log(str),
  })

  onMounted(() => client.activate())
  onUnmounted(() => client.deactivate())

  return { sensorTemperatureUpdate, sensorHumidityUpdate, sensorPresenceUpdate }
}
