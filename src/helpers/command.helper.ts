import Discord from 'discord.js'
import config from 'config'
import { createCheckers } from 'ts-interface-checker'
import { exportedTypeSuite } from '../types/command'

export function isCommand(message: Discord.Message): boolean {
  const botConfig = config.get('Bot.Command')

  return message.content.startsWith(botConfig.prefix) && !message.author.bot
}

export function formatCommandMessage(message: Discord.Message): { name: string, args: string[] } {
  const botConfig = config.get('Bot.Command')

  const args = message.content.slice(botConfig.prefix.length).trim().split(/ +/)
  const name = args.shift().toLowerCase()

  return { name, args }
}

export function isValidCommand(command: any): boolean {
  const { Command } = createCheckers(exportedTypeSuite)

  try {
    Command.check(command)
  } catch (e) {
    return false
  }
  return true
}
