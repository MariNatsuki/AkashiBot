import { Logger } from '../utils/logger'
import { Emoji, Guild } from 'discord.js'
import { ShipRarity, ShipType, SkillType } from '../types/emoji'

const logger = new Logger('EmojiHelper')
let emojiGuild: Guild

export function setEmojiGuild(guild: Guild): void {
  emojiGuild = guild
}

export function findEmoji(name: ShipType): Emoji | string {
  if (!emojiGuild) {
    logger.error('No Emoji Guild found')
    return ''
  }
  return emojiGuild.emojis.cache.find(emoji => emoji.name === name) || ''
}

export function convertShipTypeToEmoji(type: string): ShipType {
  return ShipType[type.replace(/ /g, '')]
}

export function convertShipRarityToEmoji(rarity: string): ShipType {
  return ShipRarity[rarity.replace(/ /g, '')]
}

export function convertSkillTypeToEmoji(type: string): ShipType {
  return SkillType[type.replace(/ /g, '')]
}
