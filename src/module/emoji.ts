import * as emojiList from '../constants/emoji.constants'
import { Logger } from '../utils/logger'
import { Emoji, Guild } from 'discord.js'
import { Emojis } from '../constants/emoji.constants'

const logger = new Logger('EmojiCacheModule')
let emojiGuild: Guild
const emojiCache: { [emojiName: string]: string } = {}

export async function initializeEmojiModule(): Promise<void> {
  logger.log('Initializing Emoji Module...')

  cacheEmoji()

  logger.log('Finished initializing Emoji Module!')
}

export function setEmojiGuild(guild: Guild): void {
  if (guild) {
    emojiGuild = guild
    logger.log(`Successfully set ${emojiGuild} <#${emojiGuild.id}> as Emoji Server`)
    cacheEmoji()
  }
}

function cacheEmoji(): void {
  if (!emojiGuild) {
    return
  }
  logger.log('Caching Emojis for faster message build time...')

  try {
    for (const emojiType in emojiList) {
      for (const index in emojiList[emojiType]) {
        const emojiName = emojiList[emojiType][index]
        emojiCache[emojiName] = findEmoji(emojiName).toString()
      }
    }
    logger.log('All emojis have been successfully cached!')
  } catch (e) {
    logger.error('Emojis failed to cache with error:', e.stack)
  }
}

export function findEmoji(name: Emojis): Emoji | string {
  if (!emojiGuild) {
    logger.error('No Emoji Guild found')
    return ''
  }
  return emojiCache[name] || emojiGuild.emojis.cache.find(emoji => emoji.name === name) || ''
}
