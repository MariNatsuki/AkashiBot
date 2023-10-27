import type { PermissionResolvable } from 'discord.js';
import { EmbedBuilder, PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import { isString } from 'lodash';

import { createCommand } from '../utils/create-command';

export default createCommand({
  data: ({ modules: { $i18n } }) =>
    new SlashCommandBuilder().setName('help').setDescription($i18n.t('help.description')),
  async execute(interaction, bot) {
    const { commandManager } = bot;
    const commands = commandManager.commands.filter(cmd => {
      // Check if the user has permission to run this command
      const permissions = interaction.member?.permissions;
      const commandPermissions = cmd.data.default_member_permissions;
      return (
        !commandPermissions ||
        (permissions &&
          (isString(permissions)
            ? permissions === commandPermissions
            : permissions.has(commandPermissions as PermissionResolvable)))
      );
    });

    const helpEmbed = new EmbedBuilder()
      .setTitle(interaction.t('help.embedTitle', { botName: interaction.client.user?.username }))
      .setDescription(`**${interaction.t('help.embedDescription')}**\n\n`)
      .setColor('#F8AA2A')
      .setFooter({
        text: `For more information about a specific command, type /<command>`,
        iconURL: interaction.client.user?.avatarURL() || undefined,
      });

    commands.forEach(({ data: { name, description, default_member_permissions } }) => {
      const permissions = new PermissionsBitField(
        default_member_permissions as PermissionResolvable,
      );

      helpEmbed.addFields({
        name: `/${name}`,
        value: `${description}\n*Permissions Required:* ${
          permissions.toArray().join(', ') || 'None'
        }`,
        inline: false,
      });
    });

    return interaction.reply({ embeds: [helpEmbed] });
  },
});
