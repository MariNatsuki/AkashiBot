import { CommandExecutionResult, CommandResponseType } from '../types/command'
import { Message } from '../types/command/message'
import { EmbedShipPageAlias } from '../types/discord'
import { findShip } from '../module/azurlane-wiki'
import { generateWikitextParseOptions } from '../utils/formatter'
import { WikitextParserOptionsType } from '../types/formatter'
import { generateGenericCommandResponse } from '../helpers/command.helper'
import { generateShipProfileEmbed } from '../helpers/discord.helper'
import { PaginateEmbed } from '../classes/paginate-embed'

module.exports = {
  name: 'ship',
  aliases: ['info', 'stats', 'skill'],
  description: 'Find Ship on Wiki',
  notifyAuthor: true,
  guildOnly: true,
  args: true,
  usage: '<ship name>',
  async execute(message: Message, args: string[]): Promise<CommandExecutionResult> {
    try {
      const ship = await findShip(args.join(' ').trim(), generateWikitextParseOptions(WikitextParserOptionsType.Discord))
      if (!ship) {
        await message.reply('Ship not found. Please try a different search term.')
        return
      }
      const shipEmbedList = generateShipProfileEmbed(ship, EmbedShipPageAlias.Info)
      switch (message.command.name) {
        case 'stats':
          shipEmbedList.goToPageByAlias(EmbedShipPageAlias.Stats)
          break
        case 'skill':
          shipEmbedList.goToPageByAlias(`${EmbedShipPageAlias.Skill} 1`)
          break
      }

      await new PaginateEmbed(message, shipEmbedList).reply()

      return { status: true }
    } catch (e) {
      await message.reply(generateGenericCommandResponse(CommandResponseType.Fail))
      return { status: false, error: e }
    }
  },
}
