import Discord from 'discord.js'
import { Command } from './command'
import { isCommand } from '../helpers/command.helper'
import { Logger } from '../utils/logger'
import { setEmojiGuild } from '../module/emoji'

export class Bot {
  private readonly logger = new Logger(Bot.name)
  private client: Discord.Client
  private command: Command

  constructor() {
    this.logger.log('Initializing Bot...')
    this.initCommandHandler()
    this.initDiscordClient()
  }

  private initCommandHandler() {
    this.command = new Command()
  }

  private initDiscordClient() {
    const client = new Discord.Client({
      restTimeOffset: 0
    })
    this.client = client
    client.on('ready', () => {
      this.logger.log(`Logged in as ${client.user.tag}!`)

      const emojiGuild = client.guilds.cache.find(guild => guild.id === process.env.EMOJI_DISCORD_SERVER_ID)
      if (emojiGuild) {
        setEmojiGuild(emojiGuild)
      } else {
        this.logger.warn(`Cannot find Server ${emojiGuild}. Have the bot joined this Server?`)
      }
    })

    client.on('message', message => {
      this.processMessage(message)
    })

    client.login(process.env.DISCORD_TOKEN)
      .catch(e => {
        if (e.code === 'TOKEN_INVALID') {
          this.logger.error(`Wrong Token , please check your .env (Your Token: ${process.env.DISCORD_TOKEN})`)
          return
        }
        throw e
      })
    return client
  }

  private processMessage(message: Discord.Message) {
    if (!isCommand(message)) return

    this.command.execute(message)
  }
}
