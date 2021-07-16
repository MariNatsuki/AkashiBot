import { Command, CommandExecutionResult, CommandResponseType } from '../types/command'
import { Message } from '../types/command/message'
import { findEquipment } from '../module/azurlane-wiki'
import { generateWikitextParseOptions } from '../utils/formatter'
import { WikitextParserOptionsType } from '../types/formatter'
import { generateGenericCommandResponse } from '../helpers/command.helper'
import { generateBarrageEmbed } from '../helpers/discord.helper'
import { PaginateEmbed } from '../classes/paginate-embed'

module.exports = {
  name: 'equipment',
  description: 'Find Equipments on Wiki',
  aliases: ['equip', 'gear'],
  cooldown: 10000,
  notifyAuthor: true,
  notificationCallback: {
    preprocess(message: Message, replied?: Promise<Message>): Promise<Message> {
      const msg = `${message.author} Finding your equipment, please wait...`
      return replied ? Promise.resolve(replied).then(rpl => rpl.edit(msg)) : message.channel.send(msg)
    },
    failed(message: Message, replied?: Promise<Message>, result?: CommandExecutionResult): Promise<Message> {
      const msg = result?.extraArgs?.message || `${message.author} ${generateGenericCommandResponse(CommandResponseType.Fail)}`
      return replied ? Promise.resolve(replied).then(rpl => rpl.edit(msg)) : message.channel.send(msg)
    }
  },
  guildOnly: true,
  args: true,
  usage: '<equipment name>',
  async execute(message: Message, args: string[], replied?: Promise<Message>): Promise<CommandExecutionResult> {
    try {
      const equipment = await findEquipment(args.join(' ').trim(), generateWikitextParseOptions(WikitextParserOptionsType.Discord))

      return { status: true }
    } catch (e) {
      return { status: false, error: e }
    }
  },
} as Command
