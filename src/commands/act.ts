import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  PermissionsBitField,
  SlashCommandBuilder
} from 'discord.js';

import { Role } from '../constants/system-messages';
import { createCommand } from '../utils/create-command';
import { i18n } from '../utils/i18n';

export default createCommand({
  data: (bot) =>
    new SlashCommandBuilder()
      .setName('act')
      .setDescription(i18n.__mf('act.description', { botName: bot.name }))
      .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild),
  async execute(
    interaction,
    {
      modules: {
        $chatgpt: { setChannelRole }
      }
    }
  ) {
    const rows: ActionRowBuilder<ButtonBuilder>[] = [];
    let rowButtons: ButtonBuilder[] = [];

    Object.values(Role).forEach((role) => {
      if (rowButtons.length === 5) {
        rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents([...rowButtons]));
        rowButtons = [];
      }

      rowButtons.push(new ButtonBuilder().setLabel(role).setStyle(ButtonStyle.Primary).setCustomId(`set-role-${role}`));
    });

    if (rowButtons.length > 0) {
      rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents([...rowButtons]));
    }

    const reply = await interaction.reply({
      content: i18n.__mf('act.chooseRole', { botName: interaction.client.user?.username }),
      components: [...rows],
      fetchReply: true
    });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 20000,
      dispose: false
    });

    collector.on('collect', async (interaction) => {
      if (!interaction.isButton()) return;

      const role = interaction.customId.replace(/^set-role-/, '');

      function isValidRole(role: string): role is Role {
        return Object.keys(Role).includes(role);
      }

      if (!isValidRole(role)) {
        await interaction.reply({
          content: i18n.__('act.invalidRole'),
          ephemeral: true
        });
        return;
      }

      await setChannelRole(interaction.channelId, role);

      // Edit the original message to update it with the selected role and remove the action row buttons
      await reply.edit({
        content: i18n.__mf('act.success', { botName: interaction.client.user?.username || '', role }),
        components: []
      });

      collector.stop();
    });

    collector.on('end', async () => {
      // Only display a timeout message if no interactions were collected
      if (collector.collected.size === 0) {
        await reply.edit({ content: i18n.__mf('act.timeout'), components: [] });
      }
    });
  }
});
