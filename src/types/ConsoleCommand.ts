export interface Option {
  name: string // z. B. "verbose"
  alias?: string // z. B. "v"
  requiresValue: boolean
  valueHint?: 'string' | 'number' | 'boolean'
  description?: string
}

export interface SubCommand {
  name: string // z. B. "carbs"
  description?: string
  requiresOption?: boolean
  options?: Record<string, Option> // z. B. "--per-100g", "--amount"
  positionalArgs?: string[] // z. B. ['inputFile'], wenn nötig
}

export interface Command {
  cmd: string // z. B. "calc"
  description: string
  globalOptions?: Record<string, Option> // z. B. "--verbose", "--help"
  subcommands?: Record<string, SubCommand> // z. B. "carbs", "fat", ...
  positionalArgs?: string[]
}

export type ParsedCLI = {
  command: string
  globalOptions: CLIOptionValues
  subcommand?: string
  subcommandOptions?: CLIOptionValues
  positionalArgs?: string[]
}

export type CommandHandler = (parsed: ParsedCLI) => void

export type CLIOptionValues = Record<string, string | number | boolean>
