import Discord, { MessageReaction } from 'discord.js'
import config from 'config'
import fs = require('fs')
import { Logger } from '../utils/logger'
import { isValidCommand, formatCommandMessage } from '../helpers/command.helper'
import { Command as CommandType, CommandExecutionResult } from '../types/command'
import { CommandStatusEmoji } from '../constants/discord.constant'

import defaultCommand = require('../commands/template/default')

export class Command {
  private logger = new Logger(Command.name)
  private commandList = new Discord.Collection<string, CommandType>()

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
    this.commandList.set(command.name, command)
  }

  remove(commandName: string) {
    return this.commandList.delete(commandName)
  }

  async execute(message: Discord.Message) {
    const userCommand = formatCommandMessage(message)

    if (!this.commandList.has(userCommand.name)) {
      return this.logger.log(`Command [${userCommand.name}] doesn't exist`)
    }

    if (this.commandList.get(userCommand.name).guildOnly && message.channel.type === 'dm') {
      return this.logger.log(`Command [${userCommand.name}] can't execute inside DMs`)
    }

    let reply
    const command = this.commandList.get(userCommand.name)

    if (command.args && !userCommand.args.length) {
      reply = `${message.author} You didn't provide any arguments!`

      if (command.usage) {
        reply += `\nThe proper usage would be: \`${config.get('Bot.Command.prefix')}${command.name} ${command.usage}\``
      }
    }

    if (reply) {
      return message.channel.send(reply)
    }

    this.logger.log(`Processing Command ${userCommand.name} from Channel ${message.channel.id} (Server: ${message.guild.id})`)

    let react: MessageReaction
    try {
      if (command.notifyAuthor) {
        react = await message.react(CommandStatusEmoji.Processing)
      }
      const result: CommandExecutionResult = await command.execute(message, userCommand.args)
      if (result && !result.status) {
        throw result.error || new Error(`Command [${userCommand.name}] failed to execute`)
      }
      if (command.notifyAuthor) {
        if (react) {
          await react.remove()
        }
        react = await message.react(CommandStatusEmoji.Done)
      }
    } catch (e) {
      this.logger.error(e)
      if (command.notifyAuthor) {
        if (react) {
          await react.remove()
        }
        await message.react(CommandStatusEmoji.Failed)
      }
    }
  }
}
