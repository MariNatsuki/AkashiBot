import type { LocalizationMap } from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';

import { createCommand } from '../utils/create-command';
import { Logger } from '../utils/logger';

export default createCommand({
  data: ({ name, modules: { $i18n } }) =>
    new SlashCommandBuilder()
      .setName('chat')
      .setDescriptionLocalizations(
        $i18n.supportedDiscordLocale.reduce((output, { locale, iso }) => {
          output[locale] = $i18n.t('chat.description', { botName: name, lng: iso });
          return output;
        }, {} as LocalizationMap),
      )
      .addStringOption(option =>
        option.setName('prompt').setDescription($i18n.t('chat.promptHint')).setRequired(true),
      )
      .addBooleanOption(option =>
        option.setName('is_private').setDescription($i18n.t('chat.isPrivateHint')),
      ),
  async execute(
    interaction,
    {
      modules: {
        $chatgpt: { sendMessage },
      },
    },
  ) {
    const logger = new Logger('ChatCommand');
    const prompt = interaction.options.getString('prompt', true);
    const isPrivate = interaction.options.getBoolean('is_private', false);

    await interaction.deferReply({
      ephemeral: isPrivate || false,
    });

    let lastEditInteraction: Promise<unknown> | undefined;

    const responseMessage = await sendMessage(
      prompt,
      isPrivate ? interaction.user.id : interaction.channelId,
      (message: string) => {
        !lastEditInteraction &&
          (lastEditInteraction = interaction
            .editReply(message)
            .then(() => (lastEditInteraction = undefined))).catch(logger.error);
      },
    );

    return interaction.editReply({
      content: responseMessage,
    });
  },
});
