/* eslint-disable @typescript-eslint/no-explicit-any */
import './module';

import type { CacheType, Collection } from 'discord.js';
import type { Command } from 'ioredis';

import type { CommandBuilder } from '../src/interfaces/command';

export interface Module<Injections extends Record<string, any> = Record<string, any>> {
  (bot: IBot):
    | Promise<void>
    | Promise<{
        name?: string;
        provide?: Injections;
      }>
    | void
    | {
        name?: string;
        provide?: Injections;
      };
}

export interface Modules {
  [key: string]: any;
}

export interface IBot {
  name: string | undefined;
  modules: Modules;
  commands: Collection<string, Omit<Command<CacheType>, 'data'> & { data: CommandBuilder }>;
}
