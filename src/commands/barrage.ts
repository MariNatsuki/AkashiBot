import { Command, CommandExecutionResult, CommandResponseType } from '../types/command'
import { Message } from '../types/command/message'
import { EmbedShipPageAlias } from '../types/discord'
import { findBarrage, findShip } from '../module/azurlane-wiki'
import { generateWikitextParseOptions } from '../utils/formatter'
import { WikitextParserOptionsType } from '../types/formatter'
import { generateGenericCommandResponse } from '../helpers/command.helper'
import { generateBarrageEmbed, generateShipProfileEmbed } from '../helpers/discord.helper'
import { PaginateEmbed } from '../classes/paginate-embed'

module.exports = {
  name: 'barrage',
  description: "Find Ship's barrages on Wiki",
  cooldown: 10000,
  notifyAuthor: true,
  notificationCallback: {
    preprocess(message: Message, replied?: Promise<Message>): Promise<Message> {
      const msg = `${message.author} Finding barrages for your ship, please wait...`
      return replied ? Promise.resolve(replied).then(rpl => rpl.edit(msg)) : message.channel.send(msg)
    },
    failed(message: Message, replied?: Promise<Message>, result?: CommandExecutionResult): Promise<Message> {
      const msg = result?.extraArgs?.message || `${message.author} ${generateGenericCommandResponse(CommandResponseType.Fail)}`
      return replied ? Promise.resolve(replied).then(rpl => rpl.edit(msg)) : message.channel.send(msg)
    }
  },
  guildOnly: true,
  args: true,
  usage: '<ship name>',
  async execute(message: Message, args: string[], replied?: Promise<Message>): Promise<CommandExecutionResult> {
    try {
      const barrages = await findBarrage(args.join(' ').trim(), generateWikitextParseOptions(WikitextParserOptionsType.Discord))

      if (!barrages || !barrages.length) {
        return { status: false, extraArgs: { message: `${message.author} Ship not found. Please try a different search term.` } }
      }

      await new PaginateEmbed(message, generateBarrageEmbed(barrages, 0)).reply(replied)

      return { status: true }
    } catch (e) {
      return { status: false, error: e }
    }
  },
} as Command
