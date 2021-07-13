import { Logger } from '../utils/logger'
import { Emoji, Guild } from 'discord.js'
import {
  ShipRarity as ShipRarityEmoji,
  ShipType as ShipTypeEmoji,
  SkillType as SkillTypeEmoji
} from '../constants/emoji.constants'

const logger = new Logger('EmojiHelper')
let emojiGuild: Guild

export function setEmojiGuild(guild: Guild): void {
  emojiGuild = guild
}

export function findEmoji(name: ShipTypeEmoji): Emoji | string {
  if (!emojiGuild) {
    logger.error('No Emoji Guild found')
    return ''
  }
  return emojiGuild.emojis.cache.find(emoji => emoji.name === name) || ''
}

export function convertShipTypeToEmoji(type: string): ShipTypeEmoji {
  return ShipTypeEmoji[type.replace(/ /g, '')]
}

export function convertShipRarityToEmoji(rarity: string): ShipTypeEmoji {
  return ShipRarityEmoji[rarity.replace(/ /g, '')]
}

export function convertSkillTypeToEmoji(type: string): ShipTypeEmoji {
  return SkillTypeEmoji[type.replace(/ /g, '')]
}
