import Discord from 'discord.js'
import fs = require('fs')
import { Logger } from '../utils/logger'
import { isValidCommand, formatCommandMessage } from '../helpers/command.helper'
import { Command as CommandType, CommandExecutionResult } from '../types/command'

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
    if (!this.commandList.has(command.name)) return "Command doesn't exist"

    this.logger.log(`Processing Command ${command.name} from Channel ${message.channel.id} (Server: ${message.guild.id})`)

    try {
      const result: CommandExecutionResult = await this.commandList.get(command.name).execute(message, command.args)
      if (!result.status) {
        throw result.error || new Error('Command execution failed')
      }
    } catch (e) {
      this.logger.error(e)
    }
  }
}
