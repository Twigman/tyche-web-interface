import { Client } from '@stomp/stompjs'
import { ref, onUnmounted, onMounted } from 'vue'
import { TYCHE_BASE_URL_WS, TYCHE_WS_ENDPOINTS } from '@/config/tycheApi'
import type { Sensor } from '@/types/Sensor'
import type { PhoneInfo } from '@/types/PhoneInfo'
import { defaultStompWrapper, type StompWrapper } from '@/types/Message'

let instance: ReturnType<typeof createStompWebSocket> | null = null

function createStompWebSocket() {
  const sensorTemperatureUpdate = ref<Sensor | null>(null)
  const sensorPresenceUpdate = ref<Sensor | null>(null)
  const sensorHumidityUpdate = ref<Sensor | null>(null)
  const phoneInfoUpdate = ref<PhoneInfo | null>(null)
  const activeProfileUpdate = ref<StompWrapper<string>>(defaultStompWrapper(''))

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

      client.subscribe(TYCHE_WS_ENDPOINTS.PHONE_INFO, (message) => {
        console.log(`[STOMP] ${TYCHE_WS_ENDPOINTS.PHONE_INFO} -> update`)
        phoneInfoUpdate.value = JSON.parse(message.body).phoneInfo
      })

      client.subscribe(TYCHE_WS_ENDPOINTS.ACTIVE_PROFILE, (message) => {
        console.log(`[STOMP] ${TYCHE_WS_ENDPOINTS.ACTIVE_PROFILE} -> update`)

        const body = JSON.parse(message.body)
        activeProfileUpdate.value = { module: body.module, data: body.activeProfile }
      })
    },
    //debug: (str) => console.log(str),
  })

  onMounted(() => client.activate())
  onUnmounted(() => client.deactivate())

  return {
    sensorTemperatureUpdate,
    sensorHumidityUpdate,
    sensorPresenceUpdate,
    phoneInfoUpdate,
    activeProfileUpdate,
  }
}

export function useStompWebSocket() {
  if (!instance) {
    instance = createStompWebSocket()
  }
  return instance
}
