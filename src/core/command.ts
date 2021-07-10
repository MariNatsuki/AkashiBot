import Discord, { MessageReaction } from 'discord.js'
import fs = require('fs')
import { Logger } from '../utils/logger'
import { isValidCommand, formatCommandMessage } from '../helpers/command.helper'
import { Command as CommandType, CommandExecutionResult } from '../types/command'
import { CommandStatusEmoji } from '../constants/discord.constant'

export class Command {
  private logger = new Logger(Command.name)
  private commandList = new Discord.Collection<string, CommandType>()

  constructor() {
    try {
      const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.ts'))

      for (const file of commandFiles) {
        this.logger.log(`Adding command ${file}`)
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const command = require(`../commands/${file.split('.')[0]}`)

          const commandValid = isValidCommand(command)
          if (typeof commandValid === 'object') {
            throw commandValid
          }

          this.add(command)
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
    const command = formatCommandMessage(message)
    if (!this.commandList.has(command.name)) {
      return this.logger.log(`Command [${command.name}] doesn't exist`)
    }

    if (this.commandList.get(command.name).guildOnly && message.channel.type === 'dm') {
      return this.logger.log(`Command [${command.name}] can't execute inside DMs`)
    }

    this.logger.log(`Processing Command ${command.name} from Channel ${message.channel.id} (Server: ${message.guild.id})`)

    const cmd = this.commandList.get(command.name)
    let react: MessageReaction
    try {
      if (cmd.notifyAuthor) {
        react = await message.react(CommandStatusEmoji.Processing)
      }
      const result: CommandExecutionResult = await cmd.execute(message, command.args)
      if (!result.status) {
        throw result.error || new Error(`Command [${command.name}] failed to execute`)
      }
      if (cmd.notifyAuthor) {
        if (react) {
          await react.remove()
        }
        react = await message.react(CommandStatusEmoji.Done)
      }
    } catch (e) {
      this.logger.error(e)
      if (cmd.notifyAuthor) {
        if (react) {
          await react.remove()
        }
        await message.react(CommandStatusEmoji.Failed)
      }
    }
  }
}
