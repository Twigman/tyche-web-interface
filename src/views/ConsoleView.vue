<template>
  <div
    @click="focusInput"
    class="flex flex-col w-full h-full bg-black text-white rounded-lg shadow-md font-mono"
  >
    <!-- Scrollbare Konsole -->
    <div class="flex-1 p-4 overflow-y-auto" ref="consoleContainer">
      <div
        v-for="(log, index) in webConsole.logs"
        :key="index"
        class="flex gap-2 py-1 items-center"
      >
        <!-- Zeitstempel (Datum + Uhrzeit) -->
        <span class="text-gray-400 text-sm w-40">{{ formatTimestamp(log.timestamp) }}</span>

        <!-- Modul (fixe Breite, linksbündig) -->
        <span :class="getModuleColor(log.module)" class="font-bold w-28 text-right px-2">
          [{{ log.module }}]
        </span>

        <!-- Nachricht -->
        <!--<span :class="getLogColor(log.type)">{{ log.message }}</span>>-->
        <div :class="getLogColor(log.type)" class="markdown-output" v-html="log.message"></div>
      </div>
    </div>

    <!-- Eingabefeld für Befehle -->
    <div class="flex items-center gap-2 p-3 border-t border-gray-700">
      <!--
      <input
        ref="inputField"
        v-model="command"
        @keypress.enter="sendCommand"
        type="text"
        placeholder="Enter command..."
        class="flex-1 bg-gray-800 text-white p-2 rounded-md outline-none"
      />
    -->
      <div class="relative w-full">
        <input
          ref="inputField"
          v-model="command"
          @keypress.enter="sendCommand"
          type="text"
          placeholder="Enter command..."
          class="w-full bg-gray-800 text-white p-2 rounded-md outline-none relative"
        />

        <!-- 🔹 Suggestion-Text, wird im Hintergrund angezeigt -->
        <span
          v-if="suggestion"
          class="absolute left-2 top-2 text-gray-300"
          style="pointer-events: none"
        >
          {{ command }}<span class="text-gray-500">{{ suggestion }}</span>
        </span>
      </div>

      <button @click="sendCommand" class="p-2 bg-gray-700 rounded-md hover:bg-gray-600">
        <SendHorizontal class="w-5 h-5 text-white" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { SendHorizontal } from 'lucide-vue-next'
import { TYCHE_MODULE } from '@/config/module'
import { TYCHE_LOG_TYPE } from '@/config/logTypes'
import { useConsoleStore } from '@/stores/consoleStore'
import { useExecuter } from '@/composables/useExecuter'
import { CONSOLE_COMMANDS } from '@/config/consoleCommands'

const webConsole = useConsoleStore()

const command = ref('')
const suggestion = ref('')
const consoleContainer = ref<HTMLElement | null>(null)
const inputField = ref<HTMLElement | null>(null)
let historyIndex = -1
const executer = useExecuter()

const focusInput = () => {
  if (inputField.value) {
    inputField.value.focus()
  }
}

const getCompletion = () => {
  const input = command.value.toLowerCase().trim()
  if (!input) return { commandSuggestion: '', paramSuggestion: '' }

  const parts = input.split(' ')
  const baseCommand = parts[0]
  const currentParam = parts[1] || ''

  // find matching commands
  const matchingCommands = Object.keys(CONSOLE_COMMANDS).filter((cmd) =>
    cmd.startsWith(baseCommand),
  )

  if (parts.length === 1) {
    // only a command is entered
    if (matchingCommands.length === 1) {
      const selectedCommand = matchingCommands[0]
      const params = Object.keys(CONSOLE_COMMANDS[selectedCommand].params)

      // if the command has only one possible parameter, suggest it directly
      if (params.length === 1) {
        return {
          commandSuggestion: selectedCommand.slice(input.length),
          paramSuggestion: ' ' + params[0],
        }
      }
      return { commandSuggestion: selectedCommand.slice(input.length), paramSuggestion: '' }
    }
  } else {
    // a command and (possibly) a parameter are entered
    const selectedCommand = CONSOLE_COMMANDS[baseCommand]
    if (!selectedCommand) return { commandSuggestion: '', paramSuggestion: '' }

    const matchingParams = Object.keys(selectedCommand.params).filter((param) =>
      param.startsWith(currentParam),
    )

    if (matchingParams.length === 1) {
      // if only one parameter matches, suggest it
      const paramCompletion = selectedCommand.params[matchingParams[0]].requiresValue
        ? matchingParams[0].slice(currentParam.length) + '='
        : matchingParams[0].slice(currentParam.length)

      return { commandSuggestion: '', paramSuggestion: paramCompletion }
    }

    // `man` command → Suggest commands from documentation
    if (selectedCommand === CONSOLE_COMMANDS.man) {
      const matchingManCommands = Object.keys(CONSOLE_COMMANDS).filter((cmd) =>
        cmd.startsWith(currentParam),
      )

      if (matchingManCommands.length === 1) {
        return {
          commandSuggestion: '',
          paramSuggestion: matchingManCommands[0].slice(currentParam.length),
        }
      }
    }
  }
  return { commandSuggestion: '', paramSuggestion: '' }
}

