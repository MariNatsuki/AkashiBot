import type { CommandInteraction } from 'discord.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

import { createCommand } from '../utils/create-command';
import { i18n } from '../utils/i18n';

export default createCommand({
  data: new SlashCommandBuilder().setName('help').setDescription(i18n.__('help.description')),
  async execute(interaction: CommandInteraction, bot) {
    const commands = bot.commands;

    const helpEmbed = new EmbedBuilder()
      .setTitle(i18n.__mf('help.embedTitle', { botName: interaction.client.user?.username }))
      .setDescription(i18n.__('help.embedDescription'))
      .setColor('#F8AA2A');

    commands.forEach((cmd) => {
      helpEmbed.addFields({
        name: `**${cmd.data.name}**`,
        value: `${cmd.data.description}`,
        inline: true
      });
    });

    helpEmbed.setTimestamp();

    return interaction.reply({ embeds: [helpEmbed] }).catch(console.error);
  }
});
