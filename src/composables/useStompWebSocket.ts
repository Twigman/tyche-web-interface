import { Client } from '@stomp/stompjs'
import { ref, onUnmounted, onMounted } from 'vue'
import { TYCHE_BASE_URL_WS, TYCHE_WS_ENDPOINTS } from '@/config/api'
import type { Sensor } from '@/types/Sensor'

export function useStompWebSocket() {
  //const humidity = ref<number | null>(null)
  //const presence = ref<boolean | null>(null)
  const sensorTemperature = ref<Sensor | null>(null)

  const client = new Client({
    brokerURL: TYCHE_BASE_URL_WS,
    connectHeaders: {},
    onConnect: () => {
      console.log(`[STOMP] Connected with WebSocket: ${TYCHE_BASE_URL_WS}`)

      client.subscribe(TYCHE_WS_ENDPOINTS.TEMPERATURE, (message) => {
        console.log(`[STOMP] ${TYCHE_WS_ENDPOINTS.TEMPERATURE} -> update`)
        sensorTemperature.value = JSON.parse(message.body).sensor
      })
      /*
      client.subscribe(TYCHE_WS_ENDPOINTS.HUMIDITY, (message) => {
        console.log(`[STOMP] ${TYCHE_BASE_URL_WS} -> humidity update`)
        humidity.value = JSON.parse(message.body).value
      })

      client.subscribe(TYCHE_WS_ENDPOINTS.PRESENCE, (message) => {
        console.log(`[STOMP] ${TYCHE_BASE_URL_WS} -> presence update`)
        presence.value = JSON.parse(message.body).value
      })
        */
    },
    //debug: (str) => console.log(str),
  })

  onMounted(() => client.activate())
  onUnmounted(() => client.deactivate())

  //return { sensorTemperature, humidity }
  return sensorTemperature
}
