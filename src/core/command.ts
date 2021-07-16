import { Message, Collection } from 'discord.js'
import config from 'config'
import fs = require('fs')
import { Logger } from '../utils/logger'
import { isValidCommand, formatCommandMessage } from '../helpers/command.helper'
import { Command as CommandType, CommandExecutionResult } from '../types/command'

import defaultCommand = require('../commands/template/default')

export class Command {
  private logger = new Logger(Command.name)
  private commandList = new Collection<string, CommandType>()
  private cooldownList = new Collection<string, Collection<string, number>>()

  constructor() {
    try {
      const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.ts'))

      for (const file of commandFiles) {
        this.logger.log(`Loading command ${file}`)
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const command = require(`../commands/${file.split('.')[0]}`)

          const commandValid = isValidCommand(command)
          if (typeof commandValid === 'object') {
            throw commandValid
          }

          this.add({ ...defaultCommand, ...command })
          this.logger.log(`Command ${file} loaded!`)
        }
        catch (e) {
          this.logger.error(`Command ${file} failed to load`, e.stack)
        }
      }
    } catch (e) {
      this.logger.error('There were something wrong during commands loading', e.stack)
    }
  }

  add(command: any) {
    if (this.commandList.has(command.name)) {
      this.logger.warn(`Cannot add command "${command.name}" because it's name is conflicted with another command!`)
      return
    }
    this.commandList.set(command.name, command)
  }

  remove(commandName: string) {
    return this.commandList.delete(commandName)
  }

  async execute(message: Message) {
    const userCommand = formatCommandMessage(message).command
    const command = this.commandList.get(userCommand.name)
      || this.commandList.find(cmd => cmd.aliases && cmd.aliases.includes(userCommand.name))

    let reply

    if (!command) {
      return this.logger.log(`Command [${userCommand.name}] doesn't exist`)
    }

    if (command.guildOnly && message.channel.type === 'dm') {
      return this.logger.log(`Command [${userCommand.name}] can't execute inside DMs`)
    }

    const timeOnCooldown = this.isCommandOnCooldown(message.author.id, command.name, command.cooldown)
    if (timeOnCooldown > 0) {
      return message.channel.send(`${message.author} Please wait ${Math.round(timeOnCooldown / 1000)} second(s) before reusing this command!`)
    }

    if (command.args && !userCommand.args.length) {
      reply = `${message.author} You didn't provide any arguments!`

      if (command.usage) {
        reply += `\nThe proper usage would be: \`${config.get('Bot.Command.prefix')}${command.name} ${command.usage}\``
      }
    }

    if (reply) {
      return message.channel.send(reply)
    }

    this.logger.log(`Processing Command [${userCommand.name}] from Channel ${message.channel} - Server: ${message.guild} <#${message.guild.id}>`)

    let replied: Promise<Message>
    let result: CommandExecutionResult
    try {
      replied = command.notifyAuthor ? command.notificationCallback?.preprocess?.apply(this, [message]) : undefined

      result = await command.execute(message, userCommand.args, replied)
      if (result && !result.status) {
        throw result.error || new Error(`Command [${userCommand.name}] failed to execute`)
      }
      command.notifyAuthor && command.notificationCallback?.success?.apply(this, [message, replied])
    } catch (e) {
      this.logger.error(`Processing command [${command.name}] encountered an error`, e.stack)
      command.notifyAuthor && command.notificationCallback?.failed?.apply(this, [message, replied, result])
    }
  }

  private isCommandOnCooldown(authorId: string, command: string, cooldown: number): number {
    if (!this.cooldownList.has(command)) {
      this.cooldownList.set(command, new Collection<string, number>())
    }

    const now = Date.now()
    const timestamps = this.cooldownList.get(command)
    const timeLeft = timestamps.get(authorId) + cooldown - now
    if (timeLeft >= 0) {
      return timeLeft
    }
    timestamps.set(authorId, now)
    return 0
  }
}
