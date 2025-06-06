import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ConsoleLine } from '@/types/Message'
import MarkdownIt from 'markdown-it'

export const useConsoleStore = defineStore('console', () => {
  const logs = ref<ConsoleLine[]>([])
  const md = new MarkdownIt({ html: true, linkify: true, typographer: true })
  const commandHistory: string[] = []

  function printMd(log: ConsoleLine) {
    logs.value.push({
      timestamp: log.timestamp ?? Date.now(),
      module: log.module,
      type: log.type,
      message: md.render(log.message),
    })
  }

  function print(log: ConsoleLine) {
    logs.value.push({
      timestamp: log.timestamp ?? Date.now(),
      module: log.module,
      type: log.type,
      message: log.message,
    })
  }

  function clearLogs() {
    logs.value = []
  }

  const getCommandHistory = (): string[] => {
    return commandHistory
  }

  const unshiftCommandHistory = (entry: string) => {
    if (commandHistory.length > 0) {
      if (commandHistory[0] !== entry) {
        // don't add the same command two times in a row
        commandHistory.unshift(entry)
      }
    } else {
      commandHistory.unshift(entry)
    }
  }

  return { logs, print, printMd, clearLogs, getCommandHistory, unshiftCommandHistory }
})
