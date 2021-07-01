import * as t from 'ts-interface-checker'
import Discord from 'discord.js'

const Command = t.iface([], {
  'name': 'string',
  'description': t.opt('string'),
  'guildOnly': t.opt('boolean'),
  'args': t.opt('boolean'),
  'usage': t.opt('string'),
  'execute': t.func(t.iface([], {
  }), t.param('message', 'Discord.Message'), t.param('args', 'any')),
})

export const exportedTypeSuite: t.ITypeSuite = {
  Command,
}

export interface Command {
  name: string
  description?: string
  guildOnly?: boolean
  args?: boolean
  usage?: string
  execute: (message: Discord.Message, args: any) => {}
}