// function to update the inline suggestion (ghost text)
const updateSuggestion = () => {
  const { commandSuggestion, paramSuggestion } = getCompletion()
  suggestion.value = commandSuggestion + paramSuggestion
}

// function to apply auto-completion on `Tab` key press
const autoCompleteCommand = () => {
  const { commandSuggestion, paramSuggestion } = getCompletion()

  if (commandSuggestion || paramSuggestion) {
    command.value += commandSuggestion + paramSuggestion
    suggestion.value = '' // reset suggestion after completion
  } else {
    // if there are multiple possible matches, display them in the console
    const input = command.value.toLowerCase().trim()
    const parts = input.split(' ')
    const baseCommand = parts[0]
    const currentParam = parts[1] || ''

    const matchingCommands = Object.keys(CONSOLE_COMMANDS).filter((cmd) =>
      cmd.startsWith(baseCommand),
    )

    if (parts.length === 1 && matchingCommands.length > 1) {
      webConsole.print({
        module: TYCHE_MODULE.COMMAND,
        type: TYCHE_LOG_TYPE.COMMAND,
        message: `Possible commands: ${matchingCommands.join(', ')}`,
      })
    } else {
      const selectedCommand = CONSOLE_COMMANDS[baseCommand]
      if (selectedCommand) {
        const matchingParams = Object.keys(selectedCommand.params).filter((param) =>
          param.startsWith(currentParam),
        )

        if (matchingParams.length > 1) {
          webConsole.print({
            module: TYCHE_MODULE.COMMAND,
            type: TYCHE_LOG_TYPE.COMMAND,
            message: `Available parameters: ${matchingParams.join(', ')}`,
          })
        }
      }
    }
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Tab') {
    event.preventDefault()

    if (suggestion.value) {
      // if available use suggestion
      command.value += suggestion.value
      suggestion.value = ''
    } else {
      autoCompleteCommand()
    }
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    const commandHistory = webConsole.getCommandHistory()

    if (historyIndex < commandHistory.length - 1) {
      historyIndex++
      suggestion.value = ''
      // get previous command
      command.value = commandHistory[historyIndex]
    }
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    const commandHistory = webConsole.getCommandHistory()

    if (historyIndex > 0) {
      historyIndex--
      command.value = commandHistory[historyIndex]
    } else {
      historyIndex = -1
      command.value = ''
    }
    suggestion.value = ''
  }
}

const sendCommand = () => {
  if (command.value.trim() === '') return
  webConsole.print({
    module: TYCHE_MODULE.COMMAND,
    type: TYCHE_LOG_TYPE.COMMAND,
    message: `> ${command.value}`,
  })
  executer.submitCommand(command.value)
  historyIndex = -1
  command.value = ''

  // Nach unten scrollen
  nextTick(() => {
    if (consoleContainer.value) {
      consoleContainer.value.scrollTop = consoleContainer.value.scrollHeight
    }
  })
}

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
    [TYCHE_MODULE.SPOTIFY]: 'text-[#1DB954]',
  }
  return colors[module] || 'text-gray-300'
}

// Farben für Log-Typen
const getLogColor = (type: string) => {
  const colors: Record<string, string> = {
    [TYCHE_LOG_TYPE.INFO]: 'text-blue-400',
    [TYCHE_LOG_TYPE.WARN]: 'text-yellow-500',
    [TYCHE_LOG_TYPE.ERROR]: 'text-red-500',
    [TYCHE_LOG_TYPE.DEBUG]: 'text-purple-400',
    [TYCHE_LOG_TYPE.COMMAND]: 'text-white',
  }
  return colors[type] || 'text-white'
}

// Zeitstempel mit festem `DD.MM.YYYY HH:MM:SS` Format
const formatTimestamp = (timestamp?: number) => {
  if (!timestamp) return 'undefined'

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

watch(command, updateSuggestion)

// Scrollt automatisch zum neuesten Log
onMounted(() => {
  focusInput()

  if (consoleContainer.value) {
    consoleContainer.value.scrollTop = consoleContainer.value.scrollHeight
  }

  if (inputField.value) {
    inputField.value.addEventListener('keydown', handleKeydown)
  }
})
</script>

<style scoped>
/* Schmale Scrollbar für ein cleanes Design */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #4b5563 #1f2937;
}

.markdown-output {
  white-space: pre-wrap;
}
</style>
