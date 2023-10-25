/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-empty-interface */
import './module';

import type { CacheType, Collection } from 'discord.js';
import type { Command } from 'ioredis';

import type { CommandBuilder } from '../src/interfaces/command';

export interface Module<Injections extends Record<string, any> = Record<string, any>> {
  (bot: IBot):
    | Awaitable<void>
    | Awaitable<{
        name?: string;
        provide?: Injections;
      }>;
}

export interface Modules {
  [key: string]: any;
}

export interface _IBot {
  name: string | undefined;
  commands: Collection<string, Omit<Command<CacheType>, 'data'> & { data: CommandBuilder }>;
}

export interface IBot extends _IBot {
  modules: Modules;
}
