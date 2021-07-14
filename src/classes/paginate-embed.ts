import config from 'config'
import { ToWords } from 'to-words'
import { List } from './list'
import { Message, MessageEmbed } from 'discord.js'
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
  private replied: Message
  private isDisplayPageNumber = false

  constructor(
    private readonly message: Message,
    private readonly embedList: List<MessageEmbed>
  ) {}

  setWaitTime(time: string) {
    this.waitTime = time
  }

  setDisplayPageNumber(isDisplay: boolean) {
    this.isDisplayPageNumber = isDisplay
  }

  async reply(replied?: Promise<Message>, waitTime?: number): Promise<void> {
    this.replied = await (await replied)?.edit('', this.embedList.currentPage()) || await this.message.reply(this.embedList.currentPage())
    if (this.embedList.length > 1) {
      await this.reactPaginationEmotes()
      await this.startCollector(waitTime)
    }
  }

  private async reactPaginationEmotes() {
    await this.replied.react(UnicodeEmoji.ArrowLeft)
    await this.replied.react(UnicodeEmoji.ArrowRight)
    this.reactedEmotes.push(UnicodeEmoji.ArrowLeft, UnicodeEmoji.ArrowRight)
    if (!this.isDisplayPageNumber) {
      return
    }
    const pageCount = this.embedList.length
    const toWords = new ToWords()
    for (let i = 1; i <= pageCount; i++) {
      this.reactedEmotes.push((await this.replied.react(UnicodeEmoji[toWords.convert(i)])).emoji.name)
    }
  }

  private async startCollector(waitTime: number) {
    const filter = (reaction, user) => (pageNavigationEmotes.includes(reaction.emoji.name)
      || pageSelectionEmotes.includes(reaction.emoji.name))
      && user.id !== this.replied.author.id

    const collector = this.replied.createReactionCollector(filter, { time: waitTime || this.waitTime, dispose: true })

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
      await this.replied.edit(this.embedList.currentPage())
    }
    catch (e) {
      this.logger.error('Error encountered', e.stack)
    }
    finally {
      this.isProcessing = false
    }
  }

  private async finishUp() {
    return this.reactedEmotes.forEach(emote => this.replied.reactions.cache.get(emote).remove())
  }
}
