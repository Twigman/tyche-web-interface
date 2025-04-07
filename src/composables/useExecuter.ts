import { useConsoleStore } from '@/stores/consoleStore'
import { TYCHE_LOG_TYPE } from '@/config/logTypes'
import { TYCHE_MODULE } from '@/config/module'
import { CONSOLE_COMMANDS } from '@/config/consoleCommands'
import { useStompStore } from '@/stores/stompStore'
import { putNext, putPause, putPlay, putPrevious, putVolume } from '@/services/spotifyService'
import { parseCLI } from '@/services/commandParserService'
import type { CommandHandler, CLIOptionValues } from '@/types/ConsoleCommand'
import { getTimerList } from '@/services/timerService'

export function useExecuter() {
  const webConsole = useConsoleStore()
  const stompStore = useStompStore()

  const submitCommand = (cmd: string) => {
    if (!cmd.trim()) return
    // add new entry at index 0
    webConsole.unshiftCommandHistory(cmd)
    executeCommand(cmd)
  }

  function executeCommand(command: string): boolean {
    const argv = command.split(' ')
    const parsedCommand = parseCLI(argv, CONSOLE_COMMANDS)

    if (parsedCommand === null) {
      webConsole.print({
        module: TYCHE_MODULE.COMMAND,
        type: TYCHE_LOG_TYPE.ERROR,
        message: `Command '${command}' is not defined`,
      })
      return false
    } else {
      commandActions[parsedCommand.command](parsedCommand)
      return true
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

  function printParameterNotDefinedErrorMsg(cmd: string, param: string): void {
    webConsole.print({
      module: TYCHE_MODULE.COMMAND,
      type: TYCHE_LOG_TYPE.ERROR,
      message: `Parameter '${param}' is not defined for '${cmd}'. See 'man ${cmd}' for usage`,
    })
  }

  function spotify(param: string, arg: CLIOptionValues | undefined) {
    if (CONSOLE_COMMANDS.spotify.subcommands !== undefined) {
      switch (param) {
        case CONSOLE_COMMANDS.spotify.subcommands.vol.name:
          if (arg !== undefined) {
            putVolume(Number(arg['value']))
          }
          break
        case CONSOLE_COMMANDS.spotify.subcommands.play.name:
          putPlay()
          break
        case CONSOLE_COMMANDS.spotify.subcommands.pause.name:
          putPause()
          break
        case CONSOLE_COMMANDS.spotify.subcommands.prev.name:
          putPrevious()
          break
        case CONSOLE_COMMANDS.spotify.subcommands.next.name:
          putNext()
          break
        default:
          printParameterNotDefinedErrorMsg(CONSOLE_COMMANDS.spotify.cmd, param)
      }
    }
  }

  function connectCmd(param: string) {
    if (CONSOLE_COMMANDS.connect.subcommands !== undefined) {
      switch (param) {
        case CONSOLE_COMMANDS.connect.subcommands.tyche.name:
          stompStore.connect()
          break
        default:
          printParameterNotDefinedErrorMsg(CONSOLE_COMMANDS.connect.cmd, param)
      }
    }
  }

  function disconnectCmd(param: string) {
    if (CONSOLE_COMMANDS.disconnect.subcommands !== undefined) {
      switch (param) {
        case CONSOLE_COMMANDS.disconnect.subcommands.tyche.name:
          stompStore.disconnect()
          break
        default:
          printParameterNotDefinedErrorMsg(CONSOLE_COMMANDS.disconnect.cmd, param)
      }
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

  function calc(param: string, args: CLIOptionValues | undefined) {
    if (CONSOLE_COMMANDS.calc.subcommands !== undefined && args !== undefined) {
      switch (param) {
        case CONSOLE_COMMANDS.calc.subcommands.carbs.name:
          // check args for calculation
          if (args['per-100g'] && args['amount']) {
            const res = (Number(args['per-100g']) / 100) * Number(args['amount'])
            // print result
            webConsole.print({
              module: TYCHE_MODULE.COMMAND,
              type: TYCHE_LOG_TYPE.COMMAND,
              message: res.toString(),
            })
          }
          break
        default:
          printParameterNotDefinedErrorMsg(CONSOLE_COMMANDS.calc.cmd, param)
      }
    }
  }

  async function timer(param: string, args: CLIOptionValues | undefined) {
    if (CONSOLE_COMMANDS.timer.subcommands !== undefined) {
      switch (param) {
        case CONSOLE_COMMANDS.timer.subcommands.list.name:
          let output: string = ''
          const timerList = await getTimerList()

          if (timerList.length > 0) {
            timerList.forEach((timer) => {
              output += `${timer.id}: ${timer.remainingTime} s\n`
            })
          }

          webConsole.printMd({
            module: TYCHE_MODULE.COMMAND,
            type: TYCHE_LOG_TYPE.COMMAND,
            message: output,
          })
          break
        default:
          printParameterNotDefinedErrorMsg(CONSOLE_COMMANDS.timer.cmd, param)
      }
    }
  }

  const commandActions: Record<string, CommandHandler> = {
    [CONSOLE_COMMANDS.help.cmd]: () => printHelp(),

    [CONSOLE_COMMANDS.connect.cmd]: (parsed) => {
      if (parsed.subcommand === 'tyche') connectCmd('tyche')
      else console.warn('Unknown connect target.')
    },

    [CONSOLE_COMMANDS.disconnect.cmd]: (parsed) => {
      if (parsed.subcommand === 'tyche') disconnectCmd('tyche')
      else console.warn('Unknown disconnect target.')
    },

    [CONSOLE_COMMANDS.man.cmd]: (parsed) => {
      if (parsed.subcommand) printManPage(parsed.subcommand)
      else console.warn('Missing command name for manual.')
    },

    [CONSOLE_COMMANDS.spotify.cmd]: (parsed) => {
      if (!parsed.subcommand) return console.warn('Missing spotify subcommand.')
      spotify(parsed.subcommand, parsed.subcommandOptions)
    },

    [CONSOLE_COMMANDS.calc.cmd]: (parsed) => {
      if (!parsed.subcommand) return console.warn('Missing calc subcommand.')
      calc(parsed.subcommand, parsed.subcommandOptions)
    },

    [CONSOLE_COMMANDS.timer.cmd]: (parsed) => {
      if (!parsed.subcommand) return console.warn('Missing timer subcommand.')
      timer(parsed.subcommand, parsed.subcommandOptions)
    },
  }

  return { submitCommand }
}
