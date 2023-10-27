import type { CacheType, ChatInputCommandInteraction, Interaction } from 'discord.js';

import type { Localized } from './i18next';

export type LocalizedInteraction = Interaction & Localized;

export type LocalizedChatInputCommandInteraction<Cached extends CacheType = CacheType> =
  ChatInputCommandInteraction<Cached> & Localized;
