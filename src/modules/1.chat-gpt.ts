import type { ChatGPTAPI, ChatGPTAPIOptions } from 'chatgpt';

import { Role, SYSTEM_MESSAGES } from '../constants/system-messages';
import { createModule } from '../utils/create-module';

const LAST_MESSAGE_MAP_KEY = 'userLastMessageIdMap';
const ROLE_SYSTEM_MESSAGE_KEY = 'roleSystemMessage';
const CHANNEL_ROLE_MAP_KEY = 'channelRoleMap';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export default createModule(async ({ modules: { $redis } }) => {
  const apiRoleMap = new Map<Role | string, ChatGPTAPI>();
  await Promise.all(
    Object.entries(SYSTEM_MESSAGES).map(async ([role, message]) => {
      apiRoleMap.set(
        role,
        new (await eval("import('chatgpt')")).ChatGPTAPI({
          apiBaseUrl: process.env.OPENAI_ENDPOINT,
          apiKey: process.env.OPENAI_API_KEY,
          fetch: (await eval("import('node-fetch')")).default,
          systemMessage:
            `${message}\n` +
            'Current time: ' +
            new Date() +
            '\n Please use the appropriate markdown syntax for code blocks in your language. '
        } as ChatGPTAPIOptions)
      );
      return $redis.hset(ROLE_SYSTEM_MESSAGE_KEY, role, message);
    })
  );

  const setChannelRole = async (channelId: string, role: Role) =>
    $redis.hset(CHANNEL_ROLE_MAP_KEY, channelId, role as string);

  const sendMessage = async (message: string, channelId?: string, onProgress?: (message: string) => void) => {
    const channelRole = channelId ? await $redis.hget(CHANNEL_ROLE_MAP_KEY, channelId) : undefined;
    const channelApi = apiRoleMap.get(channelRole || Role.Akashi);
    if (!channelApi) {
      return '';
    }
    const response = await channelApi.sendMessage(message, {
      parentMessageId: channelId ? (await $redis.hget(LAST_MESSAGE_MAP_KEY, channelId)) || undefined : undefined,
      onProgress: onProgress ? (message) => message.text && onProgress(message.text) : undefined
    });
    if (channelId) {
      await $redis.hset(LAST_MESSAGE_MAP_KEY, channelId, response.id);
    }
    return response.text;
  };

  return {
    name: 'ChatGPT',
    provide: {
      chatgpt: {
        setChannelRole,
        sendMessage
      }
    }
  };
});
