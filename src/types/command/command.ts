import * as t from 'ts-interface-checker'
import { Message } from 'discord.js'

const Command = t.iface([], {
  'name': 'string',
  'aliases': t.opt(t.array('string')),
  'description': t.opt('string'),
  'notifyAuthor': t.opt('boolean'),
  'guildOnly': t.opt('boolean'),
  'args': t.opt('boolean'),
  'usage': t.opt('string'),
  'execute': t.func('CommandExecutionResult', t.param('message', 'Discord.Message'), t.param('args', t.array('string'))),
})

export const exportedTypeSuite: t.ITypeSuite = {
  Command,
}

export interface Command {
  name: string
  aliases?: string[]
  description?: string
  notifyAuthor? :boolean
  notificationCallback?: NotificationCallback
  guildOnly?: boolean
  args?: boolean
  usage?: string
  execute: (message: Message, args: string[], replied?: Promise<Message>) => Promise<CommandExecutionResult>
}

interface NotificationCallback {
  preprocess?(message: Message, replied?: Promise<Message>): Promise<Message>
  success?(message: Message, replied?: Promise<Message>, result?: CommandExecutionResult): Promise<Message>
  failed?(message: Message, replied?: Promise<Message>, result?: CommandExecutionResult): Promise<Message>
}

export interface CommandExecutionResult {
  status: boolean
  error?: any
  extraArgs?: { [p: string]: any }
}

export enum CommandResponseType {
  Fail = 'fail',
  Success = 'success'
}
