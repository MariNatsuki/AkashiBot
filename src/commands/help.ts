import type { CommandInteraction, PermissionResolvable } from 'discord.js';
import { EmbedBuilder, PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import { isString } from 'lodash';

import { createCommand } from '../utils/create-command';
import { i18n } from '../utils/i18n';

export default createCommand({
  data: new SlashCommandBuilder().setName('help').setDescription(i18n.__('help.description')),
  async execute(interaction: CommandInteraction, bot) {
    const commands = bot.commands.filter((cmd) => {
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
      .setTitle(i18n.__mf('help.embedTitle', { botName: interaction.client.user?.username }))
      .setDescription(`**${i18n.__('help.embedDescription')}**\n\n`)
      .setColor('#F8AA2A')
      .setFooter({
        text: `For more information about a specific command, type /<command>`,
        iconURL: interaction.client.user?.avatarURL() || undefined
      });

    commands.forEach(({ data: { name, description, default_member_permissions } }) => {
      const permissions = new PermissionsBitField(default_member_permissions as PermissionResolvable);

      helpEmbed.addFields({
        name: `/${name}`,
        value: `${description}\n*Permissions Required:* ${permissions.toArray().join(', ') || 'None'}`,
        inline: false
      });
    });

    return interaction.reply({ embeds: [helpEmbed] });
  }
});
