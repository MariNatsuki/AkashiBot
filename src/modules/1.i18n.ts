import chalk from 'chalk';
import { type Interaction, Locale } from 'discord.js';
import type { i18n } from 'i18next';
import { createInstance } from 'i18next';
import type { FsBackendOptions } from 'i18next-fs-backend';
import Backend from 'i18next-fs-backend';
import type Redis from 'ioredis';
import type { LanguageCode } from 'iso-639-1';
import ISO6391 from 'iso-639-1';
import { forEach, toString } from 'lodash';
import { dirname, join } from 'path';
import { createModule } from 'utils/create-module';

import type { ComposerTranslation, Localized } from '../../types/i18next';
import { Logger } from '../utils/logger.ts';

const USER_LANGUAGE_KEY = 'userLanguage';
const DEFAULT_LANGUAGE: LanguageCode = 'en';
const SUPPORTED_LANGUAGES: LanguageCode[] = ['en', 'vi'];

export default createModule(async ({ modules }) => {
  const redis = modules.$redis as Redis;
  const logger = new Logger('I18n');

  const supportedI18nMap = new Map<LanguageCode, i18n>();
  const userLanguageMap = new Map<string, LanguageCode>();
  const supportedDiscordLocale = Object.values(Locale).reduce(
    (output, locale) => {
      const isoLocale = locale.split('-')[0];
      if ((SUPPORTED_LANGUAGES as string[]).includes(isoLocale)) {
        output.push({
          locale,
          iso: isoLocale,
        });
      }
      return output;
    },
    [] as { locale: Locale; iso: string }[],
  );

  const appLanguage = (Bun.env.LOCALE as LanguageCode) || DEFAULT_LANGUAGE;
  if (!SUPPORTED_LANGUAGES.includes(appLanguage)) {
    throw new Error(
      "Supported Languages does not include App's LOCALE, please verify your .env file!",
    );
  }

  await Promise.all(
    SUPPORTED_LANGUAGES.map(async language => {
      const languageI18n = createInstance().use(Backend);
      supportedI18nMap.set(language, languageI18n);
      await languageI18n.init<FsBackendOptions>({
        debug: Bun.env.DEBUG,
        lng: language,
        fallbackLng: language,
        supportedLngs: [language],
        initImmediate: false,
        load: 'all',
        backend: {
          loadPath: join(dirname(Bun.main), 'locales/{{lng}}.json'),
        },
      });
    }),
  );

  const appI18n = supportedI18nMap.get(appLanguage) as i18n;
  logger.log(
    appI18n.t('systemMessage.appLanguageSet', {
      language: chalk.bold(`${appLanguage} (${ISO6391.getName(appLanguage)})`),
    }),
  );

  logger.log("Fetching user's languages...");
  await fetchUserLanguages();
  logger.log("User's languages fetched!");

  async function fetchUserLanguages() {
    const userLanguages = await redis.hgetall(USER_LANGUAGE_KEY);
    forEach(userLanguages, (language, userId) => {
      userLanguageMap.set(userId, language as LanguageCode);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function t(this: any, ...args: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return toString(this.t(...(args as any)));
  }

  const getUserLanguage = (userId: string) => userLanguageMap.get(userId) || DEFAULT_LANGUAGE;

  const setUserLanguage = async (userId: string, language: LanguageCode) => {
    userLanguageMap.set(userId, language);
    await redis.hset(USER_LANGUAGE_KEY, userId, language);
  };

  const bind = <T extends Interaction>(interaction: T) => {
    const userLanguage = getUserLanguage(interaction.user.id);
    const userI18n = supportedI18nMap.get(userLanguage) || appI18n;
    Object.assign(interaction, {
      t: t.bind(userI18n) as ComposerTranslation,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return interaction as any as T & Localized;
  };

  const localizeDiscord = () => {};

  return {
    name: 'I18n',
    provide: {
      i18n: {
        t: t.bind(appI18n) as ComposerTranslation,
        supportedDiscordLocale,
        getUserLanguage,
        setUserLanguage,
        bind,
        localizeDiscord,
      },
    },
  };
});
