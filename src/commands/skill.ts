import Discord from 'discord.js'
import { CommandExecutionResult, CommandResponseType } from '../types/command'
import { findSkill } from '../module/azurlane-wiki'
import { WikitextParserOptionsType } from '../types/formatter/formatter'
import { generateWikitextParseOptions } from '../utils/formatter'
import { generateGenericCommandResponse } from '../helpers/command.helper'
import { convertSkillTypeToEmoji, findEmoji } from '../helpers/emoji.helper'

module.exports = {
  name: 'skill',
  description: 'Find Ship\'s skill on Wiki',
  async execute(message, args): Promise<CommandExecutionResult> {
    try {
      await findSkill(args.join(' ').trim(), generateWikitextParseOptions(WikitextParserOptionsType.Discord)).then(skill => {
        if (!skill) {
          message.reply('Ship not found. Please try a different search term.')
          return
        }
        const reply = new Discord.MessageEmbed()
          .setColor('#2ECC71')
          .setTitle(skill[0].name)
          .setThumbnail(skill[0].image)
          .addField('> Type', `${findEmoji(convertSkillTypeToEmoji(skill[0].type))} ${skill[0].type}`)
          .addField('> Description', skill[0].description)
        // ship.skills.forEach(skill => reply.addField(`> ${skill.name}`, `**Type:** ${skill.type}\n**Description:** ${skill.description}`))
        message.reply(reply)
      })
      return { status: true }
    } catch (e) {
      message.reply(generateGenericCommandResponse(CommandResponseType.Fail))
      return { status: false, error: e }
    }
  },
}
