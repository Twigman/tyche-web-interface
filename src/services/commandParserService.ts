import type { Command, SubCommand, Option } from '@/types/ConsoleCommand'
import type { ParsedCLI } from '@/types/ConsoleCommand'

/**
 * Parses a CLI argument vector (`argv`) and extracts the invoked command, global options,
 * optional subcommand, and subcommand-specific options.
 *
 * @param argv - An array of CLI arguments, typically process.argv.slice(2).
 *               The first element should be the command name.
 * @param commands - A mapping of available command definitions. Each command may define
 *                   global options and subcommands with their own options.
 *
 * @returns A `ParsedCLI` object containing the parsed command, its options, and any subcommand
 *          and subcommand options. Returns `null` if no command is provided or if the command
 *          is unknown.
 *
 * Behavior:
 * - Recognizes and parses global options prefixed with `--`, as defined in the command.
 * - Identifies and parses subcommands (if any) and their specific options.
 * - Ignores unrecognized tokens with a warning.
 * - Supports boolean flags and options requiring values with type casting.
 *
 * Example:
 * Input: ['calc', '--verbose', 'carbs', '--per-100g', '100']
 * Output:
 * {
 *   command: 'calc',
 *   globalOptions: { verbose: true },
 *   subcommand: 'carbs',
 *   subcommandOptions: { 'per-100g': 100 }
 * }
 */
export function parseCLI(argv: string[], commands: Record<string, Command>): ParsedCLI | null {
  if (argv.length === 0) return null

  const [cmdName, ...rest] = argv
  const command = commands[cmdName]
  if (!command) {
    console.error(`Unknown command: ${cmdName}`)
    return null
  }

  const result: ParsedCLI = {
    command: cmdName,
    globalOptions: {},
  }

  let i = 0
  let subcommand: SubCommand | undefined

  const matchOption = (
    token: string,
    options: Record<string, Option>,
  ): { key: string; option: Option } | null => {
    const isLong = token.startsWith('--')
    const isShort = token.startsWith('-') && !isLong
    const optKey = token.replace(/^--?/, '')

    for (const [key, opt] of Object.entries(options)) {
      if ((isLong && key === optKey) || (isShort && opt.alias === optKey)) {
        return { key, option: opt }
      }
    }
    return null
  }

  while (i < rest.length) {
    const token = rest[i]

    // Global option
    if (command.globalOptions) {
      const match = matchOption(token, command.globalOptions)
      if (match) {
        const { key, option } = match
        if (option.requiresValue) {
          const value = rest[i + 1]
          result.globalOptions[key] = castValue(value, option.valueHint)
          i += 2
        } else {
          result.globalOptions[key] = true
          i += 1
        }
        continue
      }
    }

    // Subcommand
    if (!result.subcommand && command.subcommands?.[token]) {
      result.subcommand = token
      subcommand = command.subcommands[token]
      result.subcommandOptions = {}
      i += 1
      continue
    }

    // Subcommand option
    if (subcommand?.options) {
      const match = matchOption(token, subcommand.options)
      if (match) {
        const { key, option } = match
        if (option.requiresValue) {
          const value = rest[i + 1]
          result.subcommandOptions![key] = castValue(value, option.valueHint)
          i += 2
        } else {
          result.subcommandOptions![key] = true
          i += 1
        }
        continue
      }
    }

    // Unrecognized input
    console.warn(`Unrecognized token: "${token}"`)
    i += 1
  }

  // 🔹 Handle command-level positionalArgs (if no subcommand matched)
  if (!result.subcommand) {
    const rawArgs = rest

    if (command.cmd === 'man') {
      // Sonderbehandlung: 'man' darf immer ein Argument haben
      result.positionalArgs = rawArgs
    } else if (command.positionalArgs) {
      result.positionalArgs = rawArgs.slice(0, command.positionalArgs.length)
    }
  }

  return result
}

function castValue(value: string, type?: 'string' | 'number' | 'boolean') {
  switch (type) {
    case 'number':
      return parseFloat(value)
    case 'boolean':
      return value === 'true'
    default:
      return value
  }
}
