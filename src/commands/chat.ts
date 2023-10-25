import type { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';

import { createCommand } from '../utils/create-command';
import { Logger } from '../utils/logger';

export default createCommand({
  data: bot =>
    new SlashCommandBuilder()
      .setName('chat')
      .setDescription(bot.modules.$i18n.__mf('chat.description', { botName: bot.name }))
      .addStringOption(option =>
        option.setName('prompt').setDescription(i18n.__('chat.promptHint')).setRequired(true),
      )
      .addBooleanOption(option =>
        option.setName('is_private').setDescription(i18n.__('chat.isPrivateHint')),
      ),
  async execute(
    interaction: ChatInputCommandInteraction<'cached'>,
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
