export interface CommandParam {
  alias: string
  requiresValue: boolean
  description?: string
}

export interface Command {
  cmd: string
  description: string
  params: Record<string, CommandParam>
  requiresArgument?: boolean
}

export type CommandRegistry = Record<string, Command>
