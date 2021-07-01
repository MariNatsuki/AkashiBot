import Discord from 'discord.js'
import fs = require('fs')
import { Logger } from '../utils/logger'
import { isValidCommand, formatCommandMessage } from '../helpers/command.helper'
import { Command as CommandType } from '../types/command'

export class Command {
  private logger = new Logger(Command.name)
  private commandList = new Discord.Collection<string, CommandType>()

  constructor() {
    try {
      const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.ts'))

      for (const file of commandFiles) {
        this.logger.log(`Adding command ${file}`)
        try {
          const command = require(`../commands/${file.split('.')[0]}`)

          if (!isValidCommand(command)) {
            throw new TypeError('Wrong format')
          }

          this.add(command)
        }
        catch (e) {
          this.logger.error(`Command ${file} failed to load`, e.stack)
        }
      }
    } catch (e) {
      this.logger.error('There were something wrong during command loading', e.stack)
    }
  }

  add(command: any) {
    return this.commandList.set(command.name, command)
  }

  remove(commandName: string) {
    return this.commandList.delete(commandName)
  }

  execute(message: Discord.Message) {
    const command = formatCommandMessage(message)
    if (!this.commandList.has(command.name)) return "Command doesn't exist"

    this.logger.log(`Processing Command ${command.name} from Channel ${message.channel.id} (Server: ${message.guild.id})`)

    try {
      return this.commandList.get(command.name).execute(message, command.args)
    } catch (e) {
      this.logger.error(e)
      message.reply('There was an error trying to execute that command')
    }
  }
}
