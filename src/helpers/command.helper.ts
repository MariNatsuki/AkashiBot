import Discord from 'discord.js'
import config from 'config'
import { createCheckers } from 'ts-interface-checker'
import { CommandResponseType, exportedTypeSuite } from '../types/command'

export function isCommand(message: Discord.Message): boolean {
  const botConfig = config.get('Bot.Command')

  return message.content.startsWith(botConfig.prefix) && !message.author.bot
}

export function generateGenericCommandResponse(type: CommandResponseType): string {
  switch (type) {
    case CommandResponseType.Fail:
      return 'There was an error handling your command.'
  }
}

export function formatCommandMessage(message: Discord.Message): { name: string, args: string[] } {
  const botConfig = config.get('Bot.Command')

  const args = message.content.slice(botConfig.prefix.length).trim().split(/ +/)
  const name = args.shift().toLowerCase()

  return { name, args }
}

export function isValidCommand(command: any): boolean | Record<string, unknown> {
  const { Command } = createCheckers(exportedTypeSuite)

  try {
    Command.check(command)
    // Command.methodArgs('execute').check(command.)
  } catch (e) {
    return e
  }
  return true
}
