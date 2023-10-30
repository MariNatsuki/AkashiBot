import chalk from 'chalk';
import type { Interaction, LocalizationMap } from 'discord.js';
import { Locale } from 'discord.js';
import type { i18n, TOptions } from 'i18next';
import i18next from 'i18next';
import type { FsBackendOptions } from 'i18next-fs-backend';
import Backend from 'i18next-fs-backend';
import type Redis from 'ioredis';
import type { LanguageCode } from 'iso-639-1';
import ISO6391 from 'iso-639-1';
import { forEach, isString, toString } from 'lodash';
import { dirname, join } from 'path';
import { createModule } from 'utils/create-module';

import type { ComposerTranslation, Localized, LocalizeDiscord } from '../../types/i18next';
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

  await i18next.use(Backend).init<FsBackendOptions>({
    debug: Bun.env.DEBUG,
    lng: appLanguage,
    fallbackLng: appLanguage,
    supportedLngs: SUPPORTED_LANGUAGES,
    load: 'all',
    initImmediate: false,
    backend: {
      loadPath: join(dirname(Bun.main), 'locales/{{lng}}.json'),
    },
  });

  logger.log(
    i18next.t('modules.i18n.appLanguageSet', {
      language: chalk.bold(`${appLanguage} (${ISO6391.getName(appLanguage)})`),
    }),
  );

  await Promise.all(
    SUPPORTED_LANGUAGES.map(async language => {
      const languageI18n = i18next
        .cloneInstance({
          supportedLngs: [language],
        })
        .use(Backend);
      supportedI18nMap.set(language, languageI18n);
    }),
  );

  logger.log(i18next.t('modules.i18n.fetchingUsersLanguage'));
  await fetchUserLanguages();
  logger.log(i18next.t('modules.i18n.usersLanguageFetched'));

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

  const getUserLanguage = (userId: string) => userLanguageMap.get(userId) || appLanguage;

  const setUserLanguage = async (userId: string, language: LanguageCode) => {
    userLanguageMap.set(userId, language);
    await redis.hset(USER_LANGUAGE_KEY, userId, language);
  };

  const bind = <T extends Interaction>(interaction: T) => {
    const userLanguage = getUserLanguage(interaction.user.id);
    const userI18n = supportedI18nMap.get(userLanguage) || i18next;
    Object.assign(interaction, {
      t: t.bind(userI18n) as ComposerTranslation,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return interaction as any as T & Localized;
  };

  const localizeDiscord: LocalizeDiscord = (...args): LocalizationMap => {
    const options: TOptions =
      (isString(args[1]) ? { ...args[2], defaultValue: args[1] } : args[1]) || {};
    return supportedDiscordLocale.reduce((output, { locale, iso }) => {
      output[locale] = toString(
        i18next.t(args[0], {
          ...options,
          lng: iso,
        }),
      );
      return output;
    }, {} as LocalizationMap);
  };

  return {
    name: 'I18n',
    provide: {
      i18n: {
        t: t.bind(i18next) as ComposerTranslation,
        supportedBotLanguage: SUPPORTED_LANGUAGES,
        supportedDiscordLocale,
        getUserLanguage,
        setUserLanguage,
        bind,
        localizeDiscord,
      },
    },
  };
});
