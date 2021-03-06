import { ShipInfo } from '../types/azurlane-wiki'
import { List } from '../classes/list'
import Discord, { MessageEmbed } from 'discord.js'
import { EmbedShipPageAlias } from '../types/discord'
import { convertRarityToColor } from './wiki.helper'
import { findEmoji } from '../module/emoji'
import { convertShipRarityToEmoji, convertShipTypeToEmoji, convertSkillTypeToEmoji } from './emoji.helper'
import { ShipStats } from '../constants/emoji.constants'
import { BarrageInfo } from '../types/azurlane-wiki/barrage'

export function generateShipProfileEmbed(shipInfo: ShipInfo, defaultPageAlias: string): List<MessageEmbed>
export function generateShipProfileEmbed(shipInfo: ShipInfo, defaultPageIndex: number): List<MessageEmbed>
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
    .setColor(convertRarityToColor(shipInfo.rarity.name))
    .setTitle(shipInfo.name)
    .setURL(shipInfo.url)
    .addFields(
      { name: '> Rarity', value: `${findEmoji(convertShipRarityToEmoji(shipInfo.rarity.name))} ${shipInfo.rarity.name} (${shipInfo.rarity.stars})` },
      { name: '> Voice Actress', value: formatUrl(shipInfo.va.name, shipInfo.va.url), inline: true },
      { name: '> Artist', value: formatUrl(shipInfo.artist.name, shipInfo.artist?.link), inline: true },
      { name: '> Type', value: `${findEmoji(convertShipTypeToEmoji(shipInfo.shipType))} ${shipInfo.shipType}` },
      { name: '> Faction', value: shipInfo.nationality, inline: true },
      { name: '> Class', value: shipInfo.class, inline: true },
    )
  if (shipInfo.images.icon) embed.setThumbnail(shipInfo.images.icon)
  if (shipInfo.equipments.length) {
    embed.addField('> Equipments', shipInfo.equipments.reduce((result, equipmentInfo) =>
      result += `**???** **${equipmentInfo.type}** (${equipmentInfo.quantity}) (${equipmentInfo.efficiencyMin} -> ${equipmentInfo.efficiencyMax})\n`, ''))
  }
  return embed
}

function generateShipStatsEmbed(shipInfo: ShipInfo): MessageEmbed {
  const stats = shipInfo.stats
  const embed = new MessageEmbed()
    .setColor(convertRarityToColor(shipInfo.rarity.name))
    .setTitle(shipInfo.name)
    .setURL(shipInfo.url)
    .setDescription('__**Level 120**__')
    .addFields(
      { name: `${findEmoji(ShipStats.Health)} Health`, value: stats.health, inline: true },
      { name: `${findEmoji(ShipStats.Armor)} Armor`, value: stats.armor, inline: true },
      { name: `${findEmoji(ShipStats.Reload)} Reload`, value: stats.reload, inline: true },
      { name: `${findEmoji(ShipStats.Luck)} Luck`, value: stats.luck, inline: true },
      { name: `${findEmoji(ShipStats.Firepower)} Firepower`, value: stats.firepower, inline: true },
      { name: `${findEmoji(ShipStats.Torpedo)} Torpedo`, value: stats.torpedo, inline: true },
      { name: `${findEmoji(ShipStats.Evasion)} Evasion`, value: stats.evasion, inline: true },
      { name: `Speed`, value: stats.speed, inline: true },
      { name: `${findEmoji(ShipStats.AntiAir)} Anti Air`, value: stats.antiAir, inline: true },
      { name: `${findEmoji(ShipStats.Aviation)} Aviation`, value: stats.aviation, inline: true },
      { name: `${findEmoji(ShipStats.OilConsumption)} Oil`, value: stats.oilConsumption, inline: true },
      { name: `${findEmoji(ShipStats.Accuracy)} Accuracy`, value: stats.accuracy, inline: true },
      { name: `${findEmoji(ShipStats.ASW)} ASW`, value: stats.aSW, inline: true }
    )
  if (stats.oxygen) embed.addField(`${findEmoji(ShipStats.Oxygen)} Oxygen`, stats.oxygen, true)
  if (stats.ammunition) embed.addField(`${findEmoji(ShipStats.Ammunition)} Ammunition`, stats.ammunition, true)
  if (shipInfo.images.icon) embed.setThumbnail(shipInfo.images.icon)

  return embed
}

function generateShipSkillEmbed(shipInfo: ShipInfo): MessageEmbed[] {
  return shipInfo.skills.map(skill => new Discord.MessageEmbed()
    .setColor(convertRarityToColor(shipInfo.rarity.name))
    .setTitle(shipInfo.name)
    .setURL(shipInfo.url)
    .setDescription(`__**${skill.name}**__`)
    .setThumbnail(skill.image)
    .addField('> Type', `${findEmoji(convertSkillTypeToEmoji(skill.type))} ${skill.type}`)
    .addField('> Description', skill.description))
}

export function generateBarrageEmbed(barrages: BarrageInfo[], defaultPageAlias: string): List<MessageEmbed>
export function generateBarrageEmbed(barrages: BarrageInfo[], defaultPageIndex: number): List<MessageEmbed>
export function generateBarrageEmbed(barrages: BarrageInfo[], defaultPageParam: number | string = 0): List<MessageEmbed> {
  const embedList = new List<MessageEmbed>()
  barrages.forEach((barrage, key) => {
    const embed = new MessageEmbed()
      .setTitle(barrage.ship.name)
      .setURL(barrage.ship.url)
      .setDescription(`__**${barrage.name}**__\n*Values listed below assume the entire barrage hits an enemy.*`)
      .setColor('#eb1333')
      .setThumbnail(barrage.icon)
      .setFooter(`Page ${key + 1} of ${barrages.length}`)
    if (barrage.image) {
      embed.setImage(barrage.image)
    }
    barrage.rounds?.forEach(round => {
      embed.addFields([
        { name: `> Ammo Type: \`${round.type}\``, value: 'Damage Vs.' },
        { name: 'Light Armor', value: round.dmgL, inline: true },
        { name: 'Medium Armor', value: round.dmgM, inline: true },
        { name: 'Heavy Armor', value: round.dmgH, inline: true },
        ...(round.note ? [{ name: 'Note', value: round.note }] : []),
      ])
    })
    embedList.addPage(embed)
  })

  return embedList
}

function formatUrl(text: string, url: string): string {
  return url ? `[${text}](${url})` : text
}
