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

/**
 * Generates command-line auto-completion suggestions based on the current input state.
 *
 * The function analyzes the user's partially typed input and attempts to provide intelligent suggestions
 * for command names, subcommands, or options, depending on the current structure of the input.
 * It supports multi-level commands (main command → subcommand → options) and handles the following scenarios:
 *
 * 1. Typing the main command → suggests the remaining part of the command and the only available subcommand, if applicable.
 * 2. Typing the subcommand → completes the subcommand and optionally suggests options if `requiresOption` is set.
 * 3. After a fully typed subcommand (no further input) → suggests required options if applicable.
 * 4. Typing an option (e.g., `--val`) → completes the flag and appends a space if the option requires a value.
 *
 * @returns {{
 *   commandSuggestion: string,
 *   paramSuggestion: string
 * }} An object containing `commandSuggestion` (completion for the current command/subcommand)
 *     and `paramSuggestion` (completion for an option or parameter).
 */
const getCompletion = () => {
  const input = command.value.toLowerCase().trimEnd()
  if (!input) return { commandSuggestion: '', paramSuggestion: '' }

  const parts = input.split(' ').filter(Boolean)
  const [cmdName = '', subCmdInput = '', ...rest] = parts

  const matchingCmds = Object.keys(CONSOLE_COMMANDS).filter((key) => key.startsWith(cmdName))

  // 🔹 1. Hauptbefehl wird getippt
  if (parts.length === 1) {
    if (matchingCmds.length === 1) {
      const fullCmd = matchingCmds[0]
      const fullCommand = CONSOLE_COMMANDS[fullCmd]
      const subcommands = fullCommand.subcommands || {}

      const subcommandKeys = Object.keys(subcommands)
      if (subcommandKeys.length === 1) {
        return {
          commandSuggestion: fullCmd.slice(cmdName.length),
          paramSuggestion: ' ' + subcommandKeys[0],
        }
      }

      return {
        commandSuggestion: fullCmd.slice(cmdName.length),
        paramSuggestion: '',
      }
    }
  }

  const cmd = CONSOLE_COMMANDS[cmdName]
  if (!cmd) return { commandSuggestion: '', paramSuggestion: '' }

  const subcommands = cmd.subcommands || {}

  // 🔹 2. Subcommand wird gerade getippt
  if (parts.length === 2) {
    const matchingSubs = Object.keys(subcommands).filter((sub) => sub.startsWith(subCmdInput))

    if (matchingSubs.length === 1) {
      const matchedSub = matchingSubs[0]
      const sub = subcommands[matchedSub]
      const opts = sub.options || {}
      const optKeys = Object.keys(opts)

      let paramSuggestion = ''
      if ('requiresOption' in sub && sub.requiresOption) {
        if (optKeys.length === 1) {
          const onlyOpt = opts[optKeys[0]]
          paramSuggestion = onlyOpt.alias ? ` -${onlyOpt.alias} ` : ` --${onlyOpt.name} `
        } else if (optKeys.length > 1) {
          paramSuggestion = ' --'
        }
      }

      return {
        commandSuggestion: matchedSub.slice(subCmdInput.length),
        paramSuggestion,
      }
    }
  }

  // 🔹 3. Subcommand vollständig + nichts danach
  if (subcommands[subCmdInput] && (rest.length === 0 || (rest.length === 1 && rest[0] === ''))) {
    const sub = subcommands[subCmdInput]
    const opts = sub.options || {}
    const optKeys = Object.keys(opts)

    if ('requiresOption' in sub && sub.requiresOption) {
      if (optKeys.length === 1) {
        const onlyOpt = opts[optKeys[0]]
        const suggestion = onlyOpt.alias ? ` -${onlyOpt.alias} ` : ` --${onlyOpt.name} `
        return {
          commandSuggestion: '',
          paramSuggestion: suggestion,
        }
      } else if (optKeys.length > 1) {
        return {
          commandSuggestion: '',
          paramSuggestion: '--',
        }
      }
    }
  }

  // 🔹 4. Option wird getippt
  const sub = subcommands[subCmdInput]
  if (!sub) return { commandSuggestion: '', paramSuggestion: '' }

  const token = rest.length > 0 ? rest[rest.length - 1] : ''
  const isFlag = token.startsWith('--') || token.startsWith('-')
  const paramKey = token.replace(/^--?/, '')

  const options = sub.options || {}

  const allOptions = Object.entries(options)
  const matchingOpt = allOptions.find(
    ([key, opt]) => key.startsWith(paramKey) || opt.alias === paramKey,
  )

  if (isFlag && matchingOpt) {
    const [key, opt] = matchingOpt
    let suggestionPart = ''

    if (token.startsWith('--')) {
      suggestionPart = key.slice(paramKey.length)
    } else if (opt.alias && token.startsWith('-')) {
      suggestionPart = opt.alias.slice(paramKey.length)
    }

    if (opt.requiresValue) {
      suggestionPart += ' '
    }

    return {
      commandSuggestion: '',
      paramSuggestion: suggestionPart || '',
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
    const parts = input.split(' ').filter(Boolean)
    const baseCommand = parts[0]
    const subCommand = parts[1]
    const currentParam = parts[2] || ''

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
      if (!selectedCommand) return

      const sub = selectedCommand.subcommands?.[subCommand]
      if (sub && sub.options) {
        const matchingOptions = Object.keys(sub.options).filter(
          (opt) => opt.startsWith(currentParam) || sub.options?.[opt].alias === currentParam,
        )

        if (matchingOptions.length > 1) {
          webConsole.print({
            module: TYCHE_MODULE.COMMAND,
            type: TYCHE_LOG_TYPE.COMMAND,
            message: `Available options: ${matchingOptions.join(', ')}`,
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
