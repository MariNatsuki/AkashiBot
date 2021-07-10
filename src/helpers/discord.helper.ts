import { ShipInfo } from '../types/azurlane-wiki'
import { List } from '../classes/list'
import Discord, { MessageEmbed } from 'discord.js'
import { EmbedShipPageAlias } from '../types/discord'
import { convertRarityToColor } from './wiki.helper'
import { convertShipRarityToEmoji, convertShipTypeToEmoji, convertSkillTypeToEmoji, findEmoji } from './emoji.helper'

export function generateShipProfileEmbed(shipInfo: ShipInfo, defaultPageAlias: string): List<MessageEmbed>
export function generateShipProfileEmbed(shipInfo: ShipInfo, defaultPageIndex: number | string): List<MessageEmbed>
export function generateShipProfileEmbed(shipInfo: ShipInfo, defaultPageParam: number | string = 0): List<MessageEmbed> {
  const embedList = new List<MessageEmbed>()
    .addPage(generateShipInfoEmbed(shipInfo), EmbedShipPageAlias.Info)
    .addPage(generateShipStatsEmbed(shipInfo), EmbedShipPageAlias.Stats)

  generateShipSkillEmbed(shipInfo).forEach((skillEmbed, key) => {
    embedList.addPage(skillEmbed, `${EmbedShipPageAlias.Skill} ${key + 1}`)
  })

  embedList.each((embed, key, alias) => {
    embed.setFooter(`${alias ? `${alias} ` : ''}(Page ${key + 1} of ${embedList.length})`)
      .addField('\u200b', '\u200b')
  })

  if (typeof defaultPageParam === 'number') {
    embedList.goToPage(defaultPageParam)
  }
  if (typeof defaultPageParam === 'string') {
    embedList.goToPageByAlias(defaultPageParam)
  }

  return embedList
}

function generateShipInfoEmbed(shipInfo: ShipInfo): MessageEmbed {
  const embed = new MessageEmbed()
    .setColor(convertRarityToColor(shipInfo.rarity))
    .setTitle(shipInfo.name)
    .setURL(shipInfo.url)
    .addFields(
      { name: '> Rarity', value: `${findEmoji(convertShipRarityToEmoji(shipInfo.rarity))} ${shipInfo.rarity}` },
      { name: '> Voice Actress', value: shipInfo.va, inline: true },
      { name: '> Artist', value: shipInfo.artist.link || shipInfo.artist.name, inline: true },
      { name: '> Type', value: `${findEmoji(convertShipTypeToEmoji(shipInfo.shipType))} ${shipInfo.shipType}` },
      { name: '> Faction', value: shipInfo.nationality, inline: true },
      { name: '> Class', value: shipInfo.class, inline: true },
    )
  if (shipInfo.images.icon) embed.setThumbnail(shipInfo.images.icon)
  if (shipInfo.equipments.length) {
    embed.addField('> Equipments', shipInfo.equipments.reduce((result, equipmentInfo) => {
      result += `**•** **${equipmentInfo.type}** (${equipmentInfo.quantity}) (${equipmentInfo.efficiencyMin} -> ${equipmentInfo.efficiencyMax})\n`
      return result
    }, ''))
  }
  return embed
}

function generateShipStatsEmbed(shipInfo: ShipInfo): MessageEmbed {
  return new MessageEmbed()
    .setColor(convertRarityToColor(shipInfo.rarity))
    .setTitle(shipInfo.name)
    .setURL(shipInfo.url)
    .setDescription('*Under Construction...*')
}

function generateShipSkillEmbed(shipInfo: ShipInfo): MessageEmbed[] {
  return shipInfo.skills.map(skill => new Discord.MessageEmbed()
    .setColor(convertRarityToColor(shipInfo.rarity))
    .setTitle(shipInfo.name)
    .setURL(shipInfo.url)
    .setDescription(`__**${skill.name}**__`)
    .setThumbnail(skill.image)
    .addField('> Type', `${findEmoji(convertSkillTypeToEmoji(skill.type))} ${skill.type}`)
    .addField('> Description', skill.description))
}
