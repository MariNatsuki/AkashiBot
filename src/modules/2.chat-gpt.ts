import type { ChatGPTAPIOptions } from 'chatgpt';
import { ChatGPTAPI } from 'chatgpt';
import type Redis from 'ioredis';

import { Role, SYSTEM_MESSAGES } from '../constants/system-messages';
import { createModule } from '../utils/create-module';

const LAST_MESSAGE_MAP_KEY = 'userLastMessageIdMap';
const ROLE_SYSTEM_MESSAGE_KEY = 'roleSystemMessage';
const CHANNEL_ROLE_MAP_KEY = 'channelRoleMap';

export default createModule(async bot => {
  const redis = bot.modules.$redis as Redis;
  const apiRoleMap = new Map<Role | string, ChatGPTAPI>();
  await Promise.all(
    Object.entries(SYSTEM_MESSAGES).map(async ([role, message]) => {
      apiRoleMap.set(
        role,
        new ChatGPTAPI({
          apiBaseUrl: Bun.env.OPENAI_ENDPOINT,
          apiKey: Bun.env.OPENAI_API_KEY,
          completionParams: {
            model: Bun.env.OPENAI_CHATGPT_MODEL,
          },
          systemMessage:
            `${message}\n` +
            'Current time: ' +
            new Date() +
            '\n Please use the appropriate markdown syntax for code blocks in your language. ',
        } as ChatGPTAPIOptions),
      );
      return redis.hset(ROLE_SYSTEM_MESSAGE_KEY, role, message);
    }),
  );

  const setChannelRole = async (channelId: string, role: Role) =>
    redis.hset(CHANNEL_ROLE_MAP_KEY, channelId, role as string);

  const sendMessage = async (
    message: string,
    channelId?: string,
    onProgress?: (message: string) => void,
  ) => {
    const channelRole = channelId ? await redis.hget(CHANNEL_ROLE_MAP_KEY, channelId) : undefined;
    const channelApi = apiRoleMap.get(channelRole || Role.Akashi);
    if (!channelApi) {
      return '';
    }
    const response = await channelApi.sendMessage(message, {
      parentMessageId: channelId
        ? (await redis.hget(LAST_MESSAGE_MAP_KEY, channelId)) || undefined
        : undefined,
      onProgress: onProgress ? message => message.text && onProgress(message.text) : undefined,
    });
    if (channelId) {
      await redis.hset(LAST_MESSAGE_MAP_KEY, channelId, response.id);
    }
    return response.text;
  };

  return {
    name: 'ChatGPT',
    provide: {
      chatgpt: {
        setChannelRole,
        sendMessage,
      },
    },
  };
});
