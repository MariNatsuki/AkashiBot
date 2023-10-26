import type { ChatInputCommandInteraction, Snowflake } from 'discord.js';
import { Collection, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { isFunction } from 'lodash';
import { join } from 'path';

import { CommandNotFoundError } from '../errors/command-not-found.error.ts';
import { CommandOnCooldownError } from '../errors/command-on-cooldown.error.ts';
import { MissingPermissionsError } from '../errors/missing-permissions.error.ts';
import type { Command, ParsedCommand } from '../interfaces/command.ts';
import type { PermissionResult } from '../utils/check-permissions.ts';
import { checkBotPermission, checkUserPermission } from '../utils/check-permissions.ts';
import { Logger } from '../utils/logger.ts';
import type { Bot } from './bot.ts';

export class CommandManager {
  private readonly logger = new Logger('CommandManager');

  public commands = new Collection<string, ParsedCommand>();

  public cooldowns = new Collection<string, Collection<Snowflake, number>>();

  constructor(
    private readonly commandsPath: string,
    private readonly bot: Bot,
  ) {}

  async registerCommands() {
    const commands = await this.collectCommands();
    const registeredCommands = (await this.bot.modules.$rest.put(
      Routes.applicationCommands(this.bot.client.user.id),
      {
        body: Object.values(commands).map(command => command.data),
      },
    )) as { name: string; description: string }[];
    registeredCommands.forEach(({ name }) => {
      if (commands[name]) {
        this.commands.set(name, commands[name]);
        delete commands[name];
        this.logger.log(`Command [${name}] registered!`);
      }
    });

    const failedCommands = Object.keys(commands);
    if (failedCommands.length) {
      this.logger.error(`Failed registering commands: `);
    }
  }

  private async collectCommands() {
    const commandFiles = readdirSync(this.commandsPath).filter(file => !file.endsWith('.map'));
    const parsedCommand: Record<string, ParsedCommand> = {};

    await Promise.all(
      commandFiles.map(async commandFile => {
        try {
          const command: Command = (await import(join(this.commandsPath, `${commandFile}`)))
            .default;
          const commandData = isFunction(command.data) ? command.data(this.bot) : command.data;
          command.userPermissions?.forEach(permission =>
            commandData.setDefaultMemberPermissions(permission as bigint),
          );

          parsedCommand[commandData.name] = {
            ...command,
            name: commandData.name,
            data: commandData,
          };
        } catch (e) {
          this.logger.error(e);
        }
      }),
    );

    return parsedCommand;
  }

  async executeCommand(interaction: ChatInputCommandInteraction) {
    const { commandName } = interaction;
    try {
      const command = this.getCommand(commandName);

      this.handleCooldown(interaction.user.id, command);

      await this.handlePermission(command, interaction);

      this.logger.log(
        `User ${interaction.user.username}(${interaction.user.id}) used command [${commandName}]`,
      );
      await command.execute(interaction, this.bot);
    } catch (error: unknown) {
      await this.handleCommandError(error, interaction);
    }
  }

  private async handleCommandError(error: unknown, interaction: ChatInputCommandInteraction) {
    this.logger.error(error);

    const method = interaction.deferred ? 'editReply' : 'reply';
    try {
      if (error instanceof MissingPermissionsError) {
        return await interaction[method]({ content: error.toString(), ephemeral: true });
      } else if (error instanceof CommandOnCooldownError) {
        return interaction[method]({
          content: this.bot.modules.$i18n.t('common.cooldownMessage', {
            time: error.timeLeft.toFixed(1),
            name: error.command,
          }),
          ephemeral: true,
        });
      } else {
        return await interaction[method]({
          content: this.bot.modules.$i18n.t('common.errorCommand'),
          ephemeral: true,
        });
      }
    } catch (errorOrMessage) {
      return this.logger.error(errorOrMessage);
    }
  }

  getCommand(commandName: string) {
    const command = this.commands.get(commandName);

    if (!command) {
      throw new CommandNotFoundError(commandName);
    }

    return command;
  }

  private handleCooldown(userId: Snowflake, { name, cooldown }: ParsedCommand) {
    if (!this.cooldowns.has(name)) {
      this.cooldowns.set(name, new Collection());
    }

    const now = Date.now();
    const timestamps = this.cooldowns.get(name);
    const cooldownAmount = (cooldown || 1) * 1000;

    const timestamp = timestamps?.get(userId);
    if (timestamp) {
      const expirationTime = timestamp + cooldownAmount;

      if (now < expirationTime) {
        throw new CommandOnCooldownError(name, (expirationTime - now) / 1000);
      }
    }

    timestamps?.set(userId, now);
    setTimeout(() => timestamps?.delete(userId), cooldownAmount);
  }

  private async handlePermission(command: ParsedCommand, interaction: ChatInputCommandInteraction) {
    let permissionsCheck: PermissionResult;
    if (!(permissionsCheck = await checkBotPermission(command, interaction)).result) {
      throw new MissingPermissionsError(
        permissionsCheck.missing,
        `${this.bot.name} missing permissions: `,
      );
    } else if (!(permissionsCheck = await checkUserPermission(command, interaction)).result) {
      throw new MissingPermissionsError(permissionsCheck.missing);
    }
  }
}
