<template>
  <div class="flex flex-col w-full h-full bg-black text-white rounded-lg shadow-md font-mono">
    <!-- Scrollbare Konsole -->
    <div class="flex-1 p-4 overflow-y-auto" ref="consoleContainer">
      <div v-for="(log, index) in logs" :key="index" class="flex gap-2 py-1 items-center">
        <!-- Zeitstempel (Datum + Uhrzeit) -->
        <span class="text-gray-400 text-sm w-40">{{ formatTimestamp(log.timestamp) }}</span>

        <!-- Modul (fixe Breite, linksbündig) -->
        <span :class="getModuleColor(log.module)" class="font-bold w-28 text-left px-2">
          [{{ log.module }}]
        </span>

        <!-- Nachricht -->
        <span :class="getLogColor(log.type)">{{ log.message }}</span>
      </div>
    </div>

    <!-- Eingabefeld für Befehle -->
    <div class="flex items-center gap-2 p-3 border-t border-gray-700">
      <input
        v-model="command"
        @keypress.enter="sendCommand"
        type="text"
        placeholder="Enter command..."
        class="flex-1 bg-gray-800 text-white p-2 rounded-md outline-none"
      />

      <button @click="sendCommand" class="p-2 bg-gray-700 rounded-md hover:bg-gray-600">
        <SendHorizontal class="w-5 h-5 text-white" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { SendHorizontal } from 'lucide-vue-next'
import { useAutomation } from '@/composables/useAutomation'
import type { ConsoleLine } from '@/types/Message'
import { TYCHE_MODULE } from '@/config/module'

const logs = ref<ConsoleLine[]>([])

const logDummies: ConsoleLine[] = [
  {
    timestamp: Date.now(),
    module: 'SYSTEM',
    type: 'info',
    message: 'Server started successfully.',
  },
  { timestamp: Date.now(), module: 'AUTH', type: 'warn', message: 'Invalid login attempt.' },
  {
    timestamp: Date.now(),
    module: 'DATABASE',
    type: 'error',
    message: 'Connection lost, retrying...',
  },
  {
    timestamp: Date.now(),
    module: 'API',
    type: 'debug',
    message: 'Fetching new data from endpoint.',
  },
]

// Eingabefeld für Befehle
const command = ref('')
const consoleContainer = ref<HTMLElement | null>(null)

const { activeProfile } = useAutomation()

const initConsole = () => {
  // use dummy values
  logDummies.forEach((entry) => {
    addConsoleLine(entry)
  })
}

const addConsoleLine = (line: ConsoleLine) => {
  logs.value.push(line)
}

// Befehl absenden & in Console anzeigen
const sendCommand = () => {
  if (command.value.trim() === '') return
  logs.value.push({
    timestamp: Date.now(),
    module: 'COMMAND',
    type: 'command',
    message: `> ${command.value}`,
  })
  command.value = ''

  // Nach unten scrollen
  nextTick(() => {
    if (consoleContainer.value) {
      consoleContainer.value.scrollTop = consoleContainer.value.scrollHeight
    }
  })
}

// Scrollt automatisch zum neuesten Log
onMounted(() => {
  initConsole()

  if (consoleContainer.value) {
    consoleContainer.value.scrollTop = consoleContainer.value.scrollHeight
  }
})

// Farben für verschiedene Module
const getModuleColor = (module: string) => {
  const colors: Record<string, string> = {
    [TYCHE_MODULE.SYSTEM]: 'text-cyan-400',
    [TYCHE_MODULE.AUTH]: 'text-yellow-400',
    [TYCHE_MODULE.DATABASE]: 'text-red-400',
    [TYCHE_MODULE.API]: 'text-green-400',
    [TYCHE_MODULE.COMMAND]: 'text-gray-400',
    [TYCHE_MODULE.PHONE]: 'text-pink-400',
    [TYCHE_MODULE.FRITZBOX]: 'text-blue-500',
    [TYCHE_MODULE.MANUAL]: 'text-purple-400',
    [TYCHE_MODULE.WEB]: 'text-blue-400',
    [TYCHE_MODULE.ZIGBEE]: 'text-orange-400',
  }
  return colors[module] || 'text-gray-300'
}

// Farben für Log-Typen
const getLogColor = (type: string) => {
  const colors: Record<string, string> = {
    info: 'text-blue-400',
    warn: 'text-yellow-500',
    error: 'text-red-500',
    debug: 'text-purple-400',
    command: 'text-gray-400',
  }
  return colors[type] || 'text-white'
}

// Zeitstempel mit festem `DD.MM.YYYY HH:MM:SS` Format
const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0') // Monate sind 0-basiert
  const year = date.getFullYear()
  const time = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return `${day}.${month}.${year} ${time}`
}

watch(activeProfile.value, (newValue) => {
  addConsoleLine({
    timestamp: Date.now(),
    module: newValue.module,
    type: 'info',
    message: `AUTOMATION PROFILE 	\u279C ${newValue.data}`,
  })
})
</script>

<style scoped>
/* Schmale Scrollbar für ein cleanes Design */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #4b5563 #1f2937;
}
</style>
