import { Logger } from '../utils/logger'
import { Emoji, Guild } from 'discord.js'
import {
  Rarity as RarityEmoji,
  ShipType as ShipTypeEmoji,
  SkillType as SkillTypeEmoji
} from '../constants/emoji.constants'

const logger = new Logger('EmojiHelper')

export function convertShipTypeToEmoji(type: string): ShipTypeEmoji {
  return ShipTypeEmoji[type.replace(/ /g, '')]
}

export function convertRarityToEmoji(rarity: string): ShipTypeEmoji {
  return RarityEmoji[rarity.replace(/ /g, '')]
}

export function convertSkillTypeToEmoji(type: string): ShipTypeEmoji {
  return SkillTypeEmoji[type.replace(/ /g, '')]
}
