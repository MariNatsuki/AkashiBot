import type { Client, Interaction, Snowflake } from 'discord.js';
import { Collection, Events, REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { isFunction } from 'lodash';
import { join } from 'path';

import type { IBot, Modules } from '../../types/bot';
import { MissingPermissionsException } from '../errors/missing-permissions-exception';
import type { Command, CommandBuilder } from '../interfaces/command';
import type { PermissionResult } from '../utils/check-permissions';
import { checkBotPermission, checkUserPermission } from '../utils/check-permissions';
import { i18n } from '../utils/i18n';
import { Logger } from '../utils/logger';

export class Bot implements IBot {
  private readonly logger = new Logger('Bot');
  private readonly rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

  public name: string | undefined;
  public modules = {} as Modules;
  public commands = new Collection<string, Omit<Command, 'data'> & { data: CommandBuilder }>();
  public cooldowns = new Collection<string, Collection<Snowflake, number>>();

  public constructor(public readonly client: Client) {
    this.client.login(process.env.DISCORD_TOKEN).catch((error) => this.logger.error(error));

    this.client.on('ready', async () => {
      this.logger.log(`${this.client.user?.username} ready!`);
      this.name = this.client.user?.username;

      await this.loadModules();

      // await this.deleteSlashCommands();
      await this.registerSlashCommands();
    });

    this.client.on('warn', (info) => this.logger.log(info));
    this.client.on('error', this.logger.error);

    this.onInteractionCreate();
  }

  private async loadModules() {
    const moduleFiles = readdirSync(join(__dirname, '..', 'modules')).filter((file) => !file.endsWith('.map'));

    for (const file of moduleFiles) {
      const module = (await import(join(__dirname, '..', 'modules', `${file}`))).default;
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
    await this.rest
      .put(Routes.applicationCommands(this.client.user.id), { body: [] })
      .then(() => this.logger.log('Successfully deleted all application commands.'))
      .catch(this.logger.error);
  }

  private async registerSlashCommands() {
    if (!this.client.user?.id) {
      return;
    }
    const commandFiles = readdirSync(join(__dirname, '..', 'commands')).filter((file) => !file.endsWith('.map'));
    const commandDatas = [];

    for (const file of commandFiles) {
      const command: Command = (await import(join(__dirname, '..', 'commands', `${file}`))).default;
      const commandData = isFunction(command.data) ? command.data(this) : command.data;

      commandDatas.push(commandData);
      this.commands.set(commandData.name, {
        ...command,
        data: commandData
      });
    }

    const registeredCommands = (await this.rest.put(Routes.applicationCommands(this.client.user.id), {
      body: commandDatas
    })) as { name: string; description: string }[];
    registeredCommands.forEach(({ name }) => this.logger.log(`Command [${name}] registered!`));
  }

  private onInteractionCreate() {
    this.client.on(Events.InteractionCreate, async (interaction: Interaction): Promise<any> => {
      if (!interaction.isChatInputCommand()) return;

      const command = this.commands.get(interaction.commandName);

      if (!command) return;

      if (!this.cooldowns.has(interaction.commandName)) {
        this.cooldowns.set(interaction.commandName, new Collection());
      }

      const now = Date.now();
      const timestamps = this.cooldowns.get(interaction.commandName);
      const cooldownAmount = (command.cooldown || 1) * 1000;

      const timestamp = timestamps?.get(interaction.user.id);
      if (timestamp) {
        const expirationTime = timestamp + cooldownAmount;

        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          return interaction.reply({
            content: i18n.__mf('common.cooldownMessage', {
              time: timeLeft.toFixed(1),
              name: interaction.commandName
            }),
            ephemeral: true
          });
        }
      }

      timestamps?.set(interaction.user.id, now);
      setTimeout(() => timestamps?.delete(interaction.user.id), cooldownAmount);

      try {
        let permissionsCheck: PermissionResult;
        if (!(permissionsCheck = await checkBotPermission(command, interaction)).result) {
          throw new MissingPermissionsException(permissionsCheck.missing, `${this.name} missing permissions: `);
        } else if (!(permissionsCheck = await checkUserPermission(command, interaction)).result) {
          throw new MissingPermissionsException(permissionsCheck.missing);
        }

        command.execute(interaction, this);
      } catch (error: unknown) {
        this.logger.error(error);

        if (error instanceof MissingPermissionsException) {
          interaction.reply({ content: error.toString(), ephemeral: true }).catch(console.error);
        } else {
          interaction.reply({ content: i18n.__('common.errorCommand'), ephemeral: true }).catch(console.error);
        }
      }
    });
  }
}
