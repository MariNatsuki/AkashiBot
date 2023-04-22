import type { CacheType, ChatInputCommandInteraction, PermissionResolvable, SlashCommandBuilder } from 'discord.js';

import type { IBot } from '../../types/bot';

export type CommandBuilder = SlashCommandBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;

export interface Command<Cache extends CacheType = CacheType> {
  userPermissions?: PermissionResolvable[];
  botPermissions?: PermissionResolvable[];
  cooldown?: number;
  data: CommandBuilder | ((bot: IBot) => CommandBuilder);
  execute(interaction: ChatInputCommandInteraction<Cache>, bot: IBot): unknown | Promise<unknown>;
}
