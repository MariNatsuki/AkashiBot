/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-empty-interface */
import './module';

import type { CommandManager } from '../src/core/command-manager.ts';

export interface Module<Injections extends Record<string, any> = Record<string, any>> {
  (bot: _IBot):
    | Awaitable<void>
    | Awaitable<{
        name?: string;
        provide?: Injections;
      }>;
}

export interface _Modules {
  [key: string]: unknown;
}

export interface _IBot {
  name: string | undefined;
  commandManager: CommandManager;
  modules: _Modules;
}

export interface Modules extends _Modules {}

export interface IBot extends _IBot {
  modules: Modules;
}
