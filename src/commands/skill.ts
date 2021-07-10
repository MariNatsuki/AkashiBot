import { CommandExecutionResult, CommandResponseType } from '../types/command'
import { findShip } from '../module/azurlane-wiki'
import { WikitextParserOptionsType } from '../types/formatter/formatter'
import { generateWikitextParseOptions } from '../utils/formatter'
import { generateGenericCommandResponse } from '../helpers/command.helper'
import { generateShipProfileEmbed } from '../helpers/discord.helper'
import { EmbedShipPageAlias } from '../types/discord'
import { PaginateEmbed } from '../classes/paginate-embed'

module.exports = {
  name: 'skill',
  description: 'Find Ship\'s skill on Wiki',
  async execute(message, args): Promise<CommandExecutionResult> {
    try {
      const ship = await findShip(args.join(' ').trim(), generateWikitextParseOptions(WikitextParserOptionsType.Discord))
      if (!ship) {
        await message.reply('Ship not found. Please try a different search term.')
        return
      }
      const shipEmbedList = generateShipProfileEmbed(ship, `${EmbedShipPageAlias.Skill} 1`)

      message.reply(shipEmbedList.currentPage())
        .then(async replied => new PaginateEmbed(replied, shipEmbedList).start())

      return { status: true }
    } catch (e) {
      await message.reply(generateGenericCommandResponse(CommandResponseType.Fail))
      return { status: false, error: e }
    }
  },
}
