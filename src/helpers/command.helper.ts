import Discord from 'discord.js'
import config from 'config'
import { createCheckers } from 'ts-interface-checker'
import { CommandResponseType, exportedTypeSuite } from '../types/command'
import { Message } from '../types/command/message'

export function isCommand(message: Discord.Message): boolean {
  const botConfig = config.get('Bot.Command')

  return message.content.startsWith(botConfig.prefix) && !message.author.bot
}

export function generateGenericCommandResponse(type: CommandResponseType): string {
  switch (type) {
    case CommandResponseType.Fail:
      return "Your command failed to process, please check if it's in correct format and try again!"
  }
}

export function formatCommandMessage(message: Message): Message {
  const botConfig = config.get('Bot.Command')

  const args = message.content.slice(botConfig.prefix.length).trim().split(/ +/)
  message.command = { name: args.shift().toLowerCase(), args }

  return message
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
