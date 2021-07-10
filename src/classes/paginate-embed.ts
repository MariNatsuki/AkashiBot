import config from 'config'
import { ToWords } from 'to-words'
import { List } from './list'
import { Message, MessageEmbed, MessageReaction } from 'discord.js'
import { UnicodeEmoji } from '../constants/discord.constant'
import { Logger } from '../utils/logger'

const pageNavigationEmotes = [
  UnicodeEmoji.ArrowLeft,
  UnicodeEmoji.ArrowRight
]

const pageSelectionEmotes = [
  UnicodeEmoji.One,
  UnicodeEmoji.Two,
  UnicodeEmoji.Three,
  UnicodeEmoji.Four,
  UnicodeEmoji.Five,
  UnicodeEmoji.Six,
  UnicodeEmoji.Seven,
  UnicodeEmoji.Eight,
  UnicodeEmoji.Nine,
  UnicodeEmoji.Ten,
]

export class PaginateEmbed {
  private logger = new Logger(PaginateEmbed.name)
  private waitTime = config.get('Bot.Command.reactionWaitTime', 15000)
  private reactedEmotes: string[] = []
  private isProcessing = false

  constructor(
    private readonly message: Message,
    private readonly embedList: List<MessageEmbed>
  ) {}

  setWaitTime(time: string) {
    this.waitTime = time
  }

  async start(waitTime?: number): Promise<void> {
    await this.reactPaginationEmotes()
    await this.startCollector(waitTime)

  }

  private async reactPaginationEmotes() {
    await this.message.react(UnicodeEmoji.ArrowLeft)
    await this.message.react(UnicodeEmoji.ArrowRight)
    this.reactedEmotes.push(UnicodeEmoji.ArrowLeft, UnicodeEmoji.ArrowRight)
    const pageCount = this.embedList.length
    const toWords = new ToWords()
    for (let i = 1; i <= pageCount; i++) {
      this.reactedEmotes.push((await this.message.react(UnicodeEmoji[toWords.convert(i)])).emoji.name)
    }
  }

  private async startCollector(waitTime: number) {
    const filter = (reaction, user) => {
      return (pageNavigationEmotes.includes(reaction.emoji.name)
        || pageSelectionEmotes.includes(reaction.emoji.name))
        && user.id !== this.message.author.id
    }

    const collector = this.message.createReactionCollector(filter, { time: waitTime || this.waitTime, dispose: true })

    collector.on('collect', this.handleReaction.bind(this))

    collector.on('remove', this.handleReaction.bind(this))

    collector.on('end', this.finishUp.bind(this))
  }

  private async handleReaction(reaction) {
    if (this.isProcessing) {
      return
    }
    this.isProcessing = true

    try {
      switch (reaction.emoji.name) {
        case UnicodeEmoji.ArrowLeft:
          this.embedList.previousPage()
          break
        case UnicodeEmoji.ArrowRight:
          this.embedList.nextPage()
          break
        default:
          this.embedList.goToPage(pageSelectionEmotes.findIndex(item => item === reaction.emoji.name))
      }
      await this.message.edit(this.embedList.currentPage())
    }
    catch (e) {
      this.logger.error('Error encountered', e.stack)
    }
    finally {
      this.isProcessing = false
    }
  }

  private async finishUp() {
    return this.reactedEmotes.forEach(emote => this.message.reactions.cache.get(emote).remove())
  }
}
