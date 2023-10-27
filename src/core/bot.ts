import type { Client, Interaction } from 'discord.js';
import { Events, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { isFunction, sortBy } from 'lodash';
import { dirname, join } from 'path';

import type { IBot, Modules } from '../../types/bot';
import { Logger } from '../utils/logger';
import { CommandManager } from './command-manager.ts';

export class Bot implements IBot {
  private readonly logger = new Logger('Bot');

  public name: string | undefined;
  public modules = {} as Modules;
  public commandManager = new CommandManager(join(dirname(Bun.main), 'commands'), this);

  public constructor(public readonly client: Client<true>) {
    this.client.login(Bun.env.DISCORD_TOKEN).catch(error => this.logger.error(error));

    this.client.once(Events.ClientReady, async () => {
      this.logger.log(`${this.client.user?.username} ready!`);
      this.name = this.client.user?.username;

      await this.loadModules();

      // await this.deleteSlashCommands();
      await this.commandManager.registerCommands();
    });

    this.client.on(Events.Warn, info => this.logger.log(info));
    this.client.on(Events.Error, this.logger.error);

    this.onInteractionCreate();
  }

  private async loadModules() {
    const modulesPath = join(dirname(Bun.main), 'modules');
    const moduleFiles = sortBy(readdirSync(modulesPath).filter(file => !file.endsWith('.map')));

    for (const file of moduleFiles) {
      const module = (await import(join(modulesPath, `${file}`))).default;
      if (isFunction(module)) {
        let moduleName = file;
        try {
          const { name, provide: providers = {} } = (await module(this)) || {};
          moduleName = name || moduleName;

          for (const key in providers) {
            this.modules[`$${key}`] = providers[key];
          }

          this.logger.log(`Module [${moduleName}] loaded!`);
        } catch (e) {
          this.logger.error(`Module [${moduleName}] failed with error ${e}`);
        }
      }
    }
  }

  private async deleteSlashCommands() {
    if (!this.client.user?.id) {
      return;
    }
    await this.modules.$rest
      .put(Routes.applicationCommands(this.client.user.id), { body: [] })
      .then(() => this.logger.log('Successfully deleted all application commands.'))
      .catch(this.logger.error);
  }

  private onInteractionCreate() {
    this.client.on(Events.InteractionCreate, async (interaction: Interaction): Promise<void> => {
      if (!interaction.isChatInputCommand()) return;

      await this.commandManager.executeCommand(this.modules.$i18n.bind(interaction));
    });
  }
}
