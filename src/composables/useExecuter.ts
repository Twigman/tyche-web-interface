import { useConsoleStore } from '@/stores/consoleStore'
import { TYCHE_LOG_TYPE } from '@/config/logTypes'
import { TYCHE_MODULE } from '@/config/module'
import { CONSOLE_COMMANDS } from '@/config/consoleCommands'
import { useStompStore } from '@/stores/stompStore'
import { putVolume } from '@/services/spotifyService'
import type { CommandParam } from '@/types/ConsoleCommand'

export function useExecuter() {
  const webConsole = useConsoleStore()
  const stompStore = useStompStore()

  const submitCommand = (cmd: string) => {
    if (!cmd.trim()) return
    // add new entry at index 0
    webConsole.unshiftCommandHistory(cmd)
    executeCommand(cmd)
  }

  /*
   * connect tyche -> cmds = 'connect', param = 'tyche', args = ''
   * spotify vol=50 -> 'spotify', param = 'vol', args='50'
   */
  function parseCommand(command: string) {
    const all = command.split(' ')
    const cmd = all[0]
    let param = ''
    let arg = ''

    if (all.length === 2) {
      // subcommand
      // get argument
      if (all[1].includes('=')) {
        const temp = all[1].split('=')

        if (temp.length === 2) {
          // parameter has argument
          param = temp[0]
          arg = temp[1]
        }
      } else {
        // only parameter
        // e.g. connect tyche
        param = all[1]
      }
    }

    return { cmd, param, arg }
  }

  function executeCommand(command: string): boolean {
    const { cmd, param, arg } = parseCommand(command)

    // TODO: Tyche Backend command?
    if (isValidCommand(cmd)) {
      commandActions[cmd](param, arg)
      return true
    } else {
      webConsole.print({
        module: TYCHE_MODULE.COMMAND,
        type: TYCHE_LOG_TYPE.ERROR,
        message: `Command '${cmd}' is not defined`,
      })
      return false
    }
  }

  function stripHtmlEntities(text: string): string {
    return text
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
  }

  function padVisible(text: string, targetLength: number): string {
    const visibleText = stripHtmlEntities(text)
    const paddingNeeded = targetLength - visibleText.length
    return text + ' '.repeat(paddingNeeded > 0 ? paddingNeeded : 0)
  }

  function printManPage(commandName?: string): void {
    if (!commandName) {
      webConsole.printMd({
        module: TYCHE_MODULE.COMMAND,
        type: TYCHE_LOG_TYPE.ERROR,
        message: "Usage: man <command>. Type 'help' for a list of commands.",
      })
      return
    }

    const command = CONSOLE_COMMANDS[commandName]

    if (!command) {
      webConsole.print({
        module: TYCHE_MODULE.COMMAND,
        type: TYCHE_LOG_TYPE.ERROR,
        message: `Unknown command: ${commandName}. Type 'help' for available commands.`,
      })
      return
    }

    let helpText = `TYCHE COMMAND MANUAL - ${command.cmd.toUpperCase()}<br />`
    helpText += `──────────────────────────────────────────────────<br /><br />`

    // SYNOPSIS Section
    helpText += 'SYNOPSIS<br /><br />'
    //
    helpText += `    ${command.cmd}`
    if (command.requiresArgument) {
      helpText += ' &lt;argument&gt;' // argument
    } else if (Object.keys(command.params).length > 0) {
      helpText += ' [OPTIONS]' // parameter but no argument
    }
    helpText += '<br /><br />'

    // DESCRIPTION Section
    helpText += 'DESCRIPTION<br /><br />'
    if (command.requiresArgument) {
      helpText += `    The '${command.cmd}' command requires an argument.<br /><br />`
    } else if (Object.keys(command.params).length === 0) {
      helpText += `    The '${command.cmd}' command does not require any options.<br /><br />`
    } else {
      helpText += `    The '${command.cmd}' command supports the following options:<br /><br />`

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(command.params).forEach(([_, param]: [string, CommandParam]) => {
        const requiresArg = param.requiresValue ? '=&lt;value&gt;' : ''
        helpText += `    ${padVisible(param.alias + requiresArg, 12)} - ${param.description || 'No description available'}<br />`
      })

      helpText += '<br />'
    }

    helpText += '──────────────────────────────────────────────────<br />'

    webConsole.printMd({
      module: TYCHE_MODULE.COMMAND,
      type: TYCHE_LOG_TYPE.COMMAND,
      message: helpText,
    })
  }

  function isValidCommand(cmd: string): boolean {
    return Object.values(CONSOLE_COMMANDS).some((command) => command.cmd === cmd)
  }

  function isInt(str: string) {
    const num = Number(str)
    return Number.isInteger(num)
  }

  function printParameterNotDefinedErrorMsg(cmd: string, param: string): void {
    webConsole.print({
      module: TYCHE_MODULE.COMMAND,
      type: TYCHE_LOG_TYPE.ERROR,
      message: `Parameter '${param}' is not defined for '${cmd}'. See 'man ${cmd}' for usage`,
    })
  }

  function spotify(param: string, arg: string) {
    if (isInt(arg)) {
      // number argument passed
      switch (param) {
        case CONSOLE_COMMANDS.spotify.params.vol.alias:
          putVolume(Number(arg))
          break
        default:
          printParameterNotDefinedErrorMsg(CONSOLE_COMMANDS.spotify.cmd, param)
      }
    } else {
      // arg isnt a string
      webConsole.print({
        module: TYCHE_MODULE.COMMAND,
        type: TYCHE_LOG_TYPE.ERROR,
        message: `Invalid argument type for '${CONSOLE_COMMANDS.spotify.cmd} ${param}'`,
      })
    }
  }

  function connectCmd(param: string) {
    switch (param) {
      case CONSOLE_COMMANDS.connect.params.tyche.alias:
        stompStore.connect()
        break
      default:
        printParameterNotDefinedErrorMsg(CONSOLE_COMMANDS.connect.cmd, param)
    }
  }

  function disconnectCmd(param: string) {
    switch (param) {
      case CONSOLE_COMMANDS.disconnect.params.tyche.alias:
        stompStore.disconnect()
        break
      default:
        printParameterNotDefinedErrorMsg(CONSOLE_COMMANDS.disconnect.cmd, param)
    }
  }

  function printHelp() {
    let commandList = 'AVAILABLE COMMANDS<br />'
    commandList += '──────────────────────────────────<br />'

    Object.values(CONSOLE_COMMANDS).forEach((command) => {
      commandList += `${command.cmd.padEnd(12)} - ${command.description}<br />`
    })

    commandList += '──────────────────────────────────<br />'

    webConsole.printMd({
      module: TYCHE_MODULE.COMMAND,
      type: TYCHE_LOG_TYPE.COMMAND,
      message: commandList,
    })
  }

  const commandActions: Record<string, (param: string, arg: string) => void> = {
    [CONSOLE_COMMANDS.help.cmd]: () => printHelp(),
    [CONSOLE_COMMANDS.connect.cmd]: (param) => connectCmd(param),
    [CONSOLE_COMMANDS.disconnect.cmd]: (param) => disconnectCmd(param),
    [CONSOLE_COMMANDS.man.cmd]: (param) => printManPage(param),
    [CONSOLE_COMMANDS.spotify.cmd]: (param, arg) => spotify(param, arg),
  }

  return { submitCommand }
}
