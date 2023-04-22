import type { ChatInputCommandInteraction } from 'discord.js';
import { PermissionsBitField, SlashCommandBuilder } from 'discord.js';

import { Role } from '../constants/system-messages';
import { createCommand } from '../utils/create-command';
import { i18n } from '../utils/i18n';

export default createCommand({
  userPermissions: [PermissionsBitField.Flags.ManageGuild],
  data: (bot) =>
    new SlashCommandBuilder()
      .setName('act')
      .setDescription(i18n.__mf('act.description', { botName: bot.name }))
      .addStringOption((option) =>
        option
          .setName('role')
          .setDescription(i18n.__mf('act.roleHint', { options: Object.keys(Role).join(', ') }))
          .setRequired(true)
      ),
  async execute(
    interaction: ChatInputCommandInteraction<'cached'>,
    {
      name,
      modules: {
        $chatgpt: { setChannelRole }
      }
    }
  ) {
    const role = interaction.options.getString('role', true);

    function isValidRole(role: string): role is Role {
      return Object.keys(Role).includes(role);
    }
    if (!isValidRole(role)) {
      return interaction.reply({
        content: i18n.__('act.invalidRole'),
        ephemeral: true
      });
    }

    await setChannelRole(interaction.channelId, role);

    return interaction.reply({
      content: i18n.__mf('act.success', { botName: name || '', role: role }),
      ephemeral: true
    });
  }
});
