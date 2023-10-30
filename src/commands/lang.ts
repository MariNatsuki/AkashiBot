import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  SlashCommandBuilder,
} from 'discord.js';
import type { LanguageCode } from 'iso-639-1';
import ISO6391 from 'iso-639-1';

import { createCommand } from '../utils/create-command';

export default createCommand({
  data: ({ name, modules: { $i18n } }) =>
    new SlashCommandBuilder()
      .setName('lang')
      .setDescription($i18n.t('commands.lang.description', { botName: name }))
      .setDescriptionLocalizations(
        $i18n.localizeDiscord('commands.lang.description', { botName: name }),
      ),
  async execute(
    interaction,
    {
      modules: {
        $i18n: { supportedBotLanguage, setUserLanguage },
      },
    },
  ) {
    const rows: ActionRowBuilder<ButtonBuilder>[] = [];
    let rowButtons: ButtonBuilder[] = [];

    supportedBotLanguage.forEach(language => {
      if (rowButtons.length === 5) {
        rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents([...rowButtons]));
        rowButtons = [];
      }

      rowButtons.push(
        new ButtonBuilder()
          .setLabel(ISO6391.getNativeName(language))
          .setStyle(ButtonStyle.Primary)
          .setCustomId(`set-language-${language}`),
      );
    });

    if (rowButtons.length > 0) {
      rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents([...rowButtons]));
    }

    const reply = await interaction.reply({
      content: interaction.t('commands.lang.selectLanguage', {
        botName: interaction.client.user?.username,
      }),
      components: [...rows],
      fetchReply: true,
      ephemeral: true,
    });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 20000,
      dispose: false,
    });

    collector.on('collect', async buttonInteraction => {
      if (!buttonInteraction.isButton()) return;

      const language = buttonInteraction.customId.replace(/^set-language-/, '');
      console.log(language);

      function isValidLanguage(language: string): language is LanguageCode {
        return (supportedBotLanguage as string[]).includes(language);
      }

      if (!isValidLanguage(language)) {
        await reply.edit({
          content: interaction.t('commands.lang.invalidLanguage'),
        });
        return;
      }

      await setUserLanguage(buttonInteraction.user.id, language);

      console.log(
        interaction.t('commands.lang.success', {
          botName: buttonInteraction.client.user?.username || '',
          language: ISO6391.getNativeName(language),
        }),
      );

      await reply.edit({
        content: interaction.t('commands.lang.success', {
          botName: buttonInteraction.client.user?.username || '',
          language: ISO6391.getNativeName(language),
        }),
        components: [],
      });

      collector.stop();
    });

    collector.on('end', async () => {
      // Only display a timeout message if no interactions were collected
      if (collector.collected.size === 0) {
        await reply.edit({ content: interaction.t('commands.lang.timeout'), components: [] });
      }
    });
  },
});
