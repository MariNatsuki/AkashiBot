import { findShip } from '../module/azurlane-wiki'

import Discord from 'discord.js'
import { WikitextParserOptionsType } from '../types/formatter/formatter'
import { generateWikitextParseOptions } from '../utils/formatter'

module.exports = {
  name: 'skill',
  description: 'Find Ship\'s skill on Wiki',
  execute(message, args) {
    findShip(args.join(' ').trim(), generateWikitextParseOptions(WikitextParserOptionsType.Discord)).then(ship => {
      if (!ship) {
        message.reply('No ship found. Please try a different search term.')
        return
      }
      const reply = new Discord.MessageEmbed()
        .setColor('#2ECC71')
        .setTitle(ship.name)
        .setURL(ship.url)
      ship.skills.forEach(skill => reply.addField(`> ${skill.name}`, `**Type:** ${skill.type}\n**Description:** ${skill.description}`))
      message.reply(reply)
    })
  },
}
