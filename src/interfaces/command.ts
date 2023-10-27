import type { CacheType, PermissionResolvable, SlashCommandBuilder } from 'discord.js';

import type { IBot } from '../../types/bot';
import type { LocalizedChatInputCommandInteraction } from '../../types/discordjs';

export type CommandBuilder =
  | SlashCommandBuilder
  | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;

export interface Command<Cache extends CacheType = CacheType> {
  userPermissions?: PermissionResolvable[];
  botPermissions?: PermissionResolvable[];
  cooldown?: number;
  data: CommandBuilder | ((bot: IBot) => CommandBuilder);
  execute(interaction: LocalizedChatInputCommandInteraction<Cache>, bot: IBot): Awaitable<unknown>;
}

export type ParsedCommand = Omit<Command, 'data'> & { name: string; data: CommandBuilder };
