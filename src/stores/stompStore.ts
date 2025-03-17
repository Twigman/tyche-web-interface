import { defineStore } from 'pinia'
import { Client } from '@stomp/stompjs'
import { ref, onUnmounted, onMounted } from 'vue'
import { TYCHE_BASE_URL_WS, TYCHE_WS_ENDPOINTS } from '@/config/tycheApi'
import type { Sensor } from '@/types/Sensor'
import type { PhoneInfo } from '@/types/PhoneInfo'
import { defaultStompWrapper, type StompWrapper } from '@/types/Message'
import { useConsoleStore } from './consoleStore'
import { TYCHE_LOG_TYPE } from '@/config/logTypes'
import { TYCHE_MODULE } from '@/config/module'
import { SYMBOLE } from '@/config/symboles'

export const useStompStore = defineStore('stomp', () => {
  const sensorTemperatureUpdate = ref<Sensor | null>(null)
  const sensorPresenceUpdate = ref<Sensor | null>(null)
  const sensorHumidityUpdate = ref<Sensor | null>(null)
  const phoneInfoUpdate = ref<PhoneInfo | null>(null)
  const activeProfileUpdate = ref<StompWrapper<string>>(defaultStompWrapper(''))
  let counterDisconnects = 0
  let manualDisconnect = false
  const maxDisconnects = 10

  const webConsole = useConsoleStore()

  const client = new Client({
    brokerURL: TYCHE_BASE_URL_WS,
    connectHeaders: {},
    onConnect: () => {
      counterDisconnects = 0

      webConsole.print({
        module: TYCHE_MODULE.WEB,
        type: TYCHE_LOG_TYPE.INFO,
        message: `Connected to tyche`,
      })

      client.subscribe(TYCHE_WS_ENDPOINTS.APP_LOG, (message) => {
        console.log(`[STOMP] ${TYCHE_WS_ENDPOINTS.APP_LOG} -> update`)
        const body = JSON.parse(message.body)

        webConsole.print({
          module: body.module,
          type: body.level,
          message: body.message,
        })
      })

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
        //log event
        webConsole.print({
          module: body.module,
          type: TYCHE_LOG_TYPE.INFO,
          message: `AUTOMATION PROFILE ${SYMBOLE.ARROW_RIGHT} ${body.activeProfile}`,
        })
      })
    },
    onWebSocketClose: () => {
      if (counterDisconnects < maxDisconnects && !manualDisconnect) {
        webConsole.print({
          module: TYCHE_MODULE.WEB,
          type: TYCHE_LOG_TYPE.ERROR,
          message: `Reconnecting to tyche: ${TYCHE_BASE_URL_WS} (${counterDisconnects + 1}/${maxDisconnects})`,
        })
        counterDisconnects++
      } else if (!manualDisconnect) {
        webConsole.print({
          module: TYCHE_MODULE.WEB,
          type: TYCHE_LOG_TYPE.ERROR,
          message: `Stopped connection attemps (${TYCHE_BASE_URL_WS})`,
        })
        client.deactivate()
      } else {
        // manualDisconnect
        webConsole.print({
          module: TYCHE_MODULE.WEB,
          type: TYCHE_LOG_TYPE.INFO,
          message: `Connection closed (${TYCHE_BASE_URL_WS})`,
        })
      }
    },
    //debug: (str) => console.log(str),
  })

  function connect() {
    if (client.connected) {
      webConsole.print({
        module: TYCHE_MODULE.WEB,
        type: TYCHE_LOG_TYPE.INFO,
        message: `Already connected`,
      })
    } else {
      webConsole.print({
        module: TYCHE_MODULE.WEB,
        type: TYCHE_LOG_TYPE.INFO,
        message: `Connecting to ${TYCHE_BASE_URL_WS} ...`,
      })
      counterDisconnects = 0
      manualDisconnect = false
      client.activate()
    }
  }

  function disconnect() {
    manualDisconnect = true

    if (client.connected) {
      webConsole.print({
        module: TYCHE_MODULE.WEB,
        type: TYCHE_LOG_TYPE.INFO,
        message: `Disconnecting ...`,
      })
      client.deactivate()
    } else {
      webConsole.print({
        module: TYCHE_MODULE.WEB,
        type: TYCHE_LOG_TYPE.INFO,
        message: `Already disconnected`,
      })
      client.deactivate()
    }
  }

  onMounted(() => client.activate())
  onUnmounted(() => client.deactivate())

  return {
    sensorTemperatureUpdate,
    sensorHumidityUpdate,
    sensorPresenceUpdate,
    phoneInfoUpdate,
    activeProfileUpdate,
    connect,
    disconnect,
  }
})
