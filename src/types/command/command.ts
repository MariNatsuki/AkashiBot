import * as t from 'ts-interface-checker'
import Discord from 'discord.js'

const Command = t.iface([], {
  'name': 'string',
  'description': t.opt('string'),
  'notifyAuthor': t.opt('boolean'),
  'guildOnly': t.opt('boolean'),
  'args': t.opt('boolean'),
  'usage': t.opt('string'),
  'execute': t.func('CommandExecutionResult', t.param('message', 'Discord.Message'), t.param('args', 'any')),
})

export const exportedTypeSuite: t.ITypeSuite = {
  Command,
}

export interface Command {
  name: string
  description?: string
  notifyAuthor? :boolean
  guildOnly?: boolean
  args?: boolean
  usage?: string
  execute: (message: Discord.Message, args: string[]) => Promise<CommandExecutionResult>
}

export interface CommandExecutionResult {
  status: boolean
  error?: any
}

export enum CommandResponseType {
  Fail = 'fail'
}
