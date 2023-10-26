import i18next from 'i18next';
import type { FsBackendOptions } from 'i18next-fs-backend';
import Backend from 'i18next-fs-backend';
import type Redis from 'ioredis';
import { forEach } from 'lodash';
import { dirname, join } from 'path';
import { createModule } from 'utils/create-module';

import type { ComposerTranslation } from '../../types/i18next';

const USER_LANGUAGE_KEY = 'userLanguage';
const DEFAULT_LANGUAGE = 'en';

export default createModule(async ({ modules }) => {
  // const logger = new Logger('I18n');
  const redis = modules.$redis as Redis;

  const userLanguageMap = new Map<string, string>();

  // eslint-disable-next-line import/no-named-as-default-member
  await i18next.use(Backend).init<FsBackendOptions>({
    debug: Bun.env.DEBUG,
    lng: Bun.env.LOCALE || DEFAULT_LANGUAGE,
    fallbackLng: Bun.env.LOCALE,
    supportedLngs: ['en', 'vi'],
    initImmediate: false,
    load: 'all',
    backend: {
      loadPath: join(dirname(Bun.main), 'locales/{{lng}}.json'),
    },
  });

  await fetchUserLanguages();

  async function fetchUserLanguages() {
    const userLanguages = await redis.hgetall(USER_LANGUAGE_KEY);
    forEach(userLanguages, (language, userId) => {
      userLanguageMap.set(userId, language);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function t(this: any, ...args: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.t(...(args as any));
  }

  const getUserLanguage = (userId: string) => userLanguageMap.get(userId) || DEFAULT_LANGUAGE;

  const setUserLanguage = async (userId: string, language: string) => {
    userLanguageMap.set(userId, language);
    await redis.hset(USER_LANGUAGE_KEY, userId, language);
  };

  // const bind = async (interaction: Interaction) => {
  //   const language =
  // };

  return {
    name: 'I18n',
    provide: {
      i18n: {
        t: t.bind(i18next) as ComposerTranslation,
        getUserLanguage,
        setUserLanguage,
        // bind,
      },
    },
  };
});
