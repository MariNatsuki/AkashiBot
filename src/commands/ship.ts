import { findShip } from '../module/azurlane-wiki'
import Discord from 'discord.js'
import { convertRarityToColor } from '../helpers/wiki.helper'
import { generateWikitextParseOptions } from '../utils/formatter'
import { WikitextParserOptionsType } from '../types/formatter/formatter'

module.exports = {
  name: 'ship',
  description: 'Find Ship on Wiki',
  execute(message, args) {
    findShip(args.join(' ').trim(), generateWikitextParseOptions(WikitextParserOptionsType.Discord)).then(ship => {
      if (!ship) {
        message.reply('No ship found. Please try a different search term.')
        return
      }
      const reply = new Discord.MessageEmbed()
        .setColor(convertRarityToColor(ship.rarity))
        .setTitle(ship.name)
        .setURL(ship.url)
        .addFields(
          { name: '> Rarity', value: ship.rarity },
          { name: '> Voice Actress', value: ship.va, inline: true },
          { name: '> Artist', value: ship.artist, inline: true },
          { name: '> Type', value: ship.shipType },
          { name: '> Faction', value: ship.nationality, inline: true },
          { name: '> Class', value: ship.class, inline: true },
          { name: '> Armor', value: ship.armor }
        )
      if (ship.images.icon) reply.setThumbnail(ship.images.icon)
      // if (ship.images.portrait) reply.setImage(ship.images.portrait)
      if (ship.equipments.length) {
        reply.addField('> Equipments', ship.equipments.reduce((result, equipmentInfo) => {
          result += `**•** **${equipmentInfo.type}** (${equipmentInfo.quantity}) (${equipmentInfo.efficiencyMin} -> ${equipmentInfo.efficiencyMax})\n`
          return result
        }, ''))
      }
      if (ship.skills.length) {
        reply.addField('> Skills', ship.skills.reduce((result, skillInfo) => {
          result += `**•** **${skillInfo.name}** (${skillInfo.type})\n`
          return result
        }, ''))
      }
      message.reply(reply)
    })
  },
}
